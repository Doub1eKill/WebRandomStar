# 🔄 Project Hand-Off Summary
> Generated: 2026-11-24

## 1. [Project Overview & Tech Stack]

**WebRandomStar / Season Transition Quiz (เวอร์ชัน 3.0 "Royal Word Spin")**: เว็บสุ่มคำถามสำหรับเวทีประกวดดาว–เดือน ขึ้นจอโปรเจกเตอร์ ตัวเว็บสุ่ม "คำสำคัญ" ด้วยวงล้อหมุนก่อน แล้วเปิดคำถามในหมวดเดียวกัน มีตัวจับเวลา ประวัติการสุ่ม เพลงประกอบ และหน้าควบคุมหลังเวทีแยกอีกหน้าต่าง (`?mode=controller`) ซิงก์ระหว่างหน้าต่างผ่าน `BroadcastChannel`

- **Stack:** React 19, TypeScript ~5.7, Vite 6, Vitest 3 + happy-dom, lucide-react, `vgpu` (WebGPU สำหรับพื้นหลัง AeroShards)
- **ไม่มี backend:** ข้อมูลเก็บใน localStorage ทั้งหมด ยกเว้นไฟล์เพลงที่เก็บใน IndexedDB
- **ที่มา:** โคลนมาจาก `https://github.com/peak822/WebRandomStar` (commit ฐาน `0885cd9`) มาไว้ที่ `C:\Star` บน Windows
- **ขนาด:** โค้ดใน `src` ราว 16,000 บรรทัด
- **เป้าหมายตอนนี้:** refactor ทั้งระบบเป็น 12 Phase (0–11) ตามแผนใน `docs/superpowers/plans/2026-11-24-architecture-refactor.md` ได้แก่ แยกโฟลเดอร์ตามฟีเจอร์, แยกหน้าด้วย hash routing, optimize, แก้บั๊ก 53 รายการ โดย **หน้าตาและขั้นตอนบนเวทีต้องเหมือนเดิม**
- **วิธีทำงานที่ผู้ใช้สั่งไว้:** ทำทีละ Phase แล้ว **หยุดรอให้ผู้ใช้อนุมัติทุก Phase**

## 2. [Completed Milestones]

- [x] โคลน repo และ `npm install` แล้ว build กับเทสต์ผ่าน
- [x] วิเคราะห์โปรเจกต์ และเขียนแผน refactor ซึ่งมี Master Fix List 53 รายการ แบ่งเป็นหมวด B บั๊ก, PF ประสิทธิภาพ, S ข้อมูลและความปลอดภัย, A โครงสร้าง, D โค้ดตาย, O เอกสาร โดยทุกรายการระบุไฟล์ บรรทัด วิธีแก้ และ Phase
- [x] Commit `39e9f27` (branch `docs/architecture-refactor-plan`): เพิ่มไฟล์แผน
- [x] **Phase 0 เสร็จแล้ว** commit `6cfec33` บน branch `refactor/architecture`:
  - เพิ่ม ESLint (flat config, typescript-eslint + react-hooks) โดยตั้งกฎใหม่เป็น warn, `npm run lint` และ CI `.github/workflows/ci.yml` (lint → test → build)
  - แก้ lint error 3 จุด: เปลี่ยน `onStopMusic && onStopMusic()` เป็น `onStopMusic?.()` ใน `AppearanceSettings.tsx` และ `ControlDrawer.tsx` และใส่ `eslint-disable-next-line prefer-const` ใน `AeroShards.tsx`
  - เลิก track `tsconfig.tsbuildinfo` และเพิ่ม `*.tsbuildinfo` ลง `.gitignore`
  - Characterization tests 23 ตัว: `tests/useStageSync.characterization.test.tsx`
  - เทสต์ยืนยันบั๊ก: `tests/knownBugs.music.test.ts` (B2–B6) และเทสต์ B1 ในไฟล์ characterization
  - Baseline perf: `tests/baseline.perf.test.tsx` บันทึกผลไว้ที่ `docs/superpowers/plans/2026-11-24-baseline.md`
  - devDependencies ใหม่: `eslint@9`, `@eslint/js@9`, `typescript-eslint@8`, `eslint-plugin-react-hooks@5`, `globals@15`, `fake-indexeddb@6`
