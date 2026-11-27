import React, { useState } from 'react';
import { Pencil, RotateCcw, Trash2, UserPlus, Users, X } from 'lucide-react';
import { Contestant } from '@/types/question.ts';
import { DEFAULT_CONTESTANTS } from '@/data/defaultContestants.ts';
import { ContestantAvatar } from './ContestantAvatar.tsx';
import {
  ContestantFields,
  addContestant,
  editContestant,
  fieldsOf,
  nextNumber,
  numberTakenBy
} from './contestantEdits.ts';

interface ContestantManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  contestants: Contestant[];
  onSaveContestants: (updated: Contestant[]) => void;
  /** Open straight into editing this contestant (from a card's edit button). */
  initialEditId?: string;
}

const TITLE_OPTIONS = ['ดาว', 'เดือน', 'ดาวจำแลง', 'ทั่วไป'];

export const ContestantManagerModal: React.FC<ContestantManagerModalProps> = props => {
  if (!props.isOpen) return null;
  // Remount on every open so the form starts from the contestant asked for.
  return <ManagerBody key={props.initialEditId ?? 'list'} {...props} />;
};

/** null = form closed, 'new' = adding, otherwise the id being edited. */
type FormTarget = null | 'new' | string;

const ManagerBody: React.FC<ContestantManagerModalProps> = ({ onClose, contestants, onSaveContestants, initialEditId }) => {
  const startTarget: FormTarget = initialEditId && contestants.some(c => c.id === initialEditId) ? initialEditId : null;
  const [target, setTarget] = useState<FormTarget>(startTarget);
  const [form, setForm] = useState<ContestantFields>(() => {
    const c = startTarget ? contestants.find(x => x.id === startTarget) : undefined;
    return c ? fieldsOf(c) : { number: nextNumber(contestants), name: '', nickname: '', faculty: '', title: '' };
  });

  const editing = target && target !== 'new' ? contestants.find(c => c.id === target) : undefined;
  const clash = target ? numberTakenBy(contestants, form.number, editing?.id) : undefined;
  const set = (patch: Partial<ContestantFields>) => setForm(f => ({ ...f, ...patch }));

  const openAdd = () => {
    setForm({ number: nextNumber(contestants), name: '', nickname: '', faculty: '', title: '' });
    setTarget('new');
  };

  const openEdit = (c: Contestant) => {
    setForm(fieldsOf(c));
    setTarget(c.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editing) {
      onSaveContestants(editContestant(contestants, editing.id, form));
    } else {
      onSaveContestants(addContestant(contestants, form, `C_${Date.now().toString(36)}`));
    }
    setTarget(null);
  };

  const handleDelete = (c: Contestant) => {
    if (confirm(`คุณต้องการลบ ${c.nickname || c.name} ใช่หรือไม่?`)) {
      onSaveContestants(contestants.filter(x => x.id !== c.id));
      if (target === c.id) setTarget(null);
    }
  };

  const handleResetDefaults = () => {
    if (confirm(`ต้องการคืนค่ารายชื่อผู้เข้าแข่งขันเป็นชุดเริ่มต้น ${DEFAULT_CONTESTANTS.length} ท่านใช่หรือไม่? การแก้ไขที่ทำไว้จะหายไป`)) {
      onSaveContestants(DEFAULT_CONTESTANTS);
      setTarget(null);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container modal-sm glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon" aria-hidden="true"><Users size={22} aria-hidden="true" /></span>
            <div>
              <h2 className="modal-title">จัดการผู้เข้าแข่งขัน (Contestants)</h2>
              <p className="modal-sub">มีทั้งหมด {contestants.length} คน · กดดินสอเพื่อแก้หมายเลข ชื่อ หรือชื่อเล่นได้ระหว่างงาน</p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose} aria-label="ปิด"><X size={18} aria-hidden="true" /></button>
        </div>

        <div className="modal-toolbar">
          <button className="btn-primary btn-sm" onClick={() => (target === 'new' ? setTarget(null) : openAdd())}>
            {target === 'new' ? 'ยกเลิก' : <><UserPlus size={14} aria-hidden="true" /> เพิ่มผู้เข้าแข่งขัน</>}
          </button>
          <button className="btn-secondary btn-sm btn-danger-soft" onClick={handleResetDefaults}>
            <RotateCcw size={14} aria-hidden="true" /> คืนค่าเริ่มต้น {DEFAULT_CONTESTANTS.length} ท่าน
          </button>
        </div>

        {target && (
          <form className="add-question-form glass-panel contestant-form" onSubmit={handleSubmit}>
            <div className="contestant-form-head">
              {editing && <ContestantAvatar contestant={editing} className="ctl-avatar--list" />}
              <h3>{editing ? `แก้ไขข้อมูล ${editing.nickname || editing.name}` : 'เพิ่มผู้เข้าแข่งขันใหม่'}</h3>
            </div>
            <div className="form-row">
              <div style={{ flex: '0 0 90px' }}>
                <label htmlFor="cm-number">หมายเลข:</label>
                <input
                  id="cm-number"
                  type="number"
                  min={0}
                  className="custom-input"
                  value={form.number}
                  onChange={(e) => set({ number: parseInt(e.target.value, 10) || 0 })}
                  required
                />
              </div>
              <div style={{ flex: '0 0 140px' }}>
                <label htmlFor="cm-nickname">ชื่อเล่น:</label>
                <input
                  id="cm-nickname"
                  type="text"
                  className="custom-input"
                  placeholder="เช่น เอ"
                  value={form.nickname}
                  onChange={(e) => set({ nickname: e.target.value })}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label htmlFor="cm-name">ชื่อ-นามสกุล:</label>
                <input
                  id="cm-name"
                  type="text"
                  className="custom-input"
                  placeholder="เช่น สมชาย ใจดี"
                  value={form.name}
                  onChange={(e) => set({ name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div style={{ flex: '0 0 140px' }}>
                <label htmlFor="cm-title">ตำแหน่ง:</label>
                <select
                  id="cm-title"
                  className="custom-select"
                  value={form.title}
                  onChange={(e) => set({ title: e.target.value })}
                >
                  <option value="">ไม่ระบุ</option>
                  {TITLE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  {form.title && !TITLE_OPTIONS.includes(form.title) && <option value={form.title}>{form.title}</option>}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label htmlFor="cm-faculty">คณะ/สังกัด:</label>
                <input
                  id="cm-faculty"
                  type="text"
                  className="custom-input"
                  placeholder="เช่น คณะวิทยาศาสตร์"
                  value={form.faculty}
                  onChange={(e) => set({ faculty: e.target.value })}
                />
              </div>
            </div>

            {clash && (
              <p className="contestant-form-warning" role="status">
                หมายเลข {form.number} ซ้ำกับ {clash.nickname || clash.name} บันทึกได้ แต่ควรแก้ให้ไม่ซ้ำ
              </p>
            )}

            <div className="form-actions">
              <button type="submit" className="btn-primary btn-sm">{editing ? 'บันทึกการแก้ไข' : 'บันทึก'}</button>
              <button type="button" className="btn-secondary btn-sm" onClick={() => setTarget(null)}>ยกเลิก</button>
            </div>
          </form>
        )}

        <div className="contestants-list-wrap">
          {contestants.map(c => (
            <div key={c.id} className={`contestant-list-item glass-panel${target === c.id ? ' is-editing' : ''}`}>
              <span className="item-num">#{c.number}</span>
              <ContestantAvatar contestant={c} className="ctl-avatar--list" />
              {c.title && <span className="item-title-tag">{c.title}</span>}
              <div className="item-details">
                <div className="item-name">{c.nickname?.trim() ? `${c.nickname.trim()} · ${c.name}` : c.name}</div>
                {c.faculty && <div className="item-faculty">{c.faculty}</div>}
              </div>
              <button className="btn-table-edit" onClick={() => openEdit(c)} aria-label={`แก้ไข ${c.nickname || c.name}`} title="แก้ไข"><Pencil size={15} aria-hidden="true" /></button>
              <button className="btn-table-delete" onClick={() => handleDelete(c)} aria-label={`ลบ ${c.nickname || c.name}`} title="ลบ"><Trash2 size={16} aria-hidden="true" /></button>
            </div>
          ))}
        </div>

        <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
          <button className="btn-primary btn-sm" onClick={onClose}>
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
