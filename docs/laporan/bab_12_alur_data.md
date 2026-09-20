# Bab 12: Alur Data Sistem (Data Flow)

## 12.1 Analisis Aliran Data Menyeluruh
Aliran data pada sistem NgodingPakePRD bergerak melalui siklus terpadu dari antarmuka input pengguna, validasi sisi server, orkestrasi model AI, persistensi basis data, hingga penyajian grafis interaktif.

Untuk memodelkan dinamika data sistem secara formal, bagian ini memaparkan Data Flow Diagram (DFD) mulai dari Level 0 (Context Diagram), Level 1, hingga Level 2, serta Flowchart Algoritma dan Diagram Proses Bisnis BPMN:

---

### Gambar 14: Data Flow Diagram (DFD) Level 0 - Context Diagram
![Gambar 14: DFD Level 0 Context Diagram](../diagrams/14_dfd_level_0.png)
*Gambar 14: DFD Level 0 Context Diagram*

* **Cara Membaca Diagram**: DFD Level 0 menggambarkan sistem NgodingPakePRD sebagai satu proses sentral tunggal yang berinteraksi dengan empat entitas eksternal: Pengguna/Klien, Super Administrator, Google Gemini AI API, dan Mandiri Private Gateway (MPG).
* **Aliran Data**: Pengguna mengirimkan masukan ide dan menerima dokumen PRD, diagram arsitektur, dan instruksi bayar. Super Administrator mengirim konfigurasi slot dan menerima log serta metrik. Layanan Gemini menerima prompt rekayasa arsitektur dan mengembalikan dokumen terstruktur. Layanan MPG menerima request faktur dan mengirimkan webhook mutasi lunas.

---

### Gambar 15: Data Flow Diagram (DFD) Level 1
![Gambar 15: DFD Level 1](../diagrams/15_dfd_level_1.png)
*Gambar 15: DFD Level 1*

* **Cara Membaca Diagram**: DFD Level 1 memecah sistem menjadi lima proses subsistem utama:
  1. `1.0`: Manajemen Akun & Sesi (berinteraksi dengan Data Store `D1: profiles`).
  2. `2.0`: Generator Ide & Pertanyaan Klarifikasi (berinteraksi dengan Gemini API).
  3. `3.0`: Sintesis Arsitektur & Dokumen PRD (berinteraksi dengan `D2: system_settings`, `D1: profiles`, `D3: prd_history`, dan Gemini API).
  4. `4.0`: Pemrosesan Pembayaran QRIS Dinamis (berinteraksi dengan Gateway MPG, `D4: payment_orders`, dan `D1: profiles`).
  5. `5.0`: Administrasi & Switchboard Terpusat (mengelola `D1`, `D2`, `D3`, dan `D4`).

---

### Gambar 16: Data Flow Diagram (DFD) Level 2 - Proses 3.0 Sintesis PRD
![Gambar 16: DFD Level 2 - Proses 3.0](../diagrams/16_dfd_level_2.png)
*Gambar 16: DFD Level 2 - Proses 3.0*

* **Cara Membaca Diagram**: DFD Level 2 membedah proses inti `3.0` menjadi enam sub-proses terperinci:
  * `3.1`: Validasi Otorisasi & Kuota Pengguna.
  * `3.2`: Resolusi Kunci API & Model Ladder AI.
  * `3.3`: Perakitan Instruksi Sistem 8-Diagram & Kontrak Arsitektur.
  * `3.4`: Eksekusi Pemanggilan AI & Validasi Skema Zod.
  * `3.5`: Pencatatan Log Audit Riwayat & Pengurangan Kuota.
  * `3.6`: Perenderan Dokumen PRD, Pohon Fitur Kurva SVG, dan Kompresi ZIP.

---

### Gambar 17: Flowchart Algoritma Model Ladder & Fallback Execution
![Gambar 17: Flowchart Algoritma Model Ladder](../diagrams/17_flowchart_model_ladder.png)
*Gambar 17: Flowchart Algoritma Model Ladder*

* **Cara Membaca Diagram**: Flowchart berstandar ISO 5807 di atas menguraikan logika algoritma toleransi kesalahan (*failover engine*) yang diimplementasikan pada file `src/lib/gemini/gemini-client.ts`. Jika model teratas dalam ladder mengalami rate limit (HTTP 429), sistem otomatis menandai cooldown kunci selama 60 detik dan mencoba kunci lain di pool. Jika model gagal total, sistem beralih ke model berikutnya dalam ladder (`gemini-3.8-flash` -> `gemini-3.5-flash` -> `gemini-flash-latest` -> `gemini-2.5-flash`), dan bila seluruh model cloud gagal, sistem memicu generator cadangan domain cepat (*Domain Fallback Fast Generator*).

---

### Gambar 18: BPMN-style Business Process Workflow Diagram
![Gambar 18: BPMN-style Business Process Workflow Diagram](../diagrams/18_bpmn_workflow.png)
*Gambar 18: BPMN-style Business Process Workflow Diagram*

* **Cara Membaca Diagram**: Diagram proses bisnis bergaya BPMN di atas membagi alur operasional ke dalam tiga lintasan (*swimlanes*): Pengguna, Platform NgodingPakePRD, dan Layanan Eksternal (Gemini & MPG) untuk menggambarkan perjalanan bisnis produk dari ide mentah hingga penerimaan dokumen arsitektur dan peningkatan langganan.
