# 👑 สรุปเชิงเทคนิค (Project Technical Summary)
## รอยต่อฤดู — Version 3.0 Royal Word Spin
### ✦ SCi TECH TINE ✦ CHARM OF TRANSITION AMBASSADOR 2026

เอกสารนี้อธิบายการทำงานภายในหลังการ refactor ปี 2026 (แผนอยู่ที่ `docs/superpowers/plans/2026-11-24-architecture-refactor.md`) ส่วนวิธีติดตั้งและใช้งานอยู่ใน [README.md](README.md)

---

## 1. ภาพรวม

- เว็บสำหรับจอโปรเจกเตอร์บนเวทีประกวด: หมุนคำสำคัญด้วยวงล้อ แล้วเปิดคำถามในหมวดเดียวกัน หรือ (โหมดคำสำคัญ) แสดงการ์ดคำแล้วเริ่มจับเวลาตอบสด
- **ไม่มี backend:** ข้อมูลอยู่ใน `localStorage`, ไฟล์เพลงอยู่ใน IndexedDB และหน้าต่างต่าง ๆ คุยกันผ่าน `BroadcastChannel`
- **ออฟไลน์ได้:** ฟอนต์ self-host ด้วย `@fontsource`, เสียงประกอบสังเคราะห์ด้วย Web Audio, ไม่มี request ออกนอกเครื่องตอนใช้งานปกติ (ยกเว้นผู้ใช้ตั้งฟอนต์ Google เองหรือเพิ่มเพลงจาก URL)

**Stack:** React 19, TypeScript ~5.7, Vite 6, react-router 7 (`HashRouter`), Vitest 4 + happy-dom 21, lucide-react, `vgpu` (WebGPU สำหรับพื้นหลัง AeroShards ซึ่งโหลดแบบ lazy)

---

## 2. หน้าและการโหลด

| Route | หน้า | หมายเหตุ |
|---|---|---|
| `#/` | `pages/stage/StagePage` | จอเวทีและ **session host** ตัวเดียว (Q2) |
| `#/control/live` | `LivePage` | ควบคุมเวที, โหมด, ผู้เข้าแข่งขัน, รอบ, มอนิเตอร์คำถาม |
| `#/control/words` · `questions` · `timer` · `music` · `contestants` · `history` · `appearance` | หน้าควบคุมอื่น ๆ | ทุกหน้า lazy-load และรีเฟรชแล้วอยู่หน้าเดิม |

- `?mode=controller` (ลิงก์เก่า) จะ redirect ไป `#/control/live`
- บนจอเวที แผงควบคุม (drawer) และ modal จะโหลดตอนเปิดครั้งแรก JS ที่จอเวทีโหลดตอนเปิดคือราว 403 KB (gzip 123 KB) จากเดิม 751 KB (gzip 208 KB)

---

## 3. Session: ใครเป็นเจ้าของสถานะ

```text
 จอเวที (#/)                                   หน้าควบคุม (#/control/*)
 ┌──────────────────────────────┐   COMMAND    ┌──────────────────────────────┐
 │ createStageHost()            │ ◄─────────── │ createControllerMirror()     │
 │  sessionReducer (pure)       │              │  เก็บสำเนา state ไว้แสดงผล    │
 │  → state + effects           │ ───────────► │                              │
 │  timer / auto-advance / เสียง │  STATE,      │  แถบเตือนเมื่อไม่มีจอเวที      │
 │  บันทึก localStorage          │  HEARTBEAT   │                              │
 └──────────────────────────────┘              └──────────────────────────────┘
          channel: season_transition_quiz_sync_v3 (มี type + validate ทุกข้อความ)
```

