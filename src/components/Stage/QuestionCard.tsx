import React from 'react';
import { Question, QuestionCategory } from '../../types/question.ts';

interface QuestionCardProps {
  question?: Question;
  isAnswered?: boolean;
  onNext?: () => void;
}

const CATEGORY_DETAILS: Record<QuestionCategory, { name: string; icon: string; subtitle: string; color: string }> = {
  rain: { name: 'สายฝนแห่งการปรับตัว', icon: '🌧️', subtitle: 'Adaptability & Growth', color: '#38bdf8' },
  mist: { name: 'สายหมอกแห่งวิสัยทัศน์', icon: '🌫️', subtitle: 'Vision & Perspective', color: '#94a3b8' },
  wind: { name: 'ลมหนาวแห่งแรงบันดาลใจ', icon: '🍃', subtitle: 'Leadership & Impact', color: '#86efac' },
  leaf: { name: 'ใบไม้ทองแห่งพันธกิจ', icon: '🍂', subtitle: 'Purpose & Legacy', color: '#fbbf24' },
  moon: { name: 'แสงจันทร์สะท้อนคุณค่า', icon: '🌙', subtitle: 'Authenticity & Empathy', color: '#e2e8f0' },
  star: { name: 'คุณค่าและความเป็นผู้นำ', icon: '⭐', subtitle: 'Character & Leadership', color: '#fde047' },
  final: { name: 'คำถามรอบตัดสิน', icon: '👑', subtitle: 'Final Decisive Question', color: '#f43f5e' }
};

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, isAnswered, onNext }) => {
  if (!question) return null;

  const cat = CATEGORY_DETAILS[question.category] || {
    name: question.category,
    icon: '✨',
    subtitle: 'Question',
    color: '#38bdf8'
  };

  return (
    <div className="question-card-container animate-float">
      <div className="question-card glass-panel" style={{ borderColor: `${cat.color}40` }}>
        {/* Glowing Top Line */}
        <div className="card-glow-bar" style={{ background: `linear-gradient(90deg, transparent, ${cat.color}, transparent)` }} />

        {/* Category Header */}
        <div className="card-category-row">
          <div className="cat-icon-wrap" style={{ background: `${cat.color}20`, border: `1px solid ${cat.color}50` }}>
            <span className="cat-icon">{cat.icon}</span>
          </div>
          <div className="cat-text-wrap">
            <span className="cat-name" style={{ color: cat.color }}>{cat.name}</span>
            <span className="cat-sub">{cat.subtitle}</span>
          </div>
          <div className="question-id-chip">
            <span>{question.id}</span>
          </div>
        </div>

        {/* Question Body */}
        <div className="question-text-content">
          <span className="quote-mark open">“</span>
          <p className="question-text">{question.text}</p>
          <span className="quote-mark close">”</span>
        </div>

        {/* Tags and Status Footer */}
        <div className="card-footer">
          <div className="tags-row">
            {question.tags.map((tag, idx) => (
              <span key={idx} className="tag-pill">#{tag}</span>
            ))}
          </div>

          {onNext && (
            <button
              className={`btn-next-action ${isAnswered ? 'btn-next-ready' : ''}`}
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
