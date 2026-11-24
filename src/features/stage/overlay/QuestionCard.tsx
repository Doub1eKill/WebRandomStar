import React from 'react';
import { Question } from '@/types/question.ts';

interface QuestionCardProps {
  question?: Question;
  isAnswered?: boolean;
  fontSizeScale?: 'normal' | 'large' | 'huge';
  compact?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  isAnswered,
  fontSizeScale = 'normal',
  compact = false
}) => {
  if (!question) return null;

  const getFontSize = () => {
    if (compact) {
      switch (fontSizeScale) {
        case 'huge': return '2.1rem';
        case 'large': return '1.85rem';
        case 'normal':
        default: return '1.6rem';
      }
    }
    switch (fontSizeScale) {
      case 'huge': return '2.8rem';
      case 'large': return '2.4rem';
      case 'normal':
      default: return '2.0rem';
    }
  };

  return (
    <div
      className={`question-card tiara-glassmorphism question-card-crystal-cinematic ${
        isAnswered ? 'answered card-answered-settle' : ''
      } ${compact ? 'question-card-compact-mode' : ''}`}
    >
      {/* Dynamic Diamond Ambient Glow behind card */}
      <div className="card-ambient-glow" />

      {/* Card Content Shell */}
      <div className="card-inner-shell" style={{ padding: compact ? '24px 36px' : '40px 54px' }}>
        {/* Question Body */}
        <div className="question-text-content" style={{ padding: '0', margin: '0' }}>
          <span className="quote-mark open" style={{ fontSize: compact ? '2.8rem' : '3.6rem', top: compact ? '0px' : '4px' }}>“</span>
          <p
            className="question-text"
            style={{
              fontSize: getFontSize(),
              lineHeight: compact ? 1.5 : 1.65,
              margin: '0',
              textAlign: 'center'
            }}
          >
            {question.text}
          </p>
          <span className="quote-mark close" style={{ fontSize: compact ? '2.8rem' : '3.6rem' }}>”</span>
        </div>
      </div>
    </div>
  );
};

