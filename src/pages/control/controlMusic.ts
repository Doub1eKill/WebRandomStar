import { createContext, useContext } from 'react';
import { MusicState } from '@/types/music.ts';
import { MusicRemote } from '@/features/music/musicRemote.ts';
import { MusicLibrary } from '@/features/music/useMusicLibrary.ts';

/** Music state, stage-player remote and shared library for the control pages (B14 + A3). */
export interface ControlMusic {
  musicState: MusicState;
  stageMusic: MusicRemote;
  library: MusicLibrary;
}

export const ControlMusicContext = createContext<ControlMusic | null>(null);

export function useControlMusic(): ControlMusic {
  const ctx = useContext(ControlMusicContext);
  if (!ctx) throw new Error('useControlMusic must be used inside ControlLayout');
  return ctx;
}
