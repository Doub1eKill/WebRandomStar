import React from 'react';
import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import { DEFAULT_APPEARANCE_SETTINGS } from '@/types/appearance.ts';

import type { AppearanceSettingsModel } from '../useAppearanceSettingsModel.tsx';
import { SettingGroup } from '@/shared/ui/SettingGroup.tsx';

export const EffectSlidersSection: React.FC<{ m: AppearanceSettingsModel }> = ({ m }) => {
  const { onChange, current, updateSetting } = m;
  return (
    <SettingGroup icon={<SlidersHorizontal size={18} aria-hidden="true" />} title="ความเข้มของแสงและอนุภาค (Density & Glow Intensity)">

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
          <RotateCcw size={14} aria-hidden="true" /> รีเซ็ตค่าการแสดงผลเริ่มต้น
        </button>
      </div>
    </SettingGroup>
  );
};
