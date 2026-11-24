import React from 'react';
import {
  Sparkles,
} from 'lucide-react';

import type { MusicPanelModel } from '../useMusicPanelModel.tsx';

export const PhaseAssignmentSection: React.FC<{ m: MusicPanelModel }> = ({ m }) => {
  const { musicState, tracks, onAssignPhaseTrack } = m;
  return (
    <>
      {/* 3. Stage Phase Music Assignment Grid */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '1.25rem'
        }}
      >
        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Sparkles size={16} color="#fde047" /> กำหนดเพลงประจำช่วงเวที (Stage Phase Soundtracks)
        </div>
        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1rem' }}>
          เมื่อเปิดใช้งาน Auto-Sync ระบบจะสลับมาเล่นเพลงที่ผูกไว้กับแต่ละช่วงอัตโนมัติ
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
          {/* Phase 1: Ambient / Idle */}
          <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.4rem' }}>
              🏠 1. ช่วงพักเวที (Idle / Ambient)
            </div>
            <select
              value={musicState.phaseTrackMapping.ambient || ''}
              onChange={e => onAssignPhaseTrack('ambient', e.target.value || null)}
              style={{
                width: '100%',
                padding: '0.55rem',
                background: '#0f172a',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '0.85rem',
                marginBottom: '0.5rem',
                colorScheme: 'dark'
              }}
            >
              <option value="" style={{ background: '#0f172a', color: '#f8fafc' }}>-- ไม่เปิดเพลง (ปิดเสียง) --</option>
              {tracks.map(t => (
                <option key={t.id} value={t.id} style={{ background: '#0f172a', color: '#f8fafc' }}>{t.title}</option>
              ))}
            </select>
          </div>

          {/* Phase 2: Word Spin */}
          <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f59e0b', marginBottom: '0.4rem' }}>
              ⚡ 2. ช่วงหมุนคำสุ่ม (Word Spin)
            </div>
            <select
              value={musicState.phaseTrackMapping.spin || ''}
              onChange={e => onAssignPhaseTrack('spin', e.target.value || null)}
              style={{
                width: '100%',
                padding: '0.55rem',
                background: '#0f172a',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '0.85rem',
                marginBottom: '0.5rem',
                colorScheme: 'dark'
              }}
            >
              <option value="" style={{ background: '#0f172a', color: '#f8fafc' }}>-- ไม่เปิดเพลง (ปิดเสียง) --</option>
              {tracks.map(t => (
                <option key={t.id} value={t.id} style={{ background: '#0f172a', color: '#f8fafc' }}>{t.title}</option>
              ))}
            </select>
          </div>

          {/* Phase 3: Question Thinking */}
          <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#818cf8', marginBottom: '0.4rem' }}>
              💡 3. ช่วงคิดคำตอบ (Question / Timer)
            </div>
            <select
              value={musicState.phaseTrackMapping.question || ''}
              onChange={e => onAssignPhaseTrack('question', e.target.value || null)}
              style={{
                width: '100%',
                padding: '0.55rem',
                background: '#0f172a',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '0.85rem',
                marginBottom: '0.5rem',
                colorScheme: 'dark'
              }}
            >
              <option value="" style={{ background: '#0f172a', color: '#f8fafc' }}>-- ไม่เปิดเพลง (ปิดเสียง) --</option>
              {tracks.map(t => (
                <option key={t.id} value={t.id} style={{ background: '#0f172a', color: '#f8fafc' }}>{t.title}</option>
              ))}
            </select>
          </div>

          {/* Phase 4: Answered Fanfare */}
          <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f87171', marginBottom: '0.4rem' }}>
              🎉 4. ช่วงตอบเสร็จสิ้น (Celebration)
            </div>
            <select
              value={musicState.phaseTrackMapping.answered || ''}
              onChange={e => onAssignPhaseTrack('answered', e.target.value || null)}
              style={{
                width: '100%',
                padding: '0.55rem',
                background: '#0f172a',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '0.85rem',
                marginBottom: '0.5rem',
                colorScheme: 'dark'
              }}
            >
              <option value="" style={{ background: '#0f172a', color: '#f8fafc' }}>-- ไม่เปิดเพลง (ปิดเสียง) --</option>
              {tracks.map(t => (
                <option key={t.id} value={t.id} style={{ background: '#0f172a', color: '#f8fafc' }}>{t.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </>
  );
};
