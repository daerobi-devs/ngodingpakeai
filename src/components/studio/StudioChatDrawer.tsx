'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Loader2,
  X,
  MessageSquare,
  FileEdit,
  Check,
  ArrowRight,
  Trash2,
  Bot,
  Mic,
  MicOff,
} from 'lucide-react';
import { useVoiceDictation } from '@/hooks/useVoiceDictation';

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

const PROACTIVE_SUGGESTIONS = [
  { text: 'Apa yang kurang di PRD ini? Berikan analisis arsitektur & rekomendasi konkret.', mode: 'chat' as const, label: 'Audit PRD' },
  { text: 'Ganti database ke PostgreSQL & tambahkan Docker Compose.', mode: 'revise' as const, label: 'Ganti DB' },
  { text: 'Tambahkan manajemen kupon promosi & sistem diskon dinamis.', mode: 'revise' as const, label: 'Tambah Kupon' },
  { text: 'Lengkapi fitur operasional back-office admin dan audit log.', mode: 'revise' as const, label: 'Fitur Admin' },
];

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
  const [voiceError, setVoiceError] = useState<string | null>(null);

  // Voice Dictation (Web Speech API) in Indonesian
  const { isListening, toggleListening, isSupported } = useVoiceDictation({
    lang: 'id-ID',
    onResult: (spokenText) => {
      setInputText(spokenText);
      setVoiceError(null);
    },
    onError: (errMsg) => {
      setVoiceError(errMsg);
      setTimeout(() => setVoiceError(null), 8000);
    },
  });

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

    // Deteksi cerdas: jika pengguna menuliskan instruksi aksi revisi nyata, alihkan ke mode revise
    const isObviousRevision = /\b(ubah|ganti|tambah|tambahkan|revisi|hapus|hilangkan|masukkan|gantikan|update|edit|buatkan|perbaiki|tolong|jadikan|switch|migrasi|replace|pakai|gunakan|bikin)\b/i.test(trimmed);
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
      aria-label="Workspace Agent"
      className={`fixed lg:sticky right-0 top-12 bottom-0 w-80 sm:w-96 shrink-0 border-l z-30 flex flex-col transition-all select-none ${
        isLight
          ? 'border-zinc-200 bg-white text-zinc-900 shadow-2xl'
          : 'border-zinc-800/80 bg-[#0d1117] text-zinc-100 shadow-2xl'
      }`}
      style={{ height: 'calc(100vh - 3rem)' }}
    >
      {/* Top Header: Workspace Agent branding matching Screenshot 4 */}
      <div className="p-3 border-b border-zinc-800/60 flex items-center justify-between shrink-0 bg-[#161b22]/70">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <Bot className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>Workspace Agent</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-[10px] text-zinc-400 font-mono truncate">Roadmap - Plan aktif</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Mode Switcher */}
          <div className="inline-flex rounded-lg border border-zinc-800 bg-[#0d1117] p-0.5 text-[10px]">
            <button
              type="button"
              onClick={() => setActiveMode('revise')}
              className={`px-2 py-0.5 rounded-md font-medium transition-all cursor-pointer ${
                activeMode === 'revise'
                  ? 'bg-[#ea580c] text-white font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Mode Revisi: Menerapkan instruksi langsung ke dokumen PRD & menaikkan versi"
            >
              Revisi
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('chat')}
              className={`px-2 py-0.5 rounded-md font-medium transition-all cursor-pointer ${
                activeMode === 'chat'
                  ? 'bg-[#ea580c] text-white font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Mode Diskusi: Konsultasi arsitektur tanpa mengubah dokumen"
            >
              Diskusi
            </button>
          </div>

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
            title="Tutup Panel Agent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mode Helper Sub-banner */}
      <div className="px-3 py-1.5 bg-[#121620] border-b border-zinc-800/50 flex items-center justify-between text-[10px] text-zinc-400">
        <span>
          {activeMode === 'chat'
            ? 'Diskusi Bebas: Konsultasi konsep tanpa merubah dokumen PRD.'
            : 'Revisi Terarah: Setiap instruksi akan menaikkan versi PRD (v1 -> v2 -> v3).'}
        </span>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs leading-relaxed">
        {messages.length === 0 ? (
          <div className="py-6 text-center text-zinc-500 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/20 shadow-md">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-300">Workspace Agent Siap Membantu</p>
              <p className="text-[11px] text-zinc-500 max-w-xs mx-auto mt-1 leading-relaxed">
                Ajak diskusi untuk menyempurnakan fitur atau berikan perintah revisi untuk langsung mengupdate dokumen PRD.
              </p>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="pt-2 text-left space-y-1.5 max-w-xs mx-auto">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold px-1">
                Saran Prompt Cepat:
              </p>
              <div className="flex flex-col gap-1.5">
                {PROACTIVE_SUGGESTIONS.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveMode(chip.mode);
                      onSendMessage(chip.text, chip.mode);
                    }}
                    disabled={isLoading}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#161b22] hover:bg-[#1f2937] border border-zinc-800 text-left transition-colors cursor-pointer group"
                  >
                    <div className="pr-2">
                      <span className="text-[11px] text-zinc-200 group-hover:text-white font-medium block">
                        {chip.label}
                      </span>
                      <span className="text-[10px] text-zinc-500 truncate block max-w-[200px]">
                        {chip.text}
                      </span>
                    </div>
                    <ArrowRight className="h-3 w-3 text-zinc-500 group-hover:text-amber-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            if (isUser) {
              return (
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-[90%] rounded-2xl px-3.5 py-2 bg-[#1f2937] text-zinc-100 text-xs shadow-sm">
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              );
            }

            // AI response
            return (
              <div key={msg.id} className="space-y-2 text-zinc-300">
                <div className="p-3 rounded-2xl bg-[#161b22]/90 border border-zinc-800/80 shadow-xs">
                  {msg.versionBump && (
                    <div className="mb-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      <span>Dokumen diperbarui ke Version {msg.versionBump}</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap leading-relaxed text-xs">{msg.text}</p>
                </div>

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
          <div className="space-y-1.5 p-3 rounded-2xl bg-[#161b22]/90 border border-zinc-800 text-xs text-zinc-300 animate-in fade-in">
            <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Selesai berpikir</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
              <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
              <span>
                {activeMode === 'chat'
                  ? 'Menyiapkan jawaban...'
                  : 'Memperbarui dokumen PRD & menyelaraskan arsitektur...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Dictation Error Banner */}
      {voiceError && (
        <div className="mx-3 mb-2 px-3 py-2 rounded-xl text-[11px] font-medium bg-[#161b22] text-zinc-300 border border-zinc-700/80 flex items-center justify-between gap-2 animate-in fade-in shadow-md">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
            <span className="leading-snug">{voiceError}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {(voiceError.toLowerCase().includes('muat ulang') || voiceError.toLowerCase().includes('f5')) && (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-2 py-0.5 rounded-md bg-amber-500 hover:bg-amber-400 text-zinc-950 text-[10px] font-bold cursor-pointer transition-colors"
              >
                Muat Ulang
              </button>
            )}
            <button
              type="button"
              onClick={() => setVoiceError(null)}
              className="text-zinc-400 hover:text-white text-xs px-1 cursor-pointer"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Voice Dictation Listening Banner */}
      {isListening && (
        <div className="px-3 py-1.5 bg-red-500/15 border-t border-red-500/30 flex items-center justify-between text-xs text-red-300 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
            <span>Mendengarkan suara kamu (Bahasa Indonesia)...</span>
          </div>
          <button
            type="button"
            onClick={() => toggleListening()}
            className="text-[10px] font-bold text-red-400 hover:underline cursor-pointer"
          >
            Selesai
          </button>
        </div>
      )}

      {/* Bottom Input Field with Voice Dictation Mic Button */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-zinc-800/80 bg-[#0d1117]">
        <div className="relative flex items-center rounded-xl border border-zinc-800 bg-[#161b22] px-3 py-2 focus-within:border-amber-500/60 transition-colors">
          <textarea
            ref={inputRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              activeMode === 'chat'
                ? 'Ajak diskusi arsitektur... (Enter)'
                : 'Instruksi revisi (cth: ganti SQLite jadi Postgres)... (Enter)'
            }
            disabled={isLoading}
            className="w-full resize-none bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none disabled:opacity-50"
          />

          {/* Voice Dictation Mic Button */}
          <button
            type="button"
            onClick={() => {
              setVoiceError(null);
              toggleListening(inputText);
            }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer mr-1 ${
              isListening
                ? 'bg-red-500/20 text-red-400 ring-2 ring-red-500/30 animate-pulse'
                : 'text-zinc-400 hover:text-amber-400 hover:bg-zinc-800'
            }`}
            title={isListening ? 'Hentikan rekaman suara' : 'Dikte lewat suara (Bahasa Indonesia)'}
          >
            {isListening ? <MicOff className="h-4 w-4 text-red-400" /> : <Mic className="h-4 w-4" />}
          </button>

          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-500/10 transition-colors disabled:opacity-20 cursor-pointer"
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
