-- ==============================================================================
-- Migration: Studio Arsitek Sistem & Dokumentasi Bab 3 (Academic System Architect)
-- Table: architect_projects + system_settings (architect_access_tier)
-- ==============================================================================

-- 1. Tabel Utama Proyek Arsitek
CREATE TABLE IF NOT EXISTS public.architect_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  blueprint JSONB NOT NULL DEFAULT '{}'::jsonb,
  diagrams JSONB NOT NULL DEFAULT '{}'::jsonb,
  defense_qa JSONB NOT NULL DEFAULT '[]'::jsonb,
  audit_issues JSONB NOT NULL DEFAULT '[]'::jsonb,
  code_trace JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_type TEXT NOT NULL DEFAULT 'idea' CHECK (source_type IN ('idea', 'local_folder', 'github', 'prd')),
  active_diagram TEXT NOT NULL DEFAULT 'usecase',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexing untuk kecepatan query
CREATE INDEX IF NOT EXISTS idx_architect_projects_user_id ON public.architect_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_architect_projects_created_at ON public.architect_projects(created_at DESC);

-- Mengaktifkan Row Level Security (RLS)
ALTER TABLE public.architect_projects ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses (RLS Policies)
DROP POLICY IF EXISTS "Users can view own architect projects" ON public.architect_projects;
CREATE POLICY "Users can view own architect projects"
  ON public.architect_projects FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own architect projects" ON public.architect_projects;
CREATE POLICY "Users can insert own architect projects"
  ON public.architect_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own architect projects" ON public.architect_projects;
CREATE POLICY "Users can update own architect projects"
  ON public.architect_projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own architect projects" ON public.architect_projects;
CREATE POLICY "Users can delete own architect projects"
  ON public.architect_projects FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger pembaruan timestamp updated_at otomatis
CREATE OR REPLACE FUNCTION public.handle_architect_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_architect_projects_updated ON public.architect_projects;
CREATE TRIGGER on_architect_projects_updated
  BEFORE UPDATE ON public.architect_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_architect_projects_updated_at();

-- ==============================================================================
-- 2. Pendaftaran Pengaturan Hak Akses di Dashboard Admin (system_settings)
-- ==============================================================================

-- Menambahkan kolom architect_access_tier ('paid_only' | 'pro_only' | 'all') jika belum ada
ALTER TABLE public.system_settings 
ADD COLUMN IF NOT EXISTS architect_access_tier TEXT DEFAULT 'paid_only';

-- Memastikan baris default system_settings memiliki nilai awal 'paid_only'
UPDATE public.system_settings 
SET architect_access_tier = 'paid_only' 
WHERE architect_access_tier IS NULL;
