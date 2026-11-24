import React from 'react';

import type { AppearanceSettingsModel } from '../useAppearanceSettingsModel.tsx';

export const SpinStopModeSection: React.FC<{ m: AppearanceSettingsModel }> = ({ m }) => {
  const { current, updateSetting } = m;
  return (
    <>
      {/* 3. Word Spin Stop Mode Section */}
      <div className="control-section-group">
        <h3 className="group-title">
          <span className="group-icon">⏱️</span>
          <span>รูปแบบการหยุดสุ่มคำ (Word Spin Stop Mode)</span>
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 12px 0' }}>
          เลือกระหว่างการสุ่มและหยุดล็อกคำอัตโนมัติ หรือสุ่มต่อเนื่องจนกว่าจะกดปุ่มหยุด
        </p>

        <div className="mode-selection-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <button
            type="button"
            data-testid="spin-stop-card-auto"
            className={`mode-card ${(!current.spinStopMode || current.spinStopMode === 'auto') ? 'active' : ''}`}
            onClick={() => updateSetting('spinStopMode', 'auto')}
            style={{ textAlign: 'left', cursor: 'pointer' }}
          >
            <span className="mode-icon">⏳</span>
            <div className="mode-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="mode-name" style={{ fontWeight: 700, fontSize: '0.95rem' }}>หยุดอัตโนมัติ (Auto-Stop)</span>
                <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.2)', color: '#7dd3fc' }}>ค่าเริ่มต้น</span>
              </div>
              <span className="mode-desc" style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                หมุนตามเวลาที่กำหนด (4.5 วินาที) แล้วเริ่มชะลอหยุดและล็อกคำที่สุ่มได้อัตโนมัติ
              </span>
            </div>
          </button>

          <button
            type="button"
            data-testid="spin-stop-card-manual"
            className={`mode-card ${current.spinStopMode === 'manual' ? 'active' : ''}`}
            onClick={() => updateSetting('spinStopMode', 'manual')}
            style={{ textAlign: 'left', cursor: 'pointer' }}
          >
            <span className="mode-icon">🛑</span>
            <div className="mode-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="mode-name" style={{ fontWeight: 700, fontSize: '0.95rem' }}>หยุดด้วยตนเอง (Manual Stop)</span>
                <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.25)', color: '#fca5a5' }}>ควบคุมสด</span>
              </div>
              <span className="mode-desc" style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                คำหมุนต่อเนื่อง 60fps ไปเรื่อยๆ จนกว่าพิธีกร/แอดมินจะกดปุ่ม STOP หรือ Spacebar จึงจะเริ่มชะลอและล็อกคำ
              </span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
};
