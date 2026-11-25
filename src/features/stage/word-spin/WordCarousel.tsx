import React, { useCallback, useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react';
import { SpinItem } from './types.ts';
import {
  generateSpinReel,
  SPIN_SPEED_ITEMS_PER_MS,
  DECEL_DURATION_MS,
  plannedTargetIndex,
  brakePosition,
  chooseStopSlot,
  spinViewLookahead
} from './wordSpinEngine.ts';
import { DEFAULT_WORDS } from '@/data/defaultWords.ts';
import { STAGE_DURATION } from '@/features/session/stateMachine.ts';
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
  // Memoised so the fallback object keeps its identity between renders (the reel below
  // regenerates whenever finalTarget changes identity).
  const finalTarget = useMemo(
    () => targetItem || targetWord || pool[0] || { id: 'default', word: 'คุณค่าในตัวเอง', category: 'star', enabled: true },
    [targetItem, targetWord, pool]
  );
  const isQuestion = displayType === 'question';
  const spinSpeed = isQuestion ? SPIN_SPEED_ITEMS_PER_MS.question : SPIN_SPEED_ITEMS_PER_MS.keyword;

  // The target sits where an automatic spin (STAGE_DURATION['word-spin']) brakes at spin speed.
  const baseReel = useMemo(() => {
    const targetIndex = plannedTargetIndex(spinSpeed, STAGE_DURATION['word-spin']);
    return generateSpinReel(pool, finalTarget, Math.max(36, targetIndex + 10), `carousel_${Date.now()}`, targetIndex);
  }, [pool, finalTarget, spinSpeed]);

  // When a spin is stopped elsewhere (manual stop, pause), one off-screen slot becomes the target.
  const [rewrite, setRewrite] = useState<{ base: SpinItem[]; index: number } | null>(null);
  const reel = useMemo(() => {
    if (!rewrite || rewrite.base !== baseReel) return baseReel;
    const patched = baseReel.slice();
    patched[rewrite.index] = finalTarget;
    return patched;
  }, [baseReel, rewrite, finalTarget]);
  const reelRef = useRef(reel);
  reelRef.current = reel;
  const lookaheadRef = useRef(spinViewLookahead(mode, displayType));
  lookaheadRef.current = spinViewLookahead(mode, displayType);

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

    if (phase === 'pre-spin') {
      moveTo(0, true);
      return;
    }

    if (phase === 'word-decelerate') {
      const startPos = currentPosRef.current;
      const { stop, rewriteIndex } = chooseStopSlot(reelRef.current, finalTarget.id, startPos, spinSpeed, lookaheadRef.current);
      if (rewriteIndex !== null) setRewrite({ base: baseReel, index: rewriteIndex });
      decelStartRef.current = startPos;
      decelEndRef.current = stop;
    }

    const animate = (now: number) => {
      const elapsed = now - startTime;

      if (phase === 'word-spin') {
        moveTo(elapsed * spinSpeed);
        animId = requestAnimationFrame(animate);
      } else if (phase === 'word-decelerate') {
        const progress = Math.min(1, elapsed / DECEL_DURATION_MS);
        const start = decelStartRef.current;
        const end = decelEndRef.current;

        if (progress < 1) {
          moveTo(start + brakePosition(progress, end - start, spinSpeed));
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
    // Not on `reel`: rewriting one off-screen slot must not restart the brake.
  }, [phase, baseReel, finalTarget, spinSpeed, onSpinComplete, moveTo]);

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
