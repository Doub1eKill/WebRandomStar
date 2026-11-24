import React, { useState } from 'react';
import { Question } from '@/types/question.ts';
import { notifyOperator } from '@/shared/notices/operatorNotices.ts';
import {
  MAX_IMPORT_BYTES,
  ImportPlan,
  parseImportedQuestions,
  planImport,
  mergeQuestions,
  backupQuestions
} from './importQuestions.ts';

interface DialogProps {
  plan: ImportPlan;
  existingCount: number;
  onMerge: () => void;
  onReplace: () => void;
  onCancel: () => void;
}

/** S1: preview before anything is written; merging is the default, replacing keeps a backup. */
export const QuestionImportDialog: React.FC<DialogProps> = ({ plan, existingCount, onMerge, onReplace, onCancel }) => (
  <div className="modal-backdrop" onClick={onCancel}>
    <div className="modal-container modal-sm glass-panel" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <div className="modal-title-wrap">
          <h2 className="modal-title">ตรวจสอบก่อนนำเข้าคำถาม</h2>
        </div>
      </div>
      <div className="question-import-summary">
        <p>ไฟล์นี้มีคำถาม <strong>{plan.incoming.length}</strong> ข้อ (ตรวจรูปแบบผ่านทั้งหมดแล้ว)</p>
        <ul>
          <li>คำถามใหม่ที่ยังไม่มีในคลัง: <strong>{plan.newCount}</strong> ข้อ</li>
          <li>คำถามที่ id ซ้ำกับของเดิม (จะถูกแทนที่ด้วยข้อมูลจากไฟล์): <strong>{plan.updateCount}</strong> ข้อ</li>
          <li>คลังปัจจุบันมี: <strong>{existingCount}</strong> ข้อ</li>
        </ul>
        <p className="question-import-note">
          "แทนที่ทั้งหมด" จะลบคำถามที่ไม่อยู่ในไฟล์ออกจากคลัง ระบบจะสำรองคลังเดิมไว้ก่อน
        </p>
      </div>
      <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '0.5rem' }}>
        <button type="button" className="btn-secondary" onClick={onCancel}>ยกเลิก</button>
        <button type="button" className="btn-danger-soft" onClick={onReplace}>แทนที่ทั้งหมด</button>
        <button type="button" className="btn-primary" onClick={onMerge} autoFocus>รวมกับคลังเดิม (แนะนำ)</button>
      </div>
    </div>
  </div>
);

/**
 * Shared import flow for the question bank (dashboard and manager modal).
 * Returns a file handler and the dialog element to render.
 */
export function useQuestionImport(questions: Question[], onSave: (updated: Question[]) => void) {
  const [plan, setPlan] = useState<ImportPlan | null>(null);

  const openFile = (file: File) => {
    if (file.size > MAX_IMPORT_BYTES) {
      notifyOperator('error', `ไฟล์ใหญ่เกิน ${MAX_IMPORT_BYTES / 1024 / 1024} MB จึงไม่นำเข้า`);
      return;
    }
    const reader = new FileReader();
    reader.onload = event => {
      const result = parseImportedQuestions(String(event.target?.result ?? ''));
      if (result.success && result.data) {
        setPlan(planImport(questions, result.data));
      } else {
        notifyOperator('error', `การนำเข้าล้มเหลว: ${result.error || 'ไฟล์ไม่ถูกต้อง'}`);
      }
    };
    reader.readAsText(file);
  };

  const close = () => setPlan(null);

  const dialog = plan ? (
    <QuestionImportDialog
      plan={plan}
      existingCount={questions.length}
      onCancel={close}
      onMerge={() => {
        onSave(mergeQuestions(questions, plan.incoming));
        notifyOperator('info', `รวมคำถามเข้าคลังแล้ว: ใหม่ ${plan.newCount} ข้อ, อัปเดต ${plan.updateCount} ข้อ`);
        close();
      }}
      onReplace={() => {
        if (!backupQuestions(questions)) {
          notifyOperator('error', 'สำรองคลังเดิมไม่สำเร็จ จึงยกเลิกการแทนที่ (พื้นที่เก็บข้อมูลอาจเต็ม)');
          return;
        }
        onSave(plan.incoming);
        notifyOperator('info', `แทนที่คลังคำถามแล้ว (${plan.incoming.length} ข้อ) และสำรองคลังเดิม ${questions.length} ข้อไว้แล้ว`);
        close();
      }}
    />
  ) : null;

  return { openFile, dialog };
}
