-- ==========================================
-- REALTIME CONFIGURATION
-- ==========================================

-- 1. Create the publication for realtime
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;

-- 2. Add tables to the publication
ALTER PUBLICATION supabase_realtime ADD TABLE students;
ALTER PUBLICATION supabase_realtime ADD TABLE campaigns;
ALTER PUBLICATION supabase_realtime ADD TABLE grades;
ALTER PUBLICATION supabase_realtime ADD TABLE audit_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE campaign_students;
