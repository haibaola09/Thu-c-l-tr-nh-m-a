import React from 'react';
import { Volume2, VolumeX, HelpCircle, Flame, RotateCcw, Package, Droplets, Music } from 'lucide-react';
import { DensityMode } from '../types/game';

interface GameHeaderProps {
  score: number;
  highScore: number;
  flamesCollected: number;
  currentLength: number;
  baseLength: number;
  isMuted: boolean;
  isMusicEnabled: boolean;
  densityMode: DensityMode;
  onToggleDensity: () => void;
  onToggleMute: () => void;
  onToggleMusic: () => void;
  onOpenGuide: () => void;
  onOpenCollection: () => void;
  onRestart: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  score,
  highScore,
  flamesCollected,
  currentLength,
  baseLength,
  isMuted,
  isMusicEnabled,
  densityMode,
  onToggleDensity,
  onToggleMute,
  onToggleMusic,
  onOpenGuide,
  onOpenCollection,
  onRestart,
}) => {
  const lengthPercent = Math.round((currentLength / baseLength) * 100);

  return (
    <header className="w-full flex items-center justify-between gap-3 sm:gap-4 px-3 sm:px-8 py-3 border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md shrink-0">
      {/* Zone 1: Brand Wordmark & Creator Signature (Single line, no pills) */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-300 flex items-center justify-center shadow-md shadow-amber-950/40">
          <Flame className="w-4 h-4 text-neutral-950" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-neutral-100 whitespace-nowrap font-display">
              RAIN EMBER
            </h1>
            <span className="hidden xl:inline-block text-[11px] text-neutral-400 font-medium">
              · Điếu Thuốc Tránh Mưa
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
            <span className="text-amber-400/90 font-medium">Designed by Ngô Mạnh Hải</span>
          </div>
        </div>
      </div>

      {/* Zone 2: HUD Metrics (Clean unboxed typographic layout) */}
      <div className="flex items-center gap-3 sm:gap-7 text-xs font-medium">
        {/* Score */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-wider text-neutral-400">Điểm</span>
          <span className="text-base sm:text-xl font-bold font-mono tabular-nums text-amber-400">
            {score}
            <span className="text-xs text-neutral-400 font-normal"> / 100đ</span>
          </span>
        </div>

        {/* High Score */}
        <div className="hidden xs:flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-wider text-neutral-400">Kỷ Lục</span>
          <span className="text-sm sm:text-base font-semibold font-mono tabular-nums text-neutral-300">
            {highScore}
          </span>
        </div>

        {/* Length Indicator */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-wider text-neutral-400">Chiều Dài</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-14 sm:w-24 h-2 bg-neutral-800 rounded-full overflow-hidden p-0.5 border border-neutral-700/60">
              <div
                className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-emerald-500 via-amber-400 to-orange-500"
                style={{ width: `${lengthPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-neutral-300 tabular-nums">
              {lengthPercent}%
            </span>
          </div>
        </div>

        {/* Flames Eaten */}
        <div className="hidden sm:flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-wider text-neutral-400">Lửa Đã Ăn</span>
          <span className="text-sm font-semibold font-mono tabular-nums text-orange-400 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400/20" />
            {flamesCollected}
          </span>
        </div>
      </div>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Background Music Toggle Button 🎵 */}
        <button
          onClick={onToggleMusic}
          title={isMusicEnabled ? 'Nhạc nền: Thăng Long trong Tim Tôi (Remix) - Đang BẬT (Bấm để tắt)' : 'Nhạc nền: Thăng Long trong Tim Tôi (Remix) - Đang TẮT (Bấm để bật)'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
            isMusicEnabled && !isMuted
              ? 'text-amber-300 bg-amber-950/40 hover:bg-amber-900/50 border-amber-500/40 shadow-xs shadow-amber-950/30'
              : 'text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 border-neutral-800'
          }`}
        >
          <Music className={`w-3.5 h-3.5 ${isMusicEnabled && !isMuted ? 'text-amber-400 animate-pulse' : 'text-neutral-500'}`} />
          <span className="hidden md:inline">Thăng Long trong Tim Tôi</span>
        </button>

        {/* Density Mode toggle */}
        <button
          onClick={onToggleDensity}
          title="Bấm để đổi mật độ giọt nước (Rất thưa / Vừa phải)"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-sky-300 hover:text-white bg-sky-950/40 hover:bg-sky-900/50 border border-sky-500/40 rounded-lg transition-colors whitespace-nowrap"
        >
          <Droplets className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden lg:inline text-neutral-400 font-normal">Mật độ:</span>
          <span className="font-semibold">{densityMode === 'LOW' ? 'Rất thưa' : 'Vừa phải'}</span>
        </button>

        {/* Collection / Packs button */}
        <button
          onClick={onOpenCollection}
          title="Bao thuốc đã mở khóa"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/60 rounded-lg transition-colors whitespace-nowrap"
        >
          <Package className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Bao Thuốc</span>
        </button>

        {/* Guide button */}
        <button
          onClick={onOpenGuide}
          title="Hướng dẫn chơi"
          className="p-2 text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/60 rounded-lg transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Master Audio Mute toggle */}
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Bật âm thanh' : 'Tắt toàn bộ âm thanh'}
          className="p-2 text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/60 rounded-lg transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        {/* Restart Button */}
        <button
          onClick={onRestart}
          title="Chơi lại ván mới"
          className="p-2 text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/60 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
