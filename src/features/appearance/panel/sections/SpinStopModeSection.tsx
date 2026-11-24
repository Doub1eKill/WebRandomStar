import React from 'react';

import type { AppearanceSettingsModel } from '../useAppearanceSettingsModel.tsx';
import { SettingGroup } from '@/shared/ui/SettingGroup.tsx';
import { ModeCard, ModeGrid } from '@/shared/ui/ModeCard.tsx';

export const SpinStopModeSection: React.FC<{ m: AppearanceSettingsModel }> = ({ m }) => {
  const { current, updateSetting } = m;
  return (
    <SettingGroup
      icon="⏱️"
      title="รูปแบบการหยุดสุ่มคำ (Word Spin Stop Mode)"
      hint="เลือกระหว่างการสุ่มและหยุดล็อกคำอัตโนมัติ หรือสุ่มต่อเนื่องจนกว่าจะกดปุ่มหยุด"
    >
      <ModeGrid>
        <ModeCard
          testId="spin-stop-card-auto"
          active={!current.spinStopMode || current.spinStopMode === 'auto'}
          onSelect={() => updateSetting('spinStopMode', 'auto')}
          icon="⏳"
          name="หยุดอัตโนมัติ (Auto-Stop)"
          badge="ค่าเริ่มต้น"
          tone="sky"
          description="หมุนตามเวลาที่กำหนด (4.5 วินาที) แล้วเริ่มชะลอหยุดและล็อกคำที่สุ่มได้อัตโนมัติ"
        />
        <ModeCard
          testId="spin-stop-card-manual"
          active={current.spinStopMode === 'manual'}
          onSelect={() => updateSetting('spinStopMode', 'manual')}
          icon="🛑"
          name="หยุดด้วยตนเอง (Manual Stop)"
          badge="ควบคุมสด"
          tone="red"
          description="คำหมุนต่อเนื่อง 60fps ไปเรื่อยๆ จนกว่าพิธีกร/แอดมินจะกดปุ่ม STOP หรือ Spacebar จึงจะเริ่มชะลอและล็อกคำ"
        />
      </ModeGrid>
    </SettingGroup>
  );
};
