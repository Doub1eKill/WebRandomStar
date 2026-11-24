import React, { useState } from 'react';
import { HashRouter } from 'react-router';
import { AppRoutes, redirectLegacyControllerUrl } from './app/router.tsx';

/** App root (Phase 5): hash routes for the stage (#/) and the remote control pages (#/control/...). */
export const App: React.FC = () => {
  // Rewrite the old `?mode=controller` link once, before the router reads the URL.
  useState(() => redirectLegacyControllerUrl());
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  );
};

export default App;
