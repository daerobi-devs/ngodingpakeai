# Bab 8: Arsitektur Frontend dan Komponen Antarmuka

## 8.1 Daftar Rute dan Halaman Aplikasi
Aplikasi mengimplementasikan struktur perutean modern Next.js 16 App Router:
1. **`/` (src/app/page.tsx)**: Landing page berkonversi tinggi yang memuat *Hero Section*, *Interactive Blueprint Studio* (simulasi visual PRD interaktif), galeri kartu preset *LandingTemplateShowcase*, dan alur kerja pipa grafis *VisualWorkflowPipeline*.
2. **`/generator` (src/app/generator/page.tsx)**: Ruang kerja utama (*workspace*) pembuatan dan peninjauan PRD. Mengintegrasikan komponen *WizardHeroInput*, *WizardDiscoveryStep*, *PRDViewer*, *PhasedFeatureTree*, dan *MermaidRenderer*.
3. **`/admin` (src/app/admin/page.tsx)**: Dashboard kendali terpusat bagi Super Administrator dengan proteksi passcode modal.
4. **`/terms` (src/app/terms/page.tsx)**: Halaman statis ketentuan hukum penggunaan platform.
5. **`/privacy` (src/app/privacy/page.tsx)**: Halaman kebijakan penanganan privasi dan data akun pengguna.
6. **`/auth/callback` (src/app/auth/callback/route.ts)**: Rute pertukaran kode otentikasi Google OAuth / Magic Link menjadi sesi cookie HTTP-Only.

## 8.2 Hierarki dan Struktur Komponen UI
Frontend diorganisasikan secara hierarkis ke dalam komponen modular:
* **Root Provider Layer**: `src/app/layout.tsx` membungkus seluruh aplikasi dengan `AuthProvider` (mengelola state login dan profil) dan `Navbar` global.
* **Wizard Input Layer**:
  * `WizardHeroInput.tsx`: Kotak textarea responsif dengan penyesuaian tinggi baris otomatis (`rows` adaptif hingga 14 baris), menu dropdown preset arsitektur (*Web App*, *Mobile App*, *AI Service*, *Custom Stack*), pemilih bahasa (*ID* dan *EN*), dan tombol *Perkaya Ide (AI)*.
  * `WizardDiscoveryStep.tsx`: Antarmuka interaktif yang menampilkan daftar kartu pertanyaan klarifikasi dengan lencana rekomendasi dan auto-select.
  * `CustomStackModal.tsx`: Modal pop-up untuk mengonfigurasi framework frontend kustom, runtime backend, database, dan penyedia AI.
* **Document Viewer Layer**:
  * `PRDViewer.tsx`: Penampil dokumen utama dengan tipografi mengalir bersih (*clean typography flow*), navigasi samping *Table of Contents* (TOC) yang menyorot seksi aktif saat digulir, tombol salin Markdown, dan tombol ekspor Starter Kit ZIP.
  * `PhasedFeatureTree.tsx`: Komponen visualisasi pohon fitur yang merender kurva lengkung Bezier SVG dari node produk utama menuju modul P0 (MVP), P1 (Fase Lanjutan), dan P2 (Skala Masa Depan).
  * `MermaidRenderer.tsx`: Mesin visualisasi grafis yang memuat pustaka *Mermaid.js v12*, dilengkapi tab navigasi untuk berpindah antar 8 diagram arsitektur, kontrol perbesaran (*zoom-in/zoom-out*), dan tombol unduh SVG/PNG.
* **Modal & Overlay Layer**:
  * `PricingModal.tsx`: Modal transaksi langganan dengan selector 3 jalur pembayaran.
  * `AuthModal.tsx`: Modal autentikasi dengan opsi Google OAuth dan email Magic Link OTP.
  * `ApiKeyModal.tsx`: Modal konfigurasi kunci API Google Gemini pribadi (BYOK).

## 8.3 State Management dan Aliran Data Klien
Manajemen state pada sisi klien menggunakan kombinasi pendekatan bawaan React yang sangat efisien tanpa memerlukan pustaka eksternal yang berat seperti Redux:
1. **React Context (`src/context/AuthContext.tsx`)**: Menyimpan state global sesi pengguna (`user`), data profil (`profile`), status kepemilikan admin (`isAdmin`), pengaturan publik sistem (`systemSettings`), serta fungsi pembantu seperti `refreshProfile()` dan `logout()`.
2. **Local Component State (`useState`, `useReducer`)**: Digunakan di dalam `generator/page.tsx` untuk mengelola tahapan wizard (`step: 'input' | 'discovery' | 'viewer'`), data PRD aktif (`prdData`), status loading, dan pesan kesalahan.
3. **Browser Storage (`localStorage`)**: Digunakan untuk menyimpan preferensi non-sensitif pengguna seperti pilihan tema admin (`admin_theme: 'dark' | 'light'`) dan kunci BYOK lokal jika diizinkan pengguna.

## 8.4 Penanganan Pengambilan Data (Data Fetching)
Pengambilan data dari backend dilakukan menggunakan fungsi standar `fetch()` dengan pola async/await di dalam handler event atau `useEffect`:
* **Polling Status Transaksi**: Di dalam `PricingModal.tsx`, setelah pesanan QRIS diterbitkan, sebuah interval `setInterval` melakukan polling setiap 3 detik ke endpoint `GET /api/orders?code=ORDER_CODE` untuk mendeteksi kapan webhook MPG berhasil memperbarui status pesanan menjadi `approved`.
* **Proteksi Mutasi Ganda**: Setiap tombol aksi penting (seperti tombol *Buat PRD*, *Perkaya Ide*, dan *Simpan Pengaturan*) mengunci status tombol dengan flag `isLoading` atau `isEnriching` untuk mencegah terjadinya klik ganda (*double submission*).

---

### Gambar 21: Diagram Hierarki Komponen Frontend & Sitemap Navigasi
![Gambar 21: Diagram Hierarki Komponen Frontend & Sitemap Navigasi](../diagrams/21_frontend_sitemap_hierarchy.png)
*Gambar 21: Diagram Hierarki Komponen Frontend & Sitemap Navigasi*

* **Cara Membaca Diagram**: Diagram di atas menunjukkan hierarki pohon komponen React dari `Root Layout` hingga halaman-halaman utama (`/`, `/generator`, `/admin`) serta dekomposisi komponen anak di dalam masing-masing rute.
