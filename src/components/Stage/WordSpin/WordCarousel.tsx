import React, { useEffect, useRef, useState } from 'react';
import { KeywordItem } from '../../../types/word.ts';
import { CrystalTiaraIcon } from '../CrystalIcons.tsx';
import {
  generateSpinReel,
  calculateContinuousDecelTarget,
  calculateQuinticDecel
} from '../../../engine/wordSpinEngine.ts';
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

  const [floatOffset, setFloatOffset] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentPosRef = useRef(0);
  const decelStartRef = useRef(0);
  const decelEndRef = useRef(0);

  useEffect(() => {
    let animId: number;
    const startTime = performance.now();
    const targetIdx = reel.length - 1;

    if (phase === 'pre-spin') {
      currentPosRef.current = 0;
      setFloatOffset(0);
      setCurrentIndex(0);
      return;
    }

    if (phase === 'word-decelerate') {
      const startPos = currentPosRef.current;
      const endPos = calculateContinuousDecelTarget(startPos, reel.length, targetIdx, 14);
      decelStartRef.current = startPos;
      decelEndRef.current = endPos;
    }

    const spinSpeed = 0.013; // items per ms (smooth high-speed cruise)
    const decelDuration = 2100; // ms to smoothly land on target

    const animate = (now: number) => {
      const elapsed = now - startTime;

      if (phase === 'word-spin') {
        const currentFloat = elapsed * spinSpeed;
        currentPosRef.current = currentFloat;
        setFloatOffset(currentFloat);
        const wrappedIndex = ((Math.round(currentFloat) % reel.length) + reel.length) % reel.length;
        setCurrentIndex(wrappedIndex);
        animId = requestAnimationFrame(animate);
      } else if (phase === 'word-decelerate') {
        const progress = Math.min(1, elapsed / decelDuration);
        const eased = calculateQuinticDecel(progress);
        const start = decelStartRef.current;
        const end = decelEndRef.current;
        const currentFloat = start + (end - start) * eased;

        currentPosRef.current = currentFloat;
        setFloatOffset(currentFloat);
        const wrappedIndex = ((Math.round(currentFloat) % reel.length) + reel.length) % reel.length;
        setCurrentIndex(wrappedIndex);

        if (progress < 1) {
          animId = requestAnimationFrame(animate);
        } else {
          currentPosRef.current = end;
          setFloatOffset(end);
          setCurrentIndex(targetIdx);
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
            floatOffset={floatOffset}
          />
        );
      case 'orbital':
        return (
          <OrbitalSpinView
            reel={reel}
            currentIndex={currentIndex}
            targetWord={finalTarget}
            phase={phase}
            floatOffset={floatOffset}
          />
        );
      case 'ribbon':
        return (
          <RibbonSpinView
            reel={reel}
            currentIndex={currentIndex}
            targetWord={finalTarget}
            phase={phase}
            floatOffset={floatOffset}
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
            floatOffset={floatOffset}
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
      </div>
    </div>
  );
};
