# Season Transition Question Web App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** สร้างเว็บแอปพลิเคชันสุ่มคำถามสำหรับกิจกรรมดาว–เดือน (Season Transition Question: รอยต่อฤดู — ปลายฝนต้นหนาว) โดยใช้ปรากฏการณ์ธรรมชาติ (ฝน, หยดน้ำ, หมอก, ลม, ใบไม้, ฟ้าเปิด, กลุ่มดาว, ดาวตก) เป็นกลไกการสุ่มและนำเสนอคำถามอย่างสง่างาม ลื่นไหล 60 FPS ด้วย Canvas 2D, React, TypeScript และ Web Audio API

**Architecture:** 
- **Core State & Random Engine**: Seeded PRNG (`Mulberry32`) คำนวณเวกเตอร์ลม/ใบไม้ กำหนดหมวด และสร้างพิกัดกลุ่มดาวพร้อมคำนวณวิถีดาวตกตัดผ่าน Node คำถามจริงอย่างแม่นยำ
- **Visual & Audio Layer**: Canvas 2D Viewport เรนเดอร์อนุภาคธรรมชาติแบบ 60 FPS + Web Audio API สังเคราะห์เสียงบรรยากาศแบบ Procedural
- **Stage & Control Layer**: React UI Overlay พร้อมการ์ดคำถาม Glassmorphism สวยงาม และระบบ Control Panel แบบไฮบริด (Drawer บนจอเดียว + Pop-up Controller แยกสองจอผ่าน `BroadcastChannel`)

**Tech Stack:** Vite, React 19, TypeScript, Canvas 2D, Web Audio API, Vitest, Lucide React (or SVG icons), BroadcastChannel API

## Global Constraints

- ห้ามใช้ Slot machine, วงล้อหมุน (Wheel), หรือกล่องสุ่ม (Loot box/Mystery box)
- การสุ่มต้องเกิดจากเหตุการณ์ธรรมชาติจริงตามลำดับ: `rain → water-drop → mist → wind → leaf → sky-opening → constellation → meteor → question`
- ดาวตกต้องมีวิถีพุ่งตัดผ่าน Candidate Node ที่ถูกเลือกจริง
- ห้ามใช้ `Math.random()` กระจายใน UI Components ให้รวมอยู่ที่ Seeded PRNG Engine
- ไม่ใช้ไลบรารีแอนิเมชันขนาดใหญ่ (เช่น GSAP/Framer Motion) เพื่อประสิทธิภาพ 60 FPS บนจอโปรเจกเตอร์
- รองรับ Offline 100% โดยใช้ Web Audio API procedural synthesis

---

### Task 1: Scaffolding Vite + React + TypeScript + Vitest

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`
- Test: `tests/setup.test.ts`

**Interfaces:**
- Consumes: Node.js, npm
- Produces: Working dev server, Vitest test runner, base CSS design tokens (deep night blue, warm mist, starlight gold, glassmorphism)

- [ ] **Step 1: Create Vite project structure and configuration**
  Create `package.json` with dependencies: `react`, `react-dom`, `lucide-react`, and devDependencies: `vite`, `typescript`, `@types/react`, `@types/react-dom`, `@vitejs/plugin-react`, `vitest`.
- [ ] **Step 2: Configure Vite and TypeScript**
  Configure `vite.config.ts` with React plugin and test environment (`vitest/config`), configure `tsconfig.json`.
- [ ] **Step 3: Setup base index.css with theme tokens**
  Define HSL color tokens for end-of-rain sky (`--sky-deep: #0b1329`, `--mist-tint: #40516b`, `--star-gold: #fde047`, `--leaf-amber: #d97706`), typography, and full-screen stage styles.
- [ ] **Step 4: Create setup test to verify Vitest**
  Write `tests/setup.test.ts` to assert environment works.
- [ ] **Step 5: Run npm install and run tests**
  Execute `npm install` and `npx vitest run`.
