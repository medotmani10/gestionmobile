import { createClient } from '@supabase/supabase-js';

// استخدام دالة مساعدة للوصول الآمن لمتغيرات البيئة
const getEnv = (key: string, fallback: string): string => {
  try {
    // في بيئة Vite Build، يتم استبدال import.meta.env.KEY بالقيمة النصية مباشرة
    // لكن نستخدم التحقق لتجنب الأخطاء في بيئات التشغيل المختلفة
    return import.meta.env[key] || fallback;
  } catch (e) {
    return fallback;
  }
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL', 'https://mjuojtdblqkwcutdybvd.supabase.co');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qdW9qdGRibHFrd2N1dGR5YnZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NTYyNTAsImV4cCI6MjA4NjIzMjI1MH0.2lSd6Ke3BSXmZHY9XS3GOJxlvqsi6YtRZZ3thJXjbGY');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);