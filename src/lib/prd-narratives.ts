import { PRDOutput } from '@/types/prd';
import { resolvePrdTechStack } from '@/components/studio/studio-markdown';

export interface CleanSubFeatureItem {
  name: string;
  description: string;
}

export interface CleanCoreFeaturePhase {
  id: string;
  phaseTitle: string;
  moduleTitle: string;
  moduleSummary: string;
  subFeatures: CleanSubFeatureItem[];
}

export interface UserFlowStep {
  step: number;
  title: string;
  phaseTag: string;
  description: string;
}

export interface ArchitectureOverview {
  intro: string;
  systemComponents: {
    frontend: string;
    backend: string;
    database: string;
    storage: string;
    auth: string;
    reports: string;
  };
  systemFlowchartMermaid: string;
}

export interface CleanRequirements {
  functional: string[];
  nonFunctional: string[];
  assumptionsAndConstraints: string[];
}

/**
 * Membersihkan teks awalan / prefix
 */
function cleanLabel(text: string): string {
  return text.replace(/^[-*•\d.]+\s*/, '').trim();
}

function preserveAcronyms(word: string): string | null {
  const clean = word.replace(/[^a-zA-Z0-9]/g, '');
  if (clean.length >= 2 && clean === clean.toUpperCase() && !/^\d+$/.test(clean)) {
    return word; // e.g. SKU, FEFO, AWB, RBAC, API, CRM, PDF, Excel, HP
  }
  return null;
}

function normalizeTitleText(str: string): string {
  return str
    .split(' ')
    .map((w) => preserveAcronyms(w) || w.toLowerCase())
    .join(' ');
}

/**
 * Menghasilkan susunan Requirements yang bersih, manusiawi, dan terstruktur
 * (Persyaratan Fungsional, Persyaratan Non-Fungsional, Asumsi & Batasan)
 * persis seperti standar Gambar 2 & Gambar 3.
 */
export function generateCleanRequirements(prd: PRDOutput): CleanRequirements {
  const functional: string[] = [];
  const nonFunctional: string[] = [];
  const assumptionsAndConstraints: string[] = [];

  // 1. Persyaratan Fungsional
  if (prd.boundaries?.scope && Array.isArray(prd.boundaries.scope) && prd.boundaries.scope.length > 0) {
    prd.boundaries.scope.forEach((item) => {
      const stripped = item
        .replace(/^\[REQ-[^\]]+\]\s*/i, '')
        .replace(/^REQ-\d+[:\s]*/i, '')
        .replace(/^\[NON-GOAL\]\s*/i, '')
        .replace(/^[-*•\d.]+\s*/, '')
        .trim();

      if (!stripped) return;

      let sentence = stripped;
      const colonIndex = stripped.indexOf(':');
      if (colonIndex > 2 && colonIndex < 40) {
        const titlePart = stripped.substring(0, colonIndex).trim();
        const descPart = stripped.substring(colonIndex + 1).trim();
        const descLower = descPart.toLowerCase();

        if (descLower.startsWith('sistem login') || descLower.startsWith('sistem autentikasi') || descLower.includes('login dengan peran')) {
          const roles = descPart.replace(/.*peran\s*/i, '').replace(/[.):]+$/, '').trim();
          sentence = `Pengguna dapat membuat akun dan login dengan hak akses sesuai peran (${roles}).`;
        } else if (descLower.startsWith('pengguna ') || descLower.startsWith('sistem ')) {
          sentence = descPart.charAt(0).toUpperCase() + descPart.slice(1);
        } else if (descLower.startsWith('pencatatan ') || descLower.startsWith('kelola ') || descLower.startsWith('manajemen ') || descLower.startsWith('penghitungan ')) {
          sentence = `Pengguna dapat melakukan ${descLower}`;
        } else if (descLower.startsWith('alokasi ') || descLower.startsWith('peringatan ') || descLower.startsWith('notifikasi ') || descLower.startsWith('sinkronisasi ')) {
          sentence = `Sistem menyediakan ${descLower}`;
        } else if (descLower.startsWith('portal ') || descLower.startsWith('kalkulator ') || descLower.startsWith('dashboard ') || descLower.startsWith('dasbor ')) {
          sentence = `Pengguna dapat mengakses ${descLower}`;
        } else if (descLower.startsWith('koneksi ') || descLower.startsWith('integrasi ')) {
          sentence = `Sistem terhubung ke ${descPart.replace(/^(koneksi|integrasi)\s*/i, '')}`;
        } else if (descPart.length > 8) {
          sentence = `Pengguna dapat menggunakan fitur ${normalizeTitleText(titlePart)} untuk ${descPart.charAt(0).toLowerCase() + descPart.slice(1)}`;
        }
      } else {
        const lower = stripped.toLowerCase();
        if (!lower.startsWith('pengguna ') && !lower.startsWith('sistem ')) {
          sentence = `Pengguna dapat mengelola ${stripped.charAt(0).toLowerCase() + stripped.slice(1)}`;
        }
      }

      sentence = sentence.replace(/[.;,]+$/, '') + '.';
      functional.push(sentence);
    });
  }

  // Jika functional kosong, ekstrak dari roadmap_tree
  if (functional.length === 0 && prd.roadmap_tree && prd.roadmap_tree.length > 0) {
    prd.roadmap_tree.forEach((node) => {
      const cleanTitle = node.title.replace(/^modul\s*\d*[:\s-]*/i, '').trim();
      functional.push(`Pengguna dapat mengakses modul ${cleanTitle} untuk ${node.description || 'kelancaran alur operasional'}.`);
    });
  }

  // Fallback default jika masih kosong
  if (functional.length === 0) {
    functional.push(
      'Pengguna dapat membuat akun, login/logout, dan mengelola profil toko/gudang.',
      'Pengguna dapat mengelola katalog barang (tambah, ubah, kelompokkan, nonaktifkan).',
      'Sistem mencatat semua pergerakan stok: barang masuk, barang keluar, retur ke supplier, dan retur dari pembeli.',
      'Stok pada dashboard dan katalog otomatis ter-update setiap ada pencatatan masuk/keluar/retur.',
      'Sistem memberi peringatan saat stok suatu barang menipis.',
      'Pengguna dapat melakukan sesi stock opname, memasukkan stok fisik, melihat selisih, dan menyetujui penyesuaian.',
      'Pengguna dapat melihat dan mengunduh laporan (stok terkini & mutasi) dalam format PDF dan Excel, dengan filter periode.'
    );
  }

  // 2. Persyaratan Non-Fungsional
  const audience = prd.archetype_detection?.target_audience || 'pengguna non-teknis';
  const appDomain = prd.title ? prd.title.toLowerCase() : 'sistem';
  const isInventory = appDomain.includes('stok') || appDomain.includes('gudang') || appDomain.includes('inventori');

  nonFunctional.push(
    `Antarmuka sederhana dan ramah untuk ${audience} (sedikit klik, istilah mudah).`,
    'Responsif: nyaman dipakai di laptop maupun HP (banyak pemilik toko banyak memakai HP).',
    `Data ${isInventory ? 'stok' : 'operasional'} hanya bisa diakses oleh pemilik akun (terproteksi login).`,
    'Nota/lampiran tersimpan aman dan bisa dibuka kembali.',
    'Riwayat pencatatan tidak hilang walau barang dinonaktifkan.',
    'Proses simpan pencatatan terasa cepat (< 2 detik) agar tidak mengganggu aktivitas harian.'
  );

  if (prd.risk_management?.fallback_kill_switch) {
    const cleanKill = cleanLabel(prd.risk_management.fallback_kill_switch).replace(/[.;,]+$/, '');
    nonFunctional.push(`Mitigasi operasional: ${cleanKill}.`);
  }

  // 3. Asumsi & Batasan
  const archetype = (prd.archetype_detection?.archetype || '').toLowerCase();
  if (archetype.includes('sekolah') || archetype.includes('edukasi')) {
    assumptionsAndConstraints.push('Skala pengguna: institusi pendidikan/organisasi dengan kapasitas data terpusat.');
  } else {
    assumptionsAndConstraints.push('Skala pengguna: usaha kecil-menengah (jumlah barang dalam ratusan hingga beberapa ribu).');
  }

  assumptionsAndConstraints.push('Satu akun terhubung ke satu toko/gudang pada versi awal.');

  if (prd.boundaries?.non_goals && Array.isArray(prd.boundaries.non_goals) && prd.boundaries.non_goals.length > 0) {
    prd.boundaries.non_goals.forEach((ng) => {
      let clean = ng
        .replace(/^\[NON-GOAL\]\s*/i, '')
        .replace(/^\[OUT-OF-SCOPE\]\s*/i, '')
        .replace(/^[-*•\d.]+\s*/, '')
        .trim();
      if (!clean) return;

      if (clean.toLowerCase().includes('integrasi marketplace')) {
        clean = 'Integrasi marketplace (Shopee/Tokopedia) ditunda untuk fokus pada stabilitas gudang internal.';
      } else if (clean.toLowerCase().includes('akuntansi')) {
        clean = 'Sistem akuntansi keuangan penuh berada di luar lingkup untuk fokus pada operasional gudang.';
      } else if (clean.toLowerCase().includes('mobile app')) {
        clean = 'Fokus pada web responsive untuk workstation sebelum pengembangan mobile app native.';
      } else if (clean.toLowerCase().includes('payroll')) {
        clean = 'Sistem payroll staf berada di luar lingkup operasional sistem ini.';
      } else {
        clean = clean.replace(/[.;,]+$/, '') + '.';
      }

      assumptionsAndConstraints.push(clean);
    });
  }

  assumptionsAndConstraints.push('Bahasa antarmuka Indonesia.');

  const uniqueAssumptions = Array.from(new Set(assumptionsAndConstraints));

  return {
    functional,
    nonFunctional,
    assumptionsAndConstraints: uniqueAssumptions,
  };
}

