/**
 * Remote control window (Phase 5): header, tab navigation and connection banner. Each tab is
 * its own route under #/control/... (lazy-loaded, survives a refresh). Replaces ControlCenter's
 * activeTab state and RemoteController.
 */
import React, { useEffect, useMemo } from 'react';
import { NavLink, Outlet } from 'react-router';
import { Layers, Key, BookOpen, Clock, Music, Users, History, Palette, Sparkles } from 'lucide-react';
import { SessionProvider, useSession, usePeerConnected } from '../../features/session/SessionProvider.tsx';
import { useRemoteMusic } from '../../features/music/musicRemote.ts';
import { useMusicLibrary } from '../../features/music/useMusicLibrary.ts';
import { useContestants, useHistory, useQuestions, useWords } from '../../hooks/useRepository.ts';
import { applyTypography } from '../../utils/typography.ts';
import { OperatorToasts } from '../../components/Control/OperatorToasts.tsx';
import { ControlMusicContext } from './controlMusic.ts';

export const ControlLayout: React.FC = () => (
  <SessionProvider role="controller">
    <ControlShell />
  </SessionProvider>
);

/** A4: tab buttons come from one config instead of eight copy-pasted blocks. */
const tabStyle = (isActive: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.75rem 1rem',
  background: 'none',
  border: 'none',
  borderBottom: isActive ? '2px solid #6366f1' : '2px solid transparent',
  color: isActive ? '#fff' : '#94a3b8',
  fontSize: '0.875rem',
  fontWeight: isActive ? 600 : 400,
  cursor: 'pointer',
  textDecoration: 'none',
  whiteSpace: 'nowrap'
});

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

  const tabs = [
    { to: 'live', icon: <Layers size={16} />, label: 'ควบคุมเวที (Stage)' },
    { to: 'words', icon: <Key size={16} />, label: `คลังคำสำคัญ (${words.length})` },
    { to: 'questions', icon: <BookOpen size={16} />, label: `คลังคำถาม (${questions.length})` },
    { to: 'timer', icon: <Clock size={16} />, label: 'ตัวจับเวลา (Timer)' },
    { to: 'music', icon: <Music size={16} />, label: `เพลงประกอบ (${library.tracks.length})` },
    { to: 'contestants', icon: <Users size={16} />, label: `ผู้เข้าแข่งขัน (${contestants.length})` },
    { to: 'history', icon: <History size={16} />, label: `ประวัติ (${history.length})` },
    { to: 'appearance', icon: <Palette size={16} />, label: 'ปรับแต่งหน้าตา (Appearance)' }
  ];

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <OperatorToasts />
      {/* Q2: the stage window is the only host; without it commands have no effect. */}
      {!isStageConnected && (
        <div className="stage-disconnected-banner" role="alert">
          ⚠ ไม่พบหน้าจอเวทีที่เปิดอยู่ — คำสั่งจะไม่มีผลจนกว่าจะเปิดหน้าเวที (หน้าเว็บหลัก) ในเบราว์เซอร์เดียวกัน
        </div>
      )}
      <div
        className="competition-control-center"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          background: '#090d16',
          color: '#f8fafc',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.85rem 1.25rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
                ✦ SCi TECH TINE ✦ CHARM OF TRANSITION (Ambassador 2026)
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                สถานะเวที: <strong style={{ color: '#38bdf8', textTransform: 'uppercase' }}>{currentState}</strong> | Session: <span style={{ fontFamily: 'monospace' }}>{sessionId.slice(0, 8)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav
          style={{
            display: 'flex',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(15, 23, 42, 0.5)',
            padding: '0 0.75rem',
            overflowX: 'auto'
          }}
        >
          {tabs.map(tab => (
            <NavLink key={tab.to} to={tab.to} style={({ isActive }) => tabStyle(isActive)}>
              {tab.icon}
              {tab.label}
            </NavLink>
          ))}
        </nav>

        {/* Tab Contents */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
          <ControlMusicContext.Provider value={music}>
            <Outlet />
          </ControlMusicContext.Provider>
        </div>
      </div>
    </div>
  );
};

export default ControlLayout;
