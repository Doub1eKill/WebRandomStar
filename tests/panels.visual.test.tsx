/**
 * Phase 6 guard: the four large control panels were split into section components.
 * Snapshots were recorded from the unsplit panels; the split versions must render the
 * same markup for the same props (several states per panel to cover conditional branches).
 */
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { TimerPanel } from '@/features/timer/panel/TimerPanel.tsx';
import { MusicPanel } from '@/features/music/panel/MusicPanel.tsx';
import { AppearanceSettingsPanel } from '@/features/appearance/panel/AppearanceSettings.tsx';
import { QuestionBankDashboard } from '@/features/questions/bank/QuestionBankDashboard.tsx';
import { DEFAULT_APPEARANCE_SETTINGS } from '@/types/appearance.ts';
import { DEFAULT_MUSIC_STATE, PRESET_MUSIC_TRACKS, MusicTrack } from '@/types/music.ts';
import { DEFAULT_QUESTIONS } from '@/data/defaultQuestions.ts';
import { TimerState } from '@/types/timer.ts';

const noop = () => {};
const timerHandlers = {
  onSetDuration: noop, onStartTimer: noop, onPauseTimer: noop, onResumeTimer: noop,
  onResetTimer: noop, onFinishTimer: noop, onAdjustTimer: noop,
  onSetTimerSoundSettings: noop, onSetStageDisplaySettings: noop
};

const timers: Record<string, TimerState> = {
  idle: { status: 'idle', durationMs: 90_000, remainingMs: 90_000 },
  paused: { status: 'paused', durationMs: 60_000, remainingMs: 25_000, pausedRemainingMs: 25_000 },
  critical: { status: 'paused', durationMs: 60_000, remainingMs: 8_000, pausedRemainingMs: 8_000 },
  finished: { status: 'finished', durationMs: 60_000, remainingMs: 0 }
};

const uploaded: MusicTrack = {
  id: 'custom-1', title: 'My Song', artist: 'Me', sourceType: 'url', url: 'https://example.test/a.mp3',
  duration: 125, defaultVolume: 0.8, loop: true, createdAt: 0
};

describe('split panels render the same markup', () => {
  it.each(Object.keys(timers))('TimerPanel (%s)', key => {
    expect(renderToString(<TimerPanel timerState={timers[key]} {...timerHandlers} />)).toMatchSnapshot();
  });

  it.each([
    ['stopped', DEFAULT_MUSIC_STATE],
    ['playing', { ...DEFAULT_MUSIC_STATE, isPlaying: true, currentTrackId: 'custom-1', currentTime: 42, duration: 125, trackVolumes: { 'custom-1': 0.35 } }],
    ['muted, manual', { ...DEFAULT_MUSIC_STATE, isMuted: true, autoSyncWithStage: false }]
  ])('MusicPanel (%s)', (_name, musicState) => {
    expect(renderToString(
      <MusicPanel
        musicState={musicState}
        tracks={[...PRESET_MUSIC_TRACKS, uploaded]}
        onPlayTrack={noop} onPauseTrack={noop} onResumeTrack={noop} onStopMusic={noop} onSeekMusic={noop}
        onSetVolume={noop} onToggleMute={noop} onToggleAutoSync={noop} onAssignPhaseTrack={noop}
        onAddTrack={noop} onDeleteTrack={noop} onResetPresets={noop} onSetTrackVolume={noop}
      />
    )).toMatchSnapshot();
  });

  it.each([
    ['defaults', DEFAULT_APPEARANCE_SETTINGS],
    ['keyword, manual stop, custom font', {
      ...DEFAULT_APPEARANCE_SETTINGS, quizMode: 'keyword' as const, spinStopMode: 'manual' as const,
      showWordLockPhase: false, backgroundMode: 'aero-shards' as const, fontPreset: 'custom' as const,
      customFont: { name: 'X', fontFamily: "'X', serif", googleFontUrl: 'https://fonts.googleapis.com/css2?family=X' }
    }]
  ])('AppearanceSettingsPanel (%s)', (_name, settings) => {
    expect(renderToString(
      <AppearanceSettingsPanel
        settings={settings}
        onChange={noop}
        tracks={[...PRESET_MUSIC_TRACKS, uploaded]}
        musicState={{ ...DEFAULT_MUSIC_STATE, phaseTrackMapping: { ...DEFAULT_MUSIC_STATE.phaseTrackMapping, spin: 'custom-1' } }}
        onAssignPhaseTrack={noop} onAddTrack={noop} onDeleteTrack={noop} onPlayTrack={noop} onStopMusic={noop}
      />
    )).toMatchSnapshot();
  });

  it.each([
    ['all questions', DEFAULT_QUESTIONS, []],
    ['some used and disabled', DEFAULT_QUESTIONS.map((q, i) => (i % 5 === 0 ? { ...q, enabled: false } : q)), DEFAULT_QUESTIONS.slice(0, 3).map(q => q.id)],
    ['empty bank', [], []]
  ])('QuestionBankDashboard (%s)', (_name, questions, used) => {
    expect(renderToString(
      <QuestionBankDashboard questions={questions} usedQuestionIds={used} onSaveQuestions={noop} />
    )).toMatchSnapshot();
  });
});
