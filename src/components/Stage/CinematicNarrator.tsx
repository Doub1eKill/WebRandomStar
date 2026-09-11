import React from 'react';
import { AppState } from '../../types/session.ts';

interface CinematicNarratorProps {
  currentState: AppState;
}

const NARRATIVE_LINES: Partial<Record<AppState, { text: string; sub: string }>> = {
  'rain': {
    text: 'สายฝนปลายฤดูค่อย ๆ ซาลง... สัญญาณแห่งการเปลี่ยนผ่านเริ่มต้นขึ้น',
    sub: 'The late rains gently fade as the season begins to turn...'
  },
  'water-drop': {
    text: 'หยดน้ำบนไอเย็นรวมตัว กำหนดทิศทางแห่งโชคชะตา',
    sub: 'Condensation trickles down, tracing the path of fate.'
  },
  'mist': {
    text: 'สายหมอกลอยต่ำ อากาศหนาวเย็นเริ่มโอบล้อมทั่วอาณาบริเวณ',
    sub: 'Cool mist settles low, enveloping the evening in calm.'
  },
  'wind': {
    text: 'ลมหนาวแรกพัดผ่าน นำพาความเปลี่ยนแปลงและบททดสอบ',
    sub: 'The first winter breeze stirs, whispering of change.'
  },
  'leaf': {
    text: 'ใบไม้สีทองร่อนลงสู่ทิศทาง... สายลมกำลังพัดพาดวงดาวคำถามให้ปรากฏ!',
    sub: 'The golden leaf glides toward its destiny as celestial stars emerge.'
  },
  'sky-opening': {
    text: 'ม่านเมฆเปิดออก เผยฟากฟ้าราตรีอันลึกซึ้งและดวงจันทร์นวลตา',
    sub: 'Clouds part to reveal a clear celestial night and gentle moon.'
  },
  'constellation': {
    text: 'ดวงดาวส่องประกาย เชื่อมร้อยเป็นกลุ่มดาวคำถาม Candidate',
    sub: 'Stars align into radiant constellations of candidate questions.'
  },
  'meteor': {
    text: 'ดาวตกสว่างวาบพุ่งทะยาน ชี้ขาดคำถามประจำค่ำคืนนี้!',
    sub: 'A blazing meteor strikes to select the definitive question!'
  }
};

export const CinematicNarrator: React.FC<CinematicNarratorProps> = ({ currentState }) => {
  const line = NARRATIVE_LINES[currentState];
  if (!line) return null;

  return (
    <div className="cinematic-narrator-container">
      <div className="cinematic-narrator-card glass-panel">
        <div className="narrator-glow-pill" />
        <p className="narrator-thai-text">{line.text}</p>
        <p className="narrator-eng-sub">{line.sub}</p>
      </div>
    </div>
  );
};
