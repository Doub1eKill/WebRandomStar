import React, { useEffect, useRef, useState, useMemo } from 'react';
import { SpinItem } from './types.ts';
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
  items?: SpinItem[];
  allWords?: SpinItem[];
  targetWord?: SpinItem | null;
  targetItem?: SpinItem | null;
  phase: 'pre-spin' | 'word-spin' | 'word-decelerate';
  durationMs?: number;
  mode?: 'vertical' | 'orbital' | '3d' | 'ribbon';
  displayType?: 'keyword' | 'question';
  onSpinComplete?: () => void;
}

export const WordCarousel: React.FC<WordCarouselProps> = ({
  items,
  allWords,
  targetWord,
  targetItem,
  phase,
  mode = 'vertical',
  displayType = 'keyword',
  onSpinComplete
}) => {
  const pool = items || allWords || DEFAULT_WORDS;
  const finalTarget = targetItem || targetWord || pool[0] || { id: 'default', word: 'ความฝัน', category: 'moon', enabled: true };
  const reel = useMemo(
    () => generateSpinReel(pool, finalTarget, 36, `carousel_${Date.now()}`),
    // Re-generate only when pool or finalTarget changes
    [pool, finalTarget]
  );

  const [floatOffset, setFloatOffset] = useState(0);

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
      return;
    }

    const isQuestion = displayType === 'question';
    const runway = isQuestion ? 8 : 14;
    const spinSpeed = isQuestion ? 0.0038 : 0.013; // items per ms
    const decelDuration = isQuestion ? 2500 : 2100; // ms

    if (phase === 'word-decelerate') {
      const startPos = currentPosRef.current;
      const endPos = calculateContinuousDecelTarget(startPos, reel.length, targetIdx, runway);
      decelStartRef.current = startPos;
      decelEndRef.current = endPos;
    }

    const animate = (now: number) => {
      const elapsed = now - startTime;

      if (phase === 'word-spin') {
        const currentFloat = elapsed * spinSpeed;
        currentPosRef.current = currentFloat;
        setFloatOffset(currentFloat);
        animId = requestAnimationFrame(animate);
      } else if (phase === 'word-decelerate') {
        const progress = Math.min(1, elapsed / decelDuration);
        const eased = calculateQuinticDecel(progress);
        const start = decelStartRef.current;
        const end = decelEndRef.current;
        const currentFloat = start + (end - start) * eased;

        currentPosRef.current = currentFloat;
        setFloatOffset(currentFloat);

        if (progress < 1) {
          animId = requestAnimationFrame(animate);
        } else {
          currentPosRef.current = end;
          setFloatOffset(end);
          if (onSpinComplete) {
            onSpinComplete();
          }
        }
      }
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [phase, reel, displayType, onSpinComplete]);

  const currentIndex = ((Math.round(floatOffset) % reel.length) + reel.length) % reel.length;

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
            displayType={displayType}
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
            displayType={displayType}
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
            displayType={displayType}
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
            displayType={displayType}
          />
        );
    }
  };

  return (
    <div className={`word-carousel-container mode-${mode}`}>
      <div className="carousel-stage-frame">
        {renderActiveView()}
      </div>
    </div>
  );
};

