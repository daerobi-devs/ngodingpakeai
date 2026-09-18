import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/generator';

  // Deteksi origin yang valid:
  // Di lingkungan Docker / Coolify / Reverse Proxy, requestUrl.origin terbaca sebagai 0.0.0.0:3000
  // Gunakan header x-forwarded-host & x-forwarded-proto, atau fallback ke domain resmi
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  
  let validOrigin = requestUrl.origin;
  if (forwardedHost) {
    validOrigin = `${forwardedProto}://${forwardedHost}`;
  } else if (validOrigin.includes('0.0.0.0') || validOrigin.includes('localhost')) {
    // Jika tidak di localhost development, arahkan ke domain publik
    if (process.env.NODE_ENV === 'production') {
      validOrigin = 'https://ngodingpakeprd.daeroom.my.id';
    }
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, validOrigin));
    }
    console.error('Auth callback error:', error);
  }

  return NextResponse.redirect(new URL('/generator?auth_error=true', validOrigin));
}
