import React from 'react';
import {
  Search,
  Plus,
  Download,
  Upload,
  RotateCcw,
} from 'lucide-react';

import type { QuestionBankDashboardModel } from '../useQuestionBankDashboardModel.tsx';

export const ActionBar: React.FC<{ m: QuestionBankDashboardModel }> = ({ m }) => {
  const { search, setSearch, setEditingQuestion, setIsAdding, fileInputRef, roundsList, handleExport, handleImport, handleResetUsed, stats } = m;
  return (
    <>
      {/* 2. Action Bar & Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="ค้นหาข้อความ, ID หรือแท็ก..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem 0.55rem 2.25rem',
              background: 'rgba(14, 18, 44, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: '0.85rem'
            }}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setIsAdding(true);
              setEditingQuestion({
                id: `Q_${Date.now().toString().slice(-4)}`,
                text: '',
                difficulty: 'medium',
                round: roundsList[0] || 'intro',
                enabled: true
              });
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.55rem 0.9rem',
              background: 'linear-gradient(135deg, var(--ctl-accent), var(--ctl-accent-2))',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Plus size={16} /> เพิ่มคำถาม
          </button>

          <button
            onClick={handleExport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.55rem 0.8rem',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              color: '#cbd5e1',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <Download size={15} /> Export JSON
          </button>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.55rem 0.8rem',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              color: '#cbd5e1',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <Upload size={15} /> Import JSON
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </label>

          <button
            onClick={handleResetUsed}
            disabled={stats.used === 0}
            title={stats.used === 0 ? 'ยังไม่มีคำถามที่ใช้แล้ว' : 'ให้คำถามที่ใช้แล้วกลับมาสุ่มได้อีกครั้ง (ประวัติยังอยู่)'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.55rem 0.8rem',
              background: 'rgba(234, 179, 8, 0.1)',
              border: '1px solid rgba(234, 179, 8, 0.35)',
              borderRadius: '8px',
              color: '#facc15',
              fontSize: '0.85rem',
              cursor: stats.used === 0 ? 'not-allowed' : 'pointer',
              opacity: stats.used === 0 ? 0.45 : 1
            }}
          >
            <RotateCcw size={15} /> รีเซ็ตคำถามที่ใช้แล้ว ({stats.used})
          </button>
        </div>
      </div>
    </>
  );
};
