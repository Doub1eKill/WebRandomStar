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
