# Cinematic Transitions, Storytelling Narrator, and Visual Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ยกระดับความเข้าใจ (UX Clarity) และความนุ่มนวลของแอนิเมชัน (Smooth Transitions) ในเว็บสุ่มคำถาม "รอยต่อฤดู" ด้วยคำบรรยายกวี Cinematic Storytelling, ป้ายประกาศหมวดหมู่ชัดเจน, แถบเส้นทางฤดูกาล, Canvas LERP Cross-fades, และ Shockwave ดาวตกชน Node

**Architecture:**
- **Storytelling Layer**: React Overlay นำเสนอคำบรรยายบทกวีภาษาไทย (`CinematicNarrator.tsx`), ป้ายประกาศหมวดหมู่ขนาดใหญ่ (`CategoryAnnouncementBanner.tsx`), และแถบนำทางความคืบหน้า 8 ขั้นตอน (`SeasonJourneyBreadcrumb.tsx`)
- **Canvas Physics & Transitions**: ปรับปรุง Render loop ให้ใช้ Linear Interpolation (LERP) เพื่อให้หมอก ฝน ลม และแสงดาวละลายข้ามฉากอย่างนุ่มนวล พร้อมวงแหวนคลื่นกระแทกเรืองแสง (Expanding Shockwave) และการสั่นหน้าจอเบาๆ (Screen Micro-shake) เมื่อดาวตกกระทบเป้าหมาย
- **Pacing Optimization**: ปรับเวลาการเปลี่ยนผ่านทั้งกระบวนการให้กระชับลงเหลือ ~12.5 วินาที

**Tech Stack:** React 19, TypeScript, Canvas 2D, Web Audio API, Vitest

## Global Constraints
- รักษาการสุ่มแบบธรรมชาติและ Seeded PRNG เดิม 100%
- ป้ายประกาศหมวดหมู่และคำบรรยายต้องใช้ภาษาไทยที่สละสลวย อ่านง่าย ชัดเจนสำหรับโปรเจกเตอร์
- Canvas ต้องทำงานลื่นไหล 60 FPS ไร้รอยต่อ

---

### Task 1: Optimize Stage Durations in State Machine

**Files:**
- Modify: `src/engine/stateMachine.ts:16-32`
- Modify: `tests/stateMachine.test.ts:40-48`

- [ ] **Step 1: Update timing tests in tests/stateMachine.test.ts**
  Assert that the total active animation duration is between 11,000ms and 14,000ms.
- [ ] **Step 2: Update STAGE_DURATION in src/engine/stateMachine.ts**
  Set `rain: 1500`, `water-drop: 1400`, `mist: 1500`, `wind: 1400`, `leaf: 1800`, `sky-opening: 1500`, `constellation: 1800`, `meteor: 1600`.
- [ ] **Step 3: Run tests to verify pass**
  Run `npx vitest run tests/stateMachine.test.ts`.
- [ ] **Step 4: Commit**
  `git add src/engine/stateMachine.ts tests/stateMachine.test.ts ; git commit -m "feat: optimize stage durations for 12.5s cinematic pacing"`

---

### Task 2: Build CinematicNarrator & SeasonJourneyBreadcrumb Components

**Files:**
- Create: `src/components/Stage/CinematicNarrator.tsx`
- Create: `src/components/Stage/SeasonJourneyBreadcrumb.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: Implement CinematicNarrator component**
  Display poetic Thai subtitles tailored to each active state with graceful CSS fade-in/fade-out.
- [ ] **Step 2: Implement SeasonJourneyBreadcrumb component**
  Render horizontal sequence of 8 natural milestones with glowing indicator on current state.
- [ ] **Step 3: Add styling in src/index.css**
  Glassmorphism styling, starlight typography, pulse indicators.
- [ ] **Step 4: Commit**
  `git add src/components/Stage/ src/index.css ; git commit -m "feat: implement cinematic narrator and season journey breadcrumb"`

---

### Task 3: Build CategoryAnnouncementBanner Component

**Files:**
- Create: `src/components/Stage/CategoryAnnouncementBanner.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: Implement CategoryAnnouncementBanner component**
  Render large glowing banner announcing the chosen category with icon, Thai title, and subtitle when entering `leaf` / `sky-opening`.
- [ ] **Step 2: Add styles in src/index.css**
  Bloom animation, category accent colors, glowing drop-shadow.
- [ ] **Step 3: Commit**
  `git add src/components/Stage/CategoryAnnouncementBanner.tsx src/index.css ; git commit -m "feat: implement category announcement banner"`

---

### Task 4: Implement Canvas 2D Smooth LERP Cross-Fading Engine

**Files:**
- Modify: `src/components/Stage/StageCanvas.tsx`

- [ ] **Step 1: Refactor StageCanvas with LERP interpolation**
  Add target and current variables for rain intensity, water drop opacity, mist density, and sky clarity.
- [ ] **Step 2: Smoothly interpolate variables in render loop**
  Update values every frame with `current += (target - current) * 0.06`.
- [ ] **Step 3: Test and verify smooth cross-fading**
  Ensure transitions have zero abrupt jumps.
- [ ] **Step 4: Commit**
  `git add src/components/Stage/StageCanvas.tsx ; git commit -m "feat: implement smooth canvas 2d lerp cross-fading"`

---

### Task 5: Meteor Shockwave Ring, Screen Micro-shake & Card Bloom

**Files:**
- Modify: `src/components/Stage/canvas/MeteorSystem.ts`
- Modify: `src/components/Stage/StageCanvas.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: Add expanding shockwave ring in MeteorSystem.ts**
  Create radial shockwave wave expanding outward on impact.
- [ ] **Step 2: Add screen micro-shake in StageCanvas.tsx**
  Apply 3px decaying shake offset to canvas viewport on impact.
- [ ] **Step 3: Update QuestionCard bloom animation in src/index.css**
  Add scale & brightness bloom animation when revealed.
- [ ] **Step 4: Commit**
  `git add src/components/Stage/ src/index.css ; git commit -m "feat: implement meteor shockwave ring, screen micro-shake and card bloom"`

---

### Task 6: Wire Components into StageOverlay & Full Verification

**Files:**
- Modify: `src/components/Stage/StageOverlay.tsx`
- Verify: Full test suite, TypeScript check, Vite build

- [ ] **Step 1: Connect Narrator, Breadcrumb, and CategoryBanner in StageOverlay.tsx**
  Place cleanly in stage viewport.
- [ ] **Step 2: Run all tests**
  Run `npx vitest run` (100% pass).
- [ ] **Step 3: Check TypeScript compilation**
  Run `npx tsc --noEmit` (0 errors).
- [ ] **Step 4: Run production build**
  Run `npm run build`.
- [ ] **Step 5: Commit**
  `git add . ; git commit -m "feat: complete cinematic transitions and storytelling enhancements"`
