import React, { useEffect, useState } from 'react';
import { KeywordItem } from '../../../types/word.ts';
import { CrystalTiaraIcon } from '../CrystalIcons.tsx';
import { generateSpinReel, calculateDecelerationEasing } from '../../../engine/wordSpinEngine.ts';
import { DEFAULT_WORDS } from '../../../data/defaultWords.ts';

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

  // Active visible window of words around currentIndex
  const getVisibleItems = () => {
    const visible: { item: KeywordItem; offset: number }[] = [];
    const windowSize = mode === '3d' ? 5 : 7;
    const half = Math.floor(windowSize / 2);

    for (let o = -half; o <= half; o++) {
      const idx = (currentIndex + o + reel.length) % reel.length;
      visible.push({ item: reel[idx], offset: o });
    }
    return visible;
  };

  const visibleItems = getVisibleItems();
  const currentWord = reel[currentIndex] || finalTarget;

  return (
    <div className={`word-carousel-container mode-${mode}`}>
      <div className="carousel-ambient-glow" />

      <div className="carousel-header">
        <CrystalTiaraIcon size={20} />
        <div className="carousel-title-badge">✦ ROYAL WORD SELECTION ✦</div>
      </div>

      <div className="carousel-stage-frame glassmorphism">
        <div className="carousel-indicator indicator-top">
          <span className="indicator-diamond">◆</span>
        </div>

        <div className="carousel-reel-track">
          {visibleItems.map(({ item, offset }) => {
            const isCenter = offset === 0;
            const absOffset = Math.abs(offset);
            const scale = 1 - absOffset * 0.12;
            const opacity = isCenter ? 1 : Math.max(0.15, 0.7 - absOffset * 0.22);
            const translateY = offset * 56;

            return (
              <div
                key={`${item.id}-${offset}`}
                className={`carousel-word-item ${isCenter ? 'active-center' : ''}`}
                style={{
                  transform: `translateY(${translateY}px) scale(${scale})`,
                  opacity,
                  color: isCenter ? '#ffffff' : `rgba(255, 255, 255, ${Math.max(0.2, 0.85 - absOffset * 0.25)})`,
                  textShadow: isCenter
                    ? '0 0 24px rgba(255, 255, 255, 0.95), 0 0 45px rgba(165, 243, 252, 0.45)'
                    : 'none',
                  filter: isCenter ? 'drop-shadow(0 0 16px rgba(255, 255, 255, 0.8))' : 'none'
                }}
              >
                {isCenter && <span className="word-accent-star left">✦</span>}
                <span className="word-text">{item.word}</span>
                {isCenter && <span className="word-accent-star right">✦</span>}
              </div>
            );
          })}
        </div>

        <div className="carousel-indicator indicator-bottom">
          <span className="indicator-diamond">◆</span>
        </div>
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
