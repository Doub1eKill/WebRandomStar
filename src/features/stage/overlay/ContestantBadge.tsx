import React from 'react';
import { Contestant } from '@/types/question.ts';

interface ContestantBadgeProps {
  contestant?: Contestant;
}

export const ContestantBadge: React.FC<ContestantBadgeProps> = ({ contestant }) => {
  if (!contestant) return null;

  return (
    <div className="contestant-badge glass-panel glass-panel-interactive contestant-badge-cinematic">
      {/* Light Reflection Shimmer Sweep */}
      <div className="badge-shimmer-sweep-layer" />
      <div className="badge-corner-glow" />

      <div className="contestant-number-badge">
        <div className="num-badge-shine" />
        <span className="num-prefix">หมายเลข</span>
        <span className="num-val">{String(contestant.number).padStart(2, '0')}</span>
      </div>

      <div className="contestant-info">
        <div className="contestant-title-tag">
          <span className="title-star-icon">✦</span>
          <span>{contestant.title}</span>
        </div>
        <div className="contestant-name">{contestant.name}</div>
        <div className="contestant-faculty">
          <span className="faculty-bullet">✦</span>
          <span>{contestant.faculty}</span>
        </div>
      </div>
    </div>
  );
};
