/**
 * Remote "Contestants" page (Phase 5): the former ControlCenter "contestants" tab, unchanged markup.
 */
import React, { useState } from 'react';
import { useSession, useSessionActions } from '@/features/session/SessionProvider.tsx';
import { useContestants } from '@/storage/useRepository.ts';
import { saveContestants } from '@/storage/storageApi.ts';
import { ContestantManagerModal } from '@/features/contestants/ContestantManagerModal.tsx';

export const ContestantsPage: React.FC = () => {
  const selectedContestantId = useSession(s => s.selectedContestantId);
  const actions = useSessionActions();
  const contestants = useContestants();
  const [isContestantModalOpen, setIsContestantModalOpen] = useState(false);

  return (
    <>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ fontSize: '1rem', fontWeight: 600 }}>รายชื่อผู้เข้าแข่งขันทั้งหมด ({contestants.length} คน)</div>
          <button
            className="btn-primary"
            onClick={() => setIsContestantModalOpen(true)}
          >
            + จัดการ / เพิ่มรายชื่อผู้เข้าแข่งขัน
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {contestants.map(c => (
            <div
              key={c.id}
              style={{
                background: 'rgba(30, 41, 59, 0.4)',
                border: c.id === selectedContestantId ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem'
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700
                }}
              >
                {c.number}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{c.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{c.faculty}</div>
              </div>
              <button
                onClick={() => actions.setContestant(c.id)}
                style={{
                  padding: '0.35rem 0.65rem',
                  background: c.id === selectedContestantId ? '#4f46e5' : 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                {c.id === selectedContestantId ? 'กำลังขึ้นเวที' : 'เลือกขึ้นเวที'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <ContestantManagerModal
        isOpen={isContestantModalOpen}
        contestants={contestants}
        onClose={() => setIsContestantModalOpen(false)}
        onSaveContestants={saveContestants}
      />
    </>
  );
};

export default ContestantsPage;
