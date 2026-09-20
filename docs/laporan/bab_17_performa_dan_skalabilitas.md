# Bab 17: Analisis Performa dan Skalabilitas Sistem

## 17.1 Optimasi yang Telah Diterapkan
1. **Penonaktifan Thinking Budget AI untuk Latensi Rendah**:
   * Pada endpoint `POST /api/enrich-idea`, parameter `thinkingConfig: { thinkingBudget: 0 }` diterapkan pada model `gemini-2.5-flash`. Hal ini memangkas waktu tunggu dari ~8 detik menjadi di bawah 2 detik serta mengeliminasi pemborosan kuota token hingga 1.100 token per permintaan.
2. **Caching Sisi Server pada Statistik Komunitas (`/api/stats`)**:
   * Data statistik agregat generasi PRD di-cache dalam memori server selama 60 detik (`Cache-Control: public, s-maxage=60`), mencegah kueri hitung baris (*COUNT(*) queries*) berulang ke basis data Supabase saat banyak pengguna mengakses landing page secara bersamaan.
3. **Pemuatan Komponen Dinamis & Client-Side Rendering Diagram**:
   * Pustaka *Mermaid.js* (~3.5 MB) hanya dimuat di peramban pengguna saat komponen `PRDViewer` atau `MermaidRenderer` aktif, menjaga bundle ukuran halaman muka tetap sangat ringan.
4. **Standalone Output Next.js**:
   * Mengurangi jejak memori server kontainer Node.js secara signifikan, memungkinkan aplikasi berjalan mulus pada VPS berdaya komputasi rendah (1 vCPU, 1 GB RAM).

## 17.2 Analisis Potensi Bottleneck dan Saran Peningkatan Skalabilitas
1. **Ketergantungan Kuota Eksternal Google AI Studio**:
   * *Bottleneck*: Kunci API Google Gemini gratisan memiliki batas *Rate Limit* (15 RPM / Requests Per Minute). Jika ada lonjakan pengunjung bersamaan, pengguna dapat mengalami antrean panjang atau error 429.
   * *Saran Peningkatan*:
     * Manfaatkan fitur multi-slot kunci Gemini yang sudah ada di Tab 2 Admin secara maksimal (mengisi 5-10 kunci aktif untuk load balancing round-robin).
     * Beralih ke Google Vertex AI (Enterprise Pay-as-you-go) dengan kuota TPS (Transactions Per Second) tak terbatas saat volume bisnis membesar.
2. **Polling Status Transaksi QRIS pada Client**:
   * *Bottleneck*: Klien melakukan polling HTTP GET ke `/api/orders?code=xxx` setiap 3 detik selama jendela waktu 15 menit.
   * *Saran Peningkatan*: Implementasikan *Supabase Realtime Channel* berbasis WebSocket (`supabase.channel('payment_orders')`) sehingga pembaruan status lunas didorong (*push notification*) secara instan ke browser tanpa menghasilkan beban HTTP polling berkala.
