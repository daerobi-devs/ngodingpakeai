import { PRDOutput, ClarificationQuestion } from '@/types/prd';
import {
  PRDOutputZodSchema,
  normalizeAndSanitizePRDOutput,
  normalizeAndSanitizeClarifications,
  normalizeAndSanitizeFeatureModules,
  synthesizeDomainFeatureModules,
  synthesizeDynamicArchitectureDiagrams,
  FeatureTreeModuleOutput,
} from '@/lib/gemini/schemas';
import {
  createKeyPool,
  generateStructuredPRD as generateGeminiDirect,
  generateClarifications as generateGeminiClarifications,
  generateGeminiFeatureTree,
  getKeysFromSettings,
  resolveGeminiKeysAndSlot,
} from '@/lib/gemini/gemini-client';
import { SystemSettings, AiProvider } from '@/lib/supabase/types';
import { normalizeOpenAiEndpoint, parseOpenAiChatResponse, repairAndParseJSON } from './openai-compat';
import { getDomainDiscoveryQuestions } from '@/lib/gemini/domain-discovery';

interface GenerateOptions {
  systemSettings: SystemSettings;
  userGeminiKey?: string;
  systemPrompt: string;
  userPrompt: string;
  isPro?: boolean;
  userId?: string;
  assignedGeminiSlot?: string | null;
  signal?: AbortSignal;
  userPreferredModel?: string;
}

export async function generatePRDUnified(options: GenerateOptions): Promise<PRDOutput> {
  const {
    systemSettings,
    userGeminiKey,
    systemPrompt,
    userPrompt,
    isPro,
    userId,
    signal,
    userPreferredModel,
  } = options;

  // Resolve provider & model based on PRO status and preferred overrides
  const provider: AiProvider = isPro
    ? (systemSettings.pro_ai_provider || systemSettings.ai_provider || 'nine_router')
    : (systemSettings.free_ai_provider || systemSettings.ai_provider || 'gemini_direct');

  const preferredModel = userPreferredModel?.trim() || (isPro ? systemSettings.pro_model : systemSettings.free_model);

  // 1. 9Router provider
  if (provider === 'nine_router') {
    const endpoint = normalizeOpenAiEndpoint(systemSettings.nine_router_url);
    const apiKey = systemSettings.nine_router_key || '9router-local';
    const model = preferredModel || systemSettings.nine_router_model || 'deepseek-chat';

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 8192,
        temperature: 0.3,
      }),
      signal: signal || AbortSignal.timeout(180000),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error('9Router Error [' + res.status + ']: ' + errText.slice(0, 200));
    }

    const rawResponseText = await res.text();
    const { content: rawContent } = parseOpenAiChatResponse(rawResponseText);
    if (!rawContent) {
      throw new Error('Respons 9Router kosong atau format stream tidak terbaca.');
    }

    const parsed = repairAndParseJSON(rawContent);
    const validated = normalizeAndSanitizePRDOutput(parsed);

    return {
      ...validated,
      metadata: {
        modelUsed: '9Router (' + model + ')',
        generatedAt: new Date().toISOString(),
        retries: 0,
        fallbackCount: 0,
      },
    };
  }

  // 2. OpenRouter provider
  if (provider === 'openrouter') {
    const endpoint = 'https://openrouter.ai/api/v1/chat/completions';
    const apiKey = systemSettings.openrouter_key;
    const model = preferredModel || systemSettings.openrouter_model || 'anthropic/claude-3.5-sonnet';

    if (!apiKey) {
      throw new Error('OpenRouter API Key belum dikonfigurasi di Admin Dashboard.');
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
        'HTTP-Referer': 'https://ngodingpakeprd.com',
        'X-Title': 'ngodingpakeprd',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 8192,
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
      signal: signal || AbortSignal.timeout(180000),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error('OpenRouter Error [' + res.status + ']: ' + errText.slice(0, 200));
    }

    const data = await res.json();
    const rawContent = data?.choices?.[0]?.message?.content;
    if (!rawContent) throw new Error('Respons OpenRouter kosong.');

    const parsed = repairAndParseJSON(rawContent);
    const validated = normalizeAndSanitizePRDOutput(parsed);

    return {
      ...validated,
      metadata: {
        modelUsed: 'OpenRouter (' + model + ')',
        generatedAt: new Date().toISOString(),
        retries: 0,
        fallbackCount: 0,
      },
    };
  }

  // 3. Default: Gemini Direct
  let keyList: string[] = [];
  let slotUsedLabel: string | undefined = undefined;
  let slotPreferredModel: string | undefined = undefined;
  if (systemSettings.api_key_mode === 'server_managed') {
    const resolved = resolveGeminiKeysAndSlot(systemSettings, userId, options.assignedGeminiSlot);
    keyList = resolved.keys;
    slotUsedLabel = resolved.slotUsedLabel;
    slotPreferredModel = resolved.slotPreferredModel;
    if (keyList.length === 0) {
      const envKeys = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);
      keyList = envKeys;
      if (envKeys.length > 0) slotUsedLabel = 'Env Key';
    }
  } else {
    if (userGeminiKey) {
      keyList = [userGeminiKey.trim()];
      slotUsedLabel = 'BYOK Key';
    }
  }

  if (keyList.length === 0) {
    throw new Error('API Key belum diisi. Masukkan Gemini API Key atau aktifkan Server Managed Key / Multi-Key Slot di Admin.');
  }

  const chosenGeminiModel = slotPreferredModel?.trim() || userPreferredModel?.trim() || preferredModel || 'gemini-2.5-flash';
  const pool = createKeyPool(keyList);
  const geminiResult = await generateGeminiDirect({
    apiKeyPool: pool,
    systemPrompt,
    userPrompt,
    preferredModel: chosenGeminiModel,
    signal,
  });

  return {
    ...geminiResult,
    metadata: {
      modelUsed: geminiResult.metadata?.modelUsed || chosenGeminiModel,
      generatedAt: geminiResult.metadata?.generatedAt || new Date().toISOString(),
      retries: geminiResult.metadata?.retries,
      fallbackCount: geminiResult.metadata?.fallbackCount,
      geminiSlotUsed: slotUsedLabel,
    },
  };
}

