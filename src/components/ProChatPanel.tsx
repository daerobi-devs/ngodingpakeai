'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Crown,
  Bot,
  User,
  ArrowRight,
  RefreshCw,
  Zap,
  CheckCircle2,
  Lock,
  Loader2,
  Minimize2,
  Layers,
} from 'lucide-react';
import { PRDFormData } from '@/types/prd';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ProChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToForm: (data: Partial<PRDFormData>) => void;
  isPro: boolean;
  onUpgradePro?: () => void;
  activeModel?: string;
  userApiKeyHeader?: string;
}

const PRESET_TOPICS = [
  'Arsitektur Multi-tenant SaaS & Row Level Security',
  'Alur Pembayaran QRIS & Webhook Idempotency',
  'Fitur MVP: Booking Lapangan & Slot Lock 10m',
  'Sistem PPDB Sekolah & Formulir Verifikasi Berkas',
];

export const ProChatPanel: React.FC<ProChatPanelProps> = ({
  isOpen,
  onClose,
  onApplyToForm,
  isPro,
  onUpgradePro,
  activeModel,
  userApiKeyHeader,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Halo! Saya Principal AI Software Architect & Co-Founder pendamping Anda. Ceritakan ide aplikasi, kendala alur, atau tanyakan pilihan tech stack. Setelah obrolan matang, klik "Terapkan ke Form PRD" untuk langsung mengisi dokumen secara otomatis!',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isSending) return;

    setErrorMsg(null);
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setIsSending(true);

    try {
      const res = await fetch('/api/pro-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': userApiKeyHeader || '',
          'x-gemini-preferred-model': activeModel || '',
        },
        body: JSON.stringify({
          action: 'chat',
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menerima respon dari AI Architect');
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan komunikasi.';
      setErrorMsg(msg);
    } finally {
      setIsSending(false);
    }
  };

  const handleExtractToForm = async () => {
    if (messages.length <= 1 || isExtracting) return;

    setIsExtracting(true);
    setErrorMsg(null);
    setApplySuccess(false);

    try {
      const res = await fetch('/api/pro-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': userApiKeyHeader || '',
          'x-gemini-preferred-model': activeModel || '',
        },
        body: JSON.stringify({
          action: 'extract_to_form',
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal mengekstrak formulir PRD');
      }

      onApplyToForm(data.data);
      setApplySuccess(true);
      setTimeout(() => setApplySuccess(false), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengekstrak hasil diskusi.';
      setErrorMsg(msg);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <aside className="w-80 sm:w-96 shrink-0 border-l border-zinc-800/80 bg-[#0c0c0e] flex flex-col h-full z-20 select-none shadow-2xl transition-all duration-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800/70 bg-zinc-950/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/20 text-zinc-950">
            <Crown className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-tight">
                AI Architect Room
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">
              Brainstorming & Evaluasi Arsitektur
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
          title="Tutup Panel Chat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Extract Banner CTA */}
      <div className="p-2.5 bg-zinc-950/60 border-b border-zinc-800/50">
        <button
          type="button"
          onClick={handleExtractToForm}
          disabled={messages.length <= 1 || isExtracting}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 py-2 px-3 text-xs font-bold text-amber-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
        >
          {isExtracting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
              <span>Menyusun ke Form...</span>
            </>
          ) : applySuccess ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-300">Tersusun ke Form Kiri!</span>
            </>
          ) : (
            <>
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Terapkan Hasil ke Form PRD</span>
            </>
          )}
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-3.5 w-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-amber-500 text-zinc-950 font-medium rounded-tr-xs shadow-xs'
                    : 'bg-zinc-900 border border-zinc-800/80 text-zinc-200 rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>
                <div
                  className={`text-[9px] mt-1 font-mono ${
                    isUser ? 'text-zinc-900/70 text-right' : 'text-zinc-400 text-left'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>

              {isUser && (
                <div className="w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-center gap-2 text-xs text-zinc-400 italic">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
            <span>AI Architect sedang berpikir...</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-950/20 text-xs text-rose-300">
            {errorMsg}
          </div>
        )}

        {/* Preset Topic Starters if only welcome message */}
        {messages.length === 1 && (
          <div className="pt-2 space-y-1.5">
            <span className="text-[10px] text-zinc-400 font-semibold block">
              Topik Diskusi Populer:
            </span>
            <div className="space-y-1">
              {PRESET_TOPICS.map((topic, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(topic)}
                  className="w-full text-left p-2 rounded-lg border border-zinc-800/80 bg-zinc-950/60 hover:bg-zinc-900 hover:border-zinc-700 text-[11px] text-zinc-300 hover:text-white transition-all flex items-center justify-between group"
                >
                  <span className="line-clamp-1">{topic}</span>
                  <ArrowRight className="h-3 w-3 text-zinc-400 group-hover:text-amber-400 shrink-0 ml-1 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Area */}
      <div className="p-3 border-t border-zinc-800/80 bg-zinc-950">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative"
        >
          <textarea
            rows={2}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Tanyakan arsitektur atau diskusikan ide produk..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-3 pr-10 py-2 text-xs text-zinc-100 placeholder-zinc-400 focus:border-amber-500/50 focus:outline-none resize-none transition-colors"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="absolute right-2 bottom-3 p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
        <p className="text-[10px] text-zinc-400 mt-1.5 flex justify-between">
          <span>Enter untuk kirim, Shift+Enter untuk baris baru</span>
          <span className="font-mono text-zinc-400">{activeModel?.replace('gemini-', '') || 'AI'}</span>
        </p>
      </div>
    </aside>
  );
};
