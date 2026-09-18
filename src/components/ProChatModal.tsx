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
} from 'lucide-react';
import { PRDFormData } from '@/types/prd';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ProChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToForm: (data: Partial<PRDFormData>) => void;
  isPro: boolean;
  onUpgradePro?: () => void;
}

const PRESET_TOPICS = [
  'Arsitektur Multi-tenant SaaS dengan Row Level Security',
  'Alur Pembayaran QRIS & Webhook Idempotency',
  'Skalabilitas High-load & Strategi Caching Redis',
  'Pilihan Tech Stack MVP: Next.js vs Laravel vs Go',
];

export default function ProChatModal({
  isOpen,
  onClose,
  onApplyToForm,
  isPro,
  onUpgradePro,
}: ProChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Halo! Saya Principal AI Software Architect & Co-Founder pendamping Anda. Ceritakan ide aplikasi, target pengguna, atau dilema arsitektur teknis yang ingin Anda bedah. Setelah diskusi matang, kita bisa langsung mentransfer seluruh keputusan ini ke formulir PRD dengan 1 klik!',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
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
        headers: { 'Content-Type': 'application/json' },
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

    try {
      const res = await fetch('/api/pro-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengekstrak hasil diskusi.';
      setErrorMsg(msg);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl h-[90vh] max-h-[780px] rounded-2xl border border-amber-500/30 bg-zinc-950 flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-900/60 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Crown className="w-5 h-5 text-zinc-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  PRO AI Architect Brainstorming
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  EXCLUSIVE PRO
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Diskusi strategis arsitektur, trade-offs, dan stack sebelum menyusun PRD.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isPro && messages.length > 1 && (
              <button
                type="button"
                onClick={handleExtractToForm}
                disabled={isExtracting}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {isExtracting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5 fill-current" />
                )}
                <span>Terapkan ke Form PRD</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRO Lock Banner if User is Not Pro */}
        {!isPro && (
          <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs text-amber-200">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Ruang Diskusi Interaktif ini merupakan keistimewaan khusus pengguna <strong>PRO</strong>.
              </span>
            </div>
            {onUpgradePro && (
              <button
                type="button"
                onClick={onUpgradePro}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md transition-colors"
              >
                Upgrade ke PRO Sekarang
              </button>
            )}
          </div>
        )}

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m) => {
            const isAI = m.role === 'assistant';
            return (
              <div
                key={m.id}
                className={`flex gap-3 max-w-[85%] ${
                  isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    isAI
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div className="space-y-1">
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      isAI
                        ? 'bg-zinc-900 border border-zinc-800/80 text-zinc-200'
                        : 'bg-amber-500 text-zinc-950 font-medium shadow-md'
                    }`}
                  >
                    {m.content}
                  </div>
                  <span
                    className={`text-[10px] text-zinc-500 block ${
                      isAI ? 'text-left' : 'text-right'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isSending && (
            <div className="flex gap-3 max-w-[85%] mr-auto">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800/80 text-zinc-400 text-xs flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>Principal Architect sedang merancang jawaban...</span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              {errorMsg}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 border-t border-zinc-900 bg-zinc-950/60 overflow-x-auto flex items-center gap-2 text-xs">
            <span className="text-zinc-500 text-[11px] whitespace-nowrap">Rekomendasi Topik:</span>
            {PRESET_TOPICS.map((topic, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(topic)}
                disabled={isSending}
                className="px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:border-amber-500/40 text-zinc-300 hover:text-white text-[11px] whitespace-nowrap transition-colors"
              >
                {topic}
              </button>
            ))}
          </div>
        )}

        {/* Bottom Input Area */}
        <div className="p-3 sm:p-4 border-t border-zinc-800 bg-zinc-900/80 space-y-2">
          {/* Mobile Extract Button */}
          {isPro && messages.length > 1 && (
            <button
              type="button"
              onClick={handleExtractToForm}
              disabled={isExtracting}
              className="sm:hidden w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 text-xs font-bold transition-all shadow-md active:scale-98 disabled:opacity-50"
            >
              {isExtracting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5 fill-current" />
              )}
              <span>🚀 Terapkan Hasil Diskusi ke Form PRD</span>
            </button>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tulis ide atau pertanyaan arsitektur Anda di sini..."
              disabled={isSending}
              className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-all active:scale-95 disabled:opacity-40 disabled:hover:bg-amber-500"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