export interface ClarificationUnifiedOptions {
  systemSettings: SystemSettings;
  userGeminiKey?: string;
  userIdea: string;
  prompt: string;
  isPro?: boolean;
  userId?: string;
  signal?: AbortSignal;
  userPreferredModel?: string;
}

export async function generateClarificationsUnified(
  options: ClarificationUnifiedOptions
): Promise<ClarificationQuestion[]> {
  const {
    systemSettings,
    userGeminiKey,
    userIdea,
    prompt,
    isPro,
    userId,
    signal,
    userPreferredModel,
  } = options;

  const fallbackQuestions = getDomainDiscoveryQuestions(userIdea);

  const provider: AiProvider = isPro
    ? (systemSettings.pro_ai_provider || systemSettings.ai_provider || 'nine_router')
    : (systemSettings.free_ai_provider || systemSettings.ai_provider || 'gemini_direct');

  const preferredModel =
    userPreferredModel?.trim() || (isPro ? systemSettings.pro_model : systemSettings.free_model);

  try {
    // 1. 9Router Provider
    if (provider === 'nine_router') {
      const endpoint = normalizeOpenAiEndpoint(systemSettings.nine_router_url);
      const apiKey = systemSettings.nine_router_key || '9router-local';
      const model = preferredModel || systemSettings.nine_router_model || 'deepseek-chat';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + apiKey,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content:
                'Kamu adalah Lead Discovery Engineer. Outputkan JSON murni valid berisi array questions sesuai schema.',
            },
            { role: 'user', content: prompt },
          ],
          max_tokens: 3000,
          temperature: 0.3,
        }),
        signal: signal || AbortSignal.timeout(20000),
      });

      if (!res.ok) {
        console.warn('9Router clarification HTTP error:', res.status);
        return fallbackQuestions;
      }

      const rawResponseText = await res.text();
      const { content: rawContent } = parseOpenAiChatResponse(rawResponseText);
      if (!rawContent) return fallbackQuestions;

      const parsed = repairAndParseJSON(rawContent);
      return normalizeAndSanitizeClarifications(parsed);
    }

    // 2. OpenRouter Provider
    if (provider === 'openrouter') {
      const endpoint = 'https://openrouter.ai/api/v1/chat/completions';
      const apiKey = systemSettings.openrouter_key;
      const model =
        preferredModel || systemSettings.openrouter_model || 'anthropic/claude-3.5-haiku';

      if (!apiKey) return fallbackQuestions;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + apiKey,
          'HTTP-Referer': 'https://ngodingpakeprd.com',
          'X-Title': 'ngodingpakeprd',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content:
                'Kamu adalah Lead Discovery Engineer. Outputkan JSON murni valid berisi array questions sesuai schema.',
            },
            { role: 'user', content: prompt },
          ],
          max_tokens: 3000,
          response_format: { type: 'json_object' },
          temperature: 0.3,
        }),
        signal: signal || AbortSignal.timeout(20000),
      });

      if (!res.ok) {
        console.warn('OpenRouter clarification HTTP error:', res.status);
        return fallbackQuestions;
      }

      const data = await res.json();
      const rawContent = data?.choices?.[0]?.message?.content;
      if (!rawContent) return fallbackQuestions;

      const parsed = repairAndParseJSON(rawContent);
      return normalizeAndSanitizeClarifications(parsed);
    }

    // 3. Default: Gemini Direct
    let keyList: string[] = [];
    if (systemSettings.api_key_mode === 'server_managed') {
      keyList = getKeysFromSettings(systemSettings, userId);
      if (keyList.length === 0) {
        const envKeys = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean);
        keyList = envKeys;
      }
    } else {
      if (userGeminiKey) {
        keyList = [userGeminiKey.trim()];
      } else {
        // In BYOK or hybrid without header, check if server slots exist as backup
        const slots = getKeysFromSettings(systemSettings, userId);
        if (slots.length > 0) keyList = slots;
      }
    }

    if (keyList.length === 0) {
      return fallbackQuestions;
    }

    const chosenModel = userPreferredModel?.trim() || preferredModel || 'gemini-2.5-flash';
    const pool = createKeyPool(keyList);

    return await generateGeminiClarifications({
      apiKeyPool: pool,
      userIdea,
      prompt,
      preferredModel: chosenModel,
    });
  } catch (err) {
    console.warn('generateClarificationsUnified error, returning smart domain questions:', err);
    return fallbackQuestions;
  }
}

export interface FeatureTreeUnifiedOptions {
  systemSettings: SystemSettings;
  userGeminiKey?: string;
  idea: string;
  prompt: string;
  isPro?: boolean;
  userId?: string;
  signal?: AbortSignal;
  userPreferredModel?: string;
  answers?: Record<string, string[]>;
  questions?: any[];
}

