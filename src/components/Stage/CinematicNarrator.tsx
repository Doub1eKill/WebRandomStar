import React from 'react';
import { AppState } from '../../types/session.ts';

interface CinematicNarratorProps {
  currentState: AppState;
}

const NARRATIVE_LINES: Partial<Record<AppState, { text: string; sub: string }>> = {
  'rain': {
    text: 'เมื่อปลายฝนกำลังผ่านพ้น...',
    sub: 'Late rains softly whisper, ushering in the Charm of Transition.'
  },
  'water-drop': {
    text: 'หยดสุดท้ายกำลังพาเราเข้าสู่การเปลี่ยนแปลง...',
    sub: 'Crystalline dewdrops gather, capturing the essence of purpose and light.'
  },
  'mist': {
    text: 'เมื่อสิ่งเดิมเริ่มเลือนหาย สิ่งใหม่จึงกำลังปรากฏ...',
    sub: 'Cool mist settles low as the enchanted winter air embraces the hall.'
  },
  'wind': {
    text: 'สายลมแรกของฤดูหนาวกำลังเข้ามา...',
    sub: 'The first winter breeze stirs with anticipation of honor and glory.'
  },
  'leaf': {
    text: 'ใบไม้ร่วงปลิวตามกระแสลมหนาว...',
    sub: 'Golden autumn leaves drift across the seasonal currents.'
  },
  'sky-clear': {
    text: 'เมื่อฤดูกาลเปลี่ยนผ่าน ท้องฟ้าเปิดกว้างต้อนรับค่ำคืนนี้...',
    sub: 'The atmosphere clears as the radiant night sky opens up.'
  },
  'question-reveal': {
    text: 'คำตอบและคำถามของค่ำคืนนี้กำลังจะปรากฏ...',
    sub: 'The decisive question of destiny reveals itself.'
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