- [x] ผลตรวจหลัง Phase 0: เทสต์ผ่าน **173/173** (33 ไฟล์), `npm run build` ผ่าน, `npm run lint` 0 errors / 36 warnings
- [x] บั๊กที่เทสต์ยืนยันว่ามีจริง:
  - **B1:** ถ้าเปิดรีโมตไว้ด้วย เสียงหมดเวลาดัง 3 ครั้ง
  - **B2:** เพลงที่อัปโหลดเองใช้ blob URL ตายตัวเดิมหลังรีโหลด
  - **B3:** `setMuted()` ที่ถูกเรียกทุกครั้งที่ได้ snapshot จากรีโมต ยกเลิก fade และทำให้เพลงเก่ากลับมาดังเต็มระดับ (0.75)
  - **B4:** สั่งเล่นเพลงเดิมซ้ำแล้วเสียงเบาค้าง
  - **B5:** error บน slot ที่ไม่ได้ใช้ ทำให้นาฬิกาจำลองเดิน
  - **B6:** ปรับ volume แล้วไม่คูณ `defaultVolume`
- [x] Baseline: JS bundle 750.95 KB (gzip 208.25 KB) ในไฟล์เดียว, ระหว่างจับเวลา render ~10 ครั้ง/วินาที, ระหว่างวงล้อหมุน 62.5 ครั้ง/วินาที

## 3. [Current Task & Blockers]

- **งานถัดไป: Phase 1 "Performance quick wins"** (ยังไม่เริ่ม รอผู้ใช้อนุมัติ) ประกอบด้วย PF2, PF7, PF3, PF1 + B13, PF4, PF5, PF6, O3 รายละเอียดอยู่ในแผนหัวข้อ "Phase 1"
  - **ข้อควรระวังสำคัญ (B13):** เมื่อเลิกเขียน `remainingMs` ลง session ทุก 100ms (PF1) ต้องแก้ `markAnswered` (`src/hooks/useStageSync.ts:388`) ให้คำนวณเวลาจาก `startTimestamp` ด้วย ไม่อย่างนั้น `timerUsedMs` ใน history จะผิด เทสต์ `markAnswered() records history with the time actually used` จะจับได้
  - เมื่อทำ PF1/PF4 เสร็จ ต้องกลับ assertion ของเทสต์ `[baseline → Phase 1 PF1]` และ `[baseline → Phase 1 PF4]` ให้เป็นค่าเป้าหมาย
- **การตัดสินใจที่ยังค้าง (แผนหัวข้อ 6):**
  - Q1 Router (`react-router` หรือเขียนเอง)
  - Q2 ให้จอเวทีเป็น host ตัวเดียวไหม
  - Q3 ลบ dead code หรือเก็บไว้
  - Q4 มีไฟล์ฟอนต์ Amoria/Verve ไหม
  - Q5 นำเข้าคำถามแล้วรวมกับคลังเดิมหรือแทนที่ทั้งหมด
  - Q6 ESLint + CI: ทำไปแล้วตามคำแนะนำ แต่ผู้ใช้ยังไม่ได้ยืนยัน

  Phase 1–2 ไม่ต้องรอคำตอบเหล่านี้ แต่ Phase 3 ต้องรอ Q2 และ Phase 5 ต้องรอ Q1