- `features/session/sessionReducer.ts`: reducer บริสุทธิ์ คืน state ใหม่และ "effects" (เล่นเสียง, บันทึกประวัติ, แจ้งเตือนผู้ควบคุม)
- `runtime.ts`: `createStageHost` รัน reducer, ตัวนับเวลา, การเลื่อน state อัตโนมัติตาม `STAGE_DURATION` และบันทึก session ส่วน `createControllerMirror` ส่งได้แค่คำสั่ง
- `SessionProvider.tsx`: runtime หนึ่งตัวต่อหน้าต่าง แต่ละหน้าอ่านเฉพาะส่วนที่ใช้ด้วย `useSession(selector)` และสั่งงานผ่าน `useSessionActions()`
- `persistence.ts`: ถ้ารีโหลดกลางคัน จะกลับมาที่ `question`/`answered` ได้ ส่วน state อื่นจะเริ่มใหม่ที่ `idle`
- การแจ้งเตือนผู้ควบคุม (toast มุมจอ) ใช้ channel `season_transition_operator_notices_v1` และไม่ขึ้นบนจอโปรเจกเตอร์

---

## 4. ลำดับ state บนเวที (`features/session/stateMachine.ts`)

| State | เวลา | สิ่งที่เกิดขึ้น |
|---|---|---|
| `idle` | รอ | หน้าแรกของเวที |
| `pre-spin` | 0.8 s | เตรียมหมุน และคำนวณผลด้วย seed |
| `word-spin` | 2.5 s (หรือจนกว่าจะกดหยุด ในโหมดหยุดเอง) | วงล้อหมุนเต็มความเร็ว |
| `word-decelerate` | 2.0 s | ชะลอแล้วหยุดที่คำที่คำนวณไว้ |
| `word-lock` | 1.5 s (ปิดได้) | การ์ด "SELECTED KEYWORD" |
| `question-reveal` | 1.0 s | เปิดการ์ดคำถาม (ไม่มีในโหมดคำสำคัญ) |
| `question` | รอผู้ควบคุม | แสดงคำถามและจับเวลา |
| `answered` | รอผู้ควบคุม | บันทึกประวัติ รอคนถัดไป |

---

## 5. การสุ่ม (`features/questions/questionSelector.ts`, `shared/lib/prng.ts`)

- Mulberry32 + seed ของ session ทำให้ replay ผลเดิมได้ และไม่หยิบคำถามที่ใช้ไปแล้วซ้ำ
- ถ้าไม่มีคำถามในรอบหรือหมวดที่ขอ ระบบจะขยายไปหาจากที่อื่นตามลำดับ (`fallbackReasons`) และ**เตือนผู้ควบคุม**ทุกครั้ง ส่วนถ้าไม่มีคำถามเลยจะแจ้ง error แทน `alert()`
- คำสำคัญ 10 คำและหมวด 7 หมวด (`rain`, `mist`, `wind`, `leaf`, `moon`, `star`, `final`) ชื่อหมวดเป็นธีมฤดู แต่วงจรเวทีไม่มีช่วงฝนหรือใบไม้แล้ว

---

## 6. ภาพบนเวที

- **วงล้อ (`features/stage/word-spin/`):** 4 แบบ (`vertical`, `3d`, `orbital`, `ribbon`) ใช้ `wordSpinEngine` คำนวณตำแหน่ง และอัปเดต DOM ผ่าน ref (`spinDom.ts`) จึงไม่ re-render React ทุกเฟรม
- **Cosmic Canvas (`background/canvas/`):** วาดเป็นชั้น ได้แก่ พื้นหลังไล่สี, ออโรร่า, ท้องฟ้าและดาว, มงกุฎ, คริสตัล, แสงสะท้อนผิวน้ำ, หมอก และแสงช่วงเปิดคำถาม (ตามลำดับ) ค่าความเข้มของแต่ละ state อยู่ในตาราง `stateTargets.ts`
- **AeroShards (`background/aero-shards/`):** ประติมากรรมแก้ว WebGPU โหลดแบบ lazy เมื่อเลือกโหมดนี้
- **ตัวจับเวลา:** แสดงได้ 3 แบบ (กลางจอ, มุมขวาบน, แบบย่อ) มีช่วงเตือนและวิกฤตที่ตั้งได้ และใช้ `useRemainingMs` คำนวณจากเวลาจริง จึงไม่ต้อง re-render ทั้งแอป

---

## 7. เสียงและเพลง

