import React from 'react';
import { AppState } from '../../types/session.ts';

interface StageHeaderProps {
  round: string;
  currentState: AppState;
}

const STAGE_LABELS: Record<AppState, string> = {
  'idle': 'เตรียมพร้อมสู่การเปลี่ยนผ่าน',
  'rain': '🌧️ ฝนปลายฤดู',
  'water-drop': '💧 หยดน้ำเกาะไอเย็น',
  'mist': '🌫️ สายหมอกลอยต่ำ',
  'wind': '🍃 ลมหนาวแรกพัดผ่าน',
  'leaf': '🍂 ใบไม้เลือกทิศทาง',
  'question': '✨ คำถามประจำค่ำคืน',
  'answered': '✓ ตอบคำถามเรียบร้อย'
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
        <div className="brand-badge">
          <span className="brand-dot" />
          <span className="brand-season">รอยต่อฤดู</span>
        </div>
        <h1 className="event-title">Season Transition Question</h1>
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
