import React, { useEffect } from 'react';
import { QuestionCategory } from '../../types/question.ts';
import { AppState } from '../../types/session.ts';
import { audioEngine } from '../../engine/audioEngine.ts';

interface CategoryAnnouncementBannerProps {
  category?: QuestionCategory;
  currentState: AppState;
}

const CATEGORY_META: Record<QuestionCategory, { name: string; subtitle: string; icon: string; color: string; desc: string }> = {
  rain: {
    name: 'ความรู้สึกและตัวตน',
    subtitle: 'Feelings & Identity',
    icon: '🌧️',
    color: '#38bdf8',
    desc: 'คำถามสะท้อนจิตใจ การเติบโต และความงดงามในแบบฉบับตนเอง'
  },
  mist: {
    name: 'มุมมองและทัศนคติ',
    subtitle: 'Perspective & Attitude',
    icon: '🌫️',
    color: '#94a3b8',
    desc: 'คำถามเชิงทัศนคติ การตัดสินใจ และการแยกแยะความจริง'
  },
  wind: {
    name: 'การเปลี่ยนแปลงและความท้าทาย',
    subtitle: 'Change & Challenge',
    icon: '🍃',
    color: '#86efac',
    desc: 'คำถามเกี่ยวกับการปรับตัว การก้าวผ่านอุปสรรค และภาวะผู้นำ'
  },
  leaf: {
    name: 'ประสบการณ์และชีวิตมหาวิทยาลัย',
    subtitle: 'Experience & Memory',
    icon: '🍂',
    color: '#fbbf24',
    desc: 'คำถามบทเรียนชีวิต มิตรภาพ และความทรงจำที่มีคุณค่า'
  },
  moon: {
    name: 'ความฝันและเป้าหมาย',
    subtitle: 'Dreams & Ambition',
    icon: '🌙',
    color: '#e2e8f0',
    desc: 'คำถามถึงพลังใจ อนาคต และความหวังที่อยากส่งต่อ'
  },
  star: {
    name: 'สังคมและการสร้างสรรค์',
    subtitle: 'Society & Leadership',
    icon: '⭐',
    color: '#fde047',
    desc: 'คำถามนวัตกรรม การพัฒนาชุมชน และบทบาทของตัวแทนเยาวชน'
  },
  final: {
    name: 'คำถามรอบตัดสิน',
    subtitle: 'Final Decisive Question',
    icon: '☄️',
    color: '#f43f5e',
    desc: 'คำถามชี้ขาดคุณค่า ความเป็นผู้นำ และพันธกิจประจำตำแหน่ง'
  }
};

export const CategoryAnnouncementBanner: React.FC<CategoryAnnouncementBannerProps> = ({
  category,
  currentState
}) => {
  // Show banner during leaf state
  const isVisible = currentState === 'leaf' && !!category;

  useEffect(() => {
    if (isVisible && currentState === 'leaf') {
      audioEngine.playStarChime();
    }
  }, [isVisible, currentState]);

  if (!isVisible || !category) return null;

  const meta = CATEGORY_META[category] || {
    name: category,
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
