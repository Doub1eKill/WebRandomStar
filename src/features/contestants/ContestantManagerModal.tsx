import React, { useState } from 'react';
import { RotateCcw, Trash2, UserPlus, Users, X } from 'lucide-react';
import { Contestant } from '@/types/question.ts';
import { DEFAULT_CONTESTANTS } from '@/data/defaultContestants.ts';

interface ContestantManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  contestants: Contestant[];
  onSaveContestants: (updated: Contestant[]) => void;
}

export const ContestantManagerModal: React.FC<ContestantManagerModalProps> = ({
  isOpen,
  onClose,
  contestants,
  onSaveContestants
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [num, setNum] = useState<number>(contestants.length + 1);
  const [name, setName] = useState('');
  const [faculty, setFaculty] = useState('');
  const [title, setTitle] = useState<'ดาว' | 'เดือน' | 'ดาวจำแลง' | 'ทั่วไป'>('ดาว');

  if (!isOpen) return null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !faculty.trim()) return;

    const newC: Contestant = {
      id: `C_${Date.now().toString().slice(-4)}`,
      number: num,
      name: name.trim(),
      faculty: faculty.trim(),
      title
    };

    onSaveContestants([...contestants, newC].sort((a, b) => Number(a.number) - Number(b.number)));
    setName('');
    setFaculty('');
    setNum(contestants.length + 2);
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('คุณต้องการลบผู้เข้าแข่งขันท่านนี้ใช่หรือไม่?')) {
      onSaveContestants(contestants.filter(c => c.id !== id));
    }
  };

  const handleResetDefaults = () => {
    if (confirm('ต้องการคืนค่ารายชื่อผู้เข้าแข่งขันเป็นชุดเริ่มต้นใช่หรือไม่?')) {
      onSaveContestants(DEFAULT_CONTESTANTS);
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
              <p className="modal-sub">มีทั้งหมด {contestants.length} คน</p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose} aria-label="ปิด"><X size={18} aria-hidden="true" /></button>
        </div>

        <div className="modal-toolbar">
          <button className="btn-primary btn-sm" onClick={() => setIsAdding(!isAdding)}>
            {isAdding ? 'ยกเลิก' : <><UserPlus size={14} aria-hidden="true" /> เพิ่มผู้เข้าแข่งขัน</>}
          </button>
          <button className="btn-secondary btn-sm btn-danger-soft" onClick={handleResetDefaults}>
            <RotateCcw size={14} aria-hidden="true" /> คืนค่าเริ่มต้น 10 ท่าน
          </button>
        </div>

        {isAdding && (
          <form className="add-question-form glass-panel" onSubmit={handleAddSubmit}>
            <h3>เพิ่มผู้เข้าแข่งขันใหม่</h3>
            <div className="form-row">
              <div style={{ width: '80px' }}>
                <label>หมายเลข:</label>
                <input
                  type="number"
                  className="custom-input"
                  value={num}
                  onChange={(e) => setNum(parseInt(e.target.value, 10) || 1)}
                  required
                />
              </div>

              <div style={{ width: '110px' }}>
                <label>ตำแหน่ง:</label>
                <select
                  className="custom-select"
                  value={title}
                  onChange={(e) => setTitle(e.target.value as 'ดาว' | 'เดือน' | 'ดาวจำแลง' | 'ทั่วไป')}
                >
                  <option value="ดาว">ดาว</option>
                  <option value="เดือน">เดือน</option>
                  <option value="ดาวจำแลง">ดาวจำแลง</option>
                  <option value="ทั่วไป">ทั่วไป</option>
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label>ชื่อ-นามสกุล:</label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="เช่น นายกิตติกร อนันตโชติ"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label>คณะ/สังกัด:</label>
              <input
                type="text"
                className="custom-input"
                placeholder="เช่น คณะวิศวกรรมศาสตร์"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary btn-sm">บันทึก</button>
              <button type="button" className="btn-secondary btn-sm" onClick={() => setIsAdding(false)}>ยกเลิก</button>
            </div>
          </form>
        )}

        <div className="contestants-list-wrap">
          {contestants.map(c => (
            <div key={c.id} className="contestant-list-item glass-panel">
              <span className="item-num">#{c.number}</span>
              <span className="item-title-tag">{c.title}</span>
              <div className="item-details">
                <div className="item-name">{c.name}</div>
                <div className="item-faculty">{c.faculty}</div>
              </div>
              <button className="btn-table-delete" onClick={() => handleDelete(c.id)} aria-label={`ลบ ${c.name}`} title="ลบ"><Trash2 size={16} aria-hidden="true" /></button>
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
