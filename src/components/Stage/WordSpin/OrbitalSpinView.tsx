import React from 'react';
import { SpinViewProps } from './types.ts';
import { CrystalTiaraIcon } from '../CrystalIcons.tsx';
import { getDisplayText } from '../../../engine/wordSpinEngine.ts';

export const OrbitalSpinView: React.FC<SpinViewProps> = ({
  reel,
  currentIndex,
  targetWord,
  floatOffset = currentIndex,
  displayType = 'keyword'
}) => {
  const totalSlots = 8;
  const radiusX = displayType === 'question' ? 280 : 240; // Horizontal ellipse radius
  const radiusY = 66;  // Vertical ellipse radius (inclined perspective)

  const centerFloat = floatOffset;
  const baseCenterInt = Math.round(centerFloat);
  const wordsOnRing: { item: typeof targetWord; relativeDistance: number; isCenter: boolean; key: string }[] = [];

  for (let s = 0; s < totalSlots; s++) {
    const itemIndex = baseCenterInt + s;
    const wrappedIdx = ((itemIndex % reel.length) + reel.length) % reel.length;
    const relativeDistance = itemIndex - centerFloat;
    const absDist = Math.abs(relativeDistance % totalSlots);

    wordsOnRing.push({
      item: reel[wrappedIdx] || targetWord,
      relativeDistance,
      isCenter: absDist < 0.45 || Math.abs(absDist - totalSlots) < 0.45,
      key: `orbital-${itemIndex}`
    });
  }

  return (
    <div className={`orbital-spin-view ${displayType === 'question' ? 'is-question' : ''}`}>
      {/* Radiant Tiara Core */}
      <div className="orbital-core-tiara">
        <div className="core-glow-aura" />
        <CrystalTiaraIcon size={38} />
      </div>

      {/* Orbit Ring Visual Ellipse */}
      <div className="orbital-ring-track" />

      {/* Orbiting Words */}
      <div className="orbital-words-container">
        {wordsOnRing.map(({ item, relativeDistance, isCenter, key }) => {
          const angle = (Math.PI / 2) - (relativeDistance * (2 * Math.PI / totalSlots));
          const posX = Math.cos(angle) * radiusX;
          const posY = Math.sin(angle) * radiusY;

          const depthProgress = (Math.sin(angle) + 1) / 2; // 0 (back) to 1 (front)
          const proximity = Math.max(0, 1 - Math.min(Math.abs(relativeDistance % totalSlots), Math.abs((relativeDistance % totalSlots) - totalSlots)));
          const scale = displayType === 'question'
            ? (0.7 + depthProgress * 0.35)
            : (0.65 + depthProgress * 0.45);
          const opacity = Math.max(0.2, 0.35 + depthProgress * 0.65);
          const zIndex = Math.round(depthProgress * 20) + (isCenter ? 10 : 0);
          const starOpacity = Math.pow(proximity, 2.5);
          const text = getDisplayText(item);

          return (
            <div
              key={key}
              className={`orbital-word-item ${isCenter ? 'active-center' : ''} ${displayType === 'question' ? 'is-question' : ''}`}
              style={{
                transform: `translate3d(${posX}px, ${posY}px, 0) scale(${scale})`,
                opacity,
                zIndex,
                color: `rgba(255, 255, 255, ${0.4 + 0.6 * depthProgress})`,
                textShadow: depthProgress > 0.75
                  ? `0 0 24px rgba(255, 255, 255, 0.95), 0 0 45px rgba(165, 243, 252, 0.5)`
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
    </div>
  );
};
