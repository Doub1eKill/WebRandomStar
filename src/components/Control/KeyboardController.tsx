import { useEffect, useRef } from 'react';

interface KeyboardControllerProps {
  onStartOrPause: () => void;
  onProceed: () => void;
  onToggleDrawer: () => void;
  onToggleMute: () => void;
  onToggleTimer?: () => void;
}

export const KeyboardController: React.FC<KeyboardControllerProps> = (props) => {
  // PF6: the parent passes new inline handlers on every render. Keep the latest ones in a ref
  // and attach the window listener once, instead of detaching/re-attaching it on each render.
  const handlersRef = useRef(props);
  handlersRef.current = props;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if typing inside an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      const { onStartOrPause, onProceed, onToggleDrawer, onToggleMute, onToggleTimer } = handlersRef.current;

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
  }, []);

  return null;
};