- **Git remote:** `origin` ชี้ไปที่ `peak822/WebRandomStar` ซึ่งบัญชี `gh` ที่ล็อกอินอยู่ (`Doub1eKill`) ไม่มีสิทธิ์ push ผู้ใช้จึงขอให้สร้าง repo ใหม่บน GitHub
- **ยังไม่ได้วัด:** FPS จริงในเบราว์เซอร์ ตัวเลข render นับจากในเทสต์ (happy-dom + fake timers)
- **ข้อจำกัดที่รู้แล้ว:**
  - `npm install` เตือนว่ามี install scripts ที่ยังไม่ได้อนุญาต (`esbuild`, `webgpu`, `@vgpu/adapter-node`) แต่ build และเทสต์ยังผ่าน
  - `npm audit` เจอช่องโหว่ 9 รายการ ซึ่งจะแก้ใน Phase 10

## 4. [Key Context & Code Snippets]

**คำสั่งหลัก (รันที่ `C:\Star`):**

```powershell
npm run lint
npm test
npm run build
npm run dev
```

**Branches:**

```text
main                             0885cd9  (origin/main, ของต้นฉบับ)
docs/architecture-refactor-plan  39e9f27  แผน refactor
refactor/architecture            6cfec33  Phase 0 (ทำงานต่อบน branch นี้)
```

**ไฟล์อ้างอิงที่ต้องอ่านก่อนเริ่ม:**
- `docs/superpowers/plans/2026-11-24-architecture-refactor.md`: แผนเต็ม, Master Fix List และ checklist ของแต่ละ Phase (Phase 0 ติ๊กครบแล้ว)
- `docs/superpowers/plans/2026-11-24-baseline.md`: ตัวเลข baseline และสถานะบั๊ก
- `tests/useStageSync.characterization.test.tsx`: ตาข่ายนิรภัยของพฤติกรรม `useStageSync`

**จุดร้อนในโค้ดที่ Phase 1 จะแตะ:**
- `src/hooks/useStageSync.ts:268` เรียก `setSession` ทุก 100ms (PF1) และ `:388` ใช้ `remainingMs` คำนวณเวลาที่ใช้ (B13)
- `src/components/Stage/StageCanvas.tsx:29-40` ใช้ `useRef(new XSystem())` (PF2) และ `:261-314` สร้าง gradient ใหม่ทุกเฟรม (PF7)
- `src/components/Stage/WordSpin/WordCarousel.tsx:79,89` เรียก `setFloatOffset` ทุกเฟรม (PF4)
- `src/engine/musicPlayerEngine.ts:60-66` เรียก `notifyState` ทุกครั้งที่เกิด `timeupdate` (PF5) และ `src/App.tsx:56` subscribe ทั้ง state
- `src/components/Control/KeyboardController.tsx:67` deps เป็น inline handler จาก `App.tsx:98-134` (PF6)
- Lazy-load (PF3): `src/components/Stage/StageBackground.tsx` (AeroShards), `src/App.tsx` (RemoteController, ControlDrawer)

**ข้อตกลงในการเขียนเทสต์:**
- ใช้ `vi.useFakeTimers({ toFake: ['setTimeout','clearTimeout','setInterval','clearInterval','Date'] })` โดย **ห้าม fake `setImmediate`** เพราะ `BroadcastChannel` ของ Node ต้องใช้ส่ง message ระหว่าง hook instance
- `act()` หนึ่งครั้งจะรวม update ทั้งหมดเป็น commit เดียว ถ้าต้องให้ timeout ต่อกันเป็นทอดหรือต้องนับ commit ให้ใช้ `advanceStepped()` (เลื่อนเวลาทีละ 100ms ต่อหนึ่ง `act`)
- เทสต์ที่ชื่อขึ้นต้นด้วย `[known bug …]` หรือ `[baseline …]` ตั้งใจยืนยันพฤติกรรมเดิมของวันนี้ Phase ที่ระบุในชื่อเทสต์ต้องกลับ assertion ให้เป็นค่าที่ถูก
- `tsconfig.json` รวมโฟลเดอร์ `tests` ไว้ด้วย และเปิด `noUnusedLocals` ไว้ ถ้ามี import ที่ไม่ได้ใช้ในเทสต์ `npm run build` จะพัง

