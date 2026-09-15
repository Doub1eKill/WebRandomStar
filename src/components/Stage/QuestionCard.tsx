import React from 'react';
import { Question, CATEGORY_CONFIGS } from '../../types/question.ts';

interface QuestionCardProps {
  question?: Question;
  isAnswered?: boolean;
  fontSizeScale?: 'normal' | 'large' | 'huge';
  compact?: boolean;
  onNext?: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  isAnswered,
  fontSizeScale = 'normal',
  compact = false,
  onNext
}) => {
  if (!question) return null;

  const cat = CATEGORY_CONFIGS[question.category.toLowerCase()] || {
    name: question.category,
    icon: '✨',
    subtitle: 'Question',
    color: '#38bdf8'
  };

  const getFontSize = () => {
    if (compact) {
      switch (fontSizeScale) {
        case 'huge': return 'clamp(1.5rem, 2.4vw, 2.1rem)';
        case 'large': return 'clamp(1.35rem, 2.1vw, 1.85rem)';
        default: return 'clamp(1.2rem, 1.8vw, 1.6rem)';
      }
    }
    switch (fontSizeScale) {
      case 'huge': return 'clamp(2.1rem, 3.4vw, 2.8rem)';
      case 'large': return 'clamp(1.85rem, 2.8vw, 2.35rem)';
      default: return 'clamp(1.55rem, 2.3vw, 2rem)';
    }
  };

  return (
    <div className={`question-card-container animate-float ${compact ? 'question-card-compact-mode' : ''}`}>
      <div
        className="question-card glass-panel"
        style={{
          borderColor: `${cat.color}40`,
          padding: compact ? '22px 32px' : '34px 44px',
          gap: compact ? '16px' : '24px'
        }}
      >
        {/* Diamond Corner Accents */}
        <div className="card-diamond-corner top-left">✦</div>
        <div className="card-diamond-corner top-right">✦</div>
        <div className="card-diamond-corner bottom-left">✦</div>
        <div className="card-diamond-corner bottom-right">✦</div>

        {/* Glowing Top Line */}
        <div className="card-glow-bar" style={{ background: `linear-gradient(90deg, transparent, ${cat.color}, transparent)` }} />

        {/* Category Header */}
        <div className="card-category-row">
          <div
            className="cat-icon-wrap"
            style={{
              background: `${cat.color}20`,
              border: `1px solid ${cat.color}50`,
              width: compact ? '38px' : '46px',
              height: compact ? '38px' : '46px',
              fontSize: compact ? '1.15rem' : '1.4rem'
            }}
          >
            <span className="cat-icon">{cat.icon}</span>
          </div>
          <div className="cat-text-wrap">
            <span className="cat-name" style={{ color: cat.color, fontSize: compact ? '1.05rem' : '1.25rem' }}>{cat.name}</span>
            <span className="cat-sub" style={{ fontSize: compact ? '0.72rem' : '0.8rem' }}>{cat.subtitle}</span>
          </div>
          <div className="card-tiara-badge">
            <span className="tiara-icon">👑</span>
            <span className="tiara-title">AMBASSADOR 2026</span>
          </div>
          <div className="question-id-chip">
            <span>{question.id}</span>
          </div>
        </div>

        {/* Question Body */}
        <div className="question-text-content" style={{ padding: compact ? '4px 10px' : '8px 14px' }}>
          <span className="quote-mark open" style={{ fontSize: compact ? '2.4rem' : '3.2rem', top: compact ? '4px' : '10px' }}>“</span>
          <p
            className="question-text"
            style={{
              fontSize: getFontSize(),
              lineHeight: compact ? 1.45 : 1.6
            }}
          >
            {question.text}
          </p>
          <span className="quote-mark close" style={{ fontSize: compact ? '2.4rem' : '3.2rem' }}>”</span>
        </div>

        {/* Tags and Status Footer */}
        <div className="card-footer" style={{ paddingTop: compact ? '12px' : '18px' }}>
          <div className="tags-row">
            {question.tags?.map((tag, idx) => (
              <span key={idx} className="tag-pill">#{tag}</span>
            ))}
          </div>

          {onNext && (
            <button
              className={`btn-next-action ${isAnswered ? 'btn-next-ready' : ''}`}
              style={{
                padding: compact ? '8px 18px' : '11px 24px',
                fontSize: compact ? '0.9rem' : '1rem'
              }}
              onClick={onNext}
            >
              {isAnswered ? 'ไปสู่ผู้เข้าแข่งขันถัดไป ➔' : 'เสร็จสิ้นคำถามนี้ ✓'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

