-- ================================================================
-- PAKEPRDAJA (NGODINGPAKEPRD) - MASTER SUPABASE DATABASE SCHEMA
-- Jalankan skrip ini langsung di Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- ================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABEL PROFILES (Terkoneksi ke auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'unlimited')),
  trial_count INTEGER DEFAULT 0,
  is_admin BOOLEAN DEFAULT false,
  pro_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tambahkan kolom profiles jika belum ada
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trial_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pro_expires_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS assigned_gemini_slot TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_limit_override INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_server_tokens INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. TABEL SYSTEM SETTINGS (Pengaturan Master Switchboard, AI Engine & Monetisasi)
CREATE TABLE IF NOT EXISTS public.system_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  auth_mode TEXT DEFAULT 'hybrid' CHECK (auth_mode IN ('free_access', 'hybrid', 'strict_login')),
  api_key_mode TEXT DEFAULT 'server_managed' CHECK (api_key_mode IN ('byok_only', 'server_managed')),
  monetization_mode TEXT DEFAULT 'freemium' CHECK (monetization_mode IN ('free_forever', 'freemium', 'paywall_strict')),
  ai_provider TEXT DEFAULT 'gemini_direct' CHECK (ai_provider IN ('gemini_direct', 'nine_router', 'openrouter')),
  nine_router_url TEXT DEFAULT 'http://127.0.0.1:2080/v1/chat/completions',
  nine_router_key TEXT,
  nine_router_model TEXT DEFAULT 'deepseek-chat',
  gemini_master_keys TEXT,
  openrouter_key TEXT,
  openrouter_model TEXT DEFAULT 'anthropic/claude-3.5-sonnet',
  trial_limit INTEGER DEFAULT 1,
  qris_merchant_name TEXT DEFAULT 'NGODINGPAKEPRD OFFICIAL',
  qris_gopay_number TEXT DEFAULT '0821-4475-4089',
  qris_image_url TEXT DEFAULT '/qris-gopay-placeholder.png',
  pro_price_rp INTEGER DEFAULT 49000,
  pro_price_formatted TEXT DEFAULT 'Rp 49.000 / Lifetime Access',
  admin_passcode TEXT DEFAULT 'prdadmin99',
  admin_emails TEXT[] DEFAULT ARRAY['daerobi.devs@gmail.com'],
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pastikan setiap kolom di system_settings ada (Idempotent ALTER)
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS auth_mode TEXT DEFAULT 'hybrid';
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS api_key_mode TEXT DEFAULT 'server_managed';
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS monetization_mode TEXT DEFAULT 'freemium';
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS ai_provider TEXT DEFAULT 'gemini_direct';
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS nine_router_url TEXT DEFAULT 'http://127.0.0.1:2080/v1/chat/completions';
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS nine_router_key TEXT;
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS nine_router_model TEXT DEFAULT 'deepseek-chat';
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS gemini_master_keys TEXT;
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS openrouter_key TEXT;
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS openrouter_model TEXT DEFAULT 'anthropic/claude-3.5-sonnet';
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS trial_limit INTEGER DEFAULT 1;
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS qris_merchant_name TEXT DEFAULT 'NGODINGPAKEPRD OFFICIAL';
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS qris_gopay_number TEXT DEFAULT '0821-4475-4089';
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS qris_image_url TEXT DEFAULT '/qris-gopay-placeholder.png';
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS pro_price_rp INTEGER DEFAULT 49000;
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS pro_price_formatted TEXT DEFAULT 'Rp 49.000 / Lifetime Access';
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS admin_emails TEXT[] DEFAULT ARRAY['daerobi.devs@gmail.com'];
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS gemini_slots JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS pro_ai_provider TEXT DEFAULT 'nine_router';
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS pro_model TEXT DEFAULT 'deepseek-chat';
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS free_ai_provider TEXT DEFAULT 'gemini_direct';
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS free_model TEXT DEFAULT 'gemini-flash-latest';
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS global_gemini_slot TEXT DEFAULT 'auto';
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS pricing_tiers JSONB;
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS announcement_banner JSONB;
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 4. TABEL PRD HISTORY & GENERATIONS (Riwayat Hasil Generate PRD Pengguna)
CREATE TABLE IF NOT EXISTS public.prd_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  prd_data JSONB NOT NULL,
  model_used TEXT,
  tokens_used INTEGER DEFAULT 0,
  is_server_key BOOLEAN DEFAULT false,
  gemini_slot_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.prd_history ADD COLUMN IF NOT EXISTS tokens_used INTEGER DEFAULT 0;
