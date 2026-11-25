import React from 'react';
import { GalleryVerticalEnd, Sparkles, Zap } from 'lucide-react';

import type { AppearanceSettingsModel } from '../useAppearanceSettingsModel.tsx';
import { SettingGroup } from '@/shared/ui/SettingGroup.tsx';
import { ModeCard, ModeGrid } from '@/shared/ui/ModeCard.tsx';

export const WordLockSection: React.FC<{ m: AppearanceSettingsModel }> = ({ m }) => {
  const { current, updateSetting } = m;
  return (
    <SettingGroup
      icon={<GalleryVerticalEnd size={18} aria-hidden="true" />}
      title="ช่วงแสดงการ์ดคำที่สุ่มได้ (Selected Keyword Showcase)"
      hint="เลือกว่าจะแสดงหน้าต่างการ์ดสรุปคำสำคัญที่สุ่มได้ (SELECTED KEYWORD) คั่นกลางก่อนเปิดการ์ดคำถามหรือไม่"
    >
      <ModeGrid>
        <ModeCard
          testId="word-lock-card-on"
          active={current.showWordLockPhase !== false}
          onSelect={() => updateSetting('showWordLockPhase', true)}
          icon={<Sparkles size={22} aria-hidden="true" />}
          name="เปิดใช้งาน (ON)"
          badge="ค่าเริ่มต้น"
          tone="sky"
          description="เมื่อหยุดสุ่ม จะแสดงการ์ดคำสำคัญเด่นชัดกลางจอก่อน 1.5 วินาที แล้วจึงเปิดการ์ดคำถาม"
        />
        <ModeCard
          testId="word-lock-card-off"
          active={current.showWordLockPhase === false}
          onSelect={() => updateSetting('showWordLockPhase', false)}
          icon={<Zap size={22} aria-hidden="true" />}
          name="ข้ามช่วงนี้ (OFF)"
          badge="สตรีมกระชับ"
          tone="red"
          description="เมื่อหยุดสุ่ม จะข้ามไปเปิดการ์ดคำถามทันทีโดยไม่ต้องรอแสดงการ์ดคำคั่น"
        />
      </ModeGrid>
    </SettingGroup>
  );
};
