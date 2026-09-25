import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/generator';
  const isPopup =
    requestUrl.searchParams.get('popup') === 'true' ||
    next.includes('popup=true');

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
      if (isPopup) {
        return new NextResponse(
          `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Berhasil Terhubung</title>
  <style>
    body {
      background-color: #0c0d12;
      color: #f4f4f5;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      padding: 24px;
      box-sizing: border-box;
    }
    .card {
      text-align: center;
      background: #12141e;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 32px 24px;
      max-width: 320px;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    }
    .badge {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #10b981;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      font-size: 20px;
      font-weight: bold;
    }
    h2 {
      margin: 0 0 8px;
      font-size: 16px;
      font-weight: 700;
      color: #ffffff;
    }
    p {
      margin: 0;
      font-size: 12px;
      color: #a1a1aa;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">&#10003;</div>
    <h2>Akun Terhubung</h2>
    <p>Autentikasi Google berhasil. Menyinkronkan sesi dan menutup jendela...</p>
  </div>
  <script>
    try {
      if (window.opener) {
        window.opener.postMessage({ type: 'SUPABASE_AUTH_SUCCESS' }, window.location.origin);
      }
    } catch (e) {
      console.error(e);
    }
    setTimeout(function() {
      window.close();
    }, 450);
  </script>
</body>
</html>`,
          {
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
            },
          }
        );
      }

      return NextResponse.redirect(new URL(next, validOrigin));
    }
    console.error('Auth callback error:', error);
  }

  if (isPopup) {
    return new NextResponse(
      `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Autentikasi Gagal</title>
  <style>
    body {
      background-color: #0c0d12;
      color: #f4f4f5;
      font-family: sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
    }
    .card {
      text-align: center;
      padding: 24px;
    }
    p {
      color: #ef4444;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="card">
    <p>Gagal mengautentikasi akun Google. Jendela akan ditutup...</p>
  </div>
  <script>
    setTimeout(function() {
      window.close();
    }, 1500);
  </script>
</body>
</html>`,
      {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      }
    );
  }

  return NextResponse.redirect(new URL('/generator?auth_error=true', validOrigin));
}
