import { useCallback, useLayoutEffect, useRef } from 'react';

/**
 * PF4: ref-driven spin animation.
 * Each view computes an item's look from its distance to the reel position with one pure
 * function. React renders that look whenever the set of visible items changes (the centred
 * word moves to the next integer slot); between those renders WordCarousel calls
 * `apply(offset)` every animation frame, which writes the very same values straight to the
 * DOM. The markup therefore stays identical to a React render at that offset.
 */
export interface SpinItemLook {
  className: string;
  style: {
    transform: string;
    opacity: number;
    color: string;
    zIndex?: number;
  };
  /** Opacity for the decorative ✦ stars inside the item, when the view has them. */
  starOpacity?: number;
}

export type ApplyOffset = (offset: number) => void;
export type RegisterApply = (apply: ApplyOffset | null) => void;

function writeLook(el: HTMLElement, look: SpinItemLook): void {
  if (el.className !== look.className) el.className = look.className;
  el.style.transform = look.style.transform;
  el.style.opacity = String(look.style.opacity);
  el.style.color = look.style.color;
  if (look.style.zIndex !== undefined) el.style.zIndex = String(look.style.zIndex);
  if (look.starOpacity !== undefined) {
    const stars = el.querySelectorAll<HTMLElement>('.word-accent-star');
    stars.forEach(star => { star.style.opacity = String(look.starOpacity); });
  }
}

/**
 * Tracks the rendered item elements by reel index and registers an `apply(offset)` function
 * with the carousel. `lookAt(itemIndex, offset)` must be the same function the view renders with.
 */
export function useSpinItemDom(
  lookAt: (itemIndex: number, offset: number) => SpinItemLook,
  registerApply?: RegisterApply
): (itemIndex: number) => (el: HTMLElement | null) => void {
  const nodes = useRef(new Map<number, HTMLElement>());
  const lookRef = useRef(lookAt);
  lookRef.current = lookAt;

  const apply = useCallback<ApplyOffset>((offset) => {
    nodes.current.forEach((el, itemIndex) => writeLook(el, lookRef.current(itemIndex, offset)));
  }, []);

  useLayoutEffect(() => {
    if (!registerApply) return;
    registerApply(apply);
    return () => registerApply(null);
  }, [registerApply, apply]);

  return useCallback((itemIndex: number) => (el: HTMLElement | null) => {
    if (el) nodes.current.set(itemIndex, el);
    else nodes.current.delete(itemIndex);
  }, []);
}
