-- إضافة إضافة pgcrypto المطلوبة لتشفير كلمات المرور في Supabase
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;

-- 1. إضافة عمود الحالة إذا لم يكن موجوداً
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'نشط';

-- رفع أي قيود قديمة على الصلاحيات لتسمح بالكتابة بالعربية
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. دالة إضافة موظف جديد
CREATE OR REPLACE FUNCTION public.admin_create_user(
  p_email text, 
  p_password text, 
  p_full_name text, 
  p_role text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  new_user_id uuid;
  current_user_role text;
BEGIN
  -- التأكد من صلاحيات مدير النظام
  SELECT role INTO current_user_role FROM public.profiles WHERE id = auth.uid();
  IF current_user_role NOT IN ('مدير النظام', 'admin') THEN
    RAISE EXCEPTION 'ليس لديك صلاحية لإنشاء مستخدمين';
  END IF;

  -- إنشاء حساب في جدول المدخلات الأساسي (auth.users)
  new_user_id := gen_random_uuid();
  
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
    created_at, updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', new_user_id, 'authenticated', 'authenticated', p_email, crypt(p_password, gen_salt('bf')), 
    now(), '{"provider":"email","providers":["email"]}', '{}', 
    now(), now()
  );

  -- إنشاء بروفايل في جدول profiles
  INSERT INTO public.profiles (id, full_name, role, status) 
  VALUES (new_user_id, p_full_name, p_role, 'نشط');

  RETURN new_user_id;
END;
$$;


-- 3. دالة تعديل بيانات المستخدم
CREATE OR REPLACE FUNCTION public.admin_update_user(
  p_user_id uuid,
  p_email text,
  p_full_name text,
  p_role text,
  p_password text,
  p_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  current_user_role text;
BEGIN
  -- التأكد من صلاحيات مدير النظام
  SELECT role INTO current_user_role FROM public.profiles WHERE id = auth.uid();
  IF current_user_role NOT IN ('مدير النظام', 'admin') THEN
    RAISE EXCEPTION 'ليس لديك صلاحية لتعديل مستخدمين';
  END IF;

  -- تحديث الإيميل والباسورد في auth.users إذا تم توفيرهما
  IF p_password IS NOT NULL AND p_password != '' THEN
    UPDATE auth.users SET 
      email = p_email,
      encrypted_password = crypt(p_password, gen_salt('bf')),
      updated_at = now()
    WHERE id = p_user_id;
  ELSE
    UPDATE auth.users SET 
      email = p_email,
      updated_at = now()
    WHERE id = p_user_id;
  END IF;

  -- تحديث البروفايل في public.profiles
  UPDATE public.profiles SET 
    full_name = p_full_name,
    role = p_role,
    status = COALESCE(p_status, 'نشط')
  WHERE id = p_user_id;
END;
$$;


-- 4. دالة حذف مستخدم
CREATE OR REPLACE FUNCTION public.admin_delete_user(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  current_user_role text;
BEGIN
  -- التأكد من صلاحيات مدير النظام
  SELECT role INTO current_user_role FROM public.profiles WHERE id = auth.uid();
  IF current_user_role NOT IN ('مدير النظام', 'admin') THEN
    RAISE EXCEPTION 'ليس لديك صلاحية لحذف مستخدمين';
  END IF;
  
  -- الحماية من حذف المدير لنفسه بالخطأ
  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'لا يمكنك حذف حسابك الخاص';
  END IF;

  -- Delete from auth.users (it will cascade to profiles)
  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$;

