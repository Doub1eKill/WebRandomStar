import React, { useState, useMemo, useRef } from 'react';
import { Question, QuestionCategory, QuestionDifficulty, CATEGORY_CONFIGS } from '@/types/question.ts';
import { exportQuestionsAsJSON } from '@/storage/storageApi.ts';
import { useQuestionImport } from '@/features/questions/QuestionImportDialog.tsx';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Copy,
  Trash2,
  Download,
  Upload,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface QuestionBankDashboardProps {
  questions: Question[];
  usedQuestionIds: string[];
  onSaveQuestions: (updated: Question[]) => void;
}

export const QuestionBankDashboard: React.FC<QuestionBankDashboardProps> = ({
  questions,
  usedQuestionIds,
  onSaveQuestions
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRound, setSelectedRound] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Preview Modal
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);

  // Edit / Add Modal
  const [editingQuestion, setEditingQuestion] = useState<Partial<Question> | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Import error / success message
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Statistics
  const stats = useMemo(() => {
    const total = questions.length;
    const enabled = questions.filter(q => q.enabled).length;
    const disabled = total - enabled;
    const used = questions.filter(q => usedQuestionIds.includes(q.id) || q.used).length;
    const remaining = Math.max(0, enabled - used);
    const categories = Array.from(new Set(questions.map(q => q.category))).length;
    return { total, enabled, disabled, used, remaining, categories };
  }, [questions, usedQuestionIds]);

  // Unique Categories & Rounds
  const categoriesList = useMemo(() => {
    return Array.from(new Set(questions.map(q => q.category)));
  }, [questions]);

  const roundsList = useMemo(() => {
    return Array.from(new Set(questions.map(q => q.round)));
  }, [questions]);

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const isUsed = usedQuestionIds.includes(q.id) || q.used;

      if (selectedCategory !== 'all' && q.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
      if (selectedRound !== 'all' && q.round.toLowerCase() !== selectedRound.toLowerCase()) return false;
      if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
      if (selectedStatus === 'enabled' && !q.enabled) return false;
      if (selectedStatus === 'disabled' && q.enabled) return false;
      if (selectedStatus === 'used' && !isUsed) return false;
      if (selectedStatus === 'unused' && isUsed) return false;

      if (search.trim()) {
        const query = search.toLowerCase();
        const matchText = q.text.toLowerCase().includes(query);
        const matchId = q.id.toLowerCase().includes(query);
        const matchTags = q.tags?.some(t => t.toLowerCase().includes(query));
        if (!matchText && !matchId && !matchTags) return false;
      }

      return true;
    });
  }, [questions, usedQuestionIds, selectedCategory, selectedRound, selectedDifficulty, selectedStatus, search]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleToggleEnable = (id: string) => {
    const updated = questions.map(q => q.id === id ? { ...q, enabled: !q.enabled } : q);
    onSaveQuestions(updated);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบคำถามข้อนี้?')) {
      const updated = questions.filter(q => q.id !== id);
      onSaveQuestions(updated);
      showNotification('success', 'ลบคำถามเรียบร้อยแล้ว');
    }
  };

  const handleDuplicate = (question: Question) => {
    const newId = `${question.id}_copy_${Date.now().toString().slice(-4)}`;
    const copy: Question = {
      ...question,
      id: newId,
      text: `${question.text} (สำเนา)`,
      used: false
    };
    onSaveQuestions([copy, ...questions]);
    showNotification('success', `คัดลอกคำถามเป็น ${newId} สำเร็จ`);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion?.text || !editingQuestion.id || !editingQuestion.category) {
      showNotification('error', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    if (isAdding) {
      // Check duplicate ID
      if (questions.some(q => q.id === editingQuestion.id)) {
        showNotification('error', 'รหัสคำถาม (ID) นี้มีอยู่ในระบบแล้ว');
        return;
      }
      const newQuestion: Question = {
        id: editingQuestion.id,
        text: editingQuestion.text,
        category: editingQuestion.category as QuestionCategory,
        difficulty: (editingQuestion.difficulty || 'medium') as QuestionDifficulty,
        round: editingQuestion.round || 'intro',
        enabled: editingQuestion.enabled !== false,
        used: false,
        tags: editingQuestion.tags || [],
        notes: editingQuestion.notes
      };
      onSaveQuestions([newQuestion, ...questions]);
      showNotification('success', 'เพิ่มคำถามใหม่สำเร็จ');
    } else {
      const updated = questions.map(q => q.id === editingQuestion.id ? { ...q, ...editingQuestion } as Question : q);
      onSaveQuestions(updated);
      showNotification('success', 'บันทึกการแก้ไขสำเร็จ');
    }

    setEditingQuestion(null);
    setIsAdding(false);
  };

  const handleExport = () => {
    const jsonStr = exportQuestionsAsJSON(questions);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `season_quiz_questions_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('success', 'ส่งออกข้อมูลคำถามเป็น JSON สำเร็จ');
  };

  // S1: validate, preview, then merge (default) or replace with a backup.
  const questionImport = useQuestionImport(questions, onSaveQuestions);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) questionImport.openFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {questionImport.dialog}
      {/* Notification Banner */}
      {notification && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            background: notification.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            border: `1px solid ${notification.type === 'success' ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
            color: notification.type === 'success' ? '#86efac' : '#fca5a5',
            fontSize: '0.9rem'
          }}
        >
          {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

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
              background: 'rgba(15, 23, 42, 0.6)',
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
                category: categoriesList[0] || 'Rain',
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
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
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
        </div>
      </div>

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

      {/* 3. Question Table */}
      <div style={{ overflowX: 'auto', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.4)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.02)', color: '#94a3b8' }}>
              <th style={{ padding: '0.75rem 1rem', width: '90px' }}>ID</th>
              <th style={{ padding: '0.75rem 1rem' }}>ข้อความคำถาม</th>
              <th style={{ padding: '0.75rem 1rem', width: '100px' }}>หมวดหมู่</th>
              <th style={{ padding: '0.75rem 1rem', width: '80px' }}>ระดับ</th>
              <th style={{ padding: '0.75rem 1rem', width: '90px' }}>รอบ</th>
              <th style={{ padding: '0.75rem 1rem', width: '90px', textAlign: 'center' }}>สถานะ</th>
              <th style={{ padding: '0.75rem 1rem', width: '130px', textAlign: 'right' }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuestions.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
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
                    <td style={{ padding: '0.75rem 1rem', color: '#cbd5e1' }}>
                      {(() => {
                        const cfg = CATEGORY_CONFIGS[q.category.toLowerCase()];
                        return (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '6px',
                              background: cfg ? `${cfg.color}18` : 'rgba(255, 255, 255, 0.06)',
                              border: `1px solid ${cfg ? `${cfg.color}40` : 'rgba(255, 255, 255, 0.1)'}`,
                              color: cfg ? cfg.color : '#cbd5e1',
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}
                          >
                            <span>{cfg?.icon || '✨'}</span>
                            <span>{cfg?.name || q.category}</span>
                          </span>
                        );
                      })()}
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
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          title="ดูตัวอย่าง (เฉพาะหลังเวที)"
                          onClick={() => setPreviewQuestion(q)}
                          style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: '0.2rem' }}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          title="แก้ไข"
                          onClick={() => {
                            setIsAdding(false);
                            setEditingQuestion(q);
                          }}
                          style={{ background: 'none', border: 'none', color: '#a855f7', cursor: 'pointer', padding: '0.2rem' }}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          title="คัดลอก"
                          onClick={() => handleDuplicate(q)}
                          style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '0.2rem' }}
                        >
                          <Copy size={15} />
                        </button>
                        <button
                          title="ลบ"
                          onClick={() => handleDelete(q.id)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.2rem' }}
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
              {isAdding ? '➕ เพิ่มคำถามใหม่' : '✏️ แก้ไขคำถาม'}
            </h3>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
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
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>หมวดหมู่</label>
                <input
                  type="text"
                  value={editingQuestion.category || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, category: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#f8fafc' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>รอบการแข่งขัน</label>
                <input
                  type="text"
                  value={editingQuestion.round || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, round: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#f8fafc' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>ระดับความยาก</label>
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
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>สถานะการเปิดใช้</label>
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
                style={{ padding: '0.55rem 1.25rem', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
              >
                บันทึก
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