export async function generateFeatureTreeUnified(
  options: FeatureTreeUnifiedOptions
): Promise<FeatureTreeModuleOutput[]> {
  const {
    systemSettings,
    userGeminiKey,
    idea,
    prompt,
    isPro,
    userId,
    signal,
    userPreferredModel,
    answers = {},
    questions = [],
  } = options;

  const fallbackModules = synthesizeDomainFeatureModules(idea, answers, questions);

  const provider: AiProvider = isPro
    ? (systemSettings.pro_ai_provider || systemSettings.ai_provider || 'nine_router')
    : (systemSettings.free_ai_provider || systemSettings.ai_provider || 'gemini_direct');

  const preferredModel =
    userPreferredModel?.trim() || (isPro ? systemSettings.pro_model : systemSettings.free_model);

  try {
    // 1. 9Router Provider
    if (provider === 'nine_router') {
      const endpoint = normalizeOpenAiEndpoint(systemSettings.nine_router_url);
      const apiKey = systemSettings.nine_router_key || '9router-local';
      const model = preferredModel || systemSettings.nine_router_model || 'deepseek-chat';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + apiKey,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content:
                'Kamu adalah Principal Software Architect. Outputkan JSON valid sesuai schema { "modules": [ ... ] } tanpa markdown wrapper.',
            },
            { role: 'user', content: prompt },
          ],
          max_tokens: 4000,
          temperature: 0.3,
        }),
        signal: signal || AbortSignal.timeout(30000),
      });

      if (!res.ok) {
        console.warn('9Router feature-tree HTTP error:', res.status);
        return fallbackModules;
      }

      const rawResponseText = await res.text();
      const { content: rawContent } = parseOpenAiChatResponse(rawResponseText);
      if (!rawContent) return fallbackModules;

      const parsed = repairAndParseJSON(rawContent);
      const sanitized = normalizeAndSanitizeFeatureModules(parsed);
      return sanitized.length > 0 ? sanitized : fallbackModules;
    }

    // 2. OpenRouter Provider
    if (provider === 'openrouter') {
      const endpoint = 'https://openrouter.ai/api/v1/chat/completions';
      const apiKey = systemSettings.openrouter_key;
      const model =
        preferredModel || systemSettings.openrouter_model || 'anthropic/claude-3.5-haiku';

      if (!apiKey) return fallbackModules;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + apiKey,
          'HTTP-Referer': 'https://ngodingpakeprd.com',
          'X-Title': 'ngodingpakeprd',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content:
                'Kamu adalah Principal Software Architect. Outputkan JSON valid sesuai schema { "modules": [ ... ] } tanpa markdown wrapper.',
            },
            { role: 'user', content: prompt },
          ],
          max_tokens: 4000,
          response_format: { type: 'json_object' },
          temperature: 0.3,
        }),
        signal: signal || AbortSignal.timeout(30000),
      });

      if (!res.ok) {
        console.warn('OpenRouter feature-tree HTTP error:', res.status);
        return fallbackModules;
      }

      const data = await res.json();
      const rawContent = data?.choices?.[0]?.message?.content;
      if (!rawContent) return fallbackModules;

      const parsed = repairAndParseJSON(rawContent);
      const sanitized = normalizeAndSanitizeFeatureModules(parsed);
      return sanitized.length > 0 ? sanitized : fallbackModules;
    }

    // 3. Default: Gemini Direct
    let keyList: string[] = [];
    if (systemSettings.api_key_mode === 'server_managed') {
      keyList = getKeysFromSettings(systemSettings, userId);
      if (keyList.length === 0) {
        const envKeys = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean);
        keyList = envKeys;
      }
    } else {
      if (userGeminiKey) {
        keyList = [userGeminiKey.trim()];
      } else {
        const slots = getKeysFromSettings(systemSettings, userId);
        if (slots.length > 0) keyList = slots;
      }
    }

    if (keyList.length === 0) {
      return fallbackModules;
    }

    const chosenModel = userPreferredModel?.trim() || preferredModel || 'gemini-2.5-flash';
    const pool = createKeyPool(keyList);

    return await generateGeminiFeatureTree({
      apiKeyPool: pool,
      idea,
      prompt,
      preferredModel: chosenModel,
      answers,
      questions,
    });
  } catch (err) {
    console.warn('generateFeatureTreeUnified error, returning synthesized modules:', err);
    return fallbackModules;
  }
}

export interface EnrichIdeaUnifiedOptions {
  systemSettings: SystemSettings;
  userGeminiKey?: string;
  userIdea: string;
  language?: 'id' | 'en';
  templateId?: string;
  userPreferredModel?: string;
  userId?: string;
  isPro?: boolean;
  signal?: AbortSignal;
}

