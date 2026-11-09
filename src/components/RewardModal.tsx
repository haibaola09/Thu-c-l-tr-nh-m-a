import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, Check, Play, ArrowRight, ShieldCheck, Flame, Droplets, Clock } from 'lucide-react';
import { CigaretteSkin } from '../types/game';
import { soundFx } from '../utils/audio';

interface RewardModalProps {
  score: number;
  flamesCount: number;
  dodgedCount: number;
  timeElapsed: number;
  rewardSkin: CigaretteSkin;
  isSkinEquipped: boolean;
  onEquipSkin: (skinId: string) => void;
  onContinue: () => void;
  onRestart: () => void;
}

export const RewardModal: React.FC<RewardModalProps> = ({
  score,
  flamesCount,
  dodgedCount,
  timeElapsed,
  rewardSkin,
  isSkinEquipped,
  onEquipSkin,
  onContinue,
  onRestart,
}) => {
  const [isOpenLid, setIsOpenLid] = useState(false);
  const [isDrawnCigarette, setIsDrawnCigarette] = useState(false);

  // Trigger celebratory confetti burst on mount
  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 75,
      origin: { y: 0.5 },
      colors: ['#f59e0b', '#d97706', '#fbbf24', '#ffffff', '#ef4444'],
    });

    const timer = setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#d4af37', '#fef08a', '#f97316'],
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#d4af37', '#fef08a', '#f97316'],
      });
    }, 450);

    return () => clearTimeout(timer);
  }, []);

  const handleOpenPack = () => {
    soundFx.playClick();
    setIsOpenLid(!isOpenLid);
  };

  const handleDrawCigarette = () => {
    soundFx.playFireCollect();
    setIsDrawnCigarette(true);
    if (!isOpenLid) {
      setIsOpenLid(true);
    }
    onEquipSkin(rewardSkin.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-neutral-900 border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-amber-950/50 text-neutral-100 flex flex-col items-center">
        {/* Glow ambient background aura */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Trophy Banner */}
        <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Trophy className="w-3.5 h-3.5" />
          <span>Chiến Thắng Mốc 100 Điểm</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-center font-display tracking-tight text-white">
          CHÚC MỪNG CHIẾN THẮNG!
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 text-center mt-1.5 max-w-md">
          Bạn đã kiên cường né tránh từng hạt mưa bão và xuất sắc nhận được{' '}
          <strong className="text-amber-300 font-semibold">Bao Thuốc Lá Hoàng Gia</strong> cao cấp!
        </p>

        {/* 3D Interactive Cigarette Pack Container */}
        <div className="my-6 relative flex flex-col items-center">
          {/* Cigarette Pack 3D Box Illustration */}
          <div
            onClick={handleOpenPack}
            className="group cursor-pointer relative w-48 sm:w-56 h-64 sm:h-72 rounded-xl transition-all duration-500 transform hover:scale-[1.02] flex flex-col items-center justify-between p-3.5 shadow-2xl border border-amber-500/40"
            style={{
              background: 'linear-gradient(145deg, #1f1d1a 0%, #12100e 50%, #0a0908 100%)',
              boxShadow: '0 20px 40px -15px rgba(245, 158, 11, 0.25), inset 0 1px 0 rgba(254, 240, 138, 0.2)',
            }}
          >
            {/* Stamp / Seal band on corner */}
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-700 to-red-600 text-[10px] font-bold text-white px-2 py-0.5 rounded shadow-md border border-red-500/40 uppercase tracking-widest">
              TEM CHÍNH HÃNG
            </div>

            {/* Pack Lid (Flips open when clicked) */}
            <div
              className={`w-full transition-all duration-500 origin-top flex flex-col items-center pb-2 border-b border-amber-500/30 ${
                isOpenLid ? '-rotate-x-45 -translate-y-4 shadow-lg' : ''
              }`}
            >
              <div className="text-[10px] uppercase tracking-widest text-amber-500/80 font-bold">
                Grand Heritage 100
              </div>
              <div className="w-10 h-0.5 bg-amber-400/60 my-1" />
              <div className="text-[11px] font-serif font-bold text-amber-300">
                THĂNG LONG HOÀNG GIA
              </div>
            </div>

            {/* Cigarettes Inside Pack (Visible when lid opens) */}
            <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden my-1">
              {/* Foil Paper Interior */}
              <div className="w-40 sm:w-44 h-32 rounded-md bg-gradient-to-b from-amber-200 via-amber-300 to-amber-500 p-1.5 shadow-inner flex flex-col justify-end">
                {/* Cigarette Tips inside */}
                <div className="flex justify-center items-end gap-1.5 h-full pb-1">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-4 bg-[#faf8f5] rounded-t-sm shadow-sm transition-all duration-300 flex flex-col justify-start overflow-hidden ${
                        i === 2 && isDrawnCigarette ? '-translate-y-7 ring-2 ring-amber-400' : ''
                      }`}
                      style={{ height: `${58 + (i % 2) * 8}px` }}
                    >
                      {/* Realistic elongated filter */}
                      <div className="w-full h-6 bg-gradient-to-b from-[#d4af37] via-[#f5d0a9] to-[#c98a4b] relative shrink-0">
                        <div className="absolute bottom-0 w-full h-0.5 bg-[#b8860b]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Royal Dragon / Crest Emblem */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="w-16 h-16 rounded-full border border-amber-500/30 bg-amber-950/40 backdrop-blur-xs flex items-center justify-center shadow-lg">
                  <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Pack Bottom Footer Branding */}
            <div className="w-full text-center pt-2 border-t border-amber-500/20">
              <div className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono">
                SPECIAL CIGARETTES · 20 STICKS
              </div>
            </div>
          </div>

          {/* Interactive Pack Controls */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleOpenPack}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium underline underline-offset-4 transition-colors"
            >
              {isOpenLid ? 'Đóng nắp bao thuốc' : 'Bấm để mở nắp bao thuốc'}
            </button>
            <span className="text-neutral-600">·</span>
            <button
              onClick={handleDrawCigarette}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium underline underline-offset-4 transition-colors"
            >
              Rút điếu thuốc dùng thử
            </button>
          </div>
        </div>

        {/* Stats Summary Grid */}
        <div className="w-full grid grid-cols-4 gap-2 bg-neutral-950/60 border border-neutral-800 rounded-xl p-3 mb-6 text-center">
          <div>
            <div className="text-[10px] text-neutral-400 flex items-center justify-center gap-1">
              <Trophy className="w-3 h-3 text-amber-400" />
              Điểm số
            </div>
            <div className="text-sm sm:text-base font-bold font-mono text-amber-400 tabular-nums mt-0.5">
              {score}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-neutral-400 flex items-center justify-center gap-1">
              <Flame className="w-3 h-3 text-orange-400" />
              Lửa đã ăn
            </div>
            <div className="text-sm sm:text-base font-bold font-mono text-orange-400 tabular-nums mt-0.5">
              {flamesCount}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-neutral-400 flex items-center justify-center gap-1">
              <Droplets className="w-3 h-3 text-sky-400" />
              Giọt nước né
            </div>
            <div className="text-sm sm:text-base font-bold font-mono text-sky-400 tabular-nums mt-0.5">
              {dodgedCount}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-neutral-400 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-neutral-300" />
              Thời gian
            </div>
            <div className="text-sm sm:text-base font-bold font-mono text-neutral-300 tabular-nums mt-0.5">
              {timeElapsed}s
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => {
              onEquipSkin(rewardSkin.id);
              onRestart();
            }}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-950/40 text-sm whitespace-nowrap"
          >
            {isSkinEquipped ? (
              <>
                <Check className="w-4 h-4" />
                <span>Đã trang bị bao mới · Chơi lại</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Trang bị bao thuốc này & Chơi lại</span>
              </>
            )}
          </button>

          <button
            onClick={onContinue}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold rounded-xl transition-colors text-sm border border-neutral-700 whitespace-nowrap"
          >
            <Play className="w-4 h-4 text-emerald-400" />
            <span>Chơi tiếp vô tận</span>
          </button>
        </div>

        <div className="mt-4 text-[10px] text-neutral-500 text-center font-medium">
          Designed by <span className="text-amber-400/90">Ngô Mạnh Hải</span>
        </div>
      </div>
    </div>
  );
};
