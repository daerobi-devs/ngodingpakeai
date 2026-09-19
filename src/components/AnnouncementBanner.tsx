'use client';

import React, { useState } from 'react';
import { Megaphone, AlertCircle, Sparkles, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const AnnouncementBanner: React.FC = () => {
  const { systemSettings } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);

  const banner = systemSettings?.announcement_banner;

  if (!banner || !banner.active || !banner.message?.trim() || isDismissed) {
    return null;
  }

  const type = banner.type || 'info';

  const typeStyles = {
    promo: {
      bg: 'bg-gradient-to-r from-amber-500/20 via-amber-500/15 to-amber-600/20 border-amber-500/40 text-amber-200',
      badge: 'bg-amber-500 text-zinc-950 font-black',
      icon: Sparkles,
      iconColor: 'text-amber-400',
    },
    warning: {
      bg: 'bg-gradient-to-r from-rose-500/20 via-rose-500/15 to-rose-600/20 border-rose-500/40 text-rose-200',
      badge: 'bg-rose-500 text-white font-black',
      icon: AlertCircle,
      iconColor: 'text-rose-400',
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-500/20 via-blue-500/15 to-indigo-600/20 border-blue-500/40 text-blue-200',
      badge: 'bg-blue-500 text-white font-black',
      icon: Megaphone,
      iconColor: 'text-blue-400',
    },
  }[type];

  const IconComponent = typeStyles.icon;

  return (
    <aside
      aria-label="Pengumuman Sistem"
      className={`relative z-40 w-full border-b px-4 py-2 text-xs transition-all ${typeStyles.bg}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <IconComponent className={`h-4 w-4 shrink-0 ${typeStyles.iconColor}`} />
          <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${typeStyles.badge}`}>
            {type === 'promo' ? 'Promo' : type === 'warning' ? 'Perhatian' : 'Info'}
          </span>
          <p className="font-medium truncate leading-tight">
            {banner.message}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="p-1 rounded hover:bg-black/20 text-current opacity-70 hover:opacity-100 transition-opacity cursor-pointer shrink-0"
          title="Tutup Pengumuman"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  );
};