- [ ] **Step 6: Commit**
  `git add . ; git commit -m "feat: scaffold project with vite, react, typescript, and vitest"`

---

### Task 2: Data Models & Default Thai Question Bank + Contestants

**Files:**
- Create: `src/types/question.ts`
- Create: `src/types/session.ts`
- Create: `src/data/defaultQuestions.ts`
- Create: `src/data/defaultContestants.ts`
- Test: `tests/data.test.ts`

**Interfaces:**
- Consumes: Type definitions
- Produces: `Question`, `Contestant`, `SessionState`, `DEFAULT_QUESTIONS` (40+ Thai questions across 7 categories), `DEFAULT_CONTESTANTS`

- [ ] **Step 1: Write test for question data integrity**
  In `tests/data.test.ts`: test that `DEFAULT_QUESTIONS` contains at least 35 questions, covers all 7 categories (`rain`, `mist`, `wind`, `leaf`, `moon`, `star`, `final`), and has no duplicate IDs.
- [ ] **Step 2: Run test to verify failure**
  Run `npx vitest run tests/data.test.ts` (Expected: FAIL).
- [ ] **Step 3: Implement types and data models**
  Define `QuestionCategory`, `Question`, `Contestant`, `SessionState`, and `AppState` in `src/types/`.
- [ ] **Step 4: Implement DEFAULT_QUESTIONS and DEFAULT_CONTESTANTS**
  Create 42 tailored Thai pageant questions across the 7 categories and 10 default contestant entries in `src/data/`.
- [ ] **Step 5: Run tests to verify pass**
  Run `npx vitest run tests/data.test.ts` (Expected: PASS).
- [ ] **Step 6: Commit**
  `git add src/ types/ data/ tests/ ; git commit -m "feat: add data models, default thai question bank and contestants"`

---

### Task 3: Seeded PRNG Engine & Question Selector

**Files:**
- Create: `src/engine/prng.ts`
- Create: `src/engine/questionSelector.ts`
- Test: `tests/prng.test.ts`
- Test: `tests/questionSelector.test.ts`

**Interfaces:**
- Consumes: `Question`, `QuestionCategory`
- Produces:
  - `createPRNG(seed: string | number): () => number`
  - `selectCategoryFromLeafPosition(x: number, y: number, width: number, height: number): QuestionCategory`
  - `generateConstellationNodes(candidates: Question[], width: number, height: number, prng: () => number): StarNode[]`
  - `calculateMeteorTrajectory(targetNode: StarNode, width: number, height: number, prng: () => number): MeteorTrajectory`
  - `selectQuestionFlow(questions: Question[], usedIds: string[], seed: string, viewport: { width: number, height: number }): QuestionSelectionResult`

- [ ] **Step 1: Write unit tests for PRNG and Question Selector**
  Write tests in `tests/prng.test.ts` ensuring deterministic float sequences from the same seed.
  Write tests in `tests/questionSelector.test.ts` validating category mapping, duplicate avoidance, and meteor trajectory passing through the selected node.
- [ ] **Step 2: Run tests to verify failure**
  Run `npx vitest run tests/prng.test.ts tests/questionSelector.test.ts` (Expected: FAIL).
- [ ] **Step 3: Implement Mulberry32 PRNG in src/engine/prng.ts**
  Implement seeded PRNG utility with helpers: `randomRange(min, max)`, `randomChoice(array)`.
- [ ] **Step 4: Implement selection algorithm in src/engine/questionSelector.ts**
  Implement leaf landing position-to-category resolution, candidate star node generation, and target meteor trajectory line collision.
- [ ] **Step 5: Run tests to verify pass**
  Run `npx vitest run tests/prng.test.ts tests/questionSelector.test.ts` (Expected: PASS).
- [ ] **Step 6: Commit**
  `git add src/engine/ tests/ ; git commit -m "feat: implement seeded prng and question selector engine with trajectory math"`

