/**
 * Remote "Contestants" page (Phase 5): a card per contestant with their photo and nickname.
 */
import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useSession, useSessionActions } from '@/features/session/SessionProvider.tsx';
import { useContestants } from '@/storage/useRepository.ts';
import { contestantsRepository } from '@/storage/repositories.ts';
import { ContestantManagerModal } from '@/features/contestants/ContestantManagerModal.tsx';
import { ContestantAvatar } from '@/features/contestants/ContestantAvatar.tsx';

export const ContestantsPage: React.FC = () => {
  const selectedContestantId = useSession(s => s.selectedContestantId);
  const actions = useSessionActions();
  const contestants = useContestants();
  const [isContestantModalOpen, setIsContestantModalOpen] = useState(false);

  return (
    <>
      <div>
        <div className="ctl-page-head">
          <h2 className="ctl-page-title">รายชื่อผู้เข้าแข่งขันทั้งหมด ({contestants.length} คน)</h2>
          <button className="btn-primary-glow" onClick={() => setIsContestantModalOpen(true)}>
            <UserPlus size={16} aria-hidden="true" /> จัดการ / เพิ่มรายชื่อผู้เข้าแข่งขัน
          </button>
        </div>
        <div className="ctl-contestant-grid">
          {contestants.map(c => {
            const isOnStage = c.id === selectedContestantId;
            const nickname = c.nickname?.trim();
            return (
              <div key={c.id} className={isOnStage ? 'ctl-contestant is-on-stage' : 'ctl-contestant'}>
                <div className="ctl-contestant-photo">
                  <ContestantAvatar contestant={c} />
                  <div className="ctl-contestant-number">{c.number}</div>
                </div>
                <div className="ctl-contestant-body">
                  {nickname && <div className="ctl-contestant-nickname">{nickname}</div>}
                  <div className="ctl-contestant-name">{c.name}</div>
                  {c.faculty && <div className="ctl-contestant-faculty">{c.faculty}</div>}
                </div>
                <button className="ctl-contestant-pick" aria-pressed={isOnStage} onClick={() => actions.setContestant(c.id)}>
                  {isOnStage ? 'กำลังขึ้นเวที' : 'เลือกขึ้นเวที'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <ContestantManagerModal
        isOpen={isContestantModalOpen}
        contestants={contestants}
        onClose={() => setIsContestantModalOpen(false)}
        onSaveContestants={contestantsRepository.save}
      />
    </>
  );
};

export default ContestantsPage;