**Test helper (`tests/helpers/render.tsx`):**

```tsx
import React, { Profiler, act } from 'react';
import { createRoot, Root } from 'react-dom/client';

// Tell React this environment supports act() so state updates flush synchronously.
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

export interface Mounted {
  /** Number of React commits inside the mounted tree since mount. */
  commits: () => number;
  unmount: () => void;
}

/** Mount an element inside a <Profiler> so tests can count commits. */
export function mount(element: React.ReactElement): Mounted {
  let commits = 0;
  const container = document.createElement('div');
  let root!: Root;
  act(() => {
    root = createRoot(container);
    root.render(
      <Profiler id="probe" onRender={() => { commits++; }}>
        {element}
      </Profiler>
    );
  });
  return {
    commits: () => commits,
    unmount: () => act(() => root.unmount())
  };
}

export interface HookResult<T> extends Mounted {
  result: { current: T };
}

/** Minimal renderHook: re-renders expose the latest hook return value via result.current. */
export function renderHook<T>(useHook: () => T): HookResult<T> {
  const result = { current: undefined as unknown as T };
  function Probe() {
    result.current = useHook();
    return null;
  }
  return { result, ...mount(<Probe />) };
}
```

**ค่าคงที่ที่ต้องคงไว้ (ห้ามเปลี่ยน เพื่อให้ข้อมูลเดิมยังใช้ได้):**

```ts
// src/utils/storage.ts
export const STORAGE_KEYS = {
  QUESTIONS: 'season_transition_questions',
  CONTESTANTS: 'season_transition_contestants',
  SESSION: 'season_transition_session',
  HISTORY: 'season_transition_history',
  SETTINGS: 'season_transition_settings',
  WORDS: 'season_transition_words',
  APPEARANCE: 'season_transition_appearance'
} as const;
```

```ts
// src/engine/stateMachine.ts: STAGE_DURATION (ms) ที่เทสต์ characterization ยืนยันไว้
// pre-spin 800, word-spin 2500, word-decelerate 2000, word-lock 1500, question-reveal 1000
```

ช่องทาง sync: `BroadcastChannel('season_transition_quiz_sync_v2')` และ IndexedDB `RandomizeQuiz_MusicDB` (store `tracks`)

## 5. [Prompt for the Next AI]

```text
คุณกำลังทำ refactor โปรเจกต์ WebRandomStar (React 19 + Vite + TS) ที่ C:\Star บน branch refactor/architecture
อ่านไฟล์เหล่านี้ก่อนเริ่ม:
1) Handoff.md
2) docs/superpowers/plans/2026-11-24-architecture-refactor.md (แผนเต็ม + Master Fix List)
3) docs/superpowers/plans/2026-11-24-baseline.md

กติกา: ทำทีละ Phase และหยุดรอให้ผู้ใช้อนุมัติหลังจบแต่ละ Phase ห้ามเปลี่ยนหน้าตาหรือขั้นตอนบนเวที
นอกจากรายการที่แผนระบุว่าเป็นการแก้บั๊ก และห้ามเปลี่ยน STORAGE_KEYS

งานถัดไป: Phase 1 (PF2, PF7, PF3, PF1+B13, PF4, PF5, PF6, O3)
- ทำ B13 พร้อมกับ PF1 (markAnswered ต้องคำนวณเวลาจาก startTimestamp)
- กลับ assertion ของเทสต์ [baseline → Phase 1 PF1] และ [baseline → Phase 1 PF4] ให้เป็นค่าเป้าหมาย
- จบ Phase ด้วย npm run lint (0 errors), npm test และ npm run build ที่ผ่านทั้งหมด
- ติ๊ก checklist ของ Phase 1 ในแผน แล้ว commit แยก 1 commit อ้างรหัสรายการใน message
- รายงานตัวเลขก่อนและหลังเทียบกับ baseline แล้วหยุดรอผู้ใช้
```
