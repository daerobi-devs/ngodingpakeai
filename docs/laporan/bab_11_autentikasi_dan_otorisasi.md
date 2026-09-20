# Bab 11: Autentikasi dan Otorisasi Sistem

## 11.1 Mekanisme Autentikasi
Sistem mengimplementasikan otentikasi terkelola berbasis **Supabase GoTrue Authentication** yang mendukung dua moda masuk:
1. **Google OAuth 2.0**: Pengguna dapat masuk secara instan menggunakan akun Google mereka. Sistem mengambil identitas nama lengkap, alamat email, dan tautan avatar foto profil.
2. **Email Passwordless Magic Link (OTP)**: Pengguna memasukkan alamat email mereka, dan sistem mengirimkan tautan verifikasi sekali pakai yang dapat diklik langsung untuk mengautentikasi sesi.

## 11.2 Manajemen Sesi dan Pertukaran Token (Session Exchange)
Sistem menggunakan arsitektur autentikasi berbasis cookie HTTP-Only via pustaka `@supabase/ssr` (lihat: `src/lib/supabase/server.ts`):
* Saat autentikasi eksternal berhasil, penyedia OAuth mengarahkan pengguna kembali ke endpoint callback aplikasi: `GET /auth/callback?code=AUTH_CODE`.
* Endpoint handler `src/app/auth/callback/route.ts` memanggil `supabase.auth.exchangeCodeForSession(code)` untuk menukarkan kode otentikasi menjadi pasangan *Access Token* (JWT) dan *Refresh Token*.
* Token disimpan di peramban dalam bentuk cookie terenkripsi dengan atribut keamanan: `HttpOnly; Secure; SameSite=Lax; Path=/`.
* Pendekatan cookie ini mencegah pencurian token melalui serangan *Cross-Site Scripting* (XSS) pada penyimpanan lokal JavaScript (*localStorage*).
* Sinkronisasi data ke tabel `public.profiles` dijalankan secara otomatis melalui fungsi *Database Trigger* PostgreSQL `public.handle_new_user()` yang mengeksekusi `INSERT INTO public.profiles` setiap kali baris baru terbentuk di skema internal `auth.users`.

## 11.3 Otorisasi Berbasis Peran (Role-Based Access Control / RBAC)
Sistem memberlakukan otorisasi berbasis data profil di tabel `profiles`:
* **Pemeriksaan Hak Admin**: Super Administrator diverifikasi melalui kombinasi field `profiles.is_admin === true` atau pencocokan email pengguna dengan array `system_settings.admin_emails`, serta verifikasi sandi lewat header `x-admin-passcode` (lihat: `src/app/api/admin/route.ts`).
* **Pencegahan Akses Akun Terblokir (Banned User Guard)**: Setiap endpoint sensitif memeriksa kolom `profiles.is_banned`. Jika bernilai `true`, akses langsung ditolak dengan status HTTP 403 Forbidden.
* **Feature Gating Dinamis**: Pengecekan hak akses fitur (misal akses template arsitektur lanjutan atau ekspor Starter Kit ZIP) dijalankan melalui fungsi pembantu `hasTierFeature(userTier, featureKey, settings, isAdmin)` (lihat: `src/components/PricingModal.tsx`, `src/components/wizard/WizardHeroInput.tsx`). Super Administrator dan pengguna dengan tingkatan `unlimited` memperoleh bypass otomatis untuk seluruh fitur.

---

### Gambar 22: Diagram Arsitektur Autentikasi & Otorisasi RBAC
![Gambar 22: Diagram Arsitektur Autentikasi & Otorisasi RBAC](../diagrams/22_auth_rbac_flow.png)
*Gambar 22: Diagram Arsitektur Autentikasi & Otorisasi RBAC*

* **Cara Membaca Diagram**: Diagram di atas menunjukkan alur evaluasi keputusan hak akses sistem sejak request pengguna diterima, pemeriksaan otentikasi sesi, verifikasi status admin dan blokir akun, hingga pemetaan ke empat peran (Guest, Free, Pro, Super Admin) beserta izin akses fitur masing-masing.
