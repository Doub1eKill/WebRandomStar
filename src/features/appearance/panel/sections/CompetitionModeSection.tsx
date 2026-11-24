import React from 'react';

import type { AppearanceSettingsModel } from '../useAppearanceSettingsModel.tsx';

export const CompetitionModeSection: React.FC<{ m: AppearanceSettingsModel }> = ({ m }) => {
  const { current, updateSetting } = m;
  return (
    <>
      {/* 0. Competition Flow Mode Section */}
      <div className="control-section-group">
        <h3 className="group-title">
          <span className="group-icon">🏆</span>
          <span>รูปแบบการแข่งขันบนเวที (Competition Flow Mode)</span>
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 12px 0' }}>
          เลือกรูปแบบขั้นตอนการแข่งขัน: สุ่มเฉพาะคำสำคัญเพื่อแสดงการ์ดคำพร้อมจับเวลาตอบสด หรือสุ่มเปิดคลังคำถามเต็มรูปแบบ
        </p>

        <div className="mode-selection-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {/* Question Bank Mode */}
          <button
            type="button"
            data-testid="quiz-mode-question"
            className={`mode-card ${(!current.quizMode || current.quizMode === 'question') ? 'active' : ''}`}
            onClick={() => updateSetting('quizMode', 'question')}
            style={{ textAlign: 'left', cursor: 'pointer' }}
          >
            <span className="mode-icon">📜</span>
            <div className="mode-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="mode-name" style={{ fontWeight: 700, fontSize: '0.95rem' }}>โหมดสุ่มคลังคำถาม</span>
                <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.2)', color: '#7dd3fc' }}>มาตรฐาน</span>
              </div>
              <span className="mode-desc" style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                สุ่มคำสำคัญ/หมวดหมู่ → สุ่มดึงข้อสอบจากการ์ดคำถาม → เปิดการ์ดคำถามเต็มพร้อมจับเวลา
              </span>
            </div>
          </button>

          {/* Keyword Mode */}
          <button
            type="button"
            data-testid="quiz-mode-keyword"
            className={`mode-card ${current.quizMode === 'keyword' ? 'active' : ''}`}
            onClick={() => updateSetting('quizMode', 'keyword')}
            style={{ textAlign: 'left', cursor: 'pointer' }}
          >
            <span className="mode-icon">🏷️</span>
            <div className="mode-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="mode-name" style={{ fontWeight: 700, fontSize: '0.95rem' }}>โหมดสุ่มคำสำคัญ</span>
                <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(192, 132, 252, 0.25)', color: '#d8b4fe' }}>สุนทรพจน์ / คีย์เวิร์ด</span>
              </div>
              <span className="mode-desc" style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                สุ่มเฉพาะคำสำคัญ → แสดงการ์ดคำสำคัญประกายแสงขนาดใหญ่ (Showcase) → เริ่มจับเวลาตอบคำถามทันที
              </span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
};
