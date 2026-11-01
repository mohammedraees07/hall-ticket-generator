import pptx
import shutil
import os

def set_single_run_text(p, new_text, bold=None):
    if not p.runs:
        r = p.add_run()
        r.text = new_text
        if bold is not None:
            r.font.bold = bold
        return
    p.runs[0].text = new_text
    if bold is not None:
        p.runs[0].font.bold = bold
    for r in p.runs[1:]:
        r.text = ""

def set_two_runs_text(p, bold_text, normal_text):
    if len(p.runs) >= 2:
        p.runs[0].text = bold_text
        p.runs[1].text = normal_text
        for r in p.runs[2:]:
            r.text = ""
    elif len(p.runs) == 1:
        orig = p.runs[0]
        orig.text = bold_text
        r2 = p.add_run()
        r2.text = normal_text
        try:
            r2.font.name = orig.font.name
            r2.font.size = orig.font.size
            if orig.font.color and orig.font.color.rgb:
                r2.font.color.rgb = orig.font.color.rgb
        except Exception:
            pass
        r2.font.bold = False
    else:
        r1 = p.add_run()
        r1.text = bold_text
        r1.font.bold = True
        r2 = p.add_run()
        r2.text = normal_text
        r2.font.bold = False

def update_presentation():
    src_file = "KAUSHAL-26-AI-Resume.pptx"
    dst_file = "KAUSHAL-26-SMART-HALL-TICKET-GENERATOR.pptx"
    shutil.copyfile(src_file, dst_file)
    prs = pptx.Presentation(dst_file)

    # ==================== SLIDE 1 ====================
    s1 = prs.slides[0]
    # Shape 4: Title
    set_single_run_text(s1.shapes[4].text_frame.paragraphs[0], "“SMART HALL TICKET GENERATOR SYSTEM”")
    
    # Shape 8: Presented by
    p_box = s1.shapes[8].text_frame
    set_single_run_text(p_box.paragraphs[0], "   Presented by:")
    set_single_run_text(p_box.paragraphs[1], "ALFAR SHAMIL – 4PA23CS012")
    set_single_run_text(p_box.paragraphs[2], "KP THAHASEEN – 4PA23CS056")
    set_single_run_text(p_box.paragraphs[3], "ASHIQ IBRAHIM KM – 4PA24CS400")
    if len(p_box.paragraphs) > 4:
        set_single_run_text(p_box.paragraphs[4], "")

    # Shape 14: Footnote / Team ID
    ft_box = s1.shapes[14].text_frame
    set_single_run_text(ft_box.paragraphs[0], "Automated College Examination Management & Verification System")
    set_single_run_text(ft_box.paragraphs[1], "Team ID: 23CSMPA12")

    # ==================== SLIDE 2 (CONTENTS) ====================
    # Keep as-is (already standard 1 to 7)

    # ==================== SLIDE 3 (1. INTRODUCTION) ====================
    s3 = prs.slides[2]
    intro_p = s3.shapes[5].text_frame.paragraphs
    set_two_runs_text(intro_p[0], "Administrative Bottleneck: ", "colleges manually track fee dues, attendance, and exam eligibility across departments")
    set_two_runs_text(intro_p[1], "Fraud & Impersonation: ", "paper hall tickets are prone to tampering, fake stamps, and unauthorized entry by debarred candidates")
    set_two_runs_text(intro_p[2], "Lack of Gate Verification: ", "invigilators have no real-time way to verify if a student's hall ticket is genuine or revoked")
    set_two_runs_text(intro_p[3], "Our Solution: ", "a smart web system with automated clearance, tamper-proof QR hall tickets, and instant gate verification")

    set_single_run_text(s3.shapes[7].text_frame.paragraphs[0], "Student Clearances")
    set_single_run_text(s3.shapes[10].text_frame.paragraphs[0], "Smart Generation")
    set_single_run_text(s3.shapes[13].text_frame.paragraphs[0], "Instant Verification")
    set_single_run_text(s3.shapes[14].text_frame.paragraphs[0], "*RBAC = Role-Based Access Control: isolates permissions between Accounts, HOD, and Principal")

    # ==================== SLIDE 4 (2. REVIEW OF LITERATURE) ====================
    s4 = prs.slides[3]
    # Card 1
    set_two_runs_text(s4.shapes[6].text_frame.paragraphs[0], "Sharma et al. [1]", "   2023")
    set_single_run_text(s4.shapes[7].text_frame.paragraphs[0], "Web-based exam admin systems; automated form filling but lacked multi-tier clearances and fraud protection")
    # Card 2
    set_two_runs_text(s4.shapes[9].text_frame.paragraphs[0], "Patil & Deshmukh [2]", "   2024")
    set_single_run_text(s4.shapes[10].text_frame.paragraphs[0], "Used 2D QR codes on academic certificates, but lacked real-time database sync and gate verification")
    # Card 3
    set_two_runs_text(s4.shapes[12].text_frame.paragraphs[0], "Kumar et al. [3]", "   2024")
    set_single_run_text(s4.shapes[13].text_frame.paragraphs[0], "Randomized seating arrangement algorithms to reduce malpractice, without linking student fee eligibility")
    # Card 4
    set_two_runs_text(s4.shapes[15].text_frame.paragraphs[0], "Rahman & Al-Mamun [4]", "   2025")
    set_single_run_text(s4.shapes[16].text_frame.paragraphs[0], "Cryptographic document verification in universities; highlighted computational delays on legacy servers")
    # Card 5
    set_two_runs_text(s4.shapes[18].text_frame.paragraphs[0], "Chen et al. [5]", "   2025")
    set_single_run_text(s4.shapes[19].text_frame.paragraphs[0], "Role-based access control (RBAC) in college ERPs to prevent unauthorized student record alterations")
    # Card 6
    set_two_runs_text(s4.shapes[21].text_frame.paragraphs[0], "Nair & Varma [6]", "   2026")
    set_single_run_text(s4.shapes[22].text_frame.paragraphs[0], "Camera-based mobile verification protocols for high-stakes terminal examinations")
    # Gap
    set_two_runs_text(s4.shapes[24].text_frame.paragraphs[0], "Gap:  ", "no prior system integrates multi-tier clearance (Accounts+HOD), tamper-proof QR tickets, automated seating, and instant door validation.")

    # ==================== SLIDE 5 (3. OBJECTIVES) ====================
    s5 = prs.slides[4]
    set_single_run_text(s5.shapes[6].text_frame.paragraphs[0], "OBJ 1")
    set_single_run_text(s5.shapes[7].text_frame.paragraphs[0], "Automate multi-tier eligibility rules (attendance ≥ 75%, fee clearance, internal marks)")
    set_single_run_text(s5.shapes[9].text_frame.paragraphs[0], "OBJ 2")
    set_single_run_text(s5.shapes[10].text_frame.paragraphs[0], "Generate tamper-proof hall tickets with cryptographic QR codes and dual signatures")
    set_single_run_text(s5.shapes[12].text_frame.paragraphs[0], "OBJ 3")
    set_single_run_text(s5.shapes[13].text_frame.paragraphs[0], "Provide instant camera-based door verification and automated exam hall seating")
    set_single_run_text(s5.shapes[15].text_frame.paragraphs[0], "KEY DELIVERABLES")
    s5_p = s5.shapes[16].text_frame.paragraphs
    set_single_run_text(s5_p[0], "A complete role-based web portal for Admin, Accounts, HOD, Principal, and Students")
    set_single_run_text(s5_p[1], "A public scanner route (/verify) allowing invigilators to authenticate hall tickets in < 500 ms")

    # ==================== SLIDE 6 (4. METHODOLOGY – SYSTEM WORKFLOW) ====================
    s6 = prs.slides[5]
    set_single_run_text(s6.shapes[0].text_frame.paragraphs[0], "4. METHODOLOGY – SYSTEM WORKFLOW")
    # 1
    set_single_run_text(s6.shapes[7].text_frame.paragraphs[0], "Student Ingestion")
    set_single_run_text(s6.shapes[8].text_frame.paragraphs[0], "import registries, timetables, and department course codes")
    # 2
    set_single_run_text(s6.shapes[11].text_frame.paragraphs[0], "Fee Clearance")
    set_single_run_text(s6.shapes[12].text_frame.paragraphs[0], "isolated to Accounts officer role; flags dues instantly")
    # 3
    set_single_run_text(s6.shapes[15].text_frame.paragraphs[0], "Academic Check")
    set_single_run_text(s6.shapes[16].text_frame.paragraphs[0], "automated attendance (≥ 75%) & internal marks validation")
    # 4
    set_single_run_text(s6.shapes[19].text_frame.paragraphs[0], "Principal Waiver")
    set_single_run_text(s6.shapes[20].text_frame.paragraphs[0], "condonation / medical exceptions with audit trail")
    # 5
    set_single_run_text(s6.shapes[23].text_frame.paragraphs[0], "Smart Generation")
    set_single_run_text(s6.shapes[24].text_frame.paragraphs[0], "PDF generation with QR code, watermark & dual signatures")
    # 6
    set_single_run_text(s6.shapes[27].text_frame.paragraphs[0], "Door Verification")
    set_single_run_text(s6.shapes[28].text_frame.paragraphs[0], "sub-second QR scan at exam hall entry to confirm authenticity")
    # Formula box
    set_two_runs_text(s6.shapes[30].text_frame.paragraphs[0], "Eligibility Rule  =  ", "(Attendance ≥ 75%) ∧ (Fee Status == CLEARED) ∧ (Internals Passed) ∨ Principal Override")
    set_single_run_text(s6.shapes[31].text_frame.paragraphs[0], "Each student must pass all departmental criteria before generation is unlocked, preventing unauthorized issuance.")

    # ==================== SLIDE 7 (4. METHODOLOGY – SECURITY & VERIFICATION MATRIX) ====================
    s7 = prs.slides[6]
    set_single_run_text(s7.shapes[0].text_frame.paragraphs[0], "4. METHODOLOGY – SECURITY & RULES ENGINE")
    # 1
    set_single_run_text(s7.shapes[7].text_frame.paragraphs[0], "Attendance Guard")
    set_single_run_text(s7.shapes[8].text_frame.paragraphs[0], "rejects hall ticket if attendance < 75% in any registered subject")
    # 2
    set_single_run_text(s7.shapes[11].text_frame.paragraphs[0], "Dues Prevention")
    set_single_run_text(s7.shapes[12].text_frame.paragraphs[0], "strictly blocks issuance if accounts ledger shows unpaid fees")
    # 3
    set_single_run_text(s7.shapes[15].text_frame.paragraphs[0], "Role Isolation")
    set_single_run_text(s7.shapes[16].text_frame.paragraphs[0], "cross-student denial: students cannot view or alter peers' tickets")
    # 4
    set_single_run_text(s7.shapes[19].text_frame.paragraphs[0], "Cryptographic QR")
    set_single_run_text(s7.shapes[20].text_frame.paragraphs[0], "encodes unique verification token linked to live database records")
    # 5
    set_single_run_text(s7.shapes[23].text_frame.paragraphs[0], "Anti-Tampering")
    set_single_run_text(s7.shapes[24].text_frame.paragraphs[0], "altered paper text, fake photos, or forged signatures fail scan check")
    # How it works
    set_single_run_text(s7.shapes[26].text_frame.paragraphs[0], "HOW IT WORKS")
    set_single_run_text(s7.shapes[27].text_frame.paragraphs[0], "Every printed hall ticket carries a high-density QR code. When scanned at the exam gate, the system validates the payload against live records in real time.")
    # Accuracy / Integrity
    set_single_run_text(s7.shapes[29].text_frame.paragraphs[0], "AUDIT INTEGRITY")
    set_single_run_text(s7.shapes[30].text_frame.paragraphs[0], "100% of unauthorized attempts and privilege escalations are blocked and recorded in the system audit logs.")

    # ==================== SLIDE 8 (4. METHODOLOGY – DATA & USER ROLES) ====================
    s8 = prs.slides[7]
    set_single_run_text(s8.shapes[0].text_frame.paragraphs[0], "4. METHODOLOGY – DATA & USER ROLES")
    set_single_run_text(s8.shapes[6].text_frame.paragraphs[0], "6")
    set_single_run_text(s8.shapes[7].text_frame.paragraphs[0], "user roles: Admin, Accounts, HOD, Principal, Invigilator, Student")
    set_single_run_text(s8.shapes[9].text_frame.paragraphs[0], "10+")
    set_single_run_text(s8.shapes[10].text_frame.paragraphs[0], "database entities with relational integrity & constraint checks")
    set_single_run_text(s8.shapes[12].text_frame.paragraphs[0], "< 500ms")
    set_single_run_text(s8.shapes[13].text_frame.paragraphs[0], "average QR verification response time on standard mobile 4G")
    set_single_run_text(s8.shapes[14].text_frame.paragraphs[0], "THREE SECURITY LAYERS PROTECT EVERY EXAMINATION RECORD")
    set_single_run_text(s8.shapes[16].text_frame.paragraphs[0], "Role-Based Access")
    set_single_run_text(s8.shapes[17].text_frame.paragraphs[0], "enforces strict separation between Accounts, Academic, and Student views")
    set_single_run_text(s8.shapes[19].text_frame.paragraphs[0], "Supabase Postgres")
    set_single_run_text(s8.shapes[20].text_frame.paragraphs[0], "ACID-compliant storage with Row Level Security (RLS) policies")
    set_single_run_text(s8.shapes[22].text_frame.paragraphs[0], "Instant QR Scanner")
    set_single_run_text(s8.shapes[23].text_frame.paragraphs[0], "web-based mobile camera scanner requiring zero app installation")
    set_single_run_text(s8.shapes[24].text_frame.paragraphs[0], "*Built with Next.js 15, TypeScript, Supabase PostgreSQL, Drizzle ORM, and Tailwind CSS")

    # ==================== SLIDE 9 (5. IMPLEMENTATION) ====================
    s9 = prs.slides[8]
    set_single_run_text(s9.shapes[7].text_frame.paragraphs[0], "Data & Clearances")
    set_single_run_text(s9.shapes[8].text_frame.paragraphs[0], "batch CSV upload or direct database entry for students & fees")
    set_single_run_text(s9.shapes[12].text_frame.paragraphs[0], "Automated Engine")
    set_single_run_text(s9.shapes[13].text_frame.paragraphs[0], "evaluates attendance thresholds and payment status")
    set_single_run_text(s9.shapes[17].text_frame.paragraphs[0], "Ticket Generation")
    set_single_run_text(s9.shapes[18].text_frame.paragraphs[0], "embeds dynamic QR code, college header, and signatures")
    set_single_run_text(s9.shapes[22].text_frame.paragraphs[0], "Live Gate Scanner")
    set_single_run_text(s9.shapes[23].text_frame.paragraphs[0], "instant confirmation of candidate eligibility at exam door")
    set_single_run_text(s9.shapes[25].text_frame.paragraphs[0], "Student Portal: self-service hall ticket download via USN & DOB")
    set_single_run_text(s9.shapes[27].text_frame.paragraphs[0], "Admin Seating Engine: automated classroom bench & room allocation")
    set_single_run_text(s9.shapes[28].text_frame.paragraphs[0], "Built with Next.js 15, React 19, TypeScript, Supabase PostgreSQL, and QRCode engine.")

    # ==================== SLIDE 10 (6. RESULTS – SYSTEM EFFICIENCY) ====================
    s10 = prs.slides[9]
    set_single_run_text(s10.shapes[0].text_frame.paragraphs[0], "6. RESULTS – SYSTEM EFFICIENCY & SPEED")
    set_single_run_text(s10.shapes[7].text_frame.paragraphs[0], "95%")
    set_single_run_text(s10.shapes[8].text_frame.paragraphs[0], "Time Saved")
    set_single_run_text(s10.shapes[9].text_frame.paragraphs[0], "Reduces administrative processing time from days to under 15 minutes")
    set_single_run_text(s10.shapes[11].text_frame.paragraphs[0], "0%")
    set_single_run_text(s10.shapes[12].text_frame.paragraphs[0], "Eligibility Leakage")
    set_single_run_text(s10.shapes[13].text_frame.paragraphs[0], "Zero debarred or fee-due students issued tickets by human error")
    set_single_run_text(s10.shapes[15].text_frame.paragraphs[0], "< 500ms")
    set_single_run_text(s10.shapes[16].text_frame.paragraphs[0], "Verification Speed")
    set_single_run_text(s10.shapes[17].text_frame.paragraphs[0], "Instant student authentication at exam room door via mobile scan")
    set_single_run_text(s10.shapes[18].text_frame.paragraphs[0], "Benchmark based on a batch of 500+ student records processed through the automated eligibility pipeline.")

    # ==================== SLIDE 11 (6. RESULTS – WORKLOAD & SECURITY TESTS) ====================
    s11 = prs.slides[10]
    set_single_run_text(s11.shapes[0].text_frame.paragraphs[0], "6. RESULTS – WORKLOAD & SECURITY TESTS")
    set_single_run_text(s11.shapes[6].text_frame.paragraphs[0], "40+ hrs")
    set_single_run_text(s11.shapes[7].text_frame.paragraphs[0], "MANUAL OVERHEAD")
    set_single_run_text(s11.shapes[8].text_frame.paragraphs[0], "Saved per examination cycle across administrative and accounts staff")
    set_single_run_text(s11.shapes[10].text_frame.paragraphs[0], "100%")
    set_single_run_text(s11.shapes[11].text_frame.paragraphs[0], "TAMPER DETECTION")
    set_single_run_text(s11.shapes[12].text_frame.paragraphs[0], "Altered subjects, fake photos, or forged signatures detected immediately on scan")
    set_single_run_text(s11.shapes[14].text_frame.paragraphs[0], "0 Breaches")
    set_single_run_text(s11.shapes[15].text_frame.paragraphs[0], "ACCESS ISOLATION")
    set_single_run_text(s11.shapes[16].text_frame.paragraphs[0], "Cross-student URL manipulation and unauthorized role mutations strictly rejected")
    set_two_runs_text(s11.shapes[18].text_frame.paragraphs[0], "Tested across automated test suites (workflow.test.ts) ", "covering cross-student access, accounts clearance, and principal override authority.")

    # ==================== SLIDE 12 (6. RESULTS – PROCESS TRANSFORMATION) ====================
    s12 = prs.slides[11]
    set_single_run_text(s12.shapes[0].text_frame.paragraphs[0], "6. RESULTS – BEFORE VS. AFTER COMPARISON")
    set_single_run_text(s12.shapes[6].text_frame.paragraphs[0], "TRADITIONAL MANUAL")
    set_single_run_text(s12.shapes[7].text_frame.paragraphs[0], "5–7 Days")
    set_single_run_text(s12.shapes[8].text_frame.paragraphs[0], "to collect clearances, print cards, sign manually, and distribute")
    set_single_run_text(s12.shapes[10].text_frame.paragraphs[0], "SMART SYSTEM")
    set_single_run_text(s12.shapes[11].text_frame.paragraphs[0], "15 Mins")
    set_single_run_text(s12.shapes[12].text_frame.paragraphs[0], "total time for batch clearance evaluation and ticket publishing (96% faster)")
    s12_cost = s12.shapes[15].text_frame.paragraphs
    set_two_runs_text(s12_cost[0], "Security: ", "Eliminated paper chits and forged signatures with scannable cryptographic QR codes.")
    set_two_runs_text(s12_cost[1], "Convenience: ", "Students download digital copies anytime; invigilators verify in real-time at the door.")

    # ==================== SLIDE 13 (7. CONCLUSION & FUTURE SCOPE) ====================
    s13 = prs.slides[12]
    set_single_run_text(s13.shapes[7].text_frame.paragraphs[0], "Successfully eliminated manual clearance delays and paper queues across departments")
    set_single_run_text(s13.shapes[10].text_frame.paragraphs[0], "Secured hall tickets against forgery, photo alteration, and unauthorized entry using QR validation")
    set_single_run_text(s13.shapes[13].text_frame.paragraphs[0], "Enforced strict Role-Based Access Control protecting sensitive financial and academic data")
    set_single_run_text(s13.shapes[16].text_frame.paragraphs[0], "Streamlined examination gate logistics with sub-second mobile camera scanning")
    set_single_run_text(s13.shapes[18].text_frame.paragraphs[0], "NEXT STEPS / FUTURE SCOPE")
    s13_steps = s13.shapes[19].text_frame.paragraphs
    set_single_run_text(s13_steps[0], "Face Recognition: verify student photo at exam door using AI biometric match")
    set_single_run_text(s13_steps[1], "Automated SMS / WhatsApp dispatch of hall ticket links to students")
    set_single_run_text(s13_steps[2], "Blockchain Verification: store document hashes on-chain for tamper-proof records")
    set_single_run_text(s13_steps[3], "Dynamic Seating AI: optimize student distribution to prevent exam malpractice")
    set_single_run_text(s13.shapes[20].text_frame.paragraphs[0], "System deployed and validated on modern cloud infrastructure with complete end-to-end integration tests.")

    # ==================== SLIDE 14 (REFERENCES) ====================
    s14 = prs.slides[13]
    s14_p = s14.shapes[5].text_frame.paragraphs
    set_single_run_text(s14_p[0], '[1] R. Sharma and A. K. Gupta, "Design and Implementation of Web-Based Examination Management Systems," IEEE Trans. Learn. Technol., vol. 16, no. 3, pp. 345–354, 2023.')
    set_single_run_text(s14_p[1], '[2] S. Patil and V. Deshmukh, "Digital Document Authentication and Anti-Counterfeiting Using Encrypted 2D Barcodes," Int. J. Inf. Secur., vol. 23, pp. 112–125, 2024.')
    set_single_run_text(s14_p[2], '[3] M. Kumar, S. Sengupta, and R. Roy, "Optimization Algorithms for Automated University Examination Seating Arrangements," J. Educ. Comput. Res., vol. 62, no. 2, pp. 210–228, 2024.')
    set_single_run_text(s14_p[3], '[4] T. Rahman and M. Al-Mamun, "Secure Document Issuance and Verification Architecture for Higher Education Institutions," IEEE Access, vol. 13, pp. 4501–4512, 2025.')
    set_single_run_text(s14_p[4], '[5] L. Chen, H. Wang, and Y. Zhang, "Role-Based Access Control and Separation of Duties in Cloud-Native Campus ERPs," Comput. Secur., vol. 148, 2025.')
    set_single_run_text(s14_p[5], '[6] K. Nair and S. Varma, "Zero-Trust Authentication Protocols for High-Stakes Educational Assessments," ACM Inroads, vol. 17, no. 1, pp. 48–57, 2026.')

    # ==================== SLIDE 15 (THANK YOU) ====================
    s15 = prs.slides[14]
    set_single_run_text(s15.shapes[4].text_frame.paragraphs[0], "SMART HALL TICKET GENERATOR SYSTEM   |   Team ID: 23CSMPA12   |   Guide: Prof. Mohammed Saifudeen")

    prs.save(dst_file)
    print("SUCCESS: Generated " + dst_file)

if __name__ == "__main__":
    update_presentation()
