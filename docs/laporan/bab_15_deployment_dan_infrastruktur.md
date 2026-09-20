# Bab 15: Deployment dan Arsitektur Infrastruktur

## 15.1 Arsitektur Topologi Infrastruktur
Aplikasi didesain untuk berjalan di atas arsitektur infrastruktur mandiri berbasis kontainer (*self-hosted container infrastructure*) yang efisien dan hemat biaya:
* **DNS & Edge Network**: Permintaan pengguna dari internet melewati Cloudflare / DNS Provider dengan protokol HTTPS (Port 443).
* **Reverse Proxy / Ingress**: Dilayani oleh Nginx, Caddy, atau Traefik yang bertindak sebagai *SSL Termination* otomatis menggunakan sertifikat Let's Encrypt, lalu meneruskan lalu lintas (*reverse proxy pass*) ke port internal kontainer 3000.
* **Aplikasi Web**: Berjalan di dalam kontainer Docker terisolasi pada Virtual Private Server (VPS) atau platform PaaS mandiri seperti Coolify.
* **Basis Data**: Terhubung secara aman ke kluster PostgreSQL terkelola di Supabase Cloud.

---

### Gambar 19: Deployment & Infrastructure Topology Diagram
![Gambar 19: Deployment & Infrastructure Topology Diagram](../diagrams/19_deployment_topology.png)
*Gambar 19: Deployment & Infrastructure Topology Diagram*

* **Cara Membaca Diagram**: Diagram di atas menggambarkan topologi jaringan fisik dan logis dari pengguna internet, domain DNS, reverse proxy SSL, kontainer internal aplikasi, hingga koneksi ke layanan cloud Supabase, Google AI, dan Gateway MPG.

---

## 15.2 Strategi Multi-Stage Dockerfile
Berdasarkan file `Dockerfile` pada akar repositori, proses pembuatan image produksi dioptimalkan secara mendalam menggunakan pendekatan 3-tahap (*3-stage build*):

```dockerfile
# Stage 1: Dependencies (deps)
FROM node:22-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* ./
# Optimasi ketahanan jaringan npm (mencegah ECONNRESET di VPS)
RUN npm config set registry https://registry.npmjs.org/ &&     npm config set fetch-retries 5 &&     npm config set maxsockets 2 &&     (npm ci --legacy-peer-deps || npm install --legacy-peer-deps)

# Stage 2: Builder
FROM node:22-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
RUN npm run build

# Stage 3: Runner (Produksi Minimal)
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
# Pengguna non-root untuk keamanan
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 -g nodejs nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

### Keunggulan Arsitektur Kontainer Ini:
1. **Ketahanan Jaringan Tinggi**: Konfigurasi `fetch-retries 5`, `fetch-timeout 300000`, dan `maxsockets 2` secara efektif mencegah kegagalan *ECONNRESET* yang umum terjadi saat VPS melakukan penarikan pustaka dari npm registry.
2. **Ukuran Image Minimalis**: Memanfaatkan fitur `output: 'standalone'` Next.js, image akhir hanya menyertakan berkas JavaScript terkompilasi dan modul yang esensial, memangkas ukuran image dari >1.2 GB menjadi hanya ~180 MB.
3. **Keamanan Eksekusi Non-Root**: Kontainer dijalankan di bawah akun pengguna terbatas `nextjs:1001`, mencegah eskalasi hak akses sistem operasi host jika terjadi kerentanan perangkat lunak.

---

### Gambar 20: CI/CD & Docker Multi-Stage Pipeline
![Gambar 20: CI/CD & Docker Multi-Stage Pipeline](../diagrams/20_cicd_docker_pipeline.png)
*Gambar 20: CI/CD & Docker Multi-Stage Pipeline*

* **Cara Membaca Diagram**: Diagram di atas menunjukkan pipeline otomatis saat kode baru di-push ke branch `main`, melewati tahap resolusi dependensi, kompilasi builder Turbopack, pembungkusan image runner, hingga rilis kontainer produksi pada platform Coolify dengan pemeriksaan kesehatan (*health check*).