- **AudioContext ตัวเดียว** (`features/audio/audioContext.ts`) ใช้ร่วมกันระหว่างเสียงประกอบและเพลง
- **เสียงประกอบ (`audioEngine.ts` + `recipes.ts`):** เริ่มหมุน, tick ของวงล้อ, ล็อกคำ, เปิดคำถาม, tick ตัวจับเวลา (ดังขึ้นในช่วงเตือนและวิกฤต) และเสียงหมดเวลา ปิดแต่ละอย่างได้
- **เพลงประกอบ (`features/music/`):** player มี 2 slot สำหรับ crossfade และเลือกเพลงตาม state ของเวทีได้อัตโนมัติ
  - ไฟล์ที่อัปโหลดเก็บใน IndexedDB `RandomizeQuiz_MusicDB` และสร้าง blob URL ใหม่ทุกครั้งที่โหลด
  - preset 4 เพลงไม่มีไฟล์เสียง จึงเล่นเป็น arpeggio สังเคราะห์ (`presetArpeggio.ts`) ทุกโน้ตมีเวลา stop ของตัวเอง
  - หน้าควบคุมสั่งเพลงบนจอเวทีผ่าน `season_transition_music_v1` และซิงก์รายการเพลงผ่าน `season_transition_music_library_v1`

---

## 8. การเก็บข้อมูล

ทุกชุดข้อมูลผ่าน `createRepository` (`shared/lib/`) ซึ่ง validate ข้อมูล, cache ตาม raw string, เก็บ schema version แยกไว้ใน `season_transition_schema_versions` และอัปเดตข้ามหน้าต่างผ่าน `storage` event (`storage/useRepository.ts`)

| คีย์ localStorage | ข้อมูล | อยู่ที่ |
|---|---|---|
| `season_transition_questions` | คลังคำถาม (เดิม `season_quiz_questions_bank` ย้ายให้อัตโนมัติ) | `questionsRepository` |
| `season_transition_words` | คำสำคัญ | `wordsRepository` |
| `season_transition_contestants` | ผู้เข้าแข่งขัน (เดิม `season_quiz_contestants_list`) | `contestantsRepository` |
| `season_transition_history` | ประวัติ (เก็บล่าสุด 200 รายการ) | `features/history/historyManager.ts` |
| `season_transition_settings` | ตั้งค่าเสียงตัวจับเวลาและการแสดงผล | `features/timer/timerSettings.ts` |
| `season_transition_appearance` | หน้าตา, ฟอนต์, โหมด | `features/appearance/appearanceSettings.ts` |
| `season_transition_session` | session ล่าสุด | `features/session/persistence.ts` |
| `season_transition_questions_backup` | สำรองอัตโนมัติก่อนนำเข้าคำถาม | `features/questions/importQuestions.ts` |

- ลบข้อมูลจนหมดแล้วรีโหลด จะได้รายการว่าง (ไม่ใช่ข้อมูลตัวอย่าง)
- **ห้ามเปลี่ยนชื่อคีย์และชื่อ channel** เพราะข้อมูลบนเครื่องที่ใช้งานอยู่จะหาย

---

## 9. ความปลอดภัยของข้อมูล

- **นำเข้าคำถาม:** จำกัดขนาด 2 MB, ตรวจทุกแถว (หมวด, รอบ, ความยาก), ตัด HTML ออก, มีหน้าตรวจสอบที่เลือกได้ว่า "รวม" หรือ "แทนที่" และสำรองข้อมูลเดิมก่อนเสมอ
- **CSV:** ทุกช่องใส่เครื่องหมายคำพูด และกันสูตรสเปรดชีต (`=`, `+`, `-`, `@`)
- **ฟอนต์ custom:** ชื่อฟอนต์ถูกกรองตัวอักษร และ URL ต้องเป็น `https://fonts.googleapis.com/css` หรือ `/css2` เท่านั้น
- **CSP:** ใส่ตอน build (`vite.config.ts`) โดยมี `script-src 'self'`, Google Fonts อนุญาตเฉพาะสำหรับฟอนต์ custom, media จากทุก host (เพราะเพิ่มเพลงจาก URL ได้) และ `object-src 'none'`

