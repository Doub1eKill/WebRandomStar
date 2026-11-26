import React, { useState } from 'react';
import { KeywordItem } from '@/types/word.ts';
import { WordManagerModal } from './WordManagerModal.tsx';
import { DEFAULT_WORDS } from '@/data/defaultWords.ts';
import { CheckCircle2, Edit2, History, Key, Plus, RotateCcw, Search, Sparkle, Sparkles, Trash2, XCircle } from 'lucide-react';
import { notifyOperator } from '@/shared/notices/operatorNotices.ts';

interface WordBankDashboardProps {
  words: KeywordItem[];
  /** Keywords answered in keyword mode (session `usedWordIds`). */
  usedWordIds?: string[];
  /** Clears the session's used-keyword list so every keyword can be drawn again. */
  onResetUsedWords?: () => void;
  onSaveWord: (word: KeywordItem) => void;
  onDeleteWord: (id: string) => void;
  onToggleWord: (id: string) => void;
  onResetWords: (words: KeywordItem[]) => void;
}

export const WordBankDashboard: React.FC<WordBankDashboardProps> = ({
  words,
  usedWordIds = [],
  onResetUsedWords,
  onSaveWord,
  onDeleteWord,
  onToggleWord,
  onResetWords
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingWord, setEditingWord] = useState<KeywordItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter words
  const filteredWords = words.filter(w =>
    w.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (w.englishTheme && w.englishTheme.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (w.description && w.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const enabledCount = words.filter(w => w.enabled).length;
  const usedCount = words.filter(w => usedWordIds.includes(w.id)).length;

  const handleResetUsed = () => {
    if (usedCount === 0) return;
    if (!window.confirm(`คืนสถานะคำสำคัญที่ใช้แล้ว ${usedCount} คำ ให้กลับมาสุ่มได้อีกครั้งหรือไม่?
(ประวัติการตอบยังอยู่ครบ)`)) return;
    onResetUsedWords?.();
    notifyOperator('info', `รีเซ็ตแล้ว คำสำคัญ ${usedCount} คำกลับมาสุ่มได้อีกครั้ง`);
  };

  const handleOpenNew = () => {
    setEditingWord(null);
    setIsModalOpen(true);
  };

  const handleEdit = (word: KeywordItem) => {
    setEditingWord(word);
    setIsModalOpen(true);
  };

  return (
    <div className="word-bank-dashboard">
      {/* Top Header Metrics Bar */}
      <div className="qb-stats-row">
        <div className="qb-stat-card stat-total">
          <div className="stat-card-icon"><Key size={20} /></div>
          <div className="stat-card-body">
            <span className="stat-num">{words.length}</span>
            <span className="stat-lbl">คำสำคัญทั้งหมด</span>
          </div>
        </div>

        <div className="qb-stat-card stat-enabled">
          <div className="stat-card-icon"><CheckCircle2 size={20} /></div>
          <div className="stat-card-body">
            <span className="stat-num">{enabledCount}</span>
            <span className="stat-lbl">เปิดใช้งานในวงหมุน</span>
          </div>
        </div>

        <div className="qb-stat-card stat-disabled">
          <div className="stat-card-icon"><XCircle size={20} /></div>
          <div className="stat-card-body">
            <span className="stat-num">{words.length - enabledCount}</span>
            <span className="stat-lbl">ปิดการใช้งาน</span>
          </div>
        </div>

        <div className="qb-stat-card stat-used">
          <div className="stat-card-icon"><History size={20} /></div>
          <div className="stat-card-body">
            <span className="stat-num">{usedCount}</span>
            <span className="stat-lbl">ใช้แล้ว (ไม่ถูกสุ่มซ้ำ)</span>
          </div>
        </div>
      </div>

      {/* Action and Filter Toolbar */}
      <div className="qb-toolbar">
        <div className="qb-search-wrap">
          <Search size={17} className="search-icon-svg" />
          <input
            type="text"
            className="qb-search-input"
            placeholder="ค้นหาคำสำคัญ, ธีม, คำอธิบาย..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="qb-toolbar-buttons">
          <button className="btn-primary-glow" onClick={handleOpenNew}>
            <Plus size={16} />
            <span>เพิ่มคำสำคัญใหม่</span>
          </button>
          <button
            className="btn-secondary-ghost"
            onClick={() => {
              if (window.confirm(`คุณต้องการรีเซ็ตคลังคำสำคัญกลับเป็นค่าเริ่มต้น ${DEFAULT_WORDS.length} คำหรือไม่?`)) {
                onResetWords(DEFAULT_WORDS);
              }
            }}
            title={`รีเซ็ตเป็นคำเริ่มต้น ${DEFAULT_WORDS.length} คำ`}
          >
            <RotateCcw size={15} />
            <span>รีเซ็ตค่าเริ่มต้น</span>
          </button>
          <button
            className="btn-secondary-ghost btn-reset-used"
            onClick={handleResetUsed}
            disabled={usedCount === 0}
            title={usedCount === 0 ? 'ยังไม่มีคำสำคัญที่ใช้แล้ว' : 'ให้คำสำคัญที่ใช้แล้วกลับมาสุ่มได้อีกครั้ง (ประวัติยังอยู่)'}
          >
            <RotateCcw size={15} />
            <span>รีเซ็ตคำที่ใช้แล้ว ({usedCount})</span>
          </button>
        </div>
      </div>

      {/* Words Table */}
      <div className="qb-table-wrap">
        <table className="qb-table">
          <thead>
            <tr>
              <th style={{ width: '80px', textAlign: 'center' }}>สถานะ</th>
              <th>คำสำคัญ (Keyword)</th>
              <th style={{ width: '200px' }}>ธีมภาษาอังกฤษ</th>
              <th style={{ width: '120px', textAlign: 'center' }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredWords.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={28} color="#7c3aed" />
                    <span style={{ fontSize: '1rem', fontWeight: 500 }}>ไม่พบคำสำคัญที่ตรงกับเงื่อนไขการค้นหา</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredWords.map(item => {
                return (
                  <tr key={item.id} className={!item.enabled ? 'row-disabled' : ''}>
                    <td style={{ textAlign: 'center' }}>
                      <label className="toggle-switch-mini" title={item.enabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}>
                        <input
                          type="checkbox"
                          checked={item.enabled}
                          onChange={() => onToggleWord(item.id)}
                        />
                        <span className="toggle-slider-mini" />
                      </label>
                    </td>
                    <td>
                      <div className="word-cell-wrap">
                        <span className="word-main-title" style={{ color: item.color || '#e2e8f0' }}>
                          <Sparkle size={14} aria-hidden="true" />
                          {item.word}
                          {usedWordIds.includes(item.id) && <span className="word-used-badge">ใช้แล้ว</span>}
                        </span>
                        {item.description && (
                          <span className="word-desc-snippet">{item.description}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="theme-text-muted">{item.englishTheme || '-'}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="table-actions-center">
                        <button
                          className="btn-action-icon edit"
                          onClick={() => handleEdit(item)}
                          title="แก้ไขคำสำคัญ"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="btn-action-icon delete"
                          onClick={() => {
                            if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบคำว่า "${item.word}"?`)) {
                              onDeleteWord(item.id);
                            }
                          }}
                          title="ลบคำสำคัญ"
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

      {/* Modal Dialog */}
      <WordManagerModal
        isOpen={isModalOpen}
        word={editingWord}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveWord}
      />
    </div>
  );
};
