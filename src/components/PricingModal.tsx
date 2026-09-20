'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  CheckCircle2,
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
  RefreshCw,
  AlertCircle,
  Sparkles,
  Zap,
  Crown,
  ChevronRight,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/AuthContext';
import { DEFAULT_PRICING_TIERS, PricingTierConfig, PaymentOrder } from '@/lib/supabase/types';

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

function formatSeconds(secs: number): string {
  if (secs <= 0) return '00:00';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onOpenAuth }) => {
  const {
    user,
    profile,
    systemSettings,
    pendingOrder,
    refreshPendingOrder,
    cancelPendingOrder,
    refreshProfile,
  } = useAuth();

  const [modalStep, setModalStep] = useState<'plan' | 'payment'>('plan');
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [createdOrderData, setCreatedOrderData] = useState<PaymentOrder | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60);

  const rawUserTier = (profile?.subscription_tier || 'free').toLowerCase().trim();
  const isCurrentlyPlus = rawUserTier === 'plus';

  const allTiers: PricingTierConfig[] =
    systemSettings?.pricing_tiers && systemSettings.pricing_tiers.length > 0
      ? systemSettings.pricing_tiers
      : DEFAULT_PRICING_TIERS;

  // Hanya tampilkan paket berbayar aktif di modal upgrade
  const tiers = allTiers.filter((t) => t.id !== 'free' && t.isActive !== false);

  const [selectedTierId, setSelectedTierId] = useState<string>(() => {
    if (isCurrentlyPlus) return 'pro';
    const popular = tiers.find((t) => t.is_popular);
    return popular ? popular.id : tiers[0]?.id || 'pro';
  });

  useEffect(() => {
    if (isCurrentlyPlus && selectedTierId !== 'pro') {
      setSelectedTierId('pro');
    }
  }, [isCurrentlyPlus, selectedTierId]);

  const selectedTier =
    tiers.find((t) => t.id === selectedTierId) || tiers[0] || DEFAULT_PRICING_TIERS[2] || DEFAULT_PRICING_TIERS[1];

  // Aktif order: prioritas createdOrderData di sesi ini, atau pendingOrder dari context
  const activeOrder = createdOrderData || pendingOrder;

  // Hitung timer expired
  useEffect(() => {
    if (!activeOrder?.expired_at) {
      setTimeLeft(15 * 60);
      return;
    }

    const expTime = new Date(activeOrder.expired_at).getTime();
    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((expTime - Date.now()) / 1000));
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeOrder?.expired_at]);

  // Real-time polling untuk mendeteksi pembayaran sukses otomatis via webhook
  useEffect(() => {
    if (!isOpen || !activeOrder?.id || isSuccess) return;

    let isMounted = true;
    const checkStatus = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`/api/orders?userId=${encodeURIComponent(user.id)}&t=${Date.now()}`);
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.orders)) {
          const current = data.orders.find((o: PaymentOrder) => o.id === activeOrder.id || o.order_code === activeOrder.order_code);
          if (current?.status === 'approved') {
            setIsSuccess(true);
            try {
              confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            } catch {}
            await refreshProfile();
            await refreshPendingOrder();
          }
        }
      } catch {
        // silent polling
      }
    };

    const interval = setInterval(checkStatus, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isOpen, activeOrder?.id, activeOrder?.order_code, isSuccess, user?.id, refreshProfile, refreshPendingOrder]);

  const gopayNumber = systemSettings?.qris_gopay_number || '0851-2360-7711';
  const merchantName = systemSettings?.qris_merchant_name || 'NGODINGPAKEPRD OFFICIAL';
  const qrisImg = systemSettings?.qris_image_url || '/qris-gopay-placeholder.png';

  const activeTierName = (() => {
    if (!activeOrder) return selectedTier.name;
    const note = activeOrder.admin_notes || '';
    if (note.toLowerCase().includes('plus')) return 'Paket PLUS (Hemat)';
    if (note.toLowerCase().includes('pro')) return 'Paket PRO (Lengkap)';
    const foundTier = allTiers.find((t) => t.id === activeOrder.tier_id);
    return foundTier ? foundTier.name : selectedTier.name;
  })();

  const activeAmount = activeOrder?.amount_formatted || selectedTier.price_formatted;
  const activeCode = activeOrder?.order_code || '';
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
    setCreatedOrderData(null);
    setIsSuccess(false);
    onClose();
  };

  const adminPaymentMode = systemSettings?.payment_gateway_mode || 'mpg_headless';
  const effectiveMode: 'headless' | 'hosted' | 'manual' =
    adminPaymentMode === 'manual_qris'
      ? 'manual'
      : adminPaymentMode === 'mpg_hosted'
        ? 'hosted'
        : 'headless';

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
          paymentMethod: effectiveMode === 'manual' ? 'Manual GoPay / WhatsApp' : 'QRIS Dinamis Mandiri',
          checkoutMode: effectiveMode,
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        // OPSI A: Hosted Checkout Redirect jika pengguna memilih mode hosted
        if (effectiveMode === 'hosted') {
          const redirectCheckoutUrl = data.checkoutUrl || data.checkout_url || data.order?.checkout_url;
          if (redirectCheckoutUrl) {
            window.location.href = redirectCheckoutUrl;
            return;
          }
        }

        // OPSI B (Headless Modal Pop-up) & OPSI C (Manual):
        // Tetap di website ini tanpa berpindah halaman
        setCreatedOrderData(data.order);
        setModalStep('payment');
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
      setCreatedOrderData(null);
      setModalStep('plan');
      return;
    }
    setCancellingOrder(true);
    try {
      await cancelPendingOrder(activeOrder.id);
      setCreatedOrderData(null);
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

  const handleCopyAmount = (num: number | string) => {
    navigator.clipboard.writeText(num.toString());
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleCopyPayload = (str: string) => {
    navigator.clipboard.writeText(str);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-zinc-800/90 bg-zinc-950 p-6 sm:p-7 text-white shadow-2xl my-auto max-h-[95vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-xl p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer z-10 border border-transparent hover:border-zinc-800"
          title="Tutup"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Step Breadcrumb Bar */}
        {!isSuccess && (
          <div className="flex items-center justify-center gap-2 mb-5 text-[11px] font-mono select-none">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${
                !activeOrder
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-400 font-bold'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-500'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span>1. PILIH PAKET</span>
            </div>
            <ChevronRight className="h-3 w-3 text-zinc-600" />
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${
                activeOrder
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-400 font-bold animate-pulse'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-500'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span>2. PEMBAYARAN QRIS</span>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW A: Pembayaran Sukses Otomatis                           */}
        {/* ============================================================ */}
        {isSuccess ? (
          <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-xl shadow-emerald-500/5">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <Sparkles className="h-3 w-3" />
                PEMBAYARAN TERVERIFIKASI
              </span>
              <h3 className="text-2xl font-black tracking-tight text-white">
                Selamat, Akun {activeTierName} Aktif
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Transaksi Anda telah dikonfirmasi oleh sistem gateway. Kuota generasi harian dan hak akses fitur premium kini aktif di akun Anda.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between text-zinc-400 border-b border-zinc-800/80 pb-1.5">
                <span>Kode Pesanan:</span>
                <span className="text-white font-bold">{activeCode}</span>
              </div>
              <div className="flex justify-between text-zinc-400 border-b border-zinc-800/80 pb-1.5">
                <span>Status Transaksi:</span>
                <span className="text-emerald-400 font-bold">LUNAS / ACTIVE</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Masa Aktif Paket:</span>
                <span className="text-white font-bold">+30 Hari Kalender</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 text-sm font-black transition-all shadow-md active:scale-98 cursor-pointer"
            >
              Mulai Gunakan Fitur Sekarang
            </button>
          </div>
        ) : activeOrder ? (
          /* ============================================================ */
          /* VIEW B: Pesanan Aktif (Dynamic MPG QRIS atau Manual GoBiz)   */
          /* ============================================================ */
          <div className="space-y-4 py-1">
            {/* Header Status */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>MENUNGGU PEMBAYARAN</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Scan QRIS untuk Aktivasi
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Kode Pesanan: <strong className="text-amber-400 font-mono text-sm">{activeCode}</strong>
              </p>
            </div>

            {/* Total Pembayaran Box */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-4 text-center space-y-1 relative">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Total Tagihan ({activeTierName})
              </div>

              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-2xl sm:text-3xl font-black text-white tracking-tight tabular-nums">
                  {activeOrder.amount_formatted}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyAmount(activeOrder.final_amount || activeOrder.amount)}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 transition-colors cursor-pointer"
                  title="Salin nominal transfer"
                >
                  {copiedAmount ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              {Boolean(activeOrder.unique_code && activeOrder.unique_code > 0) && (
                <p className="text-[11px] text-amber-400 font-semibold leading-tight mt-1">
                  Wajib transfer tepat hingga 3 digit terakhir (Kode Unik: {activeOrder.unique_code}) agar verifikasi otomatis berhasil.
                </p>
              )}
            </div>

            {activeOrder.checkout_url && (
              <a
                href={activeOrder.checkout_url}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-bold text-xs transition-all shadow-md active:scale-98"
              >
                <span>Buka Halaman Hosted Checkout MPG</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}

            {/* Dynamic QRIS Viewer (Headless) atau Fallback Manual */}
            {activeOrder.qr_string ? (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center space-y-3">
                <div className="flex items-center justify-between text-xs px-1 text-zinc-400">
                  <span className="font-mono text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    QRIS DINAMIS MANDIRI
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-300">
                    <Clock className="h-3.5 w-3.5 text-amber-400" />
                    <span>Sisa Waktu: <strong className={timeLeft < 180 ? 'text-rose-400' : 'text-zinc-200'}>{formatSeconds(timeLeft)}</strong></span>
                  </div>
                </div>

                {/* QR Code Container with Expired Overlay */}
                <div className="relative flex flex-col items-center justify-center p-3.5 rounded-xl border border-zinc-200 bg-white max-w-[240px] mx-auto shadow-inner">
                  <div className={timeLeft <= 0 ? 'blur-xs opacity-25' : ''}>
                    <QRCodeSVG
                      value={activeOrder.qr_string}
                      size={200}
                      level="M"
                      marginSize={1}
                      className="mx-auto"
                    />
                  </div>

                  {timeLeft <= 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-zinc-950/85 backdrop-blur-xs p-4 text-center space-y-2 z-10">
                      <AlertCircle className="h-7 w-7 text-rose-400 mx-auto" />
                      <p className="text-xs font-bold text-white">QRIS Kedaluwarsa</p>
                      <p className="text-[10px] text-zinc-400 leading-relaxed">
                        Masa berlaku 15 menit telah habis. Batalkan pesanan ini dan buat yang baru.
                      </p>
                    </div>
                  )}

                  <span className="text-[9px] font-black text-zinc-800 mt-1 uppercase tracking-wider font-mono">
                    ASPI EMVCO QRIS
                  </span>
                </div>

                {/* Micro instructions */}
                <div className="text-[11px] text-zinc-400 space-y-1">
                  <p>Mendukung BCA, Mandiri Livin, GoPay, OVO, ShopeePay, dan DANA</p>
                  <button
                    type="button"
                    onClick={() => handleCopyPayload(activeOrder.qr_string || '')}
                    className="text-[10px] text-zinc-500 hover:text-zinc-300 font-mono inline-flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedPayload ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedPayload ? 'Raw QRIS Tersalin' : 'Salin Raw QRIS Payload'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Fallback Manual GoBiz QRIS */
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
                <div className="flex flex-col items-center justify-center p-2.5 bg-white rounded-xl shadow-inner max-w-[200px] mx-auto border border-zinc-200">
                  <div className="w-40 h-40 bg-white rounded-lg flex items-center justify-center overflow-hidden p-1">
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
                    {copiedNumber ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Live Verification Status Box */}
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs flex items-center gap-2.5 text-zinc-300">
              <Loader2 className="h-4 w-4 text-amber-400 animate-spin shrink-0" />
              <div className="leading-snug">
                <p className="font-semibold text-white">Mendeteksi Pembayaran Otomatis...</p>
                <p className="text-[11px] text-zinc-400">
                  Sistem akan otomatis aktif begitu transfer Anda terkonfirmasi oleh listener kasir.
                </p>
              </div>
            </div>

            {/* WhatsApp Support Box (Fail-safe) */}
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-left text-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400 text-xs">
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>Butuh Bantuan Cepat?</span>
                </div>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-emerald-300 hover:text-emerald-200 font-bold underline underline-offset-2 cursor-pointer"
                >
                  <span>Chat Admin WA</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Tutup (Pesanan Tetap Tersimpan di Sidebar)
              </button>

              <button
                type="button"
                disabled={cancellingOrder}
                onClick={handleCancelOrder}
                className="w-full py-1 text-zinc-500 hover:text-rose-400 text-[11px] font-medium transition-colors cursor-pointer"
              >
                {cancellingOrder ? 'Membatalkan pesanan...' : 'Batalkan pesanan ini & ganti paket'}
              </button>
            </div>
          </div>
        ) : modalStep === 'plan' ? (
          /* ============================================================ */
          /* VIEW C: Pilihan Paket & Keuntungan                           */
          /* ============================================================ */
          <>
            <div className="text-center mb-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-2">
                <ShieldCheck className="h-3.5 w-3.5" />
                {isCurrentlyPlus ? 'UPGRADE KE PAKET PRO' : 'PILIHAN PAKET AKSES'}
              </span>
              <h3 className="text-2xl font-black tracking-tight text-white">
                {isCurrentlyPlus ? (
                  <>Tingkatkan Akses ke <span className="text-amber-400">Paket PRO</span></>
                ) : (
                  <>Upgrade ke <span className="text-amber-400">ngodingpakeprd {selectedTier.name.replace('Paket ', '')}</span></>
                )}
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto leading-relaxed">
                {isCurrentlyPlus
                  ? 'Buka kuota harian maksimal (50 PRD/hari) dan seluruh diagram arsitektur tingkat lanjut.'
                  : 'Pilih paket sesuai kebutuhan eksplorasi arsitektur dan kuota generasi harian Anda.'}
              </p>
            </div>

            {/* Current Tier Status Callout if currently on PLUS */}
            {isCurrentlyPlus && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Zap className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Paket Aktif: PLUS (10 PRD/hari)</span>
                    <span className="text-[11px] text-zinc-400">Ingin kuota lebih besar? Pilih paket PRO di bawah ini.</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  AKTIF
                </span>
              </div>
            )}

            {/* Tier Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {tiers.map((t) => {
                const isSelected = t.id === selectedTier.id;
                const isTierPlus = t.id === 'plus';
                const isTierPro = t.id === 'pro';

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTierId(t.id)}
                    className={`relative rounded-xl p-3.5 border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? isTierPro
                          ? 'border-amber-500 bg-amber-950/20 shadow-lg shadow-amber-950/30 ring-1 ring-amber-500/50'
                          : 'border-emerald-500 bg-emerald-950/20 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/50'
                        : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70'
                    }`}
                  >
                    <div>
                      {/* Badge Row */}
                      <div className="flex items-center justify-between mb-2">
                        {isCurrentlyPlus && isTierPlus ? (
                          <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            PAKET ANDA SAAT INI
                          </span>
                        ) : isTierPro && isCurrentlyPlus ? (
                          <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            REKOMENDASI UPGRADE
                          </span>
                        ) : t.badge ? (
                          <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/25">
                            {t.badge}
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono uppercase text-zinc-500">PAKET STANDAR</span>
                        )}

                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? isTierPro
                                ? 'border-amber-500 bg-amber-500 text-zinc-950'
                                : 'border-emerald-500 bg-emerald-500 text-zinc-950'
                              : 'border-zinc-700 bg-zinc-900'
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                      </div>

                      {/* Title & Price */}
                      <div className="flex items-center gap-1.5">
                        {isTierPro ? (
                          <Crown className="h-4 w-4 text-amber-400" />
                        ) : (
                          <Zap className="h-4 w-4 text-emerald-400" />
                        )}
                        <h4 className="text-sm font-bold text-white">{t.name}</h4>
                      </div>

                      <div className="mt-2">
                        <div className="font-mono text-xl font-black text-white tracking-tight">
                          Rp {t.price_rp.toLocaleString('id-ID')}
                        </div>
                        <span className="text-[11px] text-zinc-400 block mt-0.5">
                          Akses {t.duration_days} hari kalender
                        </span>
                      </div>
                    </div>

                    {/* Quota Tag */}
                    <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400">Batas Kuota:</span>
                      <strong className="font-mono text-amber-400 font-bold">
                        {t.daily_limit > 0 ? `${t.daily_limit} PRD / hari` : 'Unlimited'}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price Box Summary */}
            <div className="rounded-xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 to-transparent p-3.5 text-center mb-3.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-400/90">
                Pilihan Paket: {selectedTier.name}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white mt-0.5 tracking-tight font-mono">
                {selectedTier.price_formatted}
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">
                {selectedTier.daily_limit > 0
                  ? `Kuota harian ${selectedTier.daily_limit} PRD/hari selama ${selectedTier.duration_days} hari masa aktif`
                  : `Akses penuh selama ${selectedTier.duration_days} hari`}
              </div>
            </div>

            {/* Benefits List */}
            <div className="space-y-2 mb-4 text-xs text-zinc-200 bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800/90 max-h-44 overflow-y-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Fitur & Hak Akses Paket Ini:
              </span>
              {selectedTier.features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{feat}</span>
                </div>
              ))}
            </div>

            {/* Primary Action Button */}
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
                disabled={loadingOrder}
                onClick={handleCreatePaymentOrder}
                className="group w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-extrabold py-3 px-4 transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {loadingOrder ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>
                      {effectiveMode === 'hosted'
                        ? 'Lanjut ke Pembayaran'
                        : effectiveMode === 'manual'
                          ? 'Lanjut ke Pembayaran QRIS / Manual'
                          : 'Bayar Sekarang dengan QRIS'}
                    </span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            )}

            <p className="text-[11px] text-zinc-400 text-center mt-3">
              Mendukung BCA, Mandiri Livin, GoPay, OVO, DANA, dan ShopeePay via QRIS Dinamis
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
};
