import React from 'react';
import { FONT_PRESETS } from '@/features/appearance/typography.ts';

import type { AppearanceSettingsModel } from '../useAppearanceSettingsModel.tsx';

export const TypographySection: React.FC<{ m: AppearanceSettingsModel }> = ({ m }) => {
  const { current, customName, setCustomName, customFamily, setCustomFamily, customUrl, setCustomUrl, isCustomSaved, updateSetting, handleSaveCustomFont } = m;
  return (
    <>
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
    </>
  );
};
