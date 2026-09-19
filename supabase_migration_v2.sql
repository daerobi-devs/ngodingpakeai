-- ================================================================
-- PAKEPRDAJA (NGODINGPAKEPRD) - SUPABASE MIGRATION V2
-- Jalankan skrip ini langsung di Supabase SQL Editor:
-- Dashboard Supabase -> SQL Editor -> New Query -> Paste & Run
-- ================================================================

-- 1. TABEL PROFILES (Dukungan Gemini Slot, Ban User, & Limit Harian)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS assigned_gemini_slot TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_limit_override INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_server_tokens INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';

-- 2. TABEL PRD HISTORY (Dukungan Pelacakan Slot Gemini yang Digunakan)
ALTER TABLE public.prd_history ADD COLUMN IF NOT EXISTS gemini_slot_used TEXT;
ALTER TABLE public.prd_history ADD COLUMN IF NOT EXISTS tokens_used INTEGER DEFAULT 0;
ALTER TABLE public.prd_history ADD COLUMN IF NOT EXISTS is_server_key BOOLEAN DEFAULT false;
ALTER TABLE public.prd_history ADD COLUMN IF NOT EXISTS model_used TEXT DEFAULT 'AI Engine';

-- 3. TABEL SYSTEM SETTINGS (Dukungan Multi-Tier Pricing, Pengumuman, & Global Slot)
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS global_gemini_slot TEXT DEFAULT 'auto';
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS pricing_tiers JSONB;
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS announcement_banner JSONB;
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS gemini_slots JSONB DEFAULT '[]'::jsonb;

-- 4. TABEL PAYMENT ORDERS (Dukungan Identifikasi Tier Pembelian)
ALTER TABLE public.payment_orders ADD COLUMN IF NOT EXISTS tier_id TEXT DEFAULT 'pro';

-- 5. REFRESH SCHEMA CACHE POSTGREST
-- Perintah ini merefresh cache PostgREST agar Supabase Client langsung mengenali kolom baru tanpa restart server
NOTIFY pgrst, 'reload schema';

-- Selesai! Seluruh kolom v2 berhasil dimigrasi dan schema cache disegarkan.