---

### Task 4: State Machine & Multi-Window Sync (BroadcastChannel)

**Files:**
- Create: `src/engine/stateMachine.ts`
- Create: `src/hooks/useStageSync.ts`
- Test: `tests/stateMachine.test.ts`

**Interfaces:**
- Consumes: `AppState`, `SessionState`
- Produces:
  - `getNextState(currentState: AppState): AppState`
  - `useStageSync(role: 'stage' | 'controller')`: bidirectional synchronization via `BroadcastChannel` with `localStorage` persistence fallback.

- [ ] **Step 1: Write test for State Machine transitions**
  Test sequential progression: `idle → rain → water-drop → mist → wind → leaf → sky-opening → constellation → meteor → question → answered → idle`, and skip/reset behaviors.
- [ ] **Step 2: Run test to verify failure**
  Run `npx vitest run tests/stateMachine.test.ts` (Expected: FAIL).
- [ ] **Step 3: Implement State Machine in src/engine/stateMachine.ts**
  Implement transitions, validation guards against multiple simultaneous triggers, and skip/reset actions.
- [ ] **Step 4: Implement useStageSync hook in src/hooks/useStageSync.ts**
  Support cross-tab communication for stage projector display and remote controller window.
- [ ] **Step 5: Run tests to verify pass**
  Run `npx vitest run tests/stateMachine.test.ts` (Expected: PASS).
- [ ] **Step 6: Commit**
  `git add src/engine/stateMachine.ts src/hooks/ tests/ ; git commit -m "feat: implement stage state machine and broadcastchannel synchronization"`

---

### Task 5: Web Audio API Procedural Synthesizer

**Files:**
- Create: `src/engine/audioEngine.ts`
- Test: `tests/audioEngine.test.ts`

**Interfaces:**
- Consumes: AudioContext
- Produces:
  - `audioEngine.init()`
  - `audioEngine.playRainAmbience(fadeDuration: number)`
  - `audioEngine.fadeRainOut(fadeDuration: number)`
  - `audioEngine.playWaterDrop()`
  - `audioEngine.playWindGust()`
  - `audioEngine.playLeafRustle()`
  - `audioEngine.playStarChime()`
  - `audioEngine.playMeteorWhoosh()`
  - `audioEngine.playQuestionReveal()`
  - `audioEngine.setVolume(vol: number)`
  - `audioEngine.setMuted(muted: boolean)`

- [ ] **Step 1: Write mock test for audioEngine lifecycle**
  Test volume clamping, mute toggling, and clean state handling in `tests/audioEngine.test.ts`.
- [ ] **Step 2: Run test to verify failure**
  Run `npx vitest run tests/audioEngine.test.ts` (Expected: FAIL).
- [ ] **Step 3: Implement procedural audio synthesizer in src/engine/audioEngine.ts**
  Use Pink/White noise buffers + Biquad filters for rain/wind, oscillator sines + envelope generators for drops, chimes, and question reveal fanfare.
- [ ] **Step 4: Run test to verify pass**
  Run `npx vitest run tests/audioEngine.test.ts` (Expected: PASS).
- [ ] **Step 5: Commit**
  `git add src/engine/audioEngine.ts tests/audioEngine.test.ts ; git commit -m "feat: implement procedural web audio engine"`

---

### Task 6: Canvas 2D Natural Physics Engine — Rain, Droplets, Mist, Wind, and Leaves

**Files:**
- Create: `src/components/Stage/canvas/particleTypes.ts`
- Create: `src/components/Stage/canvas/RainSystem.ts`
- Create: `src/components/Stage/canvas/WaterDropSystem.ts`
- Create: `src/components/Stage/canvas/MistSystem.ts`
- Create: `src/components/Stage/canvas/LeafSystem.ts`
- Create: `src/components/Stage/StageCanvas.tsx`

