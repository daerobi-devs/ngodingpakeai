'use client';

import React, { useState } from 'react';
import { X, Check, Palette, RotateCcw } from 'lucide-react';
import { DesignPalette } from '@/lib/design-template';

interface CustomPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPalette: DesignPalette;
  onApplyPalette: (newPalette: DesignPalette) => void;
  onResetDefault: () => void;
}

export const CustomPaletteModal: React.FC<CustomPaletteModalProps> = ({
  isOpen,
  onClose,
  currentPalette,
  onApplyPalette,
  onResetDefault,
}) => {
  const [primaryHex, setPrimaryHex] = useState(currentPalette.primaryHex);
  const [accentHex, setAccentHex] = useState(currentPalette.accentHex);
  const [paletteName, setPaletteName] = useState(currentPalette.primaryColorName || 'Kustom Pengguna');
  const [moodDescription, setMoodDescription] = useState(
    currentPalette.moodDescription || 'Palet kustom pilihan pengguna dengan kontras tinggi'
  );

  if (!isOpen) return null;

  const handleApply = () => {
    const validPrimary = primaryHex.startsWith('#') ? primaryHex : `#${primaryHex}`;
    const validAccent = accentHex.startsWith('#') ? accentHex : `#${accentHex}`;

    const newPalette: DesignPalette = {
      ...currentPalette,
      domain: 'custom',
      primaryColorName: paletteName.trim() || 'Kustom Pengguna',
      primaryHex: validPrimary,
      primaryHoverHex: validPrimary,
      primaryTailwind: 'custom-primary',
      accentHex: validAccent,
      moodDescription: moodDescription.trim() || 'Palet kustom terkalibrasi',
    };

    onApplyPalette(newPalette);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#0c0c0e]/95 p-6 shadow-2xl text-zinc-100 z-10 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Palette className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Kustomisasi Palet Warna
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Tentukan warna primer dan aksen untuk PRD & DESIGN.md
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body Form */}
        <div className="space-y-4 py-5">
          {/* 1. Primary Color */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Warna Utama (Primary Brand)
            </label>
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-12 shrink-0 rounded-xl overflow-hidden border border-zinc-700 shadow-inner">
                <input
                  type="color"
                  value={primaryHex.startsWith('#') ? primaryHex : `#${primaryHex}`}
                  onChange={(e) => setPrimaryHex(e.target.value)}
                  className="absolute -inset-2 h-14 w-16 cursor-pointer border-0 p-0"
                />
              </div>
              <input
                type="text"
                value={primaryHex}
                onChange={(e) => setPrimaryHex(e.target.value)}
                placeholder="#2563eb"
                className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2 text-xs font-mono text-white focus:outline-hidden focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          {/* 2. Secondary Accent */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Warna Aksen (Secondary Highlight)
            </label>
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-12 shrink-0 rounded-xl overflow-hidden border border-zinc-700 shadow-inner">
                <input
                  type="color"
                  value={accentHex.startsWith('#') ? accentHex : `#${accentHex}`}
                  onChange={(e) => setAccentHex(e.target.value)}
                  className="absolute -inset-2 h-14 w-16 cursor-pointer border-0 p-0"
                />
              </div>
              <input
                type="text"
                value={accentHex}
                onChange={(e) => setAccentHex(e.target.value)}
                placeholder="#10b981"
                className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2 text-xs font-mono text-white focus:outline-hidden focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          {/* 3. Palette Label */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Nama Karakter Warna
            </label>
            <input
              type="text"
              value={paletteName}
              onChange={(e) => setPaletteName(e.target.value)}
              placeholder="Contoh: Midnight Blue & Amber Gold"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500 transition-colors"
            />
          </div>

          {/* 4. Live Mini Preview */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 space-y-2">
            <span className="text-[11px] font-mono text-zinc-500 block uppercase tracking-wider">
              Pratinjau Langsung Komponen:
            </span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs"
                style={{ backgroundColor: primaryHex }}
              >
                Tombol Utama
              </button>
              <span
                className="px-2 py-0.5 rounded-md text-[11px] font-bold border"
                style={{
                  backgroundColor: `${accentHex}20`,
                  borderColor: `${accentHex}40`,
                  color: accentHex,
                }}
              >
                Aksen Aktif
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800/80">
          <button
            type="button"
            onClick={() => {
              onResetDefault();
              onClose();
            }}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset ke Standar AI</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Terapkan Palet</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
