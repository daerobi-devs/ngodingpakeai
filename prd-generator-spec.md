# PRD Generator — Spesifikasi Lengkap (Gemini Flash 3.5–3.8)

Berdasarkan framework "Modern PRD" (Opportunity Framing → Boundaries → Success Measurement → Rollout Plan → Risk Management → Ownership & Action → AI-Specific Additions).

---

## 1. Model Routing (Flash 3.5 → 3.8)

Model ID resmi yang benar-benar dipakai (per Gemini API changelog):

| Model ID | Peran di aplikasi | Kapan dipakai |
|---|---|---|
| `gemini-3.5-flash-lite` | Validasi input cepat, cek kolom kosong/ambigu | Sebelum generate, real-time saat user ngetik |
| `gemini-3.5-flash` | Brainstorming/tanya-jawab awal (chat interaktif) | Tahap "interview" sebelum form final |
| `gemini-3.6-flash` | Draft PRD pertama dari data form | Generate awal — lebih token-efficient |
| `gemini-3.7-flash` | Draft final + task breakdown teknis | "workhorse model" resmi Google untuk coding/agentic — dipakai di step paling berat |
| `gemini-3.8-flash` | Review/polish akhir + generate JSON buat visual | Model terbaru, dipakai di step terakhir sebelum output final |

**Rantai fallback (biar gacor):**
```
3.8-flash (timeout/retry 2x, backoff 1s→2s→4s)
   ↓ gagal terus
3.7-flash (retry 2x)
   ↓ gagal terus
3.6-flash (retry 2x)
   ↓ gagal terus
3.5-flash (last resort, pasti generate walau kualitas turun sedikit)
```
Rotasi ini dijalankan per **API key juga** — tiap key punya rate-limit sendiri, jadi kombinasinya: key A + model 3.8 gagal → coba key B + model 3.8 dulu, baru turun ke 3.7 kalau semua key kena limit di 3.8.

---

## 2. Kolom Input yang Wajib Diisi User (Form Schema)

Form ini jadi fondasi PRD — jangan biarkan AI "menebak" bagian krusial.

```json
{
  "opportunity_framing": {
    "core_problem": { "type": "text", "required": true, "placeholder": "Masalah apa yang ingin diselesaikan, dalam 1 kalimat?" },
    "working_hypothesis": { "type": "text", "required": true, "placeholder": "Solusi/jawaban yang diajukan" },
    "strategy_fit": { "type": "text", "required": false, "placeholder": "Ini membuka peluang/inisiatif apa selanjutnya?" }
  },
  "boundaries": {
    "scope": { "type": "textarea", "required": true, "placeholder": "Fitur apa saja yang TERMASUK" },
    "non_goals": { "type": "textarea", "required": true, "placeholder": "Yang SENGAJA tidak dikerjakan dulu" }
  },
  "success_measurement": {
    "offline_golden_set": { "type": "text", "required": false, "placeholder": "Data uji validasi (kalau ada)" },
    "human_review": { "type": "text", "required": false, "placeholder": "Cek kualitatif apa yang dilakukan manusia" },
    "online_metrics": { "type": "text", "required": true, "placeholder": "KPI + threshold-nya" }
  },
  "rollout_plan": {
    "exposure": { "type": "text", "required": false, "placeholder": "% traffic/user di awal" },
    "duration": { "type": "text", "required": false, "placeholder": "Lama masa uji" },
    "segments_gates": { "type": "text", "required": false, "placeholder": "Kriteria naik ke tahap berikutnya" }
  },
  "risk_management": {
    "detection": { "type": "textarea", "required": true, "placeholder": "Cara tahu kalau ada masalah" },
    "fallback_kill_switch": { "type": "textarea", "required": true, "placeholder": "Mekanisme mundur/matikan fitur" }
  },
  "ownership_action": {
    "primary_owner": { "type": "text", "required": true, "placeholder": "Siapa yang tanggung jawab" },
    "decision_points": { "type": "text", "required": false, "placeholder": "Kapan harus direvisit/dievaluasi" }
  },
  "ai_specific": {
    "behavior_contract": { "type": "textarea", "required": true, "placeholder": "Apa yang WAJIB (GOOD) dan DILARANG (REJECT) dilakukan AI/fitur" },
    "guardrails": { "type": "textarea", "required": true, "placeholder": "Batasan/constraint teknis & etika" }
  }
}
```

