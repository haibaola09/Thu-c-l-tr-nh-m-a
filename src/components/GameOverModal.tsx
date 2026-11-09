import React from 'react';
import { RotateCcw, Droplets, Flame, Trophy, Clock, Sparkles } from 'lucide-react';

interface GameOverModalProps {
  score: number;
  highScore: number;
  flamesCount: number;
  dodgedCount: number;
  timeElapsed: number;
  onRestart: () => void;
  onOpenCollection: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  highScore,
  flamesCount,
  dodgedCount,
  timeElapsed,
  onRestart,
  onOpenCollection,
}) => {
  const isNewRecord = score > 0 && score >= highScore;
  const progressTo100 = Math.min(100, Math.round((score / 100) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-7 shadow-2xl text-neutral-100 flex flex-col items-center">
        {/* Extinguished icon */}
        <div className="relative w-16 h-16 rounded-2xl bg-sky-950/50 border border-sky-500/30 flex items-center justify-center shadow-lg shadow-sky-950/40 mb-4">
          <Droplets className="w-8 h-8 text-sky-400" />
          <span className="absolute -bottom-1 -right-1 text-xs">💨</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold font-display text-white text-center">
          ĐIẾU THUỐC BỊ TẮT LỬA!
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 text-center mt-1">
          Một giọt nước lạnh buốt đã rơi trúng tàn thuốc đang cháy.
        </p>

        {/* New record banner */}
        {isNewRecord && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-300 text-xs font-semibold mt-3 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kỷ Lục Điểm Số Mới!</span>
          </div>
        )}

        {/* Score & Progress to 100 */}
        <div className="w-full bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-4 my-5 flex flex-col items-center">
          <span className="text-[11px] text-neutral-400 uppercase tracking-wider">Điểm Số Đạt Được</span>
          <div className="text-4xl font-extrabold font-mono text-amber-400 tabular-nums my-1">
            {score}
          </div>
          <span className="text-xs text-neutral-400">
            Kỷ lục cá nhân: <strong className="text-neutral-200 font-mono">{highScore}</strong>
          </span>

          {/* Progress bar to 100 Reward */}
          <div className="w-full mt-3 pt-3 border-t border-neutral-800/60">
            <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
              <span>Tiến độ nhận Bao Thuốc Hoàng Gia</span>
              <span className="font-mono text-amber-400 font-semibold">{score}/100 ({progressTo100}%)</span>
            </div>
            <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
                style={{ width: `${progressTo100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="w-full grid grid-cols-3 gap-2 text-center text-xs bg-neutral-950/40 border border-neutral-800/60 rounded-xl p-2.5 mb-5">
          <div>
            <div className="text-[10px] text-neutral-400 flex items-center justify-center gap-1">
              <Flame className="w-3 h-3 text-orange-400" />
              Lửa đã ăn
            </div>
            <div className="text-sm font-bold font-mono text-orange-400 tabular-nums mt-0.5">
              {flamesCount}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-neutral-400 flex items-center justify-center gap-1">
              <Droplets className="w-3 h-3 text-sky-400" />
              Giọt nước né
            </div>
            <div className="text-sm font-bold font-mono text-sky-400 tabular-nums mt-0.5">
              {dodgedCount}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-neutral-400 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-neutral-300" />
              Sống sót
            </div>
            <div className="text-sm font-bold font-mono text-neutral-300 tabular-nums mt-0.5">
              {timeElapsed}s
            </div>
          </div>
        </div>

        {/* Pro Tip */}
        <div className="w-full bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-5 text-[11px] text-amber-200/90 leading-relaxed">
          <strong className="text-amber-300 font-semibold">💡 Mẹo chiến thuật:</strong> Hãy di chuyển điếu thuốc đón lấy những đám lửa 🔥 rơi xuống để cháy ngắn lại. Điếu thuốc càng ngắn thì diện tích tiếp xúc với mưa càng nhỏ, né mưa dễ hơn rất nhiều!
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-950/40 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Chơi Lại Ngay</span>
          </button>

          <button
            onClick={onOpenCollection}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-medium rounded-xl transition-colors text-xs border border-neutral-700/60"
          >
            <span>Bộ sưu tập bao thuốc</span>
          </button>
        </div>

        <div className="mt-4 text-[10px] text-neutral-500 text-center font-medium">
          Designed by <span className="text-neutral-400">Ngô Mạnh Hải</span>
        </div>
      </div>
    </div>
  );
};
