import { ClarificationQuestion } from "@/types/prd";

/**
 * Intelligent instant domain classifier and discovery question generator.
 * Provides rich, domain-tailored interactive questions with chip options in < 5ms.
 * Designed with Principal Product Architect standards to eliminate generic template questions.
 */
function enrichQuestionsWithRecommendations(questions: ClarificationQuestion[]): ClarificationQuestion[] {
  return questions.map((q) => {
    const recommendedIds = new Set<string>();
    if (q.recommendedOptionId) recommendedIds.add(q.recommendedOptionId);
    if (Array.isArray(q.recommendedOptionIds)) {
      q.recommendedOptionIds.forEach((id) => recommendedIds.add(id));
    }

    const options = q.options.map((opt, idx) => {
      const isRec = Boolean(opt.isRecommended) || recommendedIds.has(opt.id) || idx === 0;
      const recReason = opt.recommendationReason || (isRec ? (idx === 0 ? "Rekomendasi Utama" : "Best Practice") : undefined);
      return {
        ...opt,
        isRecommended: isRec,
        recommendationReason: recReason,
        badge: opt.badge || (isRec ? recReason || "Rekomendasi" : undefined),
      };
    });

    const finalRecIds = options.filter((o) => o.isRecommended).map((o) => o.id);
    return {
      ...q,
      options,
      recommendedOptionId: q.recommendedOptionId || options[0]?.id,
      recommendedOptionIds: finalRecIds,
    };
  });
}

export function getDomainDiscoveryQuestions(userIdea: string): ClarificationQuestion[] {
  return enrichQuestionsWithRecommendations(resolveRawDomainQuestions(userIdea));
}