Validasi: field `required: true` gak boleh kosong sebelum tombol "Generate PRD" aktif. Field kosong yang optional → biarkan AI isi dengan asumsi wajar, tapi ditandai `[assumption]` di output biar user tahu itu bukan input asli mereka.

---

## 3. System Prompt (Master Prompt)

Ini yang dikirim ke model (gabung dengan data form di atas dalam format JSON):

```
Kamu adalah PRD Architect — asisten yang mengubah input terstruktur menjadi
Product Requirement Document modern, mengikuti KETAT 7 kategori berikut,
dalam urutan ini, tanpa menambah atau menghapus kategori:

1. OPPORTUNITY FRAMING (Core Problem, Working Hypothesis, Strategy Fit)
2. BOUNDARIES (Scope, Non-Goals)
3. SUCCESS MEASUREMENT (Offline Golden Set, Human Review, Online Metrics)
4. ROLLOUT PLAN (Exposure, Duration, Segments & Ramp Gates)
5. RISK MANAGEMENT (Detection, Fallback & Kill Switch)
6. OWNERSHIP & ACTION (Primary Owner, Decision Points)
7. AI-SPECIFIC ADDITIONS (Behavior Contract, Guardrails)

ATURAN KETAT:
- Jangan pernah mengosongkan satu kategori pun. Kalau data user tidak
  cukup untuk satu sub-bagian, buat asumsi yang wajar dan tandai dengan
  prefix "[asumsi]" di depan kalimat itu.
- Jangan menambahkan fitur/scope yang tidak diminta user (no scope creep).
- Behavior Contract WAJIB berisi minimal 2 hal "GOOD" (harus dilakukan)
  dan minimal 2 hal "REJECT" (dilarang dilakukan).
- Task breakdown di akhir harus dalam bentuk checklist, tiap item harus
  actionable (bisa langsung ditempel ke AI coding agent seperti Cursor/
  Claude Code), maksimal 1-2 kalimat per item.
- Output HARUS dalam format JSON sesuai skema yang diberikan — jangan
  ada teks di luar JSON, jangan ada markdown fences.
- Gunakan Bahasa Indonesia yang jelas dan ringkas, hindari jargon kosong.

Berikut data input dari user:
{{FORM_DATA_JSON}}

Hasilkan PRD sesuai skema output yang ditentukan.
```

---

## 4. Output JSON Schema (structured output — pakai `responseSchema` di Gemini API)