**Interfaces:**
- Consumes: `AppState`, `WindState`, Canvas 2D context
- Produces: Smooth 60 FPS visual rendering of the first 5 transition stages

- [ ] **Step 1: Implement particle structures and physics utilities**
  In `src/components/Stage/canvas/particleTypes.ts`: Define `RainDrop`, `Droplet`, `MistLayer`, `LeafParticle`.
- [ ] **Step 2: Implement RainSystem and WaterDropSystem**
  Simulate angled falling rain drops fading on transition, and surface bead droplets rolling down glass.
- [ ] **Step 3: Implement MistSystem and LeafSystem**
  Simulate layered atmospheric fog drifting smoothly across screen, and golden autumn leaves tumbling under wind vectors.
- [ ] **Step 4: Integrate StageCanvas container component**
  Setup `requestAnimationFrame` loop, pixel ratio handling for crisp projection screens, and stage cleanup on unmount.
- [ ] **Step 5: Verify rendering in dev server**
  Run dev server and test visual stages.
- [ ] **Step 6: Commit**
  `git add src/components/Stage/ ; git commit -m "feat: implement canvas 2d rain, drop, mist, wind, and leaf physics"`

---

### Task 7: Canvas 2D Sky Opening, Moon, Constellation Nodes & Meteor Trajectory

**Files:**
- Create: `src/components/Stage/canvas/SkySystem.ts`
- Create: `src/components/Stage/canvas/ConstellationSystem.ts`
- Create: `src/components/Stage/canvas/MeteorSystem.ts`
- Modify: `src/components/Stage/StageCanvas.tsx`

**Interfaces:**
- Consumes: `StarNode[]`, `MeteorTrajectory`, `AppState`
- Produces: Celestial transition stages: Night sky opening, glowing moon, connected candidate star nodes, and meteor strike animation with particle explosion

- [ ] **Step 1: Implement SkySystem**
  Render deep night sky clearing transition, background twinkling star field, and a softly glowing crescent/full moon.
- [ ] **Step 2: Implement ConstellationSystem**
  Render glowing star nodes with pulse aura, draw luminous connecting constellation lines, and display subtle candidate identifiers.
- [ ] **Step 3: Implement MeteorSystem**
  Render blazing meteor streak following calculated trajectory directly into the winning node, followed by stardust explosion particle burst.
- [ ] **Step 4: Wire all systems into StageCanvas render loop**
  Synchronize stage transitions with state machine triggers.
- [ ] **Step 5: Verify 60 FPS animation sequence**
  Confirm collision between meteor and winning candidate node.
- [ ] **Step 6: Commit**
  `git add src/components/Stage/ ; git commit -m "feat: implement sky opening, constellation nodes, and meteor trajectory strike"`

---

### Task 8: Stage Overlay UI & Majestic Question Reveal Card

**Files:**
- Create: `src/components/Stage/StageOverlay.tsx`
- Create: `src/components/Stage/QuestionCard.tsx`
- Create: `src/components/Stage/ContestantBadge.tsx`
- Create: `src/components/Stage/StageHeader.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `SessionState`, `selectedQuestion`, `selectedContestant`
- Produces: Full-screen TV/Stage presentation layout with glassmorphic cards, large legible Thai typography, category badges, and smooth reveal animations.

- [ ] **Step 1: Implement StageHeader & ContestantBadge**
  Display event title ("รอยต่อฤดู — Season Transition Question"), round indicator, contestant number, name, and faculty badge.
- [ ] **Step 2: Implement QuestionCard with smooth reveal**
  Render glassmorphic card with category icon & Thai title, question text in prominent readable font size (28-36px), difficulty tags, and gentle floating aura.
- [ ] **Step 3: Implement StageOverlay layout**
  Position elements gracefully without blocking Canvas natural animations.
- [ ] **Step 4: Commit**
  `git add src/components/Stage/ src/index.css ; git commit -m "feat: implement stage overlay and glassmorphic question reveal card"`

---

### Task 9: Integrated Control Drawer & Remote Window Controller

**Files:**
- Create: `src/components/Control/ControlDrawer.tsx`
- Create: `src/components/Control/RemoteController.tsx`
- Create: `src/components/Control/KeyboardController.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `useStageSync`, `SessionState`
- Produces:
  - In-stage collapsible control drawer (toggle with `Esc` or discreet trigger)
  - Standalone pop-up controller window (`/controller` route or query param `?mode=controller`)
  - Global keyboard listener (`Space` = Start/Pause, `Enter` = Next, `Esc` = Drawer, `KeyM` = Mute)

