import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi — ngodingpakeprd',
  description: 'Kebijakan Privasi platform ngodingpakeprd. Pelajari bagaimana kami mengumpulkan, menggunakan, dan melindungi data Anda.',
};

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Kebijakan Privasi</h1>
          <p className="text-sm text-zinc-500">Terakhir diperbarui: {lastUpdated}</p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed">
          {/* 1 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">1. Pendahuluan</h2>
            <p>
              Selamat datang di <strong className="text-zinc-100">ngodingpakeprd</strong> (&ldquo;Kami&rdquo;, &ldquo;Layanan&rdquo;). Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi Anda saat menggunakan platform kami di{' '}
              <a href="https://ngodingpakeprd.com" className="text-amber-400 hover:text-amber-300 underline underline-offset-2">
                ngodingpakeprd.com
              </a>.
            </p>
            <p>
              Dengan menggunakan layanan kami, Anda menyetujui pengumpulan dan penggunaan informasi sesuai dengan kebijakan ini.
            </p>
          </section>

          {/* 2 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">2. Informasi yang Kami Kumpulkan</h2>
            <p>Kami mengumpulkan informasi berikut ketika Anda menggunakan layanan kami:</p>
            <ul className="list-none space-y-2 pl-0">
              {[
                { label: 'Informasi Akun Google', desc: 'Nama lengkap, alamat email, dan foto profil yang diperoleh melalui Google OAuth ketika Anda login.' },
                { label: 'Data Penggunaan', desc: 'PRD yang Anda buat, riwayat generasi, dan preferensi penggunaan fitur dalam platform.' },
                { label: 'Data Teknis', desc: 'Alamat IP, jenis browser, sistem operasi, dan waktu akses untuk keperluan keamanan dan diagnostik.' },
                { label: 'Data Pembayaran', desc: 'Status transaksi dan referensi order. Kami tidak menyimpan data kartu kredit atau informasi rekening bank secara langsung.' },
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
            <h2 className="text-base font-bold text-white">3. Cara Kami Menggunakan Informasi</h2>
            <p>Informasi yang dikumpulkan digunakan untuk:</p>
            <ul className="space-y-1.5 pl-4">
              {[
                'Mengautentikasi identitas dan mengelola sesi login Anda',
                'Menyediakan fitur generator PRD dan menyimpan riwayat hasil generasi',
                'Memproses dan memverifikasi transaksi pembayaran',
                'Meningkatkan kualitas layanan melalui analisis penggunaan anonim',
                'Mengirimkan notifikasi penting terkait akun atau layanan (jika diperlukan)',
                'Mematuhi kewajiban hukum yang berlaku',
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
            <h2 className="text-base font-bold text-white">4. Berbagi Data dengan Pihak Ketiga</h2>
            <p>
              Kami <strong className="text-zinc-100">tidak menjual, menyewakan, atau memperdagangkan</strong> data pribadi Anda kepada pihak ketiga manapun untuk tujuan komersial.
            </p>
            <p>Kami hanya berbagi data dengan pihak berikut dalam kondisi terbatas:</p>
            <ul className="space-y-1.5 pl-4">
              {[
                'Supabase — penyedia database dan autentikasi (data disimpan di server Supabase)',
                'Google LLC — penyedia layanan OAuth untuk proses login',
                'Penyedia AI (Gemini, OpenRouter) — konten ide yang Anda masukkan untuk diproses menjadi PRD',
                'Pihak berwenang — jika diwajibkan oleh hukum yang berlaku di Indonesia',
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
            <h2 className="text-base font-bold text-white">5. Keamanan Data</h2>
            <p>
              Kami menggunakan langkah-langkah keamanan teknis yang wajar untuk melindungi data Anda, termasuk enkripsi data saat transit (HTTPS/TLS), kontrol akses berbasis Row Level Security (RLS) di database, dan praktik pengelolaan secret yang aman.
            </p>
            <p>
              Namun demikian, tidak ada sistem transmisi data melalui internet atau penyimpanan elektronik yang 100% aman. Kami tidak dapat menjamin keamanan mutlak.
            </p>
          </section>

          {/* 6 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">6. Hak Pengguna</h2>
            <p>Anda memiliki hak untuk:</p>
            <ul className="space-y-1.5 pl-4">
              {[
                'Mengakses data pribadi yang kami simpan tentang Anda',
                'Meminta penghapusan akun dan seluruh data terkait',
                'Mencabut izin akses Google OAuth kapan saja melalui pengaturan akun Google Anda',
                'Mengajukan pertanyaan atau keberatan terkait penggunaan data Anda',
              ].map((item) => (
                <li key={item} className="flex gap-2 text-sm">
                  <span className="text-zinc-600 shrink-0 mt-0.5">›</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p>
              Untuk menggunakan hak-hak di atas, hubungi kami melalui email:{' '}
              <a href="mailto:daerobi.devs@gmail.com" className="text-amber-400 hover:text-amber-300 underline underline-offset-2">
                daerobi.devs@gmail.com
              </a>
            </p>
          </section>

          {/* 7 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">7. Cookie & Penyimpanan Lokal</h2>
            <p>
              Kami menggunakan cookie sesi dan localStorage untuk menjaga status login Anda dan menyimpan preferensi tampilan (tema gelap/terang). Anda dapat menonaktifkan cookie melalui pengaturan browser, namun ini dapat mempengaruhi fungsi login.
            </p>
          </section>

          {/* 8 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">8. Retensi Data</h2>
            <p>
              Data akun Anda disimpan selama akun aktif digunakan. Data PRD dan riwayat generasi disimpan selama masa aktif langganan atau akun Anda. Setelah penghapusan akun, data akan dihapus dalam waktu 30 hari kerja.
            </p>
          </section>

          {/* 9 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">9. Perubahan Kebijakan</h2>
            <p>
              Kami dapat memperbarui Kebijakan Privasi ini sewaktu-waktu. Perubahan signifikan akan diinformasikan melalui notifikasi di dalam aplikasi atau email. Penggunaan layanan yang berkelanjutan setelah perubahan dianggap sebagai persetujuan terhadap kebijakan yang diperbarui.
            </p>
          </section>

          {/* 10 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">10. Hubungi Kami</h2>
            <p>
              Jika Anda memiliki pertanyaan, kekhawatiran, atau permintaan terkait Kebijakan Privasi ini, silakan hubungi:
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
          <Link href="/terms" className="hover:text-zinc-400 transition-colors">
            Terms of Service
          </Link>
          <Link href="/" className="hover:text-zinc-400 transition-colors">
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    </div>
  );
}
