import React, { useState, useEffect, useCallback } from 'react';
import { GameState, DensityMode, CigaretteSkin } from './types/game';
import { CIGARETTE_SKINS } from './data/skins';
import { soundFx } from './utils/audio';
import { GameCanvas } from './components/GameCanvas';
import { GameHeader } from './components/GameHeader';
import { RewardModal } from './components/RewardModal';
import { GameOverModal } from './components/GameOverModal';
import { GuideModal } from './components/GuideModal';
import { CollectionModal } from './components/CollectionModal';
import { Play, Flame, Trophy, Droplets, Sparkles, HelpCircle, Music, Heart } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('rain_ember_highscore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [flamesCollected, setFlamesCollected] = useState<number>(0);
  const [rainDodged, setRainDodged] = useState<number>(0);
  const [timeSurvived, setTimeSurvived] = useState<number>(0);
  const [currentLength, setCurrentLength] = useState<number>(115);
  const baseLength = 115;

  // Water Droplet Density Mode (Default is MEDIUM - Vừa phải)
  const [densityMode, setDensityMode] = useState<DensityMode>(() => {
    return (localStorage.getItem('rain_ember_density') as DensityMode) || 'MEDIUM';
  });

  const handleToggleDensity = () => {
    soundFx.playClick();
    setDensityMode(prev => {
      const next: DensityMode = prev === 'LOW' ? 'MEDIUM' : 'LOW';
      localStorage.setItem('rain_ember_density', next);
      return next;
    });
  };

  // Active Skin & Unlocked Packs
  const [activeSkinId, setActiveSkinId] = useState<string>(() => {
    return localStorage.getItem('rain_ember_active_skin') || 'classic_vintage';
  });
  const [unlockedSkinIds, setUnlockedSkinIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('rain_ember_unlocked_skins');
      return saved ? JSON.parse(saved) : ['classic_vintage'];
    } catch {
      return ['classic_vintage'];
    }
  });

  // Sound mute state & Romantic Music state
  const [isMuted, setIsMuted] = useState<boolean>(() => soundFx.getMuted());
  const [isMusicEnabled, setIsMusicEnabled] = useState<boolean>(() => soundFx.getMusicEnabled());

  // Modals
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isCollectionOpen, setIsCollectionOpen] = useState<boolean>(false);

  // Active skin object
  const activeSkin: CigaretteSkin =
    CIGARETTE_SKINS.find(s => s.id === activeSkinId) || CIGARETTE_SKINS[0];
  const rewardSkin: CigaretteSkin =
    CIGARETTE_SKINS.find(s => s.id === 'royal_heritage') || CIGARETTE_SKINS[1];

  // Save high score
  const updateHighScore = useCallback((newScore: number) => {
    setHighScore(prev => {
      if (newScore > prev) {
        localStorage.setItem('rain_ember_highscore', String(newScore));
        return newScore;
      }
      return prev;
    });
  }, []);

  // Unlock skin utility
  const unlockSkin = useCallback((skinId: string) => {
    setUnlockedSkinIds(prev => {
      if (!prev.includes(skinId)) {
        const next = [...prev, skinId];
        localStorage.setItem('rain_ember_unlocked_skins', JSON.stringify(next));
        return next;
      }
      return prev;
    });
  }, []);

  // Select Skin
  const handleSelectSkin = (skinId: string) => {
    setActiveSkinId(skinId);
    localStorage.setItem('rain_ember_active_skin', skinId);
  };

  // Start / Restart Game
  const handleStartGame = () => {
    soundFx.playClick();
    soundFx.startRainAmbient();
    if (isMusicEnabled && !isMuted) {
      soundFx.startRomanticMusic();
    }
    setScore(0);
    setFlamesCollected(0);
    setRainDodged(0);
    setTimeSurvived(0);
    setCurrentLength(baseLength);
    setGameState('PLAYING');
  };

  // Score tick update from canvas
  const handleScoreUpdate = useCallback((newScore: number, newLength: number, flamesCount: number) => {
    setScore(newScore);
    setCurrentLength(newLength);
    setFlamesCollected(flamesCount);
  }, []);

  // Game Over Handler
  const handleGameOver = useCallback(
    (finalScore: number, flamesCount: number, dodgedCount: number, timeElapsed: number) => {
      updateHighScore(finalScore);
      setFlamesCollected(flamesCount);
      setRainDodged(dodgedCount);
      setTimeSurvived(timeElapsed);
      setGameState('GAME_OVER');
      soundFx.stopRainAmbient();
    },
    [updateHighScore]
  );

  // Victory (100 points) Handler
  const handleVictory = useCallback(
    (finalScore: number, flamesCount: number, dodgedCount: number, timeElapsed: number) => {
      updateHighScore(finalScore);
      setFlamesCollected(flamesCount);
      setRainDodged(dodgedCount);
      setTimeSurvived(timeElapsed);
      unlockSkin('royal_heritage');
      setGameState('VICTORY');
    },
    [updateHighScore, unlockSkin]
  );

  // Toggle Mute
  const handleToggleMute = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
  };

  // Toggle Romantic Music
  const handleToggleMusic = () => {
    const musicOn = soundFx.toggleRomanticMusic();
    setIsMusicEnabled(musicOn);
  };

  // Keyboard shortcut for quick restart on Game Over
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (gameState === 'GAME_OVER' || gameState === 'MENU') {
          e.preventDefault();
          handleStartGame();
        }
      } else if (e.code === 'Escape') {
        setIsGuideOpen(false);
        setIsCollectionOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#07090e] text-neutral-100 flex flex-col font-sans">
      {/* Top Bar Header */}
      <GameHeader
        score={score}
        highScore={highScore}
        flamesCollected={flamesCollected}
        currentLength={currentLength}
        baseLength={baseLength}
        isMuted={isMuted}
        isMusicEnabled={isMusicEnabled}
        densityMode={densityMode}
        onToggleDensity={handleToggleDensity}
        onToggleMute={handleToggleMute}
        onToggleMusic={handleToggleMusic}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenCollection={() => setIsCollectionOpen(true)}
        onRestart={handleStartGame}
      />

      {/* Main Game Stage */}
      <main className="relative flex-1 w-full h-full p-2 sm:p-4 overflow-hidden flex flex-col items-center justify-center">
        <div className="relative w-full max-w-5xl h-full flex flex-col">
          {/* Canvas Component */}
          <GameCanvas
            gameState={gameState}
            skin={activeSkin}
            densityMode={densityMode}
            onGameOver={handleGameOver}
            onVictory={handleVictory}
            onScoreUpdate={handleScoreUpdate}
          />

          {/* MENU OVERLAY */}
          {gameState === 'MENU' && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-black/65 backdrop-blur-sm rounded-2xl animate-fade-in text-center">
              {/* Badge & Designer signature */}
              <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-3 tracking-wider uppercase">
                <Flame className="w-3.5 h-3.5" />
                <span>Trò Chơi Sinh Tồn Điếu Thuốc</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white mb-1.5">
                ĐIẾU THUỐC TRÁNH MƯA
              </h1>

              {/* Creator Credit Accent */}
              <div className="flex items-center gap-1.5 text-xs text-amber-400/90 font-medium mb-4">
                <span>Designed by Ngô Mạnh Hải</span>
              </div>

              <p className="text-xs sm:text-sm text-neutral-300 max-w-md mb-5 leading-relaxed">
                Giữ cho điếu thuốc không bị dập tắt trước những giọt mưa đêm! Ăn các ngọn lửa{' '}
                <span className="text-orange-400 font-semibold">🔥</span> để thu ngắn chiều dài điếu thuốc, né giọt nước dễ hơn và chạm mốc{' '}
                <span className="text-amber-400 font-bold">100 điểm</span> nhận thưởng Bao Thuốc Hoàng Gia.
              </p>

              {/* Background music indicator on start */}
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-neutral-900/90 border border-amber-500/30 text-[11px] text-amber-300 mb-6">
                <Music className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Nhạc nền: <strong className="text-amber-200">Thăng Long trong Tim Tôi (Remix)</strong></span>
              </div>

              {/* 3 Quick Benefit Badges */}
              <div className="grid grid-cols-3 gap-2.5 max-w-lg w-full mb-7 text-xs">
                <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col items-center">
                  <Droplets className="w-4 h-4 text-sky-400 mb-1" />
                  <span className="font-semibold text-neutral-200">Tránh Giọt Nước</span>
                  <span className="text-[10px] text-neutral-400">Dính nước là tắt</span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col items-center">
                  <Flame className="w-4 h-4 text-orange-400 mb-1" />
                  <span className="font-semibold text-neutral-200">Ăn Ngọn Lửa</span>
                  <span className="text-[10px] text-neutral-400">Thu ngắn tàn thuốc</span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col items-center">
                  <Trophy className="w-4 h-4 text-amber-400 mb-1" />
                  <span className="font-semibold text-neutral-200">Mốc 100 Điểm</span>
                  <span className="text-[10px] text-neutral-400">Thưởng bao thuốc lá</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
                <button
                  onClick={handleStartGame}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-extrabold rounded-xl transition-all shadow-xl shadow-amber-950/50 text-sm tracking-wide"
                >
                  <Play className="w-4 h-4 fill-neutral-950" />
                  <span>BẮT ĐẦU CHƠI NGAY</span>
                </button>

                <button
                  onClick={() => setIsGuideOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 py-3.5 px-5 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 font-medium rounded-xl transition-colors text-xs border border-neutral-700/80"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Hướng dẫn</span>
                </button>
              </div>

              {/* Highscore footer */}
              {highScore > 0 && (
                <div className="mt-4 text-xs text-neutral-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Kỷ lục cao nhất của bạn: <strong className="text-amber-400 font-mono">{highScore} điểm</strong></span>
                </div>
              )}
            </div>
          )}

          {/* In-game quick control hint bar at bottom */}
          {gameState === 'PLAYING' && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none z-10 hidden sm:flex items-center gap-3.5 px-4 py-1.5 rounded-full bg-neutral-950/80 border border-neutral-800/80 backdrop-blur-xs text-[11px] text-neutral-400">
              <span>Di chuột hoặc chạm vuốt để né mưa</span>
              <span>·</span>
              <span className="text-orange-400 font-medium">Ăn lửa 🔥 để thu ngắn điếu thuốc</span>
              <span>·</span>
              <span className="text-amber-400/90 font-medium">Designed by Ngô Mạnh Hải</span>
            </div>
          )}
        </div>
      </main>

      {/* Global Footer with Designer Credit */}
      <footer className="w-full py-1.5 px-4 bg-neutral-950 border-t border-neutral-900 text-center text-[11px] text-neutral-500 flex items-center justify-center gap-2">
        <span>Designed by <strong className="text-neutral-300 font-medium">Ngô Mạnh Hải</strong></span>
        <span>·</span>
        <span className="flex items-center gap-1 text-amber-400/90 font-medium">
          <Music className="w-3 h-3 text-amber-400" />
          Thăng Long trong Tim Tôi (Remix)
        </span>
        <span>·</span>
        <span>Rain Ember 2026</span>
      </footer>

      {/* MODALS */}
      {/* 1. Victory 100-Point Reward Modal */}
      {gameState === 'VICTORY' && (
        <RewardModal
          score={score}
          flamesCount={flamesCollected}
          dodgedCount={rainDodged}
          timeElapsed={timeSurvived}
          rewardSkin={rewardSkin}
          isSkinEquipped={activeSkinId === 'royal_heritage'}
          onEquipSkin={handleSelectSkin}
          onContinue={() => setGameState('PLAYING')}
          onRestart={handleStartGame}
        />
      )}

      {/* 2. Game Over Modal */}
      {gameState === 'GAME_OVER' && (
        <GameOverModal
          score={score}
          highScore={highScore}
          flamesCount={flamesCollected}
          dodgedCount={rainDodged}
          timeElapsed={timeSurvived}
          onRestart={handleStartGame}
          onOpenCollection={() => setIsCollectionOpen(true)}
        />
      )}

      {/* 3. Gameplay Guide Modal */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onStartPlay={handleStartGame}
      />

      {/* 4. Pack Collection Modal */}
      <CollectionModal
        isOpen={isCollectionOpen}
        onClose={() => setIsCollectionOpen(false)}
        activeSkinId={activeSkinId}
        unlockedSkinIds={unlockedSkinIds}
        highScore={highScore}
        onSelectSkin={handleSelectSkin}
      />
    </div>
  );
}