- [ ] **Step 1: Implement KeyboardController**
  Listen for keyboard events with debounce and guard against re-triggers during active animations.
- [ ] **Step 2: Implement ControlDrawer component**
  Build operator controls: contestant selection, round selection, Start/Pause/Skip/Reset buttons, seed display/input, audio volume slider, and "Open Remote Window" button.
- [ ] **Step 3: Implement RemoteController page**
  Build full dedicated operator dashboard for second-monitor laptop control syncing with the stage display in real-time.
- [ ] **Step 4: Connect routing in App.tsx**
  Support dual mode (`/` for stage, `?mode=controller` for remote controller window).
- [ ] **Step 5: Commit**
  `git add src/components/Control/ src/App.tsx ; git commit -m "feat: implement hybrid control drawer and remote window controller"`

---

### Task 10: Question & Contestant Bank Manager (CRUD & JSON Import/Export)

**Files:**
- Create: `src/components/Control/QuestionManagerModal.tsx`
- Create: `src/components/Control/ContestantManagerModal.tsx`
- Create: `src/utils/storage.ts`
- Test: `tests/storage.test.ts`

**Interfaces:**
- Consumes: `Question[]`, `Contestant[]`
- Produces: In-browser CRUD modals, LocalStorage synchronization, JSON export and file upload import.

- [ ] **Step 1: Write test for storage utilities**
  Test LocalStorage read, write, JSON export stringification, and import validation in `tests/storage.test.ts`.
- [ ] **Step 2: Run test to verify failure**
  Run `npx vitest run tests/storage.test.ts` (Expected: FAIL).
- [ ] **Step 3: Implement storage utilities in src/utils/storage.ts**
  Safely store questions, contestants, used IDs, and settings.
- [ ] **Step 4: Implement QuestionManagerModal & ContestantManagerModal**
  Create rich tables to search, filter by category/round, add questions, edit text, toggle enabled state, delete, and import/export JSON.
- [ ] **Step 5: Run test to verify pass**
  Run `npx vitest run tests/storage.test.ts` (Expected: PASS).
- [ ] **Step 6: Commit**
  `git add src/components/Control/ src/utils/ tests/ ; git commit -m "feat: implement question and contestant bank manager with json import/export"`

---

### Task 11: End-to-End Verification, Performance Polish & Production Build

**Files:**
- Create: `tests/e2e.test.ts`
- Modify: `README.md`
- Verify: Full test suite, TypeScript check (`tsc --noEmit`), Vite production build (`npm run build`)

- [ ] **Step 1: Write comprehensive integration test**
  In `tests/e2e.test.ts`: verify full multi-stage journey from Start → Leaf/Wind → Constellation → Meteor → Question Reveal with seed reproducibility.
- [ ] **Step 2: Run all tests**
  Run `npx vitest run` and ensure 100% pass rate.
- [ ] **Step 3: Check TypeScript compilation**
  Run `npx tsc --noEmit` and ensure 0 errors.
- [ ] **Step 4: Run Vite production build**
  Run `npm run build` and ensure `dist/` is successfully created.
- [ ] **Step 5: Review against Definition of Done**
  Verify every item from Section 30 of the project specification.
- [ ] **Step 6: Commit**
  `git add . ; git commit -m "feat: complete end-to-end verification, documentation and production build"`
