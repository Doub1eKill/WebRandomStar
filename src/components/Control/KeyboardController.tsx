import { useEffect } from 'react';

interface KeyboardControllerProps {
  onStartOrPause: () => void;
  onProceed: () => void;
  onToggleDrawer: () => void;
  onToggleMute: () => void;
  onToggleTimer?: () => void;
}

export const KeyboardController: React.FC<KeyboardControllerProps> = ({
  onStartOrPause,
  onProceed,
  onToggleDrawer,
  onToggleMute,
  onToggleTimer
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if typing inside an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          onStartOrPause();
          break;

        case 'Enter':
          e.preventDefault();
          onProceed();
          break;

        case 'Escape':
          e.preventDefault();
          onToggleDrawer();
          break;

        case 'KeyM':
          onToggleMute();
          break;

        case 'KeyT':
          if (onToggleTimer) {
            e.preventDefault();
            onToggleTimer();
          }
          break;

        case 'KeyF':
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onStartOrPause, onProceed, onToggleDrawer, onToggleMute, onToggleTimer]);

  return null;
};
