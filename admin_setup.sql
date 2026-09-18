-- ============================================================
-- SQL: Admin Account Setup — ngodingpakeprd
-- Jalankan di Supabase SQL Editor: https://supabase.com/dashboard
-- Project: ppviceaxilfzbqqzfupe
-- ============================================================

-- LANGKAH 1: Pastikan kolom is_admin ada di tabel profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- LANGKAH 2: Tandai email buatintech@gmail.com sebagai admin
-- (Ini bekerja setelah user login minimal 1x via Google OAuth,
--  sehingga profil sudah terbuat di tabel profiles)
UPDATE profiles
SET
  is_admin = true,
  subscription_tier = 'unlimited',
  updated_at = NOW()
WHERE email = 'buatintech@gmail.com';

-- LANGKAH 3 (Opsional): Verifikasi hasilnya
SELECT
  id,
  email,
  full_name,
  is_admin,
  subscription_tier,
  created_at
FROM profiles
WHERE email = 'buatintech@gmail.com';

-- ============================================================
-- KEAMANAN: Row Level Security (RLS)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
CREATE POLICY "Admin can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ============================================================
-- PERFORMANCE: Index untuk query cepat
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id
  ON payment_orders(user_id);

CREATE INDEX IF NOT EXISTS idx_payment_orders_status
  ON payment_orders(status);

-- ============================================================
-- SELESAI. Setelah menjalankan SQL ini:
-- 1. Login ke app dengan akun buatintech@gmail.com
-- 2. Buka /admin
-- 3. Masukkan passcode dari ADMIN_PASSCODE di .env.local
-- ============================================================