function deriveSubFeatureExplanation(rawName: string, moduleTitle: string): string {
  const n = rawName.toLowerCase();
  if (n.includes('ringkasan') || n.includes('summary') || n.includes('overview') || n.includes('kondisi')) {
    return 'Menampilkan jumlah jenis data dan ringkasan metrik utama dalam angka besar yang mudah dibaca.';
  }
  if (n.includes('cari') || n.includes('filter') || n.includes('search') || n.includes('temukan')) {
    return 'Menemukan data tertentu dengan cepat lewat pencarian kata kunci atau filter kategori.';
  }
  if (n.includes('peringatan') || n.includes('menipis') || n.includes('alert') || n.includes('kadaluarsa')) {
    return 'Menandai item yang membutuhkan perhatian mendesak agar bisa segera ditindaklanjuti.';
  }
  if (n.includes('grafik') || n.includes('tren') || n.includes('chart') || n.includes('pergerakan')) {
    return 'Menampilkan naik-turunnya pergerakan data dan perputaran aktivitas dari waktu ke waktu.';
  }
  if (n.includes('pilih') || n.includes('katalog') || n.includes('referensi')) {
    return 'Memilih item dari katalog yang sudah terdaftar tanpa perlu mengetik ulang.';
  }
  if (n.includes('jumlah') || n.includes('harga') || n.includes('nominal') || n.includes('biaya')) {
    return 'Memasukkan kuantitas unit beserta parameter harga dan perhitungan otomatis.';
  }
  if (n.includes('nota') || n.includes('foto') || n.includes('lampiran') || n.includes('bukti') || n.includes('video')) {
    return 'Melampirkan berkas bukti dokumentasi fisik untuk mempermudah pengecekan dan audit.';
  }
  if (n.includes('tambah') || n.includes('input') || n.includes('catat') || n.includes('masuk')) {
    return 'Mencatat transaksi entri baru dengan validasi instan agar data bertambah secara akurat.';
  }
  if (n.includes('keluar') || n.includes('jual') || n.includes('pesanan') || n.includes('order')) {
    return 'Mencatat pengurangan atau penyaluran barang agar stok otomatis terpotong.';
  }
  if (n.includes('hitung') || n.includes('opname') || n.includes('fisik') || n.includes('selisih')) {
    return 'Membandingkan hasil hitungan fisik lapangan dengan data sistem untuk mendeteksi selisih.';
  }
  if (n.includes('laporan') || n.includes('unduh') || n.includes('rekap') || n.includes('export')) {
    return 'Menyusun rekapitulasi data periodik dan berkas siap unduh untuk arsip dan pembukuan.';
  }
  if (n.includes('peran') || n.includes('hak akses') || n.includes('auth') || n.includes('login') || n.includes('staf')) {
    return 'Membatasi hak akses menu dan aksi pengguna sesuai dengan tanggung jawab masing-masing.';
  }
  if (n.includes('audit') || n.includes('riwayat') || n.includes('log') || n.includes('jejak')) {
    return 'Merekam riwayat perubahan dan aktivitas operasional untuk menjaga akuntabilitas kerja.';
  }
  return `Mendukung proses operasional ${rawName.toLowerCase()} secara cepat dan sistematis.`;
}

function deriveModuleSummary(moduleTitle: string, userDescription?: string): string {
  if (userDescription && userDescription.trim().length > 10) {
    let cleanDesc = userDescription.trim();
    if (cleanDesc.toLowerCase().startsWith(moduleTitle.toLowerCase())) {
      cleanDesc = cleanDesc.slice(moduleTitle.length).replace(/^[:\s\-—]+/, '').trim();
    }
    return `${moduleTitle} — ${cleanDesc}`;
  }

  const t = moduleTitle.toLowerCase();
  if (t.includes('dashboard') || t.includes('ringkasan')) {
    return `${moduleTitle} — satu layar untuk melihat kondisi dan metrik seluruh operasional sekilas.`;
  }
  if (t.includes('masuk') || t.includes('pencatatan') || t.includes('transaksi') || t.includes('mutasi')) {
    return `${moduleTitle} — mencatat transaksi operasional harian agar data sistem otomatis diperbarui.`;
  }
  if (t.includes('katalog') || t.includes('barang') || t.includes('produk') || t.includes('kategori')) {
    return `${moduleTitle} — mengelola data master item dan kategori sebagai pusat acuan operasional.`;
  }
  if (t.includes('opname') || t.includes('akurasi') || t.includes('hitung')) {
    return `${moduleTitle} — verifikasi fisik periodik untuk mencocokkan stok nyata dengan data sistem.`;
  }
  if (t.includes('laporan') || t.includes('pelaporan') || t.includes('analisis') || t.includes('rekap')) {
    return `${moduleTitle} — menyajikan rekapitulasi performa bisnis dan cetak berkas laporan siap pakai.`;
  }
  if (t.includes('akun') || t.includes('keamanan') || t.includes('staf') || t.includes('autentikasi')) {
    return `${moduleTitle} — perlindungan akses, tata kelola wewenang peran staf, dan pencatatan audit.`;
  }
  return `${moduleTitle} — modul operasional terpadu untuk memfasilitasi kebutuhan ${t}.`;
}

function derivePhaseTitle(idx: number, rawPhase: string | undefined, moduleTitle: string): string {
  const cleanTitle = moduleTitle.replace(/^modul\s*\d*[:\s-]*/i, '').trim();

  if (rawPhase && rawPhase.includes('—')) {
    return `${rawPhase}: ${cleanTitle}`;
  }

  const phaseNum = idx + 1;
  if (phaseNum === 1) return `Fase 1 — Fondasi: ${cleanTitle}`;
  if (phaseNum === 2) return `Fase 2 — Pencatatan Harian & Katalog: ${cleanTitle}`;
  if (phaseNum === 3) return `Fase 3 — Akurasi & Pelaporan: ${cleanTitle}`;
  if (phaseNum === 4) return `Fase 4 — Akun & Keamanan: ${cleanTitle}`;
  return `Fase ${phaseNum} — Pengembangan Lanjutan: ${cleanTitle}`;
}

/**
 * Menghasilkan susunan Core Features yang bersih, manusiawi, dan terorganisir per fase,
 * persis sesuai dengan tampilan elegan pada gambar referensi.
 */
