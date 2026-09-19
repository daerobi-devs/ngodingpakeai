-- ============================================================
-- SQL: SETUP PENCATATAN TOKEN & LIVE MONITORING
-- Jalankan di Supabase SQL Editor: https://supabase.com/dashboard
-- Project: ppviceaxilfzbqqzfupe
-- ============================================================

-- 1. Pastikan tabel prd_history ada dan fleksibel untuk guest/user
CREATE TABLE IF NOT EXISTS public.prd_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  title TEXT NOT NULL DEFAULT 'Untitled PRD',
  prd_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  model_used TEXT DEFAULT 'Gemini Flash',
  tokens_used INTEGER DEFAULT 0,
  is_server_key BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tambah kolom-kolom penting ke prd_history jika tabel sudah ada sebelumnya
ALTER TABLE public.prd_history ADD COLUMN IF NOT EXISTS tokens_used INTEGER DEFAULT 0;
ALTER TABLE public.prd_history ADD COLUMN IF NOT EXISTS is_server_key BOOLEAN DEFAULT false;
ALTER TABLE public.prd_history ADD COLUMN IF NOT EXISTS model_used TEXT DEFAULT 'AI Engine';

-- 2. Tambahkan kolom akumulasi token di tabel profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_server_tokens INTEGER DEFAULT 0;

-- 3. Kebijakan Row Level Security (RLS) untuk prd_history
ALTER TABLE public.prd_history ENABLE ROW LEVEL SECURITY;

-- Allow insert untuk user login maupun service role
DROP POLICY IF EXISTS "Allow insert for all users" ON public.prd_history;
CREATE POLICY "Allow insert for all users"
  ON public.prd_history FOR INSERT
  WITH CHECK (true);

-- Allow user melihat riwayat miliknya sendiri
DROP POLICY IF EXISTS "Users view own prd history" ON public.prd_history;
CREATE POLICY "Users view own prd history"
  ON public.prd_history FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Allow admin melihat seluruh riwayat
DROP POLICY IF EXISTS "Admin view all prd history" ON public.prd_history;
CREATE POLICY "Admin view all prd history"
  ON public.prd_history FOR ALL
  USING (true);

-- 4. Index performa query riwayat cepat
CREATE INDEX IF NOT EXISTS idx_prd_history_created_at ON public.prd_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prd_history_user_id ON public.prd_history(user_id);

-- Selesai!
