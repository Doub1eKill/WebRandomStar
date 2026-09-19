import React, { useState, useRef } from 'react';
import { MusicTrack, MusicState, StagePhaseTarget } from '../../types/music.ts';
import {
  Music,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Trash2,
  Upload,
  Link as LinkIcon,
  Sparkles,
  Square,
  Radio
} from 'lucide-react';

interface MusicPanelProps {
  musicState: MusicState;
  tracks: MusicTrack[];
  onPlayTrack: (track: MusicTrack) => void;
  onPauseTrack: () => void;
  onResumeTrack: () => void;
  onStopMusic: () => void;
  onSeekMusic: (seconds: number) => void;
  onSetVolume: (volume: number) => void;
  onToggleMute: () => void;
  onToggleAutoSync: () => void;
  onAssignPhaseTrack: (phase: keyof MusicState['phaseTrackMapping'], trackId: string | null) => void;
  onAddTrack: (track: MusicTrack, fileBlob?: Blob) => void;
  onDeleteTrack: (id: string) => void;
  onResetPresets: () => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const MusicPanel: React.FC<MusicPanelProps> = ({
  musicState,
  tracks,
  onPlayTrack,
  onPauseTrack,
  onResumeTrack,
  onStopMusic,
  onSeekMusic,
  onSetVolume,
  onToggleMute,
  onToggleAutoSync,
  onAssignPhaseTrack,
  onAddTrack,
  onDeleteTrack,
  onResetPresets
}) => {
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [urlTitle, setUrlTitle] = useState('');
  const [urlArtist, setUrlArtist] = useState('');
  const [urlAddress, setUrlAddress] = useState('');
  const [urlPhase, setUrlPhase] = useState<StagePhaseTarget>('none');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentTrack = tracks.find(t => t.id === musicState.currentTrackId) || null;

  // Handle Local File Upload
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const audioUrl = URL.createObjectURL(file);
      const audio = new Audio();
      audio.src = audioUrl;

      audio.addEventListener('loadedmetadata', () => {
        const duration = Math.round(audio.duration) || 120;
        const newTrack: MusicTrack = {
          id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          artist: 'Local File',
          sourceType: 'local_blob',
          url: audioUrl,
          duration,
          defaultVolume: 0.8,
          loop: true,
          createdAt: Date.now()
        };
        onAddTrack(newTrack, file);
      });

      audio.addEventListener('error', () => {
        const newTrack: MusicTrack = {
          id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          artist: 'Local File',
          sourceType: 'local_blob',
          url: audioUrl,
          duration: 120,
          defaultVolume: 0.8,
          loop: true,
          createdAt: Date.now()
        };
        onAddTrack(newTrack, file);
      });
    });
  };

  const handleAddUrlTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlAddress.trim() || !urlTitle.trim()) return;

    const newTrack: MusicTrack = {
      id: `url-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title: urlTitle.trim(),
      artist: urlArtist.trim() || 'Online Stream',
      sourceType: 'url',
      url: urlAddress.trim(),
      duration: 180,
      defaultVolume: 0.8,
      loop: true,
      targetPhase: urlPhase,
      createdAt: Date.now()
    };

    onAddTrack(newTrack);

    if (urlPhase !== 'none') {
      onAssignPhaseTrack(urlPhase as any, newTrack.id);
    }

    setUrlTitle('');
    setUrlArtist('');
    setUrlAddress('');
    setUrlPhase('none');
    setIsUrlModalOpen(false);
  };

  const progressPercent = musicState.duration > 0
    ? Math.min(100, (musicState.currentTime / musicState.duration) * 100)
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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

      {/* 2. Now Playing Deck */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(15, 23, 42, 0.85))',
          border: '1.5px solid rgba(99, 102, 241, 0.35)',
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
              background: 'linear-gradient(90deg, #6366f1, #38bdf8)',
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
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '16px',
              padding: '1.5rem',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)'
            }}
          >
            <h3 style={{ margin: '0 0 1rem 0', color: '#f8fafc', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <LinkIcon size={18} color="#818cf8" /> เพิ่มเพลงจากลิงก์ URL
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
                <option value="none" style={{ background: '#0f172a', color: '#f8fafc' }}>-- ไม่ผูกช่วงเวที (เปิดเล่นเอง) --</option>
                <option value="ambient" style={{ background: '#0f172a', color: '#f8fafc' }}>🏠 ช่วงพักเวที (Idle / Ambient)</option>
                <option value="spin" style={{ background: '#0f172a', color: '#f8fafc' }}>⚡ ช่วงหมุนคำสุ่ม (Word Spin)</option>
                <option value="question" style={{ background: '#0f172a', color: '#f8fafc' }}>💡 ช่วงคิดคำตอบ (Question / Timer)</option>
                <option value="answered" style={{ background: '#0f172a', color: '#f8fafc' }}>🎉 ช่วงตอบเสร็จสิ้น (Celebration)</option>
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
                  background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
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
    </div>
  );
};
