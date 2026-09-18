import { PRDFormData } from "@/types/prd";

export interface IndustryTemplate {
  id: string;
  name: string;
  badge: string;
  description: string;
  data: PRDFormData;
}

export const INDUSTRY_TEMPLATES: IndustryTemplate[] = [
  {
    id: "ai-devtools",
    name: "AI Code Review & Security Sentinel",
    badge: "SaaS DevTools",
    description: "Bot AI penganalisis git diff Pull Request di GitHub/GitLab untuk deteksi bug & security flaw.",
    data: {
      title: "AI Code Review & Security Sentinel di GitHub PR",
      opportunity_framing: {
        core_problem:
          "Tim engineer menghabiskan 40% waktu sprint untuk review syntax dan celah keamanan dasar yang berulang di Pull Request.",
        working_hypothesis:
          "Bot AI otomatis yang membedah git diff dan memberikan komentar korektif spesifik serta patch perbaikan akan memangkas lead-time review hingga 50%.",
        strategy_fit:
          "Membuka jalan bagi sistem automated QA pipeline dan compliance audit otomatis bagi tim enterprise.",
      },
      boundaries: {
        scope:
          "- Integrasi GitHub App webhook (event pull_request opened & synchronize)\n- Analisis diff kode (TypeScript, Python, Go)\n- Deteksi celah keamanan (OWASP Top 10, SQLi, Hardcoded Secrets)\n- Saran inline comment langsung di line diff GitHub\n- Summary review status (Approve / Request Changes)",
        non_goals:
          "- Tidak melakukan auto-merge PR tanpa approval manusia\n- Tidak mendukung repo monorepo dengan ukuran diff > 50.000 baris di rilis v1\n- Tidak menjalankan test runner / docker container secara langsung",
      },
      success_measurement: {
        offline_golden_set:
          "Dataset 100 PR publik yang memiliki bug riil (CVE & syntax flaw) dengan benchmark akurasi deteksi > 85%.",
        human_review:
          "Sampling mingguan 20 komentar bot oleh Senior Tech Lead untuk menilai relevansi dan false-positive rate.",
        online_metrics:
          "PR review turnaround time berkurang 40%, false-positive complaint < 5%, uptime webhook 99.9%.",
      },
      rollout_plan: {
        exposure: "10% tim internal developer di minggu ke-1, naik ke 50% di minggu ke-3, 100% di minggu ke-5.",
        duration: "4 minggu periode pilot testing.",
        segments_gates:
          "Gate 1: Nol insiden kebocoran kode/secret. Gate 2: Net Promoter Score engineer internal > +40.",
      },
      risk_management: {
        detection:
          "Sentry alert untuk parsing error, webhook delivery failure rate > 1%, dan latency analisis > 30 detik.",
        fallback_kill_switch:
          "Feature flag di dashboard admin untuk disable webhook bot secara instan tanpa perlu mencopot instalasi GitHub App.",
      },
      ownership_action: {
        primary_owner: "Budi Santoso (Lead Platform Engineer) & Rina Wijaya (Product Manager Core DevTools)",
        decision_points:
          "Review mingguan metrik false-positive; keputusan go/no-go rilis public dilakukan akhir minggu ke-4.",
      },
      ai_specific: {
        behavior_contract:
          "GOOD:\n1. Selalu sertakan alasan teknis dan contoh kode pengganti saat menandai celah keamanan.\n2. Wajib bersikap netral, solutif, dan ringkas dalam komentar code review.\n3. Wajib memvalidasi sintaksis kode usulan agar tidak menghasilkan error baru.\n\nREJECT:\n1. Dilarang mengubah gaya penulisan styleguide yang tidak berdampak pada bug atau performa.\n2. Dilarang memberikan saran refactor masif di luar cakupan baris diff PR yang sedang diubah.\n3. Dilarang membocorkan potongan kode private ke model publik tanpa enkripsi.",
        guardrails:
          "Prompt injection defense pada diff code comment, sanitasi input diff, timeout API model max 25 detik, PII mask untuk string token/kredensial sebelum dikirim ke LLM.",
      },
    },
  },
  {
    id: "whatsapp-ai-cs",
    name: "AI WhatsApp Support & Order Automation",
    badge: "E-Commerce / Retail",
    description: "Asisten WhatsApp pintar bertenaga LLM untuk melayani CS 24/7, cek resi, dan katalog produk.",
    data: {
      title: "AI WhatsApp Customer Support & Instant Order Assistant",
      opportunity_framing: {
        core_problem:
          "Toko online kehilangan 35% calon pembeli saat malam hari karena lambatnya respon admin membalas chat WhatsApp tanya stok dan ongkir.",
        working_hypothesis:
          "Agen AI WhatsApp dengan koneksi ke database inventori realtime akan menjawab pertanyaan pelanggan dalam waktu < 5 detik dan meningkatkan konversi checkout 25%.",
        strategy_fit:
          "Fondasi ekspansi omnichannel commerce dan retensi pelanggan otomatis berbasis CRM.",
      },
      boundaries: {
        scope:
          "- Integrasi WhatsApp Business Cloud API\n- Pengecekan stok dan harga produk otomatis via database API\n- Simulasi ongkir otomatis terintegrasi kurir JNE/SiCepat\n- Handover ke admin manusia bila mendeteksi sentimen marah atau komplain retur",
        non_goals:
          "- Tidak memproses payment gateway langsung di WhatsApp (hanya kirim link pembayaran aman)\n- Tidak melayani negosiasi tawar-menawar harga di luar promo resmi",
      },
      success_measurement: {
        offline_golden_set:
          "500 percakapan riil pelanggan dengan ground-truth klasifikasi intent (tanya stok, komplain, beli).",
        human_review:
          "Supervisor CS memeriksa harian 30 log percakapan AI dengan skor kepuasan CSAT.",
        online_metrics:
          "Response time < 3 detik, First-Contact Resolution > 75%, escalation to human < 15%.",
      },
      rollout_plan: {
        exposure: "10% pelanggan malam hari (22:00-06:00) di minggu ke-1, lalu 100% full time di minggu ke-3.",
        duration: "3 minggu masa monitoring intensif.",
        segments_gates:
          "Gate: CSAT > 4.2 dari 5 bintang dan zero salah sebut harga barang.",
      },
      risk_management: {
        detection:
          "Deteksi kata kunci eskalasi ('hubungi manusia', 'penipu', 'kecewa'), anomaly chat volume spike.",
        fallback_kill_switch:
          "Tombol darurat di dashboard CS untuk membekukan AI dan mengalihkan semua chat ke inbox manual.",
      },
      ownership_action: {
        primary_owner: "Hendra (Head of CS Operations) & Doni (Lead Backend Engineer)",
        decision_points:
          "Evaluasi harian pada pekan pertama; evaluasi ROI biaya API vs tambahan omset di akhir bulan ke-1.",
      },
      ai_specific: {
        behavior_contract:
          "GOOD:\n1. Selalu cek ketersediaan stok aktual ke database sebelum mengonfirmasi ketersediaan barang.\n2. Berikan nada tutur ramah, sopan, dan solutif ala CS profesional Indonesia.\n3. Berikan tombol link checkout resmi berenkripsi SSL.\n\nREJECT:\n1. Dilarang menjanjikan diskon khusus tanpa persetujuan sistem.\n2. Dilarang menjawab pertanyaan di luar produk toko (anti jailbreak).\n3. Dilarang memberikan nomor rekening pribadi selain rekening resmi perusahaan.",
        guardrails:
          "Input sanitization terhadap prompt injection jailbreak, rate limit 10 pesan/menit per nomor WA, timeout API 8 detik dengan auto-fallback 'Mohon tunggu admin kami'.",
      },
    },
  },
  {
    id: "fintech-fraud",
    name: "Real-time Payment Fraud Detection Engine",
    badge: "FinTech & Banking",
    description: "Sistem deteksi fraud transaksi pembayaran menggunakan model ML analitik dan risk scoring.",
    data: {
      title: "Real-time AI Payment Fraud Detection & Risk Scoring Engine",
      opportunity_framing: {
        core_problem:
          "Peningkatan transaksi chargeback kartu kredit sebesar 2.3% akibat penipuan carding yang lolos dari rule static tradisional.",
        working_hypothesis:
          "Model scoring AI realtime berbasis pola anomali lokasi, velocity transaksi, dan histori user akan menahan transaksi mencurigakan dengan presisi > 92%.",
        strategy_fit:
          "Memenuhi regulasi Bank Indonesia untuk keamanan transaksi digital dan menekan kerugian chargeback senilai miliaran rupiah.",
      },
      boundaries: {
        scope:
          "- Pipeline streaming Kafka untuk ingest event transaksi < 50ms\n- Scoring risiko otomatis (Low, Medium, High)\n- Otomasi tantangan OTP / Biometric untuk risiko Medium\n- Auto-decline instan untuk risiko High",
        non_goals:
          "- Tidak memblokir kartu secara permanen tanpa verifikasi manual compliance officer\n- Tidak mengubah core ledger perbankan",
      },
      success_measurement: {
        offline_golden_set:
          "Dataset historis 1.000.000 transaksi pembayaran yang mencakup 5.000 kasus fraud terkonfirmasi.",
        human_review:
          "Tim Fraud Risk Analyst meninjau 100% transaksi yang masuk kategori High Risk sebelum pelaporan otoritas.",
        online_metrics:
          "False-Positive Rate < 0.8%, P99 scoring latency < 80ms, Fraud loss reduction > 65%.",
      },
      rollout_plan: {
        exposure: "Shadow mode (0% blocking, logging only) selama 2 minggu, lalu 10% live blocking, naik bertahap ke 100%.",
        duration: "6 minggu siklus verifikasi menyeluruh.",
        segments_gates:
          "Gate: Shadow mode presisi deteksi konsisten > 90% selama 14 hari berturut-turut.",
      },
      risk_management: {
        detection:
          "Dashboard real-time Grafana/Prometheus dengan alarm lonjakan False-Positive atau lonjakan latency API > 100ms.",
        fallback_kill_switch:
          "Bypass switch otomatis ke static rule engine jika cluster inference AI mengalami timeout > 120ms.",
      },
      ownership_action: {
        primary_owner: "Sari (Chief Risk Officer) & Kevin (VP Infrastructure & Data)",
        decision_points:
          "Daily standup review fraud rate; formal audit compliance setiap akhir kuartal.",
      },
      ai_specific: {
        behavior_contract:
          "GOOD:\n1. Selalu cantumkan alasan probabilitas scoring (misal: Device mismatch + Velocity spike).\n2. Wajib memproses scoring dalam batas SLA waktu sub-100 milidetik.\n3. Wajib mencatat audit log lengkap setiap keputusan blocking.\n\nREJECT:\n1. Dilarang melakukan decline tanpa menyertakan kode reason yang sah.\n2. Dilarang menggunakan data sensitif CVV dalam fitur training model.\n3. Dilarang mengambil keputusan diskriminatif berdasarkan suku, agama, atau gender nasabah.",
        guardrails:
          "Enkripsi data nasabah PCI-DSS level 1, zero plain text PAN storage, fail-open vs fail-secure circuit breaker.",
      },
    },
  },
  {
    id: "booking-sports",
    name: "Sewa Lapangan & Booking System Real-Time",
    badge: "Booking & Rental",
    description: "Sistem reservasi lapangan futsal/badminton dengan atomic lock slot 5 menit dan QRIS otomatis.",
    data: {
      title: "Platform Booking & Manajemen Lapangan Olahraga Real-Time",
      opportunity_framing: {
        core_problem:
          "Pemilik venue olahraga sering mengalami double-booking jadwal lapangan dan pembayaran manual via bukti transfer palsu.",
        working_hypothesis:
          "Sistem reservasi dengan atomic slot-locking 5 menit dan pembayaran QRIS instan akan meniadakan bentrok jadwal hingga 100% serta mempercepat proses pemesanan.",
        strategy_fit:
          "Menjadi standar sistem operasional venue olahraga digital dan marketplace komunitas olahraga lokal.",
      },
      boundaries: {
        scope:
          "- Kalender jadwal lapangan interaktif per 1 jam\n- Atomic slot locking 5 menit di database Postgres\n- Integrasi QRIS Dynamic Payment Gateway\n- Webhook verifikasi pembayaran instan & tiket digital QR\n- Dashboard owner untuk cek laporan omset harian",
        non_goals:
          "- Tidak mendukung penyewaan alat fisik (sepatu/raket) di versi rilis v1\n- Tidak mengelola turnamen multi-grup secara otomatis",
      },
      success_measurement: {
        offline_golden_set:
          "Simulasi concurrency test 100 user mem-booking 1 slot lapangan bersamaan (zero race condition).",
        human_review:
          "Staff operasional mengecek rekonsiliasi kas vs saldo payment gateway setiap pergantian shift.",
        online_metrics:
          "0 double-booking incident, waktu checkout < 45 detik, konversi pembayaran QRIS > 90%.",
      },
      rollout_plan: {
        exposure: "Pilot 3 venue futsal di minggu 1-2, ekspansi ke 15 venue di minggu ke-4.",
        duration: "4 minggu fase validasi operasional.",
        segments_gates:
          "Gate: Nol keluhan refund akibat salah catat jadwal selama fase pilot.",
      },
      risk_management: {
        detection:
          "Monitoring webhook timeout dari payment gateway, alerting jika ada pembayaran tanpa pembaruan status slot.",
        fallback_kill_switch:
          "Mode manual override di dashboard admin untuk membuka atau mengunci slot jadwal secara instan.",
      },
      ownership_action: {
        primary_owner: "Bambang (Lead Fullstack Developer) & Dika (Product Manager)",
        decision_points:
          "Evaluasi mingguan performa payment gateway dan feedback kemudahan user saat scan QRIS.",
      },
      ai_specific: {
        behavior_contract:
          "GOOD:\n1. Wajib mengunci baris slot jadwal (SELECT FOR UPDATE) saat reservasi dimulai.\n2. Selalu sediakan tombol cancel reservasi sebelum QRIS dibayar.\n3. Kirimkan invoice otomatis dengan rincian jam, nomor lapangan, dan total harga.\n\nREJECT:\n1. Dilarang mengizinkan checkout tanpa validasi ketersediaan slot aktual.\n2. Dilarang menyimpan nomor rekening manual di luar gateway resmi.\n3. Dilarang mengubah status jadwal menjadi lunas sebelum webhook payment terkonfirmasi valid.",
        guardrails:
          "Enkripsi webhook signature, rate limit booking attempt 5 kali/menit per user, auto-expire booking slot dalam 5 menit.",
      },
    },
  },
];

