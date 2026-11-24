import React from 'react';

import type { QuestionBankDashboardModel } from '../useQuestionBankDashboardModel.tsx';

export const StatsCards: React.FC<{ m: QuestionBankDashboardModel }> = ({ m }) => {
  const { stats } = m;
  return (
    <>
      {/* 1. Summary Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
        <div className="stat-card" style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>คำถามทั้งหมด</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>{stats.total}</div>
        </div>
        <div className="stat-card" style={{ background: 'rgba(34, 197, 94, 0.06)', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
          <div style={{ fontSize: '0.75rem', color: '#86efac' }}>เปิดใช้งาน (Enabled)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22c55e' }}>{stats.enabled}</div>
        </div>
        <div className="stat-card" style={{ background: 'rgba(239, 68, 68, 0.06)', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <div style={{ fontSize: '0.75rem', color: '#fca5a5' }}>ปิดใช้งาน (Disabled)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>{stats.disabled}</div>
        </div>
        <div className="stat-card" style={{ background: 'rgba(234, 179, 8, 0.06)', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
          <div style={{ fontSize: '0.75rem', color: '#fde047' }}>ใช้ไปแล้ว (Used)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#eab308' }}>{stats.used}</div>
        </div>
        <div className="stat-card" style={{ background: 'rgba(56, 189, 248, 0.06)', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
          <div style={{ fontSize: '0.75rem', color: '#7dd3fc' }}>คงเหลือ (Remaining)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#38bdf8' }}>{stats.remaining}</div>
        </div>
      </div>
    </>
  );
};
