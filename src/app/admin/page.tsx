'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Users,
  CreditCard,
  Radio,
  Server,
  Key,
  CheckCircle,
  XCircle,
  RefreshCw,
  Zap,
  Lock,
  ArrowLeft,
  QrCode,
  Check,
  LayoutDashboard,
  Cpu,
  Sliders,
  Wallet,
  Activity,
  UserCheck,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  Trash2,
  Crop,
  ZoomIn,
  ZoomOut,
  Move,
  Scissors,
  Eye,
  EyeOff,
  Crown,
  CheckCircle2,
  Play,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { SystemSettings, Profile, PaymentOrder, GeminiKeySlot } from '@/lib/supabase/types';

const DEFAULT_10_SLOTS: GeminiKeySlot[] = Array.from({ length: 10 }, (_, i) => ({
  id: `slot_${i + 1}`,
  label: `Gemini Key Slot #${i + 1}`,
  key: '',
  isActive: i === 0,
  assignedUsers: `Cluster ${String.fromCharCode(65 + i)}`,
  status: 'untested',
}));

const POPULAR_GEMINI_FREE_MODELS = [
  { id: 'gemini-3.8-flash', label: 'gemini-3.8-flash (🚀 Generasi 3.8 - Coding & Reasoning Unggul)' },
  { id: 'gemini-3.5-flash', label: 'gemini-3.5-flash (⚡ Generasi 3.5 - Agentic & Satset)' },
  { id: 'gemini-3.5-flash-lite', label: 'gemini-3.5-flash-lite (🪶 Ultra Rendah Latensi & Hemat Kuota)' },
  { id: 'gemini-flash-latest', label: 'gemini-flash-latest (⚡ Auto Latest Flash Stable)' },
  { id: 'gemini-2.5-flash', label: 'gemini-2.5-flash (Stabil & Akurat LTS)' },
  { id: 'gemini-2.5-flash-lite', label: 'gemini-2.5-flash-lite (Ringan Generasi 2.5)' },
];

const POPULAR_GEMINI_PRO_MODELS = [
  { id: 'gemini-3.8-flash', label: 'gemini-3.8-flash (🚀 Generasi 3.8 Flagship Fast Reasoning)' },
  { id: 'gemini-3.5-flash', label: 'gemini-3.5-flash (⚡ Generasi 3.5 Agentic Pro)' },
  { id: 'gemini-2.5-pro', label: 'gemini-2.5-pro (Generasi 2.5 PRO Analitis Mendalam)' },
  { id: 'gemini-3.5-flash-lite', label: 'gemini-3.5-flash-lite (🪶 Ultra Low-Latency Flash)' },
  { id: 'gemini-2.5-flash', label: 'gemini-2.5-flash (Cepat & Kualitas Tinggi)' },
  { id: 'gemini-flash-latest', label: 'gemini-flash-latest (Satset Tanpa Jeda)' },
  { id: 'gemini-2.5-flash-lite', label: 'gemini-2.5-flash-lite (Lite Edition)' },
];

const POPULAR_OPENROUTER_MODELS = [
  { id: 'anthropic/claude-3.5-sonnet', label: 'anthropic/claude-3.5-sonnet (High Reasoning)' },
  { id: 'deepseek/deepseek-chat', label: 'deepseek/deepseek-chat (V3 Cerdas & Murah)' },
  { id: 'deepseek/deepseek-r1', label: 'deepseek/deepseek-r1 (Chain of Thought)' },
  { id: 'google/gemini-2.5-pro', label: 'google/gemini-2.5-pro' },
  { id: 'meta-llama/llama-3.3-70b-instruct', label: 'meta-llama/llama-3.3-70b-instruct' },
];

