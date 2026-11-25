import React from 'react';
import { Crown, CloudFog, CloudRain, Leaf, Lightbulb, Moon, PartyPopper, House, Sparkle, Star, Wind, Zap, type LucideIcon } from 'lucide-react';

/**
 * Icons that stand in for the emoji and symbol glyphs the control UI used to show (2026-11-25:
 * the user asked for icons only, no emoji). Data such as CATEGORY_CONFIGS keeps its `icon`
 * strings; the control UI renders these components instead.
 */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  rain: CloudRain,
  mist: CloudFog,
  wind: Wind,
  leaf: Leaf,
  moon: Moon,
  star: Star,
  final: Crown
};

export const CategoryIcon: React.FC<{ category: string; size?: number; className?: string }> = ({ category, size = 14, className }) => {
  const Icon = CATEGORY_ICONS[category.toLowerCase()] ?? Sparkle;
  return <Icon size={size} className={className} aria-hidden="true" />;
};

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
