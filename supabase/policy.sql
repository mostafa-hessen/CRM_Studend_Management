
DROP POLICY IF EXISTS "الكل يمكنه رؤية البروفايلات" ON profiles;
CREATE POLICY "رؤية البروفايلات" ON profiles FOR SELECT 
  USING (auth.uid() = id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "المستخدم يعدل بياناته فقط" ON profiles FOR UPDATE USING (auth.uid() = id);

-- سياسات Grades
CREATE POLICY "الكل يرى الصفوف" ON grades FOR SELECT USING (true);
CREATE POLICY "المدير فقط يضيف ويعدل الصفوف" ON grades FOR ALL 
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- سياسات Students
CREATE POLICY "الكل يرى الطلاب" ON students FOR SELECT USING (true);
CREATE POLICY "الكل يضيف ويعدل الطلاب" ON students FOR INSERT WITH CHECK (true);
CREATE POLICY "الكل يحدث بيانات الطلاب" ON students FOR UPDATE USING (true);
CREATE POLICY "المدير فقط يحذف الطلاب" ON students FOR DELETE 
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- سياسات Campaigns
CREATE POLICY "الموظفون والمدراء يرون الحملات" ON campaigns FOR SELECT USING (true);
CREATE POLICY "الكل يضيف ويعدل الحملات" ON campaigns FOR INSERT WITH CHECK (true);
CREATE POLICY "الكل يحدث الحملات" ON campaigns FOR UPDATE USING (true);
CREATE POLICY "المدير فقط يحذف الحملة" ON campaigns FOR DELETE 
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- سياسات Campaign Students
CREATE POLICY "الكل يرى ويعدل طلاب الحملات" ON campaign_students FOR ALL USING (true);
CREATE POLICY "المدير فقط يحذف طلاب من الحملة" ON campaign_students FOR DELETE 
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- سياسات Audit Logs
CREATE POLICY "المدير فقط يرى السجلات" ON audit_logs FOR SELECT 
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "الكل يضيف سجلات" ON audit_logs FOR INSERT WITH CHECK (true);
