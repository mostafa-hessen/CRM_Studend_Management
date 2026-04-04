import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// يتم تحميل المفاتيح من config.js (مُضاف إلى .gitignore)
// إذا لم يوجد الملف، ارجع إلى config.example.js وأنشئ نسختك

/* global SUPABASE_URL, SUPABASE_ANON_KEY */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
