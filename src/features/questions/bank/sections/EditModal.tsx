import React from 'react';
import { Pencil, Plus } from 'lucide-react';
import { QuestionDifficulty } from '@/types/question.ts';

import type { QuestionBankDashboardModel } from '../useQuestionBankDashboardModel.tsx';

export const EditModal: React.FC<{ m: QuestionBankDashboardModel }> = ({ m }) => {
  const { editingQuestion, setEditingQuestion, isAdding, setIsAdding, handleSaveEdit } = m;
  return (
    <>
      {/* 5. Add / Edit Modal */}
      {editingQuestion && (
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
        >
          <form
            onSubmit={handleSaveEdit}
            style={{
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              padding: '1.75rem',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.15rem' }}>
              <span className="ui-ico-label">{isAdding ? <><Plus size={18} aria-hidden="true" />เพิ่มคำถามใหม่</> : <><Pencil size={17} aria-hidden="true" />แก้ไขคำถาม</>}</span>
            </h3>

            <div>
              <label className="ui-field-label">
                รหัสคำถาม (ID)
              </label>
              <input
                type="text"
                disabled={!isAdding}
                value={editingQuestion.id || ''}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, id: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', background: isAdding ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#f8fafc' }}
                required
              />
            </div>

            <div>
              <label className="ui-field-label">
                ข้อความคำถาม
              </label>
              <textarea
                rows={3}
                value={editingQuestion.text || ''}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#f8fafc', resize: 'vertical' }}
                required
              />
            </div>

            <div>
              <label className="ui-field-label">รอบการแข่งขัน</label>
              <input
                type="text"
                value={editingQuestion.round || ''}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, round: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#f8fafc' }}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="ui-field-label">ระดับความยาก</label>
                <select
                  value={editingQuestion.difficulty || 'medium'}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, difficulty: e.target.value as QuestionDifficulty })}
                  style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#f8fafc' }}
                >
                  <option value="easy">Easy (ง่าย)</option>
                  <option value="medium">Medium (ปานกลาง)</option>
                  <option value="hard">Hard (ท้าทาย)</option>
                </select>
              </div>

              <div>
                <label className="ui-field-label">สถานะการเปิดใช้</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', color: '#f8fafc', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editingQuestion.enabled !== false}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, enabled: e.target.checked })}
                  />
                  เปิดใช้งานในระบบ
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => {
                  setEditingQuestion(null);
                  setIsAdding(false);
                }}
                style={{ padding: '0.55rem 1rem', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px', color: '#cbd5e1', cursor: 'pointer' }}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                style={{ padding: '0.55rem 1.25rem', background: 'linear-gradient(135deg, var(--ctl-accent), var(--ctl-accent-2))', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
              >
                บันทึก
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
