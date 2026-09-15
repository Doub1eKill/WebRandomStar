import React, { useState, useEffect } from 'react';
import { KeywordItem } from '../../types/word.ts';
import { CATEGORY_CONFIGS } from '../../types/question.ts';

interface WordManagerModalProps {
  isOpen: boolean;
  word?: KeywordItem | null;
  onClose: () => void;
  onSave: (word: KeywordItem) => void;
}

export const WordManagerModal: React.FC<WordManagerModalProps> = ({
  isOpen,
  word,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<KeywordItem>>({
    word: '',
    category: 'moon',
    englishTheme: '',
    color: '#e2e8f0',
    enabled: true,
    description: '',
    priority: 1
  });

  useEffect(() => {
    if (word) {
      setFormData(word);
    } else {
      setFormData({
        id: `word_${Date.now()}`,
        word: '',
        category: 'moon',
        englishTheme: 'Authenticity & Empathy',
        color: '#e2e8f0',
        enabled: true,
        description: '',
        priority: 1
      });
    }
  }, [word, isOpen]);

  if (!isOpen) return null;

  const handleCategoryChange = (catId: string) => {
    const config = CATEGORY_CONFIGS[catId.toLowerCase()];
    setFormData(prev => ({
      ...prev,
      category: catId,
      englishTheme: config?.subtitle || prev.englishTheme,
      color: config?.color || prev.color
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.word || formData.word.trim() === '') return;

    onSave({
      id: formData.id || `word_${Date.now()}`,
      word: formData.word.trim(),
      category: formData.category || 'moon',
      englishTheme: formData.englishTheme || 'Theme Keyword',
      color: formData.color || '#F5D98A',
      enabled: formData.enabled ?? true,
      description: formData.description || '',
      priority: Number(formData.priority) || 1,
      updatedAt: new Date().toISOString()
    });
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-panel glassmorphism">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon">✦</span>
            <h3 className="modal-title">{word ? 'แก้ไขคำสำคัญ (Edit Keyword)' : 'เพิ่มคำสำคัญใหม่ (New Keyword)'}</h3>
          </div>
          <button className="btn-close-modal" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="form-label">คำสำคัญภาษาไทย (Keyword)*</label>
            <input
              type="text"
              className="form-input"
              value={formData.word || ''}
              onChange={e => setFormData({ ...formData, word: e.target.value })}
              placeholder="เช่น ความฝัน, ภาวะผู้นำ, ตัวตน"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">หมวดหมู่ประจำคำ (Category)</label>
            <select
              className="form-select"
              value={formData.category || 'moon'}
              onChange={e => handleCategoryChange(e.target.value)}
            >
              {Object.values(CATEGORY_CONFIGS).map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name} ({cat.subtitle})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">ธีมภาษาอังกฤษ (English Subtitle)</label>
            <input
              type="text"
              className="form-input"
              value={formData.englishTheme || ''}
              onChange={e => setFormData({ ...formData, englishTheme: e.target.value })}
              placeholder="เช่น Authenticity & Empathy"
            />
          </div>

          <div className="form-group">
            <label className="form-label">คำอธิบายและแนวคำถาม (Description)</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={formData.description || ''}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="คำอธิบายสั้นๆ เกี่ยวกับคำนี้..."
            />
          </div>

          <div className="form-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.enabled ?? true}
                onChange={e => setFormData({ ...formData, enabled: e.target.checked })}
              />
              <span>เปิดใช้งานในการหมุนสุ่ม (Enabled in Word Spin)</span>
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>ยกเลิก</button>
            <button type="submit" className="btn-primary">บันทึกคำสำคัญ ✓</button>
          </div>
        </form>
      </div>
    </div>
  );
};