```json
{
  "type": "object",
  "properties": {
    "title": { "type": "string" },
    "opportunity_framing": {
      "type": "object",
      "properties": {
        "core_problem": { "type": "string" },
        "working_hypothesis": { "type": "string" },
        "strategy_fit": { "type": "string" }
      },
      "required": ["core_problem", "working_hypothesis", "strategy_fit"]
    },
    "boundaries": {
      "type": "object",
      "properties": {
        "scope": { "type": "array", "items": { "type": "string" } },
        "non_goals": { "type": "array", "items": { "type": "string" } }
      },
      "required": ["scope", "non_goals"]
    },
    "success_measurement": {
      "type": "object",
      "properties": {
        "offline_golden_set": { "type": "string" },
        "human_review": { "type": "string" },
        "online_metrics": { "type": "string" }
      },
      "required": ["offline_golden_set", "human_review", "online_metrics"]
    },
    "rollout_plan": {
      "type": "object",
      "properties": {
        "exposure": { "type": "string" },
        "duration": { "type": "string" },
        "segments_gates": { "type": "string" }
      },
      "required": ["exposure", "duration", "segments_gates"]
    },
    "risk_management": {
      "type": "object",
      "properties": {
        "detection": { "type": "string" },
        "fallback_kill_switch": { "type": "string" }
      },
      "required": ["detection", "fallback_kill_switch"]
    },
    "ownership_action": {
      "type": "object",
      "properties": {
        "primary_owner": { "type": "string" },
        "decision_points": { "type": "string" }
      },
      "required": ["primary_owner", "decision_points"]
    },
    "ai_specific": {
      "type": "object",
      "properties": {
        "behavior_contract": {
          "type": "object",
          "properties": {
            "good": { "type": "array", "items": { "type": "string" }, "minItems": 2 },
            "reject": { "type": "array", "items": { "type": "string" }, "minItems": 2 }
          },
          "required": ["good", "reject"]
        },
        "guardrails": { "type": "array", "items": { "type": "string" } }
      },
      "required": ["behavior_contract", "guardrails"]
    },
    "task_breakdown": { "type": "array", "items": { "type": "string" } }
  },
  "required": [
    "title", "opportunity_framing", "boundaries", "success_measurement",
    "rollout_plan", "risk_management", "ownership_action", "ai_specific",
    "task_breakdown"
  ]
}
```

Kirim schema ini lewat parameter `generationConfig.responseSchema` di request Gemini API (bukan cuma diminta lewat teks prompt) — ini yang bikin output PASTI valid JSON, gak perlu regex-parsing yang rawan gagal. Kalau parsing tetap gagal (jarang tapi bisa), retry sekali dengan model yang sama sebelum fallback ke model di bawahnya.

---

## 5. Lapisan "Gacor" (Reliability)

- **Multi-API-key pool**: simpan 3-5 key Gemini di backend, round-robin. Kalau satu key balikin error 429, tandai "cooldown 60 detik" dan pindah ke key lain otomatis.
- **Retry + backoff** di setiap panggilan API (max 3x, exponential).
- **Fallback antar model** seperti rantai di bagian 1.
- **Streaming** (`generateContentStream`) khusus di tahap brainstorming/chat, supaya user gak nunggu diam — untuk tahap generate PRD final, non-streaming lebih aman karena hasilnya harus divalidasi sebagai satu JSON utuh dulu sebelum ditampilkan.
- **Validasi schema di backend** sebelum dikirim ke frontend — kalau ada field required yang kosong, backend otomatis minta model regenerate bagian itu saja (bukan generate ulang semuanya, biar hemat token).

---

## 6. Cara Bikin Visual Mindmap dari Output PRD

Karena output-nya udah JSON terstruktur (bagian 4), bikin visualnya jadi tinggal mapping data → node, gak perlu minta AI "menggambar". Dua opsi:

**Opsi A — Mermaid mindmap (paling cepat diimplementasi):**
```
mindmap
  root((Judul PRD))
    Opportunity Framing
      Core Problem
      Working Hypothesis
      Strategy Fit
    Boundaries
      Scope
      Non-Goals
    Success Measurement
      Offline Golden Set
      Human Review
      Online Metrics
    Rollout Plan
      Exposure
      Duration
      Segments & Gates
    Risk Management
      Detection
      Fallback & Kill Switch
    Ownership & Action
      Primary Owner
      Decision Points
    AI-Specific Additions
      Behavior Contract
      Guardrails
```
Generate string ini secara programatik dari JSON hasil AI (bukan diminta ke AI), lalu render pakai library `mermaid.js` di frontend. Paling murah karena nol token tambahan.

**Opsi B — Custom SVG/D3 (kalau mau tampilan identik dengan referensi gambar kamu)** — bikin komponen mindmap horizontal (root kotak hitam di kiri, 7 kategori kotak biru di tengah, sub-item kotak biru muda di kanan), styling statis, cuma data node-nya yang dinamis dari JSON.

Di bawah ini contoh render visualnya (Opsi B) dengan data dummy, biar kamu lihat gambarannya:
