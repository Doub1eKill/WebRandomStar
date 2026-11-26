import React from 'react';

interface KeywordShowcaseCardProps {
  keyword?: string;
  isAnswered?: boolean;
  compact?: boolean;
}

export const KeywordShowcaseCard: React.FC<KeywordShowcaseCardProps> = ({
  keyword,
  isAnswered,
  compact = false
}) => {
  if (!keyword) return null;

  return (
    <div
      className={`keyword-showcase-card tiara-glassmorphism keyword-showcase-crystal-cinematic ${
        isAnswered ? 'answered card-answered-settle' : ''
      } ${compact ? 'keyword-showcase-compact-mode' : ''}`}
    >
      {/* Dynamic Ambient Glow */}
      <div className="keyword-card-ambient-glow" />

      {/* Card Inner Shell */}
      <div className="keyword-card-inner-shell" style={{ padding: compact ? '28px 36px' : '44px 58px' }}>
        {/* Subtitle / Prompt Tag */}
        <div className="keyword-subtitle-prompt">
          <span>คำสำคัญประจำรอบการประกวด</span>
        </div>

        {/* Large Keyword Typography */}
        <div className="keyword-showcase-body">
          <span className="keyword-quote-mark open">“</span>
          <h2
            className="keyword-showcase-text"
            style={{
              fontSize: compact ? '2.8rem' : '3.8rem',
              lineHeight: 1.25,
              margin: '0',
              textAlign: 'center'
            }}
          >
            {keyword}
          </h2>
          <span className="keyword-quote-mark close">”</span>
        </div>
      </div>
    </div>
  );
};
