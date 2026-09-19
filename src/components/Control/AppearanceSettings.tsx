import React, { useState } from 'react';
import { AppearanceSettings, DEFAULT_APPEARANCE_SETTINGS } from '../../types/appearance.ts';
import { FONT_PRESETS } from '../../utils/typography.ts';

interface AppearanceSettingsProps {
  settings: AppearanceSettings;
  onChange: (updated: AppearanceSettings) => void;
}

export const AppearanceSettingsPanel: React.FC<AppearanceSettingsProps> = ({
  settings,
  onChange
}) => {
  const current = settings || DEFAULT_APPEARANCE_SETTINGS;

  const [customName, setCustomName] = useState(current.customFont?.name || '');
  const [customFamily, setCustomFamily] = useState(current.customFont?.fontFamily || '');
  const [customUrl, setCustomUrl] = useState(current.customFont?.googleFontUrl || '');
  const [isCustomSaved, setIsCustomSaved] = useState(false);

  const updateSetting = <K extends keyof AppearanceSettings>(key: K, value: AppearanceSettings[K]) => {
    onChange({
      ...current,
      [key]: value
    });
  };

  const handleSaveCustomFont = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFamily.trim()) return;

    onChange({
      ...current,
      fontPreset: 'custom',
      customFont: {
        name: customName.trim() || 'Custom Font',
        fontFamily: customFamily.trim(),
        googleFontUrl: customUrl.trim() || undefined
      }
    });
    setIsCustomSaved(true);
    setTimeout(() => setIsCustomSaved(false), 2500);
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

      {/* 1. Typography & Font Selection Section */}
      <div className="control-section-group">
        <h3 className="group-title">
          <span className="group-icon">🔤</span>
          <span>รูปแบบตัวอักษรและฟอนต์ (Typography & Font Selection)</span>
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 12px 0' }}>
          เลือกฟอนต์หลักของเวทีสำหรับหัวข้อ คำสำคัญ และการ์ดคำถาม (ภาษาไทยจะจับคู่กับ Prompt เสมอเพื่อความคมชัด)
        </p>

        <div className="font-preset-grid">
          {/* Cinzel */}
          <button
            type="button"
            data-testid="font-card-cinzel"
            className={`font-preset-card ${(!current.fontPreset || current.fontPreset === 'cinzel') ? 'active' : ''}`}
            onClick={() => updateSetting('fontPreset', 'cinzel')}
          >
            <div className="font-card-header">
              <span className="font-name">{FONT_PRESETS.cinzel.name}</span>
              <span className="font-badge badge-royal">{FONT_PRESETS.cinzel.styleTag}</span>
            </div>
            <div className="font-author">{FONT_PRESETS.cinzel.author}</div>
            <div className="font-preview-sample" style={{ fontFamily: FONT_PRESETS.cinzel.fontFamily }}>
              CHARM OF TRANSITION 2026 — มนต์เสน่ห์แห่งรอยต่อฤดู
            </div>
            <div className="font-desc">{FONT_PRESETS.cinzel.description}</div>
          </button>

          {/* Amoria */}
          <button
            type="button"
            data-testid="font-card-amoria"
            className={`font-preset-card ${current.fontPreset === 'amoria' ? 'active' : ''}`}
            onClick={() => updateSetting('fontPreset', 'amoria')}
          >
            <div className="font-card-header">
              <span className="font-name">{FONT_PRESETS.amoria.name}</span>
              <span className="font-badge badge-luxury">{FONT_PRESETS.amoria.styleTag}</span>
            </div>
            <div className="font-author">{FONT_PRESETS.amoria.author}</div>
            <div className="font-preview-sample" style={{ fontFamily: FONT_PRESETS.amoria.fontFamily }}>
              CHARM OF TRANSITION 2026 — มนต์เสน่ห์แห่งรอยต่อฤดู
            </div>
            <div className="font-desc">{FONT_PRESETS.amoria.description}</div>
          </button>

          {/* Verve */}
          <button
            type="button"
            data-testid="font-card-verve"
            className={`font-preset-card ${current.fontPreset === 'verve' ? 'active' : ''}`}
            onClick={() => updateSetting('fontPreset', 'verve')}
          >
            <div className="font-card-header">
              <span className="font-name">{FONT_PRESETS.verve.name}</span>
              <span className="font-badge badge-heritage">{FONT_PRESETS.verve.styleTag}</span>
            </div>
            <div className="font-author">{FONT_PRESETS.verve.author}</div>
            <div className="font-preview-sample" style={{ fontFamily: FONT_PRESETS.verve.fontFamily }}>
              CHARM OF TRANSITION 2026 — มนต์เสน่ห์แห่งรอยต่อฤดู
            </div>
            <div className="font-desc">{FONT_PRESETS.verve.description}</div>
          </button>

          {/* Outfit */}
          <button
            type="button"
            data-testid="font-card-outfit"
            className={`font-preset-card ${current.fontPreset === 'outfit' ? 'active' : ''}`}
            onClick={() => updateSetting('fontPreset', 'outfit')}
          >
            <div className="font-card-header">
              <span className="font-name">{FONT_PRESETS.outfit.name}</span>
              <span className="font-badge badge-modern">{FONT_PRESETS.outfit.styleTag}</span>
            </div>
            <div className="font-author">{FONT_PRESETS.outfit.author}</div>
            <div className="font-preview-sample" style={{ fontFamily: FONT_PRESETS.outfit.fontFamily }}>
              CHARM OF TRANSITION 2026 — มนต์เสน่ห์แห่งรอยต่อฤดู
            </div>
            <div className="font-desc">{FONT_PRESETS.outfit.description}</div>
          </button>

          {/* Custom WebFont Option */}
          <button
            type="button"
            data-testid="font-card-custom"
            className={`font-preset-card ${current.fontPreset === 'custom' ? 'active' : ''}`}
            onClick={() => updateSetting('fontPreset', 'custom')}
          >
            <div className="font-card-header">
              <span className="font-name">Custom WebFont</span>
              <span className="font-badge badge-custom">กำหนดเอง</span>
            </div>
            <div className="font-author">
              {current.customFont?.name ? `ใช้งาน: ${current.customFont.name}` : 'เพิ่มฟอนต์ Google Fonts / WebFont'}
            </div>
            <div
              className="font-preview-sample"
              style={{ fontFamily: current.customFont?.fontFamily || 'sans-serif' }}
            >
              CHARM OF TRANSITION 2026 — มนต์เสน่ห์แห่งรอยต่อฤดู
            </div>
            <div className="font-desc">
              ปรับแต่งและใส่ฟอนต์ใหม่ตามต้องการผ่าน Google Fonts URL หรือ Custom Font Family
            </div>
          </button>
        </div>

        {/* Custom Font Configuration Drawer */}
        {(current.fontPreset === 'custom' || customFamily) && (
          <form onSubmit={handleSaveCustomFont} className="custom-font-drawer" style={{ marginTop: '16px' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: '#c084fc', marginBottom: '10px' }}>
              ⚙️ ตั้งค่าฟอนต์กำหนดเอง (Custom Font Settings)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                  ชื่อฟอนต์ (Font Display Name)
                </label>
                <input
                  type="text"
                  className="control-input"
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(192, 132, 252, 0.3)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                  placeholder="เช่น Playfair Display"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                  CSS Font Family (จำเป็น)
                </label>
                <input
                  type="text"
                  required
                  className="control-input"
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(192, 132, 252, 0.3)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                  placeholder="เช่น 'Playfair Display', serif"
                  value={customFamily}
                  onChange={e => setCustomFamily(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                  Google Fonts CSS URL (ตัวเลือก)
                </label>
                <input
                  type="url"
                  className="control-input"
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(192, 132, 252, 0.3)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                  placeholder="https://fonts.googleapis.com/..."
                  value={customUrl}
                  onChange={e => setCustomUrl(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                💾 บันทึกฟอนต์กำหนดเอง
              </button>
              {isCustomSaved && (
                <span style={{ fontSize: '0.8rem', color: '#4ade80' }}>
                  ✓ บันทึกฟอนต์และปรับใช้บนเวทีเรียบร้อยแล้ว
                </span>
              )}
            </div>
          </form>
        )}
      </div>

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

      {/* 5. Visual Effects & Layers */}
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

      {/* 4. Sliders for Particle Density & Glow */}
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
