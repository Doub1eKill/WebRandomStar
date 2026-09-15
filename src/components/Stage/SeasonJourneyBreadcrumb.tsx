import React from 'react';
import { AppState } from '../../types/session.ts';

interface SeasonJourneyBreadcrumbProps {
  currentState: AppState;
}

interface StepItem {
  state: AppState;
  icon: string;
  name: string;
}

const MILESTONES: StepItem[] = [
  { state: 'rain', icon: '🌧️', name: 'ฝนสุดท้าย' },
  { state: 'water-drop', icon: '💧', name: 'หยดน้ำ' },
  { state: 'mist', icon: '🌫️', name: 'สายหมอก' },
  { state: 'wind', icon: '🍃', name: 'ลมหนาว' },
  { state: 'leaf', icon: '🍂', name: 'ใบไม้ร่วง' },
  { state: 'sky-clear', icon: '🌤️', name: 'ฟ้าเปิด' },
  { state: 'question-reveal', icon: '✨', name: 'เปิดคำถาม' }
];

export const SeasonJourneyBreadcrumb: React.FC<SeasonJourneyBreadcrumbProps> = ({ currentState }) => {
  // Hide during idle, question, and answered
  if (currentState === 'idle' || currentState === 'question' || currentState === 'answered') {
    return null;
  }

  const currentIndex = MILESTONES.findIndex(m => m.state === currentState);

  return (
    <div className="season-breadcrumb-container">
      <div className="season-breadcrumb-bar glass-panel">
        {MILESTONES.map((step, idx) => {
          const isActive = step.state === currentState;
          const isPassed = idx < currentIndex;

          return (
            <React.Fragment key={step.state}>
              <div className={`breadcrumb-step ${isActive ? 'active' : ''} ${isPassed ? 'passed' : ''}`}>
                <span className="step-icon">{step.icon}</span>
                <span className="step-name">{step.name}</span>
                {isActive && <span className="step-active-dot" />}
              </div>
              {idx < MILESTONES.length - 1 && (
                <div className={`step-connector ${isPassed ? 'passed' : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
