import React from 'react';

export type BadgeTone = 'sky' | 'violet' | 'red';

/** Grid of mutually exclusive mode cards. */
export const ModeGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mode-selection-grid ui-mode-grid">{children}</div>
);

/** One selectable mode: icon, name with a small badge, and a description. */
export const ModeCard: React.FC<{
  active: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  name: string;
  badge: string;
  tone: BadgeTone;
  description: React.ReactNode;
  testId?: string;
}> = ({ active, onSelect, icon, name, badge, tone, description, testId }) => (
  <button type="button" data-testid={testId} className={`mode-card ${active ? 'active' : ''}`} onClick={onSelect}>
    <span className="mode-icon" aria-hidden="true">{icon}</span>
    <div className="mode-info">
      <div className="ui-mode-head">
        <span className="mode-name ui-mode-name">{name}</span>
        <span className={`ui-badge ui-badge--${tone}`}>{badge}</span>
      </div>
      <span className="mode-desc ui-mode-desc">{description}</span>
    </div>
  </button>
);
