import React from 'react';
import { SpinViewProps } from './types.ts';
import { getDisplayText } from '../../../engine/wordSpinEngine.ts';

export const VerticalSpinView: React.FC<SpinViewProps> = ({
  reel,
  currentIndex,
  targetWord,
  floatOffset = currentIndex,
  displayType = 'keyword'
}) => {
  const windowRange = 4;
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
    <div className={`vertical-spin-view ${displayType === 'question' ? 'is-question' : ''}`}>
      <div className="carousel-indicator indicator-top">
        <span className="indicator-diamond">◆</span>
      </div>

      <div className="carousel-reel-track">
        {visible.map(({ item, relativeDistance, isCenter, key }) => {
          const absDist = Math.abs(relativeDistance);
          const proximity = Math.max(0, 1 - absDist * 0.85);
          const scale = displayType === 'question'
            ? (0.75 + 0.28 * Math.pow(proximity, 1.4))
            : (0.68 + 0.38 * Math.pow(proximity, 1.4));
          const opacity = Math.max(0.08, Math.pow(Math.max(0, 1 - absDist * 0.25), 1.6));
          const translateY = relativeDistance * (displayType === 'question' ? 68 : 60);
          const starOpacity = Math.pow(proximity, 2.5);
          const text = getDisplayText(item);

          return (
            <div
              key={key}
              className={`carousel-word-item ${isCenter ? 'active-center' : ''} ${displayType === 'question' ? 'is-question' : ''}`}
              style={{
                transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
                opacity,
                color: `rgba(255, 255, 255, ${0.4 + 0.6 * proximity})`
              }}
            >
              <span className="word-accent-star left" style={{ opacity: starOpacity }}>✦</span>
              <span className="word-text">{text}</span>
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

