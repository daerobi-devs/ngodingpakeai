'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface LandingFAQProps {
  theme?: 'dark' | 'light';
}

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'Apakah saya harus mahir koding untuk menggunakan ngodingpakeprd?',
    answer:
      'Tidak harus. Platform ini dirancang untuk menerjemahkan konsep produk Anda menjadi spesifikasi arsitektur teknis dan backlog tugas yang terstruktur. Hasilnya siap dieksekusi langsung oleh AI coding agent seperti Cursor, Antigravity, atau Claude Code.',
  },
  {
    question: 'Apa perbedaan antara Mode Terpandu dan Mode Studio?',
    answer:
      'Mode Terpandu membantu Anda merumuskan PRD 7 bab dan diagram arsitektur secara cepat. Sedangkan Mode Studio adalah ruang kerja tingkat lanjut yang dilengkapi papan Kanban 4 kolom, AI Co-Pilot untuk diskusi atau revisi dokumen, serta server MCP terisolasi untuk sinkronisasi langsung ke editor lokal.',
  },
  {
    question: 'Bagaimana cara AI coding agent membaca PRD saya?',
    answer:
      'Anda memiliki dua pilihan: pertama, menghubungkan editor langsung ke server MCP proyek Anda sehingga agen dapat menarik spesifikasi dan memperbarui status tugas secara otonom. Kedua, mengunduh Starter Kit (.ZIP) offline yang berisi PRD.md, DESIGN.md, dan aturan .cursorrules.',
  },
  {
    question: 'Apakah saya bisa mengubah dokumen setelah PRD dibuat?',
    answer:
      'Tentu. Di Mode Studio, Anda dapat menggunakan AI Chat dengan Mode Diskusi untuk berkonsultasi arsitektur, atau Mode Revisi untuk memperbarui isi dokumen PRD secara otomatis dengan penomoran versi yang tersimpan rapi.',
  },
  {
    question: 'Apakah ide dan spesifikasi proyek saya aman?',
    answer:
      'Ya, aman. Seluruh data proyek dilindungi dengan sistem token otorisasi dan Row Level Security (RLS). Server MCP proyek Anda terisolasi secara multi-tenant sehingga tidak dapat diakses oleh pengguna lain.',
  },
];

export const LandingFAQ: React.FC<LandingFAQProps> = ({ theme = 'dark' }) => {
  const isLight = theme === 'light';
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2.5">
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
            isLight
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-800'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}
        >
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Pertanyaan Umum</span>
        </div>

        <h2
          className={`text-2xl sm:text-3xl font-black tracking-tight leading-tight ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}
        >
          Frequently Asked Questions
        </h2>

        <p
          className={`text-xs sm:text-sm leading-relaxed ${
            isLight ? 'text-slate-600' : 'text-zinc-400'
          }`}
        >
          Jawaban ringkas seputar pembuatan spesifikasi, integrasi protokol MCP, dan alur kerja agen koding.
        </p>
      </div>

      {/* Clean Accordion List (No tables, no terminal style) */}
      <div className="space-y-3">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? isLight
                    ? 'bg-white border-amber-500/40 shadow-xs'
                    : 'bg-zinc-900/40 border-amber-500/40'
                  : isLight
                  ? 'bg-white/80 border-slate-200 hover:border-slate-300'
                  : 'bg-zinc-950/40 border-zinc-800/80 hover:border-zinc-700/80'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleFAQ(idx)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left gap-4 cursor-pointer"
              >
                <span
                  className={`text-sm sm:text-base font-bold transition-colors ${
                    isOpen
                      ? isLight
                        ? 'text-amber-700'
                        : 'text-amber-400'
                      : isLight
                      ? 'text-slate-900'
                      : 'text-zinc-100'
                  }`}
                >
                  {item.question}
                </span>
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  } ${
                    isLight
                      ? 'border-slate-200 bg-slate-50 text-slate-700'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-300'
                  }`}
                >
                  <ChevronDown className="h-4 w-4" />
                </div>
              </button>

              {isOpen && (
                <div
                  className={`px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm leading-relaxed border-t transition-colors ${
                    isLight
                      ? 'text-slate-600 border-slate-100'
                      : 'text-zinc-400 border-zinc-800/60'
                  }`}
                >
                  <p className="pt-3">{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
