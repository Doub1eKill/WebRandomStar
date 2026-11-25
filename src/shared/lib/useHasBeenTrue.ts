import { useState } from 'react';

/**
 * Becomes true the first time `value` is true and stays true (PF3).
 * Used to lazy-load a panel on first open while keeping it mounted afterwards,
 * so its internal state survives closing and reopening exactly as before.
 */
export function useHasBeenTrue(value: boolean): boolean {
  const [hasBeenTrue, setHasBeenTrue] = useState(value);
  if (value && !hasBeenTrue) {
    setHasBeenTrue(true);
  }
  return hasBeenTrue || value;
}
