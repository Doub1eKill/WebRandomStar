/** QuestionBankDashboard: props, state and handlers (Phase 6 split; body moved unchanged from QuestionBankDashboard.tsx). */
import React, { useState, useMemo, useRef } from 'react';
import { Question, QuestionDifficulty } from '@/types/question.ts';
import { exportQuestionsAsJSON } from '@/features/questions/importQuestions.ts';
import { useQuestionImport } from '@/features/questions/QuestionImportDialog.tsx';

export interface QuestionBankDashboardProps {
  questions: Question[];
  usedQuestionIds: string[];
  onSaveQuestions: (updated: Question[]) => void;
  /** Clears the session's used-question list so every question can be drawn again. */
  onResetUsedQuestions?: () => void;
}

export function useQuestionBankDashboardModel(props: QuestionBankDashboardProps) {
  const {
  questions,
  usedQuestionIds,
  onSaveQuestions,
  onResetUsedQuestions
  } = props;
  const [search, setSearch] = useState('');
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
    return { total, enabled, disabled, used, remaining };
  }, [questions, usedQuestionIds]);

  // Unique Rounds

  const roundsList = useMemo(() => {
    return Array.from(new Set(questions.map(q => q.round)));
  }, [questions]);

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const isUsed = usedQuestionIds.includes(q.id) || q.used;

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
  }, [questions, usedQuestionIds, selectedRound, selectedDifficulty, selectedStatus, search]);

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
    if (!editingQuestion?.text || !editingQuestion.id) {
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

  // After a rehearsal: every question can be drawn again. History is kept.
  const handleResetUsed = () => {
    if (stats.used === 0) return;
    if (!window.confirm(`คืนสถานะคำถามที่ใช้แล้ว ${stats.used} ข้อ ให้กลับมาสุ่มได้อีกครั้งหรือไม่?
(ประวัติการตอบยังอยู่ครบ)`)) return;
    if (questions.some(q => q.used)) onSaveQuestions(questions.map(q => (q.used ? { ...q, used: false } : q)));
    onResetUsedQuestions?.();
    showNotification('success', `รีเซ็ตแล้ว คำถาม ${stats.used} ข้อกลับมาสุ่มได้อีกครั้ง`);
  };

  // S1: validate, preview, then merge (default) or replace with a backup.
  const questionImport = useQuestionImport(questions, onSaveQuestions);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) questionImport.openFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return { questions, usedQuestionIds, onSaveQuestions, search, setSearch, selectedRound, setSelectedRound, selectedDifficulty, setSelectedDifficulty, selectedStatus, setSelectedStatus, previewQuestion, setPreviewQuestion, editingQuestion, setEditingQuestion, isAdding, setIsAdding, notification, setNotification, fileInputRef, stats, roundsList, filteredQuestions, showNotification, handleToggleEnable, handleDelete, handleDuplicate, handleSaveEdit, handleExport, handleResetUsed, questionImport, handleImport };
}

export type QuestionBankDashboardModel = ReturnType<typeof useQuestionBankDashboardModel>;
