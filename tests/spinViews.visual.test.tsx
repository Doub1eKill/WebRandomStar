/**
 * Visual-equivalence guard for the spin views (Phase 1 PF4).
 * The snapshots were recorded from the pre-refactor implementation; the ref-driven
 * version must render byte-identical markup for the same offset.
 */
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { DEFAULT_WORDS } from '../src/data/defaultWords.ts';
import { VerticalSpinView } from '../src/components/Stage/WordSpin/VerticalSpinView.tsx';
import { Perspective3DSpinView } from '../src/components/Stage/WordSpin/Perspective3DSpinView.tsx';
import { OrbitalSpinView } from '../src/components/Stage/WordSpin/OrbitalSpinView.tsx';
import { RibbonSpinView } from '../src/components/Stage/WordSpin/RibbonSpinView.tsx';
import { SpinViewProps } from '../src/components/Stage/WordSpin/types.ts';

const reel = DEFAULT_WORDS.slice(0, 12);
const views = { vertical: VerticalSpinView, '3d': Perspective3DSpinView, orbital: OrbitalSpinView, ribbon: RibbonSpinView };
const offsets = [0, 0.3, 2.49, 2.51, 7.75, 35.2];

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
        expect(html.join('\n')).toMatchSnapshot();
      });
    }
  }
});
