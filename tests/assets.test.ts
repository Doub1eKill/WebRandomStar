// @vitest-environment node
/**
 * B12 / PF10: every asset the page asks for exists locally, so the stage has no 404s and
 * works with no internet (Phase 11 acceptance found B12 had no regression test).
 */
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const root = join(__dirname, '..');
const read = (path: string) => readFileSync(join(root, path), 'utf8');
const require = createRequire(join(root, 'package.json'));

function cssFiles(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return cssFiles(path);
    return path.endsWith('.css') ? [path] : [];
  });
}

describe('B12: local assets', () => {
  it('every icon index.html links to is in public/', () => {
    const icons = [...read('index.html').matchAll(/<link[^>]*rel="icon"[^>]*href="\/([^"]+)"/g)].map(m => m[1]);
    expect(icons).toEqual(['leaf.svg']);
    for (const icon of icons) expect(existsSync(join(root, 'public', icon))).toBe(true);
  });

  it('index.html loads no external stylesheet or font', () => {
    expect(read('index.html')).not.toMatch(/<link[^>]+href="https?:/);
  });

  it('every @fontsource import in fonts.css resolves to an installed file', () => {
    const imports = [...read('src/shared/styles/fonts.css').matchAll(/@import '([^']+)'/g)].map(m => m[1]);
    expect(imports.length).toBeGreaterThan(0);
    for (const spec of imports) expect(() => require.resolve(spec), spec).not.toThrow();
  });

  it('no stylesheet in src points at a /fonts/ file that public/ does not have', () => {
    const missing = cssFiles(join(root, 'src')).flatMap(file =>
      [...readFileSync(file, 'utf8').matchAll(/url\(['"]?\/fonts\/([^'")]+)/g)]
        .map(m => m[1])
        .filter(font => !existsSync(join(root, 'public', 'fonts', font)))
    );
    expect(missing).toEqual([]);
  });
});
