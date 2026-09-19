import React from 'react';
import { SpinViewProps } from './types.ts';
import { CrystalTiaraIcon } from '../CrystalIcons.tsx';

export const OrbitalSpinView: React.FC<SpinViewProps> = ({
  reel,
  currentIndex,
  targetWord
}) => {
  const totalSlots = 8;
  const radiusX = 230; // Horizontal ellipse radius
  const radiusY = 62;  // Vertical ellipse radius (inclined perspective)

  const wordsOnRing: { item: typeof targetWord; slotIndex: number; isCenter: boolean }[] = [];

  for (let s = 0; s < totalSlots; s++) {
    const idx = (currentIndex + s + reel.length) % reel.length;
    wordsOnRing.push({
      item: reel[idx] || targetWord,
      slotIndex: s,
      isCenter: s === 0
    });
  }

  return (
    <div className="orbital-spin-view">
      {/* Radiant Tiara Core */}
      <div className="orbital-core-tiara">
        <div className="core-glow-aura" />
        <CrystalTiaraIcon size={38} />
      </div>

      {/* Orbit Ring Visual Ellipse */}
      <div className="orbital-ring-track" />

      {/* Orbiting Words */}
      <div className="orbital-words-container">
        {wordsOnRing.map(({ item, slotIndex, isCenter }) => {
          // Angle around orbit: slot 0 is foreground front-center (PI / 2)
          const angle = (Math.PI / 2) - (slotIndex * (2 * Math.PI / totalSlots));
          const posX = Math.cos(angle) * radiusX;
          const posY = Math.sin(angle) * radiusY;

          // Depth properties: front items (posY > 0) have higher scale & zIndex
          const depthProgress = (Math.sin(angle) + 1) / 2; // 0 (back) to 1 (front)
          const scale = 0.65 + depthProgress * 0.45;
          const opacity = isCenter ? 1 : Math.max(0.25, 0.4 + depthProgress * 0.55);
          const zIndex = Math.round(depthProgress * 20) + (isCenter ? 10 : 0);

          return (
            <div
              key={`${item.id}-${slotIndex}`}
              className={`orbital-word-item ${isCenter ? 'active-center' : ''}`}
              style={{
                transform: `translate(${posX}px, ${posY}px) scale(${scale})`,
                opacity,
                zIndex,
                color: isCenter ? '#ffffff' : depthProgress > 0.6 ? 'rgba(224, 231, 255, 0.85)' : 'rgba(148, 163, 184, 0.45)',
                textShadow: isCenter ? '0 0 24px rgba(255, 255, 255, 0.95), 0 0 45px rgba(165, 243, 252, 0.5)' : 'none'
              }}
            >
              {isCenter && <span className="word-accent-star left">✦</span>}
              <span className="word-text">{item.word}</span>
              {isCenter && <span className="word-accent-star right">✦</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};
