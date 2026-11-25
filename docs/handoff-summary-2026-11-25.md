# 🔄 Project Hand-Off Summary
> Generated: 2026-11-25 (อัปเดตหลังจบ Phase 9)
> สำเนา ณ วันที่ของ `Handoff.md` ที่ root (ไฟล์ที่ root คือฉบับที่อัปเดตทุก Phase)

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
| 5 | `e64f8f0` | react-router (Q1): `#/` = เวที, `#/control/<page>` = 8 หน้าแยกแบบ lazy, redirect `?mode=controller`, ลบ `ControlCenter`/`RemoteController`, `SessionProvider` + `useSession(selector)`, `useStageControls` (ตรรกะที่ drawer กับ Live ใช้ร่วมกัน), `useMusicLibrary` |
| fix CI | `4cae1fe` | snapshot ปัดทศนิยม 10 หลัก เพราะ CI ใช้ Node 22 แต่เครื่อง dev ใช้ Node 24 |
| 6 | `b11c62b` → `1eef097` (4 commits) | ย้าย 68 ไฟล์ไปโครงสร้างตามฟีเจอร์ + alias `@/` (build ได้ไฟล์เหมือนเดิมทุกไบต์), แยก AeroShards (1,785 → 730 บรรทัด), StageCanvas ใช้ตาราง (A8), AudioContext ตัวเดียว + `recipes.ts` (PF9), แยก 4 panel ใหญ่เป็น model + sections (snapshot ตรงกัน 12 สถานะ), ไม่มี `any` เหลือ (A5), ลบ props ที่ไม่ได้ใช้ (A9) |
| B16 (แทรกก่อน Phase 7) | `a279717` | แก้เสียงค้าง: เพลง preset ที่เคยลากโน้ตตัวเดียวยาวตลอด phase เปลี่ยนเป็น arpeggio เบา ๆ (`features/music/presetArpeggio.ts`) ทุกโน้ตมีเวลา stop และเมื่อเลิก mute หรือ volume กลับจาก 0 เพลงจะเล่นต่อ ยืนยันในเบราว์เซอร์แล้วว่าหลัง stop ไม่มีโน้ตใหม่และไม่มี oscillator ค้าง |
| 7 | `a5b8fbb` | ขอบเขต Targeted: แยก `index.css` เป็น 15 ไฟล์ตามลำดับ cascade (`app/styles.css`) และ CSS ที่ build ออกมาเหมือนเดิมทุกไบต์ (A6), token สี `--ui-*` + `shared/ui` (`SettingGroup`, `ModeCard`, `ui.css`) ทำให้ inline style ลดจาก 574 เหลือ 445 จุด (PF11), drawer กับหน้า Live ใช้ `ControlCard` + `QuizModeToggle` ร่วมกันแต่มี variant แยกหน้าตาของแต่ละฝั่ง (`LivePage` 466 → 182 บรรทัด), ปุ่มหน้าตรวจสอบการนำเข้าไม่เบียดกันบนจอแคบแล้ว เช็กด้วย computed-style ทุก property ใน 8 หน้าควบคุม, เวที และ drawer/Live หลายสถานะ ผลคือเหมือนเดิม |
| 8 | `75f2eb2` | ฟอนต์ self-host ผ่าน `@fontsource` (OFL) ใช้น้ำหนักเดียวกับ Google Fonts เดิม และเอาลิงก์ Google ออก (PF10), preset `amoria`/`verve` ใช้ Playfair Display / Cinzel Decorative แทน ส่วน id เหมือนเดิม (B12, Q4), `public/leaf.svg` (favicon), CSP ใส่ตอน build ผ่าน plugin ใน `vite.config.ts` (S5) ทดสอบบน `vite preview` แล้ว: ทุก request ไปแค่ localhost และไม่มี CSP violation |
| 9 | `dc1ed4c` | Q3: ลบ dead code D1–D4 (3 คอมโพเนนต์เล่าเรื่อง + `storytelling.css`, `useTimer`, `selectQuestionFlow`, state เก่า 6 ตัว, ระบบฝน/หยดน้ำ/ใบไม้และเสียงของมัน) และ PF8, D7, ลบ wrapper `useStageSync` (StagePage ใช้ `SessionProvider` โดยตรง) และ facade `storageApi` (ย้ายตรรกะไปไว้กับฟีเจอร์), ESLint ทุกกฎเป็น error, README + PROJECT_SUMMARY เขียนใหม่ให้ตรงกับ v3 |

