import React from 'react';

import type { QuestionBankDashboardModel } from '../useQuestionBankDashboardModel.tsx';

export const PreviewModal: React.FC<{ m: QuestionBankDashboardModel }> = ({ m }) => {
  const { usedQuestionIds, previewQuestion, setPreviewQuestion } = m;
  return (
    <>
      {/* 4. Preview Modal (Backstage Operator Preview Only - Never opens on Stage) */}
      {previewQuestion && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
          onClick={() => setPreviewQuestion(null)}
        >
          <div
            style={{
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              padding: '1.75rem',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontFamily: 'monospace' }}>
                ID: {previewQuestion.id} (Operator Preview Only)
              </span>
              <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#cbd5e1' }}>
                หมวด: {previewQuestion.category}
              </span>
            </div>

            <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#f8fafc', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              "{previewQuestion.text}"
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem', color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
              <div>ความยาก: <strong style={{ color: '#f8fafc' }}>{previewQuestion.difficulty}</strong></div>
              <div>รอบ: <strong style={{ color: '#f8fafc' }}>{previewQuestion.round}</strong></div>
              <div>สถานะ: <strong style={{ color: previewQuestion.enabled ? '#22c55e' : '#ef4444' }}>{previewQuestion.enabled ? 'เปิดใช้งาน' : 'ปิด'}</strong></div>
              <div>ประวัติ: <strong style={{ color: usedQuestionIds.includes(previewQuestion.id) ? '#eab308' : '#38bdf8' }}>{usedQuestionIds.includes(previewQuestion.id) ? 'ใช้แล้ว' : 'ยังไม่เคยใช้'}</strong></div>
            </div>

            <div style={{ textAlign: 'right', marginTop: '1.5rem' }}>
              <button
                onClick={() => setPreviewQuestion(null)}
                style={{ padding: '0.5rem 1.2rem', background: 'rgba(255, 255, 255, 0.1)', border: 'none', borderRadius: '8px', color: '#f8fafc', cursor: 'pointer' }}
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
