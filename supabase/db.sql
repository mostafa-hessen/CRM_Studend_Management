-- 1. جدول الحسابات التعريفية (Profiles)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT DEFAULT 'employee' CHECK (role IN ('admin', 'employee')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. جدول الصفوف الدراسية (Grades)
CREATE TABLE grades (
  id BIGSERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. جدول الطلاب (Students)
CREATE TABLE students (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  parent_phone TEXT,
  grade_id BIGINT REFERENCES grades(id),
  education_type TEXT DEFAULT 'عام',
  school TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. جدول الحملات (Campaigns)
CREATE TABLE campaigns (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  date DATE,
  target_grade_id BIGINT REFERENCES grades(id),
  education_type TEXT,
  notes TEXT,
  statuses TEXT, -- مخزنة كـ Comma-separated كما في الكود الحالي
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. جدول طلاب الحملات (Campaign Students) - Junction Table
CREATE TABLE campaign_students (
  campaign_id BIGINT REFERENCES campaigns(id) ON DELETE CASCADE,
  student_id BIGINT REFERENCES students(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'لم يتم تحديد الحالة',
  followup_date DATE,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (campaign_id, student_id)
);

-- 6. جدول سجل النشاطات (Audit Logs)
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- تفعيل Row Level Security (RLS) لجميع الجداول
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