**ตัวเลขล่าสุด:**
- เทสต์ผ่าน **273/273** (42 ไฟล์ เพราะลบเทสต์ LeafSystem), **lint 0 ปัญหา ทุกกฎเป็น error**
- inline style **445** จุด (เดิม 574), CSS หลัก 87.0 KB (gzip 14.4 KB รวม `@font-face` ของฟอนต์ที่ self-host) ส่วน CSS ของหน้าควบคุมบางส่วนโหลดพร้อม lazy chunk
- ไม่มี request ออกไปภายนอกตอนใช้งานปกติ (ยกเว้นตอนผู้ใช้ตั้งฟอนต์ custom ของ Google หรือเพิ่มเพลงจาก URL)
- JS ที่จอเวทีโหลดตอนเปิด **403 KB (gzip 123 KB)** เทียบกับ baseline 751 KB (gzip 208 KB)
- Draft PR: [Doub1eKill/WebRandomStar#1](https://github.com/Doub1eKill/WebRandomStar/pull/1) เปิด Auto-fix ไว้แล้ว

**การตัดสินใจของผู้ใช้:**
- Q1 = react-router
- Q2 = จอเวทีเป็น host ตัวเดียว
- Q5 = ให้เลือกตอนนำเข้า (UI มีทั้ง "รวม" และ "แทนที่")
- Q6 = ESLint + CI ทำไปแล้ว ผู้ใช้ไม่ได้คัดค้าน
- Q3 = ลบ dead code (D1–D4) ออกเลย เพราะกู้คืนจาก git ได้ (รวม `legacyRemote.css`)
- Q4 = ใช้ฟอนต์ฟรี (OFL) ที่หน้าตาใกล้เคียงแทน: Amoria → **Playfair Display**, Verve → **Cinzel Decorative** โดย self-host ผ่าน `@fontsource` และแก้ชื่อบนการ์ดให้ตรงกับฟอนต์จริง (ไฟล์ Amoria/Verve ตัวจริงมีแจกแค่บนเว็บรวมฟอนต์ภายนอก Amoria เป็นรุ่น demo ที่ใช้ได้แค่ส่วนตัว ส่วน Verve ไม่มีใบอนุญาตเชิงพาณิชย์ที่ยืนยันได้ จึงไม่ดาวน์โหลด)

## 3. [Current Task & Blockers]

- **สถานะ:** Phase 9 เสร็จ commit และ push แล้ว **รอผู้ใช้อนุมัติก่อนเริ่ม Phase 10**
- **Phase ถัดไป (10): Dependencies (S9)**
  - อัปเดต `vite`, `vitest`, `happy-dom` เป็นเวอร์ชันที่แก้ช่องโหว่แล้ว แล้วรันเทสต์ทั้งหมด
  - `vgpu` ดึง `@modelcontextprotocol/server` ติดมา ให้หาเวอร์ชันใหม่ หรือใช้ `overrides` (โค้ดนี้ไม่ได้อยู่ใน bundle จึงเสี่ยงแค่ฝั่ง dev/supply chain)
  - อนุมัติ install script เฉพาะแพ็กเกจที่จำเป็น (`esbuild`) และ `npm audit` ต้องไม่เหลือ critical/high
  - การเปลี่ยนเวอร์ชัน dependency เป็นการติดตั้งแพ็กเกจใหม่ ให้บอกผู้ใช้ว่าจะอัปเดตอะไรบ้างก่อน
- **ไฟล์ที่ยังใหญ่ (ตั้งใจเหลือไว้):**
  - `AeroShards.tsx` 730: effect WebGPU ก้อนเดียวที่แชร์ state ผ่าน closure
  - `shaders.ts` 666: WGSL
  - `musicPlayerEngine` ~540 และ `ControlDrawer` 528
- **คำถามที่ยังค้าง:**
  - ไม่มี (Q3 และ Q4 ได้คำตอบแล้ว ดูหัวข้อการตัดสินใจของผู้ใช้)
- **ข้อควรรู้:**
  - **CSP ใส่แค่ตอน build** (`vite.config.ts` → `CONTENT_SECURITY_POLICY`): ถ้าเพิ่มฟีเจอร์ที่โหลดของจาก host อื่น ต้องแก้ policy และทดสอบด้วย `npx vite build && npx vite preview` (ตั้งไว้ใน `.claude/launch.json` ชื่อ `vite-preview` port 4173) เพราะ dev server ไม่มี CSP จึงไม่เห็นปัญหานี้
  - **ลำดับ CSS สำคัญ:** `src/app/styles.css` เป็นรายการ `@import` ตามลำดับ cascade เดิม ห้ามสลับลำดับโดยไม่เช็ก computed style ไฟล์ที่ import จากคอมโพเนนต์ (lazy chunk) จะโหลดหลัง CSS หลักเสมอ จึงใช้ได้เฉพาะกับ CSS ที่ควรอยู่ท้าย cascade
  - เครื่องมือเช็กหน้าตา: `.claude/fp.js` (ไม่ได้ commit) ใช้ใน dev server ด้วย `await import('/.claude/fp.js')` แล้วเรียก `save(name, selector)` หรือ `compare(name, selector)` เพื่อบันทึก computed style ทุก property ลง IndexedDB แล้วเทียบ ตัวเครื่องมือจะทำ transition ให้จบก่อนวัด และ rewind keyframe animation ไปที่ t=0 ข้อควรระวัง: แท็บต้องอยู่หน้า (rAF ไม่ทำงานในแท็บพื้นหลัง)
  - การ์ดของ drawer กับหน้า Live ใช้ `ControlCard`/`QuizModeToggle` ร่วมกันแล้ว แต่ข้อความปุ่ม, icon และเงื่อนไข disabled ของ pause/skip ต่างกันมาแต่เดิม จึงยังไม่ได้รวม เพราะถ้ารวมพฤติกรรมของหน้าใดหน้าหนึ่งจะเปลี่ยน
  - เบราว์เซอร์จะหน่วง timer ในแท็บที่ถูกซ่อน จึงควรเปิดหน้าเวทีไว้ในหน้าต่างที่มองเห็นได้ ปุ่ม popout เปิดรีโมตเป็นหน้าต่างแยกอยู่แล้ว และระบบเตือนผู้ควบคุมเมื่อหน้าเวทีถูกซ่อน
  - **state เก่าของ v2** (`rain`, `water-drop`, `mist`, `wind`, `leaf`, `sky-clear`) คือลำดับเวทีแบบเล่าเรื่องฤดูก่อนจะมีวงล้อคำ ใช้จริงจนถึง commit `179d876` (15 ก.ย. ในโปรเจกต์ต้นฉบับ) หลังจากนั้นเข้าถึงไม่ได้อีก และลบไปใน Phase 9 ถ้าจะเอากลับมา โค้ดเดิมอยู่ที่ commit ฐาน `0885cd9` เช่น `git show 0885cd9:src/components/Stage/canvas/LeafSystem.ts`
  - `npm install` เตือนเรื่อง install scripts (`esbuild`, `webgpu`, `@vgpu/adapter-node`) และ `npm audit` ยังเจอช่องโหว่ ซึ่งจะแก้ใน Phase 10

## 4. [Key Context & Code Snippets]

**คำสั่ง (รันที่ `C:\Star`):**

```powershell
npm run lint
npm test
npm run build
npm run dev
```

dev server อยู่ที่พอร์ต 3000 ส่วน config ของ preview อยู่ที่ `.claude/launch.json` (ไม่ได้ commit) มีสองตัวคือ `vite-dev` (3000) และ `vite-preview` (4173 ใช้ build จริงที่มี CSP)

**URL:**
- เวที: `http://localhost:3000/`
- รีโมต: `http://localhost:3000/#/control/live` (ลิงก์เก่า `?mode=controller` จะ redirect มาที่นี่)

**โครงสร้างหลักตอนนี้ (หลัง Phase 9, import ใช้ alias `@/` = `src/`):**

```text
src/
├── app/                            # main.tsx (index.html ชี้มาที่นี่), App.tsx (HashRouter), router.tsx, styles.css (ลำดับ cascade)
├── pages/
│   ├── stage/StagePage.tsx         # จอเวที + session host (<SessionProvider role="stage">)
│   └── control/                    # ControlLayout (SessionProvider controller) + 8 หน้า + controlMusic.ts
├── features/
│   ├── session/                    # commands, sessionReducer, runtime (host/mirror), sessionChannel (v3), persistence,
│   │                               # sessionStore, actions, SessionProvider, stateMachine
│   ├── stage/                      # overlay/, word-spin/ (+wordSpinEngine), background/{canvas (+stateTargets), aero-shards},
│   │                               # KeyboardController
│   ├── timer/                      # timerEngine, timerSettings, useRemainingMs, TimerDisplay, panel/ (model + sections)
│   ├── music/                      # musicPlayerEngine, presetArpeggio, musicStorage, musicRemote, useMusicLibrary, useMusicPlayerState,
│   │                               # useMusicStageRouter, panel/ (model + sections)
│   ├── audio/                      # audioContext (ใช้ร่วม), audioEngine, recipes
│   ├── questions/                  # questionSelector, importQuestions, QuestionImportDialog, QuestionManagerModal, bank/
│   ├── words/  contestants/  history/ (historyManager: สร้าง/เพิ่ม/ล้าง/ส่งออกประวัติ)
│   ├── appearance/                 # typography, appearanceSettings, panel/ (model + sections)
│   └── control/                    # ControlDrawer, ControlCard + QuizModeToggle (variant drawer/live), useStageControls
├── shared/
│   ├── lib/                        # createRepository, csv, prng, useLazyRef, useHasBeenTrue
│   ├── notices/                    # operatorNotices, OperatorToasts
│   ├── styles/                     # fonts (@fontsource), tokens (CSS variables), base, modals, dashboard, toggle
│   └── ui/                         # ui.css, SettingGroup, ModeCard
├── storage/                        # repositories (STORAGE_KEYS), useRepository
├── data/  types/
public/leaf.svg                     # favicon
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
- `act()` หนึ่งครั้งจะรวม update ทั้งหมดเป็น commit เดียว ถ้าต้องให้ timeout ต่อกันเป็นทอดหรือต้องนับ commit ให้ใช้ `advanceStepped()` (ดู `tests/session.characterization.test.tsx`)
- ไฟล์ที่เพิ่มเข้า IndexedDB ในเทสต์ต้องใช้ `Blob` จาก `node:buffer` เพราะ `fake-indexeddb` clone Blob ของ happy-dom เป็น object ธรรมดา
- `useSyncExternalStore` ต้องส่ง `getServerSnapshot` ด้วย เพราะเทสต์บางตัวใช้ `renderToString`
- ใน react-router v7 อย่าใช้ `<Navigate to="relative">` ภายใน route `*` เพราะจะ redirect ไม่สิ้นสุด ให้ใช้ path แบบ absolute
- `tests/helpers/render.tsx` มี `mount()` (นับ commit ผ่าน `<Profiler>` และมี `container`) และ `renderHook(hook, wrap?)` ส่วน `tests/helpers/session.tsx` มี `renderSession(role)` ซึ่ง mount `<SessionProvider>` ตัวจริงแล้วคืน `{ session, isPeerConnected, ...actions }`
- `tsconfig.json` รวมโฟลเดอร์ `tests` ไว้ด้วย และเปิด `noUnusedLocals` ถ้ามี import ที่ไม่ได้ใช้ `npm run build` จะพัง
- ไฟล์เดิมหลายไฟล์ใช้ CRLF ถ้าแก้ด้วยสคริปต์ต้องระวัง (Edit tool จัดการให้ได้)
- **CI ใช้ Node 22 แต่เครื่อง dev ใช้ Node 24:** ผล `Math.pow` ต่างกันที่ทศนิยมหลักสุดท้าย snapshot ที่มีตัวเลขทศนิยมจึงต้องปัดก่อน (ดู `normalizeNumbers` ใน `tests/spinViews.visual.test.tsx`)
- **PR:** [Doub1eKill/WebRandomStar#1](https://github.com/Doub1eKill/WebRandomStar/pull/1) (draft, `refactor/architecture` → `main`) เปิด Auto-fix ไว้แล้ว เมื่อ CI ล้มเหลว session จะถูกปลุกให้แก้

## 5. [Prompt for the Next AI]

```text
คุณกำลัง refactor โปรเจกต์ WebRandomStar (React 19 + Vite + TS) ที่ C:Star บน branch refactor/architecture
(push ไปที่ origin = github.com/Doub1eKill/WebRandomStar, มี draft PR #1 ที่เปิด Auto-fix ไว้)
อ่านไฟล์เหล่านี้ก่อนเริ่ม:
1) Handoff.md (ฉบับล่าสุดเสมอ; สำเนาตามวันที่อยู่ใน docs/handoff-summary-*.md)
2) docs/superpowers/plans/2026-11-24-architecture-refactor.md (Phase 0–9 ติ๊กครบแล้ว)
3) docs/superpowers/plans/2026-11-24-baseline.md

