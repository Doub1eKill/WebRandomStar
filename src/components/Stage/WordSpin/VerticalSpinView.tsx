import React from 'react';
import { SpinViewProps } from './types.ts';

export const VerticalSpinView: React.FC<SpinViewProps> = ({
  reel,
  currentIndex,
  targetWord,
  floatOffset = currentIndex
}) => {
  const windowRange = 5;
  const centerFloat = floatOffset;
  const baseCenterInt = Math.round(centerFloat);
  const visible: { item: typeof targetWord; relativeDistance: number; isCenter: boolean; key: string }[] = [];

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
        key: `vertical-${itemIndex}`
      });
    }
  }

  return (
    <div className="vertical-spin-view">
      <div className="carousel-indicator indicator-top">
        <span className="indicator-diamond">◆</span>
      </div>

      <div className="carousel-reel-track">
        {visible.map(({ item, relativeDistance, isCenter, key }) => {
          const absDist = Math.abs(relativeDistance);
          const proximity = Math.max(0, 1 - absDist * 0.85);
          const scale = 0.68 + 0.38 * Math.pow(proximity, 1.4);
          const opacity = Math.max(0.08, Math.pow(Math.max(0, 1 - absDist * 0.25), 1.6));
          const translateY = relativeDistance * 60;
          const starOpacity = Math.pow(proximity, 2.5);

          return (
            <div
              key={key}
              className={`carousel-word-item ${isCenter ? 'active-center' : ''}`}
              style={{
                transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
                opacity,
                color: `rgba(255, 255, 255, ${0.35 + 0.65 * proximity})`,
                textShadow: proximity > 0.25
                  ? `0 0 ${Math.round(proximity * 24)}px rgba(255, 255, 255, 0.95), 0 0 ${Math.round(proximity * 45)}px rgba(165, 243, 252, 0.5)`
                  : 'none',
                filter: proximity > 0.3
                  ? `drop-shadow(0 0 ${Math.round(proximity * 16)}px rgba(255, 255, 255, 0.8))`
                  : 'none'
              }}
            >
              <span className="word-accent-star left" style={{ opacity: starOpacity }}>✦</span>
              <span className="word-text">{item.word}</span>
              <span className="word-accent-star right" style={{ opacity: starOpacity }}>✦</span>
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
