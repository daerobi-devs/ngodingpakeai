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
  Copy,
  Database,
  Sun,
  Moon,
  Search,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  SystemSettings,
  Profile,
  PaymentOrder,
  GeminiKeySlot,
  PricingTierConfig,
  DEFAULT_PRICING_TIERS,
} from '@/lib/supabase/types';

const DEFAULT_10_SLOTS: GeminiKeySlot[] = Array.from({ length: 10 }, (_, i) => ({
  id: `slot_${i + 1}`,
  label: `Gemini Key Slot #${i + 1}`,
  key: '',
  isActive: i === 0,
  assignedUsers: `Cluster ${String.fromCharCode(65 + i)}`,
  status: 'untested',
}));

const POPULAR_GEMINI_FREE_MODELS = [
  { id: 'gemini-3.8-flash', label: 'gemini-3.8-flash (Generasi 3.8 - Coding & Reasoning Unggul)' },
  { id: 'gemini-3.5-flash', label: 'gemini-3.5-flash (Generasi 3.5 - Agentic & Cepat)' },
  { id: 'gemini-3.5-flash-lite', label: 'gemini-3.5-flash-lite (Ultra Rendah Latensi & Hemat Kuota)' },
  { id: 'gemini-flash-latest', label: 'gemini-flash-latest (Auto Latest Flash Stable)' },
  { id: 'gemini-2.5-flash', label: 'gemini-2.5-flash (Stabil & Akurat LTS)' },
  { id: 'gemini-2.5-flash-lite', label: 'gemini-2.5-flash-lite (Ringan Generasi 2.5)' },
];

