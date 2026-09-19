import React, { useEffect, useState } from 'react';
import { KeywordItem } from '../../../types/word.ts';
import { CrystalTiaraIcon } from '../CrystalIcons.tsx';
import { generateSpinReel, calculateDecelerationEasing } from '../../../engine/wordSpinEngine.ts';
import { DEFAULT_WORDS } from '../../../data/defaultWords.ts';
import { VerticalSpinView } from './VerticalSpinView.tsx';
import { Perspective3DSpinView } from './Perspective3DSpinView.tsx';
import { OrbitalSpinView } from './OrbitalSpinView.tsx';
import { RibbonSpinView } from './RibbonSpinView.tsx';

interface WordCarouselProps {
  allWords?: KeywordItem[];
  targetWord?: KeywordItem | null;
  phase: 'pre-spin' | 'word-spin' | 'word-decelerate';
  durationMs?: number;
  mode?: 'vertical' | 'orbital' | '3d' | 'ribbon';
  onSpinComplete?: () => void;
}

export const WordCarousel: React.FC<WordCarouselProps> = ({
  allWords = DEFAULT_WORDS,
  targetWord,
  phase,
  mode = 'vertical',
  onSpinComplete
}) => {
  const finalTarget = targetWord || allWords[0] || { id: 'default', word: 'ความฝัน', category: 'moon', enabled: true };
  const [reel] = useState<KeywordItem[]>(() =>
    generateSpinReel(allWords, finalTarget, 36, `carousel_${Date.now()}`)
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let animId: number;
    const startTime = performance.now();
    const spinDuration = phase === 'word-decelerate' ? 2000 : 2500;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / spinDuration);

      if (phase === 'pre-spin') {
        setCurrentIndex(0);
        return;
      }

      if (phase === 'word-spin') {
        // High speed continuous cycling
        const idx = Math.floor((elapsed / 60) % (reel.length - 1));
        setCurrentIndex(idx);
        animId = requestAnimationFrame(animate);
      } else if (phase === 'word-decelerate') {
        // Smooth cubic deceleration landing on reel.length - 1 (targetWord)
        const eased = calculateDecelerationEasing(progress);
        const startOffset = Math.floor(reel.length * 0.4);
        const remainingSteps = reel.length - 1 - startOffset;
        const targetIdx = Math.min(reel.length - 1, startOffset + Math.floor(eased * remainingSteps));
        setCurrentIndex(targetIdx);

        if (progress < 1) {
          animId = requestAnimationFrame(animate);
        } else {
          setCurrentIndex(reel.length - 1);
          if (onSpinComplete) {
            onSpinComplete();
          }
        }
      }
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [phase, reel, onSpinComplete]);

  const currentWord = reel[currentIndex] || finalTarget;

  const getModeTitle = () => {
    switch (mode) {
      case '3d':
        return '✦ 3D PERSPECTIVE SPIN ✦';
      case 'orbital':
        return '✦ CIRCULAR ORBITAL WORDS ✦';
      case 'ribbon':
        return '✦ ROYAL RIBBON STREAM ✦';
      case 'vertical':
      default:
        return '✦ ROYAL WORD SELECTION ✦';
    }
  };

  const renderActiveView = () => {
    switch (mode) {
      case '3d':
        return (
          <Perspective3DSpinView
            reel={reel}
            currentIndex={currentIndex}
            targetWord={finalTarget}
            phase={phase}
          />
        );
      case 'orbital':
        return (
          <OrbitalSpinView
            reel={reel}
            currentIndex={currentIndex}
            targetWord={finalTarget}
            phase={phase}
          />
        );
      case 'ribbon':
        return (
          <RibbonSpinView
            reel={reel}
            currentIndex={currentIndex}
            targetWord={finalTarget}
            phase={phase}
          />
        );
      case 'vertical':
      default:
        return (
          <VerticalSpinView
            reel={reel}
            currentIndex={currentIndex}
            targetWord={finalTarget}
            phase={phase}
          />
        );
    }
  };

  return (
    <div className={`word-carousel-container mode-${mode}`}>
      <div className="carousel-ambient-glow" />

      <div className="carousel-header">
        <CrystalTiaraIcon size={20} />
        <div className="carousel-title-badge">{getModeTitle()}</div>
      </div>

      <div className="carousel-stage-frame glassmorphism">
        {renderActiveView()}
      </div>

      <div className="carousel-footer-info">
        <div className="active-theme-caption">
          {currentWord.englishTheme || 'Theme Keyword'}
        </div>
        <div className="spin-speed-indicator">
          <span className={`speed-dot ${phase === 'word-spin' ? 'pulse-fast' : 'pulse-slow'}`} />
          <span>{phase === 'word-spin' ? 'หมุนด้วยความเร็วสูง...' : phase === 'word-decelerate' ? 'กำลังชะลอเพื่อเลือกคำ...' : 'พร้อมเริ่มสุ่ม'}</span>
        </div>
      </div>
    </div>
  );
};
