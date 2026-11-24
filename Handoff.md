# 🔄 Project Hand-Off Summary
> Generated: 2026-11-24 (อัปเดตหลังจบ Phase 5)

## 1. [Project Overview & Tech Stack]

**WebRandomStar / Season Transition Quiz (เวอร์ชัน 3.0 "Royal Word Spin")**: เว็บสุ่มคำถามสำหรับเวทีประกวดดาว–เดือน ขึ้นจอโปรเจกเตอร์ ตัวเว็บสุ่ม "คำสำคัญ" ด้วยวงล้อหมุนก่อน แล้วเปิดคำถามในหมวดเดียวกัน มีตัวจับเวลา ประวัติ เพลงประกอบ และหน้าควบคุมระยะไกลในอีกหน้าต่าง

- **Stack:** React 19, TypeScript ~5.7, Vite 6, Vitest 3 + happy-dom, react-router 7 (`HashRouter`), lucide-react, `vgpu` (WebGPU สำหรับพื้นหลัง AeroShards ซึ่งโหลดแบบ lazy)
- **ไม่มี backend:** ข้อมูลเก็บใน localStorage ส่วนไฟล์เพลงเก็บใน IndexedDB หน้าต่างต่าง ๆ ซิงก์กันผ่าน `BroadcastChannel`
- **Repo:**
  - โคลนจาก `peak822/WebRandomStar` (commit ฐาน `0885cd9`) มาไว้ที่ `C:\Star` บน Windows
  - remote `origin` = `github.com/Doub1eKill/WebRandomStar` (private)
  - remote `upstream` = repo ต้นฉบับ
  - ทำงานบน branch **`refactor/architecture`**
- **เป้าหมาย:** refactor ตามแผน 12 Phase ใน `docs/superpowers/plans/2026-11-24-architecture-refactor.md` (Master Fix List 55 รายการ: B1–B15, PF1–PF12, S1–S9, A1–A10, D1–D7, O1–O3) โดย **หน้าตาและขั้นตอนบนเวทีต้องเหมือนเดิม** ยกเว้นจุดที่แผนระบุว่าเป็นการแก้บั๊ก
- **กติกาที่ผู้ใช้สั่งไว้:**
  - ทำทีละ Phase แล้ว **หยุดรออนุมัติทุก Phase**
  - **ทุก Phase ต้องอัปเดต Handoff.md, commit และ push**
  - ล่าสุดผู้ใช้สั่งว่า "เสร็จตรงนี้แล้วพักไว้ก่อน" จึง**ยังไม่ต้องเริ่ม Phase 6 จนกว่าผู้ใช้จะสั่ง**

## 2. [Completed Milestones]

ทุก Phase จบด้วย tsc + lint (0 errors) + เทสต์ + build ผ่าน และทดสอบในเบราว์เซอร์จริงแล้ว (Phase 1 ขึ้นไป)