ALTER TABLE public.prd_history ADD COLUMN IF NOT EXISTS is_server_key BOOLEAN DEFAULT false;
ALTER TABLE public.prd_history ADD COLUMN IF NOT EXISTS gemini_slot_used TEXT;

CREATE TABLE IF NOT EXISTS public.prd_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  prd_data JSONB NOT NULL,
  model_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL PAYMENT ORDERS (Transaksi Langganan QRIS GoPay)
CREATE TABLE IF NOT EXISTS public.payment_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT,
  user_name TEXT,
  order_code TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL DEFAULT 49000,
  amount_formatted TEXT DEFAULT 'Rp 49.000',
  payment_method TEXT DEFAULT 'QRIS GoPay',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  tier_id TEXT DEFAULT 'pro',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payment_orders ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE public.payment_orders ADD COLUMN IF NOT EXISTS user_name TEXT;
ALTER TABLE public.payment_orders ADD COLUMN IF NOT EXISTS order_code TEXT;
ALTER TABLE public.payment_orders ADD COLUMN IF NOT EXISTS amount INTEGER DEFAULT 49000;
ALTER TABLE public.payment_orders ADD COLUMN IF NOT EXISTS amount_formatted TEXT DEFAULT 'Rp 49.000';
ALTER TABLE public.payment_orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'QRIS GoPay';
ALTER TABLE public.payment_orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.payment_orders ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.payment_orders ADD COLUMN IF NOT EXISTS tier_id TEXT DEFAULT 'pro';

-- 6. DEFAULT RECORD UNTUK SYSTEM SETTINGS
INSERT INTO public.system_settings (
  id,
  auth_mode,
  api_key_mode,
  monetization_mode,
  ai_provider,
  trial_limit,
  qris_merchant_name,
  qris_gopay_number,
  qris_image_url,
  pro_price_rp,
  pro_price_formatted,
  admin_passcode
) VALUES (
  'default',
  'hybrid',
  'server_managed',
  'freemium',
  'gemini_direct',
  1,
  'NGODINGPAKEPRD OFFICIAL',
  '0821-4475-4089',
  '/qris-gopay-placeholder.png',
  49000,
  'Rp 49.000 / Lifetime Access',
  'prdadmin99'
)
ON CONFLICT (id) DO NOTHING;

-- 7. AUTO-CREATE PROFILE ON AUTH SIGNUP (TRIGGER)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, subscription_tier, trial_count, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    'free',
    0,
    (NEW.email = 'daerobi.devs@gmail.com')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prd_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prd_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;

-- Policy Profiles
DROP POLICY IF EXISTS "Public profiles are readable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are readable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Policy System Settings (Semua orang bisa baca, update lewat service role admin)
DROP POLICY IF EXISTS "Settings readable by everyone" ON public.system_settings;
CREATE POLICY "Settings readable by everyone" ON public.system_settings FOR SELECT USING (true);

-- Policy PRD History
DROP POLICY IF EXISTS "Users read own PRD history" ON public.prd_history;
CREATE POLICY "Users read own PRD history" ON public.prd_history FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own PRD history" ON public.prd_history;
CREATE POLICY "Users insert own PRD history" ON public.prd_history FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own PRD history" ON public.prd_history;
CREATE POLICY "Users delete own PRD history" ON public.prd_history FOR DELETE USING (auth.uid() = user_id);

-- Policy PRD Generations
DROP POLICY IF EXISTS "Users read own PRDs" ON public.prd_generations;
CREATE POLICY "Users read own PRDs" ON public.prd_generations FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own PRDs" ON public.prd_generations;
CREATE POLICY "Users insert own PRDs" ON public.prd_generations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy Payment Orders
DROP POLICY IF EXISTS "Users read own orders" ON public.payment_orders;
CREATE POLICY "Users read own orders" ON public.payment_orders FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users create own orders" ON public.payment_orders;
CREATE POLICY "Users create own orders" ON public.payment_orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 9. RELOAD POSTGREST SCHEMA CACHE (PENTING AGAR ERROR KOLOM HILANG SEKETIKA)
NOTIFY pgrst, 'reload schema';
