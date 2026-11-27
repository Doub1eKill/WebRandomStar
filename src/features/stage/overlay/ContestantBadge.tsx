import React from 'react';
import { Contestant } from '@/types/question.ts';
import { contestantPhotoUrl } from '@/data/contestantPhotos.ts';

interface ContestantBadgeProps {
  contestant?: Contestant;
}

export const ContestantBadge: React.FC<ContestantBadgeProps> = ({ contestant }) => {
  if (!contestant) return null;

  const number = String(contestant.number).padStart(2, '0');
  const photo = contestantPhotoUrl(contestant);
  const nickname = contestant.nickname?.trim();

  return (
    <div className={`contestant-badge glass-panel glass-panel-interactive contestant-badge-cinematic${photo ? ' has-photo' : ''}`}>
      {/* Light Reflection Shimmer Sweep */}
      <div className="badge-shimmer-sweep-layer" />
      <div className="badge-corner-glow" />

      {photo ? (
        <div className="contestant-photo-frame">
          <img className="contestant-photo" src={photo} alt={nickname || contestant.name} draggable={false} />
          <span className="contestant-photo-number" aria-label={`หมายเลข ${number}`}>{number}</span>
        </div>
      ) : (
        <div className="contestant-number-badge">
          <div className="num-badge-shine" />
          <span className="num-prefix">หมายเลข</span>
          <span className="num-val">{number}</span>
        </div>
      )}

      <div className="contestant-info">
        {contestant.title && (
          <div className="contestant-title-tag">
            <span className="title-star-icon">✦</span>
            <span>{contestant.title}</span>
          </div>
        )}
        {nickname ? (
          <>
            <div className="contestant-nickname">{nickname}</div>
            <div className="contestant-fullname">{contestant.name}</div>
          </>
        ) : (
          <div className="contestant-name">{contestant.name}</div>
        )}
        {contestant.faculty && (
          <div className="contestant-faculty">
            <span className="faculty-bullet">✦</span>
            <span>{contestant.faculty}</span>
          </div>
        )}
      </div>
    </div>
  );
};
