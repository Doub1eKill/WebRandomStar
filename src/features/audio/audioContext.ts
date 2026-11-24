/**
 * PF9: one AudioContext for the whole page. The procedural sound engine and the music player
 * used to create one each; browsers limit how many can exist and each costs an audio thread.
 * Every engine still connects its own master GainNode, so the mix is unchanged.
 */
let shared: AudioContext | null = null;

export function getSharedAudioContext(): AudioContext | null {
  if (shared) return shared;
  if (typeof window === 'undefined') return null;
  const AudioContextClass =
    window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  try {
    shared = new AudioContextClass();
  } catch {
    return null; // AudioContext unavailable or restricted
  }
  return shared;
}

/** Test helper: forget the shared context so the next call creates a new one. */
export function resetSharedAudioContextForTests(): void {
  shared = null;
}
