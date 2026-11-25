import React from 'react';
import { BookOpen, Tag, Trophy } from 'lucide-react';

import type { AppearanceSettingsModel } from '../useAppearanceSettingsModel.tsx';
import { SettingGroup } from '@/shared/ui/SettingGroup.tsx';
import { ModeCard, ModeGrid } from '@/shared/ui/ModeCard.tsx';

export const CompetitionModeSection: React.FC<{ m: AppearanceSettingsModel }> = ({ m }) => {
  const { current, updateSetting } = m;
  return (
    <SettingGroup
      icon={<Trophy size={18} aria-hidden="true" />}
      title="รูปแบบการแข่งขันบนเวที (Competition Flow Mode)"
      hint="เลือกรูปแบบขั้นตอนการแข่งขัน: สุ่มเฉพาะคำสำคัญเพื่อแสดงการ์ดคำพร้อมจับเวลาตอบสด หรือสุ่มเปิดคลังคำถามเต็มรูปแบบ"
    >
      <ModeGrid>
        <ModeCard
          testId="quiz-mode-question"
          active={!current.quizMode || current.quizMode === 'question'}
          onSelect={() => updateSetting('quizMode', 'question')}
          icon={<BookOpen size={22} aria-hidden="true" />}
          name="โหมดสุ่มคลังคำถาม"
          badge="มาตรฐาน"
          tone="sky"
          description="สุ่มคำสำคัญ/หมวดหมู่ → สุ่มดึงข้อสอบจากการ์ดคำถาม → เปิดการ์ดคำถามเต็มพร้อมจับเวลา"
        />
        <ModeCard
          testId="quiz-mode-keyword"
          active={current.quizMode === 'keyword'}
          onSelect={() => updateSetting('quizMode', 'keyword')}
          icon={<Tag size={22} aria-hidden="true" />}
          name="โหมดสุ่มคำสำคัญ"
          badge="สุนทรพจน์ / คีย์เวิร์ด"
          tone="violet"
          description="สุ่มเฉพาะคำสำคัญ → แสดงการ์ดคำสำคัญประกายแสงขนาดใหญ่ (Showcase) → เริ่มจับเวลาตอบคำถามทันที"
        />
      </ModeGrid>
    </SettingGroup>
  );
};
