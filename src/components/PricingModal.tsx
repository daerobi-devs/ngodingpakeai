'use client';

import React, { useState } from 'react';
import {
  X,
  CheckCircle,
  QrCode,
  ShieldCheck,
  Loader2,
  Copy,
  Check,
  ArrowLeft,
  ArrowRight,
  Clock,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { DEFAULT_PRICING_TIERS, PricingTierConfig } from '@/lib/supabase/types';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth?: () => void;
}

function formatWhatsAppNumber(phone: string): string {
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    return '62' + cleaned.slice(1);
  }
  if (cleaned.startsWith('62')) {
    return cleaned;
  }
  return cleaned ? '62' + cleaned : '6285123607711';
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onOpenAuth }) => {
  const {
    user,
    profile,
    systemSettings,
    pendingOrder,
    refreshPendingOrder,
    cancelPendingOrder,
  } = useAuth();
  const [modalStep, setModalStep] = useState<'plan' | 'payment'>('plan');
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string>('');
  const [orderCode, setOrderCode] = useState('');
  const [cancellingOrder, setCancellingOrder] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [imgError, setImgError] = useState(false);

  const allTiers: PricingTierConfig[] =
    systemSettings?.pricing_tiers && systemSettings.pricing_tiers.length > 0
      ? systemSettings.pricing_tiers
      : DEFAULT_PRICING_TIERS;

  // Hanya tampilkan paket berbayar aktif di modal upgrade
  const tiers = allTiers.filter((t) => t.id !== 'free' && t.isActive !== false);

  const [selectedTierId, setSelectedTierId] = useState<string>(() => {
    const popular = tiers.find((t) => t.is_popular);
    return popular ? popular.id : tiers[0]?.id || 'pro';
  });

  const selectedTier =
    tiers.find((t) => t.id === selectedTierId) || tiers[0] || DEFAULT_PRICING_TIERS[2] || DEFAULT_PRICING_TIERS[1];

  if (!isOpen) return null;

  const gopayNumber = systemSettings?.qris_gopay_number || '0851-2360-7711';
  const merchantName = systemSettings?.qris_merchant_name || 'NGODINGPAKEPRD OFFICIAL';
  const qrisImg = systemSettings?.qris_image_url || '/qris-gopay-placeholder.png';

  // Order yang sedang aktif (baik yang tersimpan di context maupun baru saja dibuat)
  const activeOrder = pendingOrder || (orderCreated ? {
    id: createdOrderId,
    order_code: orderCode,
    amount: selectedTier.price_rp,
    amount_formatted: selectedTier.price_formatted,
    admin_notes: `Tier: ${selectedTier.id.toUpperCase()}`,
    tier_id: selectedTier.id,
    user_email: user?.email,
    user_id: user?.id || '',
    payment_method: 'QRIS GoPay Instant',
    status: 'pending' as const,
  } : null);

  const activeTierName = (() => {
    if (!activeOrder) return selectedTier.name;
    const note = activeOrder.admin_notes || '';
    if (note.toLowerCase().includes('plus')) return 'Paket PLUS (Hemat)';
    if (note.toLowerCase().includes('pro')) return 'Paket PRO (Lengkap)';
    const foundTier = allTiers.find((t) => t.id === activeOrder.tier_id);
    return foundTier ? foundTier.name : selectedTier.name;
  })();

  const activeAmount = activeOrder?.amount_formatted || selectedTier.price_formatted;
  const activeCode = activeOrder?.order_code || orderCode;
  const activeEmail = user?.email || profile?.email || '';

  const waNumber = formatWhatsAppNumber(gopayNumber);
  const waMessage = `Halo Admin ngodingpakeprd,

Saya ingin konfirmasi pembayaran untuk pesanan:
- Kode Pesanan: ${activeCode}
- Paket: ${activeTierName}
- Email Akun: ${activeEmail}
- Nominal: ${activeAmount}

Berikut saya lampirkan foto bukti transfer pembayarannya. Mohon bantuannya untuk diverifikasi agar akun saya segera aktif. Terima kasih.`;

  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;

  const handleClose = () => {
    setModalStep('plan');
    setOrderCreated(false);
    onClose();
  };

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
          amount: selectedTier.price_rp,
          amountFormatted: selectedTier.price_formatted,
          tierId: selectedTier.id,
          paymentMethod: 'QRIS GoPay Instant',
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setOrderCode(data.order.order_code);
        setCreatedOrderId(data.order.id);
        setOrderCreated(true);
        await refreshPendingOrder();
      }
    } catch (e) {
      console.error('Failed to create order:', e);
    } finally {
      setLoadingOrder(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!activeOrder?.id) {
      setOrderCreated(false);
      setModalStep('plan');
      return;
    }
    setCancellingOrder(true);
    try {
      await cancelPendingOrder(activeOrder.id);
      setOrderCreated(false);
      setModalStep('plan');
    } finally {
      setCancellingOrder(false);
    }
  };

  const handleCopyGopay = () => {
    navigator.clipboard.writeText(gopayNumber.replace(/[^0-9]/g, ''));
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-7 text-white shadow-2xl my-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer"
          title="Tutup"
        >
          <X className="h-5 w-5" />
        </button>

        {/* ============================================================ */}
        {/* STEP 3: Order Berhasil Dibuat / Menunggu Verifikasi          */}
        {/* ============================================================ */}
        {activeOrder ? (
          <div className="text-center py-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 mb-3 border border-amber-500/30">
              <Clock className="h-6 w-6 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-white">Pembayaran Sedang Diverifikasi</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Kode Pesanan: <strong className="text-amber-400 font-mono text-sm">{activeCode}</strong>
            </p>

            <div className="mt-3.5 p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-left text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span className="font-semibold text-amber-300">Status: Menunggu Verifikasi GoBiz</span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-semibold border border-zinc-700">
                  {activeTierName} • {activeAmount}
                </span>
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Admin akan mencocokkan mutasi masuk dari GoPay / GoBiz. Status pesanan ini tetap tersimpan di sidebar Anda, sehingga Anda dapat menutup jendela ini kapan saja tanpa khawatir kehilangan status pesanan.
              </p>
            </div>

            {/* WhatsApp Fast Confirmation Box */}
            <div className="mt-3.5 p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-left text-xs">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400 text-xs mb-1">
                <MessageCircle className="h-4 w-4" />
                <span>Ingin Aktivasi Lebih Cepat?</span>
              </div>
              <p className="text-zinc-300 text-[11px] leading-relaxed mb-3">
                Kirimkan bukti transfer langsung ke WhatsApp Customer Support kami agar pesanan Anda diprioritaskan dan akun langsung aktif dalam 1–5 menit.
              </p>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-900/30 cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Konfirmasi Cepat via WhatsApp</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-80" />
              </a>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Tutup & Kembali ke Generator
              </button>

              <button
                type="button"
                disabled={cancellingOrder}
                onClick={handleCancelOrder}
                className="w-full py-1.5 text-zinc-500 hover:text-rose-400 text-[11px] font-medium transition-colors cursor-pointer"
              >
                {cancellingOrder ? 'Membatalkan pesanan...' : 'Batalkan pesanan ini & ganti paket'}
              </button>
            </div>
          </div>
        ) : modalStep === 'plan' ? (
          /* ============================================================ */
          /* STEP 1: Pilihan Paket & Keuntungan (No-Scroll Clean View)   */
          /* ============================================================ */
          <>
            <div className="text-center mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-2">
                <ShieldCheck className="h-3.5 w-3.5" />
                PILIHAN PAKET AKSES
              </span>
              <h3 className="text-2xl font-black tracking-tight text-white">
                Upgrade ke <span className="text-amber-400">ngodingpakeprd {selectedTier.name.replace('Paket ', '')}</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto leading-relaxed">
                Pilih paket sesuai kebutuhan eksplorasi arsitektur dan kuota generasi harian Anda.
              </p>
            </div>

            {/* Dynamic Tier Switcher Tabs */}
            {tiers.length > 1 && (
              <div className="grid grid-cols-2 gap-2 mb-3.5 p-1 rounded-xl bg-zinc-900/90 border border-zinc-800">
                {tiers.map((t) => {
                  const isSelected = t.id === selectedTier.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTierId(t.id)}
                      className={`relative flex flex-col items-center py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-zinc-950 shadow-md font-extrabold scale-[1.02]'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                      }`}
                    >
                      {t.badge && (
                        <span
                          className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full mb-1 tracking-wider ${
                            isSelected
                              ? 'bg-zinc-950 text-amber-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {t.badge}
                        </span>
                      )}
                      <span className="leading-tight">{t.name}</span>
                      <span className={`text-[10px] font-semibold mt-0.5 ${isSelected ? 'text-zinc-950' : 'text-zinc-400'}`}>
                        {t.price_formatted.split('/')[0].trim()}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Price Box */}
            <div className="rounded-xl border border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-transparent p-3.5 text-center mb-3.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-400/90">
                Investasi {selectedTier.name}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white mt-0.5 tracking-tight">
                {selectedTier.price_formatted}
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">
                {selectedTier.daily_limit > 0
                  ? `Batas kuota ${selectedTier.daily_limit} PRD/hari selama ${selectedTier.duration_days} hari`
                  : `Akses penuh ${selectedTier.duration_days} hari tanpa batas kuota`}
              </div>
            </div>

            {/* Benefits List */}
            <div className="space-y-2 mb-5 text-xs text-zinc-200 bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800/90 max-h-48 overflow-y-auto">
              {selectedTier.features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            {/* Primary Action Button (Right in Viewport, Highly Visible) */}
            {!user ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenAuth) onOpenAuth();
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold py-3 px-4 transition-all shadow-md active:scale-98 cursor-pointer"
              >
                <span>Login dengan Google untuk Lanjut</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setModalStep('payment')}
                className="group w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold py-3 px-4 transition-all shadow-md active:scale-98 cursor-pointer"
              >
                <span>Lanjut ke Pembayaran {selectedTier.name}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            )}

            <p className="text-[11px] text-zinc-400 text-center mt-3">
              Mendukung GoPay, BCA, Mandiri, OVO, Dana, ShopeePay via QRIS
            </p>
          </>
        ) : (
          /* ============================================================ */
          /* STEP 2: Layar Pembayaran QRIS (Setelah Klik Lanjut)         */
          /* ============================================================ */
          <>
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setModalStep('plan')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Kembali ke Pilihan Paket</span>
              </button>

              <span className="text-[11px] font-mono text-zinc-400">Langkah 2 dari 2</span>
            </div>

            <div className="text-center mb-4">
              <h3 className="text-xl font-black tracking-tight text-white">
                Scan QRIS untuk Pembayaran
              </h3>
              <div className="inline-flex items-center gap-2 mt-1.5 px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
                <span className="text-zinc-400">Total Tagihan ({selectedTier.name}):</span>
                <span className="font-extrabold text-amber-400">{selectedTier.price_formatted}</span>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center mb-4">
              <div className="flex flex-col items-center justify-center p-2.5 bg-white rounded-xl shadow-inner max-w-[200px] mx-auto">
                <div className="w-40 h-40 bg-white rounded-lg flex items-center justify-center border border-zinc-200 overflow-hidden p-1">
                  {qrisImg && !imgError ? (
                    <img
                      src={qrisImg}
                      alt="QRIS GoPay"
                      className="w-full h-full object-contain"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="text-zinc-800 text-center p-2 text-xs font-bold flex flex-col items-center justify-center">
                      <QrCode className="h-14 w-14 mx-auto text-zinc-800 mb-1" />
                      <span className="text-[10px]">{merchantName}</span>
                    </div>
                  )}
                </div>
                <span className="text-[9px] font-bold text-zinc-800 mt-1 uppercase tracking-wider font-mono">
                  NMID / QRIS GOPAY
                </span>
              </div>

              {/* Transfer manual fallback */}
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-zinc-400">
                <span>Atau Transfer GoPay:</span>
                <span className="font-mono font-bold text-white bg-zinc-900 px-2 py-0.5 rounded border border-zinc-700">
                  {gopayNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopyGopay}
                  className="text-amber-400 hover:text-amber-300 p-1 cursor-pointer"
                  title="Salin Nomor"
                >
                  {copiedNumber ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirmation Action Button */}
            <button
              type="button"
              disabled={loadingOrder}
              onClick={handleCreatePaymentOrder}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold py-3 px-4 transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
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

            <p className="text-[11px] text-zinc-400 text-center mt-2.5 leading-relaxed">
              Setelah klik tombol di atas, akun kamu akan diverifikasi dan diaktifkan otomatis dalam 1–5 menit.
            </p>
          </>
        )}
      </div>
    </div>
  );
};
