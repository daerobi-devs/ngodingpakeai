import type { NextConfig } from "next";

const securityHeaders = [
  // Cegah clickjacking — web kamu tidak bisa di-embed di iframe orang lain
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Cegah MIME sniffing — browser tidak boleh tebak-tebak tipe file
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Kontrol info Referer yang dikirim saat pindah halaman
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Matikan fitur browser yang tidak dipakai
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // DNS prefetch untuk performa
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  // Paksa HTTPS (aktif setelah deploy ke domain real)
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const nextConfig: NextConfig = {
  // Gunakan standalone hanya untuk Docker/Coolify; biarkan undefined di Vercel agar memakai serverless native
  output: process.env.VERCEL ? undefined : 'standalone',
  typescript: {
    // Bypass typecheck saat build agar hemat RAM & mencegah crash OOM di VPS/Coolify/Vercel
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        // Terapkan ke semua route
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
