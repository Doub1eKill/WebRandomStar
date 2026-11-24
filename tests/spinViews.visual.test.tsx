/**
 * Visual-equivalence guard for the spin views (Phase 1 PF4).
 * The snapshots were recorded from the pre-refactor implementation; the ref-driven
 * version must render byte-identical markup for the same offset.
 */
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { DEFAULT_WORDS } from '@/data/defaultWords.ts';
import { VerticalSpinView } from '@/features/stage/word-spin/VerticalSpinView.tsx';
import { Perspective3DSpinView } from '@/features/stage/word-spin/Perspective3DSpinView.tsx';
import { OrbitalSpinView } from '@/features/stage/word-spin/OrbitalSpinView.tsx';
import { RibbonSpinView } from '@/features/stage/word-spin/RibbonSpinView.tsx';
import { SpinViewProps } from '@/features/stage/word-spin/types.ts';

const reel = DEFAULT_WORDS.slice(0, 12);
const views = { vertical: VerticalSpinView, '3d': Perspective3DSpinView, orbital: OrbitalSpinView, ribbon: RibbonSpinView };
const offsets = [0, 0.3, 2.49, 2.51, 7.75, 35.2];

/**
 * Round every decimal number to 10 significant digits. Math.pow can differ in the last bit
 * between V8 versions (e.g. Node 22 on CI vs Node 24 locally: 0.6446169896096 vs
 * 0.6446169896096001), which is irrelevant to the markup this test guards.
 */
const normalizeNumbers = (html: string) =>
  html.replace(/-?\d+\.\d+(?:e-?\d+)?/g, n => String(Number(Number(n).toPrecision(10))));

describe('spin views render identically for a given offset', () => {
  for (const [mode, View] of Object.entries(views)) {
    for (const displayType of ['keyword', 'question'] as const) {
      it(`${mode} / ${displayType}`, () => {
        const html = offsets.map(offset => {
          const props: SpinViewProps = {
            reel,
            currentIndex: ((Math.round(offset) % reel.length) + reel.length) % reel.length,
            targetWord: reel[0],
            phase: 'word-spin',
            floatOffset: offset,
            displayType
          };
          return `@${offset}\n${renderToString(<View {...props} />)}`;
        });
        expect(normalizeNumbers(html.join('\n'))).toMatchSnapshot();
      });
    }
  }
});
