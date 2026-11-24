import React from 'react';
import { SpinViewProps } from './types.ts';
import { getDisplayText } from './wordSpinEngine.ts';
import { SpinItemLook, useSpinItemDom } from './spinDom.ts';

const WINDOW_RANGE = 4;
const RADIUS = 175; // px cylinder radius

/** Look of the item at `itemIndex` when the reel is at `offset` (shared by render and per-frame DOM writes). */
function cylinderLook(itemIndex: number, offset: number, isQuestion: boolean): SpinItemLook {
  const relativeDistance = itemIndex - offset;
  const absDist = Math.abs(relativeDistance);
  const isCenter = absDist < 0.45;
  const proximity = Math.max(0, 1 - absDist * 0.85);
  const angleDeg = relativeDistance * (isQuestion ? 30 : 34);
  const opacity = Math.max(0.12, Math.pow(Math.max(0, 1 - absDist * 0.24), 1.6));
  return {
    className: `cylinder-word-item ${isCenter ? 'active-center' : ''} ${isQuestion ? 'is-question' : ''}`,
    style: {
      transform: `rotateX(${-angleDeg}deg) translateZ(${RADIUS}px)`,
      opacity,
      color: `rgba(255, 255, 255, ${0.4 + 0.6 * proximity})`
    },
    starOpacity: Math.pow(proximity, 2.5)
  };
}

export const Perspective3DSpinView: React.FC<SpinViewProps> = ({
  reel,
  currentIndex,
  targetWord,
  floatOffset = currentIndex,
  displayType = 'keyword',
  registerApply
}) => {
  const isQuestion = displayType === 'question';
  const refFor = useSpinItemDom((i, o) => cylinderLook(i, o, isQuestion), registerApply);
  const baseCenterInt = Math.round(floatOffset);
  const visible: { item: typeof targetWord; itemIndex: number; key: string }[] = [];

  for (let o = -WINDOW_RANGE; o <= WINDOW_RANGE; o++) {
    const itemIndex = baseCenterInt + o;
    const wrappedIdx = ((itemIndex % reel.length) + reel.length) % reel.length;
    if (Math.abs(itemIndex - floatOffset) <= WINDOW_RANGE + 0.6) {
      visible.push({ item: reel[wrappedIdx] || targetWord, itemIndex, key: `persp3d-${itemIndex}` });
    }
  }

  return (
    <div className={`perspective-3d-spin-view ${isQuestion ? 'is-question' : ''}`}>
      <div className="cylinder-vignette vignette-top" />

      <div className="cylinder-stage">
        {visible.map(({ item, itemIndex, key }) => {
          const look = cylinderLook(itemIndex, floatOffset, isQuestion);
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

      <div className="cylinder-vignette vignette-bottom" />
    </div>
  );
};
