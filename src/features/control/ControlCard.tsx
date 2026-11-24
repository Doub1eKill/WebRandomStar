import React from 'react';

/**
 * The stage drawer and the remote Live page show the same controls with two different looks.
 * Both render their sections through these components and pick the look with `variant`.
 */
export type ControlVariant = 'drawer' | 'live';

export const ControlCard: React.FC<{
  variant: ControlVariant;
  title: React.ReactNode;
  /** Live only: span the whole grid row (the stage monitor). */
  wide?: boolean;
  children: React.ReactNode;
}> = ({ variant, title, wide, children }) =>
  variant === 'drawer' ? (
    <div className="control-section">
      <label className="section-label">{title}</label>
      {children}
    </div>
  ) : (
    <div className={wide ? 'live-card live-card--wide' : 'live-card'}>
      <div className="live-card-title">{title}</div>
      {children}
    </div>
  );
