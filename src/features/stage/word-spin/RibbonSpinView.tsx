import React from 'react';
import { SpinViewProps } from './types.ts';
import { getDisplayText } from './wordSpinEngine.ts';
import { SpinItemLook, useSpinItemDom } from './spinDom.ts';

/** Look of the item at `itemIndex` when the reel is at `offset` (shared by render and per-frame DOM writes). */
function ribbonLook(itemIndex: number, offset: number, isQuestion: boolean): SpinItemLook {
  const relativeDistance = itemIndex - offset;
  const absDist = Math.abs(relativeDistance);
  const isCenter = absDist < 0.45;
  const proximity = Math.max(0, 1 - absDist * 0.85);
  const scale = isQuestion
    ? (0.85 + 0.2 * Math.pow(proximity, 1.4))
    : (0.65 + 0.42 * Math.pow(proximity, 1.4));
  const opacity = isQuestion
    ? (isCenter ? 1 : Math.max(0, Math.pow(Math.max(0, 1 - absDist * 0.55), 2.2)))
    : Math.max(0.06, Math.pow(Math.max(0, 1 - absDist * 0.26), 1.6));
  const translateX = relativeDistance * (isQuestion ? 920 : 460);
  return {
    className: `ribbon-word-item ${isCenter ? 'active-center' : ''} ${isQuestion ? 'is-question' : ''}`,
    style: {
      transform: `translate3d(${translateX}px, 0, 0) scale(${scale})`,
      opacity,
      color: `rgba(255, 255, 255, ${0.45 + 0.55 * proximity})`
    }
  };
}

export const RibbonSpinView: React.FC<SpinViewProps> = ({
  reel,
  currentIndex,
  targetWord,
  floatOffset = currentIndex,
  displayType = 'keyword',
  registerApply
}) => {
  const isQuestion = displayType === 'question';
  const windowRange = isQuestion ? 2 : 4;
  const refFor = useSpinItemDom((i, o) => ribbonLook(i, o, isQuestion), registerApply);
  const baseCenterInt = Math.round(floatOffset);
  const visible: { item: typeof targetWord; itemIndex: number; key: string }[] = [];

  for (let o = -windowRange; o <= windowRange; o++) {
    const itemIndex = baseCenterInt + o;
    const wrappedIdx = ((itemIndex % reel.length) + reel.length) % reel.length;
    if (Math.abs(itemIndex - floatOffset) <= windowRange + 0.6) {
      visible.push({ item: reel[wrappedIdx] || targetWord, itemIndex, key: `ribbon-${itemIndex}` });
    }
  }

  return (
    <div className={`ribbon-spin-view ${isQuestion ? 'is-question' : ''}`}>
      <div className="glass-ribbon-track">
        <div className="ribbon-border-edge top-edge" />
        <div className="ribbon-shimmer-sweep" />

        {/* Center Luxury Viewfinder Reticle */}
        <div className={`ribbon-center-reticle ${isQuestion ? 'is-question' : ''}`}>
          {!isQuestion && <span className="reticle-bracket left">⟨</span>}
          <div className="reticle-center-glow" />
          {!isQuestion && <span className="reticle-bracket right">⟩</span>}
        </div>

        <div className="ribbon-words-stream">
          {visible.map(({ item, itemIndex, key }) => {
            const look = ribbonLook(itemIndex, floatOffset, isQuestion);
            const text = getDisplayText(item);

            return (
              <div key={key} ref={refFor(itemIndex)} className={look.className} style={look.style}>
                {isQuestion ? (
                  <div className="ribbon-question-capsule">
                    {item?.category && (
                      <span className="ribbon-question-cat">✦ หมวด: {String(item.category).toUpperCase()} ✦</span>
                    )}
                    <span className="word-text">{text}</span>
                  </div>
                ) : (
                  <span className="word-text">{text}</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="ribbon-border-edge bottom-edge" />
      </div>
    </div>
  );
};
