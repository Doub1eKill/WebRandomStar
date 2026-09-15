# Stage Background Switcher Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow backstage operators to choose between the Cosmic Canvas stage background and the new AeroShards React Bits glass sculpture background in real-time, matching the Cosmic Diamond theme.

**Architecture:** Install `vgpu`. Add `BackgroundMode` type to `appearance.ts`. Create `AeroShards.tsx` & `AeroShards.css` in `src/components/Stage/Background/`. Create `StageBackgroundContainer.tsx` that switches between `StageCanvas` and `AeroShards` (with graceful fallback). Add Stage Background Mode selector card UI to `AppearanceSettings.tsx`.

**Tech Stack:** React 19, TypeScript, `vgpu` (WebGPU), Vitest, Vite.

## Global Constraints
- Preserve full theme colors (`#060919`, `#C084FC`, `#38BDF8`).
- Include fallback to `StageCanvas` if WebGPU is unsupported.
- Maintain 100% test pass rate on all Vitest suites and TypeScript build checks.

---

### Task 1: Install `vgpu` dependency & update `src/types/appearance.ts`

**Files:**
- Modify: `package.json`
- Modify: `src/types/appearance.ts`

- [ ] **Step 1: Install `vgpu`**

Run: `npm install vgpu`

- [ ] **Step 2: Update `src/types/appearance.ts`**

Add `BackgroundMode`:
```typescript
export type BackgroundMode = 'cosmic-canvas' | 'aero-shards';

export interface AppearanceSettings {
  backgroundMode?: BackgroundMode;
  ...
}

export const DEFAULT_APPEARANCE_SETTINGS: AppearanceSettings = {
  backgroundMode: 'cosmic-canvas',
  ...
};
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json src/types/appearance.ts
git commit -m "feat(types): add backgroundMode to appearance settings and install vgpu"
```

---

### Task 2: Create `AeroShards` component & `StageBackground` container

**Files:**
- Create: `src/components/Stage/Background/AeroShards.tsx`
- Create: `src/components/Stage/Background/AeroShards.css`
- Create: `src/components/Stage/StageBackground.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `src/components/Stage/Background/AeroShards.tsx` and `AeroShards.css`**
  - Implement `<AeroShards />` with WebGPU render graph and customizable props.

- [ ] **Step 2: Create `src/components/Stage/StageBackground.tsx`**
  - Render `<AeroShards />` with theme colors (`#060919`, `#C084FC`, `#38BDF8`) when `session.appearanceSettings?.backgroundMode === 'aero-shards'`.
  - Fallback to `<StageCanvas />` on WebGPU error or when `cosmic-canvas` is active.

- [ ] **Step 3: Update `src/App.tsx`**
  - Replace direct `<StageCanvas session={session} />` with `<StageBackground session={session} />`.

- [ ] **Step 4: Commit**

```bash
git add src/components/Stage/Background/ src/components/Stage/StageBackground.tsx src/App.tsx
git commit -m "feat(stage): create AeroShards component and StageBackground container"
```

---

### Task 3: Add Stage Background selection UI in `AppearanceSettings.tsx` & update `useStageSync.ts` if needed

**Files:**
- Modify: `src/components/Control/AppearanceSettings.tsx`

- [ ] **Step 1: Add Background Selector cards in `AppearanceSettings.tsx`**
  - Card 1: `🌌 Cosmic Canvas Stage (พื้นหลังมาตรฐาน Canvas 2D)`
  - Card 2: `💎 AeroShards Glass Sculpture (พื้นหลังใหม่ React Bits 3D)`
  - Wire click handlers to `updateSetting('backgroundMode', 'cosmic-canvas' | 'aero-shards')`.

- [ ] **Step 2: Commit**

```bash
git add src/components/Control/AppearanceSettings.tsx
git commit -m "feat(control): add stage background selector cards in appearance settings"
```

---

### Task 4: Full Verification & Walkthrough

- [ ] **Step 1: Run Vitest test suite (`npm test -- --run`)**
- [ ] **Step 2: Run TypeScript build (`npm run build`)**
- [ ] **Step 3: Update walkthrough and progress ledger**
