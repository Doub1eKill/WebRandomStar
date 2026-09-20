import React from 'react';
import { SpinViewProps } from './types.ts';
import { getDisplayText } from '../../../engine/wordSpinEngine.ts';

export const Perspective3DSpinView: React.FC<SpinViewProps> = ({
  reel,
  currentIndex,
  targetWord,
  floatOffset = currentIndex,
  displayType = 'keyword'
}) => {
  const windowRange = 5;
  const radius = 175; // px cylinder radius
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
        key: `persp3d-${itemIndex}`
      });
    }
  }

  return (
    <div className={`perspective-3d-spin-view ${displayType === 'question' ? 'is-question' : ''}`}>
      <div className="cylinder-vignette vignette-top" />

      <div className="cylinder-stage">
        {visible.map(({ item, relativeDistance, isCenter, key }) => {
          const absDist = Math.abs(relativeDistance);
          const proximity = Math.max(0, 1 - absDist * 0.85);
          const angleDeg = relativeDistance * (displayType === 'question' ? 30 : 34);
          const blurPx = Math.min(6, absDist * 1.8);
          const opacity = Math.max(0.1, Math.pow(Math.max(0, 1 - absDist * 0.24), 1.6));
          const starOpacity = Math.pow(proximity, 2.5);
          const text = getDisplayText(item);

          return (
            <div
              key={key}
              className={`cylinder-word-item ${isCenter ? 'active-center' : ''} ${displayType === 'question' ? 'is-question' : ''}`}
              style={{
                transform: `rotateX(${-angleDeg}deg) translateZ(${radius}px)`,
                filter: proximity > 0.3
                  ? `drop-shadow(0 0 ${Math.round(proximity * 18)}px rgba(255, 255, 255, 0.85))`
                  : `blur(${blurPx}px)`,
                opacity,
                color: `rgba(255, 255, 255, ${0.35 + 0.65 * proximity})`,
                textShadow: proximity > 0.25
                  ? `0 0 ${Math.round(proximity * 24)}px rgba(255, 255, 255, 0.95), 0 0 ${Math.round(proximity * 45)}px rgba(165, 243, 252, 0.5)`
                  : 'none'
              }}
            >
              <span className="word-accent-star left" style={{ opacity: starOpacity }}>✦</span>
              <span className="word-text">{text}</span>
              <span className="word-accent-star right" style={{ opacity: starOpacity }}>✦</span>
            </div>
          );
        })}
      </div>

      <div className="cylinder-vignette vignette-bottom" />
    </div>
  );
};
