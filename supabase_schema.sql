-- =========================================================================
-- AUTONOMOUS COLLEGE HALL TICKET & EXAMINATION GENERATOR
-- SUPABASE POSTGRESQL SCHEMA & STORAGE CONFIGURATION
-- =========================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  student_count INT DEFAULT 0,
  course_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Degree Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  department_id INT REFERENCES public.departments(id) ON DELETE CASCADE,
  department VARCHAR(255) NOT NULL,
  duration INT DEFAULT 4,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Subjects Table
CREATE TABLE IF NOT EXISTS public.subjects (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  course VARCHAR(255) NOT NULL,
  department VARCHAR(255) NOT NULL,
  semester INT NOT NULL,
  credits INT DEFAULT 4,
  course_id INT REFERENCES public.courses(id) ON DELETE CASCADE,
  department_id INT REFERENCES public.departments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Students Register Table
CREATE TABLE IF NOT EXISTS public.students (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(50) UNIQUE NOT NULL,
  usn VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  dob DATE NOT NULL,
  gender VARCHAR(20) DEFAULT 'Female',
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  address TEXT,
  course VARCHAR(255) NOT NULL,
  department VARCHAR(255) NOT NULL,
  department_id INT REFERENCES public.departments(id),
  course_id INT REFERENCES public.courses(id),
  semester INT NOT NULL,
  section VARCHAR(10) DEFAULT 'A',
  academic_year VARCHAR(20) DEFAULT '2024-25',
  photo_url TEXT,
  attendance_percentage INT DEFAULT 85 CHECK (attendance_percentage BETWEEN 0 AND 100),
  fee_status VARCHAR(20) DEFAULT 'Cleared' CHECK (fee_status IN ('Cleared', 'Pending')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Examinations Table
CREATE TABLE IF NOT EXISTS public.examinations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  exam_type VARCHAR(100) NOT NULL,
  semester INT NOT NULL,
  academic_year VARCHAR(20) DEFAULT '2024-25',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  center VARCHAR(255) NOT NULL,
  session VARCHAR(100) NOT NULL,
  description TEXT,
  subject_count INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published')),
  subjects JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Hall Tickets Table
CREATE TABLE IF NOT EXISTS public.hall_tickets (
  id SERIAL PRIMARY KEY,
  number VARCHAR(50) UNIQUE NOT NULL,
  student_id INT REFERENCES public.students(id) ON DELETE CASCADE,
  student_name VARCHAR(255) NOT NULL,
  usn VARCHAR(50) NOT NULL,
  course VARCHAR(255) NOT NULL,
  department VARCHAR(255) NOT NULL,
  semester INT NOT NULL,
  section VARCHAR(10) NOT NULL,
  photo_url TEXT,
  examination_id INT REFERENCES public.examinations(id) ON DELETE CASCADE,
  examination_name VARCHAR(255) NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  center VARCHAR(255) NOT NULL,
  verify_code VARCHAR(100) UNIQUE NOT NULL,
  qr_data_url TEXT,
  status VARCHAR(20) DEFAULT 'Valid' CHECK (status IN ('Valid', 'Revoked')),
  subjects JSONB DEFAULT '[]'::jsonb,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Institution Settings Table (Single row)
CREATE TABLE IF NOT EXISTS public.college_settings (
  id INT PRIMARY KEY DEFAULT 1,
  college_name VARCHAR(255) NOT NULL,
  college_code VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  controller_name VARCHAR(255) NOT NULL,
  principal_name VARCHAR(255),
  principal_signature_url TEXT,
  min_attendance INT DEFAULT 75,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- INITIAL SEED DATA
-- =========================================================================

INSERT INTO public.college_settings (id, college_name, college_code, email, phone, controller_name, principal_name, min_attendance)
VALUES (
  1,
  'P A College of Engineering',
  'PACE / AUTONOMOUS EXAM CELL',
  'coe@mit.ac.in',
  '+91 80 4012 8800',
  'Mr. Hameed, Controller of Examinations',
  'Dr. Ramis M.K, Principal',
  75
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.departments (id, name, code, student_count, course_count)
VALUES
  (1, 'Computer Science & Engineering', 'CSE', 142, 2),
  (2, 'Information Science & Engineering', 'ISE', 98, 1),
  (3, 'Electronics & Communication', 'ECE', 88, 1),
  (4, 'Mechanical Engineering', 'MECH', 65, 1),
  (5, 'Management & Commerce', 'MBA', 110, 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.courses (id, name, code, department_id, department, duration, description)
VALUES
  (1, 'B.Tech Computer Science & Engineering', 'BT-CSE', 1, 'Computer Science & Engineering', 4, 'Four-year undergraduate degree in computer systems and software engineering.'),
  (2, 'B.Tech Information Science', 'BT-ISE', 2, 'Information Science & Engineering', 4, 'Undergraduate degree in information architecture, cloud, and security.'),
  (3, 'B.Tech Electronics & Communication', 'BT-ECE', 3, 'Electronics & Communication', 4, 'Undergraduate degree in VLSI, embedded systems, and signals.'),
  (4, 'Master of Business Administration', 'MBA-GEN', 5, 'Management & Commerce', 2, 'Postgraduate degree in business analytics and operations.')
ON CONFLICT (id) DO NOTHING;

-- Reset identity sequence
SELECT setval(pg_get_serial_sequence('public.departments', 'id'), COALESCE(max(id), 1)) FROM public.departments;
SELECT setval(pg_get_serial_sequence('public.courses', 'id'), COALESCE(max(id), 1)) FROM public.courses;

-- =========================================================================
-- SUPABASE STORAGE BUCKET CONFIGURATION (For Student Photos & Signatures)
-- =========================================================================

-- Create storage bucket for student photos & signatures
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-photos', 'student-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow public read access to student photos
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'student-photos');

-- Allow service role and authenticated uploads
CREATE POLICY "Allow Public Uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'student-photos');

CREATE POLICY "Allow Public Updates"
ON storage.objects FOR UPDATE
USING (bucket_id = 'student-photos');