| Phase | Commit | สรุป |
|---|---|---|
| แผน | `39e9f27` | แผน refactor + Master Fix List (branch `docs/architecture-refactor-plan`) |
| 0 | `6cfec33` | ESLint + CI (`.github/workflows/ci.yml`), characterization tests, เทสต์ยืนยันบั๊ก, baseline |
| 1 | `5933356` | ประสิทธิภาพ: timer ไม่ re-render ทั้งแอป (PF1+B13), วงล้อ ref-driven (PF4: 62.5 → 12.5 commit/s), `useLazyRef` (PF2), cache gradient (PF7), selector เพลง (PF5), คีย์ลัดผูกครั้งเดียว (PF6), lazy-load (PF3) ลด JS ตอนเปิดจาก 751 เหลือ 359 KB |
| 2 | `839fe16` | บั๊กเพลง B2–B6 (blob URL หลังรีโหลด, fade ซ้อน, volume), B9 (กดค้างยิงซ้ำ), B10 (เลิกใช้ `alert()` แล้วใช้ notice มุมจอ), B11 (เตือนเมื่อสุ่มนอกรอบหรือหมวด) |
| 3 | `3799caa` | จอเวทีเป็น host ตัวเดียว (Q2): reducer บริสุทธิ์ + stage host + controller mirror (B1: เสียงหมดเวลา 3 → 1 ครั้ง), protocol มี type + validate (S7/D5), แท็บเพลงในรีโมตสั่งจอเวทีได้ (B14), จำการตั้งเพลง (B15) |
| 4 | `ce73d49` | `createRepository` (validate/cache/version/subscribe), B7 (ลบหมดแล้วไม่กลับมาเป็นข้อมูลตัวอย่าง), B8 (ข้อมูลข้ามหน้าต่างอัปเดตทันที), S1 (นำเข้าคำถามมีหน้าตรวจสอบ: รวม/แทนที่ + สำรองอัตโนมัติ), S2 (CSV injection), S3, S4, S6 |
| 5 | (commit นี้) | react-router (Q1): `#/` = เวที, `#/control/<page>` = 8 หน้าแยกแบบ lazy, redirect `?mode=controller`, ลบ `ControlCenter`/`RemoteController`, `SessionProvider` + `useSession(selector)`, `useStageControls` (ตรรกะที่ drawer กับ Live ใช้ร่วมกัน), `useMusicLibrary` |

**ตัวเลขล่าสุด:**
- เทสต์ผ่าน **256/256** (40 ไฟล์), lint 0 errors / 30 warnings
- JS ที่จอเวทีโหลดตอนเปิด **416 KB (gzip 126 KB)** เทียบกับ baseline 751 KB (gzip 208 KB)

**การตัดสินใจของผู้ใช้:**
- Q1 = react-router
- Q2 = จอเวทีเป็น host ตัวเดียว
- Q5 = ให้เลือกตอนนำเข้า (UI มีทั้ง "รวม" และ "แทนที่")
- Q6 = ESLint + CI ทำไปแล้ว ผู้ใช้ไม่ได้คัดค้าน

## 3. [Current Task & Blockers]

- **สถานะ:** Phase 5 เสร็จ commit และ push แล้ว **พักงานตามคำสั่งผู้ใช้** ห้ามเริ่ม Phase 6 จนกว่าผู้ใช้จะสั่ง
- **Phase ถัดไป (6): ย้ายโฟลเดอร์และแยกไฟล์ใหญ่ (A2, A5, A7, A8, A9, PF9)**
  - ตั้ง path alias `@/`
  - `git mv` ไฟล์ไปโครงสร้างตามข้อ 3.2 ของแผน
  - แยก `AeroShards.tsx` (1,644 บรรทัด) เป็น shaders/presets/motion/renderGraph
  - เปลี่ยน `switch` ใน StageCanvas เป็นตาราง `stateTargets`/`stateSounds`
  - แยก `MusicPanel`/`TimerPanel`/`AppearanceSettings`/`QuestionBankDashboard`
  - ใช้ `AudioContext` ร่วมกัน (PF9)
  - ลบ `any` ที่เหลือและลบ props ที่ไม่ได้ใช้
- **คำถามที่ยังค้าง:**
  - **Q3** ลบ dead code (D1–D4) ทิ้งเลยหรือเก็บไว้ ต้องได้คำตอบก่อน Phase 9
  - **Q4** มีไฟล์ฟอนต์ Amoria/Verve ไหม ต้องได้คำตอบก่อน Phase 8
- **ข้อควรรู้:**
  - Drawer (CSS class) กับหน้า Live (inline style) ยังคงมี markup แยกกัน การรวม UI เลื่อนไปทำใน Phase 7 (`shared/ui`)
  - ปุ่มในหน้าตรวจสอบการนำเข้าเบียดกันเมื่อจอแคบ แก้ใน Phase 7
  - เบราว์เซอร์จะหน่วง timer ในแท็บที่ถูกซ่อน จึงควรเปิดหน้าเวทีไว้ในหน้าต่างที่มองเห็นได้ ปุ่ม popout เปิดรีโมตเป็นหน้าต่างแยกอยู่แล้ว และระบบเตือนผู้ควบคุมเมื่อหน้าเวทีถูกซ่อน
  - `useStageSync` (wrapper) และ `utils/storage.ts` (facade) ยังใช้อยู่ ลบใน Phase 9
  - `npm install` เตือนเรื่อง install scripts (`esbuild`, `webgpu`, `@vgpu/adapter-node`) และ `npm audit` ยังเจอช่องโหว่ ซึ่งจะแก้ใน Phase 10

