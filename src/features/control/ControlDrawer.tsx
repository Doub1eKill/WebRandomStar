import React, { useRef } from 'react';
import { Bell, CircleCheck, Crosshair, Crown, FastForward, Flag, FolderOpen, GalleryVerticalEnd, Gamepad2, Library, MonitorUp, Music, OctagonX, Pause, Pin, Play, RotateCcw, Sparkle, Sparkles, Timer, Trash2, TriangleAlert, Trophy, Upload, User, Users, Volume2, VolumeX, X, Zap } from 'lucide-react';
import { SessionState } from '@/types/session.ts';
import { Contestant } from '@/types/question.ts';
import { KeywordItem } from '@/types/word.ts';
import { TimerSoundSettings, StageDisplaySettings, DEFAULT_STAGE_DISPLAY_SETTINGS } from '@/types/timer.ts';
import { AppearanceSettings } from '@/types/appearance.ts';
import { stageControls } from './useStageControls.ts';
import { ControlCard } from './ControlCard.tsx';
import { QuizModeToggle } from './QuizModeToggle.tsx';
import { MusicTrack, MusicState } from '@/types/music.ts';
import { contestantOptionLabel } from '@/data/contestantPhotos.ts';
import { StageScreen, stageScreenOf } from '@/types/session.ts';
import { StageScreenSwitcher } from './StageScreenSwitcher.tsx';

interface ControlDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  session: SessionState;
  contestants: Contestant[];
  words?: KeywordItem[];
  tracks?: MusicTrack[];
  musicState?: MusicState;
  onStart: (forceWord?: KeywordItem) => void;
  onStopSpin?: () => void;
  onPause: () => void;
  onSkip: () => void;
  onMarkAnswered: () => void;
  /** Makes every used question and keyword drawable again (replaces the old Reset button). */
  onReturnAllDrawn: () => void;
  onSelectContestant: (id: string) => void;
  onSelectRound: (round: string) => void;
  onSetVolume: (vol: number) => void;
  onToggleMute: () => void;
  onOpenQuestionManager: () => void;
  onOpenContestantManager: () => void;
  onSetTimerSoundSettings?: (settings: Partial<TimerSoundSettings>) => void;
  onSetStageDisplaySettings?: (settings: Partial<StageDisplaySettings>) => void;
  onSetAppearanceSettings?: (settings: AppearanceSettings) => void;
  onAssignPhaseTrack?: (phase: keyof MusicState['phaseTrackMapping'], trackId: string | null) => void;
  onAddTrack?: (track: MusicTrack, fileBlob?: Blob) => void;
  onDeleteTrack?: (id: string) => void;
  onPlayTrack?: (track: MusicTrack) => void;
  onStopMusic?: () => void;
  onAdjustTimer?: (deltaMs: number) => void;
  /** Standby / winner / spin screen on the projector. */
  onSetStageScreen?: (screen: StageScreen) => void;
}

