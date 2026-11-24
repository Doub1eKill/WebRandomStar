import React from 'react';
import {
  Music,
  Volume2,
  VolumeX,
  Square,
  Radio
} from 'lucide-react';

import type { MusicPanelModel } from '../useMusicPanelModel.tsx';

export const MusicMasterSection: React.FC<{ m: MusicPanelModel }> = ({ m }) => {
  const { musicState, onStopMusic, onSetVolume, onToggleMute, onToggleAutoSync } = m;
  return (
    <>
      {/* 1. Master Control & Stage Auto-Sync Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.85))',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35)'
            }}
          >
            <Music size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
              ระบบควบคุมเพลงประกอบเวที (Stage Music Control)
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              จัดการและเปิด-ปิดเพลง BGM ผูกกับสถานะเวทีอัตโนมัติ หรือเปิดเพลงอิสระ
            </div>
          </div>
        </div>

        {/* Master Action Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          {/* Auto-Sync Toggle Button */}
          <button
            onClick={onToggleAutoSync}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1rem',
              borderRadius: '9999px',
              border: `1.5px solid ${musicState.autoSyncWithStage ? '#10b981' : 'rgba(255, 255, 255, 0.15)'}`,
              background: musicState.autoSyncWithStage ? 'rgba(16, 185, 129, 0.18)' : 'rgba(255, 255, 255, 0.05)',
              color: musicState.autoSyncWithStage ? '#6ee7b7' : '#94a3b8',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: musicState.autoSyncWithStage ? '0 0 15px rgba(16, 185, 129, 0.3)' : 'none',
              transition: 'all 0.25s ease'
            }}
          >
            <Radio size={15} color={musicState.autoSyncWithStage ? '#10b981' : '#94a3b8'} />
            เล่นเพลงตามสถานะเวทีอัตโนมัติ (Auto-Sync: {musicState.autoSyncWithStage ? 'ON' : 'OFF'})
          </button>

          {/* Master Volume Slider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '0.4rem 0.8rem',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <button
              onClick={onToggleMute}
              style={{
                background: 'none',
                border: 'none',
                color: musicState.isMuted ? '#f87171' : '#38bdf8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {musicState.isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={musicState.volume}
              onChange={e => onSetVolume(parseFloat(e.target.value))}
              style={{ width: '80px', accentColor: '#38bdf8' }}
            />
            <span style={{ fontSize: '0.75rem', color: '#cbd5e1', minWidth: '32px' }}>
              {Math.round(musicState.volume * 100)}%
            </span>
          </div>

          {/* Fade Out All Button */}
          <button
            onClick={onStopMusic}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.55rem 0.9rem',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '8px',
              color: '#fca5a5',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Square size={14} /> ดับเพลงทั้งหมด (Fade Out)
          </button>
        </div>
      </div>
    </>
  );
};
