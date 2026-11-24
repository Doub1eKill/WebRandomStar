import React from 'react';
import {
  Play,
  Pause,
  Trash2,
  Upload,
  Link as LinkIcon,
} from 'lucide-react';

import type { MusicPanelModel } from '../useMusicPanelModel.tsx';
import { formatTime } from '../useMusicPanelModel.tsx';

export const TrackLibrarySection: React.FC<{ m: MusicPanelModel }> = ({ m }) => {
  const { musicState, tracks, onPlayTrack, onDeleteTrack, onResetPresets, setIsUrlModalOpen, isDragging, setIsDragging, fileInputRef, handleFiles } = m;
  return (
    <>
      {/* 4. Track Library & File Management */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '1.25rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
              คลังเพลงทั้งหมด ({tracks.length} เพลง)
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              อัปโหลดไฟล์เพลงจากเครื่อง หรือใส่ลิงก์ URL บันทึกในเบราว์เซอร์อัตโนมัติ
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              type="file"
              ref={fileInputRef}
              accept="audio/*"
              multiple
              onChange={e => handleFiles(e.target.files)}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.55rem 0.95rem',
                background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(99, 102, 241, 0.3)'
              }}
            >
              <Upload size={15} /> + อัปโหลดไฟล์เพลง (MP3/WAV)
            </button>

            <button
              onClick={() => setIsUrlModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.55rem 0.85rem',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                color: '#cbd5e1',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <LinkIcon size={14} /> + ใส่ลิงก์ URL
            </button>

            <button
              onClick={onResetPresets}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.55rem 0.85rem',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                color: '#94a3b8',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              คืนค่าเพลงระบบ (Reset)
            </button>
          </div>
        </div>

        {/* Drag & Drop Upload Dropzone */}
        <div
          onDragOver={e => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={e => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? '#6366f1' : 'rgba(255, 255, 255, 0.15)'}`,
            borderRadius: '12px',
            padding: '1.25rem',
            textAlign: 'center',
            background: isDragging ? 'rgba(99, 102, 241, 0.1)' : 'rgba(0, 0, 0, 0.2)',
            cursor: 'pointer',
            marginBottom: '1rem',
            transition: 'all 0.2s ease'
          }}
        >
          <Upload size={24} color={isDragging ? '#818cf8' : '#64748b'} style={{ margin: '0 auto 0.4rem auto' }} />
          <div style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 600 }}>
            ลากและวางไฟล์เพลง (.mp3, .wav, .ogg) ที่นี่ หรือคลิกเพื่อเลือกไฟล์
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            ไฟล์จะถูกบันทึกลงในเบราว์เซอร์อัตโนมัติ เปิดใช้งานได้แบบออฟไลน์ 100%
          </div>
        </div>

        {/* Track Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {tracks.map((track) => {
            const isThisPlaying = musicState.currentTrackId === track.id && musicState.isPlaying;
            return (
              <div
                key={track.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  background: isThisPlaying ? 'rgba(99, 102, 241, 0.18)' : 'rgba(30, 41, 59, 0.4)',
                  border: `1px solid ${isThisPlaying ? '#6366f1' : 'rgba(255, 255, 255, 0.06)'}`,
                  borderRadius: '10px',
                  gap: '0.75rem',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '220px' }}>
                  <button
                    onClick={() => onPlayTrack(track)}
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: isThisPlaying ? '#6366f1' : 'rgba(255, 255, 255, 0.1)',
                      border: 'none',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    {isThisPlaying ? <Pause size={15} /> : <Play size={15} style={{ marginLeft: '2px' }} />}
                  </button>

                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: isThisPlaying ? '#a5b4fc' : '#f8fafc' }}>
                      {track.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span>{track.artist || 'Unknown'}</span>
                      <span>•</span>
                      <span>{formatTime(track.duration)}</span>
                      <span>•</span>
                      <span style={{ color: track.sourceType === 'local_blob' ? '#38bdf8' : '#a855f7' }}>
                        {track.sourceType === 'local_blob' ? 'Local File' : track.sourceType === 'url' ? 'URL Stream' : 'System Preset'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => onPlayTrack(track)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      background: isThisPlaying ? '#4f46e5' : 'rgba(255, 255, 255, 0.08)',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {isThisPlaying ? 'กำลังเล่นอยู่' : 'เล่นเพลงนี้ (Play)'}
                  </button>

                  {!track.isPreset && (
                    <button
                      onClick={() => onDeleteTrack(track.id)}
                      style={{
                        padding: '0.35rem 0.6rem',
                        background: 'rgba(239, 68, 68, 0.12)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '6px',
                        color: '#fca5a5',
                        cursor: 'pointer'
                      }}
                      title="ลบเพลงออกจากระบบ"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
