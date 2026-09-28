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
    [key: string]: string;
  };
  systemComponentsList: Array<{ label: string; text: string }>;
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
      `Pengguna dapat membuat akun, login/logout, dan mengelola profil akun pada ${prd.title || 'sistem'}.`,
      'Pengguna dapat membuat, melihat, memperbarui, dan mengarsipkan data utama sesuai alur operasional aplikasi.',
      'Sistem memvalidasi input data pengguna secara realtime untuk mencegah kesalahan format dan duplikasi.',
      'Pengguna dapat mencari, memfilter, dan mengelompokkan data berdasarkan parameter kategori yang relevan.',
      'Sistem menyajikan ringkasan metrik dan status operasional terkini pada antarmuka dasbor.',
      'Pengguna dapat mengekspor atau mencadangkan riwayat data dalam format standar yang mudah diakses.'
    );
  }

  // 2. Persyaratan Non-Fungsional
  const audience = prd.archetype_detection?.target_audience || 'pengguna';
  const appDomain = prd.title ? prd.title.toLowerCase() : 'sistem';

  // Comprehensive domain context inspection
  const techStackStr = prd.tech_stack ? JSON.stringify(prd.tech_stack) : '';
  const domainContext = [
    prd.title || '',
    prd.opportunity_framing?.core_problem || '',
    prd.opportunity_framing?.strategy_fit || '',
    prd.archetype_detection?.archetype || '',
    audience,
    ...(prd.boundaries?.scope || []),
    ...(prd.boundaries?.non_goals || []),
    ...(prd.feature_breakdown?.map((f) => `${f.name} ${f.user_story || ''}`) || []),
    ...(prd.roadmap_tree?.map((r) => `${r.title} ${r.description || ''}`) || []),
    techStackStr,
  ].join(' ').toLowerCase();

  const isEdu = /kuliah|mahasiswa|siswa|kampus|akademik|sekolah|edukasi|pelajaran|dosen|guru|kursus|belajar/i.test(domainContext);
  const isAudioOrMedia = /audio|suara|rekam|mediarecorder|transkrip|speech|podcast|mic|mp3|wav|m4a/i.test(domainContext);
  const isOfflineOrPwa = /offline|indexeddb|pwa|service\s*worker|cache\s*first/i.test(domainContext);
  const isAIOrLLM = /gemini|ai\b|llm|gpt|openai|transkripsi|kecerdasan buatan|machine learning/i.test(domainContext);
  const isInventory = /stok|stock|gudang|inventori|opname|sku/i.test(domainContext) && !isEdu;
  const isPOS = /kasir|pos\b|point of sale|barista|struk|meja restoran/i.test(domainContext);
  const isHealth = /klinik|pasien|rekam medis|dokter|kesehatan|obat|farmasi/i.test(domainContext);
  const isBookingOrRental = /booking|reservasi|sewa|rental|jadwal sewa/i.test(domainContext);
  const isFinance = /pembayaran|qris|fintech|transaksi keuangan|wallet|saldo|faktur/i.test(domainContext);
  const hasMarkdownOrDoc = /markdown|catatan|dokumen|catatin|notetaking|notes/i.test(domainContext);

  nonFunctional.push(
    `Antarmuka sederhana dan ramah untuk ${audience} (navigasi intuitif, alur ringkas, istilah mudah dipahami).`,
    `Responsif: nyaman dan optimal dipakai di perangkat mobile/HP, tablet, maupun laptop/desktop untuk menunjang fleksibilitas ${audience}.`,
    `Keamanan Data: data ${appDomain} terisolasi dan hanya bisa diakses oleh akun terautentikasi sesuai hak akses (terproteksi sesi login aman).`
  );

  if (isAudioOrMedia) {
    nonFunctional.push('Penyimpanan Berkas Media: file rekaman audio tersimpan aman di penyimpanan awan/storage dengan integritas berkas terjamin dan pemutaran kembali lancar.');
  } else if (hasMarkdownOrDoc) {
    nonFunctional.push('Integritas Dokumen: catatan dan berkas terstruktur tersimpan aman, utuh, serta dapat dibuka dan diekspor kembali kapan saja.');
  } else if (isFinance) {
    nonFunctional.push('Keamanan Transaksi: integritas data pembayaran dan bukti transaksi terlindungi dengan pencatatan audit log terenkripsi.');
  } else {
    nonFunctional.push('Penyimpanan Aman: berkas dokumen, lampiran, dan data operasional tersimpan aman secara persisten serta dapat diakses kembali.');
  }

  if (isInventory) {
    nonFunctional.push('Integritas Riwayat: rekaman mutasi stok dan riwayat transaksi tidak hilang meskipun status item dinonaktifkan.');
  } else {
    nonFunctional.push('Integritas Riwayat: riwayat pencatatan dan aktivitas tidak hilang (didukung mekanisme soft-delete dan jejak audit) untuk akuntabilitas data.');
  }

  nonFunctional.push('Proses simpan dan pemuatan data terasa cepat (< 2 detik) agar tidak mengganggu aktivitas harian pengguna.');

  if (isOfflineOrPwa) {
    nonFunctional.push('Ketersediaan Offline-First: fungsionalitas pencatatan/perekaman tetap dapat berjalan lancar saat jaringan terputus dan otomatis tersinkronisasi saat terhubung kembali.');
  }

  if (isAIOrLLM) {
    nonFunctional.push('Keandalan Layanan AI: integrasi transkripsi/inferensi AI dilengkapi penanganan timeout otomatis, penanganan batas kuota, dan indikator status progres yang transparan.');
  }

  if (prd.risk_management?.fallback_kill_switch) {
    const cleanKill = cleanLabel(prd.risk_management.fallback_kill_switch).replace(/[.;,]+$/, '');
    nonFunctional.push(`Mitigasi operasional: ${cleanKill}.`);
  }

  // 3. Asumsi & Batasan
  if (prd.assumptions_and_constraints && Array.isArray(prd.assumptions_and_constraints) && prd.assumptions_and_constraints.length > 0) {
    prd.assumptions_and_constraints.forEach((a) => {
      if (a && typeof a === 'string') {
        const trimmed = a.trim();
        if (trimmed) assumptionsAndConstraints.push(trimmed);
      }
    });
  } else {
    // Dynamic fallback when assumptions_and_constraints is absent
    const audience = prd.archetype_detection?.target_audience || 'pengguna';
    const appTitle = prd.title || 'aplikasi';
    assumptionsAndConstraints.push(`Skala pengguna: dirancang untuk ${audience} dengan kapasitas dan struktur data terkelola.`);
    assumptionsAndConstraints.push(`Satu akun pengguna terhubung ke profil/ruang kerja utama pada versi rilis awal ${appTitle}.`);

    if (prd.boundaries?.non_goals && Array.isArray(prd.boundaries.non_goals) && prd.boundaries.non_goals.length > 0) {
      prd.boundaries.non_goals.forEach((ng) => {
        let clean = ng
          .replace(/^\[NON-GOAL\]\s*/i, '')
          .replace(/^\[OUT-OF-SCOPE\]\s*/i, '')
          .replace(/^[-*•\d.]+\s*/, '')
          .trim();
        if (!clean) return;

        const lower = clean.toLowerCase();
        if (lower.includes('integrasi marketplace')) {
          clean = 'Integrasi marketplace pihak ketiga ditunda untuk fokus pada stabilitas alur kerja utama aplikasi.';
        } else if (lower.includes('akuntansi')) {
          clean = 'Sistem akuntansi pembukuan penuh berada di luar lingkup rilis awal untuk berfokus pada fitur inti.';
        } else if (lower.includes('mobile app')) {
          clean = 'Fokus pada aplikasi web responsif/PWA terlebih dahulu sebelum pengembangan aplikasi native terpisah.';
        } else if (lower.includes('payroll')) {
          clean = 'Sistem payroll staf berada di luar lingkup operasional sistem ini.';
        } else {
          clean = clean.replace(/[.;,]+$/, '') + '.';
        }

        assumptionsAndConstraints.push(clean);
      });
    }

    assumptionsAndConstraints.push('Bahasa antarmuka Indonesia.');
  }

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
    return 'Mencatat pengurangan kuantitas, pemenuhan pesanan, atau mutasi data keluar secara akurat.';
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
  return `Memfasilitasi eksekusi alur teknis ${rawName.toLowerCase()} dengan validasi data terstruktur.`;
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
    return `${moduleTitle} — mengelola data master item dan entitas acuan operasional.`;
  }
  if (t.includes('opname') || t.includes('akurasi') || t.includes('hitung')) {
    return `${moduleTitle} — verifikasi fisik periodik untuk mencocokkan kondisi nyata dengan data sistem.`;
  }
  if (t.includes('laporan') || t.includes('pelaporan') || t.includes('analisis') || t.includes('rekap')) {
    return `${moduleTitle} — menyajikan rekapitulasi performa bisnis dan cetak berkas laporan siap pakai.`;
  }
  if (t.includes('akun') || t.includes('keamanan') || t.includes('staf') || t.includes('autentikasi')) {
    return `${moduleTitle} — perlindungan akses, tata kelola wewenang peran staf, dan pencatatan audit.`;
  }
  return `${moduleTitle} — antarmuka terintegrasi untuk menjalankan fungsionalitas ${t} secara terstruktur.`;
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

  // 3. Jika belum ada data modul atau roadmap (misal saat masih proses generate), kembalikan array kosong
  return [];
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
      description: `Pengguna (${targetAudience}) membuat akun, lalu login ke dalam sistem. Setelah berhasil masuk, pengguna melengkapi konfigurasi profil awal dan preferensi kerja pada ${appTitle}.`,
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
      description: `Pengguna membuat akun baru dan melakukan autentikasi login. Setelah masuk, pengguna melengkapi konfigurasi profil pengguna pada ${appTitle}.`,
    },
    {
      step: 2,
      title: 'Kelola Data Master & Preferensi',
      phaseTag: 'Fase 2',
      description: 'Pengguna menginput data referensi awal, parameter pengaturan, dan konfigurasi operasional.',
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
 * Helper untuk memperkaya Mermaid flowchart yang dibuat oleh AI atau menyusun flowchart dinamis yang spesifik untuk domain produk.
 */
function enrichOrSynthesizeSystemFlowchart(
  rawChart: string | undefined,
  context: {
    audience: string;
    frontend: string;
    backend: string;
    database: string;
    moduleNames: string[];
    isAudioOrEdu: boolean;
    isPOS: boolean;
    isGaming: boolean;
    isCrypto: boolean;
    isLogistics: boolean;
    isWhatsApp: boolean;
    isSchool: boolean;
    isHealthcare: boolean;
    isRealtime: boolean;
    hasFileUpload: boolean;
    hasReports: boolean;
    hasPaymentGateway: boolean;
  }
): string {
  // Bersihkan markdown fence backticks dan spasi
  let cleanChart = (rawChart || '')
    .trim()
    .replace(/^```(?:mermaid)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const isStaleTemplate =
    !cleanChart ||
    cleanChart.includes('Simpan nota & lampiran') ||
    cleanChart.includes('Client([Klien Pengguna])') ||
    cleanChart.length < 60 ||
    (!cleanChart.includes('|1.') && !cleanChart.includes('| 1.') && !cleanChart.includes('|1 '));

  // Jika AI sudah menghasilkan diagram kustom yang valid dan BUKAN template basi
  if (cleanChart.length >= 40 && !isStaleTemplate) {
    const bracketCount = (cleanChart.match(/\[.*?\]/g) || []).length;

    // Jika sudah memiliki label deskriptif di dalam bracket (misal A[Client] --> B[Server])
    if (bracketCount >= 3) {
      // Pastikan label node yang memuat tanda kurung / slash tidak memecahkan parser Mermaid
      cleanChart = cleanChart.replace(/\[([^"\]]+)\]/g, (match, inner) => {
        if (inner.includes('(') || inner.includes(')') || inner.includes('/') || inner.includes('&')) {
          return `["${inner.replace(/"/g, "'")}"]`;
        }
        return match;
      });

      if (!cleanChart.startsWith('flowchart') && !cleanChart.startsWith('graph')) {
        return `flowchart TD\n${cleanChart}`;
      }
      return cleanChart;
    }

    // Jika berupa diagram relasi identifier polos (misal User --> Frontend\nFrontend --> API...)
    const lines = cleanChart.split('\n').map((l) => l.trim()).filter(Boolean);
    const arrowLines = lines.filter((l) => l.includes('-->') || l.includes('---'));

    if (arrowLines.length > 0) {
      const nodeIds = new Set<string>();
      arrowLines.forEach((line) => {
        const parts = line.split(/-->|---|\|.*?\|/);
        parts.forEach((p) => {
          const id = p.trim().replace(/^\[|\]$/g, '').split('[')[0].trim();
          if (id && /^[a-zA-Z0-9_]+$/.test(id)) {
            nodeIds.add(id);
          }
        });
      });

      const definitions: string[] = [];
      nodeIds.forEach((id) => {
        const lower = id.toLowerCase();
        if (lower.includes('websocket') || lower.includes('realtime')) {
          definitions.push(`  ${id}["Layanan Realtime (WebSocket / Supabase Realtime)"]`);
        } else if (lower.includes('aggregator')) {
          definitions.push(`  ${id}["Game Aggregator API"]`);
        } else if (lower.includes('provider')) {
          definitions.push(`  ${id}["Provider Game Eksternal"]`);
        } else if (lower.includes('printer')) {
          definitions.push(`  ${id}["Thermal Receipt & Kitchen Printer"]`);
        } else if (lower.includes('logistics') || lower.includes('kurir') || lower.includes('ongkir')) {
          definitions.push(`  ${id}["Logistics API (Kurir & Ekspedisi)"]`);
        } else if (lower.includes('whatsapp') || lower.includes('wa_') || lower === 'wa' || lower.includes('notif')) {
          definitions.push(`  ${id}["WhatsApp Gateway & Notification Service"]`);
        } else if (lower.includes('payment') || lower.includes('qris') || lower.includes('gateway_pay')) {
          definitions.push(`  ${id}["Payment Gateway (QRIS / Midtrans)"]`);
        } else if (lower.includes('gateway') && lower.includes('api')) {
          definitions.push(`  ${id}["API Gateway & Logika Server - ${context.backend}"]`);
        } else if (lower.includes('storage') || lower.includes('file')) {
          definitions.push(`  ${id}["Penyimpanan Berkas (Cloud Storage)"]`);
        } else if (lower.includes('report') || lower.includes('laporan')) {
          definitions.push(`  ${id}["Generator Laporan (PDF & Excel)"]`);
        } else if (lower.includes('auth')) {
          definitions.push(`  ${id}["Layanan Autentikasi & Keamanan"]`);
        } else if (
          lower.includes('db') ||
          lower.includes('database') ||
          lower.includes('supabase') ||
          lower.includes('postgres') ||
          lower.includes('sqlite') ||
          lower.includes('sql')
        ) {
          definitions.push(`  ${id}[("Basis Data - ${context.database}")]`);
        } else if (
          lower.includes('server') ||
          lower.includes('api') ||
          lower.includes('action') ||
          lower.includes('backend')
        ) {
          definitions.push(`  ${id}["Logika Server - ${context.backend}"]`);
        } else if (lower.includes('front') || lower.includes('web') || lower.includes('ui') || lower === 'app') {
          definitions.push(`  ${id}["Antarmuka Web - ${context.frontend}"]`);
        } else if (lower === 'user' || lower === 'pengguna' || lower === 'client') {
          definitions.push(`  ${id}["Pengguna - ${context.audience}"]`);
        } else {
          const readable = id.replace(/_/g, ' ');
          definitions.push(`  ${id}["${readable}"]`);
        }
      });

      return `flowchart TD\n${definitions.join('\n')}\n\n${arrowLines.map((l) => '  ' + l).join('\n')}`;
    }
  }

  // JIKA TIDAK ADA DIAGRAM DARI AI ATAU BERUPA TEMPLATE STENCIL LAMA:
  // Bangun flowchart alur kritis bernomor urut yang 100% spesifik untuk domain produk!
  if (context.isAudioOrEdu) {
    return `flowchart TD
  User["Mahasiswa - ${context.audience}"]
  User -->|1. Mulai sesi rekam perkuliahan| WebUI["Antarmuka Perekam & Editor - ${context.frontend}"]
  WebUI -->|2. Buffer audio lokal aman offline| LocalBuffer[("Penyimpanan Buffer Lokal (IndexedDB)")]
  LocalBuffer -.->|3. Sinkronisasi berkas saat terhubung online| Server["Logika Server - ${context.backend}"]
  Server -->|4. Simpan berkas audio mentah (.m4a/.wav)| Storage[("Penyimpanan Berkas - Supabase Storage")]
  Server -->|5. Teruskan stream audio & prompt ekstraksi| GeminiAI["Google Gemini Multimodal Audio API"]
  GeminiAI -->|6. Kembalikan teks transkrip & ringkasan terstruktur| Server
  Server -->|7. Transformasi ke format Markdown & simpan| DB[("Basis Data - ${context.database}")]
  DB -->|8. Sajikan catatan interaktif & player audio tersinkron| WebUI`;
  }

  if (context.isGaming || context.isCrypto) {
    return `flowchart TD
  User["Pengguna - ${context.audience}"]
  User -->|1. Akses platform & buka lobby| WebUI["Antarmuka Web - ${context.frontend}"]
  
  WebUI -->|2. Autentikasi akun & PIN sesi| Auth["Layanan Autentikasi (2FA & Session Guard)"]
  Auth --> DB[("Basis Data - ${context.database}")]
  
  WebUI -->|3. Luncurkan game & pasang taruhan| Server["Logika Server - ${context.backend}"]
  Server -->|4. Validasi taruhan & lock saldo wallet| DB
  Server -->|5. Panggil sesi game via token| Aggregator["Game Aggregator API"]
  Aggregator -->|6. Streaming RNG & callback hasil game| GameProvider["Provider Game Eksternal"]
  
  WebUI -->|7. Deposit & penarikan instan| Crypto["Crypto / USDT Payment Rail (TRC20/ERC20)"]
  Crypto -->|8. Webhook konfirmasi transfer on-chain| Server`;
  }

  if (context.isPOS) {
    return `flowchart TD
  User["Pengguna - ${context.audience}"]
  User -->|1. Akses terminal kasir & pilih menu| WebUI["Antarmuka Kasir & Tablet POS - ${context.frontend}"]
  
  WebUI -->|2. Quick-switch PIN kasir/barista| Auth["Otorisasi Terminal & Role Guard"]
  Auth --> DB[("Basis Data - ${context.database}")]
  
  WebUI -->|3. Konfirmasi pesanan & bayar| Server["Logika Server - ${context.backend}"]
  Server -->|4. Catat transaksi atomik & potong stok| DB
  Server -->|5. Tampilkan QRIS dinamis di layar pelanggan| Payment["Dynamic QRIS Customer Display"]
  Server -->|6. Kirim antrean pesanan seketika| Realtime["Realtime Engine (WebSocket / SSE)"]
  Realtime -->|7. Tampilkan tiket antrean dapur| KDS["Kitchen Display System (Layar Barista)"]
  Server -->|8. Cetak struk belanja & tiket dapur| Printer["Thermal Receipt & Kitchen Printer"]`;
  }

  if (context.isLogistics) {
    return `flowchart TD
  User["Pengguna - ${context.audience}"]
  User -->|1. Buka dashboard pengiriman & pesanan| WebUI["Dashboard Operasional - ${context.frontend}"]
  
  WebUI -->|2. Login staf gudang & admin| Auth["Layanan Autentikasi"]
  Auth --> DB[("Basis Data - ${context.database}")]
  
  WebUI -->|3. Proses order & verifikasi stok| Server["Logika Server - ${context.backend}"]
  Server -->|4. Query & mutasi inventaris gudang| DB
  Server -->|5. Cek tarif ongkir & generate resi AWB| Logistics["Logistics API (J&T / SiCepat / RajaOngkir)"]
  Server -->|6. Kirim update resi otomatis| WhatsApp["WhatsApp Gateway Notification"]${
    context.hasFileUpload ? '\n  Server -->|7. Unggah foto paket & resi fisik| Storage["Penyimpanan Berkas (Cloud Storage)"]' : ''
  }${
    context.hasReports ? '\n  Server -->|8. Export rekap mutasi & penjualan| Reporter["Generator Laporan (Excel & PDF)"]\n  Reporter -->|File siap unduh| WebUI' : ''
  }`;
  }

  if (context.isSchool) {
    return `flowchart TD
  User["Pengguna - ${context.audience}"]
  User -->|1. Buka portal pendaftaran siswa| WebUI["Portal Web - ${context.frontend}"]
  
  WebUI -->|2. Daftar akun & login NISN/email| Auth["Layanan Autentikasi Siswa & Panitia"]
  Auth --> DB[("Basis Data - ${context.database}")]
  
  WebUI -->|3. Pengisian formulir & pilih jalur| Server["Logika Server - ${context.backend}"]
  Server -->|4. Simpan data pendaftaran siswa| DB
  Server -->|5. Unggah berkas ijazah, KK, akta| Storage["Penyimpanan Berkas (Cloud Storage)"]
  Server -->|6. Bayar biaya seleksi/formulir| Payment["Payment Gateway (VA / QRIS)"]
  Server -->|7. Notifikasi kelulusan & kartu ujian| WhatsApp["WhatsApp / Email Notifier"]${
    context.hasReports ? '\n  Server -->|8. Cetak kartu peserta & rekap kelulusan| Reporter["Generator Dokumen PDF"]\n  Reporter -->|File siap unduh| WebUI' : ''
  }`;
  }

  if (context.isHealthcare) {
    return `flowchart TD
  User["Pengguna - ${context.audience}"]
  User -->|1. Buka portal rekam medis & antrean| WebUI["Antarmuka Web - ${context.frontend}"]
  
  WebUI -->|2. Login dokter, perawat, & staf| Auth["Autentikasi & RBAC Tenaga Medis"]
  Auth --> DB[("Basis Data Rekam Medis - ${context.database}")]
  
  WebUI -->|3. Input diagnosa & resep obat| Server["Logika Server - ${context.backend}"]
  Server -->|4. Simpan rekam medis (EMR) & mutasi obat| DB
  Server -->|5. Panggil nomor antrean poliklinik| Queue["Display Antrean Poli (Realtime)"]${
    context.hasFileUpload ? '\n  Server -->|6. Simpan foto rontgen & hasil lab| Storage["Penyimpanan Berkas Medis (S3 Enkripsi)"]' : ''
  }${
    context.hasReports ? '\n  Server -->|7. Cetak resume medis & rujukan| Reporter["Generator Resume Medis (PDF)"]\n  Reporter -->|File siap unduh| WebUI' : ''
  }`;
  }

  // Default: General SaaS / Modern Web Application dengan alur transaksi bernomor urut
  const actionList = context.moduleNames.slice(0, 4).join(', ') || 'data & transaksi';
  let chart = `flowchart TD
  User["Pengguna - ${context.audience}"]
  User -->|1. Akses dashboard di browser| WebUI["Antarmuka Web - ${context.frontend}"]
  
  WebUI -->|2. Autentikasi & manajemen sesi aman| Auth["Layanan Autentikasi"]
  Auth --> DB[("Basis Data - ${context.database}")]
  
  WebUI -->|3. Eksekusi alur ${actionList}| Server["Logika Server - ${context.backend}"]
  Server -->|4. Validasi skema Zod & mutasi data| DB`;

  let stepCounter = 5;
  if (context.hasPaymentGateway) {
    chart += `\n  Server -->|${stepCounter++}. Proses pembayaran digital| Payment["Payment Gateway (QRIS / Midtrans)"]`;
  }
  if (context.hasFileUpload) {
    chart += `\n  Server -->|${stepCounter++}. Unggah berkas lampiran & dokumen| Storage["Penyimpanan Berkas (Cloud Storage)"]`;
  }
  if (context.isRealtime) {
    chart += `\n  Server -->|${stepCounter++}. Push update status seketika| Realtime["Layanan Realtime (WebSocket / SSE)"]\n  Realtime --> WebUI`;
  }
  if (context.hasReports) {
    chart += `\n  Server -->|${stepCounter++}. Minta laporan analitik & rekap| Reporter["Generator Laporan (PDF & Excel)"]\n  Reporter -->|File siap unduh| WebUI`;
  }

  return chart;
}

/**
 * Menghasilkan ringkasan arsitektur (teks narasi dan komponen sistem)
 * sesuai tata letak elegan dan 100% dinamis sesuai domain produk.
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

  // Analisis domain produk secara mendalam
  const fullContext = (
    (prd.title || '') +
    ' ' +
    (prd.opportunity_framing?.core_problem || '') +
    ' ' +
    targetAudience +
    ' ' +
    (prd.feature_breakdown || []).map((f) => (f.name || '') + ' ' + (f.user_story || '')).join(' ')
  ).toLowerCase();

  const isAudioOrEdu = /\b(audio|suara|rekam|kuliah|mahasiswa|transkrip|transkripsi|podcast|mediarecorder|catatan kuliah|speech)\b/i.test(
    fullContext
  );
  const isPOS = /\b(pos|kasir|point of sale|barista|cafe|coffee|restoran|kitchen|dapur|struk|nota thermal|meja|kds|dine.in|takeaway)\b/i.test(
    fullContext
  );
  const isGaming = /\b(slot|game|gaming|casino|judi|taruhan|bet|betting|aggregator|pragmatic|pgsoft|provider|spin|jackpot|rtp)\b/i.test(
    fullContext
  );
  const isCrypto = /\b(crypto|kripto|usdt|bitcoin|ethereum|wallet|web3|blockchain|token|metamask|smart contract|trc20|erc20)\b/i.test(
    fullContext
  );
  const isLogistics = /\b(ekspedisi|kurir|ongkir|resi|awb|shipping|logistik|j&t|sicepat|jne|rajaongkir|pengiriman|gudang)\b/i.test(
    fullContext
  );
  const isWhatsApp = /\b(whatsapp|wa gateway|chat|pesan|broadcast|sms|twilio|fonnte|notifikasi wa)\b/i.test(
    fullContext
  );
  const isSchool = /\b(sekolah|siswa|santri|guru|ppdb|peserta didik|ujian|cbt|rapor|mapel|kelas|akademik)\b/i.test(
    fullContext
  );
  const isHealthcare = /\b(klinik|rekam medis|pasien|dokter|obat|apotek|rumahsakit|antrean pasien|poli)\b/i.test(
    fullContext
  );
  const hasFileUpload = /\b(lampiran|upload|unggah|foto|gambar|nota bukti|bukti bayar|ktp|ijazah|berkas|dokumen|avatar|pdf file)\b/i.test(
    fullContext
  );
  const hasReports = /\b(laporan|rekap|export|unduh|pdf|excel|spreadsheet|pembukuan|omzet|analitik)\b/i.test(
    fullContext
  );
  const hasPaymentGateway = /\b(payment gateway|qris|midtrans|xendit|tripay|doku|pembayaran online|va bank|virtual account)\b/i.test(
    fullContext
  );
  const isRealtime =
    /\b(websocket|realtime|real-time|sse|live tracking|live update|sensor|iot|telemetry)\b/i.test(
      fullContext
    ) || isPOS || isGaming;

  const cleanFrontendTech = resolvedStack.frontend.split(',')[0].trim() || 'Next.js 16 + Tailwind CSS';
  const cleanDbTech = resolvedStack.database.split('(')[0].trim() || 'PostgreSQL / Supabase';
  const cleanBackendTech = resolvedStack.backend.split('(')[0].trim() || 'Server Actions & API Routes';
  const safeAudience = targetAudience.replace(/["'[\]]/g, '').slice(0, 35);

  const intro =
    'Arsitektur sistem dirancang dengan prinsip pemisahan tanggung jawab (separation of concerns), keamanan tingkat produksi, dan pemetaan alur transaksi inti (critical path) yang jelas. Komponen di bawah memetakan bagaimana antarmuka pengguna, logika server, basis data, dan integrasi eksternal berinteraksi secara efisien.';

  // 1. Antarmuka pengguna
  let frontendDesc = `Halaman web responsif yang menampilkan ${moduleDisplayList}.`;
  if (isPOS) {
    frontendDesc = `Antarmuka kasir cepat (POS) berbasis sentuh, kitchen display system (KDS) untuk barista, dan dashboard manajer kafe yang responsif.`;
  } else if (isGaming) {
    frontendDesc = `Lobby game interaktif, portal member untuk transaksi wallet, dan dashboard operasional agen dan admin yang aman.`;
  } else if (isSchool) {
    frontendDesc = `Portal publik pendaftaran calon siswa (PPDB), panel verifikasi berkas panitia, dan dashboard pengumuman kelulusan.`;
  } else if (isLogistics) {
    frontendDesc = `Dashboard monitoring pesanan, pelacakan pengiriman kurir ekspedisi, cetak resi massal, dan manajemen pelanggan.`;
  }

  // 2. Logika server
  let backendDesc = `Menangani aturan bisnis — alur ${moduleDisplayList}, validasi skema data Zod, otorisasi sesi, dan integritas data.`;
  if (isPOS) {
    backendDesc = `Menangani aturan bisnis — pemesanan kasir, perhitungan diskon & pajak, routing antrean pesanan ke barista, dan mutasi stok bahan baku.`;
  } else if (isGaming) {
    backendDesc = `Menangani aturan bisnis — agregasi sesi game dari provider eksternal, validasi taruhan, rekonsiliasi saldo wallet instan, serta verifikasi setoran USDT.`;
  } else if (isSchool) {
    backendDesc = `Menangani aturan bisnis — validasi kelengkapan berkas siswa, penentuan kuota jalur pendaftaran, verifikasi panitia, dan publikasi hasil seleksi.`;
  } else if (isLogistics) {
    backendDesc = `Menangani aturan bisnis — validasi alamat pengiriman, perhitungan tarif ongkir real-time, penerbitan nomor resi AWB, dan notifikasi pengiriman.`;
  }

  // 3. Basis data
  const databaseDesc = `Menyimpan data ${tablesDisplayList} menggunakan ${cleanDbTech}.`;

  // 4. Layanan autentikasi
  let authDesc = `Mengatur pendaftaran akun pengguna, login/logout sesi aman (session cookies/JWT), dan pembatasan hak akses peran.`;
  if (isPOS) {
    authDesc = `Otorisasi multi-role staf (kasir, barista, kepala toko) dengan quick-switch PIN terminal kasir.`;
  } else if (isGaming) {
    authDesc = `Autentikasi akun member dengan enkripsi tinggi, sesi login aman, verifikasi PIN transaksi, dan kontrol hak akses agen/operator.`;
  } else if (isSchool) {
    authDesc = `Pendaftaran akun calon siswa (berbasis NISN/email) dan proteksi akses panitia seleksi dengan role-based access control (RBAC).`;
  }

  // Susun daftar komponen dinamis
  let systemComponentsList: Array<{ label: string; text: string }> = [];

  // PRIORITAS 1: Jika AI Gemini sudah menghasilkan system_components terstruktur dalam skema PRD
  if (prd.architecture_diagrams?.system_components && prd.architecture_diagrams.system_components.length > 0) {
    systemComponentsList = prd.architecture_diagrams.system_components.map((comp) => {
      const techBadge = comp.tech ? ` (${comp.tech})` : '';
      return {
        label: `${comp.name}${techBadge}`,
        text: comp.role,
      };
    });
  }

  // PRIORITAS 2 (FALLBACK DINAMIS): Jika belum ada system_components dari AI, susun secara adaptif berbasis konteks produk nyata
  if (systemComponentsList.length === 0) {
    systemComponentsList.push(
      { label: 'Antarmuka pengguna', text: frontendDesc },
      { label: 'Logika server', text: backendDesc },
      { label: 'Basis data', text: databaseDesc },
      { label: 'Layanan autentikasi', text: authDesc }
    );

    // Integrasi pihak ketiga & hardware
    if (isPOS) {
      systemComponentsList.push({
        label: 'Integrasi perangkat & pembayaran',
        text: 'Integrasi hardware thermal receipt printer (struk belanja kasir), kitchen ticket printer (barista), customer QRIS display, dan laci kasir otomatis.',
      });
    } else if (isGaming || isCrypto) {
      systemComponentsList.push({
        label: 'Integrasi API & provider game',
        text: 'Integrasi Game Aggregator API untuk peluncuran sesi game provider eksternal, callback webhook RNG, dan direct rail cryptocurrency (USDT TRC20/ERC20).',
      });
    } else if (isLogistics) {
      systemComponentsList.push({
        label: 'Integrasi kurir & logistik',
        text: 'Integrasi API kurir ekspedisi (J&T, SiCepat, RajaOngkir) untuk kalkulasi ongkos kirim real-time dan penerbitan nomor resi otomatis.',
      });
    } else if (hasPaymentGateway) {
      systemComponentsList.push({
        label: 'Layanan pembayaran digital',
        text: 'Integrasi Payment Gateway (QRIS Dinamis, Virtual Account, dan E-Wallet) untuk verifikasi pembayaran otomatis.',
      });
    }

    if (isWhatsApp) {
      systemComponentsList.push({
        label: 'Gerbang notifikasi instan',
        text: 'Integrasi WhatsApp Gateway untuk pengiriman notifikasi instan, konfirmasi transaksi, dan broadcast informasi penting.',
      });
    }

    if (isRealtime) {
      systemComponentsList.push({
        label: 'Layanan realtime',
        text: isPOS
          ? 'WebSocket / Supabase Realtime untuk sinkronisasi seketika antara pesanan kasir dan layar barista di dapur.'
          : isGaming
          ? 'WebSocket stream untuk sinkronisasi saldo wallet live, broadcast jackpot, dan status koneksi game.'
          : 'Koneksi realtime untuk pembaruan status dan sinkronisasi data antar pengguna secara instan.',
      });
    }

    if (hasFileUpload) {
      systemComponentsList.push({
        label: 'Penyimpanan file',
        text: `Menyimpan berkas lampiran (${
          isPOS
            ? 'foto nota fisik dan gambar produk'
            : isSchool
            ? 'berkas pendaftaran, ijazah, KK, dan akta kelahiran'
            : 'foto bukti transaksi dan dokumen lampiran'
        }) pada penyimpanan cloud / objek.`,
      });
    }

    if (hasReports) {
      systemComponentsList.push({
        label: 'Generator laporan',
        text: `Membuat berkas rekapitulasi (${
          isPOS
            ? 'laporan omzet harian, penjualan per kasir, dan mutasi stok'
            : isGaming
            ? 'laporan turn-over harian, win/loss, dan rekonsiliasi deposit'
            : 'laporan performa dan rekapitulasi data'
        }) dalam format PDF dan Excel.`,
      });
    }
  }

  // Untuk kompatibilitas backward objek systemComponents lama
  const systemComponents = {
    frontend: frontendDesc,
    backend: backendDesc,
    database: databaseDesc,
    storage: hasFileUpload ? 'Menyimpan berkas lampiran dan bukti fisik pada penyimpanan objek.' : 'Tidak memerlukan penyimpanan file khusus.',
    auth: authDesc,
    reports: hasReports ? 'Membuat berkas laporan PDF dan Excel dari data yang sudah difilter.' : 'Tidak memerlukan generator laporan khusus.',
  };

  // Bangun Mermaid diagram alur sistem yang bersih, vertikal, dan 100% dinamis!
  const systemFlowchartMermaid = enrichOrSynthesizeSystemFlowchart(prd.architecture_diagrams?.system_flowchart, {
    audience: safeAudience,
    frontend: cleanFrontendTech,
    backend: cleanBackendTech,
    database: cleanDbTech,
    moduleNames,
    isAudioOrEdu,
    isPOS,
    isGaming,
    isCrypto,
    isLogistics,
    isWhatsApp,
    isSchool,
    isHealthcare,
    isRealtime,
    hasFileUpload,
    hasReports,
    hasPaymentGateway,
  });

  return {
    intro,
    systemComponents,
    systemComponentsList,
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
  if (t === 'workspaces') return 'ruang kerja atau grup profil pengguna';
  if (t === 'recordings' || t === 'audio' || t.includes('recording')) return 'berkas rekaman audio dan metadata durasi';
  if (t === 'notes' || t === 'catatan') return 'dokumen catatan dan penanda waktu perkuliahan';
  if (t === 'transcriptions' || t === 'transkripsi') return 'hasil konversi audio ke teks via model AI';
  if (t === 'summaries' || t === 'ringkasan') return 'ringkasan materi berstruktur Markdown';
  if (t === 'stores' || t === 'warung' || t === 'toko' || t === 'gudang') return 'profil warung/toko/unit operasional';
  if (t === 'categories' || t === 'kategori') return 'pengelompokan atau kategori entitas';
  if (t === 'products' || t === 'items' || t === 'barang') return 'katalog item atau entitas layanan';
  if (t === 'stock_movements' || t === 'mutasi_stok') return 'catatan riwayat mutasi stok masuk & keluar';
  if (t === 'opname_sessions' || t === 'stok_opname') return 'sesi hitung fisik periodik';
  if (t === 'opname_items' || t === 'opname_details') return 'rincian hasil hitung fisik dan selisih per item';
  if (t === 'orders' || t === 'transactions' || t === 'pesanan') return 'catatan transaksi pesanan / layanan';
  if (t === 'order_items' || t === 'order_details') return 'rincian item dalam tiap transaksi pesanan';
  if (t === 'customers' || t === 'pelanggan') return 'data master pelanggan / klien';
  if (t === 'batch_lots' || t === 'lots' || t === 'batches') return 'kelompok batch masa kadaluarsa (FEFO)';
  if (t === 'returns' || t === 'retur') return 'pengajuan retur barang dari pelanggan';
  if (t === 'return_videos' || t === 'bukti_retur') return 'lampiran video unboxing bukti komplain retur';
  if (t === 'notifications' || t === 'notifikasi') return 'log notifikasi peringatan & pesan sistem';
  if (t.includes('blast_campaign') || t.includes('campaign')) return 'kampanye pengiriman pesan massal / broadcast';
  if (t.includes('blast_message') || t.includes('broadcast_message')) return 'antrean dan riwayat pengiriman pesan blast';
  if (t.includes('device') || t.includes('session_device')) return 'perangkat WhatsApp gateway yang terhubung';
  if (t.includes('contact') || t.includes('recipient')) return 'buku kontak dan daftar nomor penerima';
  if (t.includes('template')) return 'templat pesan broadcast dinamis';
  if (t.includes('webhook')) return 'log pengiriman callback dan webhook';
  if (t === 'audit_logs') return 'rekam jejak aktivitas audit sistem';
  if (t === 'services' || t === 'layanan') return 'katalog daftar layanan / jasa dan durasi pengerjaan';
  if (t === 'bookings' || t === 'reservasi' || t === 'jadwal_booking') return 'transaksi pemesanan jadwal / slot waktu';
  if (t === 'schedules' || t === 'staff_schedules') return 'jadwal ketersediaan operasional / staf / terapis';
  if (t === 'payments' || t === 'pembayaran') return 'catatan pembayaran transaksi dan bukti QRIS / transfer';
  if (t === 'reviews' || t === 'ulasan' || t === 'ratings') return 'ulasan, testimoni, dan penilaian bintang pelanggan';
  if (t === 'rental_items' || t === 'alat_sewa') return 'katalog alat atau unit aset yang dapat disewa';
  if (t === 'fines' || t === 'denda') return 'pencatatan denda keterlambatan atau kerusakan barang sewa';
  if (t === 'deposits' || t === 'uang_jaminan') return 'uang jaminan sewa yang dapat dikembalikan';
  if (t === 'students' || t === 'siswa') return 'data master profil siswa / pendaftar';
  if (t === 'guardians' || t === 'wali') return 'data orang tua / wali murid';
  if (t === 'registrations' || t === 'pendaftaran') return 'berkas pendaftaran dan verifikasi calon siswa';
  if (t === 'patients' || t === 'pasien') return 'data rekam identitas pasien';
  if (t === 'appointments' || t === 'antrean') return 'janji temu dokter dan nomor antrean pasien';
  if (t === 'medical_records' || t === 'rekam_medis') return 'riwayat diagnosis, tindakan medis, dan catatan dokter';
  if (t === 'cash_shifts' || t === 'shift_kasir') return 'sesi buka/tutup kasir dan rekonsiliasi kas harian';
  if (t === 'carts' || t === 'keranjang') return 'keranjang belanja sementara pengguna';
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
  if (c === 'campaign_id' || c === 'blast_campaign_id') return 'Relasi ke blast_campaigns';
  if (c === 'device_id') return 'Relasi ke devices';

  if (c === 'name' || c === 'nama') {
    if (t.includes('user')) return 'Nama pengguna';
    if (t.includes('campaign')) return 'Nama atau judul kampanye blast';
    if (t.includes('message')) return 'Judul atau ringkasan pesan broadcast';
    if (t.includes('device')) return 'Nama perangkat WhatsApp gateway';
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
  if (c === 'phone' || c === 'phone_number' || c === 'telepon' || c === 'no_hp' || c === 'recipient_number') return 'Nomor WhatsApp aktif / tujuan';
  if (c === 'message_body' || c === 'content') return 'Isi teks pesan broadcast';
  if (c === 'qr_code') return 'Kode QR autentikasi koneksi WhatsApp';
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
  if (c === 'status') {
    if (t.includes('message')) return 'Status pengiriman (pending / terkirim / gagal)';
    if (t.includes('campaign')) return 'Status kampanye (draft / berjalan / selesai)';
    if (t.includes('device')) return 'Status koneksi (terhubung / terputus / scan qr)';
    return 'Status operasional (draft / selesai)';
  }
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

  if (t === 'services' || t === 'layanan') {
    cols.push(
      { name: 'user_id', type: 'text', purpose: 'Relasi ke users (penyedia)' },
      { name: 'name', type: 'text', purpose: 'Nama layanan / jasa' },
      { name: 'description', type: 'text', purpose: 'Deskripsi lengkap layanan' },
      { name: 'price', type: 'numeric', purpose: 'Tarif / harga layanan' },
      { name: 'duration_minutes', type: 'integer', purpose: 'Estimasi durasi pengerjaan (menit)' },
      { name: 'is_active', type: 'boolean', purpose: 'Status ketersediaan layanan' },
      { name: 'created_at', type: 'timestamp', purpose: 'Waktu dibuat' }
    );
    return cols;
  }

  if (t === 'bookings' || t === 'reservasi' || t === 'jadwal_booking') {
    cols.push(
      { name: 'user_id', type: 'text', purpose: 'Relasi ke users (pemesan)' },
      { name: 'service_id', type: 'text', purpose: 'Relasi ke services' },
      { name: 'booking_code', type: 'text', purpose: 'Kode booking unik verifikasi' },
      { name: 'booking_date', type: 'timestamp', purpose: 'Tanggal reservasi yang dipilih' },
      { name: 'start_time', type: 'text', purpose: 'Jam mulai sesi' },
      { name: 'end_time', type: 'text', purpose: 'Jam selesai sesi' },
      { name: 'status', type: 'text', purpose: 'Status (pending / confirmed / completed / cancelled)' },
      { name: 'total_amount', type: 'numeric', purpose: 'Total tagihan pembayaran' },
      { name: 'notes', type: 'text', purpose: 'Catatan permintaan khusus pelanggan' },
      { name: 'created_at', type: 'timestamp', purpose: 'Waktu pemesanan' }
    );
    return cols;
  }

  if (t === 'schedules' || t === 'staff_schedules') {
    cols.push(
      { name: 'user_id', type: 'text', purpose: 'Relasi ke users' },
      { name: 'day_of_week', type: 'text', purpose: 'Hari operasional (Senin - Minggu)' },
      { name: 'start_time', type: 'text', purpose: 'Jam buka operasional' },
      { name: 'end_time', type: 'text', purpose: 'Jam tutup operasional' },
      { name: 'is_available', type: 'boolean', purpose: 'Apakah slot waktu buka untuk dipesan' },
      { name: 'created_at', type: 'timestamp', purpose: 'Waktu dibuat' }
    );
    return cols;
  }

  if (t === 'payments' || t === 'pembayaran') {
    cols.push(
      { name: 'user_id', type: 'text', purpose: 'Relasi ke users' },
      { name: 'order_id', type: 'text', purpose: 'Relasi ke transaksi (orders/bookings)' },
      { name: 'invoice_number', type: 'text', purpose: 'Nomor faktur / invoice pembayaran' },
      { name: 'amount', type: 'numeric', purpose: 'Nominal pembayaran' },
      { name: 'payment_method', type: 'text', purpose: 'Metode (QRIS, Transfer, Cash)' },
      { name: 'payment_status', type: 'text', purpose: 'Status (unpaid / paid / expired / refunded)' },
      { name: 'paid_at', type: 'timestamp', purpose: 'Waktu pelunasan pembayaran' },
      { name: 'created_at', type: 'timestamp', purpose: 'Waktu invoice dibuat' }
    );
    return cols;
  }

  if (t === 'reviews' || t === 'ulasan' || t === 'ratings') {
    cols.push(
      { name: 'user_id', type: 'text', purpose: 'Relasi ke users' },
      { name: 'target_id', type: 'text', purpose: 'ID produk / layanan yang diulas' },
      { name: 'rating', type: 'integer', purpose: 'Skor bintang kepuasan (1-5)' },
      { name: 'comment', type: 'text', purpose: 'Teks ulasan dan feedback pelanggan' },
      { name: 'created_at', type: 'timestamp', purpose: 'Waktu ulasan dibuat' }
    );
    return cols;
  }

  if (t === 'rental_items' || t === 'alat_sewa') {
    cols.push(
      { name: 'user_id', type: 'text', purpose: 'Relasi ke users' },
      { name: 'name', type: 'text', purpose: 'Nama barang / alat sewa' },
      { name: 'category', type: 'text', purpose: 'Kategori barang' },
      { name: 'daily_rate', type: 'numeric', purpose: 'Tarif sewa per hari' },
      { name: 'deposit_amount', type: 'numeric', purpose: 'Besaran uang deposit jaminan' },
      { name: 'available_stock', type: 'integer', purpose: 'Jumlah unit siap disewa' },
      { name: 'created_at', type: 'timestamp', purpose: 'Waktu dibuat' }
    );
    return cols;
  }

  if (t === 'fines' || t === 'denda') {
    cols.push(
      { name: 'booking_id', type: 'text', purpose: 'Relasi ke pemesanan sewa' },
      { name: 'fine_type', type: 'text', purpose: 'Jenis denda (keterlambatan / kerusakan)' },
      { name: 'amount', type: 'numeric', purpose: 'Nominal denda' },
      { name: 'reason', type: 'text', purpose: 'Keterangan alasan pengenaan denda' },
      { name: 'is_paid', type: 'boolean', purpose: 'Status apakah denda sudah dilunasi' },
      { name: 'created_at', type: 'timestamp', purpose: 'Waktu pencatatan denda' }
    );
    return cols;
  }

  if (t === 'students' || t === 'siswa') {
    cols.push(
      { name: 'user_id', type: 'text', purpose: 'Relasi ke akun pengguna' },
      { name: 'full_name', type: 'text', purpose: 'Nama lengkap siswa calon peserta' },
      { name: 'nisn', type: 'text', purpose: 'Nomor Induk Siswa Nasional (NISN)' },
      { name: 'date_of_birth', type: 'timestamp', purpose: 'Tanggal lahir siswa' },
      { name: 'gender', type: 'text', purpose: 'Jenis kelamin' },
      { name: 'address', type: 'text', purpose: 'Alamat tempat tinggal siswa' },
      { name: 'registration_status', type: 'text', purpose: 'Status (draft / terdaftar / diterima)' },
      { name: 'created_at', type: 'timestamp', purpose: 'Waktu registrasi' }
    );
    return cols;
  }

  if (t === 'guardians' || t === 'wali') {
    cols.push(
      { name: 'student_id', type: 'text', purpose: 'Relasi ke tabel students' },
      { name: 'full_name', type: 'text', purpose: 'Nama lengkap orang tua / wali' },
      { name: 'relationship', type: 'text', purpose: 'Hubungan (Ayah / Ibu / Wali)' },
      { name: 'phone_number', type: 'text', purpose: 'Nomor telepon WhatsApp aktif' },
      { name: 'occupation', type: 'text', purpose: 'Pekerjaan orang tua / wali' },
      { name: 'created_at', type: 'timestamp', purpose: 'Waktu pencatatan' }
    );
    return cols;
  }

  if (t === 'registrations' || t === 'pendaftaran') {
    cols.push(
      { name: 'student_id', type: 'text', purpose: 'Relasi ke tabel students' },
      { name: 'registration_code', type: 'text', purpose: 'Nomor registrasi unik pendaftaran' },
      { name: 'batch_name', type: 'text', purpose: 'Gelombang pendaftaran (mis. Gelombang 1)' },
      { name: 'status', type: 'text', purpose: 'Status seleksi (menunggu / lolos / gugur)' },
      { name: 'verified_at', type: 'timestamp', purpose: 'Waktu verifikasi berkas oleh admin' },
      { name: 'created_at', type: 'timestamp', purpose: 'Waktu formulir diajukan' }
    );
    return cols;
  }

  if (t === 'patients' || t === 'pasien') {
    cols.push(
      { name: 'user_id', type: 'text', purpose: 'Relasi ke users' },
      { name: 'medical_record_number', type: 'text', purpose: 'Nomor Rekam Medis (RM) unik' },
      { name: 'full_name', type: 'text', purpose: 'Nama lengkap pasien' },
      { name: 'phone_number', type: 'text', purpose: 'Nomor WhatsApp kontak darurat' },
      { name: 'blood_type', type: 'text', purpose: 'Golongan darah pasien' },
      { name: 'address', type: 'text', purpose: 'Alamat tempat tinggal' },
      { name: 'created_at', type: 'timestamp', purpose: 'Waktu rekam pertama kali dibuat' }
    );
    return cols;
  }

  if (t === 'appointments' || t === 'antrean') {
    cols.push(
      { name: 'patient_id', type: 'text', purpose: 'Relasi ke tabel patients' },
      { name: 'doctor_id', type: 'text', purpose: 'Relasi ke dokter pemeriksa' },
      { name: 'appointment_date', type: 'timestamp', purpose: 'Tanggal janji temu' },
      { name: 'queue_number', type: 'integer', purpose: 'Nomor urut antrean harian' },
      { name: 'status', type: 'text', purpose: 'Status (menunggu / diperiksa / selesai / batal)' },
      { name: 'created_at', type: 'timestamp', purpose: 'Waktu pembuatan janji temu' }
    );
    return cols;
  }

  if (t === 'medical_records' || t === 'rekam_medis') {
    cols.push(
      { name: 'patient_id', type: 'text', purpose: 'Relasi ke tabel patients' },
      { name: 'doctor_id', type: 'text', purpose: 'Relasi ke dokter pemeriksa' },
      { name: 'diagnosis', type: 'text', purpose: 'Diagnosis klinis hasil pemeriksaan' },
      { name: 'prescription', type: 'text', purpose: 'Resep obat dan instruksi dosis' },
      { name: 'treatment_notes', type: 'text', purpose: 'Tindakan medis yang diberikan' },
      { name: 'created_at', type: 'timestamp', purpose: 'Waktu pemeriksaan selesai' }
    );
    return cols;
  }

  if (t === 'devices' || t === 'session_devices') {
    cols.push(
      { name: 'user_id', type: 'text', purpose: 'Relasi ke users' },
      { name: 'session_name', type: 'text', purpose: 'Nama sesi perangkat WhatsApp' },
      { name: 'phone_number', type: 'text', purpose: 'Nomor WhatsApp yang terhubung' },
      { name: 'status', type: 'text', purpose: 'Status koneksi (connected / disconnected / qr)' },
      { name: 'last_seen_at', type: 'timestamp', purpose: 'Waktu aktif terakhir' },
      { name: 'created_at', type: 'timestamp', purpose: 'Waktu perangkat ditambahkan' }
    );
    return cols;
  }

  if (t === 'contacts' || t === 'recipients') {
    cols.push(
      { name: 'user_id', type: 'text', purpose: 'Relasi ke users' },
      { name: 'name', type: 'text', purpose: 'Nama kontak penerima pesan' },
      { name: 'phone_number', type: 'text', purpose: 'Nomor WhatsApp aktif' },
      { name: 'group_name', type: 'text', purpose: 'Grup / label segmentasi kontak' },
      { name: 'created_at', type: 'timestamp', purpose: 'Waktu kontak disimpan' }
    );
    return cols;
  }

  if (t === 'blast_campaigns' || t === 'campaigns') {
    cols.push(
      { name: 'user_id', type: 'text', purpose: 'Relasi ke users' },
      { name: 'device_id', type: 'text', purpose: 'Relasi ke perangkat gateway' },
      { name: 'campaign_name', type: 'text', purpose: 'Nama inisiatif kampanye broadcast' },
      { name: 'total_recipients', type: 'integer', purpose: 'Jumlah target penerima pesan' },
      { name: 'sent_count', type: 'integer', purpose: 'Jumlah pesan berhasil dikirim' },
      { name: 'failed_count', type: 'integer', purpose: 'Jumlah pesan gagal dikirim' },
      { name: 'status', type: 'text', purpose: 'Status (draft / running / completed / paused)' },
      { name: 'scheduled_at', type: 'timestamp', purpose: 'Jadwal waktu pengiriman otomatis' },
      { name: 'created_at', type: 'timestamp', purpose: 'Waktu kampanye dibuat' }
    );
    return cols;
  }

  if (t === 'blast_messages' || t === 'messages') {
    cols.push(
      { name: 'campaign_id', type: 'text', purpose: 'Relasi ke blast_campaigns' },
      { name: 'recipient_phone', type: 'text', purpose: 'Nomor telepon tujuan pesan' },
      { name: 'message_text', type: 'text', purpose: 'Isi teks pesan broadcast' },
      { name: 'status', type: 'text', purpose: 'Status pengiriman (queued / sent / failed)' },
      { name: 'sent_at', type: 'timestamp', purpose: 'Waktu pesan terkirim' },
      { name: 'created_at', type: 'timestamp', purpose: 'Waktu dimasukkan ke antrean' }
    );
    return cols;
  }

  if (t === 'cash_shifts' || t === 'shift_kasir') {
    cols.push(
      { name: 'user_id', type: 'text', purpose: 'Relasi ke users (kasir)' },
      { name: 'starting_cash', type: 'numeric', purpose: 'Modal kas awal saat shift dibuka' },
      { name: 'closing_cash', type: 'numeric', purpose: 'Total kas fisik saat shift ditutup' },
      { name: 'system_cash', type: 'numeric', purpose: 'Total penerimaan menurut sistem kasir' },
      { name: 'difference', type: 'numeric', purpose: 'Selisih kas (fisik - sistem)' },
      { name: 'status', type: 'text', purpose: 'Status shift (open / closed)' },
      { name: 'opened_at', type: 'timestamp', purpose: 'Waktu shift kasir dibuka' },
      { name: 'closed_at', type: 'timestamp', purpose: 'Waktu shift kasir ditutup' }
    );
    return cols;
  }

  if (t === 'carts' || t === 'keranjang') {
    cols.push(
      { name: 'user_id', type: 'text', purpose: 'Relasi ke users' },
      { name: 'product_id', type: 'text', purpose: 'Relasi ke products' },
      { name: 'quantity', type: 'integer', purpose: 'Jumlah unit barang dalam keranjang' },
      { name: 'created_at', type: 'timestamp', purpose: 'Waktu dimasukkan ke keranjang' }
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

  // 2. Ekstraksi Sekunder: Parse Entity Block dari Mermaid ERD jika tabel masih kurang dari 6
  if (parsedTables.length < 6 && rawErd) {
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

  // 3. Sinkronkan dengan Feature Breakdown (ekstraksi tech_mapping.db_tables dan semantik fitur)
  if (prd.feature_breakdown && Array.isArray(prd.feature_breakdown)) {
    prd.feature_breakdown.forEach((f) => {
      // A. Ambil dari db_tables jika ada
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

      // B. Deteksi semantik jika tabel masih kurang dari 6
      if (parsedTables.length < 6) {
        const fStr = `${f.id || ''} ${f.name || ''} ${f.user_story || ''}`.toLowerCase();
        const candidateTables: string[] = [];
        if (fStr.includes('booking') || fStr.includes('reservasi') || fStr.includes('jadwal') || fStr.includes('slot')) {
          candidateTables.push('bookings', 'schedules');
        }
        if (fStr.includes('katalog') || fStr.includes('menu') || fStr.includes('produk') || fStr.includes('barang')) {
          candidateTables.push('products', 'categories');
        }
        if (fStr.includes('layanan') || fStr.includes('service') || fStr.includes('paket')) {
          candidateTables.push('services');
        }
        if (fStr.includes('pembayaran') || fStr.includes('qris') || fStr.includes('bayar') || fStr.includes('order')) {
          candidateTables.push('orders', 'payments');
        }
        if (fStr.includes('notifikasi') || fStr.includes('whatsapp') || fStr.includes('blast')) {
          candidateTables.push('notifications');
        }
        if (fStr.includes('ulasan') || fStr.includes('rating') || fStr.includes('review')) {
          candidateTables.push('reviews');
        }
        if (fStr.includes('rental') || fStr.includes('sewa')) {
          candidateTables.push('rental_items', 'fines');
        }
        if (fStr.includes('siswa') || fStr.includes('santri') || fStr.includes('ppdb')) {
          candidateTables.push('students', 'registrations');
        }
        if (fStr.includes('pasien') || fStr.includes('klinik') || fStr.includes('dokter')) {
          candidateTables.push('patients', 'appointments');
        }

        candidateTables.forEach((cand) => {
          if (!knownTableNames.has(cand)) {
            knownTableNames.add(cand);
            parsedTables.push({
              number: parsedTables.length + 1,
              name: cand,
              description: getTableDescription(cand),
              columns: synthesizeDefaultColumnsForTable(cand),
            });
          }
        });
      }
    });
  }

  // 4. Pastikan tabel pondasi utama (Core Foundation Tables) selalu tersedia minimal 6-8 tabel
  const titleLower = (prd.title || '').toLowerCase();
  const archetypeStr = JSON.stringify(prd.archetype_detection || {}).toLowerCase();
  const fullDomainStr = `${titleLower} ${archetypeStr}`;

  let baseFoundationList: string[] = [];

  if (
    fullDomainStr.includes('stok') ||
    fullDomainStr.includes('gudang') ||
    fullDomainStr.includes('toko') ||
    fullDomainStr.includes('kasir') ||
    fullDomainStr.includes('pos') ||
    fullDomainStr.includes('warung') ||
    fullDomainStr.includes('fefo') ||
    fullDomainStr.includes('inventory')
  ) {
    baseFoundationList = [
      'users',
      'sessions',
      'stores',
      'categories',
      'products',
      'stock_movements',
      'opname_sessions',
      'opname_items',
    ];
  } else if (
    fullDomainStr.includes('sekolah') ||
    fullDomainStr.includes('ppdb') ||
    fullDomainStr.includes('edukasi') ||
    fullDomainStr.includes('santri') ||
    fullDomainStr.includes('pesantren')
  ) {
    baseFoundationList = [
      'users',
      'sessions',
      'students',
      'guardians',
      'registrations',
      'payment_bills',
      'notifications',
    ];
  } else if (
    fullDomainStr.includes('booking') ||
    fullDomainStr.includes('salon') ||
    fullDomainStr.includes('barber') ||
    fullDomainStr.includes('futsal') ||
    fullDomainStr.includes('lapangan') ||
    fullDomainStr.includes('jadwal')
  ) {
    baseFoundationList = [
      'users',
      'sessions',
      'services',
      'staff_schedules',
      'bookings',
      'payments',
      'reviews',
      'notifications',
    ];
  } else if (fullDomainStr.includes('rental') || fullDomainStr.includes('sewa')) {
    baseFoundationList = [
      'users',
      'sessions',
      'rental_items',
      'bookings',
      'payments',
      'deposits',
      'fines',
      'notifications',
    ];
  } else if (
    fullDomainStr.includes('klinik') ||
    fullDomainStr.includes('dokter') ||
    fullDomainStr.includes('pasien') ||
    fullDomainStr.includes('kesehatan')
  ) {
    baseFoundationList = [
      'users',
      'sessions',
      'patients',
      'appointments',
      'medical_records',
      'payments',
      'notifications',
    ];
  } else if (
    fullDomainStr.includes('blast') ||
    fullDomainStr.includes('broadcast') ||
    fullDomainStr.includes('whatsapp') ||
    fullDomainStr.includes('gateway')
  ) {
    baseFoundationList = [
      'users',
      'sessions',
      'devices',
      'contacts',
      'blast_campaigns',
      'blast_messages',
      'notifications',
    ];
  } else if (
    fullDomainStr.includes('laundry') ||
    fullDomainStr.includes('cuci') ||
    fullDomainStr.includes('bengkel') ||
    fullDomainStr.includes('jasa')
  ) {
    baseFoundationList = [
      'users',
      'sessions',
      'services',
      'orders',
      'order_items',
      'payments',
      'reviews',
      'notifications',
    ];
  } else if (
    fullDomainStr.includes('toko') ||
    fullDomainStr.includes('belanja') ||
    fullDomainStr.includes('ecommerce') ||
    fullDomainStr.includes('katalog') ||
    fullDomainStr.includes('kasir') ||
    fullDomainStr.includes('pos')
  ) {
    baseFoundationList = [
      'users',
      'categories',
      'products',
      'orders',
      'order_items',
      'payments',
      'notifications',
    ];
  } else {
    // Default Neutral SaaS / Modern Application
    baseFoundationList = [
      'users',
      'workspaces',
      'core_records',
      'attachments',
      'activity_logs',
      'settings',
      'notifications',
    ];
  }

  // Jika tabel terurai masih di bawah 6, injeksikan tabel pondasi domain terpilih
  if (parsedTables.length < 6) {
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
  }

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

  // 5. Bangun Mermaid ERD diagram yang bersih, dinamis, dan menghubungkan seluruh tabel
  let cleanErd = 'erDiagram\n';
  const tableNames = parsedTables.map((t) => t.name.toLowerCase());
  const connectedTables = new Set<string>();
  const addedRelationPairs = new Set<string>();

  const addRelation = (parent: string, child: string, label: string) => {
    if (parent === child) return;
    const pairKey = `${parent}->${child}`;
    const reversePairKey = `${child}->${parent}`;
    if (addedRelationPairs.has(pairKey) || addedRelationPairs.has(reversePairKey)) return;

    if (tableNames.includes(parent) && tableNames.includes(child)) {
      cleanErd += `  ${parent} ||--o{ ${child} : "${label}"\n`;
      addedRelationPairs.add(pairKey);
      connectedTables.add(parent);
      connectedTables.add(child);
    }
  };

  // Tahap A: Ekstraksi relasi dari diagram AI asli (rawErd) jika ada
  if (rawErd && rawErd.includes('||--')) {
    const relRegex = /([a-zA-Z0-9_]+)\s*(?:\|\|--o\{|\|\|--\|\{|--o\{|--\|\{|\|\|--\|\|)\s*([a-zA-Z0-9_]+)\s*(?::\s*["']?([^"'\n]+)["']?)?/gi;
    let match: RegExpExecArray | null;
    while ((match = relRegex.exec(rawErd)) !== null) {
      const p = match[1].trim().toLowerCase();
      const c = match[2].trim().toLowerCase();
      const lbl = match[3]?.trim() || 'relates_to';
      if (p !== c && tableNames.includes(p) && tableNames.includes(c)) {
        addRelation(p, c, lbl);
      }
    }
  }

  // Tahap B: Deteksi relasi otomatis dari kolom Foreign Key (*_id) pada setiap tabel
  parsedTables.forEach((table) => {
    const childName = table.name.toLowerCase();
    table.columns.forEach((col) => {
      const colName = col.name.toLowerCase();
      if (colName.endsWith('_id') && colName !== 'id') {
        const rawTarget = colName.slice(0, -3); // e.g. 'user', 'campaign', 'device', 'store'
        // Cari tabel yang cocok di tableNames
        const matchedParent = tableNames.find((t) => {
          if (t === childName) return false;
          if (t === rawTarget) return true;
          if (t === rawTarget + 's') return true;
          if (t === rawTarget + 'es') return true;
          if (t.endsWith(rawTarget + 's')) return true;
          if (t.endsWith(rawTarget)) return true;
          if (rawTarget.endsWith(t)) return true;
          return false;
        });

        if (matchedParent) {
          const relLabel = col.purpose?.toLowerCase().includes('relasi')
            ? 'terhubung'
            : 'memiliki';
          addRelation(matchedParent, childName, relLabel);
        }
      }
    });
  });

  // Tahap C: Relasi domain umum yang lazim
  addRelation('users', 'sessions', 'memiliki');
  addRelation('users', 'devices', 'menghubungkan');
  addRelation('users', 'blast_campaigns', 'membuat');
  addRelation('blast_campaigns', 'blast_messages', 'berisi');
  addRelation('devices', 'blast_messages', 'mengirim');
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
  addRelation('users', 'services', 'mengelola');
  addRelation('users', 'staff_schedules', 'memiliki');
  addRelation('users', 'bookings', 'membuat');
  addRelation('services', 'bookings', 'dipesan pada');
  addRelation('bookings', 'payments', 'menghasilkan tagihan');
  addRelation('orders', 'payments', 'menghasilkan tagihan');
  addRelation('users', 'payments', 'melakukan');
  addRelation('users', 'reviews', 'menulis');
  addRelation('services', 'reviews', 'diulas pada');
  addRelation('products', 'reviews', 'diulas pada');
  addRelation('users', 'rental_items', 'mengelola');
  addRelation('rental_items', 'bookings', 'disewa pada');
  addRelation('bookings', 'deposits', 'memerlukan');
  addRelation('bookings', 'fines', 'dikenakan');
  addRelation('users', 'students', 'mendaftarkan');
  addRelation('students', 'guardians', 'didampingi');
  addRelation('students', 'registrations', 'mengajukan berkas');
  addRelation('registrations', 'document_files', 'melampirkan');
  addRelation('students', 'payment_bills', 'membayar');
  addRelation('users', 'patients', 'mendaftarkan');
  addRelation('doctors', 'appointments', 'menangani');
  addRelation('patients', 'appointments', 'membuat');
  addRelation('patients', 'medical_records', 'memiliki');
  addRelation('doctors', 'medical_records', 'mencatat');
  addRelation('users', 'carts', 'memiliki');
  addRelation('products', 'carts', 'disimpan di');
  addRelation('users', 'cash_shifts', 'menjalankan');

  // Tahap D: JAMINAN 100% - Pastikan SETIAP tabel di parsedTables memiliki relasi agar TIDAK ADA tabel yang hilang dari visual Mermaid!
  const rootParent = tableNames.includes('users') ? 'users' : parsedTables[0]?.name.toLowerCase() || 'users';
  parsedTables.forEach((t) => {
    const tName = t.name.toLowerCase();
    if (tName !== rootParent && !connectedTables.has(tName)) {
      addRelation(rootParent, tName, 'mengelola');
    }
  });

  // Jika setelah semua tahap di atas hanya ada 1 tabel atau belum ada relasi
  if (cleanErd.trim() === 'erDiagram' && parsedTables.length > 1) {
    for (let i = 1; i < parsedTables.length; i++) {
      addRelation(rootParent, parsedTables[i].name.toLowerCase(), 'memiliki');
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
