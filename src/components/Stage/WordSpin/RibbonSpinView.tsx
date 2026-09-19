import React from 'react';
import { SpinViewProps } from './types.ts';

export const RibbonSpinView: React.FC<SpinViewProps> = ({
  reel,
  currentIndex,
  targetWord,
  floatOffset = currentIndex
}) => {
  const windowRange = 5;
  const visible: { item: typeof targetWord; relativeDistance: number; isCenter: boolean; key: string }[] = [];

  const centerFloat = floatOffset;
  const baseCenterInt = Math.round(centerFloat);

  for (let o = -windowRange; o <= windowRange; o++) {
    const itemIndex = baseCenterInt + o;
    const wrappedIdx = ((itemIndex % reel.length) + reel.length) % reel.length;
    const relativeDistance = itemIndex - centerFloat;
    const absDist = Math.abs(relativeDistance);

    if (absDist <= windowRange + 0.6) {
      visible.push({
        item: reel[wrappedIdx] || targetWord,
        relativeDistance,
        isCenter: absDist < 0.45,
        key: `ribbon-${itemIndex}`
      });
    }
  }

  return (
    <div className="ribbon-spin-view">
      <div className="glass-ribbon-track">
        <div className="ribbon-border-edge top-edge" />
        <div className="ribbon-shimmer-sweep" />

        {/* Fixed Center Luxury Viewfinder Reticle */}
        <div className="ribbon-center-reticle">
          <span className="reticle-bracket left">⟨</span>
          <div className="reticle-center-glow" />
          <span className="reticle-bracket right">⟩</span>
        </div>

        <div className="ribbon-words-stream">
          {visible.map(({ item, relativeDistance, isCenter, key }) => {
            const absDist = Math.abs(relativeDistance);
            const proximity = Math.max(0, 1 - absDist * 0.85);
            const scale = 0.65 + 0.42 * Math.pow(proximity, 1.4);
            const opacity = Math.max(0.06, Math.pow(Math.max(0, 1 - absDist * 0.26), 1.6));
            const translateX = relativeDistance * 460;

            return (
              <div
                key={key}
                className={`ribbon-word-item ${isCenter ? 'active-center' : ''}`}
                style={{
                  transform: `translate3d(${translateX}px, 0, 0) scale(${scale})`,
                  opacity,
                  color: `rgba(255, 255, 255, ${0.4 + 0.6 * proximity})`,
                  textShadow: proximity > 0.25
                    ? `0 0 ${Math.round(proximity * 32)}px rgba(255, 255, 255, 1.0), 0 0 ${Math.round(proximity * 65)}px rgba(168, 85, 247, 0.8), 0 0 ${Math.round(proximity * 90)}px rgba(56, 189, 248, 0.6)`
                    : 'none',
                  filter: proximity > 0.3
                    ? `drop-shadow(0 0 ${Math.round(proximity * 24)}px rgba(255, 255, 255, 0.95))`
                    : 'none'
                }}
              >
                <span className="word-text">{item.word}</span>
              </div>
            );
          })}
        </div>

        <div className="ribbon-border-edge bottom-edge" />
      </div>
    </div>
  );
};
