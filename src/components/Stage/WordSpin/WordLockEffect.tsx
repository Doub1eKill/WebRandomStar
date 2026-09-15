import React from 'react';
import { KeywordItem } from '../../../types/word.ts';

interface WordLockEffectProps {
  wordItem?: KeywordItem | null;
  onRevealTrigger?: () => void;
}

export const WordLockEffect: React.FC<WordLockEffectProps> = ({ wordItem }) => {
  const word = wordItem?.word || 'คำสำคัญประจำค่ำคืน';
  const category = wordItem?.category || 'final';
  const theme = wordItem?.englishTheme || 'Theme Keyword';
  const color = wordItem?.color || '#F5D98A';

  return (
    <div className="word-lock-container">
      {/* Radiant Light Sweep Background */}
      <div className="lock-light-sweep" />
      <div className="lock-radial-bloom" style={{ background: `radial-gradient(circle, ${color}33 0%, transparent 70%)` }} />

      {/* Burst Sparks & Stars */}
      <div className="lock-sparks">
        <span className="spark s1">✧</span>
        <span className="spark s2">✦</span>
        <span className="spark s3">✧</span>
        <span className="spark s4">✦</span>
        <span className="spark s5">✧</span>
        <span className="spark s6">✦</span>
      </div>

      <div className="lock-content-card glassmorphism">
        <div className="lock-crown-seal">
          <span className="seal-crown">👑</span>
          <span className="seal-text">✦ SELECTED KEYWORD ✦</span>
        </div>

        <div className="lock-word-banner">
          <span className="lock-bracket left">◇ ✦</span>
          <h2 className="locked-word-title" style={{ color, textShadow: `0 0 24px ${color}88, 0 0 48px ${color}44` }}>
            {word}
          </h2>
          <span className="lock-bracket right">✦ ◇</span>
        </div>

        <div className="lock-details-badge">
          <span className="badge-cat-tag">หมวด: {category.toUpperCase()}</span>
          <span className="badge-dot">•</span>
          <span className="badge-theme-text">{theme}</span>
        </div>

        <div className="lock-quote-caption" style={{ fontSize: '0.9rem', color: '#c7d2fe', fontStyle: 'italic', letterSpacing: '0.03em', margin: '4px 0' }}>
          ✦ ในฤดูกาลเปลี่ยนผ่าน มักมีกลุ่มดาวเปล่งประกายเสมอ ✦
        </div>

        <div className="lock-reveal-cue">
          <span className="cue-pulse" />
          <span>กำลังเปิดเผยคำถาม...</span>
        </div>
      </div>
    </div>
  );
};
