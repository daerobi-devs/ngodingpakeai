-- ============================================================
-- SQL: SETUP TABEL STUDIO TASKS & MCP INTEGRATION
-- Jalankan di Supabase SQL Editor: https://supabase.com/dashboard
-- Project: ppviceaxilfzbqqzfupe (atau instance Supabase Anda)
-- ============================================================

-- 1. Buat tabel penyimpanan permanen untuk kartu Kanban & MCP tasks
CREATE TABLE IF NOT EXISTS public.studio_tasks (
  id TEXT PRIMARY KEY,
  prd_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'P1', -- 'P0' | 'P1' | 'P2'
  phase TEXT NOT NULL DEFAULT 'Fase 1: Inisialisasi',
  status TEXT NOT NULL DEFAULT 'todo', -- 'todo' | 'in_progress' | 'review' | 'done'
  user_story TEXT,
  agent_prompt TEXT,
  tech_mapping JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tambahkan kolom pendukung jika tabel sudah ada sebelumnya
ALTER TABLE public.studio_tasks ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'P1';
ALTER TABLE public.studio_tasks ADD COLUMN IF NOT EXISTS phase TEXT DEFAULT 'Fase 1: Inisialisasi';
ALTER TABLE public.studio_tasks ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'todo';
ALTER TABLE public.studio_tasks ADD COLUMN IF NOT EXISTS user_story TEXT;
ALTER TABLE public.studio_tasks ADD COLUMN IF NOT EXISTS agent_prompt TEXT;
ALTER TABLE public.studio_tasks ADD COLUMN IF NOT EXISTS tech_mapping JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.studio_tasks ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.studio_tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Indeks performa untuk query cepat per PRD dan User
CREATE INDEX IF NOT EXISTS idx_studio_tasks_prd_id ON public.studio_tasks(prd_id);
CREATE INDEX IF NOT EXISTS idx_studio_tasks_user_id ON public.studio_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_studio_tasks_status ON public.studio_tasks(status);

-- 4. Aktifkan Row Level Security (RLS)
ALTER TABLE public.studio_tasks ENABLE ROW LEVEL SECURITY;

-- 5. Kebijakan Keamanan RLS
DROP POLICY IF EXISTS "Allow select for public or own tasks" ON public.studio_tasks;
CREATE POLICY "Allow select for public or own tasks"
  ON public.studio_tasks FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow insert for all users and service role" ON public.studio_tasks;
CREATE POLICY "Allow insert for all users and service role"
  ON public.studio_tasks FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update for all users and service role" ON public.studio_tasks;
CREATE POLICY "Allow update for all users and service role"
  ON public.studio_tasks FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete for all users and service role" ON public.studio_tasks;
CREATE POLICY "Allow delete for all users and service role"
  ON public.studio_tasks FOR DELETE
  USING (true);

-- 6. Trigger otomatis untuk memperbarui kolom updated_at
CREATE OR REPLACE FUNCTION update_studio_task_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_studio_tasks_updated_at ON public.studio_tasks;
CREATE TRIGGER tr_studio_tasks_updated_at
  BEFORE UPDATE ON public.studio_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_studio_task_timestamp();

-- 7. Tambahkan kolom studio_access_tier di system_settings ('paid_only' | 'pro_only' | 'all')
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS studio_access_tier TEXT DEFAULT 'paid_only';

-- Refresh cache schema
NOTIFY pgrst, 'reload schema';

-- Selesai! Tabel studio_tasks dan pengaturan studio kini aktif.
