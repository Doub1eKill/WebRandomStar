import React from 'react';
import { AppState } from '../../types/session.ts';

interface CinematicNarratorProps {
  currentState: AppState;
}

const NARRATIVE_LINES: Partial<Record<AppState, { text: string; sub: string }>> = {
  'rain': {
    text: 'สายฝนปลายฤดูโปรยปรายแผ่วเบา... สู่มนต์เสน่ห์แห่งการเปลี่ยนผ่าน',
    sub: 'Late rains softly whisper, ushering in the Charm of Transition.'
  },
  'water-drop': {
    text: 'หยดน้ำค้างเกาะไอเย็น สะท้อนประกายคุณค่าและเจตนารมณ์แห่งค่ำคืน',
    sub: 'Crystalline dewdrops gather, capturing the essence of purpose and light.'
  },
  'mist': {
    text: 'สายหมอกลอยต่ำ อากาศหนาวเริ่มโอบล้อม ดั่งช่วงเวลาต้องมนตร์',
    sub: 'Cool mist settles low as the enchanted winter air embraces the hall.'
  },
  'wind': {
    text: 'สายลมหนาวแรกพัดผ่าน นำพาบททดสอบและเกียรติยศสู่ผู้กล้า',
    sub: 'The first winter breeze stirs with anticipation of honor and glory.'
  },
  'leaf': {
    text: 'ใบไม้สีทองร่อนลงสู่ผืนน้ำ... เผยคำถามแห่งมนต์เสน่ห์ CHARM OF TRANSITION!',
    sub: 'The golden leaf touches still waters, unveiling the question of destiny.'
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
