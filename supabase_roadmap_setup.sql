-- ==============================================================================
-- SQL MIGRATION: Roadmap Pintar Access Policy
-- Jalankan query ini di Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================================

-- 1. Tambahkan kolom roadmap_access_tier pada tabel system_settings jika belum ada
ALTER TABLE public.system_settings 
ADD COLUMN IF NOT EXISTS roadmap_access_tier text DEFAULT 'paid_only';

-- 2. Pastikan baris default system_settings memiliki nilai awal
UPDATE public.system_settings 
SET roadmap_access_tier = 'paid_only'
WHERE roadmap_access_tier IS NULL;

-- Selesai. Pengaturan ini sekarang dapat diatur secara dinamis melalui halaman /admin
