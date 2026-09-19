import React from 'react';
import { SpinViewProps } from './types.ts';

export const Perspective3DSpinView: React.FC<SpinViewProps> = ({
  reel,
  currentIndex,
  targetWord
}) => {
  const windowSize = 7;
  const half = Math.floor(windowSize / 2);
  const visible: { item: typeof targetWord; offset: number }[] = [];

  for (let o = -half; o <= half; o++) {
    const idx = (currentIndex + o + reel.length) % reel.length;
    visible.push({ item: reel[idx] || targetWord, offset: o });
  }

  const radius = 150; // px cylinder radius

  return (
    <div className="perspective-3d-spin-view">
      <div className="cylinder-vignette vignette-top" />

      <div className="cylinder-stage">
        {visible.map(({ item, offset }) => {
          const isCenter = offset === 0;
          const absOffset = Math.abs(offset);
          const angleDeg = offset * 38;
          const blurPx = absOffset * 2.2;
          const opacity = isCenter ? 1 : Math.max(0.2, 0.85 - absOffset * 0.22);

          return (
            <div
              key={`${item.id}-${offset}`}
              className={`cylinder-word-item ${isCenter ? 'active-center' : ''}`}
              style={{
                transform: `rotateX(${-angleDeg}deg) translateZ(${radius}px)`,
                filter: isCenter ? 'drop-shadow(0 0 16px rgba(255, 255, 255, 0.85))' : `blur(${blurPx}px)`,
                opacity,
                color: isCenter ? '#ffffff' : `rgba(224, 231, 255, ${Math.max(0.3, 0.8 - absOffset * 0.2)})`
              }}
            >
              {isCenter && <span className="word-accent-star left">✦</span>}
              <span className="word-text">{item.word}</span>
              {isCenter && <span className="word-accent-star right">✦</span>}
            </div>
          );
        })}
      </div>

      <div className="cylinder-vignette vignette-bottom" />
    </div>
  );
};
