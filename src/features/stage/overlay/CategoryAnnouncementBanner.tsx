import React, { useEffect } from 'react';
import { QuestionCategory, CATEGORY_CONFIGS } from '@/types/question.ts';
import { AppState } from '@/types/session.ts';
import { audioEngine } from '@/features/audio/audioEngine.ts';

interface CategoryAnnouncementBannerProps {
  category?: QuestionCategory;
  currentState: AppState;
}

export const CategoryAnnouncementBanner: React.FC<CategoryAnnouncementBannerProps> = ({
  category,
  currentState
}) => {
  // Show banner during leaf / sky-clear state
  const isVisible = (currentState === 'leaf' || currentState === 'sky-clear') && !!category;

  useEffect(() => {
    if (isVisible && currentState === 'leaf') {
      audioEngine.playSkyTransition();
    }
  }, [isVisible, currentState]);

  if (!isVisible || !category) return null;

  const key = String(category).toLowerCase();
  const cfg = CATEGORY_CONFIGS[key];
  const meta = cfg ? {
    name: cfg.name,
    subtitle: cfg.subtitle,
    icon: cfg.icon,
    color: cfg.color,
    desc: cfg.description
  } : {
    name: String(category),
    subtitle: 'Question Category',
    icon: '✨',
    color: '#38bdf8',
    desc: 'หมวดคำถามประจำค่ำคืน'
  };

  return (
    <div className="category-announcement-overlay">
      <div
        className="category-announcement-card glass-panel"
        style={{ borderColor: `${meta.color}60` }}
      >
        <div className="banner-glow-line" style={{ background: `linear-gradient(90deg, transparent, ${meta.color}, transparent)` }} />

        <div className="banner-badge-header">
          <span className="banner-nature-tag">🌿 ธรรมชาติกำหนดหมวดคำถาม</span>
        </div>

        <div className="banner-main-row">
          <div className="banner-icon-circle" style={{ background: `${meta.color}20`, borderColor: `${meta.color}60` }}>
            <span>{meta.icon}</span>
          </div>

          <div className="banner-title-block">
            <h2 className="banner-thai-title" style={{ color: meta.color }}>
              หมวด: {meta.name}
            </h2>
            <span className="banner-eng-sub">{meta.subtitle}</span>
          </div>
        </div>

        <p className="banner-desc">{meta.desc}</p>
      </div>
    </div>
  );
};
