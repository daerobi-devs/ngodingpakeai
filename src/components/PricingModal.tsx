'use client';

import React, { useState } from 'react';
import { X, CheckCircle, QrCode, ShieldCheck, Loader2, Copy, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth?: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onOpenAuth }) => {
  const { user, profile, systemSettings } = useAuth();
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderCode, setOrderCode] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!isOpen) return null;

  const proPriceFormatted = systemSettings?.pro_price_formatted || (systemSettings?.pro_price_rp ? `Rp ${systemSettings.pro_price_rp.toLocaleString('id-ID')} / Sekali Bayar (Lifetime)` : 'Rp 49.000 / Sekali Bayar (Lifetime)');
  const gopayNumber = systemSettings?.qris_gopay_number || '0821-4475-4089';
  const merchantName = systemSettings?.qris_merchant_name || 'NGODINGPAKEPRD OFFICIAL';
  const qrisImg = systemSettings?.qris_image_url || '/qris-gopay-placeholder.png';

  const handleCreatePaymentOrder = async () => {
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      return;
    }

    try {
      setLoadingOrder(true);
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          userName: profile?.full_name || user.email?.split('@')[0],
          amount: systemSettings?.pro_price_rp || 49000,
          amountFormatted: proPriceFormatted,
          paymentMethod: 'QRIS GoPay Instant',
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setOrderCode(data.order.order_code);
        setOrderCreated(true);
      }
    } catch (e) {
      console.error('Failed to create order:', e);
    } finally {
      setLoadingOrder(false);
    }
  };

  const handleCopyGopay = () => {
    navigator.clipboard.writeText(gopayNumber.replace(/[^0-9]/g, ''));
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-7 text-white shadow-2xl my-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {!orderCreated ? (
          <>
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-2">
                <ShieldCheck className="h-3.5 w-3.5" />
                AKSES SPESIAL LIFETIME PRO
              </span>
              <h3 className="text-2xl font-black tracking-tight text-white">
                Upgrade ke <span className="text-amber-400">ngodingpakeprd PRO</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Generate PRD tanpa batas dengan AI Engine premium tanpa perlu API Key sendiri.
              </p>
            </div>

            <div className="space-y-2 mb-6 text-xs text-zinc-300 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-amber-400 shrink-0" />
                <span><strong>Unlimited PRD Generation</strong> selamanya tanpa batas quota</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-amber-400 shrink-0" />
                <span><strong>5 Arsitektur Diagram</strong> Mermaid & Mindmap visual lengkap</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-amber-400 shrink-0" />
                <span><strong>Export Format Lengkap</strong>: Markdown, JSON, ZIP Proyek</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-amber-400 shrink-0" />
                <span><strong>Section AI Clarifier & Assistant</strong> untuk menyempurnakan PRD</span>
              </div>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-center mb-6">
              <div className="text-xs font-semibold text-zinc-400">Total Investasi Lifetime:</div>
              <div className="text-2xl font-black text-amber-400 mt-0.5">{proPriceFormatted}</div>
              <div className="text-[11px] text-zinc-400 mt-1">Scan via GoPay, BCA, Mandiri, OVO, Dana, ShopeePay</div>

              <div className="mt-4 flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-inner max-w-[220px] mx-auto">
                <div className="w-44 h-44 bg-white rounded-lg flex items-center justify-center border border-zinc-200 overflow-hidden p-1">
                  {qrisImg && !imgError ? (
                    <img
                      src={qrisImg}
                      alt="QRIS GoPay"
                      className="w-full h-full object-contain"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="text-zinc-800 text-center p-2 text-xs font-bold flex flex-col items-center justify-center">
                      <QrCode className="h-16 w-16 mx-auto text-zinc-800 mb-1" />
                      <span>{merchantName}</span>
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-bold text-zinc-800 mt-1.5 uppercase tracking-wider font-mono">NMID / QRIS GOPAY</span>
              </div>

              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-zinc-400">
                <span>Atau Transfer GoPay:</span>
                <span className="font-mono font-bold text-white bg-zinc-900 px-2 py-0.5 rounded border border-zinc-700">
                  {gopayNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopyGopay}
                  className="text-amber-400 hover:text-amber-300 p-1"
                  title="Salin Nomor"
                >
                  {copiedNumber ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {!user ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenAuth) onOpenAuth();
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold py-3 px-4 transition-all shadow-md active:scale-98"
              >
                <span>Login dengan Google untuk Melanjutkan</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={loadingOrder}
                onClick={handleCreatePaymentOrder}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold py-3 px-4 transition-all shadow-md active:scale-98 disabled:opacity-50"
              >
                {loadingOrder ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5" />
                    <span>Saya Sudah Selesai Bayar via QRIS</span>
                  </>
                )}
              </button>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mb-4 border border-emerald-500/30">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Pembayaran Sedang Diverifikasi!</h3>
            <p className="text-xs text-zinc-400 mt-2 max-w-sm mx-auto">
              Kode Pesanan: <strong className="text-amber-400 font-mono text-sm">{orderCode}</strong>
            </p>
            <div className="mt-4 p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 text-left text-xs text-zinc-300 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="font-semibold text-amber-300">Status: Menunggu Verifikasi GoBiz</span>
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Admin akan mencocokkan notifikasi masuk dari GoPay / GoBiz di HP dan mengaktifkan akun PRO kamu dalam 1–5 menit. Kamu tidak perlu upload bukti transfer.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                setOrderCreated(false);
              }}
              className="mt-6 w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-colors"
            >
              Tutup & Kembali ke Generator
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
