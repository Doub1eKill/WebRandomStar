import React from 'react';

import type { AppearanceSettingsModel } from '../useAppearanceSettingsModel.tsx';

export const WordLockSection: React.FC<{ m: AppearanceSettingsModel }> = ({ m }) => {
  const { current, updateSetting } = m;
  return (
    <>
      {/* 4. Word Lock Showcase Phase Section */}
      <div className="control-section-group">
        <h3 className="group-title">
          <span className="group-icon">🎴</span>
          <span>ช่วงแสดงการ์ดคำที่สุ่มได้ (Selected Keyword Showcase)</span>
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 12px 0' }}>
          เลือกว่าจะแสดงหน้าต่างการ์ดสรุปคำสำคัญที่สุ่มได้ (✦ SELECTED KEYWORD ✦) คั่นกลางก่อนเปิดการ์ดคำถามหรือไม่
        </p>

        <div className="mode-selection-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <button
            type="button"
            data-testid="word-lock-card-on"
            className={`mode-card ${(current.showWordLockPhase !== false) ? 'active' : ''}`}
            onClick={() => updateSetting('showWordLockPhase', true)}
            style={{ textAlign: 'left', cursor: 'pointer' }}
          >
            <span className="mode-icon">✨</span>
            <div className="mode-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="mode-name" style={{ fontWeight: 700, fontSize: '0.95rem' }}>เปิดใช้งาน (ON)</span>
                <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.2)', color: '#7dd3fc' }}>ค่าเริ่มต้น</span>
              </div>
              <span className="mode-desc" style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                เมื่อหยุดสุ่ม จะแสดงการ์ดคำสำคัญเด่นชัดกลางจอก่อน 1.5 วินาที แล้วจึงเปิดการ์ดคำถาม
              </span>
            </div>
          </button>

          <button
            type="button"
            data-testid="word-lock-card-off"
            className={`mode-card ${current.showWordLockPhase === false ? 'active' : ''}`}
            onClick={() => updateSetting('showWordLockPhase', false)}
            style={{ textAlign: 'left', cursor: 'pointer' }}
          >
            <span className="mode-icon">⚡</span>
            <div className="mode-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="mode-name" style={{ fontWeight: 700, fontSize: '0.95rem' }}>ข้ามช่วงนี้ (OFF)</span>
                <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.25)', color: '#fca5a5' }}>สตรีมกระชับ</span>
              </div>
              <span className="mode-desc" style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                เมื่อหยุดสุ่ม จะข้ามไปเปิดการ์ดคำถามทันทีโดยไม่ต้องรอแสดงการ์ดคำคั่น
              </span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
};
