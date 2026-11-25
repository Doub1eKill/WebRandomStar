/**
 * Remote control window (Phase 5): header, tab navigation and connection banner. Each tab is
 * its own route under #/control/... (lazy-loaded, survives a refresh). Replaces ControlCenter's
 * activeTab state and RemoteController.
 */
import React, { useEffect, useMemo } from 'react';
// Last in the cascade, so loading it with this lazy chunk keeps its order (see app/styles.css).
// It holds the control window's theme, scoped under .control-app.
import './controlLayout.css';
import { NavLink, Outlet } from 'react-router';
import { Layers, Key, BookOpen, Clock, Music, Users, History, Palette, Sparkles } from 'lucide-react';
import { SessionProvider, useSession, usePeerConnected } from '@/features/session/SessionProvider.tsx';
import { useRemoteMusic } from '@/features/music/musicRemote.ts';
import { useMusicLibrary } from '@/features/music/useMusicLibrary.ts';
import { useContestants, useHistory, useQuestions, useWords } from '@/storage/useRepository.ts';
import { applyTypography } from '@/features/appearance/typography.ts';
import { OperatorToasts } from '@/shared/notices/OperatorToasts.tsx';
import { ControlMusicContext } from './controlMusic.ts';

export const ControlLayout: React.FC = () => (
  <SessionProvider role="controller">
    <ControlShell />
  </SessionProvider>
);

const ControlShell: React.FC = () => {
  const currentState = useSession(s => s.currentState);
  const sessionId = useSession(s => s.sessionId);
  const appearanceSettings = useSession(s => s.appearanceSettings);
  const isStageConnected = usePeerConnected();

  const words = useWords();
  const questions = useQuestions();
  const contestants = useContestants();
  const history = useHistory();

  // B14: music plays on the stage; this window shows its state and sends commands (no progress here).
  const { musicState, remote: stageMusic } = useRemoteMusic();
  const library = useMusicLibrary(stageMusic, musicState.currentTrackId);
  const music = useMemo(() => ({ musicState, stageMusic, library }), [musicState, stageMusic, library]);

  // Apply typography in remote controller as well
  useEffect(() => {
    applyTypography(appearanceSettings);
  }, [appearanceSettings]);

  // A4: tab buttons come from one config instead of eight copy-pasted blocks.
  const tabs: { to: string; icon: React.ReactNode; label: string; count?: number }[] = [
    { to: 'live', icon: <Layers size={16} />, label: 'ควบคุมเวที (Stage)' },
    { to: 'words', icon: <Key size={16} />, label: 'คลังคำสำคัญ', count: words.length },
    { to: 'questions', icon: <BookOpen size={16} />, label: 'คลังคำถาม', count: questions.length },
    { to: 'timer', icon: <Clock size={16} />, label: 'ตัวจับเวลา (Timer)' },
    { to: 'music', icon: <Music size={16} />, label: 'เพลงประกอบ', count: library.tracks.length },
    { to: 'contestants', icon: <Users size={16} />, label: 'ผู้เข้าแข่งขัน', count: contestants.length },
    { to: 'history', icon: <History size={16} />, label: 'ประวัติ', count: history.length },
    { to: 'appearance', icon: <Palette size={16} />, label: 'ปรับแต่งหน้าตา (Appearance)' }
  ];

  return (
    <div className="control-app">
      <OperatorToasts />
      <div className="competition-control-center">
        {/* Q2: the stage window is the only host; without it commands have no effect. */}
        {!isStageConnected && (
          <div className="stage-disconnected-banner" role="alert">
            ⚠ ไม่พบหน้าจอเวทีที่เปิดอยู่ — คำสั่งจะไม่มีผลจนกว่าจะเปิดหน้าเวที (หน้าเว็บหลัก) ในเบราว์เซอร์เดียวกัน
          </div>
        )}

        <header className="ctl-header">
          <div className="ctl-brand">
            <div className="ctl-brand-mark" aria-hidden="true">
              <Sparkles size={18} />
            </div>
            <div className="ctl-brand-text">
              <div className="ctl-brand-eyebrow">Backstage Control</div>
              <h1 className="ctl-brand-title">✦ SCi TECH TINE ✦ CHARM OF TRANSITION (Ambassador 2026)</h1>
            </div>
          </div>
          <div className="ctl-status" aria-live="polite">
            <span className={`ctl-pill ${isStageConnected ? 'ctl-pill--ok' : 'ctl-pill--bad'}`}>
              <span className="ctl-dot" aria-hidden="true" />
              {isStageConnected ? 'เชื่อมต่อจอเวทีแล้ว' : 'ไม่พบจอเวที'}
            </span>
            <span className="ctl-pill">
              สถานะเวที: <strong className="ctl-pill-state">{currentState}</strong>
            </span>
            <span className="ctl-pill ctl-pill--muted" title={sessionId}>
              Session: <span className="ctl-mono">{sessionId.slice(0, 8)}</span>
            </span>
          </div>
        </header>

        <nav className="ctl-tabs" aria-label="หน้าควบคุม">
          {tabs.map(tab => (
            <NavLink key={tab.to} to={tab.to} className={({ isActive }) => (isActive ? 'ctl-tab active' : 'ctl-tab')}>
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && <span className="ctl-tab-count">{tab.count}</span>}
            </NavLink>
          ))}
        </nav>

        <main className="ctl-main">
          <div className="ctl-content">
            <ControlMusicContext.Provider value={music}>
              <Outlet />
            </ControlMusicContext.Provider>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ControlLayout;
