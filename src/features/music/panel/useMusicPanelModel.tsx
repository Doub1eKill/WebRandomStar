/** MusicPanel: props, state and handlers (Phase 6 split; body moved unchanged from MusicPanel.tsx). */
import React, { useState, useRef } from 'react';
import { MusicTrack, MusicState, StagePhaseTarget } from '@/types/music.ts';

export interface MusicPanelProps {
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

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function useMusicPanelModel(props: MusicPanelProps) {
  const {
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
  } = props;
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
      onAssignPhaseTrack(urlPhase, newTrack.id);
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

  return { musicState, tracks, onPlayTrack, onPauseTrack, onResumeTrack, onStopMusic, onSeekMusic, onSetVolume, onToggleMute, onToggleAutoSync, onAssignPhaseTrack, onAddTrack, onDeleteTrack, onResetPresets, isUrlModalOpen, setIsUrlModalOpen, urlTitle, setUrlTitle, urlArtist, setUrlArtist, urlAddress, setUrlAddress, urlPhase, setUrlPhase, isDragging, setIsDragging, fileInputRef, currentTrack, handleFiles, handleAddUrlTrack, progressPercent };
}

export type MusicPanelModel = ReturnType<typeof useMusicPanelModel>;
