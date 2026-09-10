import React from 'react';
import { SessionState } from '../../types/session.ts';
import { Contestant } from '../../types/question.ts';
import { StageHeader } from './StageHeader.tsx';
import { ContestantBadge } from './ContestantBadge.tsx';
import { QuestionCard } from './QuestionCard.tsx';
import { SeasonJourneyBreadcrumb } from './SeasonJourneyBreadcrumb.tsx';
import { CategoryAnnouncementBanner } from './CategoryAnnouncementBanner.tsx';
import { CinematicNarrator } from './CinematicNarrator.tsx';

interface StageOverlayProps {
  session: SessionState;
  contestant?: Contestant;
  onStart: () => void;
  onNext: () => void;
  onOpenControlDrawer: () => void;
}

export const StageOverlay: React.FC<StageOverlayProps> = ({
  session,
  contestant,
  onStart,
  onNext,
  onOpenControlDrawer
}) => {
  const isIdle = session.currentState === 'idle';
  const showQuestion = session.currentState === 'question' || session.currentState === 'answered';

  return (
    <div className="stage-overlay">
      {/* Header Bar */}
      <StageHeader round={session.selectedRound} currentState={session.currentState} />

      {/* Season Journey Progress Breadcrumb */}
      <SeasonJourneyBreadcrumb currentState={session.currentState} />

      {/* Main Content Area */}
      <div className="stage-main-content">
        {/* Contestant Badge */}
        <div className="stage-contestant-anchor">
          <ContestantBadge contestant={contestant} />
        </div>

        {/* Category Announcement Banner */}
        <CategoryAnnouncementBanner
          category={session.selectedCategory}
          currentState={session.currentState}
        />

        {/* Start Button when idle */}
        {isIdle && (
          <div className="stage-idle-hero animate-float">
            <div className="idle-nature-quote">
              “เมื่อสายฝนเริ่มซา... ปลายฤดูกำลังนำพาคำถามมาสู่เธอ”
            </div>

            <button className="btn-primary btn-start-journey" onClick={onStart}>
              <span className="btn-sparkle">✨</span>
              <span>เริ่มการเปลี่ยนผ่านสู่คำถาม</span>
              <span className="btn-key-hint">[Space]</span>
            </button>
          </div>
        )}

        {/* Question Reveal Card */}
        {showQuestion && (
          <QuestionCard
            question={session.selectedQuestion}
            isAnswered={session.currentState === 'answered'}
            onNext={onNext}
          />
        )}
      </div>

      {/* Cinematic Story Narrator */}
      <CinematicNarrator currentState={session.currentState} />

      {/* Footer / Discreet Operator Hint */}
      <footer className="stage-footer">
        <div className="footer-keys-hint">
          <span>กด <code>Space</code> เริ่ม/หยุด</span>
          <span className="dot-sep">•</span>
          <span>กด <code>Enter</code> ดำเนินการต่อ</span>
          <span className="dot-sep">•</span>
          <span>กด <code>Esc</code> แผงควบคุม</span>
        </div>

        <button
          className="btn-drawer-trigger"
          onClick={onOpenControlDrawer}
          title="เปิดแผงควบคุม (Esc)"
        >
          ⚙️ แผงควบคุม
        </button>
      </footer>
    </div>
  );
};
