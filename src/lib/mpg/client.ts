import crypto from 'node:crypto';
import { SystemSettings } from '@/lib/supabase/types';


export function getMpgConfig(settings?: SystemSettings | null) {
  const gatewayUrl = (
    settings?.mpg_gateway_url ||
    process.env.MPG_GATEWAY_URL ||
    'https://pyamentgateway.daeroom.my.id'
  ).replace(/\/+$/, '');

  const apiKey = (
    settings?.mpg_api_key ||
    process.env.MPG_API_KEY ||
    'mpg_live_f89a3c10b7d24e6a8e5c3b1a9f0d7e2c'
  ).trim();

  const webhookSecret = (
    settings?.mpg_webhook_secret ||
    process.env.MPG_WEBHOOK_SECRET ||
    'mandiri-private-gateway-secret-key-change-in-prod'
  ).trim();

  const mode = settings?.payment_gateway_mode || process.env.PAYMENT_GATEWAY_MODE || 'mpg_headless';

  return {
    gatewayUrl,
    apiKey,
    webhookSecret,
    mode,
    isMpgActive: mode !== 'manual_qris',
    isHeadless: mode === 'mpg_headless' || mode === 'mpg_automatic',
    isHosted: mode === 'mpg_hosted',
  };
}

export interface MpgInvoiceParams {
  orderId: string;
  amount: number;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  callbackUrl?: string;
  redirectUrl?: string;
  expiryMinutes?: number;
  items?: Array<{ name: string; price: number; quantity: number }>;
}

export interface MpgInvoiceResult {
  success: boolean;
  data?: {
    order_id: string;
    base_amount: number;
    unique_code: number;
    final_amount: number;
    qr_string: string;
    checkout_url: string;
    expired_at?: string;
  };
  error?: string;
}

/**
 * Creates a dynamic QRIS invoice via Mandiri Private Gateway (MPG)
 */
export async function createMpgInvoice(
  params: MpgInvoiceParams,
  settings?: SystemSettings | null
): Promise<MpgInvoiceResult> {
  const config = getMpgConfig(settings);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const invoiceEndpoint = `${config.gatewayUrl}/api/v1/invoice`;

    const appUrl = (
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://ngodingpakeprd.buatin.biz.id')
    ).replace(/\/+$/, '');

    const callbackUrl = params.callbackUrl || `${appUrl}/api/webhook/payment-success`;
    const redirectUrl = params.redirectUrl || `${appUrl}/generator?payment=success&order_id=${encodeURIComponent(params.orderId)}`;

    const payload = {
      order_id: params.orderId,
      amount: Math.round(params.amount),
      customer_name: params.customerName || 'Pelanggan ngodingpakeprd',
      customer_email: params.customerEmail || 'user@ngodingpakeprd.com',
      customer_phone: params.customerPhone || '',
      auto_unique_code: true,
      unique_code_digits: 3,
      expiry_minutes: params.expiryMinutes || 15,
      callback_url: callbackUrl,
      redirect_url: redirectUrl,
      items: params.items || [
        {
          name: 'Langganan ngodingpakeprd',
          price: Math.round(params.amount),
          quantity: 1,
        },
      ],
    };

    const res = await fetch(invoiceEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
        'User-Agent': 'NgodingPakePrd-Client/1.0',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      return {
        success: false,
        error: `Gateway returned status ${res.status}: ${errorText.substring(0, 200)}`,
      };
    }

    const json = await res.json();

    if (!json.success || !json.data) {
      return {
        success: false,
        error: json.message || 'Respons gateway tidak valid',
      };
    }

    const data = json.data;
    const finalAmount = Number(data.final_amount || data.amount || params.amount);
    const uniqueCode = Number(data.unique_code || (finalAmount - params.amount) || 0);
    const qrString = data.qr_string || data.qris_string || '';

    let checkoutUrl = data.checkout_url || `${config.gatewayUrl}/checkout/${data.order_id || params.orderId}`;
    if (checkoutUrl.startsWith('/')) {
      checkoutUrl = `${config.gatewayUrl}${checkoutUrl}`;
    }

    return {
      success: true,
      data: {
        order_id: data.order_id || params.orderId,
        base_amount: Number(data.base_amount || params.amount),
        unique_code: uniqueCode,
        final_amount: finalAmount,
        qr_string: qrString,
        checkout_url: checkoutUrl,
        expired_at: data.expired_at,
      },
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Koneksi ke Mandiri Private Gateway gagal';
    return {
      success: false,
      error: msg,
    };
  }
}

/**
 * Validates the HMAC-SHA256 signature sent by the gateway
 */
export function verifyMpgSignature(
  rawBody: string,
  incomingSignature: string | null | undefined,
  secretKey: string
): boolean {
  if (!incomingSignature || !secretKey || !rawBody) {
    return false;
  }

  try {
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(rawBody, 'utf8');
    const expectedSignature = hmac.digest('hex');

    const incomingClean = incomingSignature.trim().toLowerCase();
    const incomingBuffer = Buffer.from(incomingClean, 'utf8');
    const expectedBuffer = Buffer.from(expectedSignature.toLowerCase(), 'utf8');

    if (incomingBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(incomingBuffer, expectedBuffer);
  } catch {
    return false;
  }
}