const POPULAR_GEMINI_PRO_MODELS = [
  { id: 'gemini-3.8-flash', label: 'gemini-3.8-flash (Generasi 3.8 Flagship Fast Reasoning)' },
  { id: 'gemini-3.5-flash', label: 'gemini-3.5-flash (Generasi 3.5 Agentic Pro)' },
  { id: 'gemini-2.5-pro', label: 'gemini-2.5-pro (Generasi 2.5 PRO Analitis Mendalam)' },
  { id: 'gemini-3.5-flash-lite', label: 'gemini-3.5-flash-lite (Ultra Low-Latency Flash)' },
  { id: 'gemini-2.5-flash', label: 'gemini-2.5-flash (Cepat & Kualitas Tinggi)' },
  { id: 'gemini-flash-latest', label: 'gemini-flash-latest (Cepat Tanpa Jeda)' },
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
    global_gemini_slot: 'auto',
    pricing_tiers: DEFAULT_PRICING_TIERS,
    announcement_banner: {
      active: false,
      isActive: false,
      message: 'Diskon Spesial! Dapatkan akses PRO dengan harga promo terbatas.',
      type: 'promo',
      dismissible: true,
    },
    trial_limit: 1,
    nine_router_url: 'http://127.0.0.1:2080/v1/chat/completions',
    nine_router_key: '',
    nine_router_model: 'deepseek-chat',
    gemini_master_keys: '',
    openrouter_key: '',
    openrouter_model: 'anthropic/claude-3.5-sonnet',
    qris_merchant_name: 'NGODINGPAKEPRD OFFICIAL',
    qris_gopay_number: '0851-2360-7711',
    qris_image_url: '/qris-gopay-placeholder.png',
    payment_gateway_mode: 'manual_qris',
    mpg_gateway_url: 'http://localhost:3000',
    mpg_api_key: 'mpg_live_f89a3c10b7d24e6a8e5c3b1a9f0d7e2c',
    mpg_webhook_secret: 'mandiri-private-gateway-secret-key-change-in-prod',
    pro_price_rp: 49000,
    pro_price_formatted: 'Rp 49.000 / Lifetime Access',
  });

  const [usersList, setUsersList] = useState<Profile[]>([]);
  const [userFilter, setUserFilter] = useState<'all' | 'active' | 'expiring' | 'expired' | 'free' | 'banned'>('all');
  const [ordersList, setOrdersList] = useState<PaymentOrder[]>([]);
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [clearingRejectedOrders, setClearingRejectedOrders] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [testingAi, setTestingAi] = useState(false);
  const [testAiResult, setTestAiResult] = useState<{ success: boolean; message: string } | null>(null);

  // Mandiri Private Gateway (MPG) States
  const [testingMpg, setTestingMpg] = useState(false);
  const [testMpgResult, setTestMpgResult] = useState<{
    success: boolean;
    message: string;
    devicesCount?: number;
    onlineDeviceCount?: number;
  } | null>(null);
  const [showMpgKey, setShowMpgKey] = useState(false);
  const [showMpgSecret, setShowMpgSecret] = useState(false);
  const [webhookCopied, setWebhookCopied] = useState(false);

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
    totalServerTokens?: number;
  } | null>(null);
  const [loadingMonitoring, setLoadingMonitoring] = useState(false);

  // Theme Mode (Dark vs Light - Blue & White Theme)
  const [adminTheme, setAdminTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('admin_theme') as 'dark' | 'light' | null;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setAdminTheme(savedTheme);
      }
    } catch {}
  }, []);

  const toggleAdminTheme = () => {
    const nextTheme = adminTheme === 'dark' ? 'light' : 'dark';
    setAdminTheme(nextTheme);
    try {
      localStorage.setItem('admin_theme', nextTheme);
    } catch {}
    showToast('success', nextTheme === 'light' ? 'Mode Terang (Biru & Putih) aktif' : 'Mode Gelap aktif');
  };

  // Live Generation Optimization & Delete States
  const [deletingGenId, setDeletingGenId] = useState<string | null>(null);
  const [clearingGenerations, setClearingGenerations] = useState(false);
  const [genSearchQuery, setGenSearchQuery] = useState('');
  const [genKeyFilter, setGenKeyFilter] = useState<'all' | 'server' | 'byok'>('all');

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

          const rawTiers = data.settings.pricing_tiers && data.settings.pricing_tiers.length > 0
            ? data.settings.pricing_tiers
            : DEFAULT_PRICING_TIERS;
          const mergedTiers = [...rawTiers];
          if (!mergedTiers.some((t: any) => t.id === 'free')) {
            mergedTiers.unshift(DEFAULT_PRICING_TIERS[0]);
          }
          const normalizedTiers = mergedTiers.map((t: any) => {
            const def = DEFAULT_PRICING_TIERS.find((d) => d.id === t.id);
            return {
              ...t,
              feature_flags: t.feature_flags || def?.feature_flags || {
                advanced_templates: t.id !== 'free',
                custom_stack: t.id !== 'free',
                export_zip: t.id !== 'free',
                architecture_diagrams: t.id !== 'free',
              },
            };
          });

          setSettings({
            ...data.settings,
            gemini_slots: loadedSlots,
            pricing_tiers: normalizedTiers,
            pro_ai_provider: data.settings.pro_ai_provider || 'nine_router',
            pro_model: data.settings.pro_model || 'deepseek-chat',
            free_ai_provider: data.settings.free_ai_provider || 'gemini_direct',
            free_model: data.settings.free_model || 'gemini-flash-latest',
            payment_gateway_mode: data.settings.payment_gateway_mode || 'manual_qris',
            mpg_gateway_url: data.settings.mpg_gateway_url || 'http://localhost:3000',
            mpg_api_key: data.settings.mpg_api_key || 'mpg_live_f89a3c10b7d24e6a8e5c3b1a9f0d7e2c',
            mpg_webhook_secret: data.settings.mpg_webhook_secret || 'mandiri-private-gateway-secret-key-change-in-prod',
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
            totalServerTokens: data.totalServerTokens || 0,
          });
        }
      }
    } catch (e) {
      console.error('Failed to load monitoring:', e);
    } finally {
      setLoadingMonitoring(false);
    }
  };

  const handleDeleteGeneration = async (id: string, title?: string) => {
    if (!window.confirm(`Hapus log riwayat PRD "${title || id.slice(0, 8)}"?`)) return;

    try {
      setDeletingGenId(id);
      // Optimistic local update
      setMonitoringData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          recentGenerations: prev.recentGenerations.filter((g: any) => g.id !== id),
          totalGenerations: Math.max(0, (prev.totalGenerations || 1) - 1),
        };
      });

      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminHeaders(),
        },
        body: JSON.stringify({
          action: 'delete_generation',
          id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', 'Log riwayat PRD berhasil dihapus');
      } else {
        showToast('error', data.error || 'Gagal menghapus log');
        fetchMonitoring();
      }
    } catch (e: any) {
      showToast('error', e.message || 'Gagal menghapus log');
      fetchMonitoring();
    } finally {
      setDeletingGenId(null);
    }
  };

  const handleClearAllGenerations = async () => {
    if (
      !window.confirm(
        'Apakah Anda yakin ingin MENGHAPUS SEMUA riwayat log generate PRD? Tindakan ini tidak dapat dibatalkan.'
      )
    ) {
      return;
    }

    try {
      setClearingGenerations(true);
      // Optimistic local update
      setMonitoringData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          recentGenerations: [],
          totalGenerations: 0,
        };
      });

      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminHeaders(),
        },
        body: JSON.stringify({
          action: 'clear_all_generations',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', 'Semua riwayat log generasi berhasil dibersihkan');
      } else {
        showToast('error', data.error || 'Gagal membersihkan log');
        fetchMonitoring();
      }
    } catch (e: any) {
      showToast('error', e.message || 'Gagal membersihkan log');
      fetchMonitoring();
    } finally {
      setClearingGenerations(false);
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

  const handleTestMpg = async () => {
    try {
      setTestingMpg(true);
      setTestMpgResult(null);

      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          action: 'test_mpg_connection',
          gatewayUrl: settings.mpg_gateway_url,
          apiKey: settings.mpg_api_key,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTestMpgResult({
          success: true,
          message: data.message || `Koneksi Berhasil (${data.latencyMs ?? 0}ms)`,
          devicesCount: data.devicesCount,
          onlineDeviceCount: data.onlineDeviceCount,
        });
      } else {
        setTestMpgResult({
          success: false,
          message: data.error || 'Gagal terhubung ke Gateway Mandiri Private',
        });
      }
    } catch (e) {
      setTestMpgResult({
        success: false,
        message: 'Koneksi Gagal: ' + (e instanceof Error ? e.message : String(e)),
      });
    } finally {
      setTestingMpg(false);
    }
  };

  const handleApproveOrder = async (orderId: string, userId: string) => {
    if (!confirm('Apakah kamu sudah mencocokkan pembayaran di GoBiz dan yakin ingin mengaktifkan akun PRO (30 Hari) user ini?')) {
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
          durationDays: 30,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('success', 'Pesanan disetujui & Akun Pro telah aktif (30 Hari)!');
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

  const handleDeleteOrder = async (orderId: string, orderCode?: string) => {
    if (!confirm(`Hapus transaksi pesanan ${orderCode || orderId.slice(0, 8)} dari database?`)) {
      return;
    }

    try {
      setDeletingOrderId(orderId);
      // Optimistic local update
      setOrdersList((prev) => prev.filter((o) => o.id !== orderId));

      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          action: 'delete_order',
          orderId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('success', 'Pesanan berhasil dihapus');
      } else {
        showToast('error', data.error || 'Gagal menghapus pesanan');
        fetchOrders();
      }
    } catch (e: any) {
      showToast('error', e.message || 'Gagal menghapus pesanan');
      fetchOrders();
    } finally {
      setDeletingOrderId(null);
    }
  };

  const handleClearRejectedOrders = async () => {
    const rejectedCount = ordersList.filter((o) => o.status === 'rejected').length;
    if (rejectedCount === 0) {
      showToast('error', 'Tidak ada transaksi berstatus ditolak untuk dibersihkan');
      return;
    }

    if (!confirm(`Hapus permanen semua ${rejectedCount} transaksi berstatus ditolak?`)) {
      return;
    }

    try {
      setClearingRejectedOrders(true);
      // Optimistic local update
      setOrdersList((prev) => prev.filter((o) => o.status !== 'rejected'));

      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          action: 'clear_rejected_orders',
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('success', `${rejectedCount} pesanan ditolak berhasil dibersihkan`);
      } else {
        showToast('error', data.error || 'Gagal membersihkan pesanan ditolak');
        fetchOrders();
      }
    } catch (e: any) {
      showToast('error', e.message || 'Gagal membersihkan pesanan');
      fetchOrders();
    } finally {
      setClearingRejectedOrders(false);
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
          durationDays: 30,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('success', nextTier === 'pro' ? 'User diaktifkan PRO (30 Hari)' : 'Tier user diturunkan ke FREE');
        fetchUsers();
      } else {
        showToast('error', data.error || 'Gagal mengubah tier');
      }
    } catch (e) {
      console.error('Failed to toggle tier:', e);
      showToast('error', 'Terjadi kesalahan jaringan');
    }
  };

  const handleExtendUserPro = async (userId: string, days = 30) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          action: 'update_user_tier',
          userId,
          extendDays: days,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('success', `Masa aktif PRO berhasil diperpanjang +${days} hari`);
        fetchUsers();
      } else {
        showToast('error', data.error || 'Gagal memperpanjang durasi PRO');
      }
    } catch (e) {
      console.error('Failed to extend pro:', e);
      showToast('error', 'Terjadi kesalahan jaringan');
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

  const handleAssignGeminiSlot = async (userId: string, slotId: string | null) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          action: 'assign_gemini_slot',
          userId,
          slotId: slotId === 'auto' ? null : slotId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', slotId === 'auto' || !slotId ? 'Slot Gemini direset ke Auto / Global' : `Dedicated slot disetel ke ${slotId}`);
        fetchUsers();
      } else {
        showToast('error', data.error || 'Gagal mengatur slot user');
      }
    } catch {
      showToast('error', 'Gagal menghubungi server');
    }
  };

  const handleToggleUserBan = async (userId: string, currentBanned: boolean) => {
    const nextBanned = !currentBanned;
    const confirmMsg = nextBanned
      ? 'Apakah Anda yakin ingin MEMBLOKIR akun user ini? User tidak akan bisa generate PRD.'
      : 'Apakah Anda yakin ingin MEMBUKA BLOKIR akun user ini?';
    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          action: 'toggle_user_ban',
          userId,
          isBanned: nextBanned,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', nextBanned ? 'Akun user telah dinonaktifkan / diblokir' : 'Blokir akun user telah dicabut');
        fetchUsers();
      } else {
        showToast('error', data.error || 'Gagal mengubah status blokir');
      }
    } catch {
      showToast('error', 'Gagal menghubungi server');
    }
  };

  const handleSetUserTierWithDuration = async (
    userId: string,
    tier: 'free' | 'plus' | 'pro' | 'unlimited',
    durationDays?: number
  ) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          action: 'update_user_tier',
          userId,
          tier,
          durationDays,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const durationText = durationDays ? (durationDays > 3650 ? 'Lifetime' : `+${durationDays} Hari`) : '';
        showToast('success', `Tier user berhasil diubah ke ${tier.toUpperCase()} ${durationText}`);
        fetchUsers();
      } else {
        showToast('error', data.error || 'Gagal mengubah tier user');
      }
    } catch {
      showToast('error', 'Gagal menghubungi server');
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
    <div className={`min-h-screen flex font-sans transition-colors duration-200 ${adminTheme === 'light' ? 'admin-light bg-slate-50 text-slate-900' : 'bg-[#09090b] text-zinc-100'}`}>
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
      <aside className={`w-64 border-r flex flex-col justify-between shrink-0 hidden md:flex transition-colors ${adminTheme === 'light' ? 'border-slate-200 bg-white' : 'border-zinc-800/80 bg-[#0d0d10]'}`}>
        <div>
          {/* Logo & Brand */}
          <div className={`p-5 border-b ${adminTheme === 'light' ? 'border-slate-200' : 'border-zinc-800/80'}`}>
            <div className="flex items-center gap-2.5">
              <Link href="/" className="flex items-center gap-1.5">
                <span className={`font-extrabold tracking-tight text-lg ${adminTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  ngodingpake<span className={`${adminTheme === 'light' ? 'text-blue-600' : 'text-amber-500'} font-black`}>prd</span>
                </span>
              </Link>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className={`text-[10px] font-mono font-bold tracking-wider uppercase ${adminTheme === 'light' ? 'text-slate-500' : 'text-zinc-400'}`}>
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
                      ? adminTheme === 'light'
                        ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-xs'
                        : 'bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30 shadow-xs'
                      : adminTheme === 'light'
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? (adminTheme === 'light' ? 'text-blue-600' : 'text-amber-400') : (adminTheme === 'light' ? 'text-slate-400' : 'text-zinc-400')}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        tab.id === 'orders' && pendingOrders > 0
                          ? adminTheme === 'light' ? 'bg-blue-600 text-white animate-bounce' : 'bg-amber-500 text-zinc-950 animate-bounce'
                          : adminTheme === 'light' ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-zinc-800 text-zinc-400'
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
        <div className={`p-4 border-t text-[11px] space-y-2 ${adminTheme === 'light' ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-zinc-800/80 bg-zinc-950/40 text-zinc-400'}`}>
          <div className="flex items-center justify-between">
            <span className={adminTheme === 'light' ? 'text-slate-500' : 'text-zinc-500'}>Database:</span>
            <span className="text-emerald-500 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Supabase
            </span>
          </div>
          <Link
            href="/generator"
            className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-colors border ${
              adminTheme === 'light'
                ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-800'
            }`}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Ke Generator App</span>
          </Link>
        </div>
      </aside>

      {/* RIGHT MAIN VIEW */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className={`sticky top-0 z-30 border-b backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors ${
          adminTheme === 'light'
            ? 'border-slate-200 bg-white/90 shadow-xs'
            : 'border-zinc-800 bg-zinc-950/80'
        }`}>
          <div className="flex items-center gap-3">
            <h1 className={`text-base font-bold tracking-tight capitalize flex items-center gap-2 ${
              adminTheme === 'light' ? 'text-slate-900' : 'text-white'
            }`}>
              <span>{activeTab.replace('_', ' ')}</span>
            </h1>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Theme Switcher Toggle (Mode Terang vs Gelap) */}
            <button
              type="button"
              onClick={toggleAdminTheme}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border shadow-xs ${
                adminTheme === 'light'
                  ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800 hover:text-white'
              }`}
              title={adminTheme === 'light' ? 'Beralih ke Mode Gelap' : 'Beralih ke Mode Terang (Biru & Putih)'}
            >
              {adminTheme === 'light' ? (
                <>
                  <Moon className="h-3.5 w-3.5 text-blue-600" />
                  <span className="hidden sm:inline">Mode Gelap</span>
                </>
              ) : (
                <>
                  <Sun className="h-3.5 w-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Mode Terang</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-98 disabled:opacity-50 ${
                adminTheme === 'light'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                  : 'bg-amber-500 hover:bg-amber-400 text-zinc-950'
              }`}
            >
              {savingSettings ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </header>

        {/* Mobile Navigation Tabs */}
        <div className={`md:hidden flex items-center gap-1 border-b p-2 overflow-x-auto text-xs ${
          adminTheme === 'light' ? 'border-slate-200 bg-white' : 'border-zinc-800 bg-zinc-950'
        }`}>
          {['overview', 'switchboard', 'ai_engine', 'orders', 'users', 'pricing'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap capitalize ${
                activeTab === tab
                  ? adminTheme === 'light'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-amber-500 text-zinc-950 font-bold'
                  : adminTheme === 'light'
                  ? 'text-slate-600 hover:bg-slate-100'
                  : 'text-zinc-400'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Main Body */}
        <main className="p-4 sm:p-8 max-w-6xl w-full mx-auto space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (() => {
            const filteredGenerations = (monitoringData?.recentGenerations || []).filter((gen: any) => {
              if (genKeyFilter === 'server' && !gen.is_server_key) return false;
              if (genKeyFilter === 'byok' && gen.is_server_key) return false;
              if (genSearchQuery.trim()) {
                const q = genSearchQuery.toLowerCase().trim();
                const matchEmail = (gen.userEmail || '').toLowerCase().includes(q);
                const matchName = (gen.userName || '').toLowerCase().includes(q);
                const matchTitle = (gen.title || '').toLowerCase().includes(q);
                const matchModel = (gen.model_used || '').toLowerCase().includes(q);
                const matchSlot = (gen.gemini_slot_used || '').toLowerCase().includes(q);
                const matchId = (gen.id || '').toLowerCase().includes(q);
                return matchEmail || matchName || matchTitle || matchModel || matchSlot || matchId;
              }
              return true;
            });

            return (
              <div className="space-y-6">
                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className={`rounded-2xl border p-5 shadow-xs transition-colors ${adminTheme === 'light' ? 'border-slate-200 bg-white' : 'border-zinc-800/80 bg-zinc-950'}`}>
                    <div className="flex items-center justify-between text-zinc-400 mb-2">
                      <span className={`text-xs font-semibold ${adminTheme === 'light' ? 'text-slate-500' : 'text-zinc-400'}`}>Total Pengguna</span>
                      <Users className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className={`text-2xl font-black ${adminTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>{totalUsers}</div>
                    <div className={`text-[11px] mt-1 ${adminTheme === 'light' ? 'text-slate-500' : 'text-zinc-500'}`}>{proUsers} Pengguna PRO</div>
                  </div>

                  <div className={`rounded-2xl border p-5 shadow-xs transition-colors ${adminTheme === 'light' ? 'border-slate-200 bg-white' : 'border-zinc-800/80 bg-zinc-950'}`}>
                    <div className="flex items-center justify-between text-zinc-400 mb-2">
                      <span className={`text-xs font-semibold ${adminTheme === 'light' ? 'text-slate-500' : 'text-zinc-400'}`}>Pesanan QRIS Pending</span>
                      <Clock className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="text-2xl font-black text-amber-500">{pendingOrders}</div>
                    <div className={`text-[11px] mt-1 ${adminTheme === 'light' ? 'text-slate-500' : 'text-zinc-500'}`}>Perlu dicek di GoBiz</div>
                  </div>

                  <div className={`rounded-2xl border p-5 shadow-xs transition-colors ${adminTheme === 'light' ? 'border-slate-200 bg-white' : 'border-zinc-800/80 bg-zinc-950'}`}>
                    <div className="flex items-center justify-between text-zinc-400 mb-2">
                      <span className={`text-xs font-semibold ${adminTheme === 'light' ? 'text-slate-500' : 'text-zinc-400'}`}>Estimasi Pendapatan</span>
                      <DollarSign className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-black text-emerald-500">
                      Rp {totalRevenue.toLocaleString('id-ID')}
                    </div>
                    <div className={`text-[11px] mt-1 ${adminTheme === 'light' ? 'text-slate-500' : 'text-zinc-500'}`}>{approvedOrders} Transaksi Sukses</div>
                  </div>

                  <div className={`rounded-2xl border p-5 shadow-xs transition-colors ${adminTheme === 'light' ? 'border-slate-200 bg-white' : 'border-zinc-800/80 bg-zinc-950'}`}>
                    <div className="flex items-center justify-between text-zinc-400 mb-2">
                      <span className={`text-xs font-semibold ${adminTheme === 'light' ? 'text-slate-500' : 'text-zinc-400'}`}>Token Server Terpakai</span>
                      <Zap className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className={`text-2xl font-black font-mono ${adminTheme === 'light' ? 'text-blue-600' : 'text-amber-400'}`}>
                      {((monitoringData as any)?.totalServerTokens || 0).toLocaleString('id-ID')}
                    </div>
                    <div className={`text-[11px] mt-1 ${adminTheme === 'light' ? 'text-slate-500' : 'text-zinc-500'}`}>
                      ~{Math.round(((monitoringData as any)?.totalServerTokens || 0) / 6000)} PRD dari Kuota Admin
                    </div>
                  </div>

                  <div className={`rounded-2xl border p-5 shadow-xs transition-colors ${adminTheme === 'light' ? 'border-slate-200 bg-white' : 'border-zinc-800/80 bg-zinc-950'}`}>
                    <div className="flex items-center justify-between text-zinc-400 mb-2">
                      <span className={`text-xs font-semibold ${adminTheme === 'light' ? 'text-slate-500' : 'text-zinc-400'}`}>AI Provider Aktif</span>
                      <Cpu className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className={`text-lg font-black truncate uppercase ${adminTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                      {settings.ai_provider.replace('_', ' ')}
                    </div>
                    <div className={`text-[11px] mt-1 ${adminTheme === 'light' ? 'text-slate-500' : 'text-zinc-500'}`}>
                      {settings.api_key_mode === 'server_managed' ? 'Server-Managed (Trial 1x)' : 'BYOK (User Key)'}
                    </div>
                  </div>
                </div>

                {/* Quick Actions & Status */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className={`rounded-2xl border p-6 space-y-4 transition-colors ${adminTheme === 'light' ? 'border-slate-200 bg-white' : 'border-zinc-800/80 bg-zinc-950'}`}>
                    <h3 className={`text-sm font-bold flex items-center gap-2 ${adminTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                      <Radio className={`h-4 w-4 ${adminTheme === 'light' ? 'text-blue-600' : 'text-amber-400'}`} />
                      <span>Konfigurasi Cepat (Quick Switch)</span>
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div className={`flex items-center justify-between p-3 rounded-xl border ${adminTheme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-zinc-800/80 bg-zinc-900/50'}`}>
                        <div>
                          <div className={`font-semibold ${adminTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>Mode Akses Pengunjung</div>
                          <div className={`text-[11px] ${adminTheme === 'light' ? 'text-slate-500' : 'text-zinc-400'}`}>{settings.auth_mode}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab('switchboard')}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            adminTheme === 'light'
                              ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                          }`}
                        >
                          Ubah
                        </button>
                      </div>

                      <div className={`flex items-center justify-between p-3 rounded-xl border ${adminTheme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-zinc-800/80 bg-zinc-900/50'}`}>
                        <div>
                          <div className={`font-semibold ${adminTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>Mesin AI Pembuat PRD</div>
                          <div className={`text-[11px] ${adminTheme === 'light' ? 'text-slate-500' : 'text-zinc-400'}`}>{settings.ai_provider}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab('ai_engine')}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            adminTheme === 'light'
                              ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                          }`}
                        >
                          Kelola
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-2xl border p-6 space-y-3 transition-colors ${adminTheme === 'light' ? 'border-slate-200 bg-white' : 'border-zinc-800/80 bg-zinc-950'}`}>
                    <h3 className={`text-sm font-bold flex items-center gap-2 ${adminTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                      <Activity className="h-4 w-4 text-emerald-500" />
                      <span>Petunjuk Sinkronisasi GoBiz</span>
                    </h3>
                    <p className={`text-xs leading-relaxed ${adminTheme === 'light' ? 'text-slate-600' : 'text-zinc-400'}`}>
                      Saat pengguna memilih upgrade PRO dan melakukan scan QRIS GoPay, pesanan akan langsung muncul di tab <strong>GoBiz QRIS Orders</strong>. Buka aplikasi GoBiz di ponsel Anda, cocokkan nama pengirim/nominal, lalu klik tombol verifikasi.
                    </p>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('orders')}
                        className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                          adminTheme === 'light' ? 'text-blue-600 hover:text-blue-700' : 'text-amber-400 hover:text-amber-300'
                        }`}
                      >
                        <span>Buka Antrean Pesanan ({pendingOrders} Pending)</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live Generation & Active Users Activity Feed */}
                <div className={`rounded-2xl border p-5 sm:p-6 space-y-4 transition-colors ${adminTheme === 'light' ? 'border-slate-200 bg-white shadow-xs' : 'border-zinc-800/80 bg-zinc-950'}`}>
                  {/* Feed Header */}
                  <div className={`flex flex-wrap items-center justify-between gap-3 border-b pb-4 ${adminTheme === 'light' ? 'border-slate-200' : 'border-zinc-800'}`}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <div>
                        <h3 className={`text-sm font-bold flex items-center gap-2 ${adminTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                          <span>Live Generation & User Activity</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                            REAL-TIME
                          </span>
                        </h3>
                        <p className={`text-[11px] ${adminTheme === 'light' ? 'text-slate-500' : 'text-zinc-400'}`}>
                          Histori PRD yang digenerate oleh pengguna ({monitoringData?.totalGenerations || 0} total tercatat di database).
                        </p>
                      </div>
                    </div>

                    {/* Header Action Buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Tombol Hapus Semua Log */}
                      <button
                        type="button"
                        onClick={handleClearAllGenerations}
                        disabled={clearingGenerations || !monitoringData?.recentGenerations || monitoringData.recentGenerations.length === 0}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                          adminTheme === 'light'
                            ? 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
                            : 'bg-red-950/40 hover:bg-red-900/50 text-red-400 border-red-800/50'
                        }`}
                        title="Hapus seluruh log riwayat generate PRD"
                      >
                        <Trash2 className={`h-3.5 w-3.5 ${clearingGenerations ? 'animate-spin' : ''}`} />
                        <span>{clearingGenerations ? 'Membersihkan...' : 'Bersihkan Semua'}</span>
                      </button>

                      {/* Tombol Refresh Feed */}
                      <button
                        type="button"
                        onClick={fetchMonitoring}
                        disabled={loadingMonitoring}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                          adminTheme === 'light'
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                            : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
                        }`}
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${loadingMonitoring ? 'animate-spin' : ''}`} />
                        <span>Perbarui</span>
                      </button>
                    </div>
                  </div>

                  {/* Search & Key Filter Bar for Efficiency */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="relative flex-1 min-w-[220px] max-w-md">
                      <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${adminTheme === 'light' ? 'text-slate-400' : 'text-zinc-500'}`} />
                      <input
                        type="text"
                        value={genSearchQuery}
                        onChange={(e) => setGenSearchQuery(e.target.value)}
                        placeholder="Cari user, email, judul PRD, model..."
                        className={`w-full pl-9 pr-3 py-1.5 rounded-xl text-xs border transition-all ${
                          adminTheme === 'light'
                            ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500'
                            : 'bg-zinc-900/90 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-amber-500'
                        }`}
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-medium mr-1 ${adminTheme === 'light' ? 'text-slate-500' : 'text-zinc-500'}`}>Filter Kunci:</span>
                      {[
                        { id: 'all', label: `Semua (${monitoringData?.recentGenerations?.length || 0})` },
                        { id: 'server', label: 'Server Key' },
                        { id: 'byok', label: 'BYOK' },
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setGenKeyFilter(f.id as any)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                            genKeyFilter === f.id
                              ? adminTheme === 'light'
                                ? 'bg-blue-600 text-white'
                                : 'bg-amber-500 text-zinc-950 font-bold'
                              : adminTheme === 'light'
                              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              : 'bg-zinc-900 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Table with Compact Rows & Delete Button */}
                  <div className={`overflow-x-auto rounded-xl border ${adminTheme === 'light' ? 'border-slate-200 bg-white' : 'border-zinc-800 bg-zinc-950'}`}>
                    <table className="w-full text-left text-xs">
                      <thead className={`uppercase text-[10px] tracking-wider border-b ${
                        adminTheme === 'light' ? 'bg-slate-100/90 text-slate-600 border-slate-200' : 'bg-zinc-900/70 text-zinc-400 border-zinc-800'
                      }`}>
                        <tr>
                          <th className="px-3.5 py-2.5 font-semibold w-[22%] min-w-[170px]">
                            User / Akun
                          </th>
                          <th className="px-3.5 py-2.5 font-semibold w-[26%] min-w-[210px]">
                            Judul Dokumen PRD
                          </th>
                          <th className="px-3.5 py-2.5 font-semibold w-[18%] min-w-[140px]">
                            Mesin AI & Slot
                          </th>
                          <th className="px-3.5 py-2.5 font-semibold w-[13%] min-w-[110px]">
                            Token
                          </th>
                          <th className="px-3.5 py-2.5 font-semibold w-[7%] min-w-[70px]">
                            Tier
                          </th>
                          <th className="px-3.5 py-2.5 font-semibold text-right w-[8%] min-w-[75px]">
                            Waktu
                          </th>
                          <th className="px-3.5 py-2.5 font-semibold text-center w-[6%] min-w-[60px]">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y text-xs ${
                        adminTheme === 'light' ? 'divide-slate-200 text-slate-800' : 'divide-zinc-800/60 text-zinc-300'
                      }`}>
                        {filteredGenerations.length === 0 ? (
                          <tr>
                            <td colSpan={7} className={`px-4 py-8 text-center font-medium ${adminTheme === 'light' ? 'text-slate-400' : 'text-zinc-500'}`}>
                              {genSearchQuery ? 'Tidak ada hasil yang cocok dengan pencarian.' : 'Belum ada aktivitas generate PRD yang tercatat.'}
                            </td>
                          </tr>
                        ) : (
                          filteredGenerations.map((gen: any) => (
                            <tr
                              key={gen.id}
                              className={`transition-colors ${
                                adminTheme === 'light' ? 'hover:bg-blue-50/40' : 'hover:bg-zinc-900/40'
                              }`}
                            >
                              {/* User Account */}
                              <td className="px-3.5 py-2.5 align-middle">
                                <div className="flex items-center gap-2">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 select-none ${
                                    adminTheme === 'light'
                                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                      : 'bg-zinc-800/90 text-amber-400 border border-zinc-700/50'
                                  }`}>
                                    {(gen.userName || gen.userEmail || 'U').charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <div className={`font-semibold truncate max-w-[160px] ${adminTheme === 'light' ? 'text-slate-900' : 'text-white'}`} title={gen.userEmail}>
                                      {gen.userEmail}
                                    </div>
                                    <div className={`text-[10px] truncate max-w-[160px] ${adminTheme === 'light' ? 'text-slate-500' : 'text-zinc-500'}`} title={gen.userName}>
                                      {gen.userName || 'Guest / Tamu'}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Judul PRD */}
                              <td className="px-3.5 py-2.5 align-middle">
                                <div
                                  className={`font-semibold truncate max-w-[220px] transition-colors ${
                                    adminTheme === 'light'
                                      ? 'text-blue-700 hover:text-blue-800'
                                      : 'text-amber-300/90 hover:text-amber-200'
                                  }`}
                                  title={gen.title}
                                >
                                  {gen.title}
                                </div>
                                <div className={`text-[10px] font-mono ${adminTheme === 'light' ? 'text-slate-400' : 'text-zinc-500'}`}>
                                  ID: {gen.id.slice(0, 8)}...
                                </div>
                              </td>

                              {/* Mesin AI & Slot Key */}
                              <td className="px-3.5 py-2.5 align-middle">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-medium border ${
                                    adminTheme === 'light'
                                      ? 'bg-slate-100 text-slate-700 border-slate-200'
                                      : 'bg-zinc-900 text-zinc-300 border-zinc-800'
                                  }`}>
                                    {gen.model_used || 'AI Engine'}
                                  </span>
                                  {gen.gemini_slot_used && (
                                    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-mono font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/30">
                                      {gen.gemini_slot_used}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Token Consumption */}
                              <td className="px-3.5 py-2.5 align-middle">
                                <div className="flex items-center gap-1.5">
                                  <span className={`font-mono text-xs font-bold ${adminTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                                    {(gen.tokens_used || 0).toLocaleString('id-ID')}
                                  </span>
                                  <span
                                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                                      gen.is_server_key
                                        ? adminTheme === 'light'
                                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                        : 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                                    }`}
                                  >
                                    {gen.is_server_key ? 'Server' : 'BYOK'}
                                  </span>
                                </div>
                              </td>

                              {/* Tier */}
                              <td className="px-3.5 py-2.5 align-middle">
                                <span
                                  className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase font-mono tracking-wide ${
                                    gen.userTier === 'pro'
                                      ? adminTheme === 'light'
                                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                      : gen.userTier === 'plus'
                                      ? 'bg-sky-100 text-sky-700 border border-sky-300'
                                      : adminTheme === 'light'
                                      ? 'bg-slate-100 text-slate-600 border border-slate-200'
                                      : 'bg-zinc-800/90 text-zinc-400 border border-zinc-700/50'
                                  }`}
                                >
                                  {gen.userTier || 'FREE'}
                                </span>
                              </td>

                              {/* Timestamp */}
                              <td className={`px-3.5 py-2.5 text-right font-mono text-[11px] align-middle ${
                                adminTheme === 'light' ? 'text-slate-500' : 'text-zinc-400'
                              }`}>
                                {gen.created_at
                                  ? new Date(gen.created_at).toLocaleTimeString('id-ID', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      second: '2-digit',
                                    })
                                  : '—'}
                              </td>

                              {/* Action: Delete Single Generation */}
                              <td className="px-3.5 py-2.5 text-center align-middle">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteGeneration(gen.id, gen.title)}
                                  disabled={deletingGenId === gen.id}
                                  title="Hapus log riwayat ini"
                                  className={`p-1.5 rounded-lg transition-colors inline-flex items-center justify-center disabled:opacity-40 ${
                                    adminTheme === 'light'
                                      ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                                      : 'text-zinc-400 hover:text-red-400 hover:bg-red-950/40'
                                  }`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

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

                {/* Announcement Banner System */}
                <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5 space-y-4 md:col-span-3">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                      <Radio className="h-4 w-4" />
                      <span>Announcement & Promo Banner (Live Bar Atas)</span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.announcement_banner?.active || settings.announcement_banner?.isActive || false}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            announcement_banner: {
                              ...(settings.announcement_banner || {
                                message: '',
                                type: 'promo',
                                dismissible: true,
                              }),
                              active: e.target.checked,
                              isActive: e.target.checked,
                            },
                          })
                        }
                        className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500 h-4 w-4"
                      />
                      <span className="text-xs font-semibold text-white">
                        {settings.announcement_banner?.active || settings.announcement_banner?.isActive ? 'Banner Aktif (Tampil di Web)' : 'Banner Nonaktif'}
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="md:col-span-2">
                      <label className="text-zinc-400 block mb-1">Teks Pesan / Pengumuman Promo:</label>
                      <input
                        type="text"
                        value={settings.announcement_banner?.message || ''}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            announcement_banner: {
                              ...(settings.announcement_banner || {
                                active: false,
                                isActive: false,
                                type: 'promo',
                                dismissible: true,
                              }),
                              active: settings.announcement_banner?.active || false,
                              isActive: settings.announcement_banner?.isActive || false,
                              message: e.target.value,
                            },
                          })
                        }
                        placeholder="Diskon Spesial! Dapatkan paket PLUS Rp 25.000 atau PRO Rp 49.000 hari ini."
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-white focus:border-amber-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 block mb-1">Tipe Tampilan:</label>
                      <select
                        value={settings.announcement_banner?.type || 'promo'}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            announcement_banner: {
                              ...(settings.announcement_banner || {
                                active: false,
                                isActive: false,
                                message: '',
                                dismissible: true,
                              }),
                              active: settings.announcement_banner?.active || false,
                              isActive: settings.announcement_banner?.isActive || false,
                              type: e.target.value as any,
                            },
                          })
                        }
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-white focus:border-amber-500 focus:outline-hidden"
                      >
                        <option value="promo">Promo (Warna Emas / Amber)</option>
                        <option value="info">Info Pengumuman (Warna Biru)</option>
                        <option value="warning">Peringatan / Maintenance (Warna Merah)</option>
                      </select>
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

                {/* Global Pin Selector */}
                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-400" />
                      <span>Global Default Gemini Slot Routing</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Tentukan slot default untuk seluruh user umum yang tidak memiliki dedicated slot assignment.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={settings.global_gemini_slot || 'auto'}
                      onChange={(e) => setSettings({ ...settings, global_gemini_slot: e.target.value })}
                      className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-amber-400 font-semibold focus:outline-hidden"
                    >
                      <option value="auto">Otomatis (Load Balance antar slot aktif)</option>
                      {(settings.gemini_slots || DEFAULT_10_SLOTS).map((s) => (
                        <option key={s.id} value={s.id} disabled={!s.isActive || !s.key.trim()}>
                          {s.label || `Slot ${s.id}`} {!s.isActive || !s.key.trim() ? '(Nonaktif / Kosong)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Slots List */}
                <div className="space-y-3">
                  {(settings.gemini_slots || DEFAULT_10_SLOTS).map((slot, index) => {
                    const isKeyVisible = showKeyMap[slot.id] || false;
                    const isTestingThis = testingSlotId === slot.id;
                    const assignedUsers = usersList.filter((u: any) => u.assigned_gemini_slot === slot.id);

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

                        {/* Model Configuration & Assigned Users Panel */}
                        <div className="mt-3.5 pt-3 border-t border-zinc-800/60 grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {/* Preferred Model Dropdown */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-[11px] font-semibold text-zinc-300">
                                Model Gemini Prioritas Slot Ini:
                              </label>
                              {slot.preferredModel && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                  Aktif: {slot.preferredModel}
                                </span>
                              )}
                            </div>
                            <select
                              value={slot.preferredModel || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = (settings.gemini_slots || DEFAULT_10_SLOTS).map((s) =>
                                  s.id === slot.id ? { ...s, preferredModel: val || undefined } : s
                                );
                                setSettings({ ...settings, gemini_slots: updated });
                              }}
                              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-200 font-mono focus:border-amber-400 focus:outline-none"
                            >
                              <option value="">Default Otomatis (gemini-2.5-flash)</option>
                              {slot.models && slot.models.length > 0 && (
                                <optgroup label="Model Terdeteksi di Slot Ini">
                                  {slot.models.map((m) => (
                                    <option key={m} value={m}>
                                      {m}
                                    </option>
                                  ))}
                                </optgroup>
                              )}
                              <optgroup label="Model Standar Gemini">
                                <option value="gemini-2.5-flash">gemini-2.5-flash (Cepat & Direkomendasikan)</option>
                                <option value="gemini-2.5-pro">gemini-2.5-pro (Penalaran Kompleks)</option>
                                <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                                <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                                <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                              </optgroup>
                            </select>
                            <p className="text-[10px] text-zinc-500 mt-1">
                              Model spesifik yang dieksekusi saat user dialokasikan ke slot ini.
                            </p>
                          </div>

                          {/* Assigned Users */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[11px] font-semibold text-zinc-300">
                                User Sistem Terdaftar di Slot Ini:
                              </span>
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                                {assignedUsers.length} User
                              </span>
                            </div>
                            {assignedUsers.length === 0 ? (
                              <div className="text-[11px] text-zinc-500 bg-zinc-950/60 rounded-xl p-2.5 border border-zinc-800/60 leading-relaxed">
                                Belum ada user yang di-assign khusus. Slot ini melayani user umum secara load-balanced.
                              </div>
                            ) : (
                              <div className="max-h-24 overflow-y-auto space-y-1.5 bg-zinc-950/60 rounded-xl p-2 border border-zinc-800/60">
                                {assignedUsers.map((u: any) => (
                                  <div
                                    key={u.id}
                                    className="flex items-center justify-between text-[11px] text-zinc-300 bg-zinc-900/60 px-2 py-1 rounded-lg"
                                  >
                                    <span className="truncate max-w-[180px] font-mono text-zinc-200" title={u.email}>
                                      {u.email}
                                    </span>
                                    <span
                                      className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold font-mono ${
                                        u.subscription_tier === 'pro'
                                          ? 'bg-amber-500/20 text-amber-400'
                                          : u.subscription_tier === 'plus'
                                          ? 'bg-blue-500/20 text-blue-400'
                                          : 'bg-zinc-800 text-zinc-400'
                                      }`}
                                    >
                                      {u.subscription_tier || 'free'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* All Detected Models (Full Display - No Truncation) */}
                        {slot.models && slot.models.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-zinc-800/40">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[11px] font-semibold text-zinc-400">
                                Semua Model Terdeteksi ({slot.models.length} Model):
                              </span>
                              <span className="text-[10px] text-zinc-500">
                                Klik model untuk mengaktifkannya di slot ini
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 max-h-36 overflow-y-auto p-2 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
                              {slot.models.map((m, mIdx) => {
                                const isSelected = slot.preferredModel === m;
                                return (
                                  <button
                                    key={mIdx}
                                    type="button"
                                    onClick={() => {
                                      const updated = (settings.gemini_slots || DEFAULT_10_SLOTS).map((s) =>
                                        s.id === slot.id ? { ...s, preferredModel: isSelected ? undefined : m } : s
                                      );
                                      setSettings({ ...settings, gemini_slots: updated });
                                    }}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-mono border transition-all cursor-pointer ${
                                      isSelected
                                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-bold shadow-xs'
                                        : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-zinc-200'
                                    }`}
                                    title={`Klik untuk ${isSelected ? 'kembalikan ke default' : 'tetapkan sebagai model slot ini'}`}
                                  >
                                    {m} {isSelected ? '(Terpilih)' : ''}
                                  </button>
                                );
                              })}
                            </div>
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
          {activeTab === 'orders' && (() => {
            const totalOrdersCount = ordersList.length;
            const pendingOrdersCount = ordersList.filter((o) => o.status === 'pending').length;
            const approvedOrdersCount = ordersList.filter((o) => o.status === 'approved').length;
            const rejectedOrdersCount = ordersList.filter((o) => o.status === 'rejected').length;
            const totalApprovedRevenue = ordersList
              .filter((o) => o.status === 'approved')
              .reduce((acc, curr) => acc + (curr.amount || 0), 0);

            const filteredOrders = ordersList.filter((order) => {
              if (orderFilter !== 'all' && order.status !== orderFilter) return false;
              if (orderSearchQuery.trim()) {
                const q = orderSearchQuery.toLowerCase().trim();
                const matchCode = (order.order_code || '').toLowerCase().includes(q);
                const matchEmail = (order.user_email || '').toLowerCase().includes(q);
                const matchName = (order.user_name || '').toLowerCase().includes(q);
                return matchCode || matchEmail || matchName;
              }
              return true;
            });

            return (
              <div className="space-y-6">
                {/* Info Panduan GoBiz */}
                <div className={`rounded-2xl border p-4.5 flex items-start gap-3.5 transition-colors ${
                  adminTheme === 'light'
                    ? 'border-blue-200 bg-blue-50/70 text-slate-800'
                    : 'border-amber-500/30 bg-amber-500/5 text-zinc-300'
                }`}>
                  <CreditCard className={`h-5 w-5 shrink-0 mt-0.5 ${adminTheme === 'light' ? 'text-blue-600' : 'text-amber-400'}`} />
                  <div className="text-xs space-y-1">
                    <div className={`font-bold text-sm ${adminTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                      Panduan Verifikasi Pembayaran GoBiz
                    </div>
                    <p className={`leading-relaxed ${adminTheme === 'light' ? 'text-slate-600' : 'text-zinc-400'}`}>
                      1. Pelanggan menyelesaikan pembayaran QRIS dan mengirim konfirmasi ke sistem (status <span className={`font-bold ${adminTheme === 'light' ? 'text-amber-600' : 'text-amber-400'}`}>PENDING</span>).<br />
                      2. Verifikasi mutasi pembayaran di aplikasi GoBiz / Rekening Bank penerima.<br />
                      3. Klik tombol <strong className="text-emerald-600 font-bold">[ Terima ]</strong> untuk mengaktifkan akun PRO seketika, atau <strong className="text-red-500 font-bold">[ Hapus ]</strong> untuk membersihkan data uji coba/batal.
                    </p>
                  </div>
                </div>

                {/* Mini Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div className={`p-4 rounded-xl border transition-all ${
                    adminTheme === 'light'
                      ? 'border-slate-200 bg-white text-slate-900 shadow-xs'
                      : 'border-zinc-800 bg-zinc-950 text-white'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-semibold uppercase tracking-wider ${
                        adminTheme === 'light' ? 'text-slate-500' : 'text-zinc-400'
                      }`}>Total Antrean</span>
                      <CreditCard className={`h-4 w-4 ${adminTheme === 'light' ? 'text-blue-600' : 'text-zinc-400'}`} />
                    </div>
                    <div className="mt-2 text-2xl font-black font-mono">
                      {totalOrdersCount}
                    </div>
                    <div className={`mt-0.5 text-[10px] ${adminTheme === 'light' ? 'text-slate-500' : 'text-zinc-500'}`}>
                      Semua data transaksi tersimpan
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border transition-all ${
                    pendingOrdersCount > 0
                      ? adminTheme === 'light'
                        ? 'border-amber-300 bg-amber-50/50 text-slate-900 shadow-xs'
                        : 'border-amber-500/40 bg-amber-500/5 text-white'
                      : adminTheme === 'light'
                      ? 'border-slate-200 bg-white text-slate-900 shadow-xs'
                      : 'border-zinc-800 bg-zinc-950 text-white'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-semibold uppercase tracking-wider ${
                        pendingOrdersCount > 0
                          ? adminTheme === 'light' ? 'text-amber-700 font-bold' : 'text-amber-400 font-bold'
                          : adminTheme === 'light' ? 'text-slate-500' : 'text-zinc-400'
                      }`}>Perlu Tindakan</span>
                      <Clock className={`h-4 w-4 ${pendingOrdersCount > 0 ? 'text-amber-500 animate-pulse' : 'text-zinc-400'}`} />
                    </div>
                    <div className={`mt-2 text-2xl font-black font-mono ${pendingOrdersCount > 0 ? 'text-amber-600' : ''}`}>
                      {pendingOrdersCount}
                    </div>
                    <div className={`mt-0.5 text-[10px] ${
                      pendingOrdersCount > 0
                        ? adminTheme === 'light' ? 'text-amber-700 font-semibold' : 'text-amber-400 font-semibold'
                        : adminTheme === 'light' ? 'text-slate-500' : 'text-zinc-500'
                    }`}>
                      {pendingOrdersCount > 0 ? 'Menunggu verifikasi admin' : 'Tidak ada antrean pending'}
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border transition-all ${
                    adminTheme === 'light'
                      ? 'border-slate-200 bg-white text-slate-900 shadow-xs'
                      : 'border-zinc-800 bg-zinc-950 text-white'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-semibold uppercase tracking-wider ${
                        adminTheme === 'light' ? 'text-slate-500' : 'text-zinc-400'
                      }`}>Disetujui</span>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="mt-2 text-2xl font-black font-mono text-emerald-600">
                      {approvedOrdersCount}
                    </div>
                    <div className={`mt-0.5 text-[10px] font-mono ${adminTheme === 'light' ? 'text-slate-500' : 'text-zinc-500'}`}>
                      Total: Rp {totalApprovedRevenue.toLocaleString('id-ID')}
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border transition-all ${
                    adminTheme === 'light'
                      ? 'border-slate-200 bg-white text-slate-900 shadow-xs'
                      : 'border-zinc-800 bg-zinc-950 text-white'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-semibold uppercase tracking-wider ${
                        adminTheme === 'light' ? 'text-slate-500' : 'text-zinc-400'
                      }`}>Ditolak</span>
                      <XCircle className="h-4 w-4 text-rose-500" />
                    </div>
                    <div className="mt-2 text-2xl font-black font-mono text-rose-600">
                      {rejectedOrdersCount}
                    </div>
                    <div className={`mt-0.5 text-[10px] ${adminTheme === 'light' ? 'text-slate-500' : 'text-zinc-500'}`}>
                      Tidak diverifikasi / kedaluwarsa
                    </div>
                  </div>
                </div>

                {/* Main Orders Table Card */}
                <div className={`rounded-2xl border overflow-hidden transition-colors ${
                  adminTheme === 'light' ? 'border-slate-200 bg-white shadow-xs' : 'border-zinc-800/80 bg-zinc-950'
                }`}>
                  {/* Toolbar Filter, Search, & Actions */}
                  <div className={`p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    adminTheme === 'light' ? 'border-slate-200 bg-slate-50/70' : 'border-zinc-800 bg-zinc-900/40'
                  }`}>
                    {/* Status Tabs Filter */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setOrderFilter('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          orderFilter === 'all'
                            ? adminTheme === 'light'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-white text-zinc-950 font-bold shadow-xs'
                            : adminTheme === 'light'
                            ? 'text-slate-600 hover:bg-slate-200/70'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                        }`}
                      >
                        Semua ({totalOrdersCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderFilter('pending')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                          orderFilter === 'pending'
                            ? adminTheme === 'light'
                              ? 'bg-amber-500 text-white shadow-xs font-bold'
                              : 'bg-amber-500 text-zinc-950 shadow-xs font-bold'
                            : adminTheme === 'light'
                            ? 'text-amber-700 hover:bg-amber-100/70'
                            : 'text-amber-400 hover:bg-amber-500/10'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${pendingOrdersCount > 0 ? 'bg-amber-400 animate-pulse' : 'bg-amber-400/40'}`} />
                        <span>Pending ({pendingOrdersCount})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderFilter('approved')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                          orderFilter === 'approved'
                            ? adminTheme === 'light'
                              ? 'bg-emerald-600 text-white shadow-xs font-bold'
                              : 'bg-emerald-500 text-zinc-950 shadow-xs font-bold'
                            : adminTheme === 'light'
                            ? 'text-emerald-700 hover:bg-emerald-100/70'
                            : 'text-emerald-400 hover:bg-emerald-500/10'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>Disetujui ({approvedOrdersCount})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderFilter('rejected')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                          orderFilter === 'rejected'
                            ? adminTheme === 'light'
                              ? 'bg-rose-600 text-white shadow-xs font-bold'
                              : 'bg-rose-500 text-white shadow-xs font-bold'
                            : adminTheme === 'light'
                            ? 'text-rose-700 hover:bg-rose-100/70'
                            : 'text-rose-400 hover:bg-rose-500/10'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span>Ditolak ({rejectedOrdersCount})</span>
                      </button>
                    </div>

                    {/* Right Toolbar: Search & Action Buttons */}
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1 md:w-56">
                        <Search className={`absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${
                          adminTheme === 'light' ? 'text-slate-400' : 'text-zinc-500'
                        }`} />
                        <input
                          type="text"
                          value={orderSearchQuery}
                          onChange={(e) => setOrderSearchQuery(e.target.value)}
                          placeholder="Cari order / email..."
                          className={`w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border transition-all ${
                            adminTheme === 'light'
                              ? 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:border-amber-500'
                          }`}
                        />
                      </div>

                      {/* Tombol Bersihkan Ditolak */}
                      {rejectedOrdersCount > 0 && (
                        <button
                          type="button"
                          onClick={handleClearRejectedOrders}
                          disabled={clearingRejectedOrders}
                          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                            adminTheme === 'light'
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 active:scale-95'
                              : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30 active:scale-95'
                          }`}
                          title="Hapus semua transaksi berstatus ditolak"
                        >
                          <Trash2 className="h-3.5 w-3.5 shrink-0" />
                          <span className="hidden sm:inline">Bersihkan Ditolak</span>
                        </button>
                      )}

                      {/* Tombol Refresh */}
                      <button
                        type="button"
                        onClick={fetchOrders}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                          adminTheme === 'light'
                            ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 active:scale-95'
                            : 'text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border-zinc-800 active:scale-95'
                        }`}
                        title="Perbarui daftar transaksi"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${loadingData ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                      </button>
                    </div>
                  </div>

                  {/* Responsive Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className={`uppercase text-[10px] tracking-wider border-b ${
                        adminTheme === 'light'
                          ? 'bg-slate-100/90 text-slate-600 border-slate-200'
                          : 'bg-zinc-900/60 text-zinc-400 border-zinc-800'
                      }`}>
                        <tr>
                          <th className="px-4 py-3 font-semibold w-[18%] min-w-[130px]">
                            Kode Order
                          </th>
                          <th className="px-4 py-3 font-semibold w-[26%] min-w-[190px]">
                            Pelanggan
                          </th>
                          <th className="px-4 py-3 font-semibold w-[18%] min-w-[140px]">
                            Paket & Nominal
                          </th>
                          <th className="px-4 py-3 font-semibold w-[12%] min-w-[100px]">
                            Status
                          </th>
                          <th className="px-4 py-3 font-semibold w-[12%] min-w-[110px]">
                            Waktu
                          </th>
                          <th className="px-4 py-3 font-semibold text-right w-[14%] min-w-[130px]">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y text-xs ${
                        adminTheme === 'light' ? 'divide-slate-200 text-slate-800' : 'divide-zinc-800/60 text-zinc-300'
                      }`}>
                        {filteredOrders.length === 0 ? (
                          <tr>
                            <td colSpan={6} className={`px-4 py-12 text-center font-medium ${
                              adminTheme === 'light' ? 'text-slate-400' : 'text-zinc-500'
                            }`}>
                              <div className="flex flex-col items-center justify-center gap-1.5">
                                <CreditCard className="h-7 w-7 opacity-40 mb-1" />
                                <div>
                                  {orderSearchQuery || orderFilter !== 'all'
                                    ? 'Tidak ada transaksi yang cocok dengan filter atau pencarian saat ini.'
                                    : 'Belum ada data transaksi QRIS yang tersimpan di sistem.'}
                                </div>
                                {(orderSearchQuery || orderFilter !== 'all') && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOrderFilter('all');
                                      setOrderSearchQuery('');
                                    }}
                                    className={`mt-1 text-xs font-semibold underline underline-offset-4 ${
                                      adminTheme === 'light' ? 'text-blue-600' : 'text-amber-400'
                                    }`}
                                  >
                                    Reset filter dan pencarian
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredOrders.map((order) => {
                            const isPlus = order.amount <= 30000 || (order.admin_notes && order.admin_notes.toLowerCase().includes('plus'));
                            const isDeleting = deletingOrderId === order.id;

                            return (
                              <tr
                                key={order.id}
                                className={`transition-colors ${
                                  adminTheme === 'light' ? 'hover:bg-blue-50/40' : 'hover:bg-zinc-900/40'
                                }`}
                              >
                                {/* Order Code */}
                                <td className="px-4 py-3.5 align-middle">
                                  <span className={`px-2.5 py-1 rounded-md font-mono font-bold tracking-wider inline-block text-[11px] ${
                                    adminTheme === 'light'
                                      ? 'text-blue-700 bg-blue-50 border border-blue-200'
                                      : 'text-amber-400 bg-zinc-900 border border-zinc-800'
                                  }`}>
                                    {order.order_code}
                                  </span>
                                </td>

                                {/* User Info */}
                                <td className="px-4 py-3.5 align-middle">
                                  <div className="flex items-center gap-2.5">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 select-none ${
                                      adminTheme === 'light'
                                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                        : 'bg-zinc-800/80 border border-zinc-700/50 text-amber-400'
                                    }`}>
                                      {(order.user_name || order.user_email || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                      <div className={`font-semibold truncate max-w-[180px] ${
                                        adminTheme === 'light' ? 'text-slate-900' : 'text-white'
                                      }`} title={order.user_name || 'User'}>
                                        {order.user_name || 'User'}
                                      </div>
                                      <div className={`text-[11px] font-mono truncate max-w-[180px] ${
                                        adminTheme === 'light' ? 'text-slate-500' : 'text-zinc-400'
                                      }`} title={order.user_email}>
                                        {order.user_email}
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {/* Amount & Tier */}
                                <td className="px-4 py-3.5 align-middle">
                                  <div className={`font-semibold text-xs font-mono ${
                                    adminTheme === 'light' ? 'text-slate-900' : 'text-white'
                                  }`}>
                                    {order.amount_formatted || `Rp ${(order.amount || 0).toLocaleString('id-ID')}`}
                                  </div>
                                  <span
                                    className={`text-[9px] font-bold uppercase font-mono px-1.5 py-0.5 rounded inline-block mt-0.5 ${
                                      isPlus
                                        ? adminTheme === 'light'
                                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                        : adminTheme === 'light'
                                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    }`}
                                  >
                                    {isPlus ? 'Paket PLUS' : 'Paket PRO'}
                                  </span>
                                </td>

                                {/* Status */}
                                <td className="px-4 py-3.5 align-middle">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                                      order.status === 'approved'
                                        ? adminTheme === 'light'
                                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                        : order.status === 'rejected'
                                        ? adminTheme === 'light'
                                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                        : adminTheme === 'light'
                                        ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse'
                                    }`}
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ${
                                        order.status === 'approved'
                                          ? 'bg-emerald-500'
                                          : order.status === 'rejected'
                                          ? 'bg-rose-500'
                                          : 'bg-amber-500'
                                      }`}
                                    />
                                    <span>{order.status}</span>
                                  </span>
                                </td>

                                {/* Date */}
                                <td className={`px-4 py-3.5 align-middle font-mono text-[11px] ${
                                  adminTheme === 'light' ? 'text-slate-500' : 'text-zinc-400'
                                }`}>
                                  {order.created_at ? new Date(order.created_at).toLocaleString('id-ID', {
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }) : '-'}
                                </td>

                                {/* Actions */}
                                <td className="px-4 py-3.5 align-middle text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {order.status === 'pending' && (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => handleApproveOrder(order.id, order.user_id)}
                                          className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
                                          title="Setujui order dan aktifkan akun PRO 30 hari"
                                        >
                                          Terima
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleRejectOrder(order.id)}
                                          className={`px-2 py-1 rounded-lg font-medium text-xs border transition-all cursor-pointer ${
                                            adminTheme === 'light'
                                              ? 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border-slate-300 hover:border-rose-300'
                                              : 'bg-zinc-900 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 border-zinc-800 hover:border-rose-500/30'
                                          }`}
                                          title="Tolak order"
                                        >
                                          Tolak
                                        </button>
                                      </>
                                    )}

                                    {/* Tombol Hapus Pesanan */}
                                    <button
                                      type="button"
                                      disabled={isDeleting}
                                      onClick={() => handleDeleteOrder(order.id, order.order_code)}
                                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                        adminTheme === 'light'
                                          ? 'bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border-slate-200 hover:border-rose-300 active:scale-95'
                                          : 'bg-zinc-900 hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 border-zinc-800 hover:border-rose-500/30 active:scale-95'
                                      } ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                      title="Hapus transaksi pesanan ini"
                                    >
                                      <Trash2 className={`h-3.5 w-3.5 ${isDeleting ? 'animate-spin' : ''}`} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TAB 5: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className={`rounded-2xl border overflow-hidden transition-colors ${
                adminTheme === 'light' ? 'border-slate-200 bg-white shadow-xs' : 'border-zinc-800/80 bg-zinc-950'
              }`}>
                {/* Status Filter Header */}
                <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
                  adminTheme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-zinc-800'
                }`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs font-bold uppercase tracking-wider mr-1 ${
                      adminTheme === 'light' ? 'text-slate-600' : 'text-zinc-400'
                    }`}>
                      Filter:
                    </span>
                    {[
                      { id: 'all', label: `Semua (${usersList.length})` },
                      {
                        id: 'active',
                        label: `PRO/PLUS Aktif (${
                          usersList.filter(
                            (u: any) =>
                              (u.subscription_tier === 'pro' ||
                                u.subscription_tier === 'plus' ||
                                u.subscription_tier === 'unlimited') &&
                              (!u.pro_expires_at || new Date(u.pro_expires_at).getTime() > Date.now())
                          ).length
                        })`,
                      },
                      {
                        id: 'expiring',
                        label: `Hampir Habis (${
                          usersList.filter((u: any) => {
                            if (!u.pro_expires_at) return false;
                            const diff = Math.ceil(
                              (new Date(u.pro_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                            );
                            return diff > 0 && diff <= 5;
                          }).length
                        })`,
                      },
                      {
                        id: 'expired',
                        label: `Kadaluarsa (${
                          usersList.filter(
                            (u: any) => u.pro_expires_at && new Date(u.pro_expires_at).getTime() <= Date.now()
                          ).length
                        })`,
                      },
                      {
                        id: 'free',
                        label: `Free (${
                          usersList.filter((u: any) => u.subscription_tier === 'free' || !u.subscription_tier).length
                        })`,
                      },
                      {
                        id: 'banned',
                        label: `Diblokir (${usersList.filter((u: any) => Boolean(u.is_banned)).length})`,
                      },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setUserFilter(f.id as any)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          userFilter === f.id
                            ? adminTheme === 'light'
                              ? 'bg-blue-600 text-white font-bold'
                              : 'bg-amber-500 text-zinc-950 font-bold'
                            : adminTheme === 'light'
                            ? 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                            : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={fetchUsers}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                      adminTheme === 'light'
                        ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                        : 'text-zinc-400 hover:text-white bg-zinc-900 border-zinc-800'
                    }`}
                  >
                    <RefreshCw className={`h-3 w-3 ${loadingData ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className={`uppercase text-[10px] tracking-wider border-b ${
                      adminTheme === 'light'
                        ? 'bg-slate-100/90 text-slate-600 border-slate-200'
                        : 'bg-zinc-900/60 text-zinc-400 border-zinc-800'
                    }`}>
                      <tr>
                        <th className="px-4 py-3 font-semibold uppercase text-[10px] tracking-wider w-[28%] min-w-[220px]">
                          Pengguna
                        </th>
                        <th className="px-4 py-3 text-zinc-400 font-semibold uppercase text-[10px] tracking-wider w-[18%] min-w-[150px]">
                          Status Tier & Durasi
                        </th>
                        <th className="px-4 py-3 text-zinc-400 font-semibold uppercase text-[10px] tracking-wider w-[18%] min-w-[150px]">
                          Slot Gemini
                        </th>
                        <th className="px-4 py-3 text-zinc-400 font-semibold uppercase text-[10px] tracking-wider w-[12%] min-w-[110px]">
                          Trial & Token
                        </th>
                        <th className="px-4 py-3 text-zinc-400 font-semibold uppercase text-[10px] tracking-wider w-[10%] min-w-[100px]">
                          Terdaftar
                        </th>
                        <th className="px-4 py-3 text-zinc-400 font-semibold uppercase text-[10px] tracking-wider text-right w-[14%] min-w-[200px]">
                          Aksi Cepat
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                      {(() => {
                        const filtered = usersList.filter((u: any) => {
                          if (userFilter === 'banned') return Boolean(u.is_banned);
                          if (userFilter === 'free') return u.subscription_tier === 'free' || !u.subscription_tier;
                          if (userFilter === 'active') {
                            const isPaid =
                              u.subscription_tier === 'pro' ||
                              u.subscription_tier === 'plus' ||
                              u.subscription_tier === 'unlimited';
                            if (!isPaid) return false;
                            if (!u.pro_expires_at) return true;
                            return new Date(u.pro_expires_at).getTime() > Date.now();
                          }
                          if (userFilter === 'expiring') {
                            if (!u.pro_expires_at) return false;
                            const diff = Math.ceil(
                              (new Date(u.pro_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                            );
                            return diff > 0 && diff <= 5;
                          }
                          if (userFilter === 'expired') {
                            if (!u.pro_expires_at) return false;
                            return new Date(u.pro_expires_at).getTime() <= Date.now();
                          }
                          return true;
                        });

                        if (filtered.length === 0) {
                          return (
                            <tr>
                              <td colSpan={6} className="px-4 py-10 text-center text-zinc-500 font-medium">
                                Tidak ada data pengguna yang cocok dengan filter saat ini.
                              </td>
                            </tr>
                          );
                        }

                        return filtered.map((u: any) => (
                          <tr key={u.id} className="hover:bg-zinc-900/40 transition-colors">
                            {/* Pengguna Info */}
                            <td className="px-4 py-3.5 align-middle">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/60 flex items-center justify-center text-xs font-bold text-amber-400 shrink-0 select-none shadow-xs">
                                  {(u.full_name || u.email || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-bold text-white text-xs truncate max-w-[170px]" title={u.full_name || 'User'}>
                                      {u.full_name || 'User'}
                                    </span>
                                    {u.is_banned && (
                                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-bold uppercase shrink-0">
                                        BLOKIR
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-zinc-400 font-mono truncate max-w-[190px]" title={u.email}>
                                    {u.email}
                                  </div>
                                  {(u.role || u.favorite_ai) && (
                                    <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                                      {u.role && (
                                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 truncate max-w-[110px]" title={u.role}>
                                          {u.role}
                                        </span>
                                      )}
                                      {u.favorite_ai && (
                                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400/90 border border-amber-500/20 font-mono">
                                          {u.favorite_ai}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Status Tier & Masa Aktif */}
                            <td className="px-4 py-3.5 align-middle">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide ${
                                      u.subscription_tier === 'pro'
                                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                        : u.subscription_tier === 'plus'
                                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                        : u.subscription_tier === 'unlimited'
                                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                        : 'bg-zinc-800/90 text-zinc-400 border border-zinc-700/50'
                                    }`}
                                  >
                                    {u.subscription_tier || 'FREE'}
                                  </span>
                                  {u.is_admin && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-bold uppercase">
                                      ADMIN
                                    </span>
                                  )}
                                </div>

                                {(u.subscription_tier === 'pro' || u.subscription_tier === 'plus') && (
                                  u.pro_expires_at ? (
                                    (() => {
                                      const expDate = new Date(u.pro_expires_at);
                                      const diffMs = expDate.getTime() - Date.now();
                                      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                                      const isExpired = diffMs <= 0;
                                      return (
                                        <div className="text-[10px] font-mono leading-tight">
                                          {isExpired ? (
                                            <span className="text-red-400 font-semibold">
                                              Kadaluarsa ({expDate.toLocaleDateString('id-ID')})
                                            </span>
                                          ) : (
                                            <span className={diffDays <= 5 ? 'text-amber-400 font-semibold' : 'text-zinc-400'}>
                                              Sisa {diffDays} hari ({expDate.toLocaleDateString('id-ID')})
                                            </span>
                                          )}
                                        </div>
                                      );
                                    })()
                                  ) : (
                                    <span className="text-[10px] text-zinc-500 font-mono block">Aktif</span>
                                  )
                                )}

                                {u.subscription_tier === 'unlimited' && (
                                  <span className="text-[10px] text-purple-400/80 font-mono block">Akses Lifetime</span>
                                )}
                              </div>
                            </td>

                            {/* Slot Gemini Dedicated */}
                            <td className="px-4 py-3.5 align-middle">
                              <select
                                value={u.assigned_gemini_slot || 'auto'}
                                onChange={(e) => handleAssignGeminiSlot(u.id, e.target.value)}
                                className="w-full max-w-[145px] rounded-lg border border-zinc-800 bg-zinc-900/90 px-2 py-1 text-[11px] text-amber-300 font-mono hover:border-zinc-700 focus:border-amber-400 focus:outline-none transition-colors cursor-pointer"
                              >
                                <option value="auto">Auto (Global Pool)</option>
                                {(settings.gemini_slots || DEFAULT_10_SLOTS).map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.label || `Slot ${s.id}`} {!s.isActive || !s.key.trim() ? '(Off)' : ''}
                                  </option>
                                ))}
                              </select>
                            </td>

                            {/* Trial & Token */}
                            <td className="px-4 py-3.5 align-middle font-mono">
                              <div className="text-xs font-semibold text-zinc-200">
                                {u.trial_count || 0} / {settings.trial_limit} trial
                              </div>
                              <div className="text-[10px] text-zinc-400 mt-0.5">
                                {(u.total_server_tokens || 0).toLocaleString('id-ID')} token
                              </div>
                            </td>

                            {/* Tanggal Daftar */}
                            <td className="px-4 py-3.5 align-middle text-zinc-400 font-mono text-[11px]">
                              {u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                            </td>

                            {/* Aksi Cepat Terorganisir */}
                            <td className="px-4 py-3.5 align-middle text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Tier Quick Selector */}
                                <select
                                  value=""
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === 'pro_30') handleSetUserTierWithDuration(u.id, 'pro', 30);
                                    else if (val === 'pro_7') handleSetUserTierWithDuration(u.id, 'pro', 7);
                                    else if (val === 'pro_90') handleSetUserTierWithDuration(u.id, 'pro', 90);
                                    else if (val === 'unlimited') handleSetUserTierWithDuration(u.id, 'unlimited', 99999);
                                    else if (val === 'free') handleSetUserTierWithDuration(u.id, 'free', 0);
                                  }}
                                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1 text-[11px] text-zinc-300 font-medium hover:border-zinc-700 focus:border-amber-400 focus:outline-none cursor-pointer"
                                  title="Ubah durasi atau tier pengguna"
                                >
                                  <option value="" disabled>Set Tier...</option>
                                  <option value="pro_30">PRO (+30 Hari)</option>
                                  <option value="pro_7">PRO (+7 Hari)</option>
                                  <option value="pro_90">PRO (+90 Hari)</option>
                                  <option value="unlimited">Akses Lifetime</option>
                                  <option value="free">Turunkan ke Free</option>
                                </select>

                                {/* Ban/Unban Toggle */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleUserBan(u.id, Boolean(u.is_banned))}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                                    u.is_banned
                                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                                      : 'bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/25'
                                  }`}
                                  title={u.is_banned ? 'Buka blokir akun pengguna' : 'Blokir akses pengguna'}
                                >
                                  {u.is_banned ? 'Buka' : 'Blokir'}
                                </button>

                                {/* Reset Trial Button */}
                                <button
                                  type="button"
                                  onClick={() => handleResetUserTrial(u.id)}
                                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-all cursor-pointer"
                                  title="Reset pemakaian trial ke 0"
                                >
                                  Reset
                                </button>
                              </div>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: QRIS & PRICING */}
          {activeTab === 'pricing' && (
            <div className="space-y-5">
              {/* Section 1: Konfigurasi 3 Paket Akses & Dynamic Gating */}
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                      <Sliders className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                        <span>Konfigurasi Paket & Harga Langganan</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400 border border-amber-500/25">
                          DYNAMIC GATING
                        </span>
                      </h3>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Kelola nominal harga, batas kuota harian, serta dynamic gating 4 fitur pilar untuk setiap tier.
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-zinc-400 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 self-start sm:self-auto">
                    Total: 3 Paket (Free, PLUS, PRO)
                  </span>
                </div>

                {/* 3-Column Tier Cards Deck (Padet & Rapih) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
                  {(() => {
                    const raw = settings.pricing_tiers && settings.pricing_tiers.length > 0
                      ? [...settings.pricing_tiers]
                      : [...DEFAULT_PRICING_TIERS];
                    if (!raw.some((t) => t.id === 'free')) {
                      raw.unshift(DEFAULT_PRICING_TIERS[0]);
                    }
                    const normalizedList = raw.map((t) => {
                      const def = DEFAULT_PRICING_TIERS.find((d) => d.id === t.id);
                      return {
                        ...t,
                        feature_flags: t.feature_flags || def?.feature_flags || {
                          advanced_templates: t.id !== 'free',
                          custom_stack: t.id !== 'free',
                          export_zip: t.id !== 'free',
                          architecture_diagrams: t.id !== 'free',
                        },
                      };
                    });

                    return normalizedList.map((tier, tIdx) => {
                      const isPro = tier.id === 'pro';
                      const isFree = tier.id === 'free';
                      const isPlus = tier.id === 'plus';

                      const updateTierAt = (updates: Partial<PricingTierConfig>) => {
                        const updated = [...normalizedList];
                        updated[tIdx] = { ...updated[tIdx], ...updates };
                        const proMatch = updated.find((t) => t.id === 'pro');
                        const extra: any = { pricing_tiers: updated };
                        if (proMatch) {
                          extra.pro_price_rp = proMatch.price_rp;
                          extra.pro_price_formatted = proMatch.price_formatted;
                        }
                        setSettings((prev) => ({ ...prev, ...extra }));
                      };

                      const flags = tier.feature_flags || {
                        advanced_templates: !isFree,
                        custom_stack: !isFree,
                        export_zip: !isFree,
                        architecture_diagrams: !isFree,
                      };

                      return (
                        <div
                          key={tier.id}
                          className={`rounded-xl border p-4 flex flex-col justify-between space-y-3.5 transition-all ${
                            isPro
                              ? 'border-amber-500/40 bg-zinc-900/60 shadow-lg shadow-amber-950/10'
                              : isPlus
                              ? 'border-blue-500/40 bg-zinc-900/40 shadow-lg shadow-blue-950/10'
                              : 'border-zinc-800 bg-zinc-900/30'
                          }`}
                        >
                          {/* Top Row: Badge, ID & Active Toggle */}
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono ${
                                    isPro
                                      ? 'bg-amber-500 text-zinc-950'
                                      : isPlus
                                      ? 'bg-blue-500 text-white'
                                      : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                                  }`}
                                >
                                  {isFree ? 'FREE TIER' : tier.name.toUpperCase()}
                                </span>
                                <span className="text-[10px] text-zinc-500 font-mono">ID: {tier.id}</span>
                              </div>

                              {!isFree ? (
                                <label className="flex items-center gap-1.5 cursor-pointer text-[10px]">
                                  <input
                                    type="checkbox"
                                    checked={tier.isActive !== false}
                                    onChange={(e) => updateTierAt({ isActive: e.target.checked })}
                                    className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500 h-3 w-3"
                                  />
                                  <span className={`font-semibold ${tier.isActive !== false ? 'text-emerald-400' : 'text-zinc-500'}`}>
                                    {tier.isActive !== false ? 'Aktif' : 'Nonaktif'}
                                  </span>
                                </label>
                              ) : (
                                <span className="text-[9px] text-zinc-500 font-mono">Default</span>
                              )}
                            </div>

                            {/* Name & Badge Inputs */}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-zinc-400 font-medium block mb-0.5">Nama Paket:</label>
                                <input
                                  type="text"
                                  value={tier.name}
                                  onChange={(e) => updateTierAt({ name: e.target.value })}
                                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs text-white font-bold focus:border-amber-500 focus:outline-hidden"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-zinc-400 font-medium block mb-0.5">Badge Tag:</label>
                                <input
                                  type="text"
                                  value={tier.badge || ''}
                                  onChange={(e) => updateTierAt({ badge: e.target.value })}
                                  placeholder="FREE / POPULER"
                                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs text-amber-400 font-mono uppercase focus:border-amber-500 focus:outline-hidden"
                                />
                              </div>
                            </div>

                            {/* Description Input */}
                            <div>
                              <label className="text-[10px] text-zinc-400 font-medium block mb-0.5">Deskripsi Singkat:</label>
                              <input
                                type="text"
                                value={tier.description || ''}
                                onChange={(e) => updateTierAt({ description: e.target.value })}
                                placeholder="Deskripsi untuk kartu paket..."
                                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-[11px] text-zinc-300 focus:border-amber-500 focus:outline-hidden truncate"
                              />
                            </div>

                            {/* Price & Quota Row */}
                            <div className="rounded-lg bg-zinc-950/80 border border-zinc-800/80 p-2.5 space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] text-zinc-400 font-medium block mb-0.5">Harga (IDR):</label>
                                  {isFree ? (
                                    <div className="px-2 py-1 rounded border border-zinc-800 bg-zinc-900/60 text-xs font-mono font-bold text-zinc-400">
                                      Rp 0 (Gratis)
                                    </div>
                                  ) : (
                                    <div className="relative">
                                      <span className="absolute left-2 top-1 text-zinc-500 font-mono text-[11px]">Rp</span>
                                      <input
                                        type="number"
                                        value={tier.price_rp}
                                        onChange={(e) => updateTierAt({ price_rp: parseInt(e.target.value) || 0 })}
                                        className="w-full rounded border border-zinc-800 bg-zinc-900 pl-7 pr-2 py-1 text-xs text-white font-mono font-bold focus:border-amber-500 focus:outline-hidden"
                                      />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <label className="text-[10px] text-zinc-400 font-medium block mb-0.5">Label Harga:</label>
                                  <input
                                    type="text"
                                    value={tier.price_formatted}
                                    onChange={(e) => updateTierAt({ price_formatted: e.target.value })}
                                    placeholder={isFree ? 'Gratis' : 'Rp 49.000 / 30 Hari'}
                                    className="w-full rounded border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 focus:border-amber-500 focus:outline-hidden truncate"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60 text-xs">
                                <span className="text-[10px] text-zinc-400">Batas Harian:</span>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    value={tier.daily_limit}
                                    onChange={(e) => updateTierAt({ daily_limit: parseInt(e.target.value) || 0 })}
                                    className="w-16 rounded border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-xs text-white font-mono font-bold text-right focus:border-amber-500 focus:outline-hidden"
                                  />
                                  <span className="text-[10px] text-amber-400 font-mono font-semibold">PRD/hari</span>
                                </div>
                              </div>
                            </div>

                            {/* Dynamic Gating Checklist (4 Pilar Fitur) */}
                            <div className="space-y-1.5 pt-1">
                              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                                Fitur Pilar (Dynamic Gating):
                              </span>
                              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                                {/* Feature 1 */}
                                <label className={`flex items-center gap-1.5 p-1.5 rounded-lg border cursor-pointer transition-colors ${
                                  flags.advanced_templates
                                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                                    : 'bg-zinc-950 border-zinc-800/80 text-zinc-500'
                                }`}>
                                  <input
                                    type="checkbox"
                                    checked={Boolean(flags.advanced_templates)}
                                    onChange={(e) =>
                                      updateTierAt({
                                        feature_flags: { ...flags, advanced_templates: e.target.checked },
                                      })
                                    }
                                    className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500 h-3 w-3 shrink-0"
                                  />
                                  <span className="truncate">Template Mobile & AI</span>
                                </label>

                                {/* Feature 2 */}
                                <label className={`flex items-center gap-1.5 p-1.5 rounded-lg border cursor-pointer transition-colors ${
                                  flags.custom_stack
                                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                                    : 'bg-zinc-950 border-zinc-800/80 text-zinc-500'
                                }`}>
                                  <input
                                    type="checkbox"
                                    checked={Boolean(flags.custom_stack)}
                                    onChange={(e) =>
                                      updateTierAt({
                                        feature_flags: { ...flags, custom_stack: e.target.checked },
                                      })
                                    }
                                    className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500 h-3 w-3 shrink-0"
                                  />
                                  <span className="truncate">Racik Custom Stack</span>
                                </label>

                                {/* Feature 3 */}
                                <label className={`flex items-center gap-1.5 p-1.5 rounded-lg border cursor-pointer transition-colors ${
                                  flags.export_zip
                                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                                    : 'bg-zinc-950 border-zinc-800/80 text-zinc-500'
                                }`}>
                                  <input
                                    type="checkbox"
                                    checked={Boolean(flags.export_zip)}
                                    onChange={(e) =>
                                      updateTierAt({
                                        feature_flags: { ...flags, export_zip: e.target.checked },
                                      })
                                    }
                                    className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500 h-3 w-3 shrink-0"
                                  />
                                  <span className="truncate">Unduh Starter ZIP</span>
                                </label>

                                {/* Feature 4 */}
                                <label className={`flex items-center gap-1.5 p-1.5 rounded-lg border cursor-pointer transition-colors ${
                                  flags.architecture_diagrams
                                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                                    : 'bg-zinc-950 border-zinc-800/80 text-zinc-500'
                                }`}>
                                  <input
                                    type="checkbox"
                                    checked={Boolean(flags.architecture_diagrams)}
                                    onChange={(e) =>
                                      updateTierAt({
                                        feature_flags: { ...flags, architecture_diagrams: e.target.checked },
                                      })
                                    }
                                    className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500 h-3 w-3 shrink-0"
                                  />
                                  <span className="truncate">8 Diagram Arsitektur</span>
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* Collapsible Marketing Bullets */}
                          <details className="pt-2 border-t border-zinc-800/80 text-[10px]">
                            <summary className="text-zinc-500 hover:text-amber-400 cursor-pointer font-mono select-none flex items-center justify-between">
                              <span>Poin Marketing Bullets ({tier.features.length})</span>
                              <span className="text-[9px] text-zinc-600">Buka</span>
                            </summary>
                            <div className="mt-2">
                              <textarea
                                rows={2}
                                value={tier.features.join('\n')}
                                onChange={(e) => updateTierAt({ features: e.target.value.split('\n') })}
                                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-2 text-white font-mono text-[10px] focus:border-amber-500 focus:outline-hidden leading-snug"
                                placeholder="Poin 1&#10;Poin 2"
                              />
                            </div>
                          </details>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Section 2: Payment Gateway Engine & 3 Pilihan Jalur Checkout */}
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                        <span>Payment Gateway Engine (MPG & GoBiz QRIS)</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                          0% MDR
                        </span>
                      </h3>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Dukungan 3 pilihan checkout: Headless In-Modal, Hosted MPG Redirect, atau Transfer Manual GoBiz.
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-zinc-300 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 self-start sm:self-auto">
                    Mode Default: <strong className="text-emerald-400 font-bold uppercase">
                      {settings.payment_gateway_mode === 'mpg_hosted'
                        ? 'Opsi A: Hosted Redirect'
                        : settings.payment_gateway_mode === 'manual_qris'
                          ? 'Opsi C: Manual GoBiz'
                          : 'Opsi B: Headless Pop-up'}
                    </strong>
                  </span>
                </div>

                {/* 3 Checkout Mode Selector Cards (Compact & Dense) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Option B: Headless Pop-up */}
                  <div
                    onClick={() => setSettings({ ...settings, payment_gateway_mode: 'mpg_headless' })}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      settings.payment_gateway_mode === 'mpg_headless' || settings.payment_gateway_mode === 'mpg_automatic' || !settings.payment_gateway_mode
                        ? 'border-emerald-500 bg-emerald-950/20 shadow-md shadow-emerald-950/30 ring-1 ring-emerald-500/40'
                        : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          OPSI B (REKOMENDASI)
                        </span>
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          settings.payment_gateway_mode === 'mpg_headless' || settings.payment_gateway_mode === 'mpg_automatic' || !settings.payment_gateway_mode
                            ? 'border-emerald-500 bg-emerald-500 text-zinc-950'
                            : 'border-zinc-700 bg-zinc-900'
                        }`}>
                          {(settings.payment_gateway_mode === 'mpg_headless' || settings.payment_gateway_mode === 'mpg_automatic' || !settings.payment_gateway_mode) && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                        </div>
                      </div>
                      <h4 className="text-xs font-bold text-white">Headless Modal Pop-up</h4>
                      <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                        QRIS Dinamis tampil di pop-up modal website ini tanpa pindah halaman.
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-emerald-400 font-mono">
                      <span>In-Modal</span>
                      <span>Kode Unik 3 Digit</span>
                      <span>Auto-Verify</span>
                    </div>
                  </div>

                  {/* Option A: Hosted Checkout Redirect */}
                  <div
                    onClick={() => setSettings({ ...settings, payment_gateway_mode: 'mpg_hosted' })}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      settings.payment_gateway_mode === 'mpg_hosted'
                        ? 'border-blue-500 bg-blue-950/20 shadow-md shadow-blue-950/30 ring-1 ring-blue-500/40'
                        : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          OPSI A
                        </span>
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          settings.payment_gateway_mode === 'mpg_hosted'
                            ? 'border-blue-500 bg-blue-500 text-zinc-950'
                            : 'border-zinc-700 bg-zinc-900'
                        }`}>
                          {settings.payment_gateway_mode === 'mpg_hosted' && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                        </div>
                      </div>
                      <h4 className="text-xs font-bold text-white">Hosted Checkout MPG</h4>
                      <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                        Arahkan pembeli ke halaman checkout resmi Mandiri Private Gateway.
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-blue-400 font-mono">
                      <span>Redirect URL</span>
                      <span>SSE Listener</span>
                      <span>Halaman MPG</span>
                    </div>
                  </div>

                  {/* Option C: Manual GoBiz */}
                  <div
                    onClick={() => setSettings({ ...settings, payment_gateway_mode: 'manual_qris' })}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      settings.payment_gateway_mode === 'manual_qris'
                        ? 'border-amber-500 bg-amber-950/20 shadow-md shadow-amber-950/30 ring-1 ring-amber-500/40'
                        : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                          OPSI C
                        </span>
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          settings.payment_gateway_mode === 'manual_qris'
                            ? 'border-amber-500 bg-amber-500 text-zinc-950'
                            : 'border-zinc-700 bg-zinc-900'
                        }`}>
                          {settings.payment_gateway_mode === 'manual_qris' && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                        </div>
                      </div>
                      <h4 className="text-xs font-bold text-white">Manual GoBiz / WA</h4>
                      <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                        Scan QRIS statis atau transfer GoPay, konfirmasi bukti via WhatsApp admin.
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                      <span>GoPay Manual</span>
                      <span>Bukti Bayar</span>
                      <span>Chat WA Admin</span>
                    </div>
                  </div>
                </div>

                {/* Unified 2-Column Controls: Kredensial Gateway (Kiri) & Merchant QRIS (Kanan) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start pt-1">
                  {/* Kolom Kiri (7 cols): Server & Kredensial MPG */}
                  <div className="lg:col-span-7 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                      <div className="flex items-center gap-2">
                        <Server className="h-3.5 w-3.5 text-emerald-400" />
                        <h4 className="text-xs font-bold text-white">Kredensial Mandiri Private Gateway</h4>
                      </div>

                      <button
                        type="button"
                        onClick={handleTestMpg}
                        disabled={testingMpg}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                      >
                        {testingMpg ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Activity className="h-3 w-3" />}
                        <span>{testingMpg ? 'Menguji...' : 'Uji Koneksi Gateway'}</span>
                      </button>
                    </div>

                    {/* Test Result Alert */}
                    {testMpgResult && (
                      <div className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                        testMpgResult.success
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                          : 'bg-red-950/40 border-red-500/40 text-red-200'
                      }`}>
                        {testMpgResult.success ? (
                          <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                        )}
                        <div className="leading-tight text-[11px]">
                          <span>{testMpgResult.message}</span>
                          {testMpgResult.devicesCount !== undefined && (
                            <span className="text-zinc-400 block mt-0.5">
                              Listener Kasir: <strong>{testMpgResult.onlineDeviceCount ?? 0} dari {testMpgResult.devicesCount} HP Android online</strong>.
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Inputs */}
                    <div className="space-y-2.5 text-xs">
                      {/* Gateway URL */}
                      <div>
                        <label className="text-[11px] text-zinc-400 font-medium block mb-1">Gateway Endpoint URL:</label>
                        <input
                          type="text"
                          value={settings.mpg_gateway_url || ''}
                          onChange={(e) => setSettings({ ...settings, mpg_gateway_url: e.target.value })}
                          placeholder="https://pyamentgateway.daeroom.my.id"
                          className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-white font-mono text-xs focus:border-emerald-500 focus:outline-hidden"
                        />
                      </div>

                      {/* API Key & Webhook Secret in 2 cols */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {/* API Key */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] text-zinc-400 font-medium">API Bearer Key:</label>
                            <button
                              type="button"
                              onClick={() => setShowMpgKey(!showMpgKey)}
                              className="text-[10px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 cursor-pointer"
                            >
                              {showMpgKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                              <span>{showMpgKey ? 'Tutup' : 'Lihat'}</span>
                            </button>
                          </div>
                          <div className="relative">
                            <input
                              type={showMpgKey ? 'text' : 'password'}
                              value={settings.mpg_api_key || ''}
                              onChange={(e) => setSettings({ ...settings, mpg_api_key: e.target.value })}
                              placeholder="mpg_live_..."
                              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-white font-mono text-xs focus:border-emerald-500 focus:outline-hidden pr-8"
                            />
                            <Key className="h-3.5 w-3.5 text-zinc-600 absolute right-2.5 top-2" />
                          </div>
                        </div>

                        {/* Webhook Secret */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] text-zinc-400 font-medium">Webhook Secret HMAC:</label>
                            <button
                              type="button"
                              onClick={() => setShowMpgSecret(!showMpgSecret)}
                              className="text-[10px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 cursor-pointer"
                            >
                              {showMpgSecret ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                              <span>{showMpgSecret ? 'Tutup' : 'Lihat'}</span>
                            </button>
                          </div>
                          <div className="relative">
                            <input
                              type={showMpgSecret ? 'text' : 'password'}
                              value={settings.mpg_webhook_secret || ''}
                              onChange={(e) => setSettings({ ...settings, mpg_webhook_secret: e.target.value })}
                              placeholder="mandiri-private-..."
                              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-white font-mono text-xs focus:border-emerald-500 focus:outline-hidden pr-8"
                            />
                            <Lock className="h-3.5 w-3.5 text-zinc-600 absolute right-2.5 top-2" />
                          </div>
                        </div>
                      </div>

                      {/* Outgoing Webhook URL Box */}
                      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">
                            URL Webhook Website (Daftarkan ke MPG):
                          </span>
                          <span className="font-mono text-[11px] text-emerald-400 truncate block">
                            {typeof window !== 'undefined'
                              ? `${window.location.origin}/api/webhook/payment-success`
                              : 'https://ngodingpakeprd.buatin.biz.id/api/webhook/payment-success'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const url = typeof window !== 'undefined'
                              ? `${window.location.origin}/api/webhook/payment-success`
                              : 'https://ngodingpakeprd.buatin.biz.id/api/webhook/payment-success';
                            navigator.clipboard.writeText(url);
                            setWebhookCopied(true);
                            setTimeout(() => setWebhookCopied(false), 2000);
                          }}
                          className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                        >
                          {webhookCopied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          <span>{webhookCopied ? 'Tersalin' : 'Salin URL'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Kolom Kanan (5 cols): Merchant Info & QRIS Manual */}
                  <div className="lg:col-span-5 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-3.5 w-3.5 text-amber-400" />
                        <h4 className="text-xs font-bold text-white">Merchant GoBiz & QRIS Statis</h4>
                      </div>

                      {settings.qris_image_url && settings.qris_image_url !== '/qris-gopay-placeholder.png' && (
                        <button
                          type="button"
                          onClick={() => {
                            setSettings({ ...settings, qris_image_url: '/qris-gopay-placeholder.png' });
                            showToast('success', 'Gambar QRIS direset ke placeholder default');
                          }}
                          className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Reset</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div>
                        <label className="text-[11px] text-zinc-400 font-medium block mb-1">Nama Merchant GoBiz:</label>
                        <input
                          type="text"
                          value={settings.qris_merchant_name || ''}
                          onChange={(e) => setSettings({ ...settings, qris_merchant_name: e.target.value })}
                          placeholder="NGODINGPAKEPRD OFFICIAL"
                          className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-white text-xs font-medium focus:border-amber-500 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-zinc-400 font-medium block mb-1">Nomor GoPay Merchant:</label>
                        <input
                          type="text"
                          value={settings.qris_gopay_number || ''}
                          onChange={(e) => setSettings({ ...settings, qris_gopay_number: e.target.value })}
                          placeholder="0851-2360-7711"
                          className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-white font-mono text-xs focus:border-amber-500 focus:outline-hidden"
                        />
                      </div>

                      {/* Live Preview Box with Inline Controls */}
                      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 flex items-center gap-3">
                        <div className="w-20 h-20 bg-white rounded-lg p-1 shrink-0 flex items-center justify-center border border-zinc-300 overflow-hidden shadow-inner">
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
                            <QrCode className="h-10 w-10 text-zinc-800" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-1.5">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png, image/jpeg, image/jpg, image/webp"
                            onChange={handleQRISFileUpload}
                            className="hidden"
                          />

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-[10px] inline-flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                            >
                              <Upload className="h-3 w-3" />
                              <span>Unggah</span>
                            </button>

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
                                className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Scissors className="h-3 w-3" />
                                <span>Pangkas</span>
                              </button>
                            )}
                          </div>

                          <input
                            type="text"
                            value={settings.qris_image_url || ''}
                            onChange={(e) => setSettings({ ...settings, qris_image_url: e.target.value })}
                            placeholder="URL CDN Gambar..."
                            className="w-full rounded border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-300 font-mono truncate focus:border-amber-500 focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>
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
                  Tutup (X)
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
