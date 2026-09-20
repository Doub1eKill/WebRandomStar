# Task 2: Stage Spin Carousel & Spin Views Text Auto-Adaptation

**Files:**
- Modify: `src/components/Stage/WordSpin/types.ts`
- Modify: `src/components/Stage/WordSpin/WordCarousel.tsx`
- Modify: `src/components/Stage/WordSpin/RibbonSpinView.tsx`
- Modify: `src/components/Stage/WordSpin/VerticalSpinView.tsx`
- Modify: `src/components/Stage/WordSpin/Perspective3DSpinView.tsx`
- Modify: `src/components/Stage/WordSpin/OrbitalSpinView.tsx`
- Modify: `src/index.css`
- Modify: `tests/wordCarouselModes.test.ts`

**Requirements:**
1. Update `src/components/Stage/WordSpin/types.ts` so `SpinViewProps` and `WordCarouselProps` can accept `items?: any[]`, `targetItem?: any | null`, `displayType?: 'keyword' | 'question'`.
2. Update `WordCarousel.tsx` to use `generateSpinReel(items, targetItem)` and resolve display text using `getDisplayText(item)`.
3. Update `RibbonSpinView.tsx`, `VerticalSpinView.tsx`, `Perspective3DSpinView.tsx`, `OrbitalSpinView.tsx` to:
   - Call `getDisplayText(item)` instead of hardcoded `item.word`.
   - Add `.is-question` class to items when `displayType === 'question'` or when text length is long.
4. Update `src/index.css` to ensure question text displays comfortably across all modes:
   - Ribbon: `max-width: 600px`, `white-space: nowrap`, `overflow: hidden`, `text-overflow: ellipsis`, `font-size: clamp(0.95rem, 2vw, 1.35rem)`.
   - Vertical: `max-width: 680px`, `white-space: nowrap`, `overflow: hidden`, `text-overflow: ellipsis`, `font-size: 1.15rem`.
   - 3D & Orbital: `max-width: 500px`, `overflow: hidden`, `text-overflow: ellipsis`, `font-size: 1.1rem`.
5. Update `tests/wordCarouselModes.test.ts` to verify rendering with Question objects.

**Report file:** `.superpowers/sdd/2026-09-20-dynamic-question-spin-reel/task-2-report.md`
