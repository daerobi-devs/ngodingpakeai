'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, X, MessageSquare, FileEdit, Sparkles, Check, ArrowRight, Trash2 } from 'lucide-react';

export interface StudioChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  mode?: 'chat' | 'revise';
  versionBump?: number;
}

interface StudioChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: StudioChatMessage[];
  onSendMessage: (instruction: string, mode: 'chat' | 'revise') => Promise<void>;
  onClearChat?: () => void;
  isLoading: boolean;
  theme?: 'dark' | 'light';
}

export const StudioChatDrawer: React.FC<StudioChatDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  onClearChat,
  isLoading,
  theme = 'dark',
}) => {
  const [inputText, setInputText] = useState('');
  const [activeMode, setActiveMode] = useState<'chat' | 'revise'>('revise');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isLight = theme === 'light';

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isLoading) return;
    setInputText('');

    // Deteksi cerdas: jika pengguna di mode chat tapi menuliskan instruksi aksi revisi nyata, alihkan ke mode revise
    const isObviousRevision = /^(ubah|ganti|tambah|tambahkan|revisi|hapus|hilangkan|masukkan|gantikan|update|edit|buatkan|perbaiki|tolong ubah|tolong ganti|tolong tambah|tolong revisi)\b/i.test(trimmed);
    const targetMode = activeMode === 'chat' && isObviousRevision ? 'revise' : activeMode;

    await onSendMessage(trimmed, targetMode);
  };

  const handleApplySuggestion = async (suggestionText: string) => {
    setActiveMode('revise');
    await onSendMessage(`Terapkan saran arsitektur berikut ke dalam dokumen PRD:\n${suggestionText}`, 'revise');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <aside
      aria-label="AI Co-Pilot Assistant"
      className={`fixed lg:sticky right-0 top-12 bottom-0 w-80 sm:w-96 shrink-0 border-l z-30 flex flex-col transition-all select-none ${
        isLight
          ? 'border-zinc-200 bg-white text-zinc-900 shadow-2xl'
          : 'border-zinc-800/80 bg-[#0d1117] text-zinc-100 shadow-2xl'
      }`}
      style={{ height: 'calc(100vh - 3rem)' }}
    >
      {/* Top Header with Mode Switcher */}
      <div className="h-12 px-3 border-b border-zinc-800/60 flex items-center justify-between shrink-0 bg-[#161b22]/50">
        {/* Mode Segmented Controls */}
        <div className="inline-flex rounded-lg border border-zinc-800 bg-[#0d1117] p-0.5 text-[11px]">
          <button
            type="button"
            onClick={() => setActiveMode('revise')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
              activeMode === 'revise'
                ? 'bg-[#ea580c] text-white font-semibold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Mode Revisi: Menerapkan instruksi langsung ke dokumen PRD & menaikkan versi"
          >
            <FileEdit className="h-3 w-3" />
            <span>Revisi PRD</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('chat')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
              activeMode === 'chat'
                ? 'bg-[#ea580c] text-white font-semibold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Mode Diskusi: Konsultasi arsitektur tanpa mengubah isi dokumen PRD"
          >
            <MessageSquare className="h-3 w-3" />
            <span>Diskusi</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          {messages.length > 0 && onClearChat && (
            <button
              type="button"
              onClick={() => {
                if (confirm('Bersihkan riwayat percakapan di room ini?')) {
                  onClearChat();
                }
              }}
              className="p-1 rounded text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
              title="Bersihkan Riwayat Chat"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-zinc-500 hover:text-white transition-colors cursor-pointer"
            title="Tutup Chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mode Helper Badge */}
      <div className="px-3 py-1.5 bg-[#161b22]/70 border-b border-zinc-800/50 flex items-center justify-between text-[10px] text-zinc-400">
        <span>
          {activeMode === 'chat'
            ? 'Mode Diskusi Aktif: Bebas ngobrol, dokumen PRD tidak akan diubah.'
            : 'Mode Revisi Aktif: Setiap instruksi akan memperbarui dokumen PRD.'}
        </span>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs leading-relaxed">
        {messages.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 space-y-2.5">
            <div className="w-10 h-10 rounded-full bg-[#ea580c]/10 text-[#ea580c] mx-auto flex items-center justify-center border border-[#ea580c]/20">
              <MessageSquare className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-zinc-300">Ruang Diskusi & Revisi AI</p>
            <p className="text-[11px] text-zinc-500 max-w-xs mx-auto leading-relaxed">
              Pilih tab <strong>Diskusi</strong> untuk tanya jawab arsitektur tanpa mengubah isi dokumen, atau pilih <strong>Revisi PRD</strong> untuk langsung memodifikasi spesifikasi.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            if (isUser) {
              return (
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-[90%] rounded-xl px-3.5 py-2 bg-[#1f2937] text-zinc-100 text-xs shadow-sm">
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              );
            }

            // AI response: Clean flowing text with optional "Terapkan ke PRD" button if in chat mode
            return (
              <div key={msg.id} className="space-y-2 text-zinc-300">
                <div className="p-3 rounded-xl bg-[#161b22]/80 border border-zinc-800/80">
                  <p className="whitespace-pre-wrap leading-relaxed text-xs">{msg.text}</p>
                </div>

                {/* If message was from discussion mode, allow user to apply suggestions with 1 click */}
                {msg.mode === 'chat' && (
                  <button
                    type="button"
                    onClick={() => handleApplySuggestion(msg.text)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#ea580c]/15 hover:bg-[#ea580c]/25 border border-[#ea580c]/30 text-[#ea580c] text-[10px] font-semibold transition-all cursor-pointer"
                    title="Terapkan saran arsitektur ini ke dokumen PRD"
                  >
                    <span>Terapkan ke Dokumen PRD</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-[#ea580c] bg-[#ea580c]/10 p-2.5 rounded-lg border border-[#ea580c]/20">
            <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
            <span>
              {activeMode === 'chat'
                ? 'AI sedang memikirkan respon arsitektur...'
                : 'AI sedang merevisi dokumen & memperbarui versi...'}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Field */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-zinc-800/80 bg-[#0d1117]">
        <div className="relative flex items-center rounded-xl border border-zinc-800 bg-[#161b22] px-3 py-2 focus-within:border-[#ea580c]/60">
          <textarea
            ref={inputRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              activeMode === 'chat'
                ? 'Ajak diskusi arsitektur (tanya saran, konsep, dsb)... (Enter)'
                : 'Tulis instruksi revisi PRD (cth: tambahkan fitur checkout, ubah database)... (Enter)'
            }
            disabled={isLoading}
            className="w-full resize-none bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="p-1.5 rounded-lg text-[#ea580c] hover:bg-[#ea580c]/10 transition-colors disabled:opacity-20 cursor-pointer ml-1"
            title={activeMode === 'revise' ? 'Kirim Instruksi & Terapkan Revisi PRD' : 'Kirim Pesan Diskusi'}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </form>
    </aside>
  );
};