สถานะ: Phase 9 เสร็จแล้ว รอผู้ใช้อนุมัติ ห้ามเริ่ม Phase 10 เอง ให้ถามผู้ใช้ก่อน

เมื่อผู้ใช้สั่งให้ทำต่อ ให้ทำ Phase 10 (Dependencies: S9) ตามแผน และแจ้งรายการแพ็กเกจที่จะอัปเดตก่อนติดตั้ง
กติกา:
- ทำทีละ Phase และหยุดรออนุมัติ
- หน้าตาต้องเหมือนเดิม: เทียบ computed style ก่อน/หลังด้วย .claude/fp.js (หรือ screenshot) ทุกหน้า (เวทีทุก state + #/control ทุกหน้า)
- ห้ามเปลี่ยน STORAGE_KEYS หรือชื่อ BroadcastChannel; ย้ายไฟล์ด้วย git mv; import ใช้ @/
- จบ Phase ด้วย npm run lint (0 errors, 0 warnings), npm test, npm run build ที่ผ่านทั้งหมด
- ติ๊ก checklist ในแผน อัปเดต Handoff.md แล้ว commit (อ้างรหัสรายการใน message) และ git push origin refactor/architecture
- Q3 = ลบ dead code, Q4 = Playfair Display / Cinzel Decorative แทน Amoria/Verve
```