## 4. [Key Context & Code Snippets]

**คำสั่ง (รันที่ `C:\Star`):**

```powershell
npm run lint
npm test
npm run build
npm run dev
```

dev server อยู่ที่พอร์ต 3000 และมี config ของ preview อยู่ที่ `.claude/launch.json` (ชื่อ `vite-dev` ไม่ได้ commit)

**URL:**
- เวที: `http://localhost:3000/`
- รีโมต: `http://localhost:3000/#/control/live` (ลิงก์เก่า `?mode=controller` จะ redirect มาที่นี่)

**โครงสร้างหลักตอนนี้ (ก่อน Phase 6 ย้ายโฟลเดอร์):**

```text
src/
├── App.tsx                         # HashRouter + AppRoutes
├── app/router.tsx                  # routes, CONTROL_PAGES, redirectLegacyControllerUrl
├── pages/
│   ├── stage/StagePage.tsx         # จอเวที + session host (useStageSync('stage'))
│   └── control/                    # ControlLayout (SessionProvider controller) + 8 หน้า + controlMusic.ts
├── features/
│   ├── session/                    # commands, sessionReducer, runtime (host/mirror), sessionChannel (v3),
│   │                               # persistence, sessionStore, actions, SessionProvider (useSession/useSessionActions/usePeerConnected)
│   ├── music/                      # musicRemote (host/remote/hydrate), useMusicLibrary (+ localMusicControls)
│   ├── questions/                  # importQuestions (S1), QuestionImportDialog (useQuestionImport)
│   └── control/useStageControls.ts # ตรรกะที่ drawer กับ Live ใช้ร่วมกัน (A3)
├── shared/lib/                     # createRepository, csv (toCsvCell)
├── storage/                        # repositories.ts (STORAGE_KEYS + repos), musicStorage.ts
├── hooks/                          # useStageSync (wrapper), useRepository, useRemainingMs, useLazyRef,
│                                   # useMusicPlayerState, useHasBeenTrue, useMusicStageRouter
├── engine/                         # timerEngine (+getLiveRemainingMs), musicPlayerEngine, audioEngine,
│                                   # operatorNotices, questionSelector (+fallbackReasons), ...
├── components/Stage|Control/       # คอมโพเนนต์เดิม (ย้ายใน Phase 6)
└── utils/storage.ts                # facade ชื่อฟังก์ชันเดิม (ลบใน Phase 9)
```

**ค่าที่ห้ามเปลี่ยน (ข้อมูลเดิมต้องใช้ได้):**

```ts
// src/storage/repositories.ts
export const STORAGE_KEYS = {
  QUESTIONS: 'season_transition_questions',
  CONTESTANTS: 'season_transition_contestants',
  SESSION: 'season_transition_session',
  HISTORY: 'season_transition_history',
  SETTINGS: 'season_transition_settings',
  WORDS: 'season_transition_words',
  APPEARANCE: 'season_transition_appearance'
} as const;
// schema versions: 'season_transition_schema_versions'; IndexedDB 'RandomizeQuiz_MusicDB' (store 'tracks')
// BroadcastChannels: session 'season_transition_quiz_sync_v3', music 'season_transition_music_v1',
//   library 'season_transition_music_library_v1', notices 'season_transition_operator_notices_v1'
// STAGE_DURATION (ms): pre-spin 800, word-spin 2500, word-decelerate 2000, word-lock 1500, question-reveal 1000
```

