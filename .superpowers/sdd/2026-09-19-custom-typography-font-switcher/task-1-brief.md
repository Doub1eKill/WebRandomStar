# Task 1: Data Models & Storage Updates

**Plan File**: `docs/superpowers/plans/2026-09-19-custom-typography-font-switcher.md`

## Requirements
1. In `src/types/appearance.ts`:
   - Define and export `FontPresetId`: `'cinzel' | 'amoria' | 'verve' | 'outfit' | 'custom'`
   - Define and export `CustomFontConfig`:
     ```typescript
     export interface CustomFontConfig {
       name: string;
       fontFamily: string;
       googleFontUrl?: string;
     }
     ```
   - Add `fontPreset: FontPresetId` to `AppearanceSettings`
   - Add `customFont?: CustomFontConfig` to `AppearanceSettings`
   - Set `fontPreset: 'cinzel'` in `DEFAULT_APPEARANCE_SETTINGS`

2. In `src/utils/storage.ts`:
   - Ensure `loadAppearanceSettings()` safely hydrates `fontPreset` and defaults to `'cinzel'` if missing.

3. Write test `tests/appearanceTypography.test.ts` to verify data model & storage roundtrip.
4. Run test: `npx vitest run tests/appearanceTypography.test.ts`
5. Commit changes: `git add src/types/appearance.ts src/utils/storage.ts tests/appearanceTypography.test.ts` and commit.
