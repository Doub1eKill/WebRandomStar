import React from 'react';
import { StagePhaseTarget } from '@/types/music.ts';
import {
  Link as LinkIcon,
} from 'lucide-react';

import type { MusicPanelModel } from '../useMusicPanelModel.tsx';

export const AddUrlModal: React.FC<{ m: MusicPanelModel }> = ({ m }) => {
  const { isUrlModalOpen, setIsUrlModalOpen, urlTitle, setUrlTitle, urlAddress, setUrlAddress, urlPhase, setUrlPhase, handleAddUrlTrack } = m;
  return (
    <>
      {/* 5. Add URL Modal */}
      {isUrlModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem'
          }}
        >
          <form
            onSubmit={handleAddUrlTrack}
            style={{
              background: '#0f172a',
              border: '1px solid rgba(124, 58, 237, 0.3)',
              borderRadius: '16px',
              padding: '1.5rem',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)'
            }}
          >
            <h3 style={{ margin: '0 0 1rem 0', color: '#f8fafc', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <LinkIcon size={18} color="#a78bfa" /> เพิ่มเพลงจากลิงก์ URL
            </h3>

            <div style={{ marginBottom: '0.85rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                ชื่อเพลง (Title) *
              </label>
              <input
                type="text"
                required
                placeholder="เช่น Majestic Pageant Theme"
                value={urlTitle}
                onChange={e => setUrlTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '0.85rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                ลิงก์ไฟล์เสียง (Audio URL - .mp3 / .wav / stream) *
              </label>
              <input
                type="url"
                required
                placeholder="https://example.com/audio/theme.mp3"
                value={urlAddress}
                onChange={e => setUrlAddress(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                ผูกกับช่วงเวที (Optional)
              </label>
              <select
                value={urlPhase}
                onChange={e => setUrlPhase(e.target.value as StagePhaseTarget)}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  background: '#1e293b',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '0.9rem',
                  colorScheme: 'dark'
                }}
              >
                <option value="none">-- ไม่ผูกช่วงเวที (เปิดเล่นเอง) --</option>
                <option value="ambient">🏠 ช่วงพักเวที (Idle / Ambient)</option>
                <option value="spin">⚡ ช่วงหมุนคำสุ่ม (Word Spin)</option>
                <option value="question">💡 ช่วงคิดคำตอบ (Question / Timer)</option>
                <option value="answered">🎉 ช่วงตอบเสร็จสิ้น (Celebration)</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
              <button
                type="button"
                onClick={() => setIsUrlModalOpen(false)}
                style={{
                  padding: '0.55rem 1rem',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#cbd5e1',
                  cursor: 'pointer'
                }}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                style={{
                  padding: '0.55rem 1.25rem',
                  background: 'linear-gradient(135deg, var(--ctl-accent-strong), var(--ctl-accent))',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                บันทึกเพลง
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
