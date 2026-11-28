import React from 'react';
import { Image, Sparkles, Trophy } from 'lucide-react';
import { StageScreen } from '@/types/session.ts';
import type { ControlVariant } from './ControlCard.tsx';
import './stageScreenSwitcher.css';

/** In show order: the key visual (where the stage opens), the spin, then the winners. */
export const SCREEN_OPTIONS: { id: StageScreen; label: string; hint: string; icon: React.ReactNode }[] = [
  { id: 'standby', label: 'ภาพหลักของงาน', hint: 'Standby', icon: <Image size={18} aria-hidden="true" /> },
  { id: 'quiz', label: 'หน้าสุ่มคำ', hint: 'Spin', icon: <Sparkles size={18} aria-hidden="true" /> },
  { id: 'winner', label: 'ประกาศผู้ชนะ', hint: 'Winner', icon: <Trophy size={18} aria-hidden="true" /> }
];

export const screenLabel = (screen: StageScreen): string => SCREEN_OPTIONS.find(o => o.id === screen)?.label ?? screen;

/**
 * Three buttons that choose what the projector shows. Shared by the remote Live / Winners pages
 * and the stage drawer (each with its own look, picked by `variant`).
 */
export const StageScreenSwitcher: React.FC<{
  variant: ControlVariant;
  screen: StageScreen;
  onChange: (screen: StageScreen) => void;
  /** Shown on the winner button: how many winners are announced on it (0 = waiting). */
  winnerCount?: number;
}> = ({ variant, screen, onChange, winnerCount }) => (
  <div className={`screen-switch screen-switch--${variant}`} role="radiogroup" aria-label="หน้าจอบนเวที">
    {SCREEN_OPTIONS.map(option => {
      const active = option.id === screen;
      return (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={active}
          className={`screen-switch-btn screen-switch-btn--${option.id}${active ? ' is-active' : ''}`}
          onClick={() => onChange(option.id)}
        >
          <span className="screen-switch-icon">{option.icon}</span>
          <span className="screen-switch-text">
            <span className="screen-switch-label">{option.label}</span>
            <span className="screen-switch-hint">
              {active ? 'กำลังแสดงบนจอ' : option.hint}
              {option.id === 'winner' && winnerCount !== undefined && (winnerCount > 0 ? ` · ประกาศ ${winnerCount} คน` : ' · รอประกาศ')}
            </span>
          </span>
          {active && <span className="screen-switch-live" aria-hidden="true" />}
        </button>
      );
    })}
  </div>
);
