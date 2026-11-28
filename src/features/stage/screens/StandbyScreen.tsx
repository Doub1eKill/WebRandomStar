import React from 'react';
import { STANDBY_IMAGE_URL } from '@/data/standbyImage.ts';
import { useFadePresence } from './useFadePresence.ts';
import { screenImageWidth, useDownscaledImage } from './downscaledImage.ts';

/** The blurred edge fill needs very little detail. */
export const STANDBY_FILL_WIDTH = 480;

/**
 * Standby screen: the event's key visual (`MainBlackground/`), for before the draw and any time
 * the spin is not in use. The image is shown whole; a blurred copy fills the edges on screens
 * that are not 16:9. Without the image (a build without the folder) the event title is shown
 * over the animated stage background.
 */
export const StandbyScreen: React.FC<{ active: boolean; imageUrl?: string }> = ({ active, imageUrl = STANDBY_IMAGE_URL }) => {
  const { mounted, leaving } = useFadePresence(active);
  // Screen-sized copies (made when the stage starts), so the switch never waits on a decode.
  const mainUrl = useDownscaledImage(imageUrl, screenImageWidth());
  const fillUrl = useDownscaledImage(imageUrl, STANDBY_FILL_WIDTH);
  if (!mounted) return null;

  return (
    <div
      className={`stage-screen standby-screen${leaving ? ' is-leaving' : ''}`}
      data-testid="standby-screen"
      aria-hidden={leaving || undefined}
    >
      {imageUrl ? (
        <>
          <img className="standby-fill" src={fillUrl} alt="" aria-hidden="true" draggable={false} decoding="async" />
          <img
            className="standby-image"
            src={mainUrl}
            alt="SCI TECH THE CHARM OF TRANSITION Ambassador 2026"
            draggable={false}
            decoding="async"
          />
          <div className="standby-sheen" aria-hidden="true" />
          <div className="standby-vignette" aria-hidden="true" />
        </>
      ) : (
        <div className="standby-fallback">
          <div className="standby-fallback-eyebrow">SCI TECH</div>
          <div className="standby-fallback-title">The Charm of Transition</div>
          <div className="standby-fallback-sub">Ambassador 2026</div>
        </div>
      )}
    </div>
  );
};
