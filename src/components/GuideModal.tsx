import React from 'react';
import { X, Droplets, Flame, Trophy, MousePointer, Keyboard, Smartphone } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartPlay: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose, onStartPlay }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-7 shadow-2xl text-neutral-100 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-xl sm:text-2xl font-bold font-display text-white mb-1">
          HƯỚNG DẪN CHƠI
        </h2>
        <p className="text-xs text-neutral-400 mb-5">
          Quy luật sinh tồn của điếu thuốc trong cơn mưa rào
        </p>

        {/* 3 Main Rules */}
        <div className="flex flex-col gap-3.5 mb-6">
          {/* Rule 1: Rain */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
            <div className="w-9 h-9 rounded-lg bg-sky-950/60 border border-sky-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <Droplets className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-sky-300">Né tránh từng giọt nước rơi 💧</h3>
              <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                Từng giọt nước 3D lấp lánh rơi từ trên trời xuống ngẫu nhiên. Bất kỳ giọt nước nào chạm trúng thân hoặc đầu thuốc đang cháy đều sẽ dập tắt thuốc và kết thúc trò chơi ngay lập tức.
              </p>
            </div>
          </div>

          {/* Rule 2: Flame */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
            <div className="w-9 h-9 rounded-lg bg-orange-950/60 border border-orange-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-orange-300">Hấp thụ đám lửa để thu ngắn 🔥</h3>
              <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                Thỉnh thoảng có đám lửa rơi xuống. Hãy chủ động lao tới đón lấy: Điếu thuốc sẽ cháy ngắn bớt chiều dài (tối đa ngắn lại ~70%), thu hẹp diện tích va chạm giúp né mưa dễ dàng hơn gấp bội và cộng thêm <strong className="text-orange-400">+5 điểm</strong>!
              </p>
            </div>
          </div>

          {/* Rule 3: 100 Points Reward */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
            <div className="w-9 h-9 rounded-lg bg-amber-950/60 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-amber-300">Đạt 100 điểm thưởng Bao Thuốc 🏆</h3>
              <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                Khi tích lũy đủ 100 điểm, bạn sẽ chiến thắng và được vinh danh, mở khóa phần thưởng đặc biệt: <strong className="text-amber-400 font-semibold">Bao Thuốc Lá Thăng Long Hoàng Gia mạ vàng lá</strong>!
              </p>
            </div>
          </div>
        </div>

        {/* Controls Info */}
        <div className="mb-6">
          <h4 className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-2.5">
            Cách thức điều khiển
          </h4>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-lg bg-neutral-950/40 border border-neutral-800 flex flex-col items-center">
              <MousePointer className="w-4 h-4 text-neutral-400 mb-1" />
              <span className="font-medium text-neutral-200">Chuột máy tính</span>
              <span className="text-[10px] text-neutral-400 mt-0.5">Di chuột tự do</span>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-950/40 border border-neutral-800 flex flex-col items-center">
              <Smartphone className="w-4 h-4 text-neutral-400 mb-1" />
              <span className="font-medium text-neutral-200">Cảm ứng điện thoại</span>
              <span className="text-[10px] text-neutral-400 mt-0.5">Chạm & vuốt mượt</span>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-950/40 border border-neutral-800 flex flex-col items-center">
              <Keyboard className="w-4 h-4 text-neutral-400 mb-1" />
              <span className="font-medium text-neutral-200">Bàn phím</span>
              <span className="text-[10px] text-neutral-400 mt-0.5">Phím ← → hoặc A / D</span>
            </div>
          </div>
        </div>

        {/* Start Game Button */}
        <button
          onClick={() => {
            onClose();
            onStartPlay();
          }}
          className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-950/40 text-sm"
        >
          Đã hiểu · Bắt đầu chơi
        </button>

        <div className="mt-3.5 text-[10px] text-neutral-500 text-center font-medium">
          Tác phẩm trò chơi độc đáo · Designed by <span className="text-amber-400/90">Ngô Mạnh Hải</span>
        </div>
      </div>
    </div>
  );
};
