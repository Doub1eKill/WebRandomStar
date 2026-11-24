import React from 'react';
import { CATEGORY_CONFIGS } from '@/types/question.ts';
import {
  Filter,
} from 'lucide-react';

import type { QuestionBankDashboardModel } from '../useQuestionBankDashboardModel.tsx';

export const FilterRow: React.FC<{ m: QuestionBankDashboardModel }> = ({ m }) => {
  const { questions, selectedCategory, setSelectedCategory, selectedRound, setSelectedRound, selectedDifficulty, setSelectedDifficulty, selectedStatus, setSelectedStatus, categoriesList, roundsList, filteredQuestions } = m;
  return (
    <>
      {/* Filter Row */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.8rem' }}>
        <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Filter size={14} /> ตัวกรอง:
        </span>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ background: 'rgba(15, 23, 42, 0.8)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', padding: '0.35rem 0.6rem', borderRadius: '6px' }}
        >
          <option value="all">ทุกหมวดหมู่ ({categoriesList.length})</option>
          {categoriesList.map(c => {
            const cfg = CATEGORY_CONFIGS[c.toLowerCase()];
            return (
              <option key={c} value={c}>
                {cfg ? `${cfg.icon} ${cfg.name} (${cfg.englishName})` : c}
              </option>
            );
          })}
        </select>

        <select
          value={selectedRound}
          onChange={(e) => setSelectedRound(e.target.value)}
          style={{ background: 'rgba(15, 23, 42, 0.8)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', padding: '0.35rem 0.6rem', borderRadius: '6px' }}
        >
          <option value="all">ทุกรอบ</option>
          {roundsList.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          style={{ background: 'rgba(15, 23, 42, 0.8)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', padding: '0.35rem 0.6rem', borderRadius: '6px' }}
        >
          <option value="all">ทุกระดับความยาก</option>
          <option value="easy">Easy (ง่าย)</option>
          <option value="medium">Medium (ปานกลาง)</option>
          <option value="hard">Hard (ท้าทาย)</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          style={{ background: 'rgba(15, 23, 42, 0.8)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', padding: '0.35rem 0.6rem', borderRadius: '6px' }}
        >
          <option value="all">ทุกสถานะ</option>
          <option value="enabled">เปิดใช้งาน (Enabled)</option>
          <option value="disabled">ปิดใช้งาน (Disabled)</option>
          <option value="unused">ยังไม่เคยใช้ (Unused)</option>
          <option value="used">ใช้แล้ว (Used)</option>
        </select>

        <span style={{ marginLeft: 'auto', color: '#94a3b8' }}>
          พบ {filteredQuestions.length} / {questions.length} ข้อ
        </span>
      </div>
    </>
  );
};
