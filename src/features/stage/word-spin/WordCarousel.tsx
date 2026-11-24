import React, { useCallback, useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react';
import { SpinItem } from './types.ts';
import {
  generateSpinReel,
  calculateContinuousDecelTarget,
  calculateQuinticDecel
} from './wordSpinEngine.ts';
import { DEFAULT_WORDS } from '@/data/defaultWords.ts';
import { VerticalSpinView } from './VerticalSpinView.tsx';
import { Perspective3DSpinView } from './Perspective3DSpinView.tsx';
import { OrbitalSpinView } from './OrbitalSpinView.tsx';
import { RibbonSpinView } from './RibbonSpinView.tsx';
import { ApplyOffset } from './spinDom.ts';

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

  // PF4: `floatOffset` is the reel position React last rendered. It only changes when the
  // centred slot moves to another integer; frames in between go through `applyRef`, which
  // writes the same styles straight to the DOM (see spinDom.ts).
  const [floatOffset, setFloatOffset] = useState(0);

  const currentPosRef = useRef(0);
  const renderedPosRef = useRef(0);
  const decelStartRef = useRef(0);
  const decelEndRef = useRef(0);
  const applyRef = useRef<ApplyOffset | null>(null);
  const registerApply = useCallback((apply: ApplyOffset | null) => { applyRef.current = apply; }, []);

  /** Move the reel: re-render when the visible slot set changes, otherwise patch the DOM. */
  const moveTo = useCallback((pos: number, forceRender = false) => {
    currentPosRef.current = pos;
    if (forceRender || Math.round(pos) !== Math.round(renderedPosRef.current)) {
      renderedPosRef.current = pos;
      setFloatOffset(pos);
    }
    applyRef.current?.(pos);
  }, []);

  // After any commit (ours or a parent's), make sure the DOM shows the true current position,
  // not the possibly older position React rendered with.
  useLayoutEffect(() => {
    applyRef.current?.(currentPosRef.current);
  });

  useEffect(() => {
    let animId: number;
    const startTime = performance.now();
    const targetIdx = reel.length - 1;

    if (phase === 'pre-spin') {
      moveTo(0, true);
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
        moveTo(elapsed * spinSpeed);
        animId = requestAnimationFrame(animate);
      } else if (phase === 'word-decelerate') {
        const progress = Math.min(1, elapsed / decelDuration);
        const eased = calculateQuinticDecel(progress);
        const start = decelStartRef.current;
        const end = decelEndRef.current;

        if (progress < 1) {
          moveTo(start + (end - start) * eased);
          animId = requestAnimationFrame(animate);
        } else {
          moveTo(end, true); // settle: React state ends exactly on the target, as before
          if (onSpinComplete) {
            onSpinComplete();
          }
        }
      }
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [phase, reel, displayType, onSpinComplete, moveTo]);

  const currentIndex = ((Math.round(floatOffset) % reel.length) + reel.length) % reel.length;

  const viewProps = {
    reel,
    currentIndex,
    targetWord: finalTarget,
    phase,
    floatOffset,
    displayType,
    registerApply
  };

  const renderActiveView = () => {
    switch (mode) {
      case '3d':
        return <Perspective3DSpinView {...viewProps} />;
      case 'orbital':
        return <OrbitalSpinView {...viewProps} />;
      case 'ribbon':
        return <RibbonSpinView {...viewProps} />;
      case 'vertical':
      default:
        return <VerticalSpinView {...viewProps} />;
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
