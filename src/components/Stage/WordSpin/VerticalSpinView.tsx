import React from 'react';
import { SpinViewProps } from './types.ts';

export const VerticalSpinView: React.FC<SpinViewProps> = ({
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

  return (
    <div className="vertical-spin-view">
      <div className="carousel-indicator indicator-top">
        <span className="indicator-diamond">◆</span>
      </div>

      <div className="carousel-reel-track">
        {visible.map(({ item, offset }) => {
          const isCenter = offset === 0;
          const absOffset = Math.abs(offset);
          const scale = 1 - absOffset * 0.12;
          const opacity = isCenter ? 1 : Math.max(0.15, 0.7 - absOffset * 0.22);
          const translateY = offset * 56;

          return (
            <div
              key={`${item.id}-${offset}`}
              className={`carousel-word-item ${isCenter ? 'active-center' : ''}`}
              style={{
                transform: `translateY(${translateY}px) scale(${scale})`,
                opacity,
                color: isCenter ? '#ffffff' : `rgba(255, 255, 255, ${Math.max(0.2, 0.85 - absOffset * 0.25)})`,
                textShadow: isCenter
                  ? '0 0 24px rgba(255, 255, 255, 0.95), 0 0 45px rgba(165, 243, 252, 0.45)'
                  : 'none',
                filter: isCenter ? 'drop-shadow(0 0 16px rgba(255, 255, 255, 0.8))' : 'none'
              }}
            >
              {isCenter && <span className="word-accent-star left">✦</span>}
              <span className="word-text">{item.word}</span>
              {isCenter && <span className="word-accent-star right">✦</span>}
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
