import React from 'react';
import { KeywordItem } from '../../../types/word.ts';
import { Question } from '../../../types/question.ts';
import { CrystalTiaraIcon } from '../CrystalIcons.tsx';

interface WordLockEffectProps {
  wordItem?: KeywordItem | null;
  question?: Question | null;
  quizMode?: 'keyword' | 'question';
  onRevealTrigger?: () => void;
}

export const WordLockEffect: React.FC<WordLockEffectProps> = ({
  wordItem,
  question,
  quizMode
}) => {
  const isQuestionMode = quizMode ? quizMode === 'question' : Boolean(question);
  const word = isQuestionMode
    ? (question?.text || 'คำถามประจำรอบ')
    : (wordItem?.word || 'คำสำคัญประจำค่ำคืน');
  const category = (isQuestionMode ? question?.category : wordItem?.category) || 'general';
  const theme = isQuestionMode
    ? (question?.round ? `รอบ ${question.round}` : 'Question')
    : (wordItem?.englishTheme || 'Theme Keyword');

  return (
    <div className={`word-lock-container ${isQuestionMode ? 'is-question' : ''}`}>
      {/* Radiant Light Sweep Background */}
      <div className="lock-light-sweep" />
      <div
        className="lock-radial-bloom"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, rgba(192, 132, 252, 0.2) 45%, transparent 70%)'
        }}
      />

      {/* Burst Sparks & Stars */}
      <div className="lock-sparks">
        <span className="spark s1">✧</span>
        <span className="spark s2">✦</span>
        <span className="spark s3">✧</span>
        <span className="spark s4">✦</span>
        <span className="spark s5">✧</span>
        <span className="spark s6">✦</span>
      </div>

      <div className="lock-content-card glassmorphism" style={{ maxWidth: isQuestionMode ? '860px' : '720px' }}>
        <div className="lock-crown-seal">
          <CrystalTiaraIcon size={24} />
          <span className="seal-text">
            {isQuestionMode ? '✦ SELECTED QUESTION ✦' : '✦ SELECTED KEYWORD ✦'}
          </span>
        </div>

        <div className="lock-word-banner" style={{ margin: isQuestionMode ? '16px 0' : '20px 0' }}>
          <span className="lock-bracket left">◇ ✦</span>
          <h2
            className="locked-word-title"
            style={{
              color: '#ffffff',
              fontSize: isQuestionMode ? 'clamp(1.4rem, 2.3vw, 2.2rem)' : 'clamp(2.5rem, 4vw, 3.8rem)',
              lineHeight: isQuestionMode ? 1.4 : 1.2,
              fontWeight: 800,
              textShadow: '0 0 25px rgba(255, 255, 255, 0.95), 0 0 50px rgba(192, 132, 252, 0.5), 0 0 75px rgba(165, 243, 252, 0.35)'
            }}
          >
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
          <span>{isQuestionMode ? 'กำลังเปิดเผยการ์ดคำถาม...' : 'กำลังเปิดเผยการ์ดคำสำคัญ...'}</span>
        </div>
      </div>
    </div>
  );
};
