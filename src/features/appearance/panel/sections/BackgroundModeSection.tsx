import React from 'react';
import { Gem, Image, Orbit } from 'lucide-react';

import type { AppearanceSettingsModel } from '../useAppearanceSettingsModel.tsx';
import { SettingGroup } from '@/shared/ui/SettingGroup.tsx';
import { ModeCard, ModeGrid } from '@/shared/ui/ModeCard.tsx';

export const BackgroundModeSection: React.FC<{ m: AppearanceSettingsModel }> = ({ m }) => {
  const { current, updateSetting } = m;
  return (
    <SettingGroup
      icon={<Image size={18} aria-hidden="true" />}
      title="รูปแบบพื้นหลังเวทีหลัก (Stage Background Mode)"
      hint="เลือกสลับระหว่างพื้นหลังเนบิวลาคริสตัลปัจจุบัน และพื้นหลังประติมากรรมแก้ว 3D AeroShards (สลับได้ทันทีแบบ Real-time)"
    >
      <ModeGrid>
        <ModeCard
          active={!current.backgroundMode || current.backgroundMode === 'cosmic-canvas'}
          onSelect={() => updateSetting('backgroundMode', 'cosmic-canvas')}
          icon={<Orbit size={22} aria-hidden="true" />}
          name="Cosmic Canvas Stage"
          badge="มาตรฐาน"
          tone="sky"
          description="ฟ้าราตรีเนบิวลา ออโรร่าระยิบระยับ ละอองคริสตัล และมงกุฎแสง (Canvas 2D นิ่งเสถียร 60fps)"
        />
        <ModeCard
          active={current.backgroundMode === 'aero-shards'}
          onSelect={() => updateSetting('backgroundMode', 'aero-shards')}
          icon={<Gem size={22} aria-hidden="true" />}
          name="AeroShards Glass Sculpture"
          badge="ใหม่ 3D"
          tone="violet"
          description="ประติมากรรมเศษแก้วคริสตัล 3D สไตล์ React Bits AeroShards ในโทนสีม่วงคริสตัล-ฟ้าสว่าง คุมธีม 100%"
        />
      </ModeGrid>
    </SettingGroup>
  );
};
