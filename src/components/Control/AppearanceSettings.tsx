import React from 'react';
import { AppearanceSettings, DEFAULT_APPEARANCE_SETTINGS } from '../../types/appearance.ts';

interface AppearanceSettingsProps {
  settings: AppearanceSettings;
  onChange: (updated: AppearanceSettings) => void;
}

export const AppearanceSettingsPanel: React.FC<AppearanceSettingsProps> = ({
  settings,
  onChange
}) => {
  const current = settings || DEFAULT_APPEARANCE_SETTINGS;

  const updateSetting = <K extends keyof AppearanceSettings>(key: K, value: AppearanceSettings[K]) => {
    onChange({
      ...current,
      [key]: value
    });
  };

  return (
    <div className="appearance-settings-panel">
      {/* 0. Stage Background Mode Section */}
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

      {/* 1. Word Spin Mode Section */}
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

      {/* 2. Visual Effects & Layers */}
      <div className="control-section-group">
        <h3 className="group-title">
          <span className="group-icon">🌌</span>
          <span>บรรยากาศเวทีและแสงสี (Atmospheric Layers & FX)</span>
        </h3>

        <div className="toggles-grid">
          <label className="toggle-switch-card">
            <input
              type="checkbox"
              checked={current.showCrownSilhouette}
              onChange={e => updateSetting('showCrownSilhouette', e.target.checked)}
            />
            <div className="toggle-card-content">
              <span className="toggle-title">👑 เงาประกายมงกุฎ (Crown Silhouette)</span>
              <span className="toggle-desc">แสดงลายน้ำมงกุฎคริสตัลโปร่งแสงกึ่งกลางเวที</span>
            </div>
          </label>

          <label className="toggle-switch-card">
            <input
              type="checkbox"
              checked={current.showWaterReflection}
              onChange={e => updateSetting('showWaterReflection', e.target.checked)}
            />
            <div className="toggle-card-content">
              <span className="toggle-title">🌊 แสงสะท้อนผิวน้ำ (Water Reflection)</span>
              <span className="toggle-desc">ผิวน้ำสะท้อนแสงไฟและเวทีที่ขอบจอด้านล่าง</span>
            </div>
          </label>

          <label className="toggle-switch-card">
            <input
              type="checkbox"
              checked={current.showAurora}
              onChange={e => updateSetting('showAurora', e.target.checked)}
            />
            <div className="toggle-card-content">
              <span className="toggle-title">✨ ม่านแสงออโรร่า (Aurora Glow)</span>
              <span className="toggle-desc">ริ้วคลื่นแสงสีน้ำเงิน-ม่วงพลิ้วไหว</span>
            </div>
          </label>

          <label className="toggle-switch-card">
            <input
              type="checkbox"
              checked={current.showCrystals}
              onChange={e => updateSetting('showCrystals', e.target.checked)}
            />
            <div className="toggle-card-content">
              <span className="toggle-title">💎 ฝุ่นคริสตัลและโบเก้ (Floating Crystals)</span>
              <span className="toggle-desc">ละอองประกายคริสตัลระยิบระยับลอยตัว</span>
            </div>
          </label>
        </div>
      </div>

      {/* 3. Sliders for Particle Density & Glow */}
      <div className="control-section-group">
        <h3 className="group-title">
          <span className="group-icon">🎚️</span>
          <span>ความเข้มของแสงและอนุภาค (Density & Glow Intensity)</span>
        </h3>

        <div className="sliders-panel">
          <div className="slider-row">
            <div className="slider-header">
              <span className="slider-label">ความหนาแน่นของคริสตัล (Crystal Density)</span>
              <span className="slider-value">{Math.round(current.particleDensity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.0"
              step="0.1"
              className="range-slider"
              value={current.particleDensity}
              onChange={e => updateSetting('particleDensity', parseFloat(e.target.value))}
            />
          </div>

          <div className="slider-row">
            <div className="slider-header">
              <span className="slider-label">ความสว่างของแสงออโรร่า (Glow Intensity)</span>
              <span className="slider-value">{Math.round(current.glowIntensity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.0"
              step="0.1"
              className="range-slider"
              value={current.glowIntensity}
              onChange={e => updateSetting('glowIntensity', parseFloat(e.target.value))}
            />
          </div>
        </div>

        <div className="section-reset-row" style={{ marginTop: '16px' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onChange(DEFAULT_APPEARANCE_SETTINGS)}
          >
            ↺ รีเซ็ตค่าการแสดงผลเริ่มต้น
          </button>
        </div>
      </div>
    </div>
  );
};
