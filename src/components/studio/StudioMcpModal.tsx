'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Terminal, ShieldCheck, Server, MessageSquare, Bot, FileCode, CheckCircle2 } from 'lucide-react';

interface StudioMcpModalProps {
  isOpen: boolean;
  onClose: () => void;
  prdId: string;
  projectTitle: string;
  userToken?: string;
  theme?: 'dark' | 'light';
}

export const StudioMcpModal: React.FC<StudioMcpModalProps> = ({
  isOpen,
  onClose,
  prdId,
  projectTitle,
  userToken,
  theme = 'dark',
}) => {
  const [activeTab, setActiveTab] = useState<'prompt' | 'antigravity' | 'cursor' | 'claude'>('prompt');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  if (!isOpen) return null;

  const isLight = theme === 'light';
  const effectiveOrigin =
    typeof window !== 'undefined' ? window.location.origin : 'https://ngodingpakeprd.com';

  const mcpEndpointUrl = `${effectiveOrigin}/api/mcp?prdId=${encodeURIComponent(prdId)}${
    userToken ? `&token=${encodeURIComponent(userToken)}` : ''
  }`;

  // Antigravity MCP Config JSON
  const antigravityConfig = JSON.stringify(
    {
      mcpServers: {
        'ngodingpakeprd-studio': {
          url: mcpEndpointUrl,
          transport: 'streamable-http',
          headers: {
            'x-prd-id': prdId,
            ...(userToken ? { Authorization: `Bearer ${userToken}` } : {}),
          },
        },
      },
    },
    null,
    2
  );

  // Cursor MCP Config (.cursor/mcp.json)
  const cursorConfig = JSON.stringify(
    {
      mcpServers: {
        'ngodingpakeprd': {
          url: mcpEndpointUrl,
          headers: {
            'x-prd-id': prdId,
            ...(userToken ? { Authorization: `Bearer ${userToken}` } : {}),
          },
        },
      },
    },
    null,
    2
  );

  // Claude Code CLI command & claude.json
  const claudeCliCommand = `claude mcp add ngodingpakeprd --url "${mcpEndpointUrl}"`;
  const claudeConfig = JSON.stringify(
    {
      mcpServers: {
        'ngodingpakeprd': {
          type: 'http',
          url: mcpEndpointUrl,
        },
      },
    },
    null,
    2
  );

  // Universal Prompt with Complete Agent Cheat Sheet
  const universalPrompt = `Halo Agen AI, saya sedang mengerjakan proyek:
- Judul Proyek: "${projectTitle}"
- ID Proyek: ${prdId}
- Sumber Spesifikasi: ngodingpakeprd Studio MCP Server

Tolong hubungkan workspace koding Anda ke MCP Server proyek ini dengan detail berikut:

1. Endpoint MCP:
${mcpEndpointUrl}

2. Konfigurasi Client (Pilih sesuai editor Anda):
- Jika Anda Cursor: Buat/perbarui file .cursor/mcp.json dengan isi:
${cursorConfig}

- Jika Anda Antigravity: Tambahkan ke konfigurasi MCP Antigravity:
${antigravityConfig}

- Jika Anda Claude Code: Jalankan perintah terminal:
${claudeCliCommand}

3. Panduan & Aturan Eksekusi Agen:
- PENTING (Isolasi Proyek): Server MCP ini HANYA digunakan khusus untuk proyek "${projectTitle}" (ID: ${prdId}). Jangan menghubungkan atau mencampurkan konteks dengan proyek lain.
- Pelajari Dokumen: Panggil tool MCP 'get_prd_spec' untuk membaca arsitektur sistem, skema database ERD, alur antarmuka, dan persyaratan fitur lengkap.
- Ambil Tugas: Panggil tool MCP 'get_tasks' atau 'get_next_task' untuk melihat urutan pengerjaan fitur di papan Kanban.
- Alur Status Kanban:
  * Panggil 'update_task_status' ke 'in_progress' saat mulai mengerjakan suatu tugas.
  * Bangun antarmuka frontend menyeluruh terlebih dahulu (Frontend-First) dengan mock state sebelum integrasi backend/database.
  * Bersikaplah proaktif: lengkapi skema database relasional, foreign keys, indeks, dan validasi Zod/API meskipun tidak ditulis detail di PRD.
  * Setelah tugas selesai dikodekan dan diverifikasi bebas error, panggil 'update_task_status' ke 'done' beserta catatan implementasi.
- Kerjakan secara mandiri dan tuntas tanpa berhenti meminta konfirmasi untuk keputusan teknis rutin.`;

  // Antigravity Prompt
  const antigravityPrompt = `Halo Antigravity, tolong hubungkan workspace ini ke MCP Server untuk proyek "${projectTitle}":

Konfigurasi MCP Antigravity (simpan ke mcp_config.json):
${antigravityConfig}

Panduan Eksekusi Khusus:
1. Isolasi Proyek: Konfigurasi ini HANYA untuk proyek "${projectTitle}" (ID: ${prdId}). Jangan gunakan untuk workspace lain.
2. Panggil tool 'get_prd_spec' untuk membaca PRD dan arsitektur database lengkap.
3. Panggil 'get_next_task' untuk mengambil tugas berikutnya di papan Kanban.
4. Ubah status ke 'in_progress' saat mulai, dan ke 'done' setelah selesai diuji.
5. Utamakan frontend-first dan proaktif merancang skema database production-ready.`;

  // Cursor Prompt
  const cursorPrompt = `Halo Cursor, tolong buat atau perbarui file .cursor/mcp.json di workspace ini dengan konfigurasi berikut:

${cursorConfig}

Panduan Eksekusi Khusus:
1. Isolasi Proyek: Server MCP ini HANYA untuk proyek "${projectTitle}" (ID: ${prdId}). Jangan campur adukkan dengan proyek lain.
2. Panggil tool 'get_prd_spec' untuk membaca PRD dan arsitektur database lengkap.
3. Panggil 'get_next_task' untuk mengambil tugas berikutnya di papan Kanban.
4. Ubah status ke 'in_progress' saat mulai, dan ke 'done' setelah selesai diuji.
5. Utamakan frontend-first dan proaktif merancang skema database production-ready.`;

  // Claude Code Prompt
  const claudePrompt = `Halo Claude Code, tolong hubungkan sesi koding ini ke MCP Server proyek "${projectTitle}":

Jalankan perintah ini di terminal:
${claudeCliCommand}

Atau konfigurasi JSON:
${claudeConfig}

Panduan Eksekusi Khusus:
1. Isolasi Proyek: Server MCP ini HANYA untuk proyek "${projectTitle}" (ID: ${prdId}). Jangan campur adukkan dengan proyek lain.
2. Panggil tool 'get_prd_spec' untuk membaca PRD dan arsitektur database lengkap.
3. Panggil 'get_next_task' untuk mengambil tugas berikutnya di papan Kanban.
4. Ubah status ke 'in_progress' saat mulai, dan ke 'done' setelah selesai diuji.
5. Utamakan frontend-first dan proaktif merancang skema database production-ready.`;

  const handleCopy = (text: string, tabKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabKey);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
          isLight
            ? 'border-zinc-200 bg-white text-zinc-900'
            : 'border-zinc-800 bg-[#0d1117] text-zinc-100'
        }`}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#ea580c]/15 text-[#ea580c] border border-[#ea580c]/30">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Integrasi Model Context Protocol (MCP)</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Hubungkan PRD ini langsung ke agen AI lokal (Antigravity, Cursor, Claude Code).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Security & Multi-Tenant Guarantee Notice */}
        <div className="px-6 py-3 bg-[#161b22]/70 border-b border-zinc-800/60 flex items-start gap-2.5 text-xs text-zinc-300">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed text-[11px]">
            <strong className="text-white">Isolasi Keamanan Proyek Aktif:</strong> Konfigurasi di bawah telah dikunci khusus ke ID Proyek (<code className="text-[#ea580c] font-mono">{prdId}</code>) dan token sesi Anda. Agen AI tidak akan pernah membaca atau tertukar dengan PRD milik pengguna lain.
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 flex items-center gap-2 border-b border-zinc-800/60 text-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('prompt')}
            className={`pb-2.5 font-semibold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'prompt'
                ? 'border-[#ea580c] text-[#ea580c]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Bot className="h-3.5 w-3.5" />
            <span>Prompt Chat AI (Pemula)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('antigravity')}
            className={`pb-2.5 font-semibold transition-all border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'antigravity'
                ? 'border-[#ea580c] text-[#ea580c]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Antigravity
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cursor')}
            className={`pb-2.5 font-semibold transition-all border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'cursor'
                ? 'border-[#ea580c] text-[#ea580c]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Cursor (.cursor/mcp.json)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('claude')}
            className={`pb-2.5 font-semibold transition-all border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'claude'
                ? 'border-[#ea580c] text-[#ea580c]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Claude Code CLI
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* 1. Universal Prompt for AI Agent Chat */}
          {activeTab === 'prompt' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[#ea580c]/10 border border-[#ea580c]/30 text-zinc-300 space-y-1.5">
                <div className="flex items-center gap-2 text-white font-semibold text-xs">
                  <CheckCircle2 className="h-4 w-4 text-[#ea580c]" />
                  <span>Panduan Cepat Pemula (Langsung Tempel ke Chat AI)</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  Tidak perlu repot mengedit konfigurasi secara manual! Cukup salin contekan prompt di bawah, lalu tempelkan langsung ke ruang obrolan (chat) AI Anda di Cursor, Antigravity, Claude Code, atau Windsurf. Agen AI akan langsung memahami tugas, mengonfigurasi koneksi MCP ke proyek ini saja, dan mulai mengeksekusi fitur secara mandiri.
                </p>
              </div>

              <div className="relative">
                <pre className="p-3.5 rounded-xl bg-[#09090b] border border-zinc-800 font-mono text-[11px] text-zinc-200 overflow-x-auto max-h-72 whitespace-pre-wrap leading-relaxed">
                  {universalPrompt}
                </pre>
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCopy(universalPrompt, 'universal-prompt')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                  >
                    {copiedTab === 'universal-prompt' ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-white" />
                        <span>Prompt Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Salin Prompt Chat Agen AI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-zinc-500 italic">
                * Contekan ini telah menyertakan instruksi keamanan isolasi proyek agar agen AI tidak mencampuradukkan data proyek ini dengan proyek lainnya.
              </p>
            </div>
          )}

          {/* 2. Antigravity Config */}
          {activeTab === 'antigravity' && (
            <div className="space-y-3">
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                Tambahkan konfigurasi di bawah ke file pengaturan MCP Antigravity Anda (misal: <code className="text-zinc-200">mcp_config.json</code>).
              </p>
              <div className="relative">
                <pre className="p-3.5 rounded-xl bg-[#09090b] border border-zinc-800 font-mono text-[11px] text-zinc-200 overflow-x-auto">
                  {antigravityConfig}
                </pre>
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCopy(antigravityConfig, 'antigravity-json')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-semibold transition-all cursor-pointer"
                  >
                    {copiedTab === 'antigravity-json' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedTab === 'antigravity-json' ? 'Tersalin' : 'Salin JSON'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(antigravityPrompt, 'antigravity-prompt')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#ea580c]/20 hover:bg-[#ea580c]/30 text-[#ea580c] border border-[#ea580c]/40 text-[10px] font-semibold transition-all cursor-pointer"
                    title="Salin instruksi lengkap siap kirim ke Antigravity Chat"
                  >
                    {copiedTab === 'antigravity-prompt' ? <Check className="h-3 w-3 text-emerald-400" /> : <MessageSquare className="h-3 w-3" />}
                    <span>{copiedTab === 'antigravity-prompt' ? 'Prompt Tersalin' : 'Salin Prompt Chat'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. Cursor Config */}
          {activeTab === 'cursor' && (
            <div className="space-y-3">
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                Buat atau tambahkan ke file <code className="text-zinc-200">.cursor/mcp.json</code> di root proyek repo Anda:
              </p>
              <div className="relative">
                <pre className="p-3.5 rounded-xl bg-[#09090b] border border-zinc-800 font-mono text-[11px] text-zinc-200 overflow-x-auto">
                  {cursorConfig}
                </pre>
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCopy(cursorConfig, 'cursor-json')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-semibold transition-all cursor-pointer"
                  >
                    {copiedTab === 'cursor-json' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedTab === 'cursor-json' ? 'Tersalin' : 'Salin JSON'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(cursorPrompt, 'cursor-prompt')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#ea580c]/20 hover:bg-[#ea580c]/30 text-[#ea580c] border border-[#ea580c]/40 text-[10px] font-semibold transition-all cursor-pointer"
                    title="Salin instruksi lengkap siap kirim ke Cursor Composer"
                  >
                    {copiedTab === 'cursor-prompt' ? <Check className="h-3 w-3 text-emerald-400" /> : <MessageSquare className="h-3 w-3" />}
                    <span>{copiedTab === 'cursor-prompt' ? 'Prompt Tersalin' : 'Salin Prompt Chat'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. Claude Code Config */}
          {activeTab === 'claude' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-zinc-400 leading-relaxed text-[11px]">
                  Jalankan perintah ini di terminal proyek Anda untuk mendaftarkan MCP server ke Claude Code:
                </p>
                <button
                  type="button"
                  onClick={() => handleCopy(claudePrompt, 'claude-prompt')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#ea580c]/20 hover:bg-[#ea580c]/30 text-[#ea580c] border border-[#ea580c]/40 text-[10px] font-semibold transition-all cursor-pointer shrink-0"
                  title="Salin instruksi lengkap siap kirim ke Claude Code"
                >
                  {copiedTab === 'claude-prompt' ? <Check className="h-3 w-3 text-emerald-400" /> : <MessageSquare className="h-3 w-3" />}
                  <span>{copiedTab === 'claude-prompt' ? 'Prompt Tersalin' : 'Salin Prompt Chat'}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="p-3 rounded-xl bg-[#09090b] border border-zinc-800 font-mono text-[11px] text-orange-200 overflow-x-auto whitespace-pre-wrap">
                  {claudeCliCommand}
                </pre>
                <button
                  type="button"
                  onClick={() => handleCopy(claudeCliCommand, 'claude-cmd')}
                  className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-semibold transition-all cursor-pointer"
                >
                  {copiedTab === 'claude-cmd' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedTab === 'claude-cmd' ? 'Tersalin' : 'Salin Perintah'}</span>
                </button>
              </div>

              <div>
                <span className="text-[11px] text-zinc-400 block mb-1">Atau masukkan ke konfigurasi JSON Claude:</span>
                <div className="relative">
                  <pre className="p-3 rounded-xl bg-[#09090b] border border-zinc-800 font-mono text-[11px] text-zinc-200 overflow-x-auto">
                    {claudeConfig}
                  </pre>
                  <button
                    type="button"
                    onClick={() => handleCopy(claudeConfig, 'claude-json')}
                    className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-semibold transition-all cursor-pointer"
                  >
                    {copiedTab === 'claude-json' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedTab === 'claude-json' ? 'Tersalin' : 'Salin JSON'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Available Tools Info */}
          <div className="mt-4 pt-3 border-t border-zinc-800/60 text-[11px] text-zinc-400 space-y-1">
            <span className="font-semibold text-zinc-300 block">Daftar Tool yang Siap Dipanggil Agen:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
              <div className="p-2 rounded-lg bg-[#161b22] border border-zinc-800">
                <code className="text-[#ea580c] font-semibold">get_prd_spec</code>
                <p className="text-[10px] text-zinc-400 mt-0.5">Membaca teks PRD lengkap & arsitektur.</p>
              </div>
              <div className="p-2 rounded-lg bg-[#161b22] border border-zinc-800">
                <code className="text-[#ea580c] font-semibold">get_tasks</code>
                <p className="text-[10px] text-zinc-400 mt-0.5">Melihat daftar kartu tugas Kanban.</p>
              </div>
              <div className="p-2 rounded-lg bg-[#161b22] border border-zinc-800">
                <code className="text-[#ea580c] font-semibold">get_next_task</code>
                <p className="text-[10px] text-zinc-400 mt-0.5">Mengambil tugas berikutnya & prompt koding.</p>
              </div>
              <div className="p-2 rounded-lg bg-[#161b22] border border-zinc-800">
                <code className="text-[#ea580c] font-semibold">update_task_status</code>
                <p className="text-[10px] text-zinc-400 mt-0.5">Memindahkan status kartu ke Done / In Progress.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-800/80 bg-[#161b22]/40 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
