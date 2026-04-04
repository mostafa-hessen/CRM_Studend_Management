
-- وظيفة تسجيل النشاط الذكية لاستيعاب أنواع الجداول المختلفة
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
    entity_name TEXT;
    entity_id TEXT;
    action_type TEXT;
    display_title TEXT := '—';
BEGIN
    action_type := TG_OP; 
    entity_name := TG_TABLE_NAME;
    
    -- التعامل مع الجداول المختلفة (طلاب، حملات، طلاب حملات)
    IF (TG_OP = 'DELETE') THEN
        entity_id := (CASE WHEN (TG_TABLE_NAME = 'campaign_students') THEN OLD.campaign_id::TEXT || '-' || OLD.student_id::TEXT ELSE OLD.id::TEXT END);
        display_title := (CASE WHEN (TG_TABLE_NAME = 'campaign_students') THEN 'رابط طالب بجدول' ELSE OLD.name END);
    ELSE
        entity_id := (CASE WHEN (TG_TABLE_NAME = 'campaign_students') THEN NEW.campaign_id::TEXT || '-' || NEW.student_id::TEXT ELSE NEW.id::TEXT END);
        display_title := (CASE WHEN (TG_TABLE_NAME = 'campaign_students') THEN 'رابط طالب بجدول' ELSE NEW.name END);
    END IF;

    INSERT INTO audit_logs (user_id, action, details)
    VALUES (
        auth.uid(),
        CASE 
            WHEN action_type = 'INSERT' THEN 'إضافة ' || entity_name
            WHEN action_type = 'UPDATE' THEN 'تعديل ' || entity_name
            WHEN action_type = 'DELETE' THEN 'حذف ' || entity_name
            ELSE action_type || ' ' || entity_name
        END,
        ' قام بـ ' || action_type || ' في ' || entity_name || ' (الاسم/الرابط: ' || COALESCE(display_title, 'بدون اسم') || ') - معرف: ' || entity_id
    );
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- تفعيل التريجرات
-- ... (الطلاب والحملات والصفوف السابقة)
DROP TRIGGER IF EXISTS audit_campaign_students ON campaign_students;
CREATE TRIGGER audit_campaign_students
AFTER INSERT OR UPDATE OR DELETE ON campaign_students
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- تفعيل التريجر على الجداول المهمة
DROP TRIGGER IF EXISTS audit_students ON students;
CREATE TRIGGER audit_students
AFTER INSERT OR UPDATE OR DELETE ON students
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_campaigns ON campaigns;
CREATE TRIGGER audit_campaigns
AFTER INSERT OR UPDATE OR DELETE ON campaigns
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_grades ON grades;
CREATE TRIGGER audit_grades
AFTER INSERT OR UPDATE OR DELETE ON grades
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
