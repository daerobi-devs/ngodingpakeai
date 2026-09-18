import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan — ngodingpakeprd',
  description: 'Syarat dan Ketentuan penggunaan platform ngodingpakeprd.',
};

export default function TermsPage() {
  const lastUpdated = '18 September 2026';

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-[#09090b]">
        <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-extrabold text-white text-sm">
            ngodingpake<span className="text-amber-500">prd</span>
          </Link>
          <Link
            href="/"
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-6 py-16 space-y-10">
        {/* Title */}
        <div className="space-y-3 border-b border-zinc-800 pb-8">
          <p className="text-xs font-mono uppercase tracking-widest text-zinc-600">Legal</p>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Syarat &amp; Ketentuan</h1>
          <p className="text-sm text-zinc-500">Terakhir diperbarui: {lastUpdated}</p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed">
          {/* 1 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">1. Penerimaan Syarat</h2>
            <p>
              Dengan mengakses atau menggunakan platform <strong className="text-zinc-100">ngodingpakeprd</strong> (&ldquo;Layanan&rdquo;), Anda menyatakan telah membaca, memahami, dan menyetujui untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan ketentuan ini, mohon untuk tidak menggunakan layanan kami.
            </p>
          </section>

          {/* 2 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">2. Deskripsi Layanan</h2>
            <p>
              ngodingpakeprd adalah platform berbasis AI yang membantu pengguna menghasilkan dokumen Product Requirements Document (PRD), diagram arsitektur, skema database, dan paket starter kit proyek secara otomatis.
            </p>
            <p>
              Layanan tersedia dalam dua tingkatan:
            </p>
            <ul className="space-y-2 pl-0">
              {[
                { label: 'Paket Gratis', desc: 'Akses terbatas dengan kuota generasi per hari menggunakan model AI standar.' },
                { label: 'Paket Pro (Lifetime)', desc: 'Akses penuh tanpa batas dengan model AI premium, fitur PRD lanjutan, dan export starter kit.' },
              ].map((item) => (
                <li key={item.label} className="flex gap-3 py-2 border-b border-zinc-800/60 last:border-0">
                  <span className="text-amber-500 font-bold shrink-0">—</span>
                  <span><strong className="text-zinc-200">{item.label}:</strong> {item.desc}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 3 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">3. Akun Pengguna</h2>
            <ul className="space-y-1.5 pl-4">
              {[
                'Anda harus berusia minimal 13 tahun untuk menggunakan layanan ini.',
                'Login dilakukan melalui Google OAuth. Anda bertanggung jawab menjaga keamanan akun Google Anda.',
                'Satu akun per pengguna. Penggunaan akun bersama atau penyalahgunaan dilarang.',
                'Kami berhak menangguhkan atau menghapus akun yang melanggar ketentuan ini tanpa pemberitahuan sebelumnya.',
              ].map((item) => (
                <li key={item} className="flex gap-2 text-sm">
                  <span className="text-zinc-600 shrink-0 mt-0.5">›</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 4 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">4. Pembayaran & Lisensi Pro</h2>
            <p>
              Paket Pro tersedia dengan pembayaran sekali bayar (lifetime) melalui metode pembayaran yang tersedia di platform. Dengan melakukan pembayaran:
            </p>
            <ul className="space-y-1.5 pl-4">
              {[
                'Anda mendapatkan akses seumur hidup ke fitur Pro selama platform masih beroperasi.',
                'Pembayaran bersifat final dan tidak dapat dikembalikan (non-refundable) kecuali terdapat kegagalan teknis yang dapat dibuktikan dari pihak kami.',
                'Kami berhak menambah atau mengubah fitur Pro tanpa pemberitahuan, namun tidak akan mengurangi fitur yang sudah dijanjikan.',
                'Akses Pro melekat pada akun Google yang digunakan saat pembayaran dan tidak dapat dipindahtangankan.',
              ].map((item) => (
                <li key={item} className="flex gap-2 text-sm">
                  <span className="text-zinc-600 shrink-0 mt-0.5">›</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 5 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">5. Penggunaan yang Dilarang</h2>
            <p>Anda dilarang menggunakan layanan kami untuk:</p>
            <ul className="space-y-1.5 pl-4">
              {[
                'Melanggar hukum yang berlaku di Indonesia atau negara asal Anda',
                'Membuat, mendistribusikan, atau mempromosikan konten yang bersifat ilegal, berbahaya, atau menyinggung',
                'Melakukan scraping, reverse engineering, atau eksploitasi teknis terhadap platform',
                'Mendistribusikan ulang atau menjual kembali output layanan kami sebagai produk mandiri tanpa izin tertulis',
                'Menggunakan platform untuk menghasilkan konten yang melanggar hak kekayaan intelektual pihak lain',
                'Mencoba mengakses data pengguna lain atau sistem internal platform',
              ].map((item) => (
                <li key={item} className="flex gap-2 text-sm">
                  <span className="text-zinc-600 shrink-0 mt-0.5">›</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 6 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">6. Kepemilikan Konten</h2>
            <p>
              PRD, diagram, dan dokumen yang dihasilkan oleh platform menggunakan input dari Anda adalah milik Anda sepenuhnya. Kami tidak mengklaim kepemilikan atas output yang dihasilkan dari ide dan input Anda.
            </p>
            <p>
              Namun demikian, Anda memberikan kami izin terbatas untuk menyimpan dan memproses konten tersebut semata-mata untuk keperluan penyediaan layanan kepada Anda.
            </p>
          </section>

          {/* 7 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">7. Batasan Tanggung Jawab</h2>
            <p>
              Layanan disediakan dalam kondisi &ldquo;sebagaimana adanya&rdquo; (<em>as-is</em>) tanpa jaminan apapun, tersurat maupun tersirat. Kami tidak bertanggung jawab atas:
            </p>
            <ul className="space-y-1.5 pl-4">
              {[
                'Kerugian bisnis atau finansial yang timbul dari penggunaan output platform',
                'Gangguan layanan, downtime, atau kehilangan data akibat kejadian di luar kendali kami',
                'Ketidakakuratan atau ketidaklengkapan konten yang dihasilkan oleh AI',
                'Keputusan bisnis yang diambil berdasarkan output dari platform kami',
              ].map((item) => (
                <li key={item} className="flex gap-2 text-sm">
                  <span className="text-zinc-600 shrink-0 mt-0.5">›</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 8 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">8. Ketersediaan Layanan</h2>
            <p>
              Kami berupaya menjaga ketersediaan layanan 24/7, namun tidak menjamin uptime 100%. Pemeliharaan, pembaruan sistem, atau gangguan layanan pihak ketiga (Supabase, Google, penyedia AI) dapat menyebabkan layanan tidak tersedia sementara.
            </p>
          </section>

          {/* 9 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">9. Perubahan Layanan & Ketentuan</h2>
            <p>
              Kami berhak mengubah, menambah, atau menghentikan fitur layanan kapan saja. Perubahan signifikan pada Syarat dan Ketentuan ini akan diinformasikan minimal 7 hari sebelum berlaku melalui notifikasi dalam aplikasi atau email.
            </p>
            <p>
              Penggunaan layanan yang berkelanjutan setelah perubahan berlaku dianggap sebagai penerimaan terhadap ketentuan yang diperbarui.
            </p>
          </section>

          {/* 10 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">10. Hukum yang Berlaku</h2>
            <p>
              Syarat dan Ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia. Setiap sengketa yang timbul akan diselesaikan melalui musyawarah mufakat, dan jika tidak tercapai, melalui pengadilan yang berwenang di Indonesia.
            </p>
          </section>

          {/* 11 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">11. Hubungi Kami</h2>
            <p>
              Untuk pertanyaan terkait Syarat dan Ketentuan ini, silakan hubungi:
            </p>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-1 font-mono text-xs text-zinc-400">
              <p><span className="text-zinc-600">Nama:</span> ngodingpakeprd</p>
              <p><span className="text-zinc-600">Email:</span>{' '}
                <a href="mailto:daerobi.devs@gmail.com" className="text-amber-400 hover:text-amber-300">
                  daerobi.devs@gmail.com
                </a>
              </p>
              <p><span className="text-zinc-600">GitHub:</span>{' '}
                <a href="https://github.com/daerobi-devs" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300">
                  @daerobi-devs
                </a>
              </p>
            </div>
          </section>
        </div>

        {/* Footer nav */}
        <div className="border-t border-zinc-800 pt-8 flex items-center justify-between text-xs text-zinc-600">
          <Link href="/privacy" className="hover:text-zinc-400 transition-colors">
            Kebijakan Privasi
          </Link>
          <Link href="/" className="hover:text-zinc-400 transition-colors">
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    </div>
  );
}
