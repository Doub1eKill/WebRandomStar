import React from 'react';

import type { AppearanceSettingsModel } from '../useAppearanceSettingsModel.tsx';

export const SpinModeSection: React.FC<{ m: AppearanceSettingsModel }> = ({ m }) => {
  const { current, updateSetting } = m;
  return (
    <>
      {/* 2. Word Spin Mode Section */}
      <div className="control-section-group">
        <h3 className="group-title">
          <span className="group-icon">👑</span>
          <span>รูปแบบการหมุนคำสำคัญ (Word Spin Mode)</span>
        </h3>

        <div className="mode-selection-grid">
          <button
            type="button"
            className={`mode-card ${current.spinMode === 'vertical' ? 'active' : ''}`}
            onClick={() => updateSetting('spinMode', 'vertical')}
          >
            <span className="mode-icon">📜</span>
            <div className="mode-info">
              <span className="mode-name">Royal Vertical Spin</span>
              <span className="mode-desc">คำเลื่อนผ่านแกนกลางแนวตั้งสไตล์ Royal Reel (แนะนำ)</span>
            </div>
          </button>

          <button
            type="button"
            className={`mode-card ${current.spinMode === '3d' ? 'active' : ''}`}
            onClick={() => updateSetting('spinMode', '3d')}
          >
            <span className="mode-icon">✨</span>
            <div className="mode-info">
              <span className="mode-name">3D Perspective Spin</span>
              <span className="mode-desc">คำหมุนบนระนาบ 3D มิติความลึกและ Blur</span>
            </div>
          </button>

          <button
            type="button"
            className={`mode-card ${current.spinMode === 'orbital' ? 'active' : ''}`}
            onClick={() => updateSetting('spinMode', 'orbital')}
          >
            <span className="mode-icon">🪐</span>
            <div className="mode-info">
              <span className="mode-name">Circular Orbital Words</span>
              <span className="mode-desc">คำหมุนวนรอบศูนย์กลางก่อนล็อกกึ่งกลาง</span>
            </div>
          </button>

          <button
            type="button"
            className={`mode-card ${current.spinMode === 'ribbon' ? 'active' : ''}`}
            onClick={() => updateSetting('spinMode', 'ribbon')}
          >
            <span className="mode-icon">🎀</span>
            <div className="mode-info">
              <span className="mode-name">Royal Ribbon Spin</span>
              <span className="mode-desc">ริบบิ้นแก้วแสงประกายเลื่อนผ่านคำ</span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
};
