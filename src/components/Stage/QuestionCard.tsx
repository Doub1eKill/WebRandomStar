import React from 'react';
import { Question, CATEGORY_CONFIGS } from '../../types/question.ts';
import { CrystalTiaraIcon } from './CrystalIcons.tsx';

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
    icon: '✦',
    subtitle: 'Question',
    color: '#38bdf8'
  };

  const getFontSize = () => {
    if (compact) {
      switch (fontSizeScale) {
        case 'huge': return '2rem';
        case 'large': return '1.75rem';
        case 'normal':
        default: return '1.5rem';
      }
    }
    switch (fontSizeScale) {
      case 'huge': return '2.6rem';
      case 'large': return '2.2rem';
      case 'normal':
      default: return '1.85rem';
    }
  };

  return (
    <div className={`question-card tiara-glassmorphism animate-card-appear ${isAnswered ? 'answered' : ''} ${compact ? 'question-card-compact-mode' : ''}`}>
      {/* Dynamic Diamond Ambient Glow behind card */}
      <div className="card-ambient-glow" />

      {/* Card Content Shell */}
      <div className="card-inner-shell">
        {/* Header Ribbon: Category + Tiara Accent */}
        <div className="card-header-ribbon" style={{ padding: compact ? '8px 16px' : '14px 22px' }}>
          <div
            className="cat-icon-badge"
            style={{
              background: `linear-gradient(135deg, ${cat.color}22, ${cat.color}44)`,
              borderColor: `${cat.color}66`,
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
            <CrystalTiaraIcon size={16} />
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