---

## 10. Styles

- `src/app/styles.css` เป็นรายการ `@import` **ตามลำดับ cascade** (ฟอนต์ → token → base → ฟีเจอร์ → `shared/ui`) ห้ามสลับลำดับโดยไม่เช็ก computed style
- CSS ที่อยู่ท้าย cascade และใช้แค่หน้าควบคุม (`controlLayout.css`, `questionImport.css`, `livePage.css`, `quizModeToggle.css`) โหลดพร้อม lazy chunk ของหน้านั้น
- token สีอยู่ที่ `shared/styles/tokens.css` (`--ui-*` สำหรับหน้าควบคุม) ส่วนคอมโพเนนต์กลางอยู่ที่ `shared/ui` (`SettingGroup`, `ModeCard`) และ `features/control` (`ControlCard`, `QuizModeToggle` ที่มี variant `drawer`/`live`)

---

## 11. โครงสร้างไดเรกทอรี

```text
src/
├── app/                 main.tsx, App.tsx (HashRouter), router.tsx, styles.css
├── pages/
│   ├── stage/           StagePage (session host)
│   └── control/         ControlLayout + 8 หน้า, controlMusic.ts
├── features/
│   ├── session/         commands, sessionReducer, runtime, sessionChannel, persistence, sessionStore,
│   │                    actions, SessionProvider, stateMachine
│   ├── stage/           overlay/, word-spin/, background/{canvas, aero-shards}, KeyboardController
│   ├── timer/           timerEngine, timerSettings, useRemainingMs, TimerDisplay, panel/
│   ├── music/           musicPlayerEngine, presetArpeggio, musicStorage, musicRemote, useMusicLibrary, panel/
│   ├── audio/           audioContext, audioEngine, recipes
│   ├── questions/       questionSelector, importQuestions, QuestionImportDialog, QuestionManagerModal, bank/
│   ├── words/  contestants/  history/
│   ├── appearance/      typography, appearanceSettings, panel/
│   └── control/         ControlDrawer, ControlCard, QuizModeToggle, useStageControls
├── shared/
│   ├── lib/             createRepository, csv, prng, useLazyRef, useHasBeenTrue
│   ├── notices/         operatorNotices, OperatorToasts
│   ├── styles/          fonts, tokens, base, modals, dashboard, toggle
│   └── ui/              ui.css, SettingGroup, ModeCard
├── storage/             repositories (STORAGE_KEYS), useRepository
├── data/                ข้อมูลเริ่มต้น: คำถาม 42 ข้อ, คำสำคัญ 10 คำ, ผู้เข้าแข่งขัน 10 คน
└── types/
```

Import ใช้ alias `@/` = `src/`

---

## 12. การทดสอบและคุณภาพ

- **277 เทสต์** (Vitest + happy-dom) ครอบคลุม reducer และ runtime, การซิงก์หลายหน้าต่าง, ตัวจับเวลา, การสุ่ม, repository และการนำเข้า, เพลง (crossfade, blob URL หลังรีโหลด, arpeggio), เสียง, routing, asset ในเครื่อง และ snapshot ของ panel และวงล้อ
- **ESLint:** ทุกกฎเป็น error (`no-explicit-any`, `exhaustive-deps`, `no-unused-vars`, `no-empty`) และโค้ดไม่มี `any` เลย
- **CI:** GitHub Actions บน Node 22 รัน `npm ci`, `lint`, `test` และ `build`
- **การเช็กหน้าตาตอน refactor:** เทียบ computed style ทุก property ก่อนและหลังในเบราว์เซอร์จริง (ดู `Handoff.md`)
- ข้อควรรู้สำหรับเทสต์: อย่า fake `setImmediate` (BroadcastChannel ของ Node ต้องใช้) และ snapshot ปัดตัวเลขเป็น 10 หลักเพราะ `Math.pow` ใน Node 22 กับ 24 ต่างกันเล็กน้อย
