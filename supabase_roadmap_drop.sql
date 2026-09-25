-- ==============================================================================
-- SQL CLEANUP: DROP Roadmap Pintar & Revert system_settings
-- Jalankan query ini di Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================================

-- 1. Hapus Trigger dan Fungsi updated_at roadmap
DROP TRIGGER IF EXISTS trigger_roadmaps_updated_at ON public.roadmaps;
DROP FUNCTION IF EXISTS public.handle_roadmap_updated_at();

-- 2. Hapus Tabel roadmaps (beserta seluruh RLS dan Indeks-nya)
DROP TABLE IF EXISTS public.roadmaps CASCADE;

-- 3. Hapus Kolom-kolom kontrol roadmap dari tabel system_settings
ALTER TABLE public.system_settings 
DROP COLUMN IF EXISTS roadmap_access_tier,
DROP COLUMN IF EXISTS roadmap_ai_provider,
DROP COLUMN IF EXISTS roadmap_model,
DROP COLUMN IF EXISTS roadmap_gemini_slot,
DROP COLUMN IF EXISTS roadmap_curriculum_depth;