export function generateCleanCoreFeatures(prd: PRDOutput): CleanCoreFeaturePhase[] {
  const phases: CleanCoreFeaturePhase[] = [];

  // 1. Prioritas Utama: Ekstraksi dari roadmap_tree
  if (prd.roadmap_tree && prd.roadmap_tree.length > 0) {
    prd.roadmap_tree.forEach((node, idx) => {
      const cleanModuleTitle = node.title.replace(/^modul\s*\d*[:\s-]*/i, '').trim() || `Modul ${idx + 1}`;
      const phaseTitle = derivePhaseTitle(idx, node.phase, cleanModuleTitle);
      const moduleSummary = deriveModuleSummary(cleanModuleTitle, node.description);

      const subFeatures: CleanSubFeatureItem[] = [];
      const rawSubs = Array.isArray(node.sub_features) ? node.sub_features : [];

      rawSubs.forEach((s) => {
        let subName = '';
        let subDesc = '';
        if (typeof s === 'string') {
          const cleanStr = cleanLabel(s);
          const splitDash = cleanStr.split(/\s+[—–-]\s+/);
          if (splitDash.length >= 2) {
            subName = splitDash[0].trim();
            subDesc = splitDash.slice(1).join(' — ').trim();
          } else {
            subName = cleanStr;
            subDesc = deriveSubFeatureExplanation(subName, cleanModuleTitle);
          }
        } else if (s && typeof s === 'object') {
          subName = (s.label || (s as any).name || '').trim();
          subDesc = (s as any).description || deriveSubFeatureExplanation(subName, cleanModuleTitle);
        }

        if (subName) {
          subFeatures.push({ name: subName, description: subDesc });
        }
      });

      // Jika sub-features kosong, cari dari feature_breakdown yang cocok
      if (subFeatures.length === 0 && prd.feature_breakdown) {
        const matchingFeat = prd.feature_breakdown.find(
          (f) => f.name.toLowerCase().includes(cleanModuleTitle.toLowerCase()) || cleanModuleTitle.toLowerCase().includes(f.name.toLowerCase())
        );
        if (matchingFeat?.happy_path && matchingFeat.happy_path.length > 0) {
          matchingFeat.happy_path.slice(0, 4).forEach((hp) => {
            const cleanHp = cleanLabel(hp);
            subFeatures.push({
              name: cleanHp.slice(0, 30),
              description: cleanHp,
            });
          });
        }
      }

      phases.push({
        id: node.id || `feature-phase-${idx + 1}`,
        phaseTitle,
        moduleTitle: cleanModuleTitle,
        moduleSummary,
        subFeatures,
      });
    });

    return phases;
  }

  // 2. Fallback: Ekstraksi dari feature_breakdown
  if (prd.feature_breakdown && prd.feature_breakdown.length > 0) {
    prd.feature_breakdown.forEach((feat, idx) => {
      const cleanTitle = feat.name.replace(/^modul\s*\d*[:\s-]*/i, '').trim();
      const phaseTitle = derivePhaseTitle(idx, feat.priority === 'P0' ? `Fase ${idx < 2 ? 1 : 2}` : 'Fase 3', cleanTitle);
      const moduleSummary = deriveModuleSummary(cleanTitle, feat.user_story);

      const subFeatures: CleanSubFeatureItem[] = [];
      if (feat.happy_path && feat.happy_path.length > 0) {
        feat.happy_path.forEach((hp) => {
          const cleanHp = cleanLabel(hp);
          const split = cleanHp.split(/\s+[—–-]\s+/);
          if (split.length >= 2) {
            subFeatures.push({ name: split[0].trim(), description: split.slice(1).join(' — ').trim() });
          } else {
            subFeatures.push({ name: cleanHp.slice(0, 28), description: cleanHp });
          }
        });
      }

      phases.push({
        id: feat.id || `feature-phase-${idx + 1}`,
        phaseTitle,
        moduleTitle: cleanTitle,
        moduleSummary,
        subFeatures,
      });
    });

    return phases;
  }

  // 3. Fallback Sintesis Default jika belum ada data modul
  return [
    {
      id: 'feature-phase-1',
      phaseTitle: 'Fase 1 — Fondasi: Dashboard Stok',
      moduleTitle: 'Dashboard Stok',
      moduleSummary: 'Dashboard Stok — satu layar untuk melihat kondisi seluruh stok sekilas.',
      subFeatures: [
        { name: 'Ringkasan Stok', description: 'Menampilkan jumlah jenis barang dan total nilai stok dalam angka besar yang mudah dibaca.' },
        { name: 'Cari & Filter Barang', description: 'Menemukan barang tertentu dengan cepat lewat pencarian atau filter kategori.' },
        { name: 'Peringatan Stok Menipis', description: 'Menandai barang yang hampir habis agar bisa segera ditambah.' },
        { name: 'Grafik Pergerakan Stok', description: 'Menampilkan naik-turunnya barang masuk dan keluar dalam beberapa hari terakhir.' },
      ],
    },
    {
      id: 'feature-phase-2',
      phaseTitle: 'Fase 2 — Pencatatan Harian & Katalog',
      moduleTitle: 'Catat Barang Masuk',
      moduleSummary: 'Catat Barang Masuk — mencatat barang yang datang agar stok otomatis bertambah.',
      subFeatures: [
        { name: 'Pilih Barang', description: 'Memilih barang dari katalog tanpa perlu ketik ulang.' },
        { name: 'Isi Jumlah & Harga', description: 'Memasukkan jumlah barang datang beserta harga belinya.' },
        { name: 'Catatan & Foto Nota', description: 'Menyimpan nomor surat jalan atau foto nota fisik sebagai bukti.' },
      ],
    },
  ];
}

/**
 * Menghasilkan User Flow naratif terstruktur mengikuti urutan fase modul,
 * persis seperti standar spesifikasi produk level tinggi (tanpa diagram Mermaid rumit).
 */
export function generateDynamicUserFlowSteps(prd: PRDOutput): UserFlowStep[] {
  const steps: UserFlowStep[] = [];
  const appTitle = prd.title || 'Aplikasi';
  const targetAudience = prd.archetype_detection?.target_audience || 'Pengguna';

  // 1. Ambil modul-modul berfase jika tersedia
  if (prd.roadmap_tree && prd.roadmap_tree.length > 0) {
    let stepCount = 1;

    // Cek apakah ada modul Auth / Akun di dalam roadmap tree
    const authNode = prd.roadmap_tree.find(
      (n) =>
        n.title.toLowerCase().includes('autentikasi') ||
        n.title.toLowerCase().includes('akun') ||
        n.title.toLowerCase().includes('login') ||
        n.title.toLowerCase().includes('keamanan')
    );

    const authPhase = authNode?.phase || 'Fase 1';

    // Langkah 1: Registrasi & Akses Awal (Pondasi Akses)
    steps.push({
      step: stepCount++,
      title: 'Daftar & Masuk',
      phaseTag: `${authPhase} – tersedia lebih awal sebagai pondasi akses`,
      description: `Pengguna (${targetAudience}) membuat akun, lalu login ke dalam sistem. Setelah berhasil masuk, pengguna melengkapi profil awal dan preferensi toko/organisasi yang akan menjadi identitas pada seluruh laporan dan transaksi ${appTitle}.`,
    });

    // Langkah-langkah modul fungsional berikutnya
    prd.roadmap_tree.forEach((node) => {
      // Jika modul ini adalah modul auth murni yang sudah diwakili di langkah 1, jadikan langkah pengaturan profil
      const isAuthModule =
        node.title.toLowerCase().includes('autentikasi') ||
        node.title.toLowerCase().includes('login') ||
        (node.title.toLowerCase().includes('akun') && !node.title.toLowerCase().includes('manajemen'));

      if (isAuthModule && steps.length > 1) {
        return;
      }

      const subs = (node.sub_features || [])
        .map((s) => (typeof s === 'string' ? cleanLabel(s) : cleanLabel(s.label || '')))
        .filter(Boolean);

      const matchingFeat = prd.feature_breakdown?.find(
        (f) =>
          f.id === node.id ||
          f.name.toLowerCase().includes(node.title.toLowerCase()) ||
          node.title.toLowerCase().includes(f.name.toLowerCase())
      );

      // Tentukan kata kerja judul alur
      const titleLower = node.title.toLowerCase();
      let actionTitle = node.title;
      if (titleLower.includes('katalog') || titleLower.includes('master') || titleLower.includes('data')) {
        actionTitle = `Siapkan ${node.title}`;
      } else if (titleLower.includes('masuk') || titleLower.includes('transaksi') || titleLower.includes('pencatatan') || titleLower.includes('order')) {
        actionTitle = `Catat & Proses ${node.title}`;
      } else if (titleLower.includes('dashboard') || titleLower.includes('pantau') || titleLower.includes('monitoring')) {
        actionTitle = `Pantau ${node.title}`;
      } else if (titleLower.includes('laporan') || titleLower.includes('rekap') || titleLower.includes('audit')) {
        actionTitle = `Tinjau & Ekspor ${node.title}`;
      } else if (titleLower.includes('profil') || titleLower.includes('pengaturan') || titleLower.includes('keamanan')) {
        actionTitle = `Kelola ${node.title}`;
      }

      // Tentukan tag fase: tandai "first win" untuk modul operasional MVP utama
      let phaseTag = node.phase || 'Fase 2';
      if (
        stepCount === 3 ||
        titleLower.includes('masuk') ||
        titleLower.includes('transaksi') ||
        titleLower.includes('order') ||
        titleLower.includes('first win')
      ) {
        if (!steps.some((s) => s.phaseTag.includes('first win'))) {
          phaseTag = `${node.phase || 'Fase 2'} – first win`;
        }
      }

      // Bangun deskripsi alur konkret
      let desc = '';
      if (matchingFeat?.happy_path && matchingFeat.happy_path.length > 0) {
        const cleanSteps = matchingFeat.happy_path.slice(0, 3).map((st) => cleanLabel(st));
        desc = `Saat mengakses halaman **${node.title}**, pengguna ${cleanSteps.join(', kemudian ')}. Seluruh data tervalidasi dan langsung tersinkronisasi ke database.`;
      } else if (subs.length > 0) {
        desc = `Pengguna membuka halaman **${node.title}** untuk mengelola fitur **${subs[0]}**${
          subs[1] ? ` dan **${subs[1]}**` : ''
        }. Pengguna memasukkan parameter yang dibutuhkan, lalu sistem memvalidasi kelengkapan data dan memperbarui status secara realtime.`;
      } else {
        desc = `Pengguna menjalankan alur operasional pada modul **${node.title}**, memeriksa data terkini, dan mengeksekusi aksi yang dibutuhkan untuk menjaga kelancaran alur kerja ${appTitle}.`;
      }

      steps.push({
        step: stepCount++,
        title: actionTitle,
        phaseTag,
        description: desc,
      });
    });

    return steps;
  }

  // 2. Fallback: Ekstraksi dari feature_breakdown
  if (prd.feature_breakdown && prd.feature_breakdown.length > 0) {
    let stepCount = 1;
    steps.push({
      step: stepCount++,
      title: 'Daftar & Masuk',
      phaseTag: 'Fase 1 – pondasi akses',
      description: `Pengguna membuat akun, lalu login ke aplikasi ${appTitle}. Setelah masuk, pengguna mengisi konfigurasi profil dasar dan preferensi kerja.`,
    });

    prd.feature_breakdown.forEach((feat, idx) => {
      const phaseTag = feat.priority === 'P0' ? (idx === 0 ? 'Fase 2 – first win' : 'Fase 2') : 'Fase 3';
      let desc = `Pengguna mengakses halaman **${feat.name}**. ${feat.user_story}`;
      if (feat.happy_path && feat.happy_path.length > 0) {
        desc += ` Alur meliputi: ${feat.happy_path.slice(0, 2).map((s) => cleanLabel(s)).join(', lalu ')}.`;
      }
      steps.push({
        step: stepCount++,
        title: feat.name,
        phaseTag,
        description: desc,
      });
    });

    return steps;
  }

  // 3. Fallback Umum Standar Industri
  return [
    {
      step: 1,
      title: 'Daftar & Masuk',
      phaseTag: 'Fase 1 – pondasi akses',
      description: `Pengguna membuat akun baru dan melakukan autentikasi login. Setelah masuk, pengguna melengkapi profil identitas toko/organisasi pada ${appTitle}.`,
    },
    {
      step: 2,
      title: 'Siapkan Master Data & Katalog',
      phaseTag: 'Fase 2',
      description: 'Pengguna menginput data referensi awal, kategori item, harga, dan parameter konfigurasi operasional.',
    },
    {
      step: 3,
      title: 'Pencatatan Operasional Harian',
      phaseTag: 'Fase 2 – first win',
      description: 'Pengguna mencatat transaksi atau entri data aktif harian. Sistem langsung memvalidasi input dan memperbarui status secara instan.',
    },
    {
      step: 4,
      title: 'Pantau Dashboard & Laporan',
      phaseTag: 'Fase 3',
      description: 'Pengguna membuka dashboard untuk melihat analitik pergerakan data, memeriksa notifikasi peringatan, dan mengunduh berkas laporan rekapitulasi.',
    },
  ];
}

