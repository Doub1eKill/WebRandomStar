import React, { useState, useEffect } from 'react';
import { Check, Pencil, Plus, Sparkle, X } from 'lucide-react';
import { KeywordItem } from '@/types/word.ts';
// Loaded with the word bank chunk, after the main stylesheet.
import './wordManagerModal.css';

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
        englishTheme: '',
        color: '#e2e8f0',
        enabled: true,
        description: '',
        priority: 1
      });
    }
  }, [word, isOpen]);

  // Esc closes the dialog, like the close button.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.word || formData.word.trim() === '') return;

    onSave({
      id: formData.id || `word_${Date.now()}`,
      word: formData.word.trim(),
      englishTheme: formData.englishTheme || 'Theme Keyword',
      color: formData.color || '#F5D98A',
      enabled: formData.enabled ?? true,
      description: formData.description || '',
      priority: Number(formData.priority) || 1,
      updatedAt: new Date().toISOString()
    });
    onClose();
  };

  const previewColor = formData.color || '#e2e8f0';
  const enabled = formData.enabled ?? true;

  return (
    <div className="modal-backdrop">
      <div className="kw-modal" role="dialog" aria-modal="true" aria-labelledby="kw-modal-title">
        <div className="kw-modal-header">
          <span className="modal-icon" aria-hidden="true">
            {word ? <Pencil size={20} aria-hidden="true" /> : <Plus size={22} aria-hidden="true" />}
          </span>
          <div className="kw-modal-heading">
            <h3 id="kw-modal-title" className="kw-modal-title">
              {word ? 'แก้ไขคำสำคัญ (Edit Keyword)' : 'เพิ่มคำสำคัญใหม่ (New Keyword)'}
            </h3>
            <p className="kw-modal-sub">คำนี้จะอยู่ในวงล้อสุ่มคำบนเวที</p>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="ปิด" title="ปิด (Esc)">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="kw-form">
          {/* Live preview: the keyword in its colour */}
          <div className="kw-preview" style={{ borderColor: `${previewColor}55`, background: `${previewColor}12` }}>
            <span className="kw-preview-label">ตัวอย่าง</span>
            <span className="kw-preview-word" style={{ color: previewColor }}>
              <Sparkle size={18} aria-hidden="true" />
              {formData.word?.trim() || 'คำสำคัญ'}
            </span>
            <span className="kw-preview-theme">{formData.englishTheme || 'English Subtitle'}</span>
          </div>

          <div className="kw-field">
            <label className="kw-label" htmlFor="kw-word">
              คำสำคัญภาษาไทย (Keyword) <span className="kw-required" aria-hidden="true">*</span>
            </label>
            <input
              id="kw-word"
              type="text"
              className="kw-input"
              value={formData.word || ''}
              onChange={e => setFormData({ ...formData, word: e.target.value })}
              placeholder="เช่น ความมั่นใจ, ความเป็นผู้นำ, ความกล้าหาญ"
              required
              autoFocus
            />
          </div>

          <div className="kw-field">
            <label className="kw-label" htmlFor="kw-theme">ธีมภาษาอังกฤษ (English Subtitle)</label>
            <input
              id="kw-theme"
              type="text"
              className="kw-input"
              value={formData.englishTheme || ''}
              onChange={e => setFormData({ ...formData, englishTheme: e.target.value })}
              placeholder="เช่น Self-Worth"
            />
            <span className="kw-hint">แสดงใต้คำสำคัญบนจอเวทีตอนล็อกคำ</span>
          </div>

          <div className="kw-field">
            <label className="kw-label" htmlFor="kw-desc">คำอธิบายและแนวคำถาม (Description)</label>
            <textarea
              id="kw-desc"
              className="kw-input kw-textarea"
              rows={3}
              value={formData.description || ''}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="คำอธิบายสั้นๆ เกี่ยวกับคำนี้..."
            />
          </div>

          <label className={enabled ? 'kw-switch-card is-on' : 'kw-switch-card'}>
            <span className="toggle-switch-mini">
              <input
                type="checkbox"
                checked={enabled}
                onChange={e => setFormData({ ...formData, enabled: e.target.checked })}
              />
              <span className="toggle-slider-mini" />
            </span>
            <span className="kw-switch-text">
              <span className="kw-switch-title">เปิดใช้งานในการหมุนสุ่ม (Enabled in Word Spin)</span>
              <span className="kw-hint">
                {enabled ? 'คำนี้ถูกสุ่มบนเวทีได้' : 'ปิดไว้ คำนี้จะไม่ถูกสุ่มจนกว่าจะเปิดอีกครั้ง'}
              </span>
            </span>
          </label>

          <div className="kw-footer">
            <button type="button" className="btn-secondary-ghost" onClick={onClose}>
              ยกเลิก
            </button>
            <button type="submit" className="btn-primary-glow">
              <Check size={16} aria-hidden="true" /> บันทึกคำสำคัญ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