**ข้อตกลงในการเขียนเทสต์:**
- fake timers: `vi.useFakeTimers({ toFake: ['setTimeout','clearTimeout','setInterval','clearInterval','Date'] })` **ห้าม fake `setImmediate`** เพราะ `BroadcastChannel` ของ Node ต้องใช้ส่ง message ระหว่าง instance
- `act()` หนึ่งครั้งจะรวม update ทั้งหมดเป็น commit เดียว ถ้าต้องให้ timeout ต่อกันเป็นทอดหรือต้องนับ commit ให้ใช้ `advanceStepped()` (ดู `tests/useStageSync.characterization.test.tsx`)
- ไฟล์ที่เพิ่มเข้า IndexedDB ในเทสต์ต้องใช้ `Blob` จาก `node:buffer` เพราะ `fake-indexeddb` clone Blob ของ happy-dom เป็น object ธรรมดา
- `useSyncExternalStore` ต้องส่ง `getServerSnapshot` ด้วย เพราะเทสต์บางตัวใช้ `renderToString`
- ใน react-router v7 อย่าใช้ `<Navigate to="relative">` ภายใน route `*` เพราะจะ redirect ไม่สิ้นสุด ให้ใช้ path แบบ absolute
- `tests/helpers/render.tsx` มี `mount()` (นับ commit ผ่าน `<Profiler>` และมี `container`) และ `renderHook()`
- `tsconfig.json` รวมโฟลเดอร์ `tests` ไว้ด้วย และเปิด `noUnusedLocals` ถ้ามี import ที่ไม่ได้ใช้ `npm run build` จะพัง
- ไฟล์เดิมหลายไฟล์ใช้ CRLF ถ้าแก้ด้วยสคริปต์ต้องระวัง (Edit tool จัดการให้ได้)
- **CI ใช้ Node 22 แต่เครื่อง dev ใช้ Node 24:** ผล `Math.pow` ต่างกันที่ทศนิยมหลักสุดท้าย snapshot ที่มีตัวเลขทศนิยมจึงต้องปัดก่อน (ดู `normalizeNumbers` ใน `tests/spinViews.visual.test.tsx`)
- **PR:** [Doub1eKill/WebRandomStar#1](https://github.com/Doub1eKill/WebRandomStar/pull/1) (draft, `refactor/architecture` → `main`) เปิด Auto-fix ไว้แล้ว เมื่อ CI ล้มเหลว session จะถูกปลุกให้แก้

## 5. [Prompt for the Next AI]

```text
คุณกำลัง refactor โปรเจกต์ WebRandomStar (React 19 + Vite + TS) ที่ C:\Star บน branch refactor/architecture
(push ไปที่ origin = github.com/Doub1eKill/WebRandomStar)
อ่านไฟล์เหล่านี้ก่อนเริ่ม:
1) Handoff.md
2) docs/superpowers/plans/2026-11-24-architecture-refactor.md (Phase 0–5 ติ๊กครบแล้ว)
3) docs/superpowers/plans/2026-11-24-baseline.md

สถานะ: Phase 5 เสร็จแล้ว ผู้ใช้สั่งให้พักงาน ห้ามเริ่ม Phase 6 เอง ให้ถามผู้ใช้ก่อน

เมื่อผู้ใช้สั่งให้ทำต่อ ให้ทำ Phase 6 (ย้ายโฟลเดอร์/แยกไฟล์ใหญ่: A2, A5, A7, A8, A9, PF9) ตามแผน
กติกา:
- ทำทีละ Phase และหยุดรออนุมัติ
- หน้าตาและขั้นตอนบนเวทีต้องเหมือนเดิม และห้ามเปลี่ยน STORAGE_KEYS หรือชื่อ BroadcastChannel
- ย้ายไฟล์ด้วย git mv
- จบ Phase ด้วย npm run lint (0 errors), npm test, npm run build ที่ผ่านทั้งหมด และทดสอบในเบราว์เซอร์ (เวที + #/control)
- ติ๊ก checklist ในแผน อัปเดต Handoff.md แล้ว commit (อ้างรหัสรายการใน message) และ git push origin refactor/architecture
- ถาม Q3 (ลบ dead code?) และ Q4 (ไฟล์ฟอนต์ Amoria/Verve?) ก่อนถึง Phase 8–9
```
