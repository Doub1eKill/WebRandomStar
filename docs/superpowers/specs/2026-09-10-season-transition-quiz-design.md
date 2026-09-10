# Design Specification: Season Transition Question Web App (รอยต่อฤดู — ปลายฝนต้นหนาว)

**Date**: 2026-09-10  
**Target Environment**: Stage Display (Projector / LED 1080p+), Desktop / Tablet Control  
**Tech Stack**: Vite + React 19 + TypeScript + Canvas 2D + Web Audio API + BroadcastChannel  

---

## 1. Vision & Core Philosophy

Web application สำหรับสุ่มคำถามในกิจกรรมดาว–เดือน (University Pageant / Freshmen Contest) ภายใต้แนวคิด **“รอยต่อฤดู — ปลายฝนต้นหนาว”**
- **ธรรมชาติเป็นตัวสุ่ม**: ผู้ใช้ไม่ได้กดสุ่มตัวเลขแบบคาสิโน แต่กำลังเฝ้ารอให้ปรากฏการณ์ธรรมชาติพาไปพบคำถาม
- **ลำดับธรรมชาติ**: ฝนสุดท้าย → หยดน้ำ → หมอก → ลมต้นหนาว → ใบไม้ → ฟ้าเปิด → กลุ่มดาว → ดาวตก → คำถาม
- **ข้อห้ามเด็ดขาด**: ห้ามใช้ Slot Machine, วงล้อสุ่ม, กล่องสุ่ม/Mystery Box, หรืออนิเมชันเร็วฉูดฉาดแบบเกมคาสิโน

---

## 2. System Architecture

ระบบถูกออกแบบแยกส่วนอย่างชัดเจน (Separation of Concerns):

```
┌─────────────────────────────────────────────────────────────┐
│                       React App                             │
├──────────────────────────────┬──────────────────────────────┤
│          Stage View          │       Control Panel          │
│   (Full-screen Projector)    │   (Drawer / Pop-up Window)   │
├──────────────────────────────┴──────────────────────────────┤
│            BroadcastChannel / LocalStorage Sync             │
├─────────────────────────────────────────────────────────────┤
│         State Machine (idle -> stages -> question)          │
├──────────────────────────────┬──────────────────────────────┤
│  Seeded Random Engine (PRNG) │  Web Audio Synthesizer       │
│  - Multi-stage selection     │  - Procedural soundscapes    │
│  - Meteor trajectory math    │  - Volume & Mute control     │
├──────────────────────────────┴──────────────────────────────┤
│         Canvas 2D Natural Physics & Particle Layer          │
│         (Rain, Drops, Mist, Wind, Leaves, Constellation)    │
└─────────────────────────────────────────────────────────────┘
```

### 2.1 Component Breakdown
1. **Engine Layer**:
   - `src/engine/prng.ts`: Mulberry32 seeded pseudo-random number generator, supporting deterministic seed reproduction.
   - `src/engine/questionSelector.ts`: Multi-stage selection logic mapping wind/leaf coordinates to categories, candidate filtering, and guaranteed meteor-node targeting.
   - `src/engine/stateMachine.ts`: Strict state machine transitioning across:
     `idle` → `rain` → `water-drop` → `mist` → `wind` → `leaf` → `sky-opening` → `constellation` → `meteor` → `question` → `answered`.
   - `src/engine/audioEngine.ts`: Web Audio API procedural synthesis generating ambient rain, wind noise, leaf flutter, starry chime, and meteor swoosh.
2. **Visual & Rendering Layer (Canvas 2D)**:
   - `src/components/Stage/StageCanvas.tsx`: High-performance 60 FPS viewport rendering rain particles, condensation drops, mist gradients, wind particle flows, leaves with aerodynamic rotation, moon with subtle aura, connected star nodes, and blazing meteor streak with trail.
3. **UI Overlay Layer (React + CSS)**:
   - `src/components/Stage/StageOverlay.tsx`: Stage title, round badge, contestant information, and the Question Card with graceful glassmorphism, responsive typography, and soft glow.
   - `src/components/Control/ControlDrawer.tsx`: Embedded slide-over panel for stage operators.
   - `src/components/Control/RemoteController.tsx`: Dedicated pop-up window for dual-monitor setups via `BroadcastChannel`.
   - `src/components/Control/QuestionManagerModal.tsx`: CRUD interface to add, edit, delete, enable/disable questions, and export/import JSON.

