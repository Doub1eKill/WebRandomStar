import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';

import type { MusicPanelModel } from '../useMusicPanelModel.tsx';
import { formatTime } from '../useMusicPanelModel.tsx';

export const NowPlayingSection: React.FC<{ m: MusicPanelModel }> = ({ m }) => {
  const { musicState, tracks, onPlayTrack, onPauseTrack, onResumeTrack, onSeekMusic, currentTrack, progressPercent } = m;
  return (
    <>
      {/* 2. Now Playing Deck */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(14, 18, 44, 0.85))',
          border: '1.5px solid rgba(124, 58, 237, 0.35)',
          borderRadius: '16px',
          padding: '1.25rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                background: musicState.isPlaying ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                color: musicState.isPlaying ? '#86efac' : '#94a3b8',
                border: `1px solid ${musicState.isPlaying ? 'rgba(34, 197, 94, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`
              }}
            >
              {musicState.isPlaying ? '● กำลังเล่น (Now Playing)' : '○ พักชั่วคราว (Paused / Idle)'}
            </span>
            {currentTrack && (
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  background: currentTrack.sourceType === 'local_blob'
                    ? 'rgba(56, 189, 248, 0.15)'
                    : currentTrack.sourceType === 'url'
                    ? 'rgba(168, 85, 247, 0.15)'
                    : 'rgba(245, 158, 11, 0.15)',
                  color: currentTrack.sourceType === 'local_blob'
                    ? '#7dd3fc'
                    : currentTrack.sourceType === 'url'
                    ? '#d8b4fe'
                    : '#fde68a'
                }}
              >
                {currentTrack.sourceType === 'local_blob' && '📁 ไฟล์ในเครื่อง'}
                {currentTrack.sourceType === 'url' && '🔗 ลิงก์ออนไลน์'}
                {currentTrack.sourceType === 'preset' && '✨ เพลงระบบ'}
              </span>
            )}
          </div>

          <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'monospace' }}>
            {formatTime(musicState.currentTime)} / {formatTime(musicState.duration || currentTrack?.duration || 0)}
          </div>
        </div>

        {/* Track Title */}
        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.2rem' }}>
          {currentTrack ? currentTrack.title : 'ยังไม่มีเพลงที่กำลังเล่น'}
        </div>
        <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1rem' }}>
          {currentTrack?.artist || 'เลือกเพลงจากรายการด้านล่างเพื่อเริ่มเล่น'}
        </div>

        {/* Progress Bar Scrubber */}
        <div
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            const targetSec = clickPos * (musicState.duration || currentTrack?.duration || 100);
            onSeekMusic(targetSec);
          }}
          style={{
            height: '8px',
            width: '100%',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '9999px',
            cursor: 'pointer',
            overflow: 'hidden',
            marginBottom: '1rem',
            position: 'relative'
          }}
        >
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--ctl-accent), #38bdf8)',
              borderRadius: '9999px',
              transition: 'width 0.15s linear'
            }}
          />
        </div>

        {/* Playback Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.85rem' }}>
          {musicState.isPlaying ? (
            <button
              onClick={onPauseTrack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.65rem 1.4rem',
                background: 'linear-gradient(135deg, #eab308, #ca8a04)',
                border: 'none',
                borderRadius: '10px',
                color: '#000',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Pause size={18} /> พักชั่วคราว (Pause)
            </button>
          ) : (
            <button
              onClick={() => {
                if (currentTrack) {
                  onResumeTrack();
                } else if (tracks.length > 0) {
                  onPlayTrack(tracks[0]);
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.65rem 1.4rem',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Play size={18} /> เล่นเพลง (Play)
            </button>
          )}

          <button
            onClick={() => onSeekMusic(0)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.65rem 1rem',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '10px',
              color: '#cbd5e1',
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={16} /> เริ่มใหม่ (Restart)
          </button>
        </div>
      </div>
    </>
  );
};
