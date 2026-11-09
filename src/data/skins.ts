import { CigaretteSkin } from '../types/game';

export const CIGARETTE_SKINS: CigaretteSkin[] = [
  {
    id: 'classic_vintage',
    name: 'Bao Điện Biên Cổ Điển',
    tagline: 'Hương Vị Hoài Niệm · Giấy Cuộn Truyền Thống',
    filterColor: '#c98a4b', // classic cork
    bodyColor: '#faf8f5',
    emberColor: '#ff5722',
    emberCore: '#fff7ed',
    smokeColor: 'rgba(210, 215, 225, 0.45)',
    unlockedAtScore: 0,
    badge: 'Mặc định',
    description: 'Thiết kế cổ điển với đầu lọc giấy bần vàng nâu và thân giấy cuộn trắng ngà thanh lịch.',
  },
  {
    id: 'royal_heritage',
    name: 'Bao Thăng Long Hoàng Gia',
    tagline: 'Phần Thưởng 100 Điểm · Mạ Vàng Lá Sang Trọng',
    filterColor: '#d4af37', // metallic gold
    bodyColor: '#1c1917', // matte obsidian black
    emberColor: '#f59e0b',
    emberCore: '#fef08a',
    smokeColor: 'rgba(254, 240, 138, 0.45)',
    unlockedAtScore: 100,
    badge: '🏆 Thưởng 100đ',
    description: 'Tuyệt tác dành riêng cho người chơi vượt mốc 100 điểm: Thân đen nhung mạ vàng lá, tàn thuốc tỏa sắc hổ phách quý tộc.',
  },
  {
    id: 'menthol_frost',
    name: 'Bao Sương Băng Bạc Hà',
    tagline: 'Hương Băng Lạnh · Khói Sương Biển Bắc',
    filterColor: '#0d9488', // emerald teal
    bodyColor: '#f0fdfa',
    emberColor: '#06b6d4',
    emberCore: '#cffafe',
    smokeColor: 'rgba(165, 243, 252, 0.45)',
    unlockedAtScore: 150,
    badge: 'Mốc 150đ',
    description: 'Thanh thoát sắc ngọc lục bảo và bạc hà the mát, tạo vệt khói lam xanh kỳ ảo giữa trời mưa bão.',
  },
  {
    id: 'cyber_ember',
    name: 'Bao Titan Plasma 2077',
    tagline: 'Kỷ Nguyên Vị Lai · Lõi Đốt Năng Lượng Cao',
    filterColor: '#7c3aed', // neon violet
    bodyColor: '#18181b', // carbon
    emberColor: '#ec4899',
    emberCore: '#fdf2f8',
    smokeColor: 'rgba(244, 114, 182, 0.45)',
    unlockedAtScore: 200,
    badge: 'Mốc 200đ',
    description: 'Vỏ sợi carbon siêu bền tích hợp đầu đốt ion plasma, ánh sáng neon rực rỡ thách thức mọi cơn mưa rào.',
  },
];
