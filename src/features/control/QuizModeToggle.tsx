import React from 'react';
import { BookOpen, Tag } from 'lucide-react';
import type { ControlVariant } from './ControlCard.tsx';
import './quizModeToggle.css';

type QuizMode = 'question' | 'keyword';

const LABELS: Record<ControlVariant, Record<QuizMode, string>> = {
  drawer: { question: 'คลังคำถาม (Question)', keyword: 'คำสำคัญ (Keyword)' },
  live: { question: 'คลังคำถาม', keyword: 'คำสำคัญ' }
};

// Test ids predate the shared component; keep them stable.
const TEST_ID_PREFIX: Record<ControlVariant, string> = { drawer: 'drawer', live: 'controlcenter' };

/** Question-bank / keyword switch shown in both the stage drawer and the Live page. */
export const QuizModeToggle: React.FC<{
  variant: ControlVariant;
  quizMode: string | undefined;
  onChange: (mode: QuizMode) => void;
}> = ({ variant, quizMode, onChange }) => {
  const current: QuizMode = quizMode === 'keyword' ? 'keyword' : 'question';
  const button = (mode: QuizMode, icon: React.ReactNode) => (
    <button
      type="button"
      data-testid={`${TEST_ID_PREFIX[variant]}-mode-${mode}`}
      className={
        (variant === 'drawer' ? 'btn-secondary ' : '') +
        `quiz-mode-btn quiz-mode-btn--${variant}` +
        (current === mode ? ` is-on tone-${mode}` : '')
      }
      onClick={() => onChange(mode)}
    >
      {icon}
      <span>{LABELS[variant][mode]}</span>
    </button>
  );
  return (
    <div className={`quiz-mode-toggle quiz-mode-toggle--${variant}`}>
      {button('question', <BookOpen size={16} aria-hidden="true" />)}
      {button('keyword', <Tag size={16} aria-hidden="true" />)}
    </div>
  );
};
