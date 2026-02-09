import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// في تطبيقات المتصفح الصرفة (Static)، يتم جلب المفاتيح من متغيرات البيئة أثناء البناء أو استخدام القيم الافتراضية
const supabaseUrl = 'https://mjuojtdblqkwcutdybvd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qdW9qdGRibHFrd2N1dGR5YnZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NTYyNTAsImV4cCI6MjA4NjIzMjI1MH0.2lSd6Ke3BSXmZHY9XS3GOJxlvqsi6YtRZZ3thJXjbGY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);