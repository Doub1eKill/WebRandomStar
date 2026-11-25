/** AppearanceSettings: props, state and handlers (Phase 6 split; body moved unchanged from AppearanceSettings.tsx). */
import React, { useState, useRef } from 'react';
import { AppearanceSettings, DEFAULT_APPEARANCE_SETTINGS } from '@/types/appearance.ts';
import { MusicTrack, MusicState } from '@/types/music.ts';

export interface AppearanceSettingsProps {
  settings: AppearanceSettings;
  onChange: (updated: AppearanceSettings) => void;
  tracks?: MusicTrack[];
  musicState?: MusicState;
  onAssignPhaseTrack?: (phase: keyof MusicState['phaseTrackMapping'], trackId: string | null) => void;
  onAddTrack?: (track: MusicTrack, fileBlob?: Blob) => void;
  onDeleteTrack?: (id: string) => void;
  onPlayTrack?: (track: MusicTrack) => void;
  onStopMusic?: () => void;
}

export function useAppearanceSettingsModel(props: AppearanceSettingsProps) {
  const {
  settings,
  onChange,
  tracks,
  musicState,
  onAssignPhaseTrack,
  onAddTrack,
  onDeleteTrack,
  onPlayTrack,
  onStopMusic
  } = props;
  const current = settings || DEFAULT_APPEARANCE_SETTINGS;

  const [customName, setCustomName] = useState(current.customFont?.name || '');
  const [customFamily, setCustomFamily] = useState(current.customFont?.fontFamily || '');
  const [customUrl, setCustomUrl] = useState(current.customFont?.googleFontUrl || '');
  const [isCustomSaved, setIsCustomSaved] = useState(false);
  const spinFileInputRef = useRef<HTMLInputElement | null>(null);

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

  const updateSetting = <K extends keyof AppearanceSettings>(key: K, value: AppearanceSettings[K]) => {
    onChange({
      ...current,
      [key]: value
    });
  };

  const handleSaveCustomFont = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFamily.trim()) return;

    onChange({
      ...current,
      fontPreset: 'custom',
      customFont: {
        name: customName.trim() || 'Custom Font',
        fontFamily: customFamily.trim(),
        googleFontUrl: customUrl.trim() || undefined
      }
    });
    setIsCustomSaved(true);
    setTimeout(() => setIsCustomSaved(false), 2500);
  };

  return { settings, onChange, tracks, musicState, onAssignPhaseTrack, onAddTrack, onDeleteTrack, onPlayTrack, onStopMusic, current, customName, setCustomName, customFamily, setCustomFamily, customUrl, setCustomUrl, isCustomSaved, setIsCustomSaved, spinFileInputRef, selectedSpinTrackId, selectedSpinTrack, isPlayingSelected, handleSpinFileUpload, updateSetting, handleSaveCustomFont };
}

export type AppearanceSettingsModel = ReturnType<typeof useAppearanceSettingsModel>;