export function synthesizeDynamicEnrichedIdea(
  rawIdea: string,
  lang: 'id' | 'en' = 'id',
  templateId: string = 'starter'
): string {
  const t = rawIdea.toLowerCase().trim();
  const cleanedTitle = rawIdea
    .split('\n')[0]
    .replace(/^Platform Konsep:?\s*/i, '')
    .replace(/^Sistem\s*/i, '')
    .trim()
    .slice(0, 70);

  // If the idea is already structured (e.g. user clicking "Perkaya Lagi" to maximize)
  const isAlreadyDetailed = rawIdea.length > 250 || rawIdea.includes('1.') || rawIdea.includes('Modul Fitur');

  if (isAlreadyDetailed) {
    if (lang === 'en') {
      return `${rawIdea.trim()}

---

5. Advanced Operational Edge-Cases & Scalability:
- Real-time Concurrency Control: Redis distributed locking mechanism for high-demand transaction windows to prevent double-booking/race conditions.
- Automated Exception Handling: Webhook reconciliation job with idempotent payment verification and automatic refund ledger.
- Audit & Security Hardening: Immutable PostgreSQL audit trails, encrypted PII columns via pgcrypto, and granular role-based permissions (RBAC).
- Performance & Offline Resilience: Client-side optimistic UI updates with automatic background retry queues.`;
    }
    return `${rawIdea.trim()}

---

5. Penanganan Edge Cases & Peningkatan Skalabilitas Operasional:
- Kontrol Konkurensi & Anti-Double Booking: Mekanisme distributed lock berbasis Redis pada transaksi waktu nyata untuk mencegah tabrakan data dan perebutan slot/stok.
- Rekonsiliasi & Otomasi Kegagalan: Background worker untuk auto-cancel pesanan kadaluarsa dalam 15 menit dan rekonsiliasi mutasi payment gateway secara idempotent.
- Audit Trail & Kepatuhan Keamanan: Pencatatan log aktivitas sensitif ke tabel audit terproteksi, enkripsi data identitas pengguna, dan pembatasan hak akses berbasis peran (RBAC).
- Ketahanan Performa: Caching data dinamis, indeks database B-Tree pada kolom status transaksi, dan sinkronisasi status real-time via WebSocket.`;
  }

  // Domain-specific tailored synthesis (dynamically matches actual user topic)
  if (t.includes('lapangan') || t.includes('badminton') || t.includes('futsal') || t.includes('futsall') || t.includes('olahraga')) {
    return `Platform Konsep: Sistem Reservasi & Manajemen Fasilitas Olahraga Modern untuk "${cleanedTitle || rawIdea}".

1. Gambaran Produk & Target:
Platform booking dan manajemen fasilitas lapangan bagi pengelola venue olahraga dan komunitas pemain untuk meniadakan bentrok jadwal manual dan mempercepat pembayaran uang muka (DP).

2. Modul Fitur Utama:
- Kalender Ketersediaan Slot Jam Real-Time: Pemilihan durasi sewa per jam dengan sistem kunci slot otomatis selama 10 menit saat proses checkout.
- Gateway Pembayaran QRIS Dinamis & DP: Opsi pembayaran DP 50% atau lunas dengan verifikasi instan tanpa perlu unggah bukti transfer.
- Modul Rental Alat Tambahan & Kantin: Penyewaan raket/bola dan pembelian minuman yang otomatis masuk ke tagihan satu nota kasir.
- Pengingat Jadwal Otomatis via WhatsApp: Dispatch notifikasi tiket H-2 jam sebelum bermain lengkap dengan kode QR check-in di lokasi.
- Dashboard Pemilik Venue: Rekap pendapatan harian, statistik jam-jam tersibuk, dan manajemen data pelanggan langganan (member bulanan).

3. Alur Operasional Pengguna:
Pelanggan membuka portal -> Memilih tanggal dan jam lapangan yang masih kosong -> Memilih opsi alat tambahan -> Membayar via QRIS -> Menerima tiket digital di WhatsApp -> Tiba di lokasi dan scan QR check-in -> Pemilik memantau utilisasi lapangan dari smartphone.

4. Fondasi Teknis & Keamanan:
PostgreSQL dengan transaksi atomik anti-bentrok, caching ketersediaan slot jam di Redis, dan background cron job untuk melepaskan slot yang tidak dibayar dalam batas waktu.`;
  }

  if (t.includes('drone') || t.includes('kamera') || t.includes('lensa') || t.includes('alat berat') || t.includes('elektronik') || t.includes('laptop')) {
    return `Platform Konsep: Sistem Rental & Pengawasan Aset Inventaris untuk "${cleanedTitle || rawIdea}".

1. Gambaran Produk & Target:
Solusi manajemen persewaan peralatan bernilai tinggi untuk melindungi aset pemilik dari risiko kehilangan dan mempermudah pelanggan mendapatkan unit dalam kondisi prima.

2. Modul Fitur Utama:
- Katalog Alat & Kalender Jadwal Sewa: Pengecekan status ketersediaan unit, paket aksesoris, dan penghitungan tarif harian/mingguan.
- Verifikasi Identitas & Jaminan Digital: Unggah foto KTP/SIM dengan validasi data dan penandatanganan elektronik surat perjanjian sewa.
- Manajemen Deposit & Pembayaran Terintegrasi: Penahanan deposit jaminan (security deposit) yang otomatis dikembalikan setelah alat dicek utuh.
- Lembar Serah Terima (Checklist Kondisi Fisik): Dokumentasi foto kondisi fisik dan fungsi alat sebelum keluar dan saat kembali untuk bukti jika ada kerusakan.
- Otomasi Notifikasi & Denda Keterlambatan: WhatsApp alert saat jatuh tempo dan kalkulasi denda otomatis per jam jika telat mengembalikan.

3. Alur Operasional:
Penyewa memilih alat dan tanggal sewa -> Melakukan verifikasi data diri dan membayar DP + deposit -> Tim toko menyiapkan unit sesuai checklist fisik -> Penyerahan unit dengan tanda tangan digital -> Alat dikembalikan -> Tim inspeksi verifikasi kondisi -> Sistem merilis sisa deposit ke rekening penyewa.

4. Fondasi Teknis & Keamanan:
Penyimpanan foto kondisi alat terenkripsi di cloud storage, database relasional PostgreSQL dengan RLS, dan sistem notifikasi webhook multi-kanal.`;
  }

  if (t.includes('klinik') || t.includes('medis') || t.includes('dokter') || t.includes('sehat') || t.includes('pasien') || t.includes('apotek')) {
    return `Platform Konsep: Sistem Informasi Manajemen Klinik & Antrean Pasien Digital untuk "${cleanedTitle || rawIdea}".

1. Gambaran Produk & Target:
Platform operasional klinik rawat jalan terintegrasi untuk mempercepat pendaftaran pasien, menertibkan antrean dokter, dan mengamankan catatan rekam medis elektronik.

2. Modul Fitur Utama:
- Registrasi Pasien & Nomor Antrean Online: Pasien dapat mengambil nomor antrean dari rumah dengan estimasi waktu tunggu transparan.
- Rekam Medis Elektronik (RME) Standar Kemenkes: Pencatatan diagnosis ICD-10, riwayat alergi, tindakan medis, dan resep obat yang aman.
- Kasir & Integrasi Apotek: Resep dokter langsung diteruskan ke bagian farmasi untuk disiapkan dan dikalkulasi biayanya secara otomatis.
- WhatsApp Alert Antrean: Pengingat giliran konsultasi saat antrean tersisa 3 nomor agar pasien tidak menumpuk di ruang tunggu.
- Dashboard Dokter & Manajemen Klinik: Statistik kunjungan harian, stok obat menipis (low-stock warning), dan rekapitulasi laba pelayanan.

3. Alur Operasional:
Pasien daftar via smartphone -> Mendapatkan nomor antrean digital -> Notifikasi WA berbunyi saat giliran mendekat -> Pemeriksaan oleh dokter dengan input RME langsung -> Apotek menyiapkan obat -> Pasien bayar di kasir (tunai/QRIS) dan mengambil obat.

4. Fondasi Teknis & Keamanan:
Standar enkripsi data medis sensitif, PostgreSQL dengan audit log akses pasien, dan antarmuka web responsif untuk dokter dan bagian farmasi.`;
  }

  if (t.includes('sekolah') || t.includes('kampus') || t.includes('kursus') || t.includes('bimbel') || t.includes('ppdb') || t.includes('akademik') || t.includes('santri') || t.includes('pesantren')) {
    return `Platform Konsep: Sistem Informasi Akademik & Portal Pembayaran Terpadu untuk "${cleanedTitle || rawIdea}".

1. Gambaran Produk & Target:
Solusi digitalisasi institusi pendidikan untuk mempermudah pendaftaran siswa baru (PPDB), mengelola penilaian kelas, dan menertibkan tagihan SPP bulanan.

2. Modul Fitur Utama:
- Portal PPDB & Verifikasi Dokumen: Formulir pendaftaran siswa baru, tes seleksi online, dan verifikasi berkas secara digital.
- Manajemen Tagihan SPP & Virtual Account: Pembuatan tagihan berkala otomatis dengan notifikasi pengingat via WhatsApp kepada wali murid.
- Buku Nilai & Rapor Digital: Input nilai tugas, ujian, dan absensi harian yang dapat dipantau langsung oleh orang tua siswa.
- Portal Wali Murid & Pengumuman: Saluran komunikasi resmi sekolah untuk jadwal kalender akademik, surat edaran, dan catatan kedisiplinan.
- Dashboard Kepala Sekolah & Tata Usaha: Rekapitulasi persentase pelunasan SPP, grafik performa nilai siswa, dan inventaris fasilitas.

3. Alur Operasional:
Wali murid masuk ke portal -> Melihat tagihan SPP dan status kehadiran anak -> Membayar via Virtual Account / QRIS langsung lunas tanpa konfirmasi admin -> Notifikasi kuitansi pembayaran resmi otomatis terbit ke nomor WA wali murid.

4. Fondasi Teknis & Keamanan:
PostgreSQL dengan isolasi data multi-tahun ajaran, gateway notifikasi WhatsApp otomatis, dan otentikasi aman berbasis peran bertingkat.`;
  }

  if (t.includes('sewa') || t.includes('rental')) {
    return `Platform Konsep: Sistem Reservasi & Manajemen Sewa Modern untuk "${cleanedTitle || rawIdea}".

1. Gambaran Produk & Target:
Platform komprehensif bagi penyedia persewaan "${cleanedTitle || rawIdea}" untuk mengotomatiskan booking, mencegah jadwal ganda, dan menyederhanakan penanganan uang muka serta jaminan.

2. Modul Fitur Utama:
- Katalog Unit & Kalender Ketersediaan Real-Time: Menampilkan stok unit aktif dengan penguncian jadwal saat proses reservasi berlangsung.
- Gateway Pembayaran & Deposit Jaminan: Mendukung pelunasan langsung atau DP dengan QRIS dinamis serta rekening virtual account.
- Verifikasi Berkas & Identitas Pelanggan: Form unggah tanda pengenal dengan persetujuan syarat dan ketentuan sewa digital.
- Notifikasi Otomatis Multi-Kanal: Pengiriman invoice, tanda terima, dan pengingat jadwal serah-terima unit via WhatsApp.
- Dashboard Monitoring & Utilisasi Unit: Laporan pendapatan harian/bulanan, riwayat sewa per unit, dan status pemeliharaan alat.

3. Alur Operasional:
Pelanggan menentukan durasi dan memilih unit -> Sistem memvalidasi ketersediaan tanggal -> Pelanggan melakukan pembayaran DP -> Notifikasi pesanan masuk ke admin -> Serah terima unit dengan konfirmasi checklist -> Pengembalian unit dan kalkulasi denda jika overtime.

4. Fondasi Teknis & Keamanan:
PostgreSQL dengan transaksi aman, cache Redis untuk pengecekan slot cepat, dan arsitektur Next.js responsif.`;
  }

  // Default intelligent dynamic synthesis tailored to the exact topic
  return `Platform Konsep: Solusi Digital & Sistem Operasional Terpadu untuk "${cleanedTitle || rawIdea}".

1. Gambaran Produk & Target:
Platform modern yang dibangun khusus untuk mendigitalkan dan mengotomatiskan seluruh alur operasional "${cleanedTitle || rawIdea}", meningkatkan kecepatan kerja pengelola dan memberikan kenyamanan akses bagi pelanggan.

2. Modul Fitur Utama:
- Manajemen Data Entitas Inti "${cleanedTitle}": Pengelolaan data terpusat dengan pencarian instan, filter multi-parameter, dan ekspor laporan.
- Alur Transaksi & Pembayaran Digital: Integrasi metode pembayaran modern (QRIS Dinamis / Virtual Account) dengan pencatatan mutasi otomatis.
- Sistem Notifikasi Otomatis (WhatsApp Gateway & Email): Pengiriman konfirmasi status, invoice transaksi, dan pengingat berkala.
- Portal Pengguna Interaktif: Tampilan mandiri untuk memudahkan pemantauan riwayat, pengajuan permohonan, atau transaksi layanan.
- Dashboard Eksekutif & Analitik Bisnis: Visualisasi metrik kunci (KPI), grafik tren bulanan, dan rekapitulasi audit log.

3. Alur Operasional Pengguna:
Pengguna masuk ke sistem -> Memilih layanan atau produk "${cleanedTitle}" yang dibutuhkan -> Mengisi formulir dan menyelesaikan verifikasi data -> Melakukan transaksi -> Sistem memproses validasi bisnis dan mengirim bukti digital -> Admin memverifikasi dan memperbarui status secara real-time.

4. Fondasi Teknis & Keamanan:
Next.js 15 App Router, database relasional PostgreSQL dengan Row Level Security, otentikasi terenkripsi, dan proteksi transaksi idempotent.`;
}

