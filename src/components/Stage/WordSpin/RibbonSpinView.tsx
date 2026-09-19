import React from 'react';
import { SpinViewProps } from './types.ts';

export const RibbonSpinView: React.FC<SpinViewProps> = ({
  reel,
  currentIndex,
  targetWord
}) => {
  const windowSize = 5;
  const half = Math.floor(windowSize / 2);
  const visible: { item: typeof targetWord; offset: number }[] = [];

  for (let o = -half; o <= half; o++) {
    const idx = (currentIndex + o + reel.length) % reel.length;
    visible.push({ item: reel[idx] || targetWord, offset: o });
  }

  return (
    <div className="ribbon-spin-view">
      <div className="glass-ribbon-track">
        <div className="ribbon-border-edge top-edge" />
        <div className="ribbon-shimmer-sweep" />

        <div className="ribbon-words-stream">
          {visible.map(({ item, offset }) => {
            const isCenter = offset === 0;
            const absOffset = Math.abs(offset);
            const scale = 1 - absOffset * 0.14;
            const opacity = isCenter ? 1 : Math.max(0.2, 0.75 - absOffset * 0.25);
            const translateX = offset * 210;

            return (
              <div
                key={`${item.id}-${offset}`}
                className={`ribbon-word-item ${isCenter ? 'active-center' : ''}`}
                style={{
                  transform: `translateX(${translateX}px) scale(${scale})`,
                  opacity,
                  color: isCenter ? '#ffffff' : `rgba(224, 231, 255, ${Math.max(0.25, 0.8 - absOffset * 0.25)})`,
                  textShadow: isCenter
                    ? '0 0 24px rgba(255, 255, 255, 0.95), 0 0 45px rgba(165, 243, 252, 0.5)'
                    : 'none'
                }}
              >
                {isCenter && <span className="ribbon-bracket left">⟨</span>}
                <span className="word-text">{item.word}</span>
                {isCenter && <span className="ribbon-bracket right">⟩</span>}
              </div>
            );
          })}
        </div>

        <div className="ribbon-border-edge bottom-edge" />
      </div>
    </div>
  );
};
