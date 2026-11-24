import React from 'react';

import type { AppearanceSettingsModel } from '../useAppearanceSettingsModel.tsx';

export const BackgroundModeSection: React.FC<{ m: AppearanceSettingsModel }> = ({ m }) => {
  const { current, updateSetting } = m;
  return (
    <>
      {/* 0.1 Stage Background Mode Section */}
      <div className="control-section-group">
        <h3 className="group-title">
          <span className="group-icon">🖼️</span>
          <span>รูปแบบพื้นหลังเวทีหลัก (Stage Background Mode)</span>
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 12px 0' }}>
          เลือกสลับระหว่างพื้นหลังเนบิวลาคริสตัลปัจจุบัน และพื้นหลังประติมากรรมแก้ว 3D AeroShards (สลับได้ทันทีแบบ Real-time)
        </p>

        <div className="mode-selection-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <button
            type="button"
            className={`mode-card ${(!current.backgroundMode || current.backgroundMode === 'cosmic-canvas') ? 'active' : ''}`}
            onClick={() => updateSetting('backgroundMode', 'cosmic-canvas')}
            style={{ textAlign: 'left', cursor: 'pointer' }}
          >
            <span className="mode-icon">🌌</span>
            <div className="mode-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="mode-name" style={{ fontWeight: 700, fontSize: '0.95rem' }}>Cosmic Canvas Stage</span>
                <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.2)', color: '#7dd3fc' }}>มาตรฐาน</span>
              </div>
              <span className="mode-desc" style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                ฟ้าราตรีเนบิวลา ออโรร่าระยิบระยับ ละอองคริสตัล และมงกุฎแสง (Canvas 2D นิ่งเสถียร 60fps)
              </span>
            </div>
          </button>

          <button
            type="button"
            className={`mode-card ${current.backgroundMode === 'aero-shards' ? 'active' : ''}`}
            onClick={() => updateSetting('backgroundMode', 'aero-shards')}
            style={{ textAlign: 'left', cursor: 'pointer' }}
          >
            <span className="mode-icon">💎</span>
            <div className="mode-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="mode-name" style={{ fontWeight: 700, fontSize: '0.95rem' }}>AeroShards Glass Sculpture</span>
                <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(192, 132, 252, 0.25)', color: '#d8b4fe' }}>ใหม่ 3D</span>
              </div>
              <span className="mode-desc" style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                ประติมากรรมเศษแก้วคริสตัล 3D สไตล์ React Bits AeroShards ในโทนสีม่วงคริสตัล-ฟ้าสว่าง คุมธีม 100%
              </span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
};
