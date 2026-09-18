import { PRDFormData } from "@/types/prd";

export const DEMO_PRD_FORM_DATA: PRDFormData = {
  title: "AI Code Review & Security Sentinel di GitHub PR",
  opportunity_framing: {
    core_problem:
      "Tim engineer menghabiskan 40% waktu sprint untuk review syntax dan cek celah keamanan dasar yang berulang di Pull Request.",
    working_hypothesis:
      "Bot AI otomatis yang membedah diff git dan memberikan komentar korektif spesifik serta patch perbaikan akan memangkas lead-time review hingga 50%.",
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
      "GOOD:\n1. Selalu sertakan alasan teknis dan contoh kode pengganti saat menandai celah keamanan.\n2. Wajib bersikap netral, solutif, dan ringkas dalam komentar code review.\n\nREJECT:\n1. Dilarang mengubah gaya penulisan styleguide yang tidak berdampak pada bug atau performa.\n2. Dilarang memberikan saran refactor masif di luar cakupan baris diff PR yang sedang diubah.",
    guardrails:
      "Prompt injection defense pada diff code comment, sanitasi input diff, timeout API model max 25 detik, PII mask untuk string token/kredensial sebelum dikirim ke LLM.",
  },
};
