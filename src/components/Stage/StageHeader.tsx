import React from 'react';
import { AppState } from '../../types/session.ts';
import { CrystalTiaraIcon } from './CrystalIcons.tsx';

interface StageHeaderProps {
  round: string;
  currentState: AppState;
}

const STAGE_LABELS: Record<AppState, string> = {
  'idle': 'เตรียมพร้อมสู่การสุ่มคำสำคัญ',
  'pre-spin': '✦ เตรียมเริ่มการหมุนคำ ✦',
  'word-spin': '✦ ROYAL WORD SPIN ✦',
  'word-decelerate': '✦ กำลังคัดสรรคำสำคัญ ✦',
  'word-lock': '✦ ล็อกคำสำคัญแห่งค่ำคืน ✦',
  'question-reveal': '✦ เปิดเผยคำถาม ✦',
  'question': '✦ คำถามประจำค่ำคืน ✦',
  'answered': '✓ ตอบคำถามเรียบร้อย',

  // Legacy fallback states
  'rain': 'ฝนปลายฤดู',
  'water-drop': 'หยดน้ำเกาะไอเย็น',
  'mist': 'สายหมอกลอยต่ำ',
  'wind': 'ลมหนาวแรกพัดผ่าน',
  'leaf': 'ใบไม้ร่วงตามสายลม',
  'sky-clear': 'ท้องฟ้าเปิดกว้าง'
};

export const StageHeader: React.FC<StageHeaderProps> = ({ round, currentState }) => {
  const roundMap: Record<string, string> = {
    'intro': 'รอบแนะนำตัว (Intro)',
    'general': 'รอบทั่วไป (General)',
    'attitude': 'รอบทัศนคติ (Attitude)',
    'scenario': 'รอบสถานการณ์จำลอง (Scenario)',
    'final': 'รอบชิงชนะเลิศ (Final)'
  };

  return (
    <header className="stage-header">
      <div className="header-left">
        <div className="brand-badge royal-badge">
          <CrystalTiaraIcon size={18} />
          <span className="brand-season">AMBASSADOR 2026</span>
        </div>
        <div className="header-titles">
          <div className="event-pre-title">✦ SCI TECH TINE ✦</div>
          <h1 className="event-title royal-serif">CHARM OF TRANSITION</h1>
          <div className="event-post-title">
            <span className="post-ambassador">✦ AMBASSADOR 2026 ✦</span>
            <span className="post-divider">•</span>
            <span className="event-subtitle">เสน่ห์แห่งการเปลี่ยนผ่าน สู่ดาวนำทางแห่งอนาคต</span>
          </div>
        </div>
      </div>

      <div className="header-right">
        <div className="glass-chip round-chip">
          <span className="chip-label">รอบการแข่งขัน</span>
          <span className="chip-value">{roundMap[round] || round}</span>
        </div>

        <div className="glass-chip state-chip">
          <span className="state-pulse" />
          <span className="state-label">{STAGE_LABELS[currentState] || currentState}</span>
        </div>
      </div>
    </header>
  );
};
