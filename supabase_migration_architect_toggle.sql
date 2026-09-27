-- ==============================================================================
-- Migration: Tambah Kolom is_architect_enabled pada public.system_settings
-- ==============================================================================
-- Jalankan query ini di Supabase SQL Editor untuk mengaktifkan kolom database
-- Master Feature Toggle Studio Arsitek.

ALTER TABLE public.system_settings 
ADD COLUMN IF NOT EXISTS is_architect_enabled BOOLEAN DEFAULT true;

-- Pastikan baris default memiliki nilai awal true
UPDATE public.system_settings 
SET is_architect_enabled = true 
WHERE is_architect_enabled IS NULL;
