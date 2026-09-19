import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SystemSettings } from "@/lib/supabase/types";
import { resolveGeminiKeysAndSlot, createKeyPool } from "@/lib/gemini/gemini-client";

function getFallbackEnrichedIdea(rawIdea: string, lang: "id" | "en" = "id"): string {
  const t = rawIdea.toLowerCase().trim();

  if (lang === "en") {
    if (t.includes("rental") || t.includes("sewa") || t.includes("booking")) {
      return `Platform Konsep: Sistem Reservasi & Manajemen Sewa Modern untuk "${rawIdea}".\n\n1. Gambaran Produk & Target:\nPlatform komprehensif bagi penyedia sewa unit dan pelanggan, memecahkan masalah jadwal bentrok dan penanganan jaminan manual melalui otomatisasi terpusat.\n\n2. Modul Fitur Utama:\n- Modul Katalog & Kalender Ketersediaan Unit Real-time (lock slot 10 menit saat checkout).\n- Gateway Pembayaran & Deposit Jaminan (dukungan DP 50% atau pelunasan QRIS dinamis).\n- Modul Verifikasi KTP Digital & Tanda Tangan Syarat Sewa Elektronik.\n- Dispatch Notifikasi Otomatis via WhatsApp Gateway untuk invoice, konfirmasi jadwal, dan pengingat pengembalian.\n- Dashboard Owner & Admin Logistik untuk pemantauan utilisasi unit dan rekapitulasi laba harian.\n\n3. Alur Operasional:\nPelanggan memilih tanggal dan unit -> Sistem mengunci slot -> Pelanggan verifikasi identitas dan membayar deposit -> Admin menerima notifikasi mutasi otomatis -> Serah terima unit dengan checklist kondisi barang -> Sistem menghitung denda jika terlambat saat unit kembali.\n\n4. Fondasi Teknis:\nDatabase relasional PostgreSQL dengan Row Level Security, caching Redis untuk slot reservasi, dan background worker untuk pembatalan order otomatis.`;
    }
    if (t.includes("shop") || t.includes("toko") || t.includes("store") || t.includes("commerce")) {
      return `Platform Konsep: Headless E-Commerce Modern untuk "${rawIdea}".\n\n1. Gambaran Produk & Target:\nSolusi penjualan digital terintegrasi untuk brand dan UMKM yang membutuhkan toko online performa tinggi tanpa biaya langganan bulanan platform pihak ketiga.\n\n2. Modul Fitur Utama:\n- Manajemen Katalog Produk Varian (SKU, stok otomatis, diskon berjangka).\n- Keranjang Belanja Cepat & Checkout Satu Halaman (One-Page Checkout).\n- Integrasi Multi-Kurir Ekspedisi Otomatis (kalkulasi ongkir presisi berdasarkan alamat/kecamatan).\n- Payment Gateway QRIS Dinamis & Virtual Account nol-potongan pihak ketiga.\n- Portal Pelanggan (riwayat pesanan, lacak nomor resi real-time, invoice digital).\n\n3. Alur Transaksi:\nPembeli memilih varian produk -> Memasukkan data pengiriman -> Sistem menghitung ongkir -> Pembeli memindai QRIS -> Webhook mendeteksi pembayaran seketika -> Notifikasi pesanan baru dikirim ke tim gudang via WA -> Resi di-update otomatis.\n\n4. Fondasi Teknis:\nNext.js 16 Server Components untuk SEO maksimal, Supabase PostgreSQL, webhook idempotent, dan optimasi gambar otomatis.`;
    }
    return `Platform Konsep: Solusi Web & Aplikasi Modern untuk "${rawIdea}".\n\n1. Gambaran Produk & Target:\nAplikasi web modern yang dibangun untuk mendigitalkan dan mengotomatiskan seluruh alur kerja operasional "${rawIdea}", memberikan efisiensi tinggi bagi pengguna akhir maupun pengelola.\n\n2. Modul Fitur Utama:\n- Sistem Otentikasi Terproteksi & Manajemen Hak Akses Multi-Role (Admin, Operator, Pengguna).\n- Modul Pengelolaan Data Entitas Inti dengan pencarian cepat, filtering multi-kriteria, dan ekspor data.\n- Otomasi Notifikasi Saluran Ganda (WhatsApp & Email Alert).\n- Dashboard Monitoring Metrik Kunci & Rekapitulasi Laporan Real-time.\n\n3. Alur Operasional:\nPengguna mendaftar dan masuk -> Mengakses antarmuka layanan -> Melakukan transaksi atau pembaruan data -> Sistem memvalidasi dan mencatat audit log -> Laporan terbit otomatis untuk manajemen.\n\n4. Fondasi Teknis:\nArsitektur modular scalable dengan Next.js 16, Supabase PostgreSQL, dan container Docker siap deploy.`;
  }

  // Indonesian fallback - detailed & comprehensive
  if (t.includes("sewa") || t.includes("rental") || t.includes("camping") || t.includes("tenda") || t.includes("mobil") || t.includes("kamera")) {
    return `Platform Konsep: Sistem Reservasi & Manajemen Sewa Modern untuk "${rawIdea}".\n\n1. Gambaran Produk & Target:\nPlatform komprehensif bagi penyedia sewa unit dan pelanggan, memecahkan masalah jadwal bentrok dan penanganan jaminan manual melalui otomatisasi terpusat.\n\n2. Modul Fitur Utama:\n- Modul Katalog & Kalender Ketersediaan Unit Real-time (lock slot 10 menit saat checkout).\n- Gateway Pembayaran & Deposit Jaminan (dukungan DP 50% atau pelunasan QRIS dinamis).\n- Modul Verifikasi KTP Digital & Tanda Tangan Syarat Sewa Elektronik.\n- Dispatch Notifikasi Otomatis via WhatsApp Gateway untuk invoice, konfirmasi jadwal, dan pengingat pengembalian.\n- Dashboard Owner & Admin Logistik untuk pemantauan utilisasi unit dan rekapitulasi laba harian.\n\n3. Alur Operasional:\nPelanggan memilih tanggal dan unit -> Sistem mengunci slot -> Pelanggan verifikasi identitas dan membayar deposit -> Admin menerima notifikasi mutasi otomatis -> Serah terima unit dengan checklist kondisi barang -> Sistem menghitung denda jika terlambat saat unit kembali.\n\n4. Fondasi Teknis:\nDatabase relasional PostgreSQL dengan Row Level Security, caching Redis untuk slot reservasi, dan background worker untuk pembatalan order otomatis.`;
  }
  if (t.includes("toko") || t.includes("shop") || t.includes("jual") || t.includes("olshop") || t.includes("baju") || t.includes("makanan") || t.includes("kuliner")) {
    return `Platform Konsep: Toko Online E-Commerce Modern untuk "${rawIdea}".\n\n1. Gambaran Produk & Target:\nSolusi penjualan digital terintegrasi untuk brand dan UMKM yang membutuhkan toko online performa tinggi tanpa biaya potongan komisi platform perantara.\n\n2. Modul Fitur Utama:\n- Manajemen Katalog Produk Varian (SKU, multi-size, stok otomatis, diskon flash-sale).\n- Keranjang Belanja Cepat & Checkout Satu Halaman (One-Page Checkout).\n- Integrasi Multi-Kurir Ekspedisi Otomatis (kalkulasi ongkos kirim presisi tingkat kecamatan).\n- Payment Gateway QRIS Dinamis & Bank Virtual Account otomatis.\n- Portal Pelanggan (riwayat transaksi, lacak nomor resi real-time, unduh invoice PDF).\n\n3. Alur Transaksi:\nPembeli memilih varian produk -> Memasukkan data pengiriman -> Sistem menghitung ongkos kirim -> Pembeli memindai barcode QRIS -> Webhook mendeteksi pembayaran seketika -> Notifikasi pesanan masuk otomatis ke tim gudang via WhatsApp -> Resi diterbitkan.\n\n4. Fondasi Teknis:\nNext.js 16 App Router untuk performa SEO instan, Supabase PostgreSQL, webhook handler idempotent, dan penyimpanan cloud CDN untuk foto produk.`;
  }
  if (t.includes("kos") || t.includes("kost") || t.includes("kontrakan") || t.includes("properti")) {
    return `Platform Konsep: Portal Pencarian & Manajemen Kamar Kos Modern untuk "${rawIdea}".\n\n1. Gambaran Produk & Target:\nPlatform agregator dan manajemen properti sewa kamar bagi mahasiswa/pekerja perantau serta pemilik kos untuk menghilangkan risiko tunggakan dan proses survei yang melelahkan.\n\n2. Modul Fitur Utama:\n- Peta Interaktif Berbasis Geolokasi GPS (filter radius kampus/stasiun, fasilitas AC/WiFi/Kamar Mandi Dalam).\n- Halaman Detail Kamar dengan Galeri Foto & Tur Virtual 360 Derajat.\n- Sistem Booking Kamar & Pembayaran Sewa Bulanan Otomatis (QRIS / VA / Auto-Debit).\n- Manajemen Kontrak Sewa Digital & Pengingat Jatuh Tempo Tagihan via WhatsApp Bot.\n- Dashboard Pemilik Kos (pemantauan status kamar terisi/kosong, mutasi pembayaran, dan laporan pendapatan).\n\n3. Alur Operasional:\nCalon penyewa memfilter lokasi -> Melihat ketersediaan kamar -> Mengajukan survei atau booking langsung -> Mengunggah KTP dan membayar sewa -> Sistem menerbitkan bukti sewa digital -> Notifikasi otomatis dikirim ke pemilik kos.\n\n4. Fondasi Teknis:\nDatabase PostgreSQL dengan PostGIS / Haversine formula untuk pencarian radius lokasi, cron job scheduler untuk notifikasi tagihan bulanan, dan otentikasi aman berbasis Google OAuth.`;
  }
  if (t.includes("kasir") || t.includes("pos") || t.includes("warung") || t.includes("resto") || t.includes("cafe")) {
    return `Platform Konsep: Point of Sale (POS) Cloud & Manajemen Resto/Warung Modern untuk "${rawIdea}".\n\n1. Gambaran Produk & Target:\nAplikasi kasir terpadu untuk kasir, pramusaji, dan pemilik usaha kuliner/retail untuk mempercepat antrean transaksi dan mencegah kebocoran kas.\n\n2. Modul Fitur Utama:\n- Antarmuka Kasir Cepat Touchscreen (pencarian produk instan, split bill, kelola pesanan meja).\n- Manajemen Shift Kerja Kasir (pencatatan modal kas awal, rekonsiliasi kas akhir shift, deteksi selisih).\n- Cetak Struk Pesanan ke Printer Termal Bluetooth / USB & Struk Dapur Terpisah.\n- Integrasi QRIS Dinamis Mandiri Langsung Masuk Rekening (0% potongan MDR).\n- Manajemen Bahan Baku & Peringatan Stok Menipis (Low-Stock Alert).\n- Dashboard Pemilik Usaha (analitik menu terlaris, jam operasional tersibuk, laporan laba kotor harian).\n\n3. Alur Transaksi:\nKasir input pesanan -> Sistem menghitung diskon dan pajak -> Layar menampilkan QRIS dinamis -> Pelanggan scan bayar -> Transaksi otomatis tersimpan dan struk tercetak -> Stok bahan baku terpotong seketika.\n\n4. Fondasi Teknis:\nOffline-first architecture dengan sinkronisasi otomatis saat online, Next.js 16 + PWA (dapat di-install di tablet Android/iPad), dan integrasi Web Bluetooth API untuk printer kasir.`;
  }
  if (t.includes("absensi") || t.includes("hadir") || t.includes("presensi") || t.includes("pegawai") || t.includes("karyawan")) {
    return `Platform Konsep: Sistem Presensi Digital & Penggajian Terintegrasi untuk "${rawIdea}".\n\n1. Gambaran Produk & Target:\nSolusi absensi modern berbasis smartphone untuk instansi, perusahaan, atau kampus guna meniadakan manipulasi kehadiran dan mempercepat kalkulasi payroll bulanan.\n\n2. Modul Fitur Utama:\n- Presensi Geolokasi GPS (validasi batas radius geofencing kantor/cabang) & Verifikasi Foto Wajah.\n- Manajemen Jadwal Shift Kerja, Lembur, dan Kalender Libur Fleksibel.\n- Portal Pengajuan Izin, Cuti, dan Sakit Mandiri dengan Lampiran Surat Keterangan.\n- Kalkulasi Otomatis Jam Kerja, Keterlambatan, dan Potongan Denda Kehadiran.\n- Dashboard HR & Ekspor Data Penggajian (Payroll) ke Format Excel / CSV / PDF.\n\n3. Alur Operasional:\nKaryawan tiba di lokasi -> Membuka aplikasi -> Sistem memvalidasi titik koordinat GPS -> Karyawan mengambil swafoto -> Presensi tercatat dengan timestamp server anti-manipulasi -> HR dapat memantau kehadiran real-time dari kantor pusat.\n\n4. Fondasi Teknis:\nGeofencing mathematical validation, anti-fake GPS detection, enkripsi penyimpanan foto di Supabase Storage, dan ekspor laporan terenkripsi.`;
  }

  return `Platform Konsep: Solusi Perangkat Lunak Terintegrasi untuk "${rawIdea}".\n\n1. Gambaran Produk & Target:\nPlatform komprehensif yang dirancang untuk mendigitalkan dan mengotomatiskan seluruh alur operasional "${rawIdea}", memberikan efisiensi tinggi bagi pengguna akhir maupun pengelola sistem.\n\n2. Modul Fitur Utama:\n- Manajemen Akun & Hak Akses Multi-Peran (Super Admin, Operator Lapangan, Pengguna Akhir).\n- Modul Pengelolaan Data Entitas Inti dengan pencarian cepat, penyaringan dinamis, dan validasi formulir ketat.\n- Sistem Transaksi & Notifikasi Otomatis Saluran Ganda (WhatsApp Gateway & Email Dispatch).\n- Pusat Laporan & Dashboard Analitik Metrik Utama yang dapat diekspor ke format PDF/Excel.\n\n3. Alur Operasional Pengguna:\nPengguna masuk melalui sistem otentikasi aman -> Memilih modul layanan -> Menginput transaksi atau berkas data -> Sistem memproses validasi bisnis dan mencatat riwayat ke audit log -> Laporan terbit otomatis secara real-time.\n\n4. Fondasi Teknis:\nArsitektur Next.js 16 App Router, database relasional PostgreSQL dengan RLS, otentikasi OAuth 2.0 terproteksi, dan container Docker bebas ketergantungan platform.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userIdea = typeof body.userIdea === "string" ? body.userIdea.trim() : "";
    const language = body.language === "en" ? "en" : "id";
    const templateId = body.templateId || "starter";

    if (!userIdea) {
      return NextResponse.json(
        { success: false, error: "Ide produk tidak boleh kosong" },
        { status: 400 }
      );
    }

    // Load System Settings
    const adminSupabase = createAdminClient();
    let systemSettings: SystemSettings = {
      id: "default",
      auth_mode: "hybrid",
      api_key_mode: "byok_only",
      monetization_mode: "freemium",
      ai_provider: "gemini_direct",
      trial_limit: 1,
      qris_merchant_name: "NGODINGPAKEPRD OFFICIAL",
      pro_price_rp: 49000,
      pro_price_formatted: "Rp 49.000 / Lifetime Access",
    };

    try {
      const { data: dbSettings } = await adminSupabase
        .from("system_settings")
        .select("*")
        .eq("id", "default")
        .single();
      if (dbSettings) {
        systemSettings = dbSettings as SystemSettings;
      }
    } catch {
      // Use fallback defaults
    }

    const { keys } = resolveGeminiKeysAndSlot(systemSettings);
    const headerKey = req.headers.get("x-gemini-api-key") || "";
    const envKeys = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const candidateKeys = [
      ...keys,
      ...(headerKey ? [headerKey.trim()] : []),
      ...envKeys,
    ].filter(Boolean);

    if (candidateKeys.length === 0) {
      // Immediate smart fallback without keys
      return NextResponse.json({
        success: true,
        enrichedIdea: getFallbackEnrichedIdea(userIdea, language),
      });
    }

    const keyPool = createKeyPool(candidateKeys);
    const apiKey = keyPool.getAvailableKey();
    if (!apiKey) {
      return NextResponse.json({
        success: true,
        enrichedIdea: getFallbackEnrichedIdea(userIdea, language),
      });
    }

    let contextNote = "";
    if (templateId === "mobile-app") {
      contextNote = " Fokuskan arsitektur pada aplikasi mobile smartphone (offline caching, sensor HP, push notification, navigasi tab, EAS build).";
    } else if (templateId === "ai-service") {
      contextNote = " Fokuskan arsitektur pada sistem AI Agent & Vector Service (pgvector, embedding model, streaming pipeline, asynchronous task worker).";
    }

    const promptText = `Kamu adalah Principal Software Architect & Lead Product Designer kelas dunia.
Tugasmu adalah merevisi dan mentransformasikan ide produk perangkat lunak mentah/singkat dari pengguna berikut menjadi DESKRIPSI KONSEP ARSITEKTUR PRODUK YANG LENGKAP, MENDALAM, TERSTRUKTUR, DAN SIAP DIKEMBANGKAN OLEH DEVELOPER.${contextNote}

IDE MENTAH PENGGUNA:
"${userIdea}"

PANDUAN STRUKTUR OUTPUT LENGKAP:
Tuliskan hasil elaborasi secara terstruktur menggunakan format 4 bagian berikut:

Platform Konsep: [Tuliskan Nama / Judul Konsep Produk yang Keren & Profesional]

1. Gambaran Produk & Target:
Jelaskan visi produk, siapa target pengguna spesifiknya, dan masalah operasional/bisnis nyata apa yang diselesaikan dengan solusi ini.

2. Modul Fitur Utama:
Rinci 4-5 modul fungsional inti beserta kapabilitasnya, contoh:
- Modul Katalog / Inventaris / Layanan Inti
- Alur Pembayaran & Transaksi Terintegrasi (misal QRIS Dinamis / Virtual Account)
- Sistem Notifikasi Otomatis (WhatsApp Gateway / Email dispatch)
- Dashboard Manajemen & Analitik Performa untuk Admin/Owner

3. Alur Operasional Pengguna:
Jelaskan alur interaksi langkah-demi-langkah (step-by-step) dari saat pengguna pertama kali mengakses aplikasi, memilih layanan, menyelesaikan verifikasi/pembayaran, hingga pesanan selesai atau terbit laporan.

4. Fondasi Teknis & Keamanan:
Sebutkan pilar arsitektur teknologi yang direkomendasikan (misal: PostgreSQL dengan Row Level Security, caching Redis untuk performa, validasi keamanan data, dan audit log).

    ATURAN WAJIB:
    1. TULISKAN SEMUA 4 POIN DARI AWAL HINGGA TUNTAS SECARA LENGKAP. DILARANG BERHENTI ATAU TERPOTONG SEBELUM POIN 4 SELESAI DITULIS.
    2. Pastikan menyertakan poin 1 (Gambaran Produk & Target), poin 2 (Modul Fitur Utama), poin 3 (Alur Operasional Pengguna), dan poin 4 (Fondasi Teknis & Keamanan).
    3. Output WAJIB LENGKAP, DETAIL, DAN BERBOBOT (antara 250 hingga 500 kata), bukan ringkasan pendek 2-3 kalimat.
    4. DILARANG KERAS menggunakan kata pembuka klise seperti "Tentu", "Berikut adalah ide", "Ide yang bagus", atau sejenisnya.
    5. DILARANG menggunakan tanda kutip pembuka/penutup di luar isi teks.
    6. DILARANG menggunakan karakter emoji apapun.
    7. Gunakan ${language === "en" ? "Bahasa Inggris profesional" : "Bahasa Indonesia profesional dan istilah engineering modern"}.

    Langsung keluarkan teks hasil elaborasi ide lengkap sekarang:`;

    const candidateModels = [
      "gemini-2.5-flash",
      "gemini-flash-latest",
      "gemini-3.5-flash",
      "gemini-3.8-flash",
    ];

    let enrichedResult = "";

    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 18000);

        // First attempt with thinkingBudget 0 to eliminate thought token consumption and maximize speed
        let res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 3500,
              thinkingConfig: { thinkingBudget: 0 },
            },
          }),
          signal: controller.signal,
        });

        // If 400 Bad Request (model might not support thinkingConfig), retry without thinkingConfig
        if (res.status === 400) {
          res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }],
              generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 3500,
              },
            }),
            signal: controller.signal,
          });
        }

        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          const candidate = data?.candidates?.[0];
          const finishReason = candidate?.finishReason;
          const rawText = candidate?.content?.parts?.[0]?.text;

          // Reject truncated output (MAX_TOKENS or missing critical points)
          const isNotTruncated = finishReason !== "MAX_TOKENS";
          const hasPoints = rawText && rawText.includes("1.") && rawText.includes("2.") && rawText.includes("3.");

          if (rawText && isNotTruncated && hasPoints && rawText.trim().length > 250) {
            enrichedResult = rawText
              .trim()
              .replace(/^["'`]+|["'`]+$/g, "")
              .replace(/[\uD83C-\uDBFF\uDC00-\uDFFF\u2600-\u27BF]/g, "")
              .trim();
            break;
          }
        }
      } catch {
        // Try next model
      }
    }

    if (!enrichedResult) {
      enrichedResult = getFallbackEnrichedIdea(userIdea, language);
    }

    return NextResponse.json({
      success: true,
      enrichedIdea: enrichedResult,
    });
  } catch (error: any) {
    console.error("Error in enrich-idea API:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperkaya ide" },
      { status: 500 }
    );
  }
}
