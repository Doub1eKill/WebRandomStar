import React, { useState } from 'react';
import { Question, QuestionCategory, CATEGORY_CONFIGS } from '../../types/question.ts';
import { exportQuestionsAsJSON, parseImportedQuestions } from '../../utils/storage.ts';
import { DEFAULT_QUESTIONS } from '../../data/defaultQuestions.ts';

interface QuestionManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  onSaveQuestions: (updated: Question[]) => void;
}

export const QuestionManagerModal: React.FC<QuestionManagerModalProps> = ({
  isOpen,
  onClose,
  questions,
  onSaveQuestions
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // New question form state
  const [isAdding, setIsAdding] = useState(false);
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState<QuestionCategory>('rain');
  const [newDifficulty, setNewDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [newRound, setNewRound] = useState<'intro' | 'general' | 'attitude' | 'scenario' | 'final'>('attitude');
  const [newTags, setNewTags] = useState('');

  if (!isOpen) return null;

  const filtered = questions.filter(q => {
    const matchCat = filterCategory === 'all' || q.category === filterCategory;
    const matchSearch = searchTerm === '' || q.text.toLowerCase().includes(searchTerm.toLowerCase()) || q.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleToggleEnabled = (id: string) => {
    const updated = questions.map(q => q.id === id ? { ...q, enabled: !q.enabled } : q);
    onSaveQuestions(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm('คุณต้องการลบคำถามข้อนี้ใช่หรือไม่?')) {
      const updated = questions.filter(q => q.id !== id);
      onSaveQuestions(updated);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const newQ: Question = {
      id: `Q_CUSTOM_${Date.now().toString().slice(-4)}`,
      text: newText.trim(),
      category: newCategory,
      difficulty: newDifficulty,
      round: newRound,
      enabled: true,
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean)
    };

    onSaveQuestions([newQ, ...questions]);
    setNewText('');
    setNewTags('');
    setIsAdding(false);
  };

  const handleExport = () => {
    const jsonStr = exportQuestionsAsJSON(questions);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `season-quiz-questions-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = parseImportedQuestions(content);
      if (result.success && result.data) {
        onSaveQuestions(result.data);
        alert(`นำเข้าคำถามสำเร็จทั้งหมด ${result.data.length} ข้อ`);
      } else {
        alert(`เกิดข้อผิดพลาดในการนำเข้า: ${result.error}`);
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = () => {
    if (confirm('ต้องการคืนค่าคำถามทั้งหมดกลับเป็น 42 ข้อมาตรฐานใช่หรือไม่? ข้อมูลที่แก้ไขจะถูกแทนที่')) {
      onSaveQuestions(DEFAULT_QUESTIONS);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon">📚</span>
            <div>
              <h2 className="modal-title">คลังคำถาม (Question Bank Manager)</h2>
              <p className="modal-sub">มีคำถามทั้งหมด {questions.length} ข้อ ({questions.filter(q => q.enabled).length} เปิดใช้งาน)</p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}>✕</button>
        </div>

        {/* Toolbar */}
        <div className="modal-toolbar">
          <input
            type="text"
            className="input-search"
            placeholder="🔍 ค้นหาตามข้อความ หรือ ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="custom-select select-filter"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">ทุกหมวดธรรมชาติ (All Categories)</option>
            {Object.values(CATEGORY_CONFIGS).map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name} ({cat.englishName})
              </option>
            ))}
          </select>

          <button className="btn-primary btn-sm" onClick={() => setIsAdding(!isAdding)}>
            {isAdding ? 'ยกเลิก' : '+ เพิ่มคำถามใหม่'}
          </button>
        </div>

        {/* Add Question Form */}
        {isAdding && (
          <form className="add-question-form glass-panel" onSubmit={handleAddSubmit}>
            <h3>เพิ่มคำถามใหม่</h3>
            <textarea
              className="custom-textarea"
              placeholder="พิมพ์ข้อความคำถาม..."
              rows={3}
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              required
            />
            <div className="form-row">
              <div>
                <label>หมวดธรรมชาติ:</label>
                <select
                  className="custom-select"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as QuestionCategory)}
                >
                  {Object.values(CATEGORY_CONFIGS).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name} ({cat.englishName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>ระดับความยาก:</label>
                <select
                  className="custom-select"
                  value={newDifficulty}
                  onChange={(e) => setNewDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label>รอบการแข่งขัน:</label>
                <select
                  className="custom-select"
                  value={newRound}
                  onChange={(e) => setNewRound(e.target.value as 'intro' | 'general' | 'attitude' | 'scenario' | 'final')}
                >
                  <option value="intro">Intro</option>
                  <option value="general">General</option>
                  <option value="attitude">Attitude</option>
                  <option value="scenario">Scenario</option>
                  <option value="final">Final</option>
                </select>
              </div>
            </div>

            <div>
              <label>แท็ก (คั่นด้วยจุลภาค):</label>
              <input
                type="text"
                className="custom-input"
                placeholder="ทัศนคติ, การเรียนรู้"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary btn-sm">บันทึกคำถาม</button>
              <button type="button" className="btn-secondary btn-sm" onClick={() => setIsAdding(false)}>ยกเลิก</button>
            </div>
          </form>
        )}

        {/* Questions Table */}
        <div className="questions-table-wrap">
          <table className="questions-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>สถานะ</th>
                <th style={{ width: '100px' }}>หมวด</th>
                <th>ข้อความคำถาม</th>
                <th style={{ width: '90px' }}>รอบ</th>
                <th style={{ width: '100px' }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(q => (
                <tr key={q.id} className={!q.enabled ? 'row-disabled' : ''}>
                  <td>
                    <button
                      className={`btn-toggle-switch ${q.enabled ? 'active' : ''}`}
                      onClick={() => handleToggleEnabled(q.id)}
                      title={q.enabled ? 'คลิกเพื่อปิดใช้งาน' : 'คลิกเพื่อเปิดใช้งาน'}
                    >
                      {q.enabled ? 'ON' : 'OFF'}
                    </button>
                  </td>
                  <td>
                    <span className="cat-table-badge">{q.category}</span>
                  </td>
                  <td>
                    <p className="table-q-text">{q.text}</p>
                    <div className="table-tags">
                      <span className="table-id-tag">{q.id}</span>
                      {q.tags?.map((t, idx) => (
                        <span key={idx} className="table-tag">#{t}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className="round-table-badge">{q.round}</span>
                  </td>
                  <td>
                    <button className="btn-table-delete" onClick={() => handleDelete(q.id)} title="ลบคำถาม">
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <div className="footer-left">
            <button className="btn-secondary btn-sm" onClick={handleExport}>
              📥 ส่งออก JSON
            </button>
            <label className="btn-secondary btn-sm btn-file-label">
              📤 นำเข้า JSON
              <input type="file" accept=".json" onChange={handleImportFile} style={{ display: 'none' }} />
            </label>
            <button className="btn-secondary btn-sm btn-danger-soft" onClick={handleResetDefaults}>
              ↺ คืนค่ามาตรฐาน 42 ข้อ
            </button>
          </div>
          <button className="btn-primary btn-sm" onClick={onClose}>
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