export const ControlDrawer: React.FC<ControlDrawerProps> = ({
  isOpen,
  onClose,
  session,
  contestants,
  words = [],
  tracks,
  musicState,
  onStart,
  onStopSpin,
  onPause,
  onSkip,
  onMarkAnswered,
  onReturnAllDrawn,
  onSelectContestant,
  onSelectRound,
  onSetVolume,
  onToggleMute,
  onOpenQuestionManager,
  onOpenContestantManager,
  onSetTimerSoundSettings,
  onSetStageDisplaySettings,
  onSetAppearanceSettings,
  onAssignPhaseTrack,
  onAddTrack,
  onDeleteTrack,
  onPlayTrack,
  onStopMusic,
  onAdjustTimer,
  onSetStageScreen
}) => {
  const spinFileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const selectedSpinTrackId = musicState?.phaseTrackMapping.spin;
  const selectedSpinTrack = tracks?.find(t => t.id === selectedSpinTrackId);
  const isPlayingSelected = musicState?.isPlaying && musicState.currentTrackId === selectedSpinTrackId;

  const handleSpinFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0 || !onAddTrack) return;
    const file = files[0];
    const audioUrl = URL.createObjectURL(file);
    const audio = new Audio();
    audio.src = audioUrl;

    const createAndAssign = (duration: number) => {
      const newTrack: MusicTrack = {
        id: `local-spin-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Custom Spin Audio',
        sourceType: 'local_blob',
        url: audioUrl,
        duration: duration || 60,
        defaultVolume: 0.8,
        loop: true,
        targetPhase: 'spin',
        createdAt: Date.now()
      };
      onAddTrack(newTrack, file);
      if (onAssignPhaseTrack) {
        onAssignPhaseTrack('spin', newTrack.id);
      }
    };

    audio.addEventListener('loadedmetadata', () => {
      createAndAssign(Math.round(audio.duration) || 60);
    });

    audio.addEventListener('error', () => {
      createAndAssign(60);
    });
  };

  const handleOpenRemoteWindow = () => {
    const url = `${window.location.origin}${window.location.pathname}#/control/live`; // Phase 5 route
    window.open(url, 'SeasonQuizController', 'width=960,height=750,menubar=no,toolbar=no');
  };

  // A3: logic shared with the remote Live page
  const controls = stageControls(session, words, { onStart, onStopSpin, onSkip, onSetAppearanceSettings, onReturnAllDrawn });
  const { isIdle, isQuestionActive, isAnswered } = controls;
  const displaySettings = session.stageDisplaySettings || DEFAULT_STAGE_DISPLAY_SETTINGS;

  return (
    <div className="control-drawer-backdrop" onClick={onClose}>
      <div className="control-drawer-panel glass-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title-wrap">
            <span className="drawer-icon" aria-hidden="true"><Crown size={22} aria-hidden="true" /></span>
            <div>
              <h2 className="drawer-title">แผงควบคุมผู้ดำเนินรายการ</h2>
              <p className="drawer-subtitle">Stage Controller & Settings</p>
            </div>
          </div>
          <button className="btn-close-drawer" onClick={onClose} title="ปิด (Esc)" aria-label="ปิด (Esc)"><X size={18} aria-hidden="true" /></button>
        </div>

        <div className="drawer-body">
          {/* Section -1: what the projector shows (winners are chosen in the remote window) */}
          {onSetStageScreen && (
            <ControlCard variant="drawer" icon={<MonitorUp size={15} aria-hidden="true" />} title="หน้าจอบนเวที">
              <StageScreenSwitcher
                variant="drawer"
                screen={stageScreenOf(session)}
                onChange={onSetStageScreen}
                winnerCount={session.winnerAnnouncement?.winners.length ?? 0}
              />
            </ControlCard>
          )}

          {/* Section 0: Competition Flow Mode Quick Toggle */}
          {onSetAppearanceSettings && (
            <ControlCard variant="drawer" icon={<Trophy size={15} aria-hidden="true" />} title="รูปแบบการแข่งขัน (Competition Mode)">
              <QuizModeToggle variant="drawer" quizMode={session.appearanceSettings?.quizMode} onChange={controls.setQuizMode} />
            </ControlCard>
          )}

          {/* Section 1: Contestant & Round */}
          <ControlCard variant="drawer" icon={<User size={15} aria-hidden="true" />} title="ผู้เข้าแข่งขันปัจจุบัน">
            <div className="select-row">
              <select
                className="custom-select"
                value={session.selectedContestantId || ''}
                onChange={(e) => onSelectContestant(e.target.value)}
              >
                <option value="">-- เลือกผู้เข้าแข่งขัน --</option>
                {contestants.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title ? `[${c.title}] ` : ''}{contestantOptionLabel(c)}
                  </option>
                ))}
              </select>
              <button
                className="btn-secondary btn-icon-only"
                onClick={onOpenContestantManager}
                title="จัดการรายชื่อผู้เข้าแข่งขัน"
                aria-label="จัดการรายชื่อผู้เข้าแข่งขัน"
              >
                <Users size={16} aria-hidden="true" />
              </button>
            </div>
          </ControlCard>

          <ControlCard variant="drawer" icon={<Flag size={15} aria-hidden="true" />} title="รอบการแข่งขัน">
            <select
              className="custom-select"
              value={session.selectedRound}
              onChange={(e) => onSelectRound(e.target.value)}
            >
              <option value="intro">รอบแนะนำตัว (Intro)</option>
              <option value="general">รอบทั่วไป (General)</option>
              <option value="attitude">รอบทัศนคติ (Attitude)</option>
              <option value="scenario">รอบสถานการณ์จำลอง (Scenario)</option>
              <option value="final">รอบชิงชนะเลิศ (Final)</option>
            </select>
          </ControlCard>

          {/* Section 2: Stage Actions */}
          <ControlCard variant="drawer" icon={<Gamepad2 size={15} aria-hidden="true" />} title="ควบคุมการหมุนคำและเวที">
            <div className="actions-grid">
              {controls.isWordSpinning ? (
                <button
                  className="btn-primary"
                  style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', borderColor: '#f87171' }}
                  onClick={controls.stopSpin}
                >
                  <OctagonX size={16} aria-hidden="true" /> STOP SPIN (หยุดสุ่ม) [Space]
                </button>
              ) : (
                <button
                  className="btn-primary"
                  onClick={() => onStart()}
                  disabled={!controls.canSpin}
                >
                  <Crown size={16} aria-hidden="true" /> SPIN WORD [Space]
                </button>
              )}

              <button
                className="btn-secondary"
                onClick={onPause}
                disabled={isIdle || isQuestionActive || isAnswered}
              >
                {session.isPaused ? <><Play size={15} aria-hidden="true" /> เล่นต่อ</> : <><Pause size={15} aria-hidden="true" /> หยุดชั่วคราว</>}
              </button>

              <button
                className="btn-secondary"
                onClick={onSkip}
                disabled={isIdle || isQuestionActive || isAnswered}
              >
                <FastForward size={15} aria-hidden="true" /> ข้ามไปคำถาม
              </button>

              <button
                className="btn-secondary"
                onClick={onMarkAnswered}
                disabled={!isQuestionActive}
              >
                <CircleCheck size={15} aria-hidden="true" /> ตอบแล้ว [Enter]
              </button>

              <button
                className="btn-secondary btn-danger-soft"
                onClick={controls.returnAllDrawn}
                disabled={controls.drawnCount === 0}
              >
                <RotateCcw size={15} aria-hidden="true" /> คืนคำที่สุ่มแล้วทั้งหมด ({controls.drawnCount})
              </button>
            </div>
          </ControlCard>

          {/* Section 3: Word Lock Showcase Phase Toggle */}
          {onSetAppearanceSettings && (
            <ControlCard variant="drawer" icon={<GalleryVerticalEnd size={15} aria-hidden="true" />} title="การ์ดคำที่สุ่มได้ (Word Lock Showcase)">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <button
                  className="btn-secondary"
                  style={{
                    padding: '8px',
                    fontSize: '0.8rem',
                    background: (session.appearanceSettings?.showWordLockPhase !== false) ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255,255,255,0.05)',
                    borderColor: (session.appearanceSettings?.showWordLockPhase !== false) ? '#6366f1' : 'rgba(255,255,255,0.1)',
                    color: (session.appearanceSettings?.showWordLockPhase !== false) ? '#a5b4fc' : '#cbd5e1'
                  }}
                  onClick={() => controls.setShowWordLockPhase(true)}
                >
                  <Sparkles size={14} aria-hidden="true" /> แสดงการ์ดคำ (ON)
                </button>
                <button
                  className="btn-secondary"
                  style={{
                    padding: '8px',
                    fontSize: '0.8rem',
                    background: session.appearanceSettings?.showWordLockPhase === false ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255,255,255,0.05)',
                    borderColor: session.appearanceSettings?.showWordLockPhase === false ? '#ef4444' : 'rgba(255,255,255,0.1)',
                    color: session.appearanceSettings?.showWordLockPhase === false ? '#fca5a5' : '#cbd5e1'
                  }}
                  onClick={() => controls.setShowWordLockPhase(false)}
                >
                  <Zap size={14} aria-hidden="true" /> ข้ามไปคำถาม (OFF)
                </button>
              </div>
            </ControlCard>
          )}

          {/* Section: Word Spin Audio */}
          {tracks && (
            <ControlCard variant="drawer" icon={<Music size={15} aria-hidden="true" />} title="เสียงเพลงช่วงสุ่มคำ (Word Spin Audio)">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <select
                  className="custom-select"
                  value={musicState?.phaseTrackMapping.spin || ''}
                  onChange={e => onAssignPhaseTrack && onAssignPhaseTrack('spin', e.target.value || null)}
                  style={{ width: '100%', fontSize: '0.8rem' }}
                >
                  <option value="">-- ไม่เปิดเพลง (ปิดเสียง) --</option>
                  {tracks.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.title} {t.isPreset ? '(เพลงระบบ)' : '(อัปโหลดเอง)'}
                    </option>
                  ))}
                </select>

                <div style={{ display: 'flex', gap: '6px' }}>
                  {selectedSpinTrack && (
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ flex: 1, padding: '6px', fontSize: '0.75rem' }}
                      onClick={() => {
                        if (isPlayingSelected) {
                          onStopMusic?.();
                        } else if (onPlayTrack && selectedSpinTrack) {
                          onPlayTrack(selectedSpinTrack);
                        }
                      }}
                    >
                      {isPlayingSelected ? <><Pause size={14} aria-hidden="true" /> หยุดฟัง</> : <><Play size={14} aria-hidden="true" /> ฟังตัวอย่าง</>}
                    </button>
                  )}

                  <input
                    type="file"
                    ref={spinFileInputRef}
                    accept="audio/*"
                    onChange={e => handleSpinFileUpload(e.target.files)}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    className="btn-primary"
                    style={{
                      flex: 1,
                      padding: '6px',
                      fontSize: '0.75rem',
                      background: 'linear-gradient(135deg, #d97706, #b45309)',
                      borderColor: '#f59e0b'
                    }}
                    onClick={() => spinFileInputRef.current?.click()}
                  >
                    <Upload size={14} aria-hidden="true" /> อัปโหลดเสียงสุ่ม
                  </button>

                  {selectedSpinTrack && !selectedSpinTrack.isPreset && onDeleteTrack && (
                    <button
                      type="button"
                      className="btn-secondary btn-danger-soft"
                      style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                      title="ลบเพลงนี้ออกจากระบบ"
                      onClick={() => {
                        if (confirm(`ต้องการลบเพลง "${selectedSpinTrack.title}" ใช่หรือไม่?`)) {
                          onDeleteTrack(selectedSpinTrack.id);
                        }
                      }}
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            </ControlCard>
          )}

          {/* Section 3: Direct Word Selection */}
          {words.length > 0 && (
            <ControlCard variant="drawer" icon={<Crosshair size={15} aria-hidden="true" />} title="สุ่มเจาะจงคำสำคัญ (Direct Word Spin)">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {controls.enabledWords.map(w => (
                  <button
                    key={w.id}
                    className="cat-btn"
                    onClick={() => controls.startWithWord(w)}
                    style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                  >
                    <Sparkle size={12} aria-hidden="true" /> {w.word}
                  </button>
                ))}
              </div>
            </ControlCard>
          )}

          {/* Section 4: Timer Display Settings & Quick Adjust */}
          {onSetStageDisplaySettings && (
            <ControlCard variant="drawer" icon={<Timer size={15} aria-hidden="true" />} title="รูปแบบการแสดงตัวจับเวลาบนเวที">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
                <button
                  className="btn-secondary"
                  style={{
                    padding: '8px',
                    fontSize: '0.8rem',
                    background: displaySettings.timerDisplayMode === 'center' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255,255,255,0.05)',
                    borderColor: displaySettings.timerDisplayMode === 'center' ? '#6366f1' : 'rgba(255,255,255,0.1)',
                    color: displaySettings.timerDisplayMode === 'center' ? '#a5b4fc' : '#cbd5e1'
                  }}
                  onClick={() => onSetStageDisplaySettings({ timerDisplayMode: 'center' })}
                >
                  <Sparkles size={14} aria-hidden="true" /> จอใหญ่ตรงกลาง
                </button>
                <button
                  className="btn-secondary"
                  style={{
                    padding: '8px',
                    fontSize: '0.8rem',
                    background: displaySettings.timerDisplayMode === 'corner' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.05)',
                    borderColor: displaySettings.timerDisplayMode === 'corner' ? '#38bdf8' : 'rgba(255,255,255,0.1)',
                    color: displaySettings.timerDisplayMode === 'corner' ? '#7dd3fc' : '#cbd5e1'
                  }}
                  onClick={() => onSetStageDisplaySettings({ timerDisplayMode: 'corner' })}
                >
                  <Pin size={14} aria-hidden="true" /> มุมขวาบน
                </button>
              </div>

              {onAdjustTimer && (
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  <button
                    className="btn-secondary"
                    style={{ flex: 1, padding: '6px', fontSize: '0.75rem', color: '#7dd3fc' }}
                    onClick={() => onAdjustTimer(30000)}
                  >
                    +30s
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ flex: 1, padding: '6px', fontSize: '0.75rem', color: '#86efac' }}
                    onClick={() => onAdjustTimer(10000)}
                  >
                    +10s
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ flex: 1, padding: '6px', fontSize: '0.75rem', color: '#fca5a5' }}
                    onClick={() => onAdjustTimer(-10000)}
                  >
                    -10s
                  </button>
                </div>
              )}
            </ControlCard>
          )}

          {/* Section 5: Audio Controls */}
          <ControlCard variant="drawer" icon={<Volume2 size={15} aria-hidden="true" />} title="ระบบเสียงบรรยากาศ & ตัวจับเวลา">
            <div className="audio-row">
              <button className="btn-secondary" onClick={onToggleMute}>
                {session.isMuted ? <><VolumeX size={15} aria-hidden="true" /> ปิดเสียงอยู่</> : <><Volume2 size={15} aria-hidden="true" /> เปิดเสียง</>}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={session.volume}
                onChange={(e) => onSetVolume(parseFloat(e.target.value))}
                className="volume-slider"
              />
              <span className="vol-text">{Math.round(session.volume * 100)}%</span>
            </div>

            {onSetTimerSoundSettings && session.timerSoundSettings && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.75rem', paddingTop: '0.6rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }} className="ui-ico-label"><Timer size={14} aria-hidden="true" />เสียงติ๊กถอยหลัง:</span>
                  <button
                    className="btn-secondary"
                    style={{
                      padding: '0.3rem 0.65rem',
                      fontSize: '0.75rem',
                      background: session.timerSoundSettings.tickSoundEnabled ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: session.timerSoundSettings.tickSoundEnabled ? '#86efac' : '#fca5a5',
                      border: `1px solid ${session.timerSoundSettings.tickSoundEnabled ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
                    }}
                    onClick={() => onSetTimerSoundSettings({ tickSoundEnabled: !session.timerSoundSettings?.tickSoundEnabled })}
                  >
                    {session.timerSoundSettings.tickSoundEnabled ? 'เปิด (ON)' : 'ปิด (OFF)'}
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', color: '#fde68a' }} className="ui-ico-label"><TriangleAlert size={14} aria-hidden="true" />เสียงเตือนใกล้หมด:</span>
                  <button
                    className="btn-secondary"
                    style={{
                      padding: '0.3rem 0.65rem',
                      fontSize: '0.75rem',
                      background: session.timerSoundSettings.warningSoundEnabled ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: session.timerSoundSettings.warningSoundEnabled ? '#fde68a' : '#fca5a5',
                      border: `1px solid ${session.timerSoundSettings.warningSoundEnabled ? 'rgba(245, 158, 11, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
                    }}
                    onClick={() => onSetTimerSoundSettings({ warningSoundEnabled: !session.timerSoundSettings?.warningSoundEnabled })}
                  >
                    {session.timerSoundSettings.warningSoundEnabled ? 'เปิด (ON)' : 'ปิด (OFF)'}
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', color: '#fca5a5' }} className="ui-ico-label"><Bell size={14} aria-hidden="true" />เสียงเมื่อหมดเวลา:</span>
                  <button
                    className="btn-secondary"
                    style={{
                      padding: '0.3rem 0.65rem',
                      fontSize: '0.75rem',
                      background: session.timerSoundSettings.finishSoundEnabled ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      color: session.timerSoundSettings.finishSoundEnabled ? '#fca5a5' : '#94a3b8',
                      border: `1px solid ${session.timerSoundSettings.finishSoundEnabled ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`
                    }}
                    onClick={() => onSetTimerSoundSettings({ finishSoundEnabled: !session.timerSoundSettings?.finishSoundEnabled })}
                  >
                    {session.timerSoundSettings.finishSoundEnabled ? 'เปิด (ON)' : 'ปิด (OFF)'}
                  </button>
                </div>
              </div>
            )}
          </ControlCard>

          {/* Section 6: Question Bank Manager & Multi-display Window */}
          <ControlCard variant="drawer" icon={<FolderOpen size={15} aria-hidden="true" />} title="การจัดการข้อมูลและการต่อจอ">
            <div className="drawer-footer-actions">
              <button className="btn-secondary" onClick={onOpenQuestionManager}>
                <Library size={15} aria-hidden="true" /> คลังคำถาม
              </button>
              <button className="btn-primary btn-remote-popup" onClick={handleOpenRemoteWindow}>
                <MonitorUp size={15} aria-hidden="true" /> เปิดหน้าต่างแยกจอ (Dual Display)
              </button>
            </div>
          </ControlCard>

          {/* Debug seed info */}
          <div className="drawer-meta-info">
            <span>Session: <code>{session.sessionId}</code></span>
            <span>Seed: <code>{session.seed}</code></span>
            <span>ใช้ไปแล้ว: {session.usedQuestionIds.length} ข้อ</span>
          </div>
        </div>
      </div>
    </div>
  );
};
