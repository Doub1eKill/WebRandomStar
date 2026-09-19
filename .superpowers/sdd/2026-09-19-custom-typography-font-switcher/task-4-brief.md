# Task 4: Backstage Control Center (AppearanceSettings Panel UI)

**Plan File**: `docs/superpowers/plans/2026-09-19-custom-typography-font-switcher.md`

## Requirements
1. In `src/components/Control/AppearanceSettings.tsx`:
   - Import `FONT_PRESETS` from `../../utils/typography.ts`.
   - Add a dedicated **รูปแบบตัวอักษรและฟอนต์ (Typography & Font Selection)** section.
   - Render 4 curated font preset cards (`cinzel`, `amoria`, `verve`, `outfit`) with:
     - Preset name & subtitle
     - Author & style tag badges (e.g. *Modern Luxury by Fandi Kurniawan*, *Classic Heritage by Dieter Steffmann*, *Royal Standard*)
     - Live preview typography sample containing English and Thai text (e.g., `CHARM OF TRANSITION 2026 — มนต์เสน่ห์แห่งรอยต่อฤดู`) with font-family inline style reflecting each preset.
     - Active indicator state.
   - Render a **Custom WebFont Drawer/Form** button and form:
     - Custom font option card.
     - Inputs for Font Display Name, CSS Font Family, and Google Fonts Embed URL.
     - "บันทึกฟอนต์กำหนดเอง (Save Custom Font)" button.
2. In `src/index.css`:
   - Add styling for font preset cards, badges, preview text, and custom font drawer.
3. Write UI test `tests/appearancePanel.test.tsx`.
4. Run tests and verify they pass.
5. Commit changes.
