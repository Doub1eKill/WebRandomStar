import React from 'react';
import { House, Lightbulb, PartyPopper, Zap, type LucideIcon } from 'lucide-react';

/**
 * Icons that stand in for the emoji and symbol glyphs the control UI used to show (2026-11-25:
 * the user asked for icons only, no emoji).
 */
export type MusicPhase = 'ambient' | 'spin' | 'question' | 'answered';

const MUSIC_PHASE_ICONS: Record<MusicPhase, LucideIcon> = {
  ambient: House,
  spin: Zap,
  question: Lightbulb,
  answered: PartyPopper
};

export const MusicPhaseIcon: React.FC<{ phase: MusicPhase; size?: number }> = ({ phase, size = 15 }) => {
  const Icon = MUSIC_PHASE_ICONS[phase];
  return <Icon size={size} aria-hidden="true" />;
};