/**
 * Menghasilkan ringkasan arsitektur (teks narasi dan komponen sistem)
 * sesuai tata letak elegan pada gambar referensi.
 */
export function generateArchitectureOverview(prd: PRDOutput): ArchitectureOverview {
  const resolvedStack = resolvePrdTechStack(prd);
  const targetAudience = prd.archetype_detection?.target_audience || 'Pengguna / Pelaku Usaha';

  // Ekstraksi nama-nama modul halaman
  const moduleNames: string[] = [];
  if (prd.roadmap_tree && prd.roadmap_tree.length > 0) {
    prd.roadmap_tree.forEach((n) => {
      const clean = n.title.replace(/^modul\s*\d*[:\s-]*/i, '').trim();
      if (clean && !moduleNames.includes(clean)) {
        moduleNames.push(clean.toLowerCase());
      }
    });
  } else if (prd.feature_breakdown && prd.feature_breakdown.length > 0) {
    prd.feature_breakdown.forEach((f) => {
      if (f.name && !moduleNames.includes(f.name.toLowerCase())) {
        moduleNames.push(f.name.toLowerCase());
      }
    });
  }

  const moduleDisplayList =
    moduleNames.length > 0
      ? moduleNames.slice(0, 5).join(', ')
      : 'dashboard, katalog data, formulir pencatatan, dan laporan';

  // Ekstraksi nama tabel database dari tech_mapping
  const detectedTables: string[] = [];
  if (prd.feature_breakdown) {
    prd.feature_breakdown.forEach((f) => {
      if (f.tech_mapping?.db_tables && Array.isArray(f.tech_mapping.db_tables)) {
        f.tech_mapping.db_tables.forEach((t) => {
          const clean = t.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
          if (clean && !detectedTables.includes(clean)) {
            detectedTables.push(clean);
          }
        });
      }
    });
  }

  const tablesDisplayList =
    detectedTables.length > 0
      ? detectedTables.slice(0, 6).join(', ')
      : 'akun pengguna, profil organisasi, entitas katalog, pergerakan data, dan riwayat audit';

  const intro =
    'Aplikasi dibangun sebagai aplikasi web full stack dalam satu proyek. Bagian antarmuka (yang dilihat pengguna) dan bagian logika server dijalankan dalam satu kerangka kerja, sehingga lebih sederhana untuk dikembangkan dan dipelihara oleh tim kecil.';

  const systemComponents = {
    frontend: `Halaman web responsif yang menampilkan ${moduleDisplayList}.`,
    backend:
      'Menangani aturan bisnis — penambahan/pengurangan data otomatis, validasi skema Zod, otorisasi sesi, dan penyusunan laporan.',
    database: `Menyimpan data ${tablesDisplayList}.`,
    storage: 'Menyimpan berkas lampiran, nota bukti fisik (foto/file), dan aset statis.',
    auth: 'Mengatur pendaftaran akun, login/logout sesi aman (session cookies), dan ganti kata sandi.',
    reports: 'Membuat berkas PDF dan Excel dari data yang sudah difilter serta integrasi notifikasi.',
  };

  // Bangun Mermaid diagram alur sistem yang bersih dan vertikal (flowchart TD)
  const safeAudience = targetAudience.replace(/["'[\]]/g, '').slice(0, 35);
  const cleanFrontendTech = resolvedStack.frontend.split(',')[0].trim() || 'Next.js 16 + Tailwind CSS';
  const cleanDbTech = resolvedStack.database.split('(')[0].trim() || 'PostgreSQL / Supabase';

  const actionKeywords =
    moduleNames.length > 0
      ? moduleNames.slice(0, 4).join(', ')
      : 'stok, katalog, opname, laporan';

  const systemFlowchartMermaid = `flowchart TD
  User["Pengguna - ${safeAudience}"]
  User -->|Buka di browser| WebUI["Antarmuka Web - ${cleanFrontendTech}"]
  
  WebUI -->|Daftar / Login / Ganti Sandi| Auth["Layanan Autentikasi"]
  Auth --> DB[("Basis Data - ${cleanDbTech}")]
  
  WebUI -->|Aksi ${actionKeywords}| Server["Logika Server - Server Actions / API Route"]
  Server -->|Query & Mutasi Data| DB
  Server -->|Simpan nota & lampiran| Storage["Penyimpanan File"]
  Server -->|Minta laporan PDF & Excel| Reporter["Generator Laporan"]
  Reporter -->|File siap unduh| WebUI`;

  return {
    intro,
    systemComponents,
    systemFlowchartMermaid,
  };
}

export interface DatabaseColumnDef {
  name: string;
  type: string;
  purpose: string;
}

export interface DatabaseTableDef {
  number: number;
  name: string;
  description: string;
  columns: DatabaseColumnDef[];
}

export interface DatabaseSchemaDictionary {
  intro: string;
  tables: DatabaseTableDef[];
  erdDiagram: string;
  rawSqlMigration: string;
}

function getTableDescription(rawTableName: string): string {
  const t = rawTableName.toLowerCase().trim();
  if (t === 'users') return 'data akun pengguna (dikelola sistem autentikasi / Supabase Auth)';
  if (t === 'sessions') return 'sesi login aktif (dikelola sistem autentikasi)';
  if (t === 'stores' || t === 'warung' || t === 'toko' || t === 'gudang') return 'profil warung/toko';
  if (t === 'categories' || t === 'kategori') return 'kelompok/kategori barang';
  if (t === 'products' || t === 'items' || t === 'barang') return 'katalog barang dagangan';
  if (t === 'stock_movements' || t === 'mutasi_stok') return 'catatan riwayat barang masuk & keluar';
  if (t === 'opname_sessions' || t === 'stok_opname') return 'sesi hitung stok fisik mingguan';
  if (t === 'opname_items' || t === 'opname_details') return 'rincian hasil hitung fisik dan selisih per item';
  if (t === 'orders' || t === 'transactions' || t === 'pesanan') return 'transaksi pesanan penjualan';
  if (t === 'order_items' || t === 'order_details') return 'rincian barang dalam tiap transaksi pesanan';
  if (t === 'customers' || t === 'pelanggan') return 'data master pelanggan';
  if (t === 'batch_lots' || t === 'lots' || t === 'batches') return 'kelompok batch masa kadaluarsa (FEFO)';
  if (t === 'returns' || t === 'retur') return 'pengajuan retur barang dari pelanggan';
  if (t === 'return_videos' || t === 'bukti_retur') return 'lampiran video unboxing bukti komplain retur';
  if (t === 'notifications' || t === 'notifikasi') return 'log notifikasi peringatan & pesan WhatsApp';
  if (t === 'audit_logs') return 'rekam jejak aktivitas audit sistem';
  return `data ${t.replace(/_/g, ' ')}`;
}

function getColumnPurpose(rawCol: string, rawTable: string): string {
  const c = rawCol.toLowerCase().replace(/[^a-z0-9_]/g, '');
  const t = rawTable.toLowerCase().replace(/[^a-z0-9_]/g, '');

  if (c === 'id') {
    if (t === 'users') return 'ID unik akun';
    if (t === 'sessions') return 'ID unik sesi';
    if (t === 'stores' || t === 'warung' || t === 'toko') return 'ID unik toko';
    if (t === 'categories') return 'ID unik kategori';
    if (t === 'products') return 'ID unik barang';
    if (t === 'stock_movements') return 'ID unik mutasi';
    if (t === 'opname_sessions') return 'ID unik sesi opname';
    if (t === 'opname_items') return 'ID unik item opname';
    if (t === 'orders') return 'ID unik pesanan';
    if (t === 'order_items') return 'ID unik item pesanan';
    if (t === 'customers') return 'ID unik pelanggan';
    if (t === 'returns') return 'ID unik retur';
    return `ID unik ${t.replace(/_/g, ' ')}`;
  }

  if (c === 'user_id') return 'Relasi ke users (pemilik/pengguna)';
  if (c === 'store_id') return 'Relasi ke stores';
  if (c === 'category_id') return 'Relasi ke categories';
  if (c === 'product_id') return 'Relasi ke products';
  if (c === 'order_id') return 'Relasi ke orders';
  if (c === 'session_id') return 'Relasi ke sessions / opname_sessions';
  if (c === 'customer_id') return 'Relasi ke customers';
  if (c === 'batch_id' || c === 'lot_id') return 'Relasi ke batch_lots (FEFO)';
  if (c === 'return_id') return 'Relasi ke returns';

  if (c === 'name' || c === 'nama') {
    if (t.includes('user')) return 'Nama pengguna';
    if (t.includes('store') || t.includes('toko') || t.includes('warung')) return 'Nama warung';
    if (t.includes('categor') || t.includes('kategori')) return 'Nama kategori (mis. Minuman)';
    if (t.includes('product') || t.includes('item') || t.includes('barang')) return 'Nama barang';
    if (t.includes('customer') || t.includes('pelanggan')) return 'Nama pelanggan';
    return `Nama ${t.replace(/_/g, ' ')}`;
  }

  if (c === 'email') return 'Email untuk login (unik)';
  if (c === 'email_verified') return 'Status verifikasi email';
  if (c === 'image' || c === 'image_url' || c === 'avatar_url' || c === 'foto') return 'Foto profil (opsional)';
  if (c === 'video_url' || c === 'video') return 'Tautan video unboxing rekaman bukti retur';
  if (c === 'address' || c === 'alamat') return 'Alamat fisik toko';
  if (c === 'phone' || c === 'phone_number' || c === 'telepon' || c === 'no_hp') return 'Nomor WhatsApp aktif';
  if (c === 'price' || c === 'harga') return 'Harga barang';
  if (c === 'cost_price' || c === 'harga_beli') return 'Harga beli modal';
  if (c === 'min_stock' || c === 'stok_minimum') return 'Batas stok menipis';
  if (c === 'stock_qty' || c === 'stock' || c === 'stok') return 'Jumlah stok tersedia';
  if (c === 'system_qty' || c === 'stok_sistem') return 'Jumlah menurut sistem';
  if (c === 'physical_qty' || c === 'stok_fisik') return 'Jumlah hasil hitung fisik';
  if (c === 'difference' || c === 'selisih') return 'Selisih (fisik - sistem)';
  if (c === 'adjustment_applied' || c === 'disetujui') return 'Apakah penyesuaian sudah disetujui';
  if (c === 'quantity' || c === 'qty' || c === 'jumlah') return 'Jumlah barang masuk / keluar';
  if (c === 'total_amount' || c === 'total_harga' || c === 'total') return 'Total nilai transaksi';
  if (c === 'payment_method' || c === 'metode_bayar') return 'Metode pembayaran';
  if (c === 'notes' || c === 'catatan' || c === 'keterangan') return 'Keterangan atau foto nota lampiran';
  if (c === 'reason' || c === 'alasan') return 'Alasan pengajuan retur';
  if (c === 'status') return 'Status operasional (draft / selesai)';
  if (c === 'role' || c === 'peran') return 'Peran: admin (pemilik) atau staff';
  if (c === 'token') return 'Token sesi login unik';
  if (c === 'expires_at' || c === 'kadaluarsa' || c === 'expiry_date') return 'Tanggal masa kadaluarsa (FEFO)';
  if (c === 'batch_number' || c === 'lot_number') return 'Nomor batch produksi';
  if (c === 'tracking_number' || c === 'resi') return 'Nomor resi pengiriman logistik';
  if (c === 'is_read') return 'Status apakah notifikasi sudah dibaca';
  if (c === 'created_at') return 'Waktu dibuat';
  if (c === 'updated_at') return 'Waktu terakhir diperbarui';

  return `Data ${c.replace(/_/g, ' ')}`;
}

function normalizeColumnType(raw: string): string {
  const t = raw.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (t === 'uuid' || t === 'string' || t === 'varchar' || t === 'text') return 'text';
  if (t === 'int' || t === 'integer' || t === 'bigint' || t === 'smallint') return 'integer';
  if (t === 'bool' || t === 'boolean') return 'boolean';
  if (t === 'datetime' || t === 'timestamp' || t === 'timestamptz' || t === 'date') return 'timestamp';
  if (t === 'numeric' || t === 'decimal' || t === 'float' || t === 'double' || t === 'real') return 'numeric';
  if (t === 'json' || t === 'jsonb') return 'json';
  return 'text';
}

function synthesizeDefaultColumnsForTable(tableName: string): DatabaseColumnDef[] {
  const t = tableName.toLowerCase();
  const cols: DatabaseColumnDef[] = [
    { name: 'id', type: 'text', purpose: getColumnPurpose('id', t) },
  ];

  if (t === 'users') {
    cols.push(
      { name: 'name', type: 'text', purpose: 'Nama pengguna' },
      { name: 'email', type: 'text', purpose: 'Email untuk login (unik)' },
      { name: 'email_verified', type: 'boolean', purpose: 'Status verifikasi email' },
      { name: 'image', type: 'text', purpose: 'Foto profil (opsional)' },
      { name: 'created_at', type: 'timestamp', purpose: 'Waktu akun dibuat' }
    );
    return cols;
  }

  if (t === 'sessions') {
    cols.push(
      { name: 'user_id', type: 'text', purpose: 'Relasi ke users' },
      { name: 'token', type: 'text', purpose: 'Token sesi login unik' },
      { name: 'expires_at', type: 'timestamp', purpose: 'Waktu sesi kadaluarsa' },
      { name: 'created_at', type: 'timestamp', purpose: 'Waktu dibuat' }
    );
    return cols;
  }

  if (t === 'stores' || t === 'warung' || t === 'toko') {
    cols.push(
      { name: 'user_id', type: 'text', purpose: 'Relasi ke users (pemilik)' },
      { name: 'name', type: 'text', purpose: 'Nama warung' },
      { name: 'phone', type: 'text', purpose: 'Nomor WhatsApp aktif' },
      { name: 'address', type: 'text', purpose: 'Alamat fisik toko' },
      { name: 'created_at', type: 'timestamp', purpose: 'Waktu toko didaftarkan' }
    );
    return cols;
  }

  if (t === 'categories') {
    cols.push(
      { name: 'store_id', type: 'text', purpose: 'Relasi ke stores' },
      { name: 'name', type: 'text', purpose: 'Nama kategori (mis. Minuman)' },
      { name: 'created_at', type: 'timestamp', purpose: 'Waktu dibuat' }
    );
    return cols;
  }

  if (t === 'products') {
    cols.push(
      { name: 'store_id', type: 'text', purpose: 'Relasi ke stores' },
      { name: 'category_id', type: 'text', purpose: 'Relasi ke categories' },
      { name: 'name', type: 'text', purpose: 'Nama barang' },
      { name: 'price', type: 'numeric', purpose: 'Harga barang' },
      { name: 'min_stock', type: 'integer', purpose: 'Batas stok menipis' },
      { name: 'created_at', type: 'timestamp', purpose: 'Waktu dibuat' }
    );
    return cols;
  }

  if (t === 'stock_movements') {
    cols.push(
      { name: 'store_id', type: 'text', purpose: 'Relasi ke stores' },
      { name: 'product_id', type: 'text', purpose: 'Relasi ke products' },
      { name: 'quantity', type: 'integer', purpose: 'Jumlah barang masuk / keluar' },
      { name: 'notes', type: 'text', purpose: 'Keterangan atau foto nota lampiran' },
      { name: 'created_at', type: 'timestamp', purpose: 'Waktu pencatatan' }
    );
    return cols;
  }

  if (t === 'opname_sessions') {
    cols.push(
      { name: 'store_id', type: 'text', purpose: 'Relasi ke stores' },
      { name: 'status', type: 'text', purpose: 'Status sesi (draft / selesai)' },
      { name: 'created_at', type: 'timestamp', purpose: 'Waktu diselenggarakan' }
    );
    return cols;
  }

  if (t === 'opname_items') {
    cols.push(
      { name: 'session_id', type: 'text', purpose: 'Relasi ke opname_sessions' },
      { name: 'product_id', type: 'text', purpose: 'Relasi ke products' },
      { name: 'system_qty', type: 'integer', purpose: 'Jumlah menurut sistem' },
      { name: 'physical_qty', type: 'integer', purpose: 'Jumlah hasil hitung fisik' },
      { name: 'difference', type: 'integer', purpose: 'Selisih (fisik - sistem)' },
      { name: 'adjustment_applied', type: 'boolean', purpose: 'Apakah penyesuaian sudah disetujui' }
    );
    return cols;
  }

  if (t === 'orders') {
    cols.push(
      { name: 'user_id', type: 'text', purpose: 'Relasi ke users' },
      { name: 'customer_id', type: 'text', purpose: 'Relasi ke customers' },
      { name: 'total_amount', type: 'numeric', purpose: 'Total nilai transaksi' },
      { name: 'status', type: 'text', purpose: 'Status pesanan' },
      { name: 'payment_method', type: 'text', purpose: 'Metode pembayaran' },
      { name: 'created_at', type: 'timestamp', purpose: 'Waktu dibuat' }
    );
    return cols;
  }

  if (t === 'order_items') {
    cols.push(
      { name: 'order_id', type: 'text', purpose: 'Relasi ke orders' },
      { name: 'product_id', type: 'text', purpose: 'Relasi ke products' },
      { name: 'quantity', type: 'integer', purpose: 'Jumlah barang' },
      { name: 'price', type: 'numeric', purpose: 'Harga saat transaksi' },
      { name: 'created_at', type: 'timestamp', purpose: 'Waktu dibuat' }
    );
    return cols;
  }

  if (t === 'customers') {
    cols.push(
      { name: 'user_id', type: 'text', purpose: 'Relasi ke users' },
      { name: 'name', type: 'text', purpose: 'Nama pelanggan' },
      { name: 'phone', type: 'text', purpose: 'Nomor WhatsApp aktif' },
      { name: 'address', type: 'text', purpose: 'Alamat fisik' },
      { name: 'created_at', type: 'timestamp', purpose: 'Waktu dibuat' }
    );
    return cols;
  }

  if (t === 'batch_lots') {
    cols.push(
      { name: 'product_id', type: 'text', purpose: 'Relasi ke products' },
      { name: 'batch_number', type: 'text', purpose: 'Nomor batch produksi' },
      { name: 'expiry_date', type: 'timestamp', purpose: 'Tanggal masa kadaluarsa (FEFO)' },
      { name: 'stock_qty', type: 'integer', purpose: 'Jumlah stok tersedia' },
      { name: 'created_at', type: 'timestamp', purpose: 'Waktu dibuat' }
    );
    return cols;
  }

  if (t === 'returns') {
    cols.push(
      { name: 'order_id', type: 'text', purpose: 'Relasi ke orders' },
      { name: 'user_id', type: 'text', purpose: 'Relasi ke users' },
      { name: 'reason', type: 'text', purpose: 'Alasan pengajuan retur' },
      { name: 'status', type: 'text', purpose: 'Status pengajuan (diajukan/disetujui/ditolak)' },
      { name: 'created_at', type: 'timestamp', purpose: 'Waktu pengajuan' }
    );
    return cols;
  }

  if (t === 'return_videos') {
    cols.push(
      { name: 'return_id', type: 'text', purpose: 'Relasi ke returns' },
      { name: 'video_url', type: 'text', purpose: 'Tautan video unboxing rekaman bukti retur' },
      { name: 'notes', type: 'text', purpose: 'Catatan kondisi barang' },
      { name: 'created_at', type: 'timestamp', purpose: 'Waktu diunggah' }
    );
    return cols;
  }

  if (t === 'notifications') {
    cols.push(
      { name: 'user_id', type: 'text', purpose: 'Relasi ke users' },
      { name: 'name', type: 'text', purpose: 'Judul notifikasi' },
      { name: 'notes', type: 'text', purpose: 'Isi pesan WhatsApp / notifikasi' },
      { name: 'is_read', type: 'boolean', purpose: 'Status apakah notifikasi sudah dibaca' },
      { name: 'created_at', type: 'timestamp', purpose: 'Waktu dikirim' }
    );
    return cols;
  }

  // Default fallback for any other table
  cols.push(
    { name: 'user_id', type: 'text', purpose: 'Relasi ke users' },
    { name: 'name', type: 'text', purpose: `Nama atau judul entitas ${t}` },
    { name: 'status', type: 'text', purpose: 'Status operasional' },
    { name: 'created_at', type: 'timestamp', purpose: 'Waktu dibuat' }
  );
  return cols;
}

/**
 * Menghasilkan kamus skema database terstruktur (Data Dictionary)
 * beserta diagram relasi antar tabel (ER) yang bersih dan dinamis tanpa skrip SQL mentah.
 */
export function generateDatabaseSchemaDictionary(prd: PRDOutput): DatabaseSchemaDictionary {
  const intro =
    'Berikut tabel-tabel utama yang dibutuhkan. Nama kolom memakai huruf kecil dengan garis bawah.';
  const rawSql = prd.architecture_diagrams?.sql_migration_script || prd.sql_migration_script || '';
  const rawErd = prd.architecture_diagrams?.database_erd || '';

  const parsedTables: DatabaseTableDef[] = [];
  const knownTableNames = new Set<string>();

  // 1. Ekstraksi Primer: Parse CREATE TABLE dari SQL DDL (Sumber Data Paling Akurat)
  if (rawSql && rawSql.trim().length > 30) {
    const createTableRegex = /CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+(?:public\.)?["`]?([a-zA-Z0-9_]+)["`]?\s*\(([\s\S]*?)\);/gi;
    let sqlMatch: RegExpExecArray | null;

    while ((sqlMatch = createTableRegex.exec(rawSql)) !== null) {
      const tName = sqlMatch[1].trim().toLowerCase();
      if (['spatial_ref_sys', 'schema_migrations', 'flyway_schema_history'].includes(tName)) {
        continue;
      }
      if (knownTableNames.has(tName)) continue;

      const colsBlock = sqlMatch[2];
      const cols: DatabaseColumnDef[] = [];
      const lines = colsBlock.split('\n');

      lines.forEach((rawL) => {
        const cleanL = rawL.trim().replace(/,\s*$/, '');
        if (
          !cleanL ||
          cleanL.startsWith('--') ||
          cleanL.startsWith('//') ||
          cleanL.startsWith('/*') ||
          /^CONSTRAINT\b/i.test(cleanL) ||
          /^PRIMARY\s+KEY\s*\(/i.test(cleanL) ||
          /^FOREIGN\s+KEY\s*\(/i.test(cleanL) ||
          /^UNIQUE\s*\(/i.test(cleanL) ||
          /^CHECK\s*\(/i.test(cleanL)
        ) {
          return;
        }

        const colMatch = /^["`]?([a-zA-Z0-9_]+)["`]?\s+([a-zA-Z0-9_]+)/.exec(cleanL);
        if (colMatch) {
          const colName = colMatch[1].toLowerCase();
          const rawColType = colMatch[2].toLowerCase();
          if (['constraint', 'primary', 'foreign', 'unique', 'check', 'key', 'index'].includes(colName)) {
            return;
          }
          cols.push({
            name: colName,
            type: normalizeColumnType(rawColType),
            purpose: getColumnPurpose(colName, tName),
          });
        }
      });

      if (cols.length > 0) {
        knownTableNames.add(tName);
        parsedTables.push({
          number: parsedTables.length + 1,
          name: tName,
          description: getTableDescription(tName),
          columns: cols,
        });
      }
    }
  }

  // 2. Ekstraksi Sekunder: Parse Entity Block dari Mermaid ERD secara aman (hindari tanda panah relasi)
  if (parsedTables.length < 2 && rawErd) {
    let currentEntity: string | null = null;
    let currentCols: DatabaseColumnDef[] = [];
    const lines = rawErd.split('\n');

    for (const rawLine of lines) {
      const line = rawLine.trim();
      // Abaikan baris relasi diagram Mermaid (seperti users ||--o{ stores)
      if (
        line.includes('||--') ||
        line.includes('--||') ||
        line.includes('}|--') ||
        line.includes('--|{') ||
        line.includes('..') ||
        line.includes(' : ') ||
        line.startsWith('erDiagram')
      ) {
        continue;
      }

      // Baris awal entitas Mermaid ERD (mis. users { atau stores {)
      const startMatch = /^([a-zA-Z0-9_]+)\s*\{$/.exec(line);
      if (startMatch) {
        currentEntity = startMatch[1].toLowerCase();
        currentCols = [];
        continue;
      }

      if (line === '}' && currentEntity) {
        if (currentCols.length > 0 && !knownTableNames.has(currentEntity)) {
          knownTableNames.add(currentEntity);
          parsedTables.push({
            number: parsedTables.length + 1,
            name: currentEntity,
            description: getTableDescription(currentEntity),
            columns: currentCols,
          });
        }
        currentEntity = null;
        continue;
      }

      if (currentEntity) {
        const parts = line.split(/\s+/);
        if (parts.length >= 2) {
          const type = normalizeColumnType(parts[0]);
          const name = parts[1].replace(/[^a-z0-9_]/gi, '').toLowerCase();
          if (name && !['pk', 'fk', 'unique'].includes(name) && !['constraint', 'table'].includes(name)) {
            currentCols.push({
              name,
              type,
              purpose: getColumnPurpose(name, currentEntity),
            });
          }
        }
      }
    }
  }

  // 3. Sinkronkan dengan Feature Breakdown (jika ada tabel baru dari revisi Workspace Agent)
  if (prd.feature_breakdown && Array.isArray(prd.feature_breakdown)) {
    prd.feature_breakdown.forEach((f) => {
      if (f.tech_mapping?.db_tables && Array.isArray(f.tech_mapping.db_tables)) {
        f.tech_mapping.db_tables.forEach((rawT) => {
          const cleanT = rawT.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
          if (cleanT && cleanT.length > 1 && !knownTableNames.has(cleanT)) {
            knownTableNames.add(cleanT);
            parsedTables.push({
              number: parsedTables.length + 1,
              name: cleanT,
              description: getTableDescription(cleanT),
              columns: synthesizeDefaultColumnsForTable(cleanT),
            });
          }
        });
      }
    });
  }

  // 4. Pastikan tabel pondasi utama (Core Foundation Tables) selalu tersedia
  const titleLower = (prd.title || '').toLowerCase();
  const isInventory =
    titleLower.includes('stok') ||
    titleLower.includes('gudang') ||
    titleLower.includes('toko') ||
    titleLower.includes('kasir') ||
    titleLower.includes('pos') ||
    titleLower.includes('warung') ||
    titleLower.includes('fefo') ||
    titleLower.includes('inventory');

  const baseFoundationList = isInventory
    ? [
        'users',
        'sessions',
        'stores',
        'categories',
        'products',
        'stock_movements',
        'opname_sessions',
        'opname_items',
      ]
    : ['users', 'sessions'];

  baseFoundationList.forEach((tName) => {
    if (!knownTableNames.has(tName)) {
      knownTableNames.add(tName);
      parsedTables.push({
        number: parsedTables.length + 1,
        name: tName,
        description: getTableDescription(tName),
        columns: synthesizeDefaultColumnsForTable(tName),
      });
    }
  });

  // Urutkan agar tabel pondasi (users, sessions, stores, categories, products...) selalu muncul rapi di depan
  const priorityOrder = [
    'users',
    'sessions',
    'stores',
    'warung',
    'toko',
    'categories',
    'products',
    'batch_lots',
    'stock_movements',
    'opname_sessions',
    'opname_items',
    'customers',
    'orders',
    'order_items',
    'returns',
    'return_videos',
    'notifications',
  ];

  parsedTables.sort((a, b) => {
    const idxA = priorityOrder.indexOf(a.name);
    const idxB = priorityOrder.indexOf(b.name);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.name.localeCompare(b.name);
  });

  // Nomor ulang tabel secara rapi (1..N)
  parsedTables.forEach((t, idx) => {
    t.number = idx + 1;
  });

  // 5. Bangun Mermaid ERD diagram yang bersih tanpa atribut di dalam kotak agar proporsional
  let cleanErd = 'erDiagram\n';
  const tableNames = parsedTables.map((t) => t.name.toLowerCase());

  const addRelation = (parent: string, child: string, label: string) => {
    if (tableNames.includes(parent) && tableNames.includes(child)) {
      cleanErd += `  ${parent} ||--o{ ${child} : "${label}"\n`;
    }
  };

  addRelation('users', 'sessions', 'memiliki');
  addRelation('users', 'stores', 'memiliki');
  addRelation('users', 'customers', 'mengelola');
  addRelation('users', 'notifications', 'menerima');
  addRelation('stores', 'categories', 'memiliki');
  addRelation('stores', 'products', 'memiliki');
  addRelation('categories', 'products', 'mengelompokkan');
  addRelation('products', 'batch_lots', 'memiliki batch');
  addRelation('stores', 'stock_movements', 'mencatat');
  addRelation('products', 'stock_movements', 'tercatat pada');
  addRelation('stores', 'opname_sessions', 'menyelenggarakan');
  addRelation('opname_sessions', 'opname_items', 'berisi');
  addRelation('products', 'opname_items', 'dihitung pada');
  addRelation('customers', 'orders', 'melakukan');
  addRelation('orders', 'order_items', 'berisi');
  addRelation('products', 'order_items', 'dipesan pada');
  addRelation('orders', 'returns', 'mengajukan');
  addRelation('returns', 'return_videos', 'melampirkan');

  // Fallback relasi jika belum terpetakan di atas
  if (cleanErd === 'erDiagram\n') {
    for (let i = 1; i < parsedTables.length; i++) {
      const p = parsedTables[0].name.toLowerCase();
      const c = parsedTables[i].name.toLowerCase();
      cleanErd += `  ${p} ||--o{ ${c} : "memiliki"\n`;
    }
  }

  return {
    intro,
    tables: parsedTables,
    erdDiagram: cleanErd.trim(),
    rawSqlMigration: rawSql,
  };
}

export interface RichTechStackItem {
  category: string;
  name: string;
  rationale: string;
}

export interface RichTechStackOutput {
  intro: string;
  items: RichTechStackItem[];
  closingNote: string;
}

/**
 * Menghasilkan Section 7 Tech Stack yang kaya konteks, dinamis, dan naratif
 * 100% presisi dengan format referensi ngodingpakeai (Gambar 2).
 */
export function generateRichTechStack(prd: PRDOutput): RichTechStackOutput {
  const stack = prd.tech_stack || {};
  const title = prd.title || 'Aplikasi';
  const titleLower = title.toLowerCase();

  // Kumpulkan seluruh teks dari fitur, modul, dan alur untuk analisis kebutuhan fungsional
  const featuresText = (prd.feature_breakdown || [])
    .map((f) => `${f.name} ${f.user_story || ''} ${(f.business_rules || []).join(' ')}`)
    .join(' ');
  const roadmapText = (prd.roadmap_tree || [])
    .map((m) => `${m.title} ${m.description || ''} ${(m.sub_features || []).map((s) => typeof s === 'string' ? s : s.label).join(' ')}`)
    .join(' ');
  const allContext = `${title} ${featuresText} ${roadmapText}`.toLowerCase();

  // 1. Deteksi domain produk dan skala
  let domainText = 'stock management';
  if (/stok|stock|gudang|inventory/i.test(allContext)) {
    domainText = 'stock management';
  } else if (/pos|kasir|retail|penjualan|toko/i.test(allContext)) {
    domainText = 'point of sale (POS) & retail';
  } else if (/rental|sewa/i.test(allContext)) {
    domainText = 'manajemen rental & penyewaan';
  } else if (/laundry/i.test(allContext)) {
    domainText = 'operasional laundry';
  } else if (/klinik|rekam medis|pasien/i.test(allContext)) {
    domainText = 'manajemen klinik & rekam medis';
  } else if (/course|kursus|lms|belajar/i.test(allContext)) {
    domainText = 'platform pembelajaran & kursus online';
  } else {
    domainText = titleLower.replace(/[^a-z0-9\s]/g, '').trim() || 'web';
  }

  const scaleText = 'skala kecil';

  const intro = `Karena pilihan teknologi diserahkan ke AI, berikut rekomendasi yang paling cocok untuk aplikasi ${domainText} ${scaleText} — sederhana, cepat dibangun, dan mudah dirawat.`;

  // 2. Susun item teknologi secara dinamis
  const items: RichTechStackItem[] = [];

  // Framework
  const frontendVal = stack.frontend || 'Next.js';
  const isNextJs = /next(\.js)?/i.test(frontendVal) || !stack.frontend;
  if (isNextJs) {
    items.push({
      category: 'Framework (Frontend + Backend)',
      name: 'Next.js (App Router)',
      rationale: 'menangani antarmuka sekaligus logika server dalam satu proyek.',
    });
  } else {
    items.push({
      category: 'Framework (Frontend + Backend)',
      name: frontendVal,
      rationale: 'kerangka utama untuk membangun antarmuka dan backend terpadu.',
    });
  }

  // UI & Styling
  items.push({
    category: 'UI & Styling',
    name: 'Tailwind CSS + shadcn/ui',
    rationale: 'komponen siap pakai yang rapi, cepat, dan konsisten; cocok untuk tampilan dashboard dan tabel yang perlu enak dibaca.',
  });

  // Grafik (jika ada pergerakan stok, chart, dashboard, analitik)
  const hasChartNeed = /grafik|chart|dashboard|analitik|statistik|tren|stok|pergerakan|metrik|laporan/i.test(allContext);
  if (hasChartNeed) {
    const chartContext = /stok|stock/i.test(allContext)
      ? 'grafik pergerakan stok di dashboard.'
      : /penjualan|transaksi/i.test(allContext)
      ? 'grafik tren transaksi dan penjualan di dashboard.'
      : 'grafik analitik dan visualisasi metrik utama pada dashboard.';
    items.push({
      category: 'Grafik',
      name: 'Recharts',
      rationale: `untuk ${chartContext}`,
    });
  }

  // ORM
  const dbVal = (stack.database || '').toLowerCase();
  items.push({
    category: 'ORM',
    name: 'Drizzle ORM',
    rationale: 'ringan dan jelas, memudahkan pengelolaan skema serta query ke basis data.',
  });

  // Basis Data
  if (dbVal.includes('sqlite') || (!dbVal && /sqlite/i.test(allContext))) {
    items.push({
      category: 'Basis Data',
      name: 'SQLite untuk pengembangan lokal, dengan Turso (libSQL) sebagai opsi produksi di cloud agar data tetap persisten saat di-deploy. (Bisa naik ke PostgreSQL bila skala data bertambah besar.)',
      rationale: '',
    });
  } else if (dbVal.includes('postgres') || dbVal.includes('supabase')) {
    if (dbVal.includes('supabase')) {
      items.push({
        category: 'Basis Data',
        name: 'Supabase (PostgreSQL)',
        rationale: 'basis data relasional terkelola dengan Row Level Security (RLS) bawaan, integritas relasi foreign key, dan performa tinggi.',
      });
    } else {
      items.push({
        category: 'Basis Data',
        name: 'PostgreSQL',
        rationale: 'basis data relasional tangguh berstandar enterprise dengan ACID compliance, relasi data terstruktur, dan performa query tinggi.',
      });
    }
  } else if (dbVal.includes('mysql') || dbVal.includes('mariadb')) {
    items.push({
      category: 'Basis Data',
      name: 'MySQL / MariaDB',
      rationale: 'basis data relasional teruji yang stabil untuk pencatatan transaksi terstruktur.',
    });
  } else {
    items.push({
      category: 'Basis Data',
      name: 'SQLite untuk pengembangan lokal, dengan Turso (libSQL) sebagai opsi produksi di cloud agar data tetap persisten saat di-deploy. (Bisa naik ke PostgreSQL bila skala data bertambah besar.)',
      rationale: '',
    });
  }

  // Autentikasi
  const resolved = resolvePrdTechStack(prd);
  const authVal = (resolved.auth || (stack as any)?.auth || '').toLowerCase();
  if (authVal.includes('supabase')) {
    items.push({
      category: 'Autentikasi',
      name: 'Supabase Auth',
      rationale: 'menangani daftar akun, login/logout, session cookie aman, dan otorisasi peran.',
    });
  } else {
    items.push({
      category: 'Autentikasi',
      name: 'Better Auth',
      rationale: 'menangani daftar akun, login/logout, sesi, dan ganti kata sandi.',
    });
  }

  // Penyimpanan Lampiran / Berkas
  const hasAttachmentNeed = /nota|lampiran|foto|gambar|bukti|upload|file|avatar|dokumen|ktp|surat|resep|video/i.test(allContext);
  if (hasAttachmentNeed) {
    const isNota = /nota|kwitansi|struk/i.test(allContext);
    items.push({
      category: isNota ? 'Penyimpanan Lampiran Nota' : 'Penyimpanan Berkas & Lampiran',
      name: 'layanan penyimpanan file seperti Vercel Blob atau S3-compatible storage',
      rationale: isNota
        ? 'untuk menyimpan foto/file nota.'
        : 'untuk menyimpan berkas dokumen, media, dan foto lampiran secara persisten.',
    });
  }

  // Ekspor Laporan
  const hasExportNeed = /ekspor|export|excel|pdf|laporan|cetak|rekap|unduh|invoice/i.test(allContext);
  if (hasExportNeed) {
    items.push({
      category: 'Ekspor Laporan',
      name: 'ExcelJS untuk file Excel dan PDFKit (atau sejenis) untuk file PDF',
      rationale: 'dijalankan di sisi server.',
    });
  }

  // Deployment
  const deployVal = (stack.deployment || '').toLowerCase();
  if (deployVal.includes('docker') || deployVal.includes('vps') || deployVal.includes('coolify')) {
    items.push({
      category: 'Deployment',
      name: 'Docker (VPS / Coolify)',
      rationale: 'containerization mandiri yang terisolasi, mudah direplikasi dengan Docker Compose, dan memberikan kontrol penuh atas lingkungan server.',
    });
  } else {
    items.push({
      category: 'Deployment',
      name: 'Vercel',
      rationale: 'cocok dengan Next.js, mudah di-deploy, dan hemat biaya. Alternatif: VPS kecil bila ingin basis data & file tersimpan lokal.',
    });
  }

  // Validasi Form
  items.push({
    category: 'Validasi Form',
    name: 'Zod',
    rationale: 'memastikan data yang diisi pengguna valid sebelum disimpan.',
  });

  // 3. Catatan Penutup
  const aiRegex = /\b(ai|llm|gpt|openai|gemini|claude|deepseek|machine learning|artificial intelligence)\b/i;
  const isAiApp = aiRegex.test(allContext) || stack.templateId === 'ai-service';
  const closingNote = isAiApp
    ? 'Catatan: Aplikasi ini mengintegrasikan layanan AI melalui API LLM untuk otomatisasi dan pemrosesan cerdas.'
    : 'Catatan: Aplikasi ini tidak memerlukan fitur AI, sehingga layanan AI/gateway tidak disertakan dalam stack.';

  return {
    intro,
    items,
    closingNote,
  };
}
