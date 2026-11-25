import React from 'react';
import { Crown, Gem, Sparkles, WavesHorizontal } from 'lucide-react';

import type { AppearanceSettingsModel } from '../useAppearanceSettingsModel.tsx';
import { SettingGroup } from '@/shared/ui/SettingGroup.tsx';

export const VisualEffectsSection: React.FC<{ m: AppearanceSettingsModel }> = ({ m }) => {
  const { current, updateSetting } = m;
  return (
    <SettingGroup icon={<Sparkles size={18} aria-hidden="true" />} title="บรรยากาศเวทีและแสงสี (Atmospheric Layers & FX)">

      <div className="toggles-grid">
        <label className="toggle-switch-card">
          <input
            type="checkbox"
            checked={current.showCrownSilhouette}
            onChange={e => updateSetting('showCrownSilhouette', e.target.checked)}
          />
          <div className="toggle-card-content">
            <span className="toggle-title ui-ico-label"><Crown size={15} aria-hidden="true" />เงาประกายมงกุฎ (Crown Silhouette)</span>
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
            <span className="toggle-title ui-ico-label"><WavesHorizontal size={15} aria-hidden="true" />แสงสะท้อนผิวน้ำ (Water Reflection)</span>
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
            <span className="toggle-title ui-ico-label"><Sparkles size={15} aria-hidden="true" />ม่านแสงออโรร่า (Aurora Glow)</span>
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
            <span className="toggle-title ui-ico-label"><Gem size={15} aria-hidden="true" />ฝุ่นคริสตัลและโบเก้ (Floating Crystals)</span>
            <span className="toggle-desc">ละอองประกายคริสตัลระยิบระยับลอยตัว</span>
          </div>
        </label>
      </div>
    </SettingGroup>
  );
};
