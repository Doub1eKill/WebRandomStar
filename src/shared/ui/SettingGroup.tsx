import React from 'react';

/** A titled group of settings (appearance panel sections), with an optional hint line. */
export const SettingGroup: React.FC<{
  icon: string;
  title: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}> = ({ icon, title, hint, children }) => (
  <div className="control-section-group">
    <h3 className="group-title">
      <span className="group-icon">{icon}</span>
      <span>{title}</span>
    </h3>
    {hint && <p className="ui-group-hint">{hint}</p>}
    {children}
  </div>
);
