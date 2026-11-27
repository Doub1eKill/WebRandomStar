import React from 'react';
import { Contestant } from '@/types/question.ts';
import { contestantPhotoUrl } from '@/data/contestantPhotos.ts';

/**
 * A contestant's photo for the control pages, or their number when there is no photo
 * (for example a build without the Photo/ folder).
 */
export const ContestantAvatar: React.FC<{ contestant: Contestant; className?: string }> = ({ contestant, className = '' }) => {
  const photo = contestantPhotoUrl(contestant);
  const label = contestant.nickname?.trim() || contestant.name;
  return (
    <div className={`ctl-avatar ${photo ? 'has-photo' : 'no-photo'} ${className}`.trim()}>
      {photo
        ? <img src={photo} alt={label} loading="lazy" draggable={false} />
        : <span aria-hidden="true">{contestant.number}</span>}
    </div>
  );
};
