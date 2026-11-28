import { useEffect, useState } from 'react';

/** How long a screen takes to fade out (matches `.stage-screen.is-leaving` in stageScreens.css). */
export const SCREEN_FADE_MS = 700;

/**
 * Keep a screen mounted while it fades out. Returns `mounted` (render it at all) and `leaving`
 * (it is on its way out; add the fade-out class).
 */
export function useFadePresence(active: boolean, fadeMs: number = SCREEN_FADE_MS): { mounted: boolean; leaving: boolean } {
  const [lingering, setLingering] = useState(false);
  const [wasActive, setWasActive] = useState(active);

  // Adjust state while rendering when `active` flips (React's documented pattern, no extra pass).
  if (wasActive !== active) {
    setWasActive(active);
    setLingering(!active);
  }

  useEffect(() => {
    if (!lingering) return;
    const timer = setTimeout(() => setLingering(false), fadeMs);
    return () => clearTimeout(timer);
  }, [lingering, fadeMs]);

  return { mounted: active || lingering, leaving: !active && lingering };
}
