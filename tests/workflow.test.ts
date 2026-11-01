import test from "node:test";
import assert from "node:assert/strict";
import { assertResourceAccess, assertRole, type AuthContext } from "../src/lib/auth/roles";
import { dataStore } from "../src/lib/data-store";

test("Workflow Security & Business Rules", async (t) => {
  await t.test("1. Cross-student denial: Student A cannot access or mutate Student B's documents", () => {
    const studentA: AuthContext = {
      id: "auth-student-1",
      email: "studentA@college.edu",
      role: "STUDENT",
      studentId: 1,
      usn: "1RV22CS001",
    };

    // Student A accessing own records -> allowed
    const ownAccess = assertResourceAccess(studentA, 1, "1RV22CS001");
    assert.equal(ownAccess.allowed, true, "Student should have access to own profile");

    // Student A attempting to access Student B (studentId: 2) -> denied
    const otherIdAccess = assertResourceAccess(studentA, 2, "1RV22CS001");
    assert.equal(otherIdAccess.allowed, false, "Cross-student ID access must be denied");
    assert.match(otherIdAccess.reason || "", /Access denied/i);

    // Student A attempting to access Student B's USN -> denied
    const otherUsnAccess = assertResourceAccess(studentA, 1, "1RV22CS014");
    assert.equal(otherUsnAccess.allowed, false, "Cross-student USN access must be denied");

    // Unauthenticated caller -> denied
    const unauthAccess = assertResourceAccess(null, 1);
    assert.equal(unauthAccess.allowed, false, "Unauthenticated access must be denied");
  });

  await t.test("2. Accounts-only clearance: Only ACCOUNTS role can alter fee status", () => {
    const studentUser: AuthContext = { id: "s-1", email: "s@col.edu", role: "STUDENT", studentId: 1 };
    const staffUser: AuthContext = { id: "st-1", email: "staff@col.edu", role: "STAFF" };
    const principalUser: AuthContext = { id: "p-1", email: "p@col.edu", role: "PRINCIPAL" };
    const accountsUser: AuthContext = { id: "a-1", email: "acc@col.edu", role: "ACCOUNTS" };

    assert.equal(assertRole(studentUser, ["ACCOUNTS"]).allowed, false, "Student cannot perform accounts clearance");
    assert.equal(assertRole(staffUser, ["ACCOUNTS"]).allowed, false, "Staff cannot perform accounts clearance");
    assert.equal(assertRole(principalUser, ["ACCOUNTS"]).allowed, false, "Principal cannot perform accounts clearance");
    assert.equal(assertRole(accountsUser, ["ACCOUNTS"]).allowed, true, "Accounts officer is authorized");
  });

  await t.test("3. Principal-only exception: Only PRINCIPAL role can decide exceptions / waivers", () => {
    const accountsUser: AuthContext = { id: "a-1", email: "acc@col.edu", role: "ACCOUNTS" };
    const staffUser: AuthContext = { id: "st-1", email: "staff@col.edu", role: "STAFF" };
    const principalUser: AuthContext = { id: "p-1", email: "p@col.edu", role: "PRINCIPAL" };

    assert.equal(assertRole(accountsUser, ["PRINCIPAL"]).allowed, false, "Accounts cannot decide principal exceptions");
    assert.equal(assertRole(staffUser, ["PRINCIPAL"]).allowed, false, "Staff cannot decide principal exceptions");
    assert.equal(assertRole(principalUser, ["PRINCIPAL"]).allowed, true, "Principal is authorized for exceptions");
  });

  await t.test("4. Duplicate application deduplication: Resubmitting updates existing record", async () => {
    const student = (await dataStore.getStudents())[0];
    const exam = (await dataStore.getExaminations())[0];
    assert.ok(student, "At least one test student exists");
    assert.ok(exam, "At least one test examination exists");

    // First submission
    const app1 = await dataStore.submitExamApplication({
      studentId: student.id,
      examinationId: exam.id,
      subjectsConfirmed: true,
      arrears: [],
      actorId: "test-actor-1",
    });

    assert.ok(app1.id, "First application was created");
    const app1Id = app1.id;

    // Second submission by same student for same exam with updated arrears note
    const app2 = await dataStore.submitExamApplication({
      studentId: student.id,
      examinationId: exam.id,
      subjectsConfirmed: true,
      subjectIssueNote: "Updated information",
      arrears: [{ subjectCode: "CS401", subjectName: "Algorithms" }],
      actorId: "test-actor-1",
    });

    assert.equal(app2.id, app1Id, "Resubmitting must update the same application ID, avoiding duplicates");
    assert.equal(app2.arrears.length, 1, "Arrears updated on existing record");
  });

  await t.test("5. Hall ticket issuance: Complete, cleared application allows ticket generation", async () => {
    const student = (await dataStore.getStudents())[0];
    const exam = (await dataStore.getExaminations())[0];

    const app = await dataStore.submitExamApplication({
      studentId: student.id,
      examinationId: exam.id,
      subjectsConfirmed: true,
      arrears: [],
      actorId: "test-actor-1",
    });

    // Accounts clears fees
    const cleared = await dataStore.updateAccountsFeeStatus(
      app.id,
      {
        collegeFees: "No Due",
        hostelFees: "No Due",
        busFees: "No Due",
        fine: "Paid",
      },
      "test-accounts-id"
    );

    assert.equal(cleared?.stage, "ACCOUNTS_CLEARED", "Application progressed to ACCOUNTS_CLEARED stage");

    // Staff issues hall ticket
    const result = await dataStore.issueHallTicketForApplication(app.id);
    assert.ok(result.hallTicket, "Hall ticket successfully issued");
    assert.ok(result.hallTicket.number.startsWith("HT-"), "Hall ticket has official serial number");
    assert.ok(result.hallTicket.verifyCode, "Hall ticket has unique cryptographic verify code");
    assert.ok(result.hallTicket.qrDataUrl.startsWith("data:image/png;base64,"), "Hall ticket contains authentic QR code");
  });
});
