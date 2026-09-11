# Design Document: Pure 5-Phase Natural Streamline (Leaf Settle & Golden Bloom)

## 1. Overview & Objectives

Following feedback from stage testing:
1. **Remove Constellations & Meteors Completely**:
   - Celestial constellations and meteor strikes deviated from the earthly theme of "รอยต่อฤดู — ปลายฝนต้นหนาว" (Season Transition — Late Rain to Early Winter).
   - Removing them simplifies the story, reduces waiting time, and eliminates cognitive dissonance for the audience.
2. **Streamline into a Pure 5-Phase Natural Progression (~7.5 seconds)**:
   - `rain` (1.2s) ➔ `water-drop` (1.3s) ➔ `mist` (1.5s) ➔ `wind` (1.5s) ➔ `leaf` (2.0s) ➔ `question` (reveal).
   - The golden leaf descends into the center of the screen, creates expanding golden water ripples, and blooms directly into the Question Card.

---

## 2. Architectural & Component Changes

### 2.1 State Machine (`src/engine/stateMachine.ts` & `src/types/session.ts`)
- Update `AppState` union type:
  ```ts
  export type AppState =
    | 'idle'
    | 'rain'
    | 'water-drop'
    | 'mist'
    | 'wind'
    | 'leaf'
    | 'question'
    | 'answered';
  ```
- Update `NATURAL_SEQUENCE` in `stateMachine.ts`:
  ```ts
  export const NATURAL_SEQUENCE: AppState[] = [
    'rain',
    'water-drop',
    'mist',
    'wind',
    'leaf'
  ];
  ```
- Update `STAGE_DURATIONS`:
  - `rain`: 1200ms
  - `water-drop`: 1300ms
  - `mist`: 1500ms
  - `wind`: 1500ms
  - `leaf`: 2000ms
  - Total transition time: **7,500ms (7.5 seconds)**.

### 2.2 Question Selection (`src/engine/questionSelector.ts`)
- Remove requirement for `candidateNodes` and `meteorTrajectory`.
- Retain seeded PRNG (Mulberry32) and category/question selection with duplicate protection.
- Target coordinates for Hero Leaf landing set to viewport center `(width * 0.5, height * 0.46)`.

### 2.3 Canvas 2D Engine (`src/components/Stage/StageCanvas.tsx`)
- Remove `ConstellationSystem` and `MeteorSystem` from `StageCanvas.tsx`.
- Keep:
  - `RainSystem` (rain drops)
  - `WaterDropSystem` (condensation trickles)
  - `MistSystem` (low mist fog)
  - `LeafSystem` (ambient leaves, hero leaf, golden stardust trail & water ripples)
  - `SkySystem` (serene ambient night sky background with soft twinkling stars and gentle moon)
- In `LeafSystem`:
  - When Hero Leaf lands at center `(targetX, targetY)`:
    - Spawn 3 expanding concentric golden water ripple circles (`LeafRipple`):
      ```ts
      interface LeafRipple {
        x: number;
        y: number;
        radius: number;
        maxRadius: number;
        alpha: number;
      }
      ```
    - Ripple expands with golden glow, and the leaf emits a gentle golden pulse before handing off to the QuestionCard.

### 2.4 UI & Storytelling Components

#### A. Season Journey Breadcrumb (`src/components/Stage/SeasonJourneyBreadcrumb.tsx`)
- Streamline milestones to 5 natural steps:
  1. 🌧️ `ฝนซา` (rain)
  2. 💧 `หยดน้ำ` (water-drop)
  3. 🌫️ `สายหมอก` (mist)
  4. 🍃 `ลมหนาว` (wind)
  5. 🍂 `ใบไม้ทอง` (leaf)

#### B. Cinematic Narrator (`src/components/Stage/CinematicNarrator.tsx`)
- Streamline narrative lines to match the 5 natural states:
  - `rain`: *"สายฝนปลายฤดูค่อย ๆ ซาลง... สัญญาณแห่งการเปลี่ยนผ่านเริ่มต้นขึ้น"*
  - `water-drop`: *"หยดน้ำบนไอเย็นรวมตัว กำหนดทิศทางแห่งโชคชะตา"*
  - `mist`: *"สายหมอกลอยต่ำ อากาศหนาวเย็นเริ่มโอบล้อมทั่วอาณาบริเวณ"*
  - `wind`: *"ลมหนาวแรกพัดผ่าน นำพาความเปลี่ยนแปลงและบททดสอบ"*
  - `leaf`: *"ใบไม้สีทองร่อนลงสู่ผืนน้ำ... เผยคำถามแห่งโชคชะตาประจำค่ำคืน!"*

### 2.5 Audio Engine (`src/engine/audioEngine.ts`)
- On leaf landing at center: Trigger `audioEngine.playLeafRustle()` + `audioEngine.playWaterDrop()` + `audioEngine.playQuestionReveal()` harmonic chord.

---

## 3. Timing & Progression Sequence (7.5s Total)

| Time (s) | State | Visual Action | Audio Action |
|---|---|---|---|
| 0.0 - 1.2 | `rain` | Late rain softly eases | Rain ambience |
| 1.2 - 2.5 | `water-drop` | Water drops trickle on glass | Water drop plop |
| 2.5 - 4.0 | `mist` | Gentle mist settles low | Rain fades out |
| 4.0 - 5.5 | `wind` | Chilly breeze blows across screen | Chilly wind gust |
| 5.5 - 7.5 | `leaf` | Golden leaf glides down with stardust trail to screen center, ripples expand | Leaf rustle & chime |
| 7.5+ | `question` | Question Card blooms into view with glassmorphic elegance | Majestic question chord |

---

## 4. Verification Plan

1. **Automated Unit & E2E Tests**: Update tests in `tests/stateMachine.test.ts`, `tests/questionSelector.test.ts`, `tests/e2e.test.ts` for the 5-state sequence and verify all tests pass.
2. **TypeScript Strict Typecheck**: `tsc -b` with 0 errors.
3. **Production Build**: `npm run build` succeeds cleanly.
4. **Browser End-to-End Simulation**:
   - Verify sequence transitions smoothly through the 5 natural stages in ~7.5s.
   - Verify no constellation or meteor appears.
   - Verify golden leaf descends to center and creates ripples, revealing the Question Card.