export async function enrichIdeaUnified(options: EnrichIdeaUnifiedOptions): Promise<string> {
  const {
    systemSettings,
    userGeminiKey,
    userIdea,
    language = 'id',
    templateId = 'starter',
    userPreferredModel,
    userId,
    isPro,
    signal,
  } = options;

  const trimmedIdea = userIdea.trim();
  if (!trimmedIdea) return '';

  const fallback = synthesizeDynamicEnrichedIdea(trimmedIdea, language, templateId);

  const provider: AiProvider = isPro
    ? (systemSettings.pro_ai_provider || systemSettings.ai_provider || 'nine_router')
    : (systemSettings.free_ai_provider || systemSettings.ai_provider || 'gemini_direct');

  const preferredModel =
    userPreferredModel?.trim() || (isPro ? systemSettings.pro_model : systemSettings.free_model);

  const isAlreadyDetailed = trimmedIdea.length > 250 || trimmedIdea.includes('1.') || trimmedIdea.includes('Modul Fitur');

  let instructionPrompt = '';
  if (isAlreadyDetailed) {
    instructionPrompt = `Kamu adalah Principal Software Architect & Lead Product Designer kelas dunia.
Pengguna telah menulis draf konsep arsitektur produk berikut:
"""
${trimmedIdea}
"""

TUGAS UTAMA:
Ide di atas SUDAH memiliki struktur dasar. Tugasmu adalah MEMPERDALAM, MEMPERKAYA, DAN MEMAKSIMALKAN (MAXIMIZE & REFINE) konsep di atas agar mencapai standar enterprise level tanpa mengubah domain aslinya!
1. Pertahankan topik asli dan esensi produk yang sudah ditulis pengguna.
2. Perjelas alur logika bisnis (business logic) antar modul dan aturan validasinya.
3. Rinci entitas database dan spesifikasi integrasi payment / notifikasi.
4. Tambahkan bagian penanganan edge-case operasional, anti-fraud / data integrity, dan rekomendasi skalabilitas.
5. DILARANG KERAS mereset ke template generik tentang hal lain. Wajib 100% fokus memperdalam apa yang sudah ada.
6. DILARANG menggunakan kata pembuka klise seperti "Tentu", "Berikut", dll.
7. DILARANG menggunakan karakter emoji apapun.
8. Gunakan ${language === 'en' ? 'Bahasa Inggris teknis profesional' : 'Bahasa Indonesia profesional dan istilah engineering modern'}.

Tuliskan konsep arsitektur produk yang telah diperdalam dan dimaksimalkan sekarang:`;
  } else {
    instructionPrompt = `Kamu adalah Principal Software Architect & Lead Product Designer kelas dunia.
Tugasmu adalah mentransformasikan ide produk singkat dari pengguna berikut menjadi DESKRIPSI KONSEP ARSITEKTUR PRODUK YANG LENGKAP, MENDALAM, TERSTRUKTUR, DAN SIAP DIKEMBANGKAN OLEH DEVELOPER.

IDE SINGKAT PENGGUNA:
"""
${trimmedIdea}
"""

PANDUAN STRUKTUR OUTPUT WAJIB:
Platform Konsep: [Tuliskan Judul / Nama Konsep Produk yang Keren & Spesifik Sesuai Topik Ini]

1. Gambaran Produk & Target:
Jelaskan visi produk, siapa target pengguna spesifiknya, dan masalah operasional/bisnis nyata apa yang diselesaikan.

2. Modul Fitur Utama:
Rinci 4-5 modul fungsional inti spesifik untuk topik ini beserta kapabilitas teknisnya.

3. Alur Operasional Pengguna:
Jelaskan alur langkah-demi-langkah (happy path & interaksi kunci) dari saat pengguna mulai menggunakan aplikasi hingga transaksi/pekerjaan selesai.

4. Fondasi Teknis & Keamanan:
Sebutkan arsitektur teknologi yang direkomendasikan (database relasional PostgreSQL dengan RLS, caching Redis, webhook idempotent, audit log, dan otentikasi).

ATURAN WAJIB:
- WAJIB 100% SESUAI DENGAN TOPIK "${trimmedIdea}". DILARANG KERAS MENGALIHKAN KE TOPIK LAIN.
- Output WAJIB LENGKAP, DETAIL, BERBOBOT (antara 250 hingga 550 kata).
- DILARANG KERAS menggunakan kata pembuka seperti "Tentu", "Berikut adalah ide", dll.
- DILARANG menggunakan karakter emoji apapun.
- Gunakan ${language === 'en' ? 'Bahasa Inggris profesional' : 'Bahasa Indonesia profesional dan istilah engineering modern'}.

Langsung keluarkan teks elaborasi lengkap sekarang:`;
  }

  // 1. 9Router Provider
  if (provider === 'nine_router') {
    try {
      const endpoint = normalizeOpenAiEndpoint(systemSettings.nine_router_url);
      const apiKey = systemSettings.nine_router_key || '9router-local';
      const model = preferredModel || systemSettings.nine_router_model || 'deepseek-chat';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + apiKey,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'Kamu adalah Principal Software Architect. Berikan elaborasi konsep produk profesional tanpa markdown wrapper dan zero emoji.',
            },
            { role: 'user', content: instructionPrompt },
          ],
          max_tokens: 3500,
          temperature: 0.35,
        }),
        signal: signal || AbortSignal.timeout(25000),
      });

      if (res.ok) {
        const rawResponseText = await res.text();
        const { content: rawContent } = parseOpenAiChatResponse(rawResponseText);
        if (rawContent && rawContent.trim().length > 150) {
          return rawContent.replace(/[\uD83C-\uDBFF\uDC00-\uDFFF\u2600-\u27BF]/g, '').trim();
        }
      }
    } catch (e) {
      console.warn('9Router enrich-idea error, falling back:', e);
    }
  }

  // 2. OpenRouter Provider
  if (provider === 'openrouter') {
    try {
      const endpoint = 'https://openrouter.ai/api/v1/chat/completions';
      const apiKey = systemSettings.openrouter_key;
      const model = preferredModel || systemSettings.openrouter_model || 'anthropic/claude-3.5-haiku';

      if (apiKey) {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + apiKey,
            'HTTP-Referer': 'https://ngodingpakeprd.com',
            'X-Title': 'ngodingpakeprd',
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'system',
                content: 'Kamu adalah Principal Software Architect. Berikan elaborasi konsep produk profesional tanpa emoji.',
              },
              { role: 'user', content: instructionPrompt },
            ],
            max_tokens: 3500,
            temperature: 0.35,
          }),
          signal: signal || AbortSignal.timeout(25000),
        });

        if (res.ok) {
          const data = await res.json();
          const rawContent = data?.choices?.[0]?.message?.content;
          if (rawContent && rawContent.trim().length > 150) {
            return rawContent.replace(/[\uD83C-\uDBFF\uDC00-\uDFFF\u2600-\u27BF]/g, '').trim();
          }
        }
      }
    } catch (e) {
      console.warn('OpenRouter enrich-idea error, falling back:', e);
    }
  }

  // 3. Default: Gemini Direct
  try {
    let keyList: string[] = [];
    if (systemSettings.api_key_mode === 'server_managed') {
      keyList = getKeysFromSettings(systemSettings, userId);
      if (keyList.length === 0) {
        const envKeys = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean);
        keyList = envKeys;
      }
    } else {
      if (userGeminiKey) {
        keyList = userGeminiKey.split(',').map((k) => k.trim()).filter(Boolean);
      } else {
        const slots = getKeysFromSettings(systemSettings, userId);
        if (slots.length > 0) keyList = slots;
      }
    }

    if (keyList.length === 0) {
      return fallback;
    }

    const pool = createKeyPool(keyList);
    const candidateModels = [
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-flash-latest',
      'gemini-2.0-flash-lite',
      'gemini-2.5-flash',
    ];

    for (const model of candidateModels) {
      const apiKey = pool.getAvailableKey();
      if (!apiKey) break;

      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: instructionPrompt }] }],
            generationConfig: {
              temperature: 0.35,
              maxOutputTokens: 3500,
            },
          }),
          signal: signal || controller.signal,
        });

        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText && rawText.trim().length > 150) {
            return rawText
              .trim()
              .replace(/^["'`]+|["'`]+$/g, '')
              .replace(/[\uD83C-\uDBFF\uDC00-\uDFFF\u2600-\u27BF]/g, '')
              .trim();
          }
        }
      } catch {
        // try next model
      }
    }

    return fallback;
  } catch (err) {
    console.warn('enrichIdeaUnified error, using dynamic synthesis:', err);
    return fallback;
  }
}

