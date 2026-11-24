import React from 'react';
import { SpinViewProps } from './types.ts';
import { getDisplayText } from '../../../engine/wordSpinEngine.ts';
import { SpinItemLook, useSpinItemDom } from './spinDom.ts';

const WINDOW_RANGE = 4;

/** Look of the item at `itemIndex` when the reel is at `offset` (shared by render and per-frame DOM writes). */
function verticalLook(itemIndex: number, offset: number, isQuestion: boolean): SpinItemLook {
  const relativeDistance = itemIndex - offset;
  const absDist = Math.abs(relativeDistance);
  const isCenter = absDist < 0.45;
  const proximity = Math.max(0, 1 - absDist * 0.85);
  const scale = isQuestion
    ? (0.75 + 0.28 * Math.pow(proximity, 1.4))
    : (0.68 + 0.38 * Math.pow(proximity, 1.4));
  const opacity = Math.max(0.08, Math.pow(Math.max(0, 1 - absDist * 0.25), 1.6));
  const translateY = relativeDistance * (isQuestion ? 68 : 60);
  return {
    className: `carousel-word-item ${isCenter ? 'active-center' : ''} ${isQuestion ? 'is-question' : ''}`,
    style: {
      transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
      opacity,
      color: `rgba(255, 255, 255, ${0.4 + 0.6 * proximity})`
    },
    starOpacity: Math.pow(proximity, 2.5)
  };
}

export const VerticalSpinView: React.FC<SpinViewProps> = ({
  reel,
  currentIndex,
  targetWord,
  floatOffset = currentIndex,
  displayType = 'keyword',
  registerApply
}) => {
  const isQuestion = displayType === 'question';
  const refFor = useSpinItemDom((i, o) => verticalLook(i, o, isQuestion), registerApply);
  const baseCenterInt = Math.round(floatOffset);
  const visible: { item: typeof targetWord; itemIndex: number; key: string }[] = [];

  for (let o = -WINDOW_RANGE; o <= WINDOW_RANGE; o++) {
    const itemIndex = baseCenterInt + o;
    const wrappedIdx = ((itemIndex % reel.length) + reel.length) % reel.length;
    if (Math.abs(itemIndex - floatOffset) <= WINDOW_RANGE + 0.6) {
      visible.push({ item: reel[wrappedIdx] || targetWord, itemIndex, key: `vertical-${itemIndex}` });
    }
  }

  return (
    <div className={`vertical-spin-view ${isQuestion ? 'is-question' : ''}`}>
      <div className="carousel-indicator indicator-top">
        <span className="indicator-diamond">◆</span>
      </div>

      <div className="carousel-reel-track">
        {visible.map(({ item, itemIndex, key }) => {
          const look = verticalLook(itemIndex, floatOffset, isQuestion);
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

      <div className="carousel-indicator indicator-bottom">
        <span className="indicator-diamond">◆</span>
      </div>
    </div>
  );
};
