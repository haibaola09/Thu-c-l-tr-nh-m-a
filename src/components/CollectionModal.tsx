import React from 'react';
import { X, Check, Lock, Sparkles, Package } from 'lucide-react';
import { CigaretteSkin } from '../types/game';
import { CIGARETTE_SKINS } from '../data/skins';
import { soundFx } from '../utils/audio';

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSkinId: string;
  unlockedSkinIds: string[];
  highScore: number;
  onSelectSkin: (skinId: string) => void;
}

export const CollectionModal: React.FC<CollectionModalProps> = ({
  isOpen,
  onClose,
  activeSkinId,
  unlockedSkinIds,
  highScore,
  onSelectSkin,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-7 shadow-2xl text-neutral-100 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-display text-white">
                BỘ SƯU TẬP BAO THUỐC
              </h2>
              <p className="text-xs text-neutral-400">
                Kỷ lục hiện tại: <strong className="text-amber-400 font-mono">{highScore} điểm</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Skins Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5">
          {CIGARETTE_SKINS.map(skin => {
            const isUnlocked = unlockedSkinIds.includes(skin.id) || highScore >= skin.unlockedAtScore;
            const isEquipped = activeSkinId === skin.id;

            return (
              <div
                key={skin.id}
                className={`relative rounded-xl border p-4 flex flex-col justify-between transition-all ${
                  isEquipped
                    ? 'border-amber-500/80 bg-neutral-950/80 ring-1 ring-amber-500/50'
                    : isUnlocked
                    ? 'border-neutral-800 bg-neutral-950/50 hover:border-neutral-700'
                    : 'border-neutral-800/40 bg-neutral-950/20 opacity-60'
                }`}
              >
                <div>
                  {/* Top Badge & Status */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-amber-400">
                      {skin.badge}
                    </span>
                    {isEquipped && (
                      <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Đang chọn
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white font-display">
                    {skin.name}
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                    {skin.tagline}
                  </p>

                  {/* Cigarette Preview Bar */}
                  <div className="my-3 p-2 bg-neutral-900/80 rounded-lg border border-neutral-800/60 flex items-center justify-center">
                    <div className="relative flex items-center h-4 w-36 shadow-md rounded-sm overflow-hidden">
                      {/* Filter - elongated realistic proportion */}
                      <div
                        className="h-full w-12 shrink-0 relative flex items-center justify-end"
                        style={{ backgroundColor: skin.filterColor }}
                      >
                        <div className="w-1 h-full bg-gradient-to-r from-amber-400 to-amber-600 shrink-0" />
                      </div>
                      {/* Body */}
                      <div
                        className="h-full flex-1"
                        style={{ backgroundColor: skin.bodyColor }}
                      />
                      {/* Burning Ember tip */}
                      <div
                        className="h-full w-3 shrink-0 shadow-sm"
                        style={{ backgroundColor: skin.emberColor }}
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    {skin.description}
                  </p>
                </div>

                {/* Bottom Action / Lock info */}
                <div className="mt-4 pt-3 border-t border-neutral-800/60">
                  {isUnlocked ? (
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        onSelectSkin(skin.id);
                      }}
                      disabled={isEquipped}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                        isEquipped
                          ? 'bg-neutral-800 text-neutral-400 cursor-default'
                          : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md shadow-amber-950/30'
                      }`}
                    >
                      {isEquipped ? 'Đang Sử Dụng' : 'Trang Bị Bao Thuốc Này'}
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 py-2 text-xs text-neutral-400">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Cần đạt {skin.unlockedAtScore} điểm để mở khóa</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-2 text-center text-xs text-neutral-400">
          Chơi đạt mốc <strong className="text-amber-400">100 điểm</strong> để mở khóa Bao Thăng Long Hoàng Gia cao cấp!
        </div>
      </div>
    </div>
  );
};
