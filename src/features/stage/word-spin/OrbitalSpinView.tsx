import React from 'react';
import { SpinViewProps } from './types.ts';
import { CrystalTiaraIcon } from '@/features/stage/overlay/CrystalIcons.tsx';
import { getDisplayText } from './wordSpinEngine.ts';
import { SpinItemLook, useSpinItemDom } from './spinDom.ts';

const TOTAL_SLOTS = 8;
const RADIUS_Y = 66; // Vertical ellipse radius (inclined perspective)

/** Look of the item at `itemIndex` when the reel is at `offset` (shared by render and per-frame DOM writes). */
function orbitalLook(itemIndex: number, offset: number, isQuestion: boolean): SpinItemLook {
  const radiusX = isQuestion ? 280 : 240; // Horizontal ellipse radius
  const relativeDistance = itemIndex - offset;
  const absDist = Math.abs(relativeDistance % TOTAL_SLOTS);
  const isCenter = absDist < 0.45 || Math.abs(absDist - TOTAL_SLOTS) < 0.45;

  const angle = (Math.PI / 2) - (relativeDistance * (2 * Math.PI / TOTAL_SLOTS));
  const posX = Math.cos(angle) * radiusX;
  const posY = Math.sin(angle) * RADIUS_Y;

  const depthProgress = (Math.sin(angle) + 1) / 2; // 0 (back) to 1 (front)
  const proximity = Math.max(0, 1 - Math.min(Math.abs(relativeDistance % TOTAL_SLOTS), Math.abs((relativeDistance % TOTAL_SLOTS) - TOTAL_SLOTS)));
  const scale = isQuestion
    ? (0.7 + depthProgress * 0.35)
    : (0.65 + depthProgress * 0.45);
  const opacity = Math.max(0.2, 0.35 + depthProgress * 0.65);
  const zIndex = Math.round(depthProgress * 20) + (isCenter ? 10 : 0);
  return {
    className: `orbital-word-item ${isCenter ? 'active-center' : ''} ${isQuestion ? 'is-question' : ''}`,
    style: {
      transform: `translate3d(${posX}px, ${posY}px, 0) scale(${scale})`,
      opacity,
      zIndex,
      color: `rgba(255, 255, 255, ${0.4 + 0.6 * depthProgress})`
    },
    starOpacity: Math.pow(proximity, 2.5)
  };
}

export const OrbitalSpinView: React.FC<SpinViewProps> = ({
  reel,
  currentIndex,
  targetWord,
  floatOffset = currentIndex,
  displayType = 'keyword',
  registerApply
}) => {
  const isQuestion = displayType === 'question';
  const refFor = useSpinItemDom((i, o) => orbitalLook(i, o, isQuestion), registerApply);
  const baseCenterInt = Math.round(floatOffset);
  const wordsOnRing: { item: typeof targetWord; itemIndex: number; key: string }[] = [];

  for (let s = 0; s < TOTAL_SLOTS; s++) {
    const itemIndex = baseCenterInt + s;
    const wrappedIdx = ((itemIndex % reel.length) + reel.length) % reel.length;
    wordsOnRing.push({ item: reel[wrappedIdx] || targetWord, itemIndex, key: `orbital-${itemIndex}` });
  }

  return (
    <div className={`orbital-spin-view ${isQuestion ? 'is-question' : ''}`}>
      {/* Radiant Tiara Core */}
      <div className="orbital-core-tiara">
        <div className="core-glow-aura" />
        <CrystalTiaraIcon size={38} />
      </div>

      {/* Orbit Ring Visual Ellipse */}
      <div className="orbital-ring-track" />

      {/* Orbiting Words */}
      <div className="orbital-words-container">
        {wordsOnRing.map(({ item, itemIndex, key }) => {
          const look = orbitalLook(itemIndex, floatOffset, isQuestion);
          const text = getDisplayText(item);

          return (
            <div key={key} ref={refFor(itemIndex)} className={look.className} style={look.style}>
              <span className="word-accent-star left" style={{ opacity: look.starOpacity }}>✦</span>
              <span className="word-text">{text}</span>
              <span className="word-accent-star right" style={{ opacity: look.starOpacity }}>✦</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