// Presets for single click chip additions
export const FIELD_PRESETS = {
  scope: [
    "Autentikasi & RBAC (Admin, Manager, User)",
    "Integrasi Webhook Realtime dengan HMAC Signature",
    "REST API & SSE Streaming Endpoint",
    "Export Dokumen ke PDF, Markdown, & JSON",
    "Audit Trail & Logging aktivitas user",
    "Rate Limiting & Token Bucket Defense",
    "Dashboard Analytics & Visual Chart Report",
    "Notifikasi Realtime (Email & Push Notification)",
  ],
  non_goals: [
    "Tidak melakukan auto-action tanpa approval manusia di v1",
    "Tidak mendukung integrasi legacy software on-premise",
    "Tidak membuat aplikasi native mobile (hanya PWA / Responsive Web)",
    "Tidak menyediakan custom plugin marketplace pihak ketiga",
    "Tidak melakukan migrasi data manual dari sistem database lama",
  ],
  metrics: [
    "Turnaround time berkurang > 40%",
    "P95 Latency < 1.2 detik",
    "Error rate HTTP 5xx < 0.2%",
    "False-positive complaint < 3%",
    "Uptime service SLA 99.9%",
    "User Satisfaction Score (CSAT) > 4.5 / 5.0",
    "Konversi funnel checkout naik +20%",
  ],
  rollout: [
    "Canary 5% tim internal (Minggu 1)",
    "Ekspansi ke 25% early beta tester (Minggu 2)",
    "Rilis umum 100% General Availability (Minggu 4)",
    "Gate: Zero critical vulnerability & response time stabil",
  ],
  detection: [
    "Alert Sentry realtime untuk unhandled exception",
    "Lonjakan error rate 5xx > 1% dalam jendela 5 menit",
    "Peringatan anomaly spike pemakaian token API",
    "Monitoring latency P99 via Grafana dashboard",
  ],
  killSwitch: [
    "Toggle switch instan di admin control panel",
    "Fallback otomatis ke rule-based static heuristic",
    "Circuit breaker: auto-degrade saat latency > 30 detik",
    "Fitur maintenance banner interaktif tanpa crash server",
  ],
  behaviorGood: [
    "Selalu sertakan alasan teknis dan diff solusi perbaikan",
    "Wajib memvalidasi runtime schema JSON dengan Zod",
    "Wajib memberikan fallback pesan ramah saat layanan external timeout",
    "Gunakan format teks ringkas, padat, dan anti-halusinasi",
  ],
  behaviorReject: [
    "Dilarang mengubah kode atau fitur di luar cakupan scope",
    "Dilarang membypass strict type-checking atau linter",
    "Dilarang melakukan silent fail tanpa catatan audit log",
    "Dilarang merekomendasikan dependency deprecated atau rentan security",
  ],
  guardrails: [
    "Sanitasi input dari prompt injection dan script XSS",
    "Masking otomatis data sensitif PII (Token, NIK, Password)",
    "Batas waktu eksekusi timeout request max 20 detik",
    "Rate limit 60 request/menit per user session",
  ],
};
