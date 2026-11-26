import React from 'react';
import {
  Edit2,
  Copy,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
} from 'lucide-react';

import type { QuestionBankDashboardModel } from '../useQuestionBankDashboardModel.tsx';

export const QuestionTable: React.FC<{ m: QuestionBankDashboardModel }> = ({ m }) => {
  const { usedQuestionIds, setPreviewQuestion, setEditingQuestion, setIsAdding, filteredQuestions, handleToggleEnable, handleDelete, handleDuplicate } = m;
  return (
    <>
      {/* 3. Question Table */}
      <div style={{ overflowX: 'auto', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', background: 'rgba(14, 18, 44, 0.4)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.02)', color: '#94a3b8' }}>
              <th style={{ padding: '0.75rem 1rem', width: '90px' }}>ID</th>
              <th style={{ padding: '0.75rem 1rem' }}>ข้อความคำถาม</th>
              <th style={{ padding: '0.75rem 1rem', width: '80px' }}>ระดับ</th>
              <th style={{ padding: '0.75rem 1rem', width: '90px' }}>รอบ</th>
              <th style={{ padding: '0.75rem 1rem', width: '90px', textAlign: 'center' }}>สถานะ</th>
              <th style={{ padding: '0.75rem 1rem', width: '130px', textAlign: 'right' }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuestions.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                  ไม่พบคำถามที่ตรงกับเงื่อนไขการค้นหา
                </td>
              </tr>
            ) : (
              filteredQuestions.map(q => {
                const isUsed = usedQuestionIds.includes(q.id) || q.used;
                return (
                  <tr
                    key={q.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      background: !q.enabled ? 'rgba(239, 68, 68, 0.02)' : 'transparent',
                      opacity: !q.enabled ? 0.6 : 1
                    }}
                  >
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: '#94a3b8', fontSize: '0.8rem' }}>
                      {q.id}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#f1f5f9', lineHeight: 1.4 }}>
                      {q.text}
                      {isUsed && (
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(234, 179, 8, 0.2)', color: '#fde047' }}>
                          ใช้แล้ว
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', textTransform: 'capitalize' }}>
                      {q.difficulty}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>
                      {q.round}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <button
                        onClick={() => handleToggleEnable(q.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: q.enabled ? '#22c55e' : '#64748b',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                          fontSize: '0.75rem'
                        }}
                      >
                        {q.enabled ? <CheckCircle size={16} /> : <XCircle size={16} />}
                        <span>{q.enabled ? 'เปิด' : 'ปิด'}</span>
                      </button>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.15rem' }}>
                        <button
                          title="ดูตัวอย่าง (เฉพาะหลังเวที)"
                          onClick={() => setPreviewQuestion(q)}
                          style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: '0.45rem', borderRadius: '8px', display: 'inline-flex' }}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          title="แก้ไข"
                          onClick={() => {
                            setIsAdding(false);
                            setEditingQuestion(q);
                          }}
                          style={{ background: 'none', border: 'none', color: '#a855f7', cursor: 'pointer', padding: '0.45rem', borderRadius: '8px', display: 'inline-flex' }}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          title="คัดลอก"
                          onClick={() => handleDuplicate(q)}
                          style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '0.45rem', borderRadius: '8px', display: 'inline-flex' }}
                        >
                          <Copy size={15} />
                        </button>
                        <button
                          title="ลบ"
                          onClick={() => handleDelete(q.id)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.45rem', borderRadius: '8px', display: 'inline-flex' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};
