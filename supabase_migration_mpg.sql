-- ==============================================================================
-- MIGRASI MANDIRI PRIVATE GATEWAY (MPG) - NGODINGPAKEPRD
-- Skrip ini idempotent (aman dijalankan berulang kali tanpa merusak data yang ada).
-- ==============================================================================

-- 1. Tambah kolom konfigurasi MPG pada tabel system_settings
ALTER TABLE public.system_settings 
  ADD COLUMN IF NOT EXISTS payment_gateway_mode TEXT DEFAULT 'manual_qris',
  ADD COLUMN IF NOT EXISTS mpg_gateway_url TEXT DEFAULT 'http://localhost:3000',
  ADD COLUMN IF NOT EXISTS mpg_api_key TEXT DEFAULT 'mpg_live_f89a3c10b7d24e6a8e5c3b1a9f0d7e2c',
  ADD COLUMN IF NOT EXISTS mpg_webhook_secret TEXT DEFAULT 'mandiri-private-gateway-secret-key-change-in-prod';

-- 2. Tambah kolom transaksi dinamis pada tabel payment_orders
ALTER TABLE public.payment_orders 
  ADD COLUMN IF NOT EXISTS gateway_order_id TEXT,
  ADD COLUMN IF NOT EXISTS final_amount INTEGER,
  ADD COLUMN IF NOT EXISTS unique_code INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS qr_string TEXT,
  ADD COLUMN IF NOT EXISTS checkout_url TEXT,
  ADD COLUMN IF NOT EXISTS detected_bank TEXT,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expired_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS gateway_payload JSONB;

-- 3. Index untuk performa lookup webhook dan status
CREATE INDEX IF NOT EXISTS idx_payment_orders_order_code ON public.payment_orders(order_code);
CREATE INDEX IF NOT EXISTS idx_payment_orders_gateway_order_id ON public.payment_orders(gateway_order_id);
