export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AuthMode = 'free_access' | 'hybrid' | 'strict_login';
export type ApiKeyMode = 'byok_only' | 'server_managed';
export type MonetizationMode = 'free_forever' | 'freemium' | 'paywall_strict';
export type AiProvider = 'gemini_direct' | 'nine_router' | 'openrouter';
export type SubscriptionTier = 'free' | 'plus' | 'pro' | 'unlimited';
export type OrderStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface TierFeatureFlags {
  advanced_templates: boolean;
  custom_stack: boolean;
  export_zip: boolean;
  architecture_diagrams: boolean;
}

export interface PricingTierConfig {
  id: string; // 'free' | 'plus' | 'pro' | string
  name: string;
  badge?: string;
  description?: string;
  price_rp: number;
  price_formatted: string;
  duration_days: number;
  daily_limit: number; // 0 = unlimited
  features: string[];
  allowed_templates: string[];
  feature_flags?: TierFeatureFlags;
  is_popular?: boolean;
  isActive?: boolean;
}

export const DEFAULT_PRICING_TIERS: PricingTierConfig[] = [
  {
    id: 'free',
    name: 'Free (Gratis)',
    badge: 'FREE',
    description: 'Akses eksplorasi dasar dan uji coba sistem',
    price_rp: 0,
    price_formatted: 'Gratis',
    duration_days: 0,
    daily_limit: 1,
    features: [
      '1 PRD Generation per hari',
      'Akses Template Starter (Web Fullstack)',
      'Salin Dokumen PRD Markdown',
    ],
    allowed_templates: ['starter'],
    feature_flags: {
      advanced_templates: false,
      custom_stack: false,
      export_zip: false,
      architecture_diagrams: false,
    },
    is_popular: false,
    isActive: true,
  },
  {
    id: 'plus',
    name: 'Paket PLUS',
    badge: 'HEMAT',
    description: 'Untuk solo developer & freelancer produktif',
    price_rp: 25000,
    price_formatted: 'Rp 25.000 / 30 Hari',
    duration_days: 30,
    daily_limit: 10,
    features: [
      '10 PRD Generation per hari',
      'Akses Template Lanjutan (Mobile & AI)',
      'Akses Penuh Fitur Racik Custom Stack',
      'Unduh Starter Kit Siap Koding (.ZIP)',
      '5 Diagram Arsitektur & Database ERD',
    ],
    allowed_templates: ['starter', 'mobile-app', 'ai-service', 'custom'],
    feature_flags: {
      advanced_templates: true,
      custom_stack: true,
      export_zip: true,
      architecture_diagrams: true,
    },
    is_popular: false,
    isActive: true,
  },
  {
    id: 'pro',
    name: 'Paket PRO',
    badge: 'POPULER',
    description: 'Akses lengkap tanpa batas untuk tech lead & arsitek',
    price_rp: 49000,
    price_formatted: 'Rp 49.000 / 30 Hari',
    duration_days: 30,
    daily_limit: 50,
    features: [
      '50 PRD Generation per hari',
      'Akses Template Lanjutan (Mobile & AI)',
      'Akses Penuh Fitur Racik Custom Stack',
      'Unduh Starter Kit Siap Koding (.ZIP)',
      '5 Diagram Arsitektur & Database ERD',
    ],
    allowed_templates: ['all'],
    feature_flags: {
      advanced_templates: true,
      custom_stack: true,
      export_zip: true,
      architecture_diagrams: true,
    },
    is_popular: true,
    isActive: true,
  },
];

export function hasTierFeature(
  userTier: string | undefined,
  featureKey: keyof TierFeatureFlags,
  systemSettings?: SystemSettings | null,
  isAdmin?: boolean
): boolean {
  if (isAdmin) return true;
  const tierId = userTier || 'free';
  if (tierId === 'unlimited') return true;

  const tiers = systemSettings?.pricing_tiers && systemSettings.pricing_tiers.length > 0
    ? systemSettings.pricing_tiers
    : DEFAULT_PRICING_TIERS;

  const currentTierConfig = tiers.find((t) => t.id === tierId) || tiers.find((t) => t.id === 'free');
  if (!currentTierConfig) {
    if (tierId === 'pro' || tierId === 'plus') return true;
    return false;
  }

  if (currentTierConfig.feature_flags && typeof currentTierConfig.feature_flags[featureKey] === 'boolean') {
    return currentTierConfig.feature_flags[featureKey];
  }

  // Fallback defaults if feature_flags is not set
  if (tierId === 'pro' || tierId === 'plus') return true;
  return false;
}

export interface GeminiKeySlot {
  id: string;
  label: string;
  key: string;
  isActive: boolean;
  assignedUsers?: string;
  status?: 'online' | 'offline' | 'untested';
  latencyMs?: number;
  models?: string[];
  lastChecked?: string;
  preferredModel?: string;
}

export interface SystemSettings {
  id: string;
  auth_mode: AuthMode;
  api_key_mode: ApiKeyMode;
  monetization_mode: MonetizationMode;
  ai_provider: AiProvider;
  nine_router_url?: string;
  nine_router_key?: string;
  nine_router_model?: string;
  gemini_master_keys?: string;
  gemini_slots?: GeminiKeySlot[];
  global_gemini_slot?: string;
  pricing_tiers?: PricingTierConfig[];
  announcement_banner?: {
    active: boolean;
    isActive?: boolean;
    message: string;
    type: 'promo' | 'info' | 'warning';
    dismissible?: boolean;
  };
  pro_ai_provider?: AiProvider;
  pro_model?: string;
  free_ai_provider?: AiProvider;
  free_model?: string;
  openrouter_key?: string;
  openrouter_model?: string;
  trial_limit: number;
  qris_image_url?: string;
  qris_merchant_name?: string;
  qris_gopay_number?: string;
  payment_gateway_mode?: 'manual_qris' | 'mpg_automatic';
  mpg_gateway_url?: string;
  mpg_api_key?: string;
  mpg_webhook_secret?: string;
  pro_price_rp: number;
  pro_price_formatted: string;
  admin_passcode?: string;
  admin_emails?: string[];
  updated_at?: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  favorite_ai?: string;
  onboarding_completed?: boolean;
  avatar_url?: string;
  subscription_tier: SubscriptionTier;
  trial_count: number;
  is_admin: boolean;
  pro_expires_at?: string | null;
  assigned_gemini_slot?: string | null;
  is_banned?: boolean;
  daily_limit_override?: number | null;
  today_generations_count?: number;
  daily_limit?: number;
  remaining_today?: number;
  total_server_tokens?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PrdHistory {
  id: string;
  user_id: string;
  title: string;
  prd_data: Json;
  model_used?: string;
  gemini_slot_used?: string;
  is_server_key?: boolean;
  tokens_used?: number;
  created_at?: string;
}

export interface PaymentOrder {
  id: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  order_code: string;
  amount: number;
  amount_formatted: string;
  tier_id?: string;
  payment_method: string;
  status: OrderStatus;
  admin_notes?: string;
  gateway_order_id?: string;
  final_amount?: number;
  unique_code?: number;
  qr_string?: string;
  checkout_url?: string;
  detected_bank?: string;
  paid_at?: string;
  expired_at?: string;
  created_at?: string;
  updated_at?: string;
}
