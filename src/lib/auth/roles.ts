export type UserRole = "ADMIN" | "STAFF" | "STUDENT" | "ACCOUNTS" | "PRINCIPAL";

export interface AuthContext {
  id: string;
  email: string;
  role: UserRole;
  usn?: string; // Set for student candidates
  studentId?: number; // Database ID of the candidate
}

/**
 * IDOR (Insecure Direct Object Reference) Protection:
 * Verifies that the authenticated user has legitimate ownership or administrative rights
 * over the requested resource.
 */
export function assertResourceAccess(
  auth: AuthContext | null,
  targetStudentId?: number,
  targetUsn?: string
): { allowed: boolean; reason?: string } {
  // Authentication is mandatory for every non-public resource.
  if (!auth) {
    return { allowed: false, reason: "Authentication is required." };
  }

  // Admins, Staff, Principal, and Accounts have institutional oversight over student records
  if (auth.role === "ADMIN" || auth.role === "STAFF" || auth.role === "PRINCIPAL" || auth.role === "ACCOUNTS") {
    return { allowed: true };
  }

  // If candidate is a student, strictly prevent IDOR
  if (auth.role === "STUDENT") {
    if (targetStudentId && (!auth.studentId || targetStudentId !== auth.studentId)) {
      return {
        allowed: false,
        reason: "Access denied: Candidates may only access their own official examination documents.",
      };
    }

    if (targetUsn && (!auth.usn || targetUsn.toUpperCase() !== auth.usn.toUpperCase())) {
      return {
        allowed: false,
        reason: "Access denied: Unauthorized attempt to access another candidate's examination record.",
      };
    }
  }

  return { allowed: true };
}

/**
 * Role-Based Access Control (RBAC) Guard:
 * Ensures the authenticated user possesses required administrative roles.
 */
export function assertRole(
  auth: AuthContext | null,
  allowedRoles: UserRole[]
): { allowed: boolean; reason?: string } {
  if (!auth) {
    return { allowed: false, reason: "Authentication is required." };
  }

  if (!allowedRoles.includes(auth.role)) {
    return {
      allowed: false,
      reason: `Access forbidden: Requires one of [${allowedRoles.join(", ")}] permissions.`,
    };
  }

  return { allowed: true };
}
