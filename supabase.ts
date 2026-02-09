import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

/**
 * تأكد من إضافة هذه المتغيرات في لوحة تحكم Vercel:
 * VITE_SUPABASE_URL
 * VITE_SUPABASE_ANON_KEY
 */
const supabaseUrl = (typeof process !== 'undefined' && process.env.VITE_SUPABASE_URL) || 'https://mjuojtdblqkwcutdybvd.supabase.co';
const supabaseAnonKey = (typeof process !== 'undefined' && process.env.VITE_SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qdW9qdGRibHFrd2N1dGR5YnZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NTYyNTAsImV4cCI6MjA4NjIzMjI1MH0.2lSd6Ke3BSXmZHY9XS3GOJxlvqsi6YtRZZ3thJXjbGY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);