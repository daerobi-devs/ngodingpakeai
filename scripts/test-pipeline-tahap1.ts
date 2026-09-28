import { createClient } from '@supabase/supabase-js';
import { PRDFormData, TechStackInfo } from '../src/types/prd';
import { createKeyPool, GeminiSlotTarget } from '../src/lib/gemini/gemini-client';
import { generatePRDPipeline } from '../src/lib/pipeline/prd-pipeline';

async function main() {
  console.log('=== MEMULAI TEST PIPELINE TAHAP 1 ===');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase credentials tidak ditemukan di environment.');
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const { data: settings, error } = await supabase
    .from('system_settings')
    .select('*')
    .eq('id', 'default')
    .single();

  if (error || !settings) {
    throw new Error('Gagal mengambil system_settings dari Supabase: ' + error?.message);
  }

  const slots = settings.gemini_slots || [];
  const activeSlots: GeminiSlotTarget[] = slots
    .filter((s: any) => s.isActive && s.key)
    .map((s: any) => ({
      id: s.id,
      label: s.label,
      key: s.key,
      preferredModel: s.preferredModel || 'gemini-3.1-flash-lite',
    }));

  if (activeSlots.length === 0) {
    throw new Error('Tidak ada Gemini Slot yang aktif.');
  }

  console.log(`Menemukan ${activeSlots.length} slot Gemini aktif:`);
  activeSlots.forEach((s) => console.log(`- ${s.label}: ${s.preferredModel}`));

  const keyPool = createKeyPool(activeSlots.map((s) => s.key));

  const testFormData: any = {
    appName: 'Catatin',
    description:
      'Aplikasi asisten pencatat kuliah berbasis audio cerdas untuk mahasiswa. Mahasiswa dapat merekam penjelasan dosen secara offline di ruang kuliah menggunakan browser (MediaRecorder & IndexedDB). Ketika online, rekaman disinkronisasikan ke Supabase Storage dan diproses menggunakan Gemini API untuk menghasilkan transkrip perkuliahan, ringkasan topik utama, serta glosarium istilah penting dalam format Markdown. Mahasiswa dapat mengedit catatan secara interaktif berdampingan dengan pemutar audio dan mengekspor hasilnya ke format PDF/DOCX.',
    targetAudience: 'Mahasiswa perguruan tinggi dan akademisi',
    coreProblem:
      'Mahasiswa sering tertinggal mencatat saat dosen mengajar dengan cepat di kelas, dan koneksi internet di ruang kelas seringkali buruk atau tidak stabil sehingga perekam konvensional berbasis cloud gagal berfungsi.',
    keyFlow:
      '1. Mahasiswa membuka aplikasi di kelas secara offline lalu memulai rekaman perkuliahan yang disimpan lokal di IndexedDB.\n2. Mahasiswa menambahkan penanda waktu (timestamp note) selama rekaman berlangsung.\n3. Ketika perangkat terhubung kembali ke internet, audio diunggah otomatis ke Supabase Storage.\n4. Server memanggil Gemini API untuk transkripsi audio dan ekstraksi ringkasan berstruktur Markdown.\n5. Mahasiswa membaca, merevisi catatan di editor berdampingan dengan audio player, dan mengekspor dokumen ke PDF/DOCX.',
  };

  const testTechStack: any = {
    frontend: 'Next.js 16 (App Router) + Tailwind CSS v4',
    backend: 'Next.js Server Actions & API Routes',
    database: 'Supabase PostgreSQL dengan Row Level Security (RLS)',
    auth: 'Supabase Auth (JWT & Email / Google OAuth)',
    deployment: 'Vercel / Coolify Self-Hosted',
  };

  console.log('\n[TEST RUN] Menjalankan generatePRDPipeline...');
  const startTime = Date.now();

  const prd = await generatePRDPipeline({
    formData: testFormData,
    techStack: testTechStack,
    language: 'id',
    apiKeyPool: keyPool,
    preferredModel: activeSlots[0].preferredModel,
    slotTargets: activeSlots,
    onProgress: (stage, name, detail) => {
      console.log(`[Stage ${stage}] ${name}: ${detail}`);
    },
  });

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n=== PIPELINE BERHASIL DALAM ${durationSec} DETIK ===\n`);

  console.log('Judul PRD:', prd.title);
  console.log('Target Persona:', prd.archetype_detection?.target_audience);
  console.log('Jumlah Fitur:', prd.feature_breakdown?.length || 0);
  console.log('Jumlah Task:', prd.task_breakdown?.length || 0);
  console.log('Model yang Digunakan:', prd.metadata?.modelUsed);
  console.log('Slot yang Digunakan:', prd.metadata?.geminiSlotUsed);

  // UJI KEBOCORAN DOMAIN
  console.log('\n=== EVALUASI KEBOCORAN DOMAIN ===');
  const fullPrdJson = JSON.stringify(prd).toLowerCase();
  const bannedTerms = ['toko', 'barang', 'kasir', 'stok', 'pelanggan', 'keranjang', 'checkout'];
  const leakages: string[] = [];

  for (const term of bannedTerms) {
    const matches = fullPrdJson.match(new RegExp(`\\b${term}\\b`, 'gi'));
    if (matches) {
      leakages.push(`${term} (muncul ${matches.length} kali)`);
    }
  }

  if (leakages.length === 0) {
    console.log('HASIL UJI KEBOCORAN: BERSIH 100%! Tidak ada satupun istilah toko/barang/kasir yang bocor.');
  } else {
    console.error('HASIL UJI KEBOCORAN: TERDETEKSI KEBOCORAN DOMAIN:');
    leakages.forEach((l) => console.error('  - ' + l));
  }

  // UJI STRUKTUR PERSYARATAN & ASSUMPTIONS
  console.log('\n=== EVALUASI STRUKTUR ASUMSI & BATASAN ===');
  const hasInScope = fullPrdJson.includes('termasuk dalam mvp');
  const hasOutOfScope = fullPrdJson.includes('di luar cakupan');
  console.log('Label [Termasuk dalam MVP]:', hasInScope ? 'ADA' : 'TIDAK ADA');
  console.log('Label [Di Luar Cakupan]:', hasOutOfScope ? 'ADA' : 'TIDAK ADA');

  // UJI FITUR FORMAT USER-ACTION-OUTCOME
  console.log('\n=== CONTOH FITUR YANG DIHASILKAN ===');
  prd.feature_breakdown?.slice(0, 3).forEach((f: any, idx: number) => {
    console.log(`\nFitur #${idx + 1} [${f.priority}] [${f.phase}]: ${f.name}`);
    console.log(`User Story: ${f.user_story}`);
    console.log(`Happy Path (Langkah 1): ${f.happy_path?.[0]}`);
    console.log(`Business Rule (Aturan 1): ${f.business_rules?.[0]}`);
    console.log(`Tech Mapping: DB Tables = [${f.tech_mapping?.db_tables?.join(', ')}]`);
  });

  // UJI SKEMA DATABASE
  console.log('\n=== SKEMA DATABASE ===');
  if (prd.architecture_diagrams?.database_erd) {
    console.log('Database ERD Mermaid diagram tersedia.');
    const dbPreview = prd.architecture_diagrams.database_erd.slice(0, 300);
    console.log('Cuplikan ERD:\n' + dbPreview + '...\n');
  } else {
    console.log('Database ERD tidak ditemukan.');
  }

  console.log('=== TEST TAHAP 1 SELESAI ===');
}

main().catch((err) => {
  console.error('TEST ERROR:', err);
  process.exit(1);
});
