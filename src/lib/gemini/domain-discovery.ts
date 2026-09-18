import { ClarificationQuestion } from "@/types/prd";

/**
 * Intelligent instant domain classifier and discovery question generator.
 * Provides rich, domain-tailored interactive questions with chip options in < 5ms.
 */
export function getDomainDiscoveryQuestions(userIdea: string): ClarificationQuestion[] {
  const text = userIdea.toLowerCase();

  // 1. Rental & Booking Domain (Camping, Kamera, Mobil, Alat, Tenda, dsb)
  if (
    text.includes("sewa") ||
    text.includes("rental") ||
    text.includes("camping") ||
    text.includes("tenda") ||
    text.includes("booking") ||
    text.includes("pinjam")
  ) {
    return [
      {
        id: "q_target_user",
        category: "target_user",
        question: "Ceritakan siapa yang paling butuh aplikasi ini. Sekarang mereka ngapain buat mengatasi masalahnya?",
        options: [
          { id: "opt_r1", label: "Catat manual di buku & chat WhatsApp", description: "Sering salah catat jadwal sewa" },
          { id: "opt_r2", label: "Pelanggan sering tanya ketersediaan berulang", description: "Admin capek balas chat satu-satu" },
          { id: "opt_r3", label: "Jadwal booking sering bentrok", description: "Dua penyewa memilih alat di tanggal sama" },
          { id: "opt_r4", label: "Alat sewa sering rusak / hilang tanpa tracking", description: "Sulit memantau pengembalian barang" },
        ],
        recommendedOptionId: "opt_r1",
        isMultiSelect: false,
        inputType: "chips",
      },
      {
        id: "q_first_action",
        category: "core_flow",
        question: "Kalau orang buka aplikasi ini pertama kali, satu hal apa yang harus mereka selesaikan sebelum nutup?",
        options: [
          { id: "opt_r2_1", label: "Lihat katalog alat yang siap disewa", description: "Mengecek foto, spesifikasi, dan tarif per hari" },
          { id: "opt_r2_2", label: "Pilih tanggal & pesan alat pertama", description: "Konversi booking langsung dalam 2 menit" },
          { id: "opt_r2_3", label: "Cek ketersediaan slot tanggal", description: "Memastikan alat belum dibooking orang lain" },
          { id: "opt_r2_4", label: "Daftar akun penyewa & upload identitas", description: "Registrasi cepat untuk verifikasi jaminan" },
        ],
        recommendedOptionId: "opt_r2_1",
        isMultiSelect: false,
        inputType: "chips",
      },
      {
        id: "q_core_features",
        category: "feature_priority",
        question: `Dari fitur-fitur ini, pilih yang paling wajib ada di aplikasi ${userIdea.slice(0, 30)}:`,
        options: [
          { id: "opt_r3_1", label: "Katalog Alat & Filter Kategori", description: "Pencarian cepat barang siap sewa" },
          { id: "opt_r3_2", label: "Jadwal Sewa & Kalender Tanggal", description: "Pemilihan tanggal mulai dan selesai sewa" },
          { id: "opt_r3_3", label: "Formulir Booking & Kirim ke WhatsApp", description: "Rekap data sewa otomatis terkirim ke WA admin" },
          { id: "opt_r3_4", label: "Dashboard Manajemen Stok & Pesanan", description: "Admin bisa ubah status sewa dan kelola unit" },
          { id: "opt_r3_5", label: "Hitung Biaya Otomatis + Deposit Jaminan", description: "Kalkulasi total tarif sewa dan denda telat" },
          { id: "opt_r3_6", label: "Pembayaran Online QRIS", description: "Verifikasi pembayaran otomatis" },
        ],
        recommendedOptionId: "opt_r3_1",
        isMultiSelect: true,
        inputType: "chips",
      },
      {
        id: "q_differentiator",
        category: "value_proposition",
        question: "Apa yang bikin aplikasi ini lebih enak dipakai dibanding cara sekarang?",
        options: [
          { id: "opt_r4_1", label: "Lebih cepat cari & cek stok alat", description: "Tidak perlu menunggu balasan chat berjam-jam" },
          { id: "opt_r4_2", label: "Harga & syarat sewa sangat transparan", description: "Tidak ada biaya tersembunyi" },
          { id: "opt_r4_3", label: "Gak perlu telpon atau tanya manual", description: "Semua status barang realtime di layar" },
          { id: "opt_r4_4", label: "Bisa booking langsung dari rumah 24 jam", description: "Kemudahan reservasi kapan saja" },
        ],
        recommendedOptionId: "opt_r4_1",
        isMultiSelect: false,
        inputType: "chips",
      },
      {
        id: "q_retention",
        category: "retention_trigger",
        question: "Apa yang bikin orang balik lagi pakai aplikasi ini, bukan cuma coba sekali?",
        options: [
          { id: "opt_r5_1", label: "Alat lengkap & kondisi selalu terawat", description: "Pelanggan puas dan percaya" },
          { id: "opt_r5_2", label: "Proses sewa gampang anti-ribet", description: "Cukup beberapa klik barang siap diambil" },
          { id: "opt_r5_3", label: "Riwayat sewa & data tersimpan rapi", description: "Order berikutnya tidak perlu input data lagi" },
          { id: "opt_r5_4", label: "Diskon khusus untuk pelanggan setia", description: "Potongan harga sewa berkala" },
        ],
        recommendedOptionId: "opt_r5_2",
        isMultiSelect: false,
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
        id: "q_target_user",
        category: "target_user",
        question: "Ceritakan siapa yang paling butuh website sekolah ini dan apa kendala mereka saat ini?",
        options: [
          { id: "opt_s1", label: "Calon wali murid bingung cari info pendaftaran PPDB", description: "Brosur kertas sering habis dan info di medsos tidak lengkap" },
          { id: "opt_s2", label: "Sekolah belum punya profil online resmi yang profesional", description: "Kalah saing dengan sekolah lain yang punya web modern" },
          { id: "opt_s3", label: "Prestasi dan kegiatan siswa jarang terekspos publik", description: "Tidak ada dokumentasi terpusat yang bisa dibanggakan" },
          { id: "opt_s4", label: "Orang tua kesulitan mengakses jadwal dan kontak guru", description: "Komunikasi sekolah ke orang tua masih serba tercecer" },
        ],
        recommendedOptionId: "opt_s1",
        isMultiSelect: false,
        inputType: "chips",
      },
      {
        id: "q_first_action",
        category: "core_flow",
        question: "Kalau wali murid atau calon siswa buka web ini pertama kali, satu hal apa yang harus selesai?",
        options: [
          { id: "opt_s2_1", label: "Lihat syarat & alur pendaftaran PPDB", description: "Mengetahui jadwal gelombang dan rincian biaya masuk" },
          { id: "opt_s2_2", label: "Ketahui keunggulan, visi-misi & akreditasi", description: "Meyakinkan kredibilitas sekolah dalam 1 menit" },
          { id: "opt_s2_3", label: "Download brosur / kurikulum sekolah", description: "Menyimpan berkas ringkasan untuk dipelajari di rumah" },
          { id: "opt_s2_4", label: "Hubungi panitia PPDB via WhatsApp", description: "Konsultasi langsung dengan petugas pendaftaran" },
        ],
        recommendedOptionId: "opt_s2_1",
        isMultiSelect: false,
        inputType: "chips",
      },
      {
        id: "q_core_features",
        category: "feature_priority",
        question: "Pilih fitur yang paling wajib ada di website profil sekolah ini (boleh pilih beberapa):",
        options: [
          { id: "opt_s3_1", label: "Portal Pendaftaran PPDB Online", description: "Formulir pendaftaran dan upload dokumen siswa" },
          { id: "opt_s3_2", label: "Profil Lengkap, Visi Misi & Akreditasi", description: "Identitas resmi dan sejarah sekolah" },
          { id: "opt_s3_3", label: "Direktori Guru & Staf Pengajar", description: "Foto, nama, mata pelajaran, dan profil pendidik" },
          { id: "opt_s3_4", label: "Galeri Prestasi & Fasilitas Sekolah", description: "Foto laboratorium, ruang kelas, dan piala prestasi" },
          { id: "opt_s3_5", label: "Pusat Pengumuman & Berita Terkini", description: "Kabar ujian, libur sekolah, dan kalender akademik" },
          { id: "opt_s3_6", label: "Integrasi WhatsApp Panitia PPDB", description: "Tombol mengambang chat langsung dengan admin" },
        ],
        recommendedOptionId: "opt_s3_1",
        isMultiSelect: true,
        inputType: "chips",
      },
      {
        id: "q_differentiator",
        category: "value_proposition",
        question: "Apa yang bikin website sekolah ini lebih unggul dibanding sekolah lain?",
        options: [
          { id: "opt_s4_1", label: "Tampilan modern, rapi, & cepat di HP", description: "Meningkatkan prestise dan citra positif sekolah" },
          { id: "opt_s4_2", label: "Pendaftaran PPDB full online tanpa antri", description: "Sangat memudahkan wali murid yang bekerja" },
          { id: "opt_s4_3", label: "Informasi transparan & selalu terupdate", description: "Wali murid percaya dan merasa diikutsertakan" },
          { id: "opt_s4_4", label: "Mudah ditemukan di Google (SEO Ramah)", description: "Calon murid baru gampang menemukan sekolah" },
        ],
        recommendedOptionId: "opt_s4_1",
        isMultiSelect: false,
        inputType: "chips",
      },
      {
        id: "q_retention",
        category: "retention_trigger",
        question: "Apa yang membuat pengunjung dan wali murid sering balik lagi ke web ini?",
        options: [
          { id: "opt_s5_1", label: "Update foto kegiatan & karya siswa tiap pekan", description: "Orang tua senang melihat perkembangan anak" },
          { id: "opt_s5_2", label: "Pengumuman nilai & kalender akademik resmi", description: "Menjadi sumber informasi utama kegiatan sekolah" },
          { id: "opt_s5_3", label: "Artikel edukasi & tips parenting dari guru", description: "Memberikan nilai tambah untuk keluarga siswa" },
          { id: "opt_s5_4", label: "Pengumuman kelulusan & hasil seleksi PPDB", description: "Akses cepat hasil seleksi penerimaan" },
        ],
        recommendedOptionId: "opt_s5_2",
        isMultiSelect: false,
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
    text.includes("katalog")
  ) {
    return [
      {
        id: "q_target_user",
        category: "target_user",
        question: "Siapa calon pembeli utama tokomu dan bagaimana cara mereka order saat ini?",
        options: [
          { id: "opt_t1", label: "Jualan lewat status WhatsApp & DM Instagram", description: "Kewalahan rekap orderan dan stok sering bentrok" },
          { id: "opt_t2", label: "Pelanggan sering tanya stok dan harga berulang kali", description: "Banyak waktu terbuang membalas pertanyaan yang sama" },
          { id: "opt_t3", label: "Perhitungan ongkos kirim masih manual", description: "Pelanggan batal beli karena respon admin lambat" },
          { id: "opt_t4", label: "Pencatatan nota penjualan masih di buku tulis", description: "Laporan keuntungan bulanan sering tidak akurat" },
        ],
        recommendedOptionId: "opt_t1",
        isMultiSelect: false,
        inputType: "chips",
      },
      {
        id: "q_first_action",
        category: "core_flow",
        question: "Saat calon pembeli membuka tokomu pertama kali, apa yang harus mereka selesaikan?",
        options: [
          { id: "opt_t2_1", label: "Lihat katalog produk & promo terbaru", description: "Langsung tertarik dengan foto dan harga jelas" },
          { id: "opt_t2_2", label: "Masukkan produk ke keranjang belanja", description: "Memilih varian warna, ukuran, atau rasa" },
          { id: "opt_t2_3", label: "Langsung checkout kirim order ke WhatsApp", description: "Alur belanja instan tanpa harus register ribet" },
          { id: "opt_t2_4", label: "Cari produk spesifik dengan fitur filter", description: "Menemukan barang yang dicari dalam hitungan detik" },
        ],
        recommendedOptionId: "opt_t2_3",
        isMultiSelect: false,
        inputType: "chips",
      },
      {
        id: "q_core_features",
        category: "feature_priority",
        question: "Pilih fitur yang paling wajib ada di toko online ini (boleh pilih beberapa):",
        options: [
          { id: "opt_t3_1", label: "Katalog Produk & Foto Varian", description: "Pilihan ukuran, warna, harga promo, dan stok" },
          { id: "opt_t3_2", label: "Keranjang Belanja Instan", description: "Pengguna bisa pilih beberapa barang sekaligus" },
          { id: "opt_t3_3", label: "Checkout Langsung ke WhatsApp Admin", description: "Rekap pesanan rapi terkirim ke WA dalam 1 klik" },
          { id: "opt_t3_4", label: "Integrasi Cek Ongkir Ekspedisi", description: "Hitung otomatis JNE, J&T, SiCepat, dll" },
          { id: "opt_t3_5", label: "Pembayaran Online QRIS / Transfer Bank", description: "Verifikasi pembayaran otomatis dan praktis" },
          { id: "opt_t3_6", label: "Dashboard Manajemen Pesanan & Stok Admin", description: "Pantau pesanan masuk dan cetak label alamat" },
        ],
        recommendedOptionId: "opt_t3_1",
        isMultiSelect: true,
        inputType: "chips",
      },
      {
        id: "q_differentiator",
        category: "value_proposition",
        question: "Apa yang bikin toko online ini lebih enak dipakai dibanding marketplace besar?",
        options: [
          { id: "opt_t4_1", label: "Proses order cepat tanpa login berbelit-belit", description: "Pembeli tidak malas karena tidak butuh password" },
          { id: "opt_t4_2", label: "Bebas potongan komisi marketplace yang mahal", description: "Margin laba penjual lebih terjaga penuh" },
          { id: "opt_t4_3", label: "Sentuhan personal chat langsung dengan pemilik", description: "Hubungan hangat dengan pelanggan setia" },
          { id: "opt_t4_4", label: "Loading super cepat & hemat kuota di HP", description: "Pengalaman belanja mulus tanpa lemot" },
        ],
        recommendedOptionId: "opt_t4_1",
        isMultiSelect: false,
        inputType: "chips",
      },
      {
        id: "q_retention",
        category: "retention_trigger",
        question: "Apa yang bikin pembeli akan belanja lagi secara berkala?",
        options: [
          { id: "opt_t5_1", label: "Kupon diskon & penawaran gratis ongkir berkala", description: "Insentif menarik untuk order ulang" },
          { id: "opt_t5_2", label: "Kualitas barang sesuai foto & packing rapi", description: "Membangun loyalitas dan review positif" },
          { id: "opt_t5_3", label: "Update koleksi produk baru setiap minggu", description: "Pelanggan penasaran untuk cek barang baru" },
          { id: "opt_t5_4", label: "Riwayat pesanan tersimpan untuk repeat order", description: "Tinggal klik pesan ulang tanpa isi data lagi" },
        ],
        recommendedOptionId: "opt_t5_2",
        isMultiSelect: false,
        inputType: "chips",
      },
    ];
  }

  // 4. POS / Kasir / Resto / Laundry / Salon / Jasa
  if (
    text.includes("kasir") ||
    text.includes("pos") ||
    text.includes("laundry") ||
    text.includes("resto") ||
    text.includes("kafe") ||
    text.includes("cafe") ||
    text.includes("bengkel") ||
    text.includes("klinik")
  ) {
    return [
      {
        id: "q_target_user",
        category: "target_user",
        question: "Siapa operator utama sistem ini dan apa masalah operasional yang paling sering terjadi?",
        options: [
          { id: "opt_p1", label: "Antrian panjang saat jam sibuk toko", description: "Proses catat manual bikin pelanggan menunggu lama" },
          { id: "opt_p2", label: "Selisih uang kas dan laporan di akhir hari", description: "Pencatatan nota kertas rawan hilang atau terselip" },
          { id: "opt_p3", label: "Stok barang/bahan sering habis tanpa disadari", description: "Tidak ada peringatan dini saat stok menipis" },
          { id: "opt_p4", label: "Pelanggan sering menanyakan status pengerjaan", description: "Misal: laundry sudah selesai atau belum" },
        ],
        recommendedOptionId: "opt_p1",
        isMultiSelect: false,
        inputType: "chips",
      },
      {
        id: "q_first_action",
        category: "core_flow",
        question: "Saat kasir atau staf melayani pelanggan, satu hal apa yang harus diselesaikan paling cepat?",
        options: [
          { id: "opt_p2_1", label: "Input transaksi item dalam hitungan detik", description: "Cukup tap layar barang langsung masuk struk" },
          { id: "opt_p2_2", label: "Pilih pembayaran QRIS atau Tunai", description: "Kalkulasi uang kembalian otomatis tanpa salah hitung" },
          { id: "opt_p2_3", label: "Cetak nota / kirim e-receipt ke WhatsApp", description: "Bukti transaksi sah langsung diterima pelanggan" },
          { id: "opt_p2_4", label: "Cek nomor meja atau tracking resi layanan", description: "Memastikan order terhubung ke orang yang tepat" },
        ],
        recommendedOptionId: "opt_p2_1",
        isMultiSelect: false,
        inputType: "chips",
      },
      {
        id: "q_core_features",
        category: "feature_priority",
        question: "Pilih fitur yang paling wajib ada di aplikasi kasir/operasional ini (boleh pilih beberapa):",
        options: [
          { id: "opt_p3_1", label: "Meja Kasir Cepat Touchscreen", description: "Desain tombol besar ramah layar sentuh HP/Tablet" },
          { id: "opt_p3_2", label: "Pembayaran QRIS Dinamis & Tunai", description: "Dukungan berbagai metode bayar non-tunai" },
          { id: "opt_p3_3", label: "Cetak Struk Thermal Bluetooth", description: "Cetak nota kasir instan via printer mini" },
          { id: "opt_p3_4", label: "Manajemen Stok & Notifikasi Habis", description: "Pengurangan stok otomatis setiap ada transaksi" },
          { id: "opt_p3_5", label: "Laporan Omzet & Laba Bersih Harian", description: "Rekap keuangan harian dan bulanan otomatis" },
          { id: "opt_p3_6", label: "Kirim Notifikasi Status ke WhatsApp Pelanggan", description: "Misal: 'Pesanan / Laundry Anda Sudah Selesai'" },
        ],
        recommendedOptionId: "opt_p3_1",
        isMultiSelect: true,
        inputType: "chips",
      },
      {
        id: "q_differentiator",
        category: "value_proposition",
        question: "Apa keunggulan sistem ini dibanding mesin kasir tradisional?",
        options: [
          { id: "opt_p4_1", label: "Bisa diakses dari HP & tablet apa saja", description: "Tidak perlu beli perangkat kasir mahal puluhan juta" },
          { id: "opt_p4_2", label: "Owner bisa pantau omzet realtime dari rumah", description: "Laporan langsung masuk tanpa harus tunggu toko tutup" },
          { id: "opt_p4_3", label: "Anti ribet, kasir baru bisa pakai dalam 5 menit", description: "Antarmuka intuitif tanpa perlu buku panduan tebal" },
          { id: "opt_p4_4", label: "Data aman di cloud tanpa takut harddisk rusak", description: "Riwayat transaksi tersimpan permanen" },
        ],
        recommendedOptionId: "opt_p4_1",
        isMultiSelect: false,
        inputType: "chips",
      },
      {
        id: "q_retention",
        category: "retention_trigger",
        question: "Apa yang bikin pemilik usaha betah menggunakan sistem ini setiap hari?",
        options: [
          { id: "opt_p5_1", label: "Laporan keuangan 100% akurat tanpa selisih", description: "Tutup toko dengan tenang tanpa pusing hitung kas" },
          { id: "opt_p5_2", label: "Operasional toko berjalan jauh lebih cepat", description: "Antrian berkurang dan pelanggan senang" },
          { id: "opt_p5_3", label: "Dukungan teknis cepat & sistem stabil tanpa lag", description: "Sistem tidak pernah macet saat jam ramai" },
          { id: "opt_p5_4", label: "Biaya langganan sangat terjangkau untuk UMKM", description: "Efisiensi tinggi dengan modal minim" },
        ],
        recommendedOptionId: "opt_p5_1",
        isMultiSelect: false,
        inputType: "chips",
      },
    ];
  }

  // 5. Default Universal SaaS / Web App
  return [
    {
      id: "q_target_user",
      category: "target_user",
      question: "Ceritakan seseorang yang paling butuh aplikasi ini. Sekarang mereka ngapain buat mengatasi masalahnya?",
      options: [
        { id: "opt_u1", label: "Proses manual di kertas & chat WhatsApp", description: "Sering lupa dan tidak terorganisir rapi" },
        { id: "opt_u2", label: "Pakai Google Spreadsheet / Excel", description: "Ribet update tiap saat dan tidak otomatis" },
        { id: "opt_u3", label: "Telepon & tanya manual berulang kali", description: "Banyak waktu terbuang untuk konfirmasi" },
        { id: "opt_u4", label: "Belum punya sistem digital sama sekali", description: "Pelanggan sering komplain karena pelayanan lambat" },
      ],
      recommendedOptionId: "opt_u1",
      isMultiSelect: false,
      inputType: "chips",
    },
    {
      id: "q_first_action",
      category: "core_flow",
      question: "Kalau orang buka aplikasi ini pertama kali, satu hal apa yang harus mereka selesaikan sebelum nutup?",
      options: [
        { id: "opt_u2_1", label: "Lihat katalog & data utama yang tersedia", description: "Langsung tahu pilihan dan informasi lengkap" },
        { id: "opt_u2_2", label: "Selesaikan aksi pemesanan / request pertama", description: "Konversi langsung dalam hitungan menit" },
        { id: "opt_u2_3", label: "Cek jadwal & ketersediaan tanggal", description: "Memastikan ketersediaan layanan" },
        { id: "opt_u2_4", label: "Daftar akun / login profil", description: "Menyimpan data identitas awal" },
      ],
      recommendedOptionId: "opt_u2_1",
      isMultiSelect: false,
      inputType: "chips",
    },
    {
      id: "q_core_features",
      category: "feature_priority",
      question: "Pilih 3 fitur yang paling wajib ada di aplikasi ini untuk rilis awal (MVP):",
      options: [
        { id: "opt_u3_1", label: "Katalog & Filter Pencarian Cepat", description: "Cari berdasarkan nama, kategori, dan kriteria" },
        { id: "opt_u3_2", label: "Formulir Booking / Pemesanan Instan", description: "Isi data kebutuhan tanpa berbelit-belit" },
        { id: "opt_u3_3", label: "Kirim Notifikasi ke WhatsApp", description: "Rekap transaksi otomatis terkirim ke WhatsApp" },
        { id: "opt_u3_4", label: "Dashboard Kelola Pesanan & Data Admin", description: "Pantau data masuk dan ubah status" },
        { id: "opt_u3_5", label: "Pembayaran Online QRIS Otomatis", description: "Verifikasi pembayaran otomatis" },
        { id: "opt_u3_6", label: "Laporan & Ekspor Data", description: "Pantau performa dan riwayat aktivitas" },
      ],
      recommendedOptionId: "opt_u3_1",
      isMultiSelect: true,
      inputType: "chips",
    },
    {
      id: "q_differentiator",
      category: "value_proposition",
      question: "Apa yang bikin aplikasi ini lebih enak dipakai dibanding cara biasa saat ini?",
      options: [
        { id: "opt_u4_1", label: "Lebih cepat cari & akses data", description: "Tidak perlu menunggu balasan admin berjam-jam" },
        { id: "opt_u4_2", label: "Informasi & rincian biaya sangat jelas", description: "Transparansi penuh tanpa biaya tersembunyi" },
        { id: "opt_u4_3", label: "Gak perlu repot telepon atau bolak-balik chat", description: "Semua alur tersedia rapi di layar" },
        { id: "opt_u4_4", label: "Bisa diakses langsung dari HP 24 jam", description: "Fleksibilitas akses kapan pun dibutuhkan" },
      ],
      recommendedOptionId: "opt_u4_1",
      isMultiSelect: false,
      inputType: "chips",
    },
    {
      id: "q_retention",
      category: "retention_trigger",
      question: "Apa yang bikin orang akan balik lagi pakai aplikasi ini, bukan cuma coba sekali?",
      options: [
        { id: "opt_u5_1", label: "Proses cepat, anti-ribet, & minim klik", description: "Pengalaman pengguna yang menyenangkan" },
        { id: "opt_u5_2", label: "Layanan konsisten & informasi akurat", description: "Pengguna percaya dan mengandalkan sistem" },
        { id: "opt_u5_3", label: "Riwayat aktivitas tersimpan rapi", description: "Gampang ulangi aksi tanpa input ulang" },
        { id: "opt_u5_4", label: "Promo loyalitas & kemudahan akses", description: "Reward untuk pengguna setia" },
      ],
      recommendedOptionId: "opt_u5_1",
      isMultiSelect: false,
      inputType: "chips",
    },
  ];
}