export interface GenerateBlueprintOptions {
  systemSettings: SystemSettings;
  userGeminiKey?: string;
  prdTitle: string;
  archetype?: any;
  features?: any[];
  techStack?: any;
  userPreferredModel?: string;
  isPro?: boolean;
  signal?: AbortSignal;
}

export async function generateBlueprintUnified(
  options: GenerateBlueprintOptions
): Promise<{
  system_flowchart: string;
  user_journey_flow: string;
  database_erd: string;
  sql_migration_script: string;
  modelUsed: string;
}> {
  const {
    systemSettings,
    userGeminiKey,
    prdTitle,
    archetype,
    features = [],
    techStack,
    userPreferredModel,
    isPro,
    signal,
  } = options;

  // 1. Baseline deterministic synthesis as ultimate safety net
  const baseline = synthesizeDynamicArchitectureDiagrams(
    prdTitle || 'Enterprise App',
    archetype,
    features
  );

  const featureSummaries = features
    .slice(0, 10)
    .map((f: any, idx: number) => {
      const db = f.tech_mapping?.db_tables?.join(', ') || '';
      return `${idx + 1}. ${f.name} - Story: ${f.user_story || f.description || ''} ${db ? `[Tabel DB: ${db}]` : ''}`;
    })
    .join('\n');

  const systemPrompt = `Anda adalah Staff Principal Systems & Database Architect kelas dunia.
Tugas Anda adalah merancang cetak biru arsitektur visual dan skrip migrasi database PostgreSQL produksi untuk aplikasi berikut.

ATURAN KETAT JSON (RFC 8259):
Kembalikan JSON murni TANPA markdown wrapper, TANPA komentar tambahan:
{
  "database_erd": "erDiagram\\n  USERS ||--o{ ORDERS : places\\n  ...",
  "sql_migration_script": "-- PostgreSQL / Supabase Migration DDL\\nCREATE TABLE users (...);\\n...",
  "user_journey_flow": "graph TD\\n  A[Mulai] --> B{Punya Akun?}\\n  ...",
  "system_flowchart": "flowchart TD\\n  Client[Web/Mobile Client] --> CDN[Edge CDN]\\n  ..."
}

ATURAN MERMAID:
1. database_erd: erDiagram valid dengan relasi antar tabel (||--o{ dsb) dan kolom bertipe data.
2. user_journey_flow: graph TD atau flowchart LR dengan alur lengkap (form validasi, retry loop jika gagal, timeout, rollback status, notifikasi real-time).
3. system_flowchart: flowchart TD multi-tier (Client, Edge/CDN, Backend Service, Database, Redis/Cache, Queue/Worker).
JANGAN gunakan karakter kurung siku [ ] atau tanda kutip ganda di dalam teks node tanpa tanda kutip.

ATURAN SQL:
1. PostgreSQL 15+ / Supabase dengan UUID DEFAULT gen_random_uuid().
2. NOT NULL, timestamp with time zone, foreign keys dengan ON DELETE CASCADE / SET NULL yang aman.
3. CREATE INDEX untuk kolom pencarian/relasi penting.
4. ENABLE ROW LEVEL SECURITY untuk semua tabel.`;

  const userPrompt = `Rancang Blueprint Arsitektur & SQL untuk:
Judul: ${prdTitle}
Tech Stack: Frontend: ${techStack?.frontend || 'Next.js'}, Backend: ${techStack?.backend || 'Next.js Server Actions'}, Database: ${techStack?.database || 'PostgreSQL (Supabase)'}

Fitur Utama:
${featureSummaries || '1. Core Features\n2. User Authentication\n3. Admin Dashboard'}`;

  // Resolve provider from Admin Settings & User preference
  const provider: AiProvider = isPro
    ? (systemSettings.pro_ai_provider || systemSettings.ai_provider || 'nine_router')
    : (systemSettings.free_ai_provider || systemSettings.ai_provider || 'gemini_direct');

  const preferredModel =
    userPreferredModel?.trim() || (isPro ? systemSettings.pro_model : systemSettings.free_model);

  // ----------------------------------------------------
  // Jalur 1: 9Router Provider (jika aktif di dashboard admin)
  // ----------------------------------------------------
  if (provider === 'nine_router') {
    try {
      const endpoint = normalizeOpenAiEndpoint(systemSettings.nine_router_url);
      const apiKey = systemSettings.nine_router_key || '9router-local';
      const model = preferredModel || systemSettings.nine_router_model || 'deepseek-chat';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + apiKey,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 6000,
          temperature: 0.2,
        }),
        signal: signal || AbortSignal.timeout(60000),
      });

      if (res.ok) {
        const rawResponseText = await res.text();
        const { content: rawContent } = parseOpenAiChatResponse(rawResponseText);
        if (rawContent) {
          const parsed = repairAndParseJSON(rawContent);
          if (parsed && typeof parsed === 'object') {
            return {
              system_flowchart: parsed.system_flowchart || baseline.system_flowchart || '',
              user_journey_flow: parsed.user_journey_flow || baseline.user_journey_flow || '',
              database_erd: parsed.database_erd || baseline.database_erd || '',
              sql_migration_script: parsed.sql_migration_script || baseline.sql_migration_script || '',
              modelUsed: `9Router (${model})`,
            };
          }
        }
      }
    } catch (nineErr) {
      console.warn('9Router blueprint failed, cascading to Gemini backup pool:', nineErr);
    }
  }

  // ----------------------------------------------------
  // Jalur 2: OpenRouter Provider (jika aktif di dashboard admin)
  // ----------------------------------------------------
  if (provider === 'openrouter') {
    try {
      const endpoint = 'https://openrouter.ai/api/v1/chat/completions';
      const apiKey = systemSettings.openrouter_key;
      const model = preferredModel || systemSettings.openrouter_model || 'anthropic/claude-3.5-sonnet';

      if (apiKey) {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + apiKey,
            'HTTP-Referer': 'https://ngodingpakeprd.com',
            'X-Title': 'ngodingpakeprd',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            max_tokens: 6000,
            response_format: { type: 'json_object' },
            temperature: 0.2,
          }),
          signal: signal || AbortSignal.timeout(60000),
        });

        if (res.ok) {
          const data = await res.json();
          const rawContent = data?.choices?.[0]?.message?.content;
          if (rawContent) {
            const parsed = repairAndParseJSON(rawContent);
            if (parsed && typeof parsed === 'object') {
              return {
                system_flowchart: parsed.system_flowchart || baseline.system_flowchart || '',
                user_journey_flow: parsed.user_journey_flow || baseline.user_journey_flow || '',
                database_erd: parsed.database_erd || baseline.database_erd || '',
                sql_migration_script: parsed.sql_migration_script || baseline.sql_migration_script || '',
                modelUsed: `OpenRouter (${model})`,
              };
            }
          }
        }
      }
    } catch (openErr) {
      console.warn('OpenRouter blueprint failed, cascading to Gemini backup pool:', openErr);
    }
  }

  // ----------------------------------------------------
  // Jalur 3: Gemini Direct & Multi-Model Cascading Fallback
  // Mengikuti model pilihan admin / user, lalu cascade ke model cadangan
  // ----------------------------------------------------
  try {
    const pool = createKeyPool(
      systemSettings.api_key_mode === 'server_managed'
        ? getKeysFromSettings(systemSettings)
        : userGeminiKey ? [userGeminiKey] : []
    );

    // Prioritaskan model pilihan admin / user terlebih dahulu, lalu model penalaran tinggi, lalu fallback
    const rawCandidateModels = [
      preferredModel,
      isPro ? systemSettings.pro_model : systemSettings.free_model,
      'gemini-1.5-pro',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-flash-latest',
      'gemini-2.0-flash-lite',
    ].filter(Boolean) as string[];

    // Filter unik dengan mempertahankan urutan prioritas
    const candidateModels = Array.from(new Set(rawCandidateModels));

    for (const model of candidateModels) {
      const apiKey = pool.getAvailableKey();
      if (!apiKey) break;

      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 25000);

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 6000,
              responseMimeType: 'application/json',
            },
          }),
          signal: signal || controller.signal,
        });

        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = repairAndParseJSON(rawText);
            if (parsed && typeof parsed === 'object') {
              return {
                system_flowchart: parsed.system_flowchart || baseline.system_flowchart || '',
                user_journey_flow: parsed.user_journey_flow || baseline.user_journey_flow || '',
                database_erd: parsed.database_erd || baseline.database_erd || '',
                sql_migration_script: parsed.sql_migration_script || baseline.sql_migration_script || '',
                modelUsed: `Gemini (${model})`,
              };
            }
          }
        }
      } catch (callErr) {
        console.warn(`Blueprint model ${model} failed, cascading to next model:`, callErr);
      }
    }

    // ----------------------------------------------------
    // Jalur 4: Jaminan Hasil 100% (Deterministic Enterprise Engine)
    // ----------------------------------------------------
    return {
      system_flowchart: baseline.system_flowchart || '',
      user_journey_flow: baseline.user_journey_flow || '',
      database_erd: baseline.database_erd || '',
      sql_migration_script: baseline.sql_migration_script || '',
      modelUsed: 'Deterministic Enterprise Blueprint Engine',
    };
  } catch (err) {
    console.warn('generateBlueprintUnified fallback to baseline:', err);
    return {
      system_flowchart: baseline.system_flowchart || '',
      user_journey_flow: baseline.user_journey_flow || '',
      database_erd: baseline.database_erd || '',
      sql_migration_script: baseline.sql_migration_script || '',
      modelUsed: 'Deterministic Enterprise Blueprint Engine',
    };
  }
}



