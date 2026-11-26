import React from 'react';
import { AppState } from '@/types/session.ts';

interface StageHeaderProps {
  round?: string;
  currentState?: AppState;
}

export const StageHeader: React.FC<StageHeaderProps> = () => {
  return (
    <header className="stage-header stage-header-left-clean">
      <div className="header-titles">
        <div className="event-pre-title">✦ SCI TECH THE ✦</div>
        <h1 className="event-title royal-serif">CHARM OF TRANSITION</h1>
        <div className="event-post-title">
          <span className="post-ambassador">✦ AMBASSADOR 2026 ✦</span>
          <span className="post-divider">•</span>
          <span className="event-subtitle">เสน่ห์แห่งการเปลี่ยนผ่าน สู่ดาวนำทางแห่งอนาคต</span>
        </div>
      </div>
    </header>
  );
};
