-- ==========================================
-- نظام إدارة مشاريع البناء - Schema المتكاملة (نسخة الإصلاح)
-- ==========================================

-- 1. التأكد من وجود الجداول الأساسية
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'مدير',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.clients (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS public.projects (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS public.workers (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS public.invoices (id UUID DEFAULT gen_random_uuid() PRIMARY KEY);
CREATE TABLE IF NOT EXISTS public.invoice_items (id UUID DEFAULT gen_random_uuid() PRIMARY KEY);
CREATE TABLE IF NOT EXISTS public.purchases (id UUID DEFAULT gen_random_uuid() PRIMARY KEY);
CREATE TABLE IF NOT EXISTS public.transactions (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, amount DECIMAL NOT NULL);
CREATE TABLE IF NOT EXISTS public.suppliers (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS public.transports (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, vehicle_type TEXT NOT NULL);

-- جداول جديدة للحضور والمدفوعات
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    morning BOOLEAN DEFAULT FALSE,
    evening BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(worker_id, date) -- منع تكرار التسجيل لنفس العامل في نفس اليوم
);

CREATE TABLE IF NOT EXISTS public.worker_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. دالة ذكية لإضافة الأعمدة المفقودة
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' 
             AND table_name IN ('clients', 'projects', 'workers', 'invoices', 'invoice_items', 'purchases', 'transactions', 'suppliers', 'transports', 'attendance', 'worker_payments')
    LOOP
        -- إضافة عمود user_id
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t AND column_name = 'user_id') THEN
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN user_id UUID REFERENCES auth.users DEFAULT auth.uid()', t);
        END IF;
    END LOOP;
END $$;

-- 3. تحديث هيكلية الجداول
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS phone TEXT, ADD COLUMN IF NOT EXISTS email TEXT, ADD COLUMN IF NOT EXISTS address TEXT, ADD COLUMN IF NOT EXISTS total_projects INTEGER DEFAULT 0, ADD COLUMN IF NOT EXISTS total_debt DECIMAL(12,2) DEFAULT 0, ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS client TEXT, ADD COLUMN IF NOT EXISTS budget DECIMAL(12,2) DEFAULT 0, ADD COLUMN IF NOT EXISTS expenses DECIMAL(12,2) DEFAULT 0, ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0, ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'نشط', ADD COLUMN IF NOT EXISTS start_date DATE, ADD COLUMN IF NOT EXISTS end_date DATE, ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.workers ADD COLUMN IF NOT EXISTS trade TEXT, ADD COLUMN IF NOT EXISTS phone TEXT, ADD COLUMN IF NOT EXISTS daily_rate DECIMAL(10,2) DEFAULT 0, ADD COLUMN IF NOT EXISTS current_project TEXT, ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE, ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL, ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('شكلية', 'ضريبية')), ADD COLUMN IF NOT EXISTS amount DECIMAL(12,2) DEFAULT 0, ADD COLUMN IF NOT EXISTS tax DECIMAL(12,2) DEFAULT 0, ADD COLUMN IF NOT EXISTS total DECIMAL(12,2) DEFAULT 0, ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'معلقة', ADD COLUMN IF NOT EXISTS due_date DATE, ADD COLUMN IF NOT EXISTS date TIMESTAMP WITH TIME ZONE DEFAULT NOW(), ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE, ADD COLUMN IF NOT EXISTS description TEXT, ADD COLUMN IF NOT EXISTS unit TEXT, ADD COLUMN IF NOT EXISTS quantity DECIMAL(10,2), ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2), ADD COLUMN IF NOT EXISTS total DECIMAL(12,2), ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS project_name TEXT, ADD COLUMN IF NOT EXISTS item TEXT, ADD COLUMN IF NOT EXISTS quantity TEXT, ADD COLUMN IF NOT EXISTS total DECIMAL(12,2), ADD COLUMN IF NOT EXISTS supplier TEXT, ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'تم الطلب', ADD COLUMN IF NOT EXISTS date TIMESTAMP WITH TIME ZONE DEFAULT NOW(), ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
-- تحديث Transactions لربطها بالعملاء
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL, ADD COLUMN IF NOT EXISTS description TEXT, ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('income', 'expense')), ADD COLUMN IF NOT EXISTS method TEXT, ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'مكتمل', ADD COLUMN IF NOT EXISTS date TIMESTAMP WITH TIME ZONE DEFAULT NOW(), ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS phone TEXT, ADD COLUMN IF NOT EXISTS address TEXT, ADD COLUMN IF NOT EXISTS material_type TEXT, ADD COLUMN IF NOT EXISTS total_purchases DECIMAL(12,2) DEFAULT 0, ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.transports ADD COLUMN IF NOT EXISTS plate_number TEXT, ADD COLUMN IF NOT EXISTS driver_name TEXT, ADD COLUMN IF NOT EXISTS phone TEXT, ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'نشط', ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. تفعيل RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_payments ENABLE ROW LEVEL SECURITY;

-- 5. إعادة إنشاء سياسات الأمان
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' 
             AND table_name IN ('clients', 'projects', 'workers', 'invoices', 'invoice_items', 'purchases', 'transactions', 'suppliers', 'transports', 'attendance', 'worker_payments')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'owner_policy_' || t, t);
        EXECUTE format('CREATE POLICY %I ON %I FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)', 'owner_policy_' || t, t);
    END LOOP;
END $$;

-- سياسة Profiles
DROP POLICY IF EXISTS "owner_policy_profiles" ON public.profiles;
CREATE POLICY "owner_policy_profiles" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 6. التلقائيات
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'مدير')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();