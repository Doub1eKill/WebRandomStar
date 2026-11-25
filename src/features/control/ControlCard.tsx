import React from 'react';

/**
 * The stage drawer and the remote Live page show the same controls with two different looks.
 * Both render their sections through these components and pick the look with `variant`.
 */
export type ControlVariant = 'drawer' | 'live';

export const ControlCard: React.FC<{
  variant: ControlVariant;
  title: React.ReactNode;
  /** Icon shown before the title (lucide-react element). */
  icon?: React.ReactNode;
  /** Live only: span the whole grid row (the stage monitor). */
  wide?: boolean;
  children: React.ReactNode;
}> = ({ variant, title, icon, wide, children }) =>
  variant === 'drawer' ? (
    <div className="control-section">
      <label className="section-label">
        {icon && <span className="card-title-icon" aria-hidden="true">{icon}</span>}
        {title}
      </label>
      {children}
    </div>
  ) : (
    <div className={wide ? 'live-card live-card--wide' : 'live-card'}>
      <div className="live-card-title">
        {icon && <span className="card-title-icon" aria-hidden="true">{icon}</span>}
        <span>{title}</span>
      </div>
      {children}
    </div>
  );