---

## 3. Data Models

### 3.1 Question Model
```ts
export type QuestionCategory =
  | 'rain'     // ความรู้สึกและตัวตน (Feelings & Identity)
  | 'mist'     // มุมมองและทัศนคติ (Perspective & Attitude)
  | 'wind'     // การเปลี่ยนแปลงและความท้าทาย (Change & Challenge)
  | 'leaf'     // ประสบการณ์และชีวิตมหาวิทยาลัย (Experience & Memory)
  | 'moon'     // ความฝันและเป้าหมาย (Dreams & Ambition)
  | 'star'     // สังคมและความคิดสร้างสรรค์ (Society & Leadership)
  | 'final';   // คำถามรอบชิงชนะเลิศ (Final Decisive Question)

export interface Question {
  id: string;
  text: string;
  category: QuestionCategory;
  difficulty: 'easy' | 'medium' | 'hard';
  round: 'intro' | 'general' | 'attitude' | 'scenario' | 'final';
  enabled: boolean;
  tags: string[];
}
```

### 3.2 Contestant Model
```ts
export interface Contestant {
  id: string;
  number: number;
  name: string;
  faculty: string;
  title: 'ดาว' | 'เดือน' | 'ดาวจำแลง' | 'ทั่วไป';
}
```

### 3.3 Session & Sync State
```ts
export interface SessionState {
  sessionId: string;
  seed: string;
  currentState: AppState;
  selectedContestantId?: string;
  selectedRound: string;
  selectedCategory?: QuestionCategory;
  selectedQuestion?: Question;
  usedQuestionIds: string[];
  isMuted: boolean;
  volume: number; // 0 to 1
  isPaused: boolean;
}
```

---

## 4. Multi-Stage Natural Randomization Flow

1. **Session Initialized**: Operator selects contestant and round, then triggers **Start** (or hits `Space`/`Enter`).
2. **Rain & Droplets**: Gentle rain begins, fades down. A droplet forms and slides dynamically along a seeded parabolic path.
3. **Mist & Wind**: Mist rolls in, lowering visibility. Wind vector $(\vec{v}_x, \vec{v}_y)$ is generated from seed.
4. **Leaf Selection**: Autumn leaf is swept across the canvas by the wind vector. Its terminal landing position in the viewport determines the question category based on compass zones:
   - North: Moon
   - East: Star
   - South: Leaf
   - West: Wind
   - Center: Mist
   - (Rain & Final are weighted dynamically based on round configuration)
5. **Sky Opening & Constellation**: Clouds disperse. Moon rises. 5 to 7 star nodes light up, representing candidate questions from the chosen category. Nodes form constellation lines.
6. **Meteor Interception**:
   - Seed selects one winning candidate star node.
   - Meteor trajectory vector is mathematically aligned to enter from outside the viewport, streak through the winning star node coordinate, and spark on impact.
7. **Question Reveal**: The struck star node explodes into stardust, which coalesces into the question display card.

---

## 5. Keyboard Navigation & Accessibility

- `Space`: Start Journey / Pause & Resume
- `Enter`: Next Question / Proceed
- `Esc`: Toggle Control Drawer
- `KeyM`: Toggle Mute / Unmute
- `KeyF`: Toggle Fullscreen
- `prefers-reduced-motion`: Automatically switches to shortened transition timelines and minimal particle density.

---

## 6. Verification & Quality Gates

- **Performance**: 60 FPS guaranteed via Canvas 2D `requestAnimationFrame` loop with particle pools.
- **Determinism**: Identical seed results in exact same category, leaf trajectory, constellation nodes, and question selection.
- **Fairness**: `usedQuestionIds` strictly tracked in LocalStorage per session to eliminate accidental duplicates.
- **Offline Reliability**: Procedural audio synthesis guarantees sound without external CDN or audio file 404s.
- **Build Quality**: Zero TypeScript compile errors (`tsc --noEmit`), clean ESLint, error-free Vite production build.
