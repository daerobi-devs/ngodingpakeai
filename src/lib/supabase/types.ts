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
export type SubscriptionTier = 'free' | 'pro' | 'unlimited';
export type OrderStatus = 'pending' | 'approved' | 'rejected';

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
  avatar_url?: string;
  subscription_tier: SubscriptionTier;
  trial_count: number;
  is_admin: boolean;
  pro_expires_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PrdHistory {
  id: string;
  user_id: string;
  title: string;
  prd_data: Json;
  model_used?: string;
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
  payment_method: string;
  status: OrderStatus;
  admin_notes?: string;
  created_at?: string;
  updated_at?: string;
}
