# Bab 18: Strategi Pengujian Sistem (Testing Strategy)

## 18.1 Kondisi Pengujian yang Ada Saat Ini
Berdasarkan audit repositori pada file `package.json`, proyek saat ini menggunakan pengujian statis bawaan:
1. **TypeScript Compiler Check (`npx tsc --noEmit`)**:
   * Memvalidasi kepatuhan tipe statis, integritas antarmuka, dan kesesuaian argumen fungsi pada seluruh berkas `.ts` dan `.tsx`.
   * Status: Lolos 100% tanpa kesalahan tipe (Exit code 0).
2. **Next.js Production Build Validation (`npm run build`)**:
   * Mengevaluasi kompilasi seluruh rute statis dan dinamis (25 rute aplikasi), validasi sintaks JSX, dan pemisahan modul server/klien oleh Turbopack.
   * Status: Lolos 100% tanpa kesalahan kompilasi (Exit code 0).
3. **Audit Kepatuhan Nol Emoji**:
   * Skrip pemindai ekspresi reguler regex `/[\uD83C-\uDBFF\uDC00-\uDFFF\u2600-\u27BF]/g` dijalankan pada seluruh kode sumber dan antarmuka untuk menjamin tidak ada emoji piktografik yang lolos ke produksi.

## 18.2 Rekomendasi Strategi Pengujian Menyeluruh (Testing Roadmap)
Untuk mencapai standar keandalan *enterprise-grade*, disarankan untuk mengadopsi piramida pengujian perangkat lunak berikut:

1. **Unit Testing (Vitest / Jest)**:
   * Menguji fungsi transformasi data murni: `normalizeAndSanitizeClarifications()`, parsing JSON Zod schema di `src/lib/gemini/schemas.ts`, dan kalkulasi kode unik pembayaran di `src/lib/mpg/client.ts`.
   * Target cakupan kode: minimal 80% pada direktori `src/lib/`.
2. **Integration Testing (Playwright / MSW)**:
   * Menguji rute handler API dengan *Mock Service Worker* (MSW) yang mensimulasikan respons Gemini API dan respons gateway MPG, memverifikasi bahwa respons error HTTP 429 dan 500 ditangani dengan anggun oleh *Model Ladder*.
   * Menguji handler webhook `/api/webhook/payment-success` dengan berbagai variasi payload dan tanda tangan HMAC yang sah maupun palsu.
3. **End-to-End (E2E) Testing (Playwright)**:
   * Mensimulasikan skenario nyata pengguna (*Critical User Journeys*):
     * Perjalanan A: Input ide -> Klik Perkaya Ide -> Jawab Pertanyaan -> Generate PRD -> Unduh Starter ZIP.
     * Perjalanan B: Buka Pricing Modal -> Pilih Opsi B QRIS -> Simulasi Webhook Lunas -> Verifikasi Selebrasi Confetti dan Pembukaan Gating Fitur Pro.