function resolveRawDomainQuestions(userIdea: string): ClarificationQuestion[] {
  const text = userIdea.toLowerCase();

  // 1. Rental & Booking Domain (Camping, Kamera, Mobil, Alat, Tenda, Lapangan, Futsal, dsb)
  if (
    text.includes("sewa") ||
    text.includes("rental") ||
    text.includes("camping") ||
    text.includes("tenda") ||
    text.includes("booking") ||
    text.includes("pinjam") ||
    text.includes("kamera") ||
    text.includes("mobil") ||
    text.includes("motor") ||
    text.includes("lapangan") ||
    text.includes("futsal") ||
    text.includes("badminton")
  ) {
    return [
      {
        id: "q_skema_transaksi",
        category: "core_flow",
        question: "Bagaimana alur pembayaran dan konfirmasi reservasi/sewa yang ingin diterapkan?",
        options: [
          { id: "opt_r1_1", label: "DP 50% Online + Pelunasan di Lokasi", description: "Mengurangi risiko no-show sekaligus ramah bagi penyewa" },
          { id: "opt_r1_2", label: "Bayar Lunas di Muka via QRIS/Transfer", description: "Verifikasi instan tanpa penanganan uang tunai di lokasi" },
          { id: "opt_r1_3", label: "Reservasi Bebas Biaya + Auto-Cancel", description: "Batal otomatis jika penyewa tidak konfirmasi H-2 jam" },
          { id: "opt_r1_4", label: "Deposit Jaminan Sewa (Refundable)", description: "Uang deposit dikembalikan penuh setelah unit dicek aman" },
        ],
        recommendedOptionId: "opt_r1_1",
        isMultiSelect: false,
        inputType: "chips",
      },
      {
        id: "q_mitigasi_konflik",
        category: "risk_management",
        question: "Bagaimana sistem menangani potensi bentrok jadwal sewa dan keterlambatan pengembalian?",
        options: [
          { id: "opt_r2_1", label: "Lock Slot Unit 10 Menit saat Checkout", description: "Mencegah dua penyewa memilih barang di detik yang sama" },
          { id: "opt_r2_2", label: "Kalkulasi Denda Keterlambatan Otomatis", description: "Tarif denda dihitung per jam atau per hari secara transparan" },
          { id: "opt_r2_3", label: "Verifikasi Identitas (KTP) Digital", description: "Foto KTP & kontak darurat tervalidasi sebelum serah terima" },
          { id: "opt_r2_4", label: "Fitur Reschedule Mandiri Maksimal H-24 Jam", description: "Penyewa bisa ubah jadwal tanpa harus komplain manual" },
        ],
        recommendedOptionId: "opt_r2_1",
        isMultiSelect: false,
        inputType: "chips",
      },
      {
        id: "q_integrasi_kunci",
        category: "integrations",
        question: "Layanan pihak ketiga apa saja yang paling vital untuk kelancaran operasional sewa ini?",
        options: [
          { id: "opt_r3_1", label: "Notifikasi WhatsApp Gateway & Invoice", description: "Kirim invoice dan pengingat pengembalian otomatis via WA" },
          { id: "opt_r3_2", label: "Payment Gateway QRIS & E-Wallet", description: "Pembayaran terverifikasi otomatis tanpa cek mutasi manual" },
          { id: "opt_r3_3", label: "Sinkronisasi Google Calendar Jadwal", description: "Semua booking tersinkronisasi ke kalender pengelola" },
          { id: "opt_r3_4", label: "Peta & Lokasi Titik Ambil / Antar Unit", description: "Panduan navigasi penjemputan barang bagi penyewa" },
        ],
        recommendedOptionId: "opt_r3_1",
        isMultiSelect: true,
        inputType: "chips",
      },
      {
        id: "q_struktur_aktor",
        category: "user_roles",
        question: "Siapa saja pihak yang akan mengoperasikan sistem ini sehari-hari?",
        options: [
          { id: "opt_r4_1", label: "Admin Gudang / Logistik Unit", description: "Pemeriksaan kondisi fisik barang dan kelengkapan unit" },
          { id: "opt_r4_2", label: "Kasir & Penerimaan Pembayaran", description: "Mencatat transaksi sewa dan mengelola uang kas/deposit" },
          { id: "opt_r4_3", label: "Penyewa Mandiri (Customer Portal)", description: "Memilih unit, reservasi tanggal, dan upload jaminan mandiri" },
          { id: "opt_r4_4", label: "Owner (Monitor Omset & Laporan Laba)", description: "Memantau performa bisnis dan unit paling laris" },
        ],
        recommendedOptionId: "opt_r4_1",
        isMultiSelect: true,
        inputType: "chips",
      },
      {
        id: "q_modul_mvp",
        category: "feature_priority",
        question: "Pilih modul fungsional MVP yang paling wajib ada di rilis versi 1.0:",
        options: [
          { id: "opt_r5_1", label: "Katalog Unit & Status Stok Realtime", description: "Penyewa langsung tahu unit apa saja yang siap disewa" },
          { id: "opt_r5_2", label: "Kalender Pemilih Tanggal Sewa Interaktif", description: "Pilih tanggal mulai & selesai dengan perhitungan harga instan" },
          { id: "opt_r5_3", label: "Formulir Booking & Rekap ke WhatsApp", description: "Data order terkirim ke WhatsApp pelanggan dan admin" },
          { id: "opt_r5_4", label: "Dashboard Manajemen Unit & Pengembalian", description: "Ubah status: Dibooking, Disewa, Dikembalikan, Perlu Servis" },
          { id: "opt_r5_5", label: "Hitung Otomatis Uang Muka & Denda Telat", description: "Kalkulasi tarif sewa transparan tanpa salah hitung" },
          { id: "opt_r5_6", label: "Pembayaran Online QRIS Dinamis", description: "Verifikasi pembayaran instan 24 jam" },
        ],
        recommendedOptionId: "opt_r5_1",
        isMultiSelect: true,
        inputType: "chips",
      },
    ];
  }

  // 2. School / Education / Yayasan / Pesantren Domain
  if (
    text.includes("sekolah") ||
    text.includes("school") ||
    text.includes("ppdb") ||
    text.includes("pesantren") ||
    text.includes("yayasan") ||
    text.includes("kampus") ||
    text.includes("kursus") ||
    text.includes("edukasi") ||
    text.includes("guru") ||
    text.includes("siswa")
  ) {
    return [
      {
        id: "q_alur_ppdb",
        category: "core_flow",
        question: "Bagaimana alur pendaftaran siswa baru (PPDB) & verifikasi berkas berjalan?",
        options: [
          { id: "opt_s1_1", label: "Pendaftaran Online Penuh + Upload Berkas", description: "Wali murid isi formulir dan unggah scan KK/Akta dari HP" },
          { id: "opt_s1_2", label: "Formulir Awal Online + Verifikasi Berkas Fisik", description: "Ambil nomor formulir online, serahkan berkas langsung ke sekolah" },
          { id: "opt_s1_3", label: "Sistem Seleksi Gelombang & Tes Masuk", description: "Pendaftaran dibagi beberapa gelombang dengan jadwal ujian seleksi" },
          { id: "opt_s1_4", label: "Konsultasi WhatsApp Lalu Input Berkas", description: "Panitia memandu orang tua langsung sebelum data dimasukkan sistem" },
        ],
        recommendedOptionId: "opt_s1_1",
        isMultiSelect: false,
        inputType: "chips",
      },
      {
        id: "q_mitigasi_berkas",
        category: "risk_management",
        question: "Bagaimana penanganan berkas siswa yang belum lengkap dan pembatasan kuota kelas?",
        options: [
          { id: "opt_s2_1", label: "Status Berkas Transparan (Pending/Lolos/Revisi)", description: "Wali murid menerima notifikasi jika ada syarat yang kurang" },
          { id: "opt_s2_2", label: "Auto-Lock Kuota Saat Batas Kelas Terpenuhi", description: "Formulir tertutup otomatis saat kapasitas maksimal tercapai" },
          { id: "opt_s2_3", label: "Nomor Registrasi Unik & Timestamp Verifikasi", description: "Menjamin urutan pendaftar adil dan anti-manipulasi" },
          { id: "opt_s2_4", label: "Pengingat Batas Akhir via WhatsApp Otomatis", description: "Broadcast ke nomor orang tua yang belum melengkapi berkas" },
        ],
        recommendedOptionId: "opt_s2_1",
        isMultiSelect: false,
        inputType: "chips",
      },
      {
        id: "q_integrasi_sekolah",
        category: "integrations",
        question: "Integrasi eksternal apa saja yang paling dibutuhkan untuk operasional sekolah?",
        options: [
          { id: "opt_s3_1", label: "WhatsApp Gateway Notifikasi Kelulusan", description: "Pengumuman hasil seleksi dan surat penerimaan langsung ke WA" },
          { id: "opt_s3_2", label: "Virtual Account Pembayaran Biaya Masuk / SPP", description: "Rekonsiliasi pembayaran uang gedung dan SPP otomatis" },
          { id: "opt_s3_3", label: "Export Data Format Dapodik / Kemenag (Excel)", description: "Data siswa baru siap diimpor ke sistem pusat tanpa input ulang" },
          { id: "opt_s3_4", label: "Cetak Kartu Ujian & Bukti PDF Ber-Barcode", description: "Dokumen resmi siap cetak untuk bukti sah pendaftaran" },
        ],
        recommendedOptionId: "opt_s3_1",
        isMultiSelect: true,
        inputType: "chips",
      },
      {
        id: "q_struktur_aktor",
        category: "user_roles",
        question: "Siapa saja pihak yang akan memiliki hak akses di sistem sekolah ini?",
        options: [
          { id: "opt_s4_1", label: "Panitia PPDB (Verifikator Berkas)", description: "Memeriksa keaslian dokumen dan menyetujui pendaftar" },
          { id: "opt_s4_2", label: "Kepala Sekolah (Approval Final)", description: "Menetapkan kuota dan melihat rekap pendaftar per gelombang" },
          { id: "opt_s4_3", label: "Calon Wali Murid (Pendaftar)", description: "Mengisi data anak, mengunggah berkas, dan memantau status seleksi" },
          { id: "opt_s4_4", label: "Staf Tata Usaha (Keuangan & SPP)", description: "Memantau pembayaran uang formulir dan daftar ulang" },
        ],
        recommendedOptionId: "opt_s4_1",
        isMultiSelect: true,
        inputType: "chips",
      },
      {
        id: "q_modul_mvp",
        category: "feature_priority",
        question: "Pilih modul fungsional MVP yang paling wajib ada di portal sekolah ini:",
        options: [
          { id: "opt_s5_1", label: "Portal Formulir PPDB Online & Upload Berkas", description: "Isi data siswa & orang tua serta upload KK, Akta, Ijazah" },
          { id: "opt_s5_2", label: "Profil Sekolah, Visi-Misi, & Akreditasi", description: "Membangun kepercayaan publik dengan tampilan kredibel" },
          { id: "opt_s5_3", label: "Direktori Guru & Staf Pengajar Berfoto", description: "Memperkenalkan kompetensi tenaga pendidik kepada wali murid" },
          { id: "opt_s5_4", label: "Pusat Pengumuman, Berita & Agenda Sekolah", description: "Informasi resmi ujian, libur, dan kegiatan ekstrakurikuler" },
          { id: "opt_s5_5", label: "Cetak Bukti Pendaftaran & Kartu Ujian PDF", description: "Format cetak rapi dengan QR code verifikasi keaslian" },
          { id: "opt_s5_6", label: "Tombol Konsultasi WhatsApp Panitia PPDB", description: "Akses cepat bagi calon orang tua yang ingin tanya jawab" },
        ],
        recommendedOptionId: "opt_s5_1",
        isMultiSelect: true,
        inputType: "chips",
      },
    ];
  }

  // 3. E-commerce / Toko Online / UMKM / Kuliner / Fashion
  if (
    text.includes("toko") ||
    text.includes("shop") ||
    text.includes("e-commerce") ||
    text.includes("ecommerce") ||
    text.includes("jual") ||
    text.includes("beli") ||
    text.includes("umkm") ||
    text.includes("baju") ||
    text.includes("makanan") ||
    text.includes("katalog") ||
    text.includes("produk")
  ) {
    return [
      {
        id: "q_mekanisme_order",
        category: "core_flow",
        question: "Bagaimana mekanisme pemesanan (checkout) yang paling disukai pembelimu?",
        options: [
          { id: "opt_t1_1", label: "Checkout Langsung Kirim Rekap ke WhatsApp", description: "Alur belanja instan tanpa login, rekap pesanan langsung masuk ke WA" },
          { id: "opt_t1_2", label: "Payment Gateway Otomatis (QRIS & VA)", description: "Pembayaran diverifikasi sistem tanpa perlu kirim bukti transfer manual" },
          { id: "opt_t1_3", label: "Sistem Keranjang Belanja Multi-Produk", description: "Pembeli bisa checkout beberapa item sekaligus dengan pilihan varian" },
          { id: "opt_t1_4", label: "Pre-Order (PO) dengan Uang Muka / DP", description: "Sistem mencatat pesanan khusus sebelum barang diproduksi" },
        ],
        recommendedOptionId: "opt_t1_1",
        isMultiSelect: false,
        inputType: "chips",
      },
      {
        id: "q_manajemen_stok",
        category: "risk_management",
        question: "Bagaimana sistem mengontrol stok produk dan mencegah pembatalan sepihak?",
        options: [
          { id: "opt_t2_1", label: "Kunci Stok 30 Menit Saat Checkout", description: "Barang tidak diserobot pembeli lain selama masa pembayaran" },
          { id: "opt_t2_2", label: "Auto-Cancel Jika Tidak Bayar dalam Batas Waktu", description: "Stok otomatis kembali tersedia jika transaksi kedaluwarsa" },
          { id: "opt_t2_3", label: "Peringatan Dini Stok Menipis ke Admin", description: "Notifikasi otomatis saat stok sisa kurang dari batas minimal" },
          { id: "opt_t2_4", label: "Fitur Konfirmasi Pembayaran dengan Upload Bukti", description: "Admin dapat memverifikasi struk transfer manual dengan cepat" },
        ],
        recommendedOptionId: "opt_t2_1",
        isMultiSelect: false,
        inputType: "chips",
      },
      {
        id: "q_integrasi_ekspedisi",
        category: "integrations",
        question: "Integrasi pihak ketiga apa saja yang paling krusial untuk operasional toko ini?",
        options: [
          { id: "opt_t3_1", label: "Kalkulator Ongkir Multi-Ekspedisi (JNE/J&T/SiCepat)", description: "Hitung ongkos kirim otomatis berdasarkan kecamatan tujuan" },
          { id: "opt_t3_2", label: "WhatsApp Bot Kirim Nomor Resi Otomatis", description: "Pembeli menerima kabar status pengiriman secara otomatis" },
          { id: "opt_t3_3", label: "Pembayaran QRIS Dinamis & E-Wallet", description: "Dukungan GoPay, OVO, ShopeePay, dan mobile banking" },
          { id: "opt_t3_4", label: "Cetak Label Pengiriman & Barcode Paket", description: "Mempercepat proses packing gudang setiap hari" },
        ],
        recommendedOptionId: "opt_t3_1",
        isMultiSelect: true,
        inputType: "chips",
      },
      {
        id: "q_struktur_toko",
        category: "user_roles",
        question: "Siapa saja personil yang akan mengoperasikan backend toko ini?",
        options: [
          { id: "opt_t4_1", label: "Pemilik Toko (Owner / Keuangan)", description: "Memantau laporan penjualan, margin laba, dan manajemen katalog" },
          { id: "opt_t4_2", label: "Admin Packing & Gudang", description: "Mengecek pesanan masuk, mengemas paket, dan input nomor resi" },
          { id: "opt_t4_3", label: "Admin CS Balas Chat WhatsApp", description: "Melayani tanya jawab calon pembeli dan konfirmasi pesanan" },
          { id: "opt_t4_4", label: "Reseller / Dropshipper Khusus", description: "Akses harga grosir khusus dan katalog promosi siap share" },
        ],
        recommendedOptionId: "opt_t4_1",
        isMultiSelect: true,
        inputType: "chips",
      },
      {
        id: "q_modul_mvp",
        category: "feature_priority",
        question: "Pilih modul fungsional MVP yang paling wajib ada di toko online ini:",
        options: [
          { id: "opt_t5_1", label: "Katalog Produk & Varian (Warna, Ukuran, Rasa)", description: "Pilihan varian lengkap dengan foto dan stok masing-masing" },
          { id: "opt_t5_2", label: "Keranjang Belanja & Form Checkout Cepat", description: "Input nama, alamat, dan kurir dengan alur minim langkah" },
          { id: "opt_t5_3", label: "Checkout 1 Klik ke WhatsApp Admin", description: "Rekap data belanja rapi langsung terkirim ke WhatsApp" },
          { id: "opt_t5_4", label: "Dashboard Manajemen Pesanan & Status Kirim", description: "Filter: Menunggu Bayar, Diproses, Dikirim, Selesai" },
          { id: "opt_t5_5", label: "Integrasi Hitung Ongkir Otomatis", description: "Pilihan ekspedisi dengan estimasi hari sampai" },
          { id: "opt_t5_6", label: "Pembayaran QRIS Otomatis", description: "Kemudahan bayar non-tunai langsung di layar HP" },
        ],
        recommendedOptionId: "opt_t5_1",
        isMultiSelect: true,
        inputType: "chips",
      },
    ];
  }

  // 4. POS / Kasir / Resto / Cafe / Laundry / Salon / Bengkel / Klinik
  if (
    text.includes("kasir") ||
    text.includes("pos") ||
    text.includes("laundry") ||
    text.includes("resto") ||
    text.includes("kafe") ||
    text.includes("cafe") ||
    text.includes("bengkel") ||
    text.includes("klinik") ||
    text.includes("salon") ||
    text.includes("barbershop")
  ) {
    return [
      {
        id: "q_alur_kasir",
        category: "core_flow",
        question: "Bagaimana alur pelayanan kasir dan pencatatan transaksi yang paling efektif?",
        options: [
          { id: "opt_p1_1", label: "Meja Kasir Cepat Touchscreen (Tablet/HP)", description: "Pilih menu dalam 2 detik, kalkulasi kembalian otomatis" },
          { id: "opt_p1_2", label: "Self-Order Pelanggan via Scan QR Meja", description: "Pengunjung pesan sendiri dari HP, pesanan langsung masuk kasir & dapur" },
          { id: "opt_p1_3", label: "Tiket Antrian & Status Pengerjaan Layanan", description: "Alur bertahap: Order Masuk -> Dikerjakan -> Selesai -> Diambil" },
          { id: "opt_p1_4", label: "Reservasi Jadwal Slot Waktu Janji Temu", description: "Pelanggan booking jam kedatangan sebelum datang ke lokasi" },
        ],
        recommendedOptionId: "opt_p1_1",
        isMultiSelect: false,
        inputType: "chips",
      },
      {
        id: "q_pencegahan_selisih",
        category: "risk_management",
        question: "Bagaimana sistem mengontrol uang kas dan mencegah kecurangan saat operasional?",
        options: [
          { id: "opt_p2_1", label: "Buka-Tutup Shift Kasir & Rekonsiliasi Kas", description: "Wajib input kas awal modal dan hitung uang fisik saat ganti shift" },
          { id: "opt_p2_2", label: "Batalkan Transaksi (Void) Butuh PIN Manager", description: "Kasir tidak bisa hapus nota secara diam-diam tanpa izin supervisor" },
          { id: "opt_p2_3", label: "Pengurangan Stok Bahan Otomatis per Porsi", description: "Stok bahan baku otomatis berkurang tiap menu terjual" },
          { id: "opt_p2_4", label: "Audit Log Riwayat Perubahan & Diskon", description: "Semua pemberian potongan harga tercatat dengan nama petugas" },
        ],
        recommendedOptionId: "opt_p2_1",
        isMultiSelect: false,
        inputType: "chips",
      },
      {
        id: "q_integrasi_hardware",
        category: "integrations",
        question: "Integrasi perangkat kasir apa saja yang wajib terhubung ke sistem ini?",
        options: [
          { id: "opt_p3_1", label: "Printer Struk Thermal Bluetooth (58mm / 80mm)", description: "Cetak nota fisik instan dari HP atau tablet Android" },
          { id: "opt_p3_2", label: "Display QRIS Dinamis di Meja Kasir", description: "Kode QR otomatis muncul sesuai total belanja pelanggan" },
          { id: "opt_p3_3", label: "Kirim Nota Digital (E-Receipt) ke WhatsApp", description: "Hemat kertas struk dan otomatis menyimpan nomor kontak pelanggan" },
          { id: "opt_p3_4", label: "Printer Dapur / Bar untuk Bagian Produksi", description: "Pesanan makanan otomatis tercetak di bagian koki" },
        ],
        recommendedOptionId: "opt_p3_1",
        isMultiSelect: true,
        inputType: "chips",
      },
      {
        id: "q_struktur_shift",
        category: "user_roles",
        question: "Siapa saja staf yang akan mengoperasikan aplikasi ini sehari-hari?",
        options: [
          { id: "opt_p4_1", label: "Kasir Garis Depan (Front-Office)", description: "Melayani pesanan pelanggan dan menerima uang pembayaran" },
          { id: "opt_p4_2", label: "Tim Dapur / Barista / Teknisi Layanan", description: "Melihat tiket pesanan masuk dan mengubah status pengerjaan" },
          { id: "opt_p4_3", label: "Manager Shift / Supervisor Toko", description: "Otorisasi pembatalan nota, diskon khusus, dan rekap shift kasir" },
          { id: "opt_p4_4", label: "Owner / Pemilik Usaha", description: "Akses penuh laporan keuangan dan pantau performa dari mana saja" },
        ],
        recommendedOptionId: "opt_p4_1",
        isMultiSelect: true,
        inputType: "chips",
      },
      {
        id: "q_modul_mvp",
        category: "feature_priority",
        question: "Pilih modul fungsional MVP yang paling wajib ada di aplikasi kasir ini:",
        options: [
          { id: "opt_p5_1", label: "Antarmuka Kasir POS Touchscreen Cepat", description: "Desain tombol besar ramah layar sentuh HP dan tablet" },
          { id: "opt_p5_2", label: "Cetak Struk Thermal & Kirim Nota ke WhatsApp", description: "Dukungan berbagai jenis printer mini Bluetooth" },
          { id: "opt_p5_3", label: "Laporan Omzet & Laba Bersih per Shift Harian", description: "Rekap keuangan otomatis saat kasir tutup buku" },
          { id: "opt_p5_4", label: "Manajemen Stok Barang & Peringatan Habis", description: "Pemantauan ketersediaan barang secara realtime" },
          { id: "opt_p5_5", label: "Manajemen Meja / Status Pengerjaan Pesanan", description: "Visualisasi meja kosong atau nomor antrian aktif" },
          { id: "opt_p5_6", label: "Pembayaran QRIS Dinamis Terverifikasi", description: "Penerimaan pembayaran digital tanpa repot cek mutasi" },
        ],
        recommendedOptionId: "opt_p5_1",
        isMultiSelect: true,
        inputType: "chips",
      },
    ];
  }

  // 5. Default Universal SaaS / Custom Web App / Business System
  return [
    {
      id: "q_alur_layanan",
      category: "core_flow",
      question: "Bagaimana alur interaksi utama pengguna dari awal masuk hingga mendapatkan hasil?",
      options: [
        { id: "opt_u1_1", label: "Input Kebutuhan -> Proses Otomatis -> Hasil Instan", description: "Pengguna mengisi parameter lalu sistem menghasilkan output terstruktur" },
        { id: "opt_u1_2", label: "Pencarian Katalog Data -> Transaksi / Request Layanan", description: "Pengguna mencari opsi terbaik lalu menyelesaikan aksi pemesanan" },
        { id: "opt_u1_3", label: "Kolaborasi Tim dengan Workspace & Role Terpisah", description: "Multi-user bekerja bersama pada project atau dokumen yang sama" },
        { id: "opt_u1_4", label: "Registrasi Akun -> Berlangganan -> Akses Dashboard Penuh", description: "Model akses SaaS bertingkat berbasis paket langganan" },
      ],
      recommendedOptionId: "opt_u1_1",
      isMultiSelect: false,
      inputType: "chips",
    },
    {
      id: "q_mitigasi_sistem",
      category: "risk_management",
      question: "Bagaimana sistem mengantisipasi kegagalan operasional dan menjaga integritas data?",
      options: [
        { id: "opt_u2_1", label: "Validasi Input Ketat & Pencegahan Data Duplikat", description: "Memastikan semua formulir terverifikasi sebelum masuk ke database" },
        { id: "opt_u2_2", label: "Audit Log Riwayat Perubahan Data & Aktivitas User", description: "Mencatat siapa yang mengubah data, kapan, dan nilai perubahannya" },
        { id: "opt_u2_3", label: "Pembatasan Kuota Penggunaan (Rate Limiting)", description: "Mencegah spam bot atau penyalahgunaan sumber daya server" },
        { id: "opt_u2_4", label: "Mode Darurat (Read-Only) Saat Pemeliharaan", description: "Pengguna tetap bisa melihat data saat database sedang disinkronkan" },
      ],
      recommendedOptionId: "opt_u2_1",
      isMultiSelect: false,
      inputType: "chips",
    },
    {
      id: "q_integrasi_ekosistem",
      category: "integrations",
      question: "Integrasi pihak ketiga apa saja yang paling menentukan keunggulan aplikasi ini?",
      options: [
        { id: "opt_u3_1", label: "Login Cepat dengan Google (OAuth 2.0)", description: "Pengguna tidak perlu menghafal password baru untuk masuk" },
        { id: "opt_u3_2", label: "Notifikasi Otomatis via WhatsApp Gateway / Email", description: "Pengingat status dan laporan terkirim langsung ke saluran komunikasi" },
        { id: "opt_u3_3", label: "Payment Gateway QRIS & Virtual Account", description: "Verifikasi pembayaran otomatis untuk langganan atau transaksi" },
        { id: "opt_u3_4", label: "Export Laporan ke Format PDF & Excel Spreadsheet", description: "Memudahkan pengolahan data offline untuk kebutuhan manajemen" },
      ],
      recommendedOptionId: "opt_u3_1",
      isMultiSelect: true,
      inputType: "chips",
    },
    {
      id: "q_struktur_akses",
      category: "user_roles",
      question: "Bagaimana skema peran pengguna (user roles) yang akan mengoperasikan aplikasi ini?",
      options: [
        { id: "opt_u4_1", label: "Super Admin (Sistem & Billing)", description: "Kontrol penuh konfigurasi sistem dan manajemen langganan" },
        { id: "opt_u4_2", label: "Admin Organisasi / Tenant", description: "Mengelola anggota tim dan data internal perusahaannya" },
        { id: "opt_u4_3", label: "Staf Operator / Editor Data", description: "Melakukan input dan pembaruan data operasional harian" },
        { id: "opt_u4_4", label: "Pengguna Akhir Mandiri (End-User)", description: "Hanya mengakses layanan atau hasil untuk dirinya sendiri" },
      ],
      recommendedOptionId: "opt_u4_1",
      isMultiSelect: true,
      inputType: "chips",
    },
    {
      id: "q_modul_mvp",
      category: "feature_priority",
      question: "Pilih modul teknis MVP yang wajib siap pakai di versi rilis awal (v1.0):",
      options: [
        { id: "opt_u5_1", label: "Dashboard Utama dengan Ringkasan Metrik Kunci", description: "Visualisasi angka penting dan aktivitas terbaru secara langsung" },
        { id: "opt_u5_2", label: "Manajemen Data Entitas Inti (Pencarian, Filter, CRUD)", description: "Pengelolaan data bisnis utama dengan navigasi yang cepat" },
        { id: "opt_u5_3", label: "Sistem Otentikasi & Manajemen Profil Pengguna", description: "Penyimpanan data akun aman dengan kontrol hak akses" },
        { id: "opt_u5_4", label: "Pusat Notifikasi & Riwayat Aktivitas Transaksi", description: "Log interaksi penting agar pengguna selalu terinformasi" },
        { id: "opt_u5_5", label: "Ekspor Laporan Data & Ringkasan Dokumen", description: "Unduh rekap operasional dalam format spreadsheet atau dokumen" },
        { id: "opt_u5_6", label: "Pengaturan Sistem & Konfigurasi Fleksibel", description: "Admin dapat menyesuaikan aturan dan preferensi aplikasi" },
      ],
      recommendedOptionId: "opt_u5_1",
      isMultiSelect: true,
      inputType: "chips",
    },
  ];
}
