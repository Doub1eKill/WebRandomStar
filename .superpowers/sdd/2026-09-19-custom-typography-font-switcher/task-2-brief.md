# Task 2: Typography Engine & Dynamic Font Injection

**Plan File**: `docs/superpowers/plans/2026-09-19-custom-typography-font-switcher.md`

## Requirements
1. Create `src/utils/typography.ts`:
   - `FontPresetOption` interface:
     - `id: FontPresetId`
     - `name: string`
     - `subtitle: string`
     - `author: string`
     - `styleTag: string`
     - `fontFamily: string`
     - `previewText: string`
     - `description: string`
   - `FONT_PRESETS`: Map of `cinzel`, `amoria`, `verve`, `outfit` presets with rich styling and descriptions.
   - `resolveFontFamily(preset?: FontPresetId, custom?: CustomFontConfig): string`:
     - Ensures every preset is appended with `Prompt` fallback.
   - `applyTypography(settings?: Partial<AppearanceSettings>): void`:
     - Sets `--font-display` and `--font-serif` on `document.documentElement`
     - Dynamically manages `<link id="dynamic-google-font">` tag in `document.head` if `preset === 'custom'` and `customFont.googleFontUrl` is set.
2. In `src/index.css`:
   - Add `@font-face` definitions for `Amoria` and `Verve` with clean SVG/data/webfont fallbacks, ensuring they are readily available to the browser.
3. Write tests in `tests/typographyEngine.test.ts`.
4. Run tests and verify they pass.
5. Commit changes.