export default function AdminDashboard() {
  const { user, profile, isAdmin, isLoading: authLoading, refreshSettings } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'switchboard' | 'ai_engine' | 'orders' | 'users' | 'pricing'>('overview');

  const [passcode, setPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  const [settings, setSettings] = useState<SystemSettings>({
    id: 'default',
    auth_mode: 'hybrid',
    api_key_mode: 'server_managed',
    monetization_mode: 'freemium',
    ai_provider: 'gemini_direct',
    pro_ai_provider: 'nine_router',
    pro_model: 'deepseek-chat',
    free_ai_provider: 'gemini_direct',
    free_model: 'gemini-flash-latest',
    gemini_slots: DEFAULT_10_SLOTS,
    trial_limit: 1,
    nine_router_url: 'http://127.0.0.1:2080/v1/chat/completions',
    nine_router_key: '',
    nine_router_model: 'deepseek-chat',
    gemini_master_keys: '',
    openrouter_key: '',
    openrouter_model: 'anthropic/claude-3.5-sonnet',
    qris_merchant_name: 'NGODINGPAKEPRD OFFICIAL',
    qris_gopay_number: '0821-4475-4089',
    qris_image_url: '/qris-gopay-placeholder.png',
    pro_price_rp: 49000,
    pro_price_formatted: 'Rp 49.000 / Lifetime Access',
  });

  const [usersList, setUsersList] = useState<Profile[]>([]);
  const [ordersList, setOrdersList] = useState<PaymentOrder[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [testingAi, setTestingAi] = useState(false);
  const [testAiResult, setTestAiResult] = useState<{ success: boolean; message: string } | null>(null);

  // Gemini Multi-Key & 9Router States
  const [testingSlotId, setTestingSlotId] = useState<string | null>(null);
  const [testingAllSlots, setTestingAllSlots] = useState(false);
  const [detected9RouterModels, setDetected9RouterModels] = useState<string[]>([]);
  const [fetching9RouterModels, setFetching9RouterModels] = useState(false);
  const [showKeyMap, setShowKeyMap] = useState<Record<string, boolean>>({});

  // Live Monitoring Feed States
  const [monitoringData, setMonitoringData] = useState<{
    recentGenerations: any[];
    totalGenerations: number;
    activeUsersCount: number;
  } | null>(null);
  const [loadingMonitoring, setLoadingMonitoring] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // QRIS Crop Tool States
  const [isCroppingOpen, setIsCroppingOpen] = useState(false);
  const [rawUploadedImage, setRawUploadedImage] = useState<string | null>(null);
  const [cropScale, setCropScale] = useState(1);
  const [cropOffsetX, setCropOffsetX] = useState(0);
  const [cropOffsetY, setCropOffsetY] = useState(0);
  const cropCanvasRef = React.useRef<HTMLCanvasElement>(null);

  const handleQRISFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'File harus berupa gambar (PNG, JPG, JPEG, WEBP)');
      return;
    }

    if (file.size > 6 * 1024 * 1024) {
      showToast('error', 'Ukuran gambar maksimal 6MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setRawUploadedImage(base64);
      setCropScale(1);
      setCropOffsetX(0);
      setCropOffsetY(0);
      setIsCroppingOpen(true);
    };
    reader.readAsDataURL(file);
    // Reset file input so user can pick the same file again if needed
    e.target.value = '';
  };

  const handleApplyCrop = () => {
    if (!rawUploadedImage) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 500; // Output square size
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Fill white background for QRIS
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, size, size);

      // Draw image with scale and pan offset
      const baseRatio = Math.max(size / img.width, size / img.height);
      const drawWidth = img.width * baseRatio * cropScale;
      const drawHeight = img.height * baseRatio * cropScale;

      const drawX = (size - drawWidth) / 2 + (cropOffsetX * (size / 100));
      const drawY = (size - drawHeight) / 2 + (cropOffsetY * (size / 100));

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

      const croppedBase64 = canvas.toDataURL('image/png', 0.95);
      setSettings((prev) => ({ ...prev, qris_image_url: croppedBase64 }));
      setIsCroppingOpen(false);
      showToast('success', 'Gambar QRIS berhasil dipangkas! Klik "Simpan Perubahan" di atas.');
    };
    img.src = rawUploadedImage;
  };

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const ADMIN_EMAIL = 'buatintech@gmail.com';

  const getAdminHeaders = (extraHeaders: Record<string, string> = {}) => {
    const code = typeof window !== 'undefined' ? sessionStorage.getItem('admin_passcode') : null;
    return {
      ...(code ? { 'x-admin-passcode': code } : {}),
      ...extraHeaders,
    };
  };

  useEffect(() => {
    // If user is authenticated with the admin email, auto-check session
    if (user && user.email === ADMIN_EMAIL) {
      const savedPin = sessionStorage.getItem('admin_session_unlocked');
      if (savedPin === 'true') {
        setIsUnlocked(true);
      }
    } else if (user && user.email !== ADMIN_EMAIL) {
      // Non-admin email — clear any stale session
      sessionStorage.removeItem('admin_session_unlocked');
      sessionStorage.removeItem('admin_passcode');
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin?action=settings_raw', {
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings) {
          const loadedSlots =
            data.settings.gemini_slots && data.settings.gemini_slots.length > 0
              ? data.settings.gemini_slots
              : DEFAULT_10_SLOTS.map((slot, idx) => {
                  const legacyKeys = (data.settings.gemini_master_keys || '')
                    .split(',')
                    .map((k: string) => k.trim())
                    .filter(Boolean);
                  if (legacyKeys[idx]) {
                    return { ...slot, key: legacyKeys[idx], isActive: true };
                  }
                  return slot;
                });

          setSettings({
            ...data.settings,
            gemini_slots: loadedSlots,
            pro_ai_provider: data.settings.pro_ai_provider || 'nine_router',
            pro_model: data.settings.pro_model || 'deepseek-chat',
            free_ai_provider: data.settings.free_ai_provider || 'gemini_direct',
            free_model: data.settings.free_model || 'gemini-flash-latest',
          });
        }
      }
    } catch (e) {
      console.error('Failed to load raw settings:', e);
    }
  };

  const fetchMonitoring = async () => {
    try {
      setLoadingMonitoring(true);
      const res = await fetch('/api/admin?action=live_monitoring', {
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMonitoringData({
            recentGenerations: data.recentGenerations || [],
            totalGenerations: data.totalGenerations || 0,
            activeUsersCount: data.activeUsersCount || 0,
          });
        }
      }
    } catch (e) {
      console.error('Failed to load monitoring:', e);
    } finally {
      setLoadingMonitoring(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingData(true);
      const res = await fetch('/api/admin?action=users', {
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.users) {
          setUsersList(data.users);
        }
      }
    } catch (e) {
      console.error('Failed to load users:', e);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingData(true);
      const res = await fetch('/api/admin?action=orders', {
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.orders) {
          setOrdersList(data.orders);
        }
      }
    } catch (e) {
      console.error('Failed to load orders:', e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isUnlocked) {
      fetchSettings();
      fetchUsers();
      fetchOrders();
      fetchMonitoring();
    }
  }, [isUnlocked]);

  // Real-time live monitoring feed auto-polling every 10 seconds on overview tab
  useEffect(() => {
    if (isUnlocked && activeTab === 'overview') {
      fetchMonitoring();
      const pollTimer = setInterval(() => {
        fetchMonitoring();
      }, 10000);
      return () => clearInterval(pollTimer);
    }
  }, [isUnlocked, activeTab]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();

    // Step 1: Must be logged in
    if (!user) {
      showToast('error', 'Anda harus login dengan akun Google terlebih dahulu.');
      return;
    }

    // Step 2: Must be admin email
    if (user.email !== ADMIN_EMAIL) {
      showToast('error', 'Akun ini tidak memiliki akses admin.');
      return;
    }

    // Step 3: Verify passcode via server (not client-side)
    try {
      const res = await fetch('/api/admin?action=verify_passcode', {
        headers: { 'x-admin-passcode': passcode },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsUnlocked(true);
        sessionStorage.setItem('admin_session_unlocked', 'true');
        sessionStorage.setItem('admin_passcode', passcode);
      } else {
        showToast('error', 'Passcode Admin salah. Coba lagi.');
        setPasscode('');
      }
    } catch {
      showToast('error', 'Gagal memverifikasi passcode. Coba lagi.');
    }
  };

  // Extract all Gemini models detected across all active key slots
  const allDetectedGeminiModels = Array.from(
    new Set((settings.gemini_slots || []).flatMap((s) => s.models || []))
  );

  const getGeminiProModels = () => {
    const list = [...POPULAR_GEMINI_PRO_MODELS];
    for (const m of allDetectedGeminiModels) {
      if (!list.some((item) => item.id === m)) {
        list.push({ id: m, label: `${m} (dari slot aktif)` });
      }
    }
    return list;
  };

  const getGeminiFreeModels = () => {
    const list = [...POPULAR_GEMINI_FREE_MODELS];
    for (const m of allDetectedGeminiModels) {
      if (!list.some((item) => item.id === m)) {
        list.push({ id: m, label: `${m} (dari slot aktif)` });
      }
    }
    return list;
  };

  const handleFreeProviderChange = (provider: 'gemini_direct' | 'nine_router' | 'openrouter') => {
    let nextModel = settings.free_model;
    if (provider === 'gemini_direct') {
      nextModel = 'gemini-flash-latest';
    } else if (provider === 'nine_router') {
      nextModel = settings.nine_router_model || (detected9RouterModels[0] || 'deepseek-chat');
    } else if (provider === 'openrouter') {
      nextModel = settings.openrouter_model || 'anthropic/claude-3.5-sonnet';
    }
    setSettings((prev) => ({
      ...prev,
      free_ai_provider: provider,
      free_model: nextModel,
    }));
    showToast('success', `Provider Free disetel ke ${provider.toUpperCase()}, model default: ${nextModel}`);
  };

  const handleProProviderChange = (provider: 'gemini_direct' | 'nine_router' | 'openrouter') => {
    let nextModel = settings.pro_model;
    if (provider === 'gemini_direct') {
      nextModel = 'gemini-2.5-pro';
    } else if (provider === 'nine_router') {
      nextModel = settings.nine_router_model || (detected9RouterModels[0] || 'deepseek-chat');
    } else if (provider === 'openrouter') {
      nextModel = settings.openrouter_model || 'anthropic/claude-3.5-sonnet';
    }
    setSettings((prev) => ({
      ...prev,
      pro_ai_provider: provider,
      pro_model: nextModel,
    }));
    showToast('success', `Provider PRO disetel ke ${provider.toUpperCase()}, model otomatis: ${nextModel}`);
  };

  const handleTestGeminiSlot = async (slotId: string, apiKey: string) => {
    if (!apiKey || !apiKey.trim()) {
      showToast('error', 'Masukkan API Key untuk slot ini terlebih dahulu');
      return;
    }
    setTestingSlotId(slotId);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          action: 'test_gemini_slot',
          slotId,
          apiKey: apiKey.trim(),
        }),
      });
      const data = await res.json();
      setSettings((prev) => {
        const currentSlots = prev.gemini_slots || DEFAULT_10_SLOTS;
        const updated = currentSlots.map((s) => {
          if (s.id === slotId) {
            return {
              ...s,
              status: data.success ? ('online' as const) : ('offline' as const),
              latencyMs: data.latencyMs,
              models: data.models || [],
              lastChecked: data.lastChecked || new Date().toLocaleTimeString('id-ID'),
            };
          }
          return s;
        });
        return { ...prev, gemini_slots: updated };
      });
      if (data.success) {
        showToast('success', `Slot Online! Latency: ${data.latencyMs}ms (${data.models?.length || 0} model aktif)`);
      } else {
        showToast('error', `Slot Offline: ${data.error}`);
      }
    } catch {
      showToast('error', 'Gagal menguji koneksi key slot');
    } finally {
      setTestingSlotId(null);
    }
  };

  const handleTestAllSlots = async () => {
    const activeSlots = (settings.gemini_slots || DEFAULT_10_SLOTS).filter(
      (s) => s.isActive && s.key && s.key.trim()
    );
    if (activeSlots.length === 0) {
      showToast('error', 'Tidak ada slot aktif yang memiliki API Key untuk diuji');
      return;
    }
    setTestingAllSlots(true);
    for (const slot of activeSlots) {
      await handleTestGeminiSlot(slot.id, slot.key);
    }
    setTestingAllSlots(false);
    showToast('success', 'Pengujian semua slot aktif selesai!');
  };

  const handleFetch9RouterModels = async () => {
    setFetching9RouterModels(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          action: 'fetch_9router_models',
          endpointUrl: settings.nine_router_url,
          apiKey: settings.nine_router_key,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.models)) {
        setDetected9RouterModels(data.models);
        showToast('success', `Berhasil mendeteksi ${data.models.length} model combo di 9Router!`);
      }
    } catch {
      showToast('error', 'Gagal memuat model dari endpoint 9Router');
    } finally {
      setFetching9RouterModels(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true);
      const activeMasterKeys = (settings.gemini_slots || [])
        .filter((s) => s.isActive && s.key.trim().length > 0)
        .map((s) => s.key.trim())
        .join(',');

      const payload = {
        ...settings,
        gemini_master_keys: activeMasterKeys || settings.gemini_master_keys,
      };

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showToast('success', 'Semua pengaturan berhasil disimpan ke database!');
        if (refreshSettings) {
          await refreshSettings();
        }
      } else {
        showToast('error', 'Gagal menyimpan: ' + (data.error || 'Periksa skema database Supabase'));
      }
    } catch (e) {
      console.error('Error saving settings:', e);
      showToast('error', 'Koneksi gagal saat menyimpan pengaturan');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleTest9Router = async () => {
    try {
      setTestingAi(true);
      setTestAiResult(null);

      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          action: 'test_ai_endpoint',
          endpointUrl: settings.nine_router_url,
          apiKey: settings.nine_router_key,
          model: settings.nine_router_model,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTestAiResult({
          success: true,
          message: `Koneksi Sukses! (${data.latencyMs ?? 0}ms) Respon endpoint: "${data.reply || 'OK'}"`,
        });
      } else {
        setTestAiResult({
          success: false,
          message: 'Koneksi Gagal: ' + (data.error || 'Tidak dapat menghubungi endpoint'),
        });
      }
    } catch (e) {
      setTestAiResult({
        success: false,
        message: 'Koneksi Gagal: ' + (e instanceof Error ? e.message : String(e)),
      });
    } finally {
      setTestingAi(false);
    }
  };

  const handleApproveOrder = async (orderId: string, userId: string) => {
    if (!confirm('Apakah kamu sudah mencocokkan pembayaran di GoBiz dan yakin ingin mengaktifkan akun PRO user ini?')) {
      return;
    }

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          action: 'approve_order',
          orderId,
          userId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('success', 'Pesanan disetujui & Akun Pro telah aktif!');
        fetchOrders();
        fetchUsers();
      }
    } catch (e) {
      console.error('Failed to approve order:', e);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    const reason = prompt('Masukkan alasan penolakan (opsional):', 'Pembayaran tidak ditemukan di GoBiz');
    if (reason === null) return;

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          action: 'reject_order',
          orderId,
          adminNotes: reason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('success', 'Pesanan ditolak');
        fetchOrders();
      }
    } catch (e) {
      console.error('Failed to reject order:', e);
    }
  };

  const handleToggleUserPro = async (userId: string, currentTier: string) => {
    const nextTier = currentTier === 'pro' ? 'free' : 'pro';
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          action: 'update_user_tier',
          userId,
          tier: nextTier,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('success', `Tier user diubah ke ${nextTier.toUpperCase()}`);
        fetchUsers();
      }
    } catch (e) {
      console.error('Failed to toggle tier:', e);
    }
  };

  const handleResetUserTrial = async (userId: string) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          action: 'update_user_tier',
          userId,
          resetTrial: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('success', 'Trial kuota user direset ke 0');
        fetchUsers();
      }
    } catch (e) {
      console.error('Failed to reset trial:', e);
    }
  };

  // Metrics calculation
  const totalUsers = usersList.length;
  const proUsers = usersList.filter((u) => u.subscription_tier === 'pro' || u.subscription_tier === 'unlimited').length;
  const pendingOrders = ordersList.filter((o) => o.status === 'pending').length;
  const approvedOrders = ordersList.filter((o) => o.status === 'approved').length;
  const totalRevenue = approvedOrders * (settings.pro_price_rp || 49000);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-white">
        <RefreshCw className="h-6 w-6 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!isUnlocked) {
    // Not logged in — show login prompt
    if (!user) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-white p-4">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center shadow-2xl space-y-5">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-400 shadow-inner">
              <Lock className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Akses Terbatas</h2>
              <p className="text-xs text-zinc-500 mt-2">
                Halaman ini hanya dapat diakses oleh administrator.<br />
                Login dengan akun Google yang terdaftar terlebih dahulu.
              </p>
            </div>
            <Link
              href="/"
              className="block text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              &larr; Kembali ke Beranda
            </Link>
          </div>
        </div>
      );
    }

    // Logged in but wrong email — access denied
    if (user.email !== ADMIN_EMAIL) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-white p-4">
          <div className="w-full max-w-sm rounded-2xl border border-red-900/40 bg-zinc-950 p-8 text-center shadow-2xl space-y-5">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-950/60 border border-red-800/50 text-red-400 shadow-inner">
              <XCircle className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Akses Ditolak</h2>
              <p className="text-xs text-zinc-500 mt-2">
                Akun <span className="font-mono text-zinc-300">{user.email}</span> tidak terdaftar sebagai administrator.
              </p>
            </div>
            <Link
              href="/"
              className="block text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              &larr; Kembali ke Beranda
            </Link>
          </div>
        </div>
      );
    }

    // Correct email — show passcode form
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-white p-4">
        <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center shadow-2xl">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-4 shadow-inner">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">Admin Control</h2>
          <p className="text-xs text-zinc-400 mt-1 mb-1">
            Login sebagai <span className="font-mono text-amber-400">{user.email}</span>
          </p>
          <p className="text-xs text-zinc-600 mb-6">Masukkan passcode untuk melanjutkan.</p>

          <form onSubmit={handleUnlock} className="space-y-4">
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Masukkan passcode admin"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-hidden text-center tracking-widest font-mono"
              autoFocus
            />
            <button
              type="submit"
              disabled={!passcode}
              className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-black py-3 text-xs transition-all shadow-md active:scale-98"
            >
              Buka Dashboard Admin
            </button>
          </form>

          <div className="mt-5">
            <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
              &larr; Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen flex bg-[#09090b] text-zinc-100 font-sans">
      {/* Toast Floating Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border text-xs font-semibold shadow-2xl animate-in slide-in-from-top duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300'
              : 'bg-red-950/90 border-red-500/50 text-red-300'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* LEFT SIDEBAR */}
      <aside className="w-64 border-r border-zinc-800/80 bg-[#0d0d10] flex flex-col justify-between shrink-0 hidden md:flex">
        <div>
          {/* Logo & Brand */}
          <div className="p-5 border-b border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              <Link href="/" className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-lg text-white">
                  ngodingpake<span className="text-amber-500 font-black">prd</span>
                </span>
              </Link>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 uppercase">
                ADMIN CONTROL v1.0
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 text-xs font-medium">
            {[
              { id: 'overview', label: 'Overview & Metrik', icon: LayoutDashboard, badge: null },
              { id: 'switchboard', label: 'Master Switchboard', icon: Sliders, badge: null },
              { id: 'ai_engine', label: 'AI Engine & 9Router', icon: Cpu, badge: settings.ai_provider === 'nine_router' ? '9R' : 'Gemini' },
              { id: 'orders', label: 'GoBiz QRIS Orders', icon: Wallet, badge: pendingOrders > 0 ? `${pendingOrders} New` : null },
              { id: 'users', label: 'Manajemen User', icon: Users, badge: totalUsers > 0 ? `${totalUsers}` : null },
              { id: 'pricing', label: 'Pengaturan QRIS & Harga', icon: QrCode, badge: null },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30 shadow-xs'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-amber-400' : 'text-zinc-400'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        tab.id === 'orders' && pendingOrders > 0
                          ? 'bg-amber-500 text-zinc-950 animate-bounce'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info in sidebar */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/40 text-[11px] text-zinc-400 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Database:</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Supabase
            </span>
          </div>
          <Link
            href="/generator"
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold transition-colors border border-zinc-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Ke Generator App</span>
          </Link>
        </div>
      </aside>

      {/* RIGHT MAIN VIEW */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-white tracking-tight capitalize flex items-center gap-2">
              <span>{activeTab.replace('_', ' ')}</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all shadow-md active:scale-98 disabled:opacity-50"
            >
              {savingSettings ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </header>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex items-center gap-1 border-b border-zinc-800 p-2 overflow-x-auto bg-zinc-950 text-xs">
          {['overview', 'switchboard', 'ai_engine', 'orders', 'users', 'pricing'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap capitalize ${
                activeTab === tab ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-400'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Main Body */}
        <main className="p-4 sm:p-8 max-w-6xl w-full mx-auto space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5 shadow-xs">
                  <div className="flex items-center justify-between text-zinc-400 mb-2">
                    <span className="text-xs font-semibold">Total Pengguna</span>
                    <Users className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{totalUsers}</div>
                  <div className="text-[11px] text-zinc-500 mt-1">{proUsers} Pengguna PRO</div>
                </div>

                <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5 shadow-xs">
                  <div className="flex items-center justify-between text-zinc-400 mb-2">
                    <span className="text-xs font-semibold">Pesanan QRIS Pending</span>
                    <Clock className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-black text-amber-400">{pendingOrders}</div>
                  <div className="text-[11px] text-zinc-500 mt-1">Perlu dicek di GoBiz</div>
                </div>

                <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5 shadow-xs">
                  <div className="flex items-center justify-between text-zinc-400 mb-2">
                    <span className="text-xs font-semibold">Estimasi Pendapatan</span>
                    <DollarSign className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-emerald-400">
                    Rp {totalRevenue.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1">{approvedOrders} Transaksi Sukses</div>
                </div>

                <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5 shadow-xs">
                  <div className="flex items-center justify-between text-zinc-400 mb-2">
                    <span className="text-xs font-semibold">AI Provider Aktif</span>
                    <Cpu className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="text-lg font-black text-white truncate uppercase">
                    {settings.ai_provider.replace('_', ' ')}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1">
                    {settings.api_key_mode === 'server_managed' ? 'Server-Managed (Trial 1x)' : 'BYOK (User Key)'}
                  </div>
                </div>
              </div>

              {/* Quick Actions & Status */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-6 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Radio className="h-4 w-4 text-amber-400" />
                    <span>Konfigurasi Cepat (Quick Switch)</span>
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/50">
                      <div>
                        <div className="font-semibold text-white">Mode Akses Pengunjung</div>
                        <div className="text-zinc-400 text-[11px]">{settings.auth_mode}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('switchboard')}
                        className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                      >
                        Ubah
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/50">
                      <div>
                        <div className="font-semibold text-white">Mesin AI Pembuat PRD</div>
                        <div className="text-zinc-400 text-[11px]">{settings.ai_provider}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('ai_engine')}
                        className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                      >
                        Kelola
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-6 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-400" />
                    <span>Petunjuk Sinkronisasi GoBiz</span>
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Saat pengguna memilih upgrade PRO dan melakukan scan QRIS GoPay, pesanan akan langsung muncul di tab <strong>GoBiz QRIS Orders</strong>. Buka aplikasi GoBiz di ponsel Anda, cocokkan nama pengirim/nominal, lalu klik tombol verifikasi.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('orders')}
                      className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold"
                    >
                      <span>Buka Antrean Pesanan ({pendingOrders} Pending)</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Generation & Active Users Activity Feed */}
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Live Generation & User Activity</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          REAL-TIME
                        </span>
                      </h3>
                      <p className="text-[11px] text-zinc-400">
                        Histori PRD yang baru saja digenerate oleh user ({monitoringData?.totalGenerations || 0} total dibuat).
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={fetchMonitoring}
                    disabled={loadingMonitoring}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-800 transition-colors"
                  >
                    <RefreshCw className={`h-3 w-3 ${loadingMonitoring ? 'animate-spin' : ''}`} />
                    <span>Perbarui Feed</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-900/60 text-zinc-400 uppercase text-[10px]">
                      <tr>
                        <th className="px-4 py-2.5">User / Akun</th>
                        <th className="px-4 py-2.5">Judul PRD</th>
                        <th className="px-4 py-2.5">Mesin AI Digunakan</th>
                        <th className="px-4 py-2.5">Tier</th>
                        <th className="px-4 py-2.5 text-right">Waktu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
                      {!monitoringData?.recentGenerations || monitoringData.recentGenerations.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                            Belum ada aktivitas generate PRD yang tercatat di database.
                          </td>
                        </tr>
                      ) : (
                        monitoringData.recentGenerations.map((gen: any) => (
                          <tr key={gen.id} className="hover:bg-zinc-900/40 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-white truncate max-w-[180px]">
                                {gen.userEmail}
                              </div>
                              <div className="text-[10px] text-zinc-500 truncate">{gen.userName}</div>
                            </td>
                            <td className="px-4 py-3 font-medium text-amber-200 truncate max-w-[220px]">
                              {gen.title}
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-zinc-900 text-zinc-300 border border-zinc-800">
                                {gen.model_used || 'AI Engine'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                                  gen.userTier === 'pro'
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : 'bg-zinc-800 text-zinc-400'
                                }`}
                              >
                                {gen.userTier || 'FREE'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-zinc-400 font-mono text-[11px]">
                              {gen.created_at
                                ? new Date(gen.created_at).toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                  })
                                : '—'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MASTER SWITCHBOARD */}
          {activeTab === 'switchboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Auth Mode */}
                <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Mode Akses (Auth Mode)</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Tentukan apakah pengunjung wajib login Google atau bisa langsung mencoba.
                  </p>
                  <div className="space-y-2 text-xs">
                    {[
                      { id: 'free_access', title: 'Bebas (No Login)', desc: 'Pengunjung langsung pakai tanpa login' },
                      { id: 'hybrid', title: 'Hybrid (Opsional Login)', desc: 'Bisa coba langsung, login untuk cloud sync' },
                      { id: 'strict_login', title: 'Strict (Wajib Login)', desc: 'Wajib login Google sebelum generate' },
                    ].map((m) => (
                      <label
                        key={m.id}
                        className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                          settings.auth_mode === m.id
                            ? 'border-amber-500/50 bg-amber-500/10 text-white font-semibold'
                            : 'border-zinc-800/80 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="auth_mode"
                          checked={settings.auth_mode === m.id}
                          onChange={() => setSettings({ ...settings, auth_mode: m.id as any })}
                          className="mt-0.5 text-amber-500 focus:ring-amber-500"
                        />
                        <div>
                          <div className="font-semibold text-white">{m.title}</div>
                          <div className="text-[11px] text-zinc-400">{m.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* API Key Mode */}
                <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <Key className="h-4 w-4" />
                    <span>API Key Policy</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Sembunyikan modal API key dari pengunjung jika kamu sediakan master key / 9Router.
                  </p>
                  <div className="space-y-2 text-xs">
                    {[
                      {
                        id: 'server_managed',
                        title: 'Server Managed (Disarankan)',
                        desc: 'Admin sediakan Key/9Router. Modal API Key disembunyikan. User dapat Trial.',
                      },
                      {
                        id: 'byok_only',
                        title: 'BYOK (Bawa Key Sendiri)',
                        desc: 'User wajib memasukkan Gemini API Key mereka sendiri di aplikasi.',
                      },
                    ].map((m) => (
                      <label
                        key={m.id}
                        className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                          settings.api_key_mode === m.id
                            ? 'border-amber-500/50 bg-amber-500/10 text-white font-semibold'
                            : 'border-zinc-800/80 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="api_key_mode"
                          checked={settings.api_key_mode === m.id}
                          onChange={() => setSettings({ ...settings, api_key_mode: m.id as any })}
                          className="mt-0.5 text-amber-500 focus:ring-amber-500"
                        />
                        <div>
                          <div className="font-semibold text-white">{m.title}</div>
                          <div className="text-[11px] text-zinc-400">{m.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Free Trial Limit */}
                <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <Zap className="h-4 w-4" />
                    <span>Free Trial Quota</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Batas generate gratis untuk user non-PRO sebelum dialihkan ke halaman Upgrade PRO.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Jumlah Free Trial per User:</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={settings.trial_limit}
                        onChange={(e) => setSettings({ ...settings, trial_limit: parseInt(e.target.value) || 0 })}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-hidden"
                      />
                      <span className="text-[11px] text-zinc-500 mt-1 block">
                        Misal 1 = User hanya bisa 1x generate gratis dari server key kamu.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AI ENGINE & MULTI-KEY POOL */}
          {activeTab === 'ai_engine' && (
            <div className="space-y-6">
              {/* 1. TIER-BASED AI ROUTING (FREE VS PRO) */}
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-6 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-amber-400" />
                    <span>Alokasi Mesin Berdasarkan Tingkatan (Tier-Based AI Routing)</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Atur provider dan model AI yang berbeda untuk Pengguna Free/Trial vs Pengguna PRO.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Free Tier Config */}
                  <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-400" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          Pengguna Free / Trial
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        HEMAT & CEPAT
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="text-zinc-400 block mb-1 font-medium">Provider AI:</label>
                        <select
                          value={settings.free_ai_provider || 'gemini_direct'}
                          onChange={(e) => handleFreeProviderChange(e.target.value as any)}
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-white"
                        >
                          <option value="gemini_direct">Google Gemini Direct (Multi-Key Pool)</option>
                          <option value="nine_router">9Router Proxy (Local/VPS)</option>
                          <option value="openrouter">OpenRouter.ai</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-zinc-400 font-medium">Model Target:</label>
                          <span className="text-[10px] text-blue-400/80 font-mono">
                            {settings.free_ai_provider === 'gemini_direct'
                              ? 'Model Gemini'
                              : settings.free_ai_provider === 'nine_router'
                              ? 'Model 9Router'
                              : 'Model OpenRouter'}
                          </span>
                        </div>

                        {/* Model Dropdown Selector */}
                        <select
                          value={
                            (settings.free_ai_provider === 'gemini_direct' &&
                              getGeminiFreeModels().some((m) => m.id === settings.free_model)) ||
                            (settings.free_ai_provider === 'nine_router' &&
                              detected9RouterModels.includes(settings.free_model || '')) ||
                            (settings.free_ai_provider === 'openrouter' &&
                              POPULAR_OPENROUTER_MODELS.some((m) => m.id === settings.free_model))
                              ? settings.free_model
                              : '__custom__'
                          }
                          onChange={(e) => {
                            if (e.target.value !== '__custom__') {
                              setSettings({ ...settings, free_model: e.target.value });
                            }
                          }}
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-white mb-2"
                        >
                          {settings.free_ai_provider === 'gemini_direct' && (
                            <optgroup label="Model Gemini Rekomendasi (Free Tier)">
                              {getGeminiFreeModels().map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.label}
                                </option>
                              ))}
                            </optgroup>
                          )}

                          {settings.free_ai_provider === 'nine_router' && (
                            <optgroup label="Model / Combo 9Router">
                              {detected9RouterModels.length > 0 ? (
                                detected9RouterModels.map((m) => (
                                  <option key={m} value={m}>
                                    {m}
                                  </option>
                                ))
                              ) : (
                                <>
                                  <option value="deepseek-chat">deepseek-chat</option>
                                  <option value="gemini-flash">gemini-flash</option>
                                </>
                              )}
                            </optgroup>
                          )}

                          {settings.free_ai_provider === 'openrouter' && (
                            <optgroup label="Model OpenRouter">
                              {POPULAR_OPENROUTER_MODELS.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.label}
                                </option>
                              ))}
                            </optgroup>
                          )}
                          <option value="__custom__">-- Ketik Nama Model Kustom --</option>
                        </select>

                        <input
                          type="text"
                          value={settings.free_model || ''}
                          onChange={(e) => setSettings({ ...settings, free_model: e.target.value })}
                          placeholder="gemini-flash-latest"
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-white font-mono text-xs"
                        />

                        {/* Quick Chips Free */}
                        <div className="mt-2 space-y-1">
                          <span className="text-[10px] text-zinc-500 block">Pilihan Cepat (Klik untuk memilih):</span>
                          <div className="flex flex-wrap gap-1">
                            {settings.free_ai_provider === 'gemini_direct' &&
                              getGeminiFreeModels().slice(0, 6).map((m) => (
                                <button
                                  key={m.id}
                                  type="button"
                                  onClick={() => setSettings({ ...settings, free_model: m.id })}
                                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                                    settings.free_model === m.id
                                      ? 'bg-blue-500 text-white font-bold shadow-xs'
                                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                                  }`}
                                >
                                  {m.id}
                                </button>
                              ))}

                            {settings.free_ai_provider === 'nine_router' &&
                              (detected9RouterModels.length > 0
                                ? detected9RouterModels.slice(0, 6)
                                : ['deepseek-chat', 'gemini-flash']
                              ).map((m) => (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => setSettings({ ...settings, free_model: m })}
                                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                                    settings.free_model === m
                                      ? 'bg-blue-500 text-white font-bold shadow-xs'
                                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                                  }`}
                                >
                                  {m}
                                </button>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PRO Tier Config */}
                  <div className="p-5 rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-500/5 to-transparent space-y-4">
                    <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-amber-400" />
                        <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                          Pengguna PRO & Unlimited
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        PREMIUM POWER
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="text-zinc-400 block mb-1 font-medium">Provider AI:</label>
                        <select
                          value={settings.pro_ai_provider || 'nine_router'}
                          onChange={(e) => handleProProviderChange(e.target.value as any)}
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-white"
                        >
                          <option value="nine_router">9Router Proxy (DeepSeek / Claude Sonnet / Combo)</option>
                          <option value="gemini_direct">Google Gemini Direct (Pro Model)</option>
                          <option value="openrouter">OpenRouter.ai</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-zinc-400 font-medium">Model Target:</label>
                          <span className="text-[10px] text-amber-400/80 font-mono">
                            {settings.pro_ai_provider === 'gemini_direct'
                              ? 'Model Gemini PRO'
                              : settings.pro_ai_provider === 'nine_router'
                              ? 'Model 9Router'
                              : 'Model OpenRouter'}
                          </span>
                        </div>

                        {/* Dropdown Selector PRO */}
                        <select
                          value={
                            (settings.pro_ai_provider === 'gemini_direct' &&
                              getGeminiProModels().some((m) => m.id === settings.pro_model)) ||
                            (settings.pro_ai_provider === 'nine_router' &&
                              (detected9RouterModels.includes(settings.pro_model || '') ||
                                ['deepseek-chat', 'claude-3-5-sonnet', 'gpt-4o'].includes(
                                  settings.pro_model || ''
                                ))) ||
                            (settings.pro_ai_provider === 'openrouter' &&
                              POPULAR_OPENROUTER_MODELS.some((m) => m.id === settings.pro_model))
                              ? settings.pro_model
                              : '__custom__'
                          }
                          onChange={(e) => {
                            if (e.target.value !== '__custom__') {
                              setSettings({ ...settings, pro_model: e.target.value });
                            }
                          }}
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-white mb-2"
                        >
                          {settings.pro_ai_provider === 'gemini_direct' && (
                            <optgroup label="Model Gemini Resmi (Google)">
                              {getGeminiProModels().map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.label}
                                </option>
                              ))}
                            </optgroup>
                          )}

                          {settings.pro_ai_provider === 'nine_router' && (
                            <>
                              <optgroup label="Model & Combo Terdeteksi di 9Router">
                                {detected9RouterModels.map((m) => (
                                  <option key={m} value={m}>
                                    {m}
                                  </option>
                                ))}
                              </optgroup>
                              <optgroup label="Model Standar">
                                <option value="deepseek-chat">deepseek-chat</option>
                                <option value="claude-3-5-sonnet">claude-3-5-sonnet</option>
                                <option value="gpt-4o">gpt-4o</option>
                              </optgroup>
                            </>
                          )}

                          {settings.pro_ai_provider === 'openrouter' && (
                            <optgroup label="Model OpenRouter Populer">
                              {POPULAR_OPENROUTER_MODELS.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.label}
                                </option>
                              ))}
                            </optgroup>
                          )}

                          <option value="__custom__">-- Ketik Nama Model Kustom --</option>
                        </select>

                        <input
                          type="text"
                          value={settings.pro_model || ''}
                          onChange={(e) => setSettings({ ...settings, pro_model: e.target.value })}
                          placeholder={
                            settings.pro_ai_provider === 'gemini_direct'
                              ? 'gemini-2.5-pro'
                              : settings.pro_ai_provider === 'nine_router'
                              ? 'deepseek-chat atau nama paket combo'
                              : 'anthropic/claude-3.5-sonnet'
                          }
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-white font-mono text-xs"
                        />

                        {/* Quick Chips PRO */}
                        <div className="mt-2 space-y-1">
                          <span className="text-[10px] text-zinc-500 block">Pilihan Cepat (Klik untuk memilih):</span>
                          <div className="flex flex-wrap gap-1">
                            {settings.pro_ai_provider === 'gemini_direct' &&
                              getGeminiProModels().slice(0, 7).map((m) => (
                                <button
                                  key={m.id}
                                  type="button"
                                  onClick={() => setSettings({ ...settings, pro_model: m.id })}
                                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                                    settings.pro_model === m.id
                                      ? 'bg-amber-500 text-zinc-950 font-bold shadow-xs'
                                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                                  }`}
                                >
                                  {m.id}
                                </button>
                              ))}

                            {settings.pro_ai_provider === 'nine_router' &&
                              (detected9RouterModels.length > 0
                                ? detected9RouterModels.slice(0, 8)
                                : ['deepseek-chat', 'claude-3-5-sonnet', 'wkwk']
                              ).map((m) => (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => setSettings({ ...settings, pro_model: m })}
                                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                                    settings.pro_model === m
                                      ? 'bg-amber-500 text-zinc-950 font-bold shadow-xs'
                                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                                  }`}
                                >
                                  {m}
                                </button>
                              ))}

                            {settings.pro_ai_provider === 'openrouter' &&
                              POPULAR_OPENROUTER_MODELS.map((m) => (
                                <button
                                  key={m.id}
                                  type="button"
                                  onClick={() => setSettings({ ...settings, pro_model: m.id })}
                                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                                    settings.pro_model === m.id
                                      ? 'bg-amber-500 text-zinc-950 font-bold shadow-xs'
                                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                                  }`}
                                >
                                  {m.id.split('/')[1] || m.id}
                                </button>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. 9ROUTER PROXY CONFIG & COMBO DETECTOR */}
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Server className="h-4 w-4 text-amber-400" />
                      <span>Konfigurasi 9Router Proxy & Paket Combo</span>
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Hubungkan proxy VPS/local untuk menjalankan DeepSeek V3, Claude Sonnet, atau model combo.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={fetching9RouterModels}
                      onClick={handleFetch9RouterModels}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
                    >
                      {fetching9RouterModels ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <Zap className="h-3 w-3 text-amber-400" />
                      )}
                      <span>Deteksi Model & Combo</span>
                    </button>

                    <button
                      type="button"
                      disabled={testingAi}
                      onClick={handleTest9Router}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs font-bold text-zinc-950 transition-colors"
                    >
                      {testingAi ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3 fill-current" />}
                      <span>Tes Ping Endpoint</span>
                    </button>
                  </div>
                </div>

                {testAiResult && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      testAiResult.success
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/10 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {testAiResult.success ? (
                      <CheckCircle className="h-4 w-4 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 shrink-0" />
                    )}
                    <span>{testAiResult.message}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-zinc-400 block mb-1">9Router Endpoint URL:</label>
                    <input
                      type="text"
                      value={settings.nine_router_url || ''}
                      onChange={(e) => setSettings({ ...settings, nine_router_url: e.target.value })}
                      placeholder="http://127.0.0.1:2080/v1/chat/completions"
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">9Router API Key (sk-...):</label>
                    <input
                      type="password"
                      value={settings.nine_router_key || ''}
                      onChange={(e) => setSettings({ ...settings, nine_router_key: e.target.value })}
                      placeholder="sk-9router-key"
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">Default 9Router Model:</label>
                    <input
                      type="text"
                      value={settings.nine_router_model || ''}
                      onChange={(e) => setSettings({ ...settings, nine_router_model: e.target.value })}
                      placeholder="deepseek-chat"
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>

                {/* Detected Combo Models Chips */}
                {detected9RouterModels.length > 0 && (
                  <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-2">
                    <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block">
                      Model Terdeteksi dari Paket Combo 9Router (Klik untuk memilih sebagai Model PRO):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {detected9RouterModels.map((m, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setSettings({ ...settings, nine_router_model: m, pro_model: m });
                            showToast('success', `Model PRO disetel ke ${m}`);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                            settings.pro_model === m || settings.nine_router_model === m
                              ? 'bg-amber-500 text-zinc-950 font-bold shadow-xs'
                              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. GEMINI MULTI-KEY POOL MANAGER (UP TO 10 SLOTS) */}
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-amber-400" />
                      <h3 className="text-base font-bold text-white">
                        Gemini Multi-Key Pool Manager (Hingga 10 Slot API Key)
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                      Bagi traffic user ke beberapa API Key Gemini. Sistem memetakan user ke slot tertentu berdasarkan hash ID (User A&B &rarr; Slot 1, User C&D &rarr; Slot 2) dan otomatis failover ke slot lain jika limit.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-zinc-400 mr-1">
                      {(settings.gemini_slots || DEFAULT_10_SLOTS).filter((s) => s.isActive && s.key.trim()).length} / 10 Slot Aktif
                    </span>
                    <button
                      type="button"
                      disabled={testingAllSlots}
                      onClick={handleTestAllSlots}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
                    >
                      {testingAllSlots ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Zap className="h-3.5 w-3.5 fill-current" />
                      )}
                      <span>Uji Semua Slot Aktif</span>
                    </button>
                  </div>
                </div>

                {/* Slots List */}
                <div className="space-y-3">
                  {(settings.gemini_slots || DEFAULT_10_SLOTS).map((slot, index) => {
                    const isKeyVisible = showKeyMap[slot.id] || false;
                    const isTestingThis = testingSlotId === slot.id;

                    return (
                      <div
                        key={slot.id}
                        className={`p-4 rounded-xl border transition-all ${
                          slot.isActive
                            ? 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                            : 'border-zinc-900 bg-zinc-950/60 opacity-60'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                          {/* Slot Info & Toggle */}
                          <div className="flex items-center gap-3">
                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                              <input
                                type="checkbox"
                                checked={slot.isActive}
                                onChange={(e) => {
                                  const updated = (settings.gemini_slots || DEFAULT_10_SLOTS).map((s) =>
                                    s.id === slot.id ? { ...s, isActive: e.target.checked } : s
                                  );
                                  setSettings({ ...settings, gemini_slots: updated });
                                }}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500" />
                            </label>

                            <div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={slot.label}
                                  onChange={(e) => {
                                    const updated = (settings.gemini_slots || DEFAULT_10_SLOTS).map((s) =>
                                      s.id === slot.id ? { ...s, label: e.target.value } : s
                                    );
                                    setSettings({ ...settings, gemini_slots: updated });
                                  }}
                                  className="text-xs font-bold text-white bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-amber-400 focus:outline-none px-0.5 py-0.5"
                                />
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                                  Cluster {String.fromCharCode(65 + index)} (User Hash #{index})
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="flex items-center gap-2">
                            {slot.status === 'online' && (
                              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span>ONLINE ({slot.latencyMs || 0}ms)</span>
                              </span>
                            )}
                            {slot.status === 'offline' && (
                              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/30">
                                <span className="w-2 h-2 rounded-full bg-red-400" />
                                <span>OFFLINE / LIMIT</span>
                              </span>
                            )}
                            {(!slot.status || slot.status === 'untested') && (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono text-zinc-500 bg-zinc-800/80">
                                Belum Diuji
                              </span>
                            )}

                            {slot.lastChecked && (
                              <span className="text-[10px] text-zinc-500 hidden sm:inline font-mono">
                                Diuji {slot.lastChecked}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Key Input & Test Action */}
                        <div className="mt-3 flex flex-col sm:flex-row gap-2">
                          <div className="relative flex-1">
                            <input
                              type={isKeyVisible ? 'text' : 'password'}
                              value={slot.key}
                              onChange={(e) => {
                                const updated = (settings.gemini_slots || DEFAULT_10_SLOTS).map((s) =>
                                  s.id === slot.id ? { ...s, key: e.target.value } : s
                                );
                                setSettings({ ...settings, gemini_slots: updated });
                              }}
                              placeholder={`Masukkan Gemini API Key Slot #${index + 1} (AIzaSy...)`}
                              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-white font-mono placeholder-zinc-600 focus:border-amber-400 focus:outline-none pr-10"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowKeyMap((prev) => ({ ...prev, [slot.id]: !prev[slot.id] }))
                              }
                              className="absolute right-3 top-2 text-zinc-500 hover:text-zinc-300"
                              tabIndex={-1}
                            >
                              {isKeyVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>

                          <button
                            type="button"
                            disabled={isTestingThis || !slot.key.trim()}
                            onClick={() => handleTestGeminiSlot(slot.id, slot.key)}
                            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors disabled:opacity-40 shrink-0"
                          >
                            {isTestingThis ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <Zap className="h-3 w-3 text-amber-400" />
                            )}
                            <span>Uji Koneksi</span>
                          </button>
                        </div>

                        {/* Model Chips if Detected */}
                        {slot.models && slot.models.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[10px]">
                            <span className="text-zinc-500">Model Aktif:</span>
                            {slot.models.slice(0, 5).map((m, mIdx) => (
                              <span
                                key={mIdx}
                                className="px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 font-mono border border-zinc-700/50"
                              >
                                {m}
                              </span>
                            ))}
                            {slot.models.length > 5 && (
                              <span className="text-zinc-500 font-mono">
                                +{slot.models.length - 5} lainnya
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS & GOBIZ VERIFICATION */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-zinc-300 space-y-1">
                  <div className="font-bold text-white text-sm">Alur Verifikasi Pembayaran GoBiz</div>
                  <p className="text-zinc-400 leading-relaxed">
                    1. Pengguna klik "Saya Sudah Selesai Bayar via QRIS" &rarr; Order muncul di tabel dengan status <span className="text-amber-400 font-bold">PENDING</span>.<br />
                    2. Cek notifikasi transaksi masuk di aplikasi GoBiz HP Anda.<br />
                    3. Klik tombol <strong className="text-emerald-400">[ ✅ Terima PRO ]</strong> untuk mengaktifkan status PRO user seketika.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 overflow-hidden">
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Antrean Transaksi QRIS ({ordersList.length})
                  </h4>
                  <button
                    type="button"
                    onClick={fetchOrders}
                    className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white"
                  >
                    <RefreshCw className={`h-3 w-3 ${loadingData ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-900/60 text-zinc-400 uppercase text-[10px]">
                      <tr>
                        <th className="px-4 py-3">Order Code</th>
                        <th className="px-4 py-3">User / Email</th>
                        <th className="px-4 py-3">Nominal</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Waktu</th>
                        <th className="px-4 py-3 text-right">Aksi Verifikasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 text-zinc-300">
                      {ordersList.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                            Belum ada transaksi QRIS yang tercatat.
                          </td>
                        </tr>
                      ) : (
                        ordersList.map((order) => (
                          <tr key={order.id} className="hover:bg-zinc-900/30 transition-colors">
                            <td className="px-4 py-3 font-mono font-bold text-amber-400">
                              {order.order_code}
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-white">{order.user_name || 'User'}</div>
                              <div className="text-[11px] text-zinc-500 font-mono">{order.user_email}</div>
                            </td>
                            <td className="px-4 py-3 font-semibold text-white">
                              {order.amount_formatted || 'Rp 49.000'}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  order.status === 'approved'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : order.status === 'rejected'
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                                }`}
                              >
                                {order.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-zinc-500 text-[11px]">
                              {order.created_at ? new Date(order.created_at).toLocaleString('id-ID') : '-'}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {order.status === 'pending' ? (
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleApproveOrder(order.id, order.user_id)}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-[11px] transition-colors"
                                  >
                                    ✅ Terima PRO
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRejectOrder(order.id)}
                                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-400 font-semibold text-[11px] transition-colors"
                                  >
                                    ❌ Tolak
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[11px] text-zinc-500 italic">Selesai</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 overflow-hidden">
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Daftar Pengguna Google ({usersList.length})
                  </h4>
                  <button
                    type="button"
                    onClick={fetchUsers}
                    className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white"
                  >
                    <RefreshCw className={`h-3 w-3 ${loadingData ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-900/60 text-zinc-400 uppercase text-[10px]">
                      <tr>
                        <th className="px-4 py-3">Nama / Email</th>
                        <th className="px-4 py-3">Status Tier</th>
                        <th className="px-4 py-3">Trial Terpakai</th>
                        <th className="px-4 py-3">Tanggal Daftar</th>
                        <th className="px-4 py-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 text-zinc-300">
                      {usersList.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                            Belum ada user yang terdaftar di Supabase.
                          </td>
                        </tr>
                      ) : (
                        usersList.map((u) => (
                          <tr key={u.id} className="hover:bg-zinc-900/30 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-white">{u.full_name || 'User'}</div>
                              <div className="text-[11px] text-zinc-500 font-mono">{u.email}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  u.subscription_tier === 'pro' || u.subscription_tier === 'unlimited'
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : 'bg-zinc-800 text-zinc-400'
                                }`}
                              >
                                {u.subscription_tier || 'FREE'}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono">
                              {u.trial_count || 0} / {settings.trial_limit}
                            </td>
                            <td className="px-4 py-3 text-zinc-500 text-[11px]">
                              {u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID') : '-'}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleToggleUserPro(u.id, u.subscription_tier)}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                                    u.subscription_tier === 'pro'
                                      ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                      : 'bg-amber-500 hover:bg-amber-400 text-zinc-950'
                                  }`}
                                >
                                  {u.subscription_tier === 'pro' ? 'Turunkan ke Free' : 'Jadikan PRO'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleResetUserTrial(u.id)}
                                  className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px]"
                                  title="Reset Trial Kuota ke 0"
                                >
                                  Reset Trial
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: QRIS & PRICING */}
          {activeTab === 'pricing' && (
            <div className="max-w-3xl space-y-6">
              {/* Card 1: Merchant & Price Settings */}
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-6 space-y-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  <span>Pengaturan Merchant QRIS GoPay & Harga</span>
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="text-zinc-400 block mb-1 font-medium">Nama Merchant GoBiz (Tampil di QRIS):</label>
                    <input
                      type="text"
                      value={settings.qris_merchant_name || ''}
                      onChange={(e) => setSettings({ ...settings, qris_merchant_name: e.target.value })}
                      placeholder="NGODINGPAKEPRD OFFICIAL"
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-white focus:border-amber-500 focus:outline-hidden font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1 font-medium">Nomor Akun GoPay Merchant:</label>
                    <input
                      type="text"
                      value={settings.qris_gopay_number || ''}
                      onChange={(e) => setSettings({ ...settings, qris_gopay_number: e.target.value })}
                      placeholder="0821-4475-4089"
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-white font-mono focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-zinc-400 block mb-1 font-medium">Harga PRO (Nominal Angka):</label>
                      <input
                        type="number"
                        value={settings.pro_price_rp || 49000}
                        onChange={(e) => setSettings({ ...settings, pro_price_rp: parseInt(e.target.value) || 0 })}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-white font-mono focus:border-amber-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 block mb-1 font-medium">Label Tampilan Harga:</label>
                      <input
                        type="text"
                        value={settings.pro_price_formatted || ''}
                        onChange={(e) => setSettings({ ...settings, pro_price_formatted: e.target.value })}
                        placeholder="Rp 49.000 / Lifetime Access"
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-white focus:border-amber-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Upload Gambar QRIS dari File / Komputer */}
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    <span>Upload File Gambar QRIS (PNG / JPG / WEBP)</span>
                  </h3>
                  {settings.qris_image_url && settings.qris_image_url !== '/qris-gopay-placeholder.png' && (
                    <button
                      type="button"
                      onClick={() => {
                        setSettings({ ...settings, qris_image_url: '/qris-gopay-placeholder.png' });
                        showToast('success', 'Gambar QRIS direset ke placeholder default');
                      }}
                      className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Reset Gambar</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                  {/* File Input Box */}
                  <div className="space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleQRISFileUpload}
                      className="hidden"
                    />

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-zinc-700 hover:border-amber-500 bg-zinc-900/40 hover:bg-zinc-900/80 p-6 rounded-2xl text-center cursor-pointer transition-all group"
                    >
                      <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                        <Upload className="h-6 w-6" />
                      </div>
                      <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                        Klik untuk Pilih File Gambar QRIS
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        Mendukung PNG, JPG, JPEG, WEBP (Maksimal 4MB)
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="mt-3 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>Pilih Gambar dari Komputer</span>
                      </button>
                    </div>

                    <div>
                      <label className="text-zinc-400 text-xs block mb-1">Atau masukkan URL / Link CDN Gambar:</label>
                      <input
                        type="text"
                        value={settings.qris_image_url || ''}
                        onChange={(e) => setSettings({ ...settings, qris_image_url: e.target.value })}
                        placeholder="https://... atau /qris.png atau base64"
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white font-mono truncate focus:border-amber-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Live Image Preview Frame */}
                  <div className="flex flex-col items-center justify-center p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800 text-center">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                      Live Preview QRIS (Tampilan Pengguna)
                    </span>
                    <div className="w-48 h-48 bg-white rounded-xl p-2 flex items-center justify-center shadow-lg border border-zinc-300 overflow-hidden">
                      {settings.qris_image_url ? (
                        <img
                          src={settings.qris_image_url}
                          alt="QRIS Preview"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="text-zinc-800 text-center text-xs font-bold flex flex-col items-center justify-center">
                          <QrCode className="h-16 w-16 mx-auto text-zinc-800 mb-1" />
                          <span>Belum Ada Gambar</span>
                        </div>
                      )}
                    </div>

                    {settings.qris_image_url && settings.qris_image_url !== '/qris-gopay-placeholder.png' && (
                      <button
                        type="button"
                        onClick={() => {
                          setRawUploadedImage(settings.qris_image_url || null);
                          setCropScale(1);
                          setCropOffsetX(0);
                          setCropOffsetY(0);
                          setIsCroppingOpen(true);
                        }}
                        className="mt-2.5 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Scissors className="h-3.5 w-3.5" />
                        <span>Pangkas / Crop Gambar</span>
                      </button>
                    )}

                    <span className="text-xs font-bold text-white mt-2">
                      {settings.qris_merchant_name || 'NGODINGPAKEPRD OFFICIAL'}
                    </span>
                    <span className="text-[11px] text-amber-400 font-mono font-semibold">
                      {settings.pro_price_formatted || `Rp ${(settings.pro_price_rp || 49000).toLocaleString('id-ID')}`}
                    </span>
                    <span className="text-[10px] text-zinc-500 mt-0.5 font-mono">
                      GoPay: {settings.qris_gopay_number || '0821-4475-4089'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Interactive QRIS Crop / Pangkas Modal */}
        {isCroppingOpen && rawUploadedImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-white shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Scissors className="h-5 w-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">Pangkas & Sesuaikan Gambar QRIS</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCroppingOpen(false)}
                  className="text-zinc-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 cursor-pointer"
                >
                  Tutup (✕)
                </button>
              </div>

              <p className="text-xs text-zinc-400">
                Gunakan slider di bawah untuk zoom dan geser posisi agar barcode QRIS pas presisi di kotak persegi:
              </p>

              {/* Cropping Viewport Container */}
              <div className="flex justify-center py-2">
                <div className="relative w-64 h-64 bg-white rounded-xl overflow-hidden border-2 border-amber-500 shadow-2xl flex items-center justify-center">
                  {/* Guide Overlay Lines */}
                  <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-amber-500/30 opacity-40 z-10">
                    <div className="border-r border-b border-amber-500/20" />
                    <div className="border-r border-b border-amber-500/20" />
                    <div className="border-b border-amber-500/20" />
                    <div className="border-r border-b border-amber-500/20" />
                    <div className="border-r border-b border-amber-500/20" />
                    <div className="border-b border-amber-500/20" />
                    <div className="border-r border-amber-500/20" />
                    <div className="border-r border-amber-500/20" />
                    <div />
                  </div>

                  <img
                    src={rawUploadedImage}
                    alt="Crop View"
                    className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-75"
                    style={{
                      transform: `scale(${cropScale}) translate(${cropOffsetX}%, ${cropOffsetY}%)`,
                    }}
                  />
                </div>
              </div>

              {/* Sliders for Zoom & Pan */}
              <div className="space-y-3 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 text-xs">
                <div>
                  <div className="flex justify-between text-zinc-300 font-semibold mb-1">
                    <span className="flex items-center gap-1.5"><ZoomIn className="h-3.5 w-3.5 text-amber-400" /> Perbesar / Perkecil (Zoom):</span>
                    <span className="font-mono text-amber-400">{cropScale.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="3.0"
                    step="0.05"
                    value={cropScale}
                    onChange={(e) => setCropScale(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 h-1.5 bg-zinc-700 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-zinc-300 font-semibold mb-1">
                    <span className="flex items-center gap-1.5"><Move className="h-3.5 w-3.5 text-blue-400" /> Geser Horizontal (Kiri/Kanan):</span>
                    <span className="font-mono text-zinc-400">{cropOffsetX}%</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={cropOffsetX}
                    onChange={(e) => setCropOffsetX(parseInt(e.target.value))}
                    className="w-full accent-blue-500 h-1.5 bg-zinc-700 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-zinc-300 font-semibold mb-1">
                    <span className="flex items-center gap-1.5"><Move className="h-3.5 w-3.5 text-emerald-400" /> Geser Vertikal (Atas/Bawah):</span>
                    <span className="font-mono text-zinc-400">{cropOffsetY}%</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={cropOffsetY}
                    onChange={(e) => setCropOffsetY(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 h-1.5 bg-zinc-700 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="flex justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCropScale(1);
                      setCropOffsetX(0);
                      setCropOffsetY(0);
                    }}
                    className="text-[11px] text-zinc-400 hover:text-white underline cursor-pointer"
                  >
                    Reset Posisi & Zoom
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setSettings((prev) => ({ ...prev, qris_image_url: rawUploadedImage }));
                    setIsCroppingOpen(false);
                    showToast('success', 'Gambar asli diterapkan tanpa crop');
                  }}
                  className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold cursor-pointer"
                >
                  Gunakan Gambar Asli
                </button>
                <button
                  type="button"
                  onClick={handleApplyCrop}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>Terapkan Pangkas (Crop)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
