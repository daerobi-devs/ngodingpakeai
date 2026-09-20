# Bab 1: Ringkasan Eksekutif

## 1.1 Identitas dan Profil Sistem
Sistem yang dianalisis dan didokumentasikan dalam laporan teknis ini adalah **NgodingPakePRD** (secara internal diidentifikasi sebagai package `prd-architect` versi 0.1.0, dengan domain produksi `ngodingpakeprd.com`). Platform ini merupakan solusi rekayasa perangkat lunak berbasis web modern yang dirancang untuk mengotomatisasi penyusunan Dokumen Spesifikasi Kebutuhan Produk (*Product Requirement Document* / PRD) kelas enterprise, perancangan arsitektur multi-diagram, dekomposisi modul fitur bertahap, serta pembuatan bundel kode permulaan (*starter kit boilerplate*).

## 1.2 Masalah yang Diselesaikan
Dalam siklus pengembangan perangkat lunak tradisional maupun modern, terdapat jurang pemisah yang lebar antara ide konseptual bisnis dengan implementasi teknis oleh tim pengembang:
1. **Ketidaklengkapan Spesifikasi Kebutuhan**: Ide bisnis yang diajukan oleh *founder*, mahasiswa, maupun klien sering kali hanya berupa kalimat ringkas 2 hingga 5 kata tanpa batasan ruang lingkup, skema data, maupun mitigasi *edge cases*.
2. **Keterbatasan Pemahaman Arsitektur**: Pengembang pemula dan UMKM sering kali kesulitan memetakan kebutuhan bisnis ke dalam struktur teknis nyata seperti diagram alur (*flowcharts*), relasi entitas basis data (*ERD*), kontrak API (*REST specification*), serta pemetaan hak akses berbasis peran (*RBAC*).
3. **Friksi Pembuatan Boilerplate**: Memulai proyek perangkat lunak dari nol memerlukan waktu berjam-jam untuk menyiapkan struktur folder, dependensi, aturan *linter*, skrip inisialisasi basis data, dan konfigurasi Docker.
4. **Biaya Konsultasi dan API Komersial yang Tinggi**: Banyak alat bantu manajemen produk komersial mengenakan biaya langganan bulanan mahal atau mewajibkan pengguna memiliki kunci API AI sendiri (*Bring Your Own Key* / BYOK) yang rumit bagi pengguna non-teknis.

## 1.3 Solusi dan Gambaran Cara Kerja Sistem
NgodingPakePRD menyelesaikan permasalahan tersebut melalui orkestrasi kecerdasan buatan terpadu (*Generative AI Engine Orchestration*) yang menggabungkan:
1. **Interactive Idea Refinement & Domain Discovery**: Mengubah ide mentah pengguna menjadi konsep arsitektur 4 pilar yang komprehensif, diikuti dengan analisis domain otomatis yang menyodorkan 3 hingga 4 pertanyaan penemuan teknis berbobot lengkap dengan lencana rekomendasi (*smart recommendation badges*).
2. **Deterministic Architecture Synthesis**: Menggunakan model bahasa besar Google Gemini (dengan hierarki model ladder `gemini-3.8-flash` -> `gemini-3.5-flash` -> `gemini-flash-latest` -> `gemini-2.5-flash`) yang dikunci dengan *JSON Schema* dan validasi ketat pustaka *Zod* untuk menghasilkan PRD berstruktur konsisten, bebas halusinasi, dan mencakup 8 diagram visual berbasis *Mermaid.js*.
3. **Phased Feature Tree Visualization**: Merender pohon dekomposisi fitur produk menggunakan kurva kurvatur SVG Bezier yang elegan, interaktif, dan membagi rilis fitur ke dalam tahapan MVP, Fase Lanjutan, dan Skala Masa Depan.
4. **Starter Kit Export Engine**: Memungkinkan pengguna mengunduh seluruh artefak perencanaan ke dalam arsip file `.zip` yang berisi dokumen `.cursorrules`, panduan desain antarmuka `DESIGN.md`, skrip SQL skema Supabase, serta dokumen PRD format Markdown dan JSON mentah.
5. **Headless Dynamic Payment Gateway (MPG)**: Mengintegrasikan sistem pembayaran mandiri berbasis QRIS Dinamis ASPI EMVCo dengan MDR 0% dan verifikasi mutasi otomatis secara *idempotent* melalui tanda tangan kriptografi HMAC-SHA256.

Dokumen ini disusun sebagai catatan audit teknis menyeluruh, mencakup seluruh lapisan arsitektur, kode sumber, basis data, keamanan, serta instruksi operasional sistem.
