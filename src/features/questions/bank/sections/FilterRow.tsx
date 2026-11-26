import React from 'react';
import {
  Filter,
} from 'lucide-react';

import type { QuestionBankDashboardModel } from '../useQuestionBankDashboardModel.tsx';

export const FilterRow: React.FC<{ m: QuestionBankDashboardModel }> = ({ m }) => {
  const { questions, selectedRound, setSelectedRound, selectedDifficulty, setSelectedDifficulty, selectedStatus, setSelectedStatus, roundsList, filteredQuestions } = m;
  return (
    <>
      {/* Filter Row */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.8rem' }}>
        <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Filter size={14} /> ตัวกรอง:
        </span>

        <select
          value={selectedRound}
          onChange={(e) => setSelectedRound(e.target.value)}
          className="ui-select-compact"
        >
          <option value="all">ทุกรอบ</option>
          {roundsList.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="ui-select-compact"
        >
          <option value="all">ทุกระดับความยาก</option>
          <option value="easy">Easy (ง่าย)</option>
          <option value="medium">Medium (ปานกลาง)</option>
          <option value="hard">Hard (ท้าทาย)</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="ui-select-compact"
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
