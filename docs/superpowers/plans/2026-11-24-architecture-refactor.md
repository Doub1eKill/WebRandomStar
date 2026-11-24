# แผนปรับโครงสร้างใหม่ทั้งระบบ (Architecture Refactor, Bug Fix & Performance)

> **For agentic workers:** ทำทีละ Phase ตามลำดับ แต่ละ Phase ต้องจบด้วย `npm test` และ `npm run build` ผ่าน 100% แล้วค่อย commit ใช้ checkbox (`- [ ]`) ติดตามงาน และอ้างรหัสรายการ (เช่น `B2`, `PF4`) ใน commit message

**Goal:** แยกไฟล์และหน้าให้เป็นระบบตามฟีเจอร์ แก้บั๊กที่พบทั้งหมด ลดงาน render และขนาดไฟล์ที่ต้องโหลดตอนเปิดจอเวที และเพิ่มความปลอดภัยของข้อมูล **โดยที่หน้าตาและขั้นตอนบนเวทีต้องเหมือนเดิม** ยกเว้นจุดที่ระบุไว้ว่าเป็นการแก้บั๊ก

**Tech Stack:** React 19, TypeScript 5.7, Vite 6, Vitest 3 + happy-dom (dependency ใหม่ที่ตั้งใจเพิ่ม: router จากข้อ Q1 และ ESLint จากข้อ Q6)

**Baseline (วัดเมื่อ 2026-11-24 จาก commit `0885cd9`):** เทสต์ผ่าน 144/144, build ผ่าน, ไม่มี ESLint และไม่มี CI

**ระดับความมั่นใจของแต่ละรายการ:** ✅ = ยืนยันจากโค้ดแล้ว · ⚠️ = น่าจะเกิดตามการอ่านโค้ด ต้องเขียนเทสต์ยืนยันก่อนแก้

---

## 1. รายการที่ต้องแก้ทั้งหมด (Master Fix List)

### 1.1 บั๊ก (B)

| # | ปัญหา | ตำแหน่ง | วิธีแก้ | Phase |
|---|---|---|---|---|
| B1 ✅ (ยืนยันด้วยเทสต์ Phase 0) | ทุกหน้าต่างรันตัวเลื่อน state และตัวนับเวลาของตัวเอง และหน้าต่างรีโมตเรียก `useStageSync('controller')` ซ้ำ 2 ครั้ง ทำให้เสียงหมดเวลาน่าจะดังซ้ำ 2–3 ครั้ง (`:156` เล่นซ้ำทุกครั้งที่ได้ `TIMER_FINISH`) และการเลื่อน state อาจกระตุก | `App.tsx:48`, `RemoteController.tsx:42`, `useStageSync.ts:156,181-279` | ให้จอเวทีเป็น host ตัวเดียว ส่วนรีโมตส่งได้แค่คำสั่ง (ข้อ 3.3) | 3 |
| B2 ✅ (ยืนยันด้วยเทสต์ Phase 0) | **เพลงที่อัปโหลดเองน่าจะเล่นไม่ได้หลังรีโหลด** เพราะ blob URL (`blob:...`) ถูกบันทึกลง IndexedDB และ localStorage ไปด้วย ตอนโหลดกลับ เงื่อนไข `t.blob && !t.url` จึงเป็นเท็จ ระบบเลยไม่สร้าง URL ใหม่ แล้วไปใช้ URL ที่ตายแล้ว ผลคือเกิด `error` แล้วสลับไปเล่นแบบ simulated (ไม่มีเสียง) | `musicStorage.ts:103-105,136-138,154,170` | ไม่บันทึก `url` ลง storage และสร้าง URL ใหม่จาก blob ทุกครั้งที่โหลด แล้วเพิ่มเทสต์จำลองรอบ save → reload | 2 |
| B3 ✅ (ยืนยันด้วยเทสต์ Phase 0) | เปลี่ยนเพลงเร็วกว่าเวลา fade (เช่น `pre-spin` 800ms แต่ fade 1s) แล้ว `playTrack` ไปเรียก `cancelAllFades()` ซึ่งหยุด interval ของ fade-out ก่อนที่จะสั่ง `pause()` เพลงเก่าจึงค้างเล่นซ้อนกับเพลงใหม่ | `musicPlayerEngine.ts:211,232-234,306-331` | ใช้ fade แยกต่อ slot และเมื่อยกเลิก fade ต้อง pause slot ที่กำลังออกเสมอ (หรือย้ายไปใช้ `GainNode.linearRampToValueAtTime`) | 2 |
| B4 ✅ | `playTrack` เช็ก "เพลงเดิมกำลังเล่น" **หลัง**จากหยุด synth และยกเลิก fade ไปแล้ว ถ้าสั่งเล่นเพลง preset เดิมซ้ำจะเงียบ และ fade-in ที่ค้างครึ่งทางจะทำให้เสียงเบาค้าง | `musicPlayerEngine.ts:208-220` | ย้ายการเช็กขึ้นไปบรรทัดแรกของฟังก์ชัน | 2 |
| B5 ✅ (ยืนยันด้วยเทสต์ Phase 0) | ทั้งสอง audio slot ผูก `error` → `startSimulatedPlayback()` ไว้ ถ้า slot ที่ไม่ได้ใช้เกิด error ก็จะไปเริ่มนับเวลาจำลองซ้อนกับเพลงจริง | `musicPlayerEngine.ts:75-78` | รับเฉพาะ error จาก slot ที่ active | 2 |
| B6 ✅ | ระดับเสียงไม่สม่ำเสมอ: fade-in ใช้ `defaultVolume × volume` แต่ `setMasterVolume`/`setMuted` ตั้ง `audio.volume = volume` โดยไม่คูณ `defaultVolume` พอปรับ volume แล้วเพลงจึงดังขึ้นทันที | `musicPlayerEngine.ts:136-143,160-169,250` | คำนวณ volume ผ่านฟังก์ชันเดียว `effectiveVolume(track)` | 2 |
| B7 ✅ | ลบผู้เข้าแข่งขัน คำถาม หรือคำ จนหมดแล้วรีโหลด ระบบจะเอาข้อมูลตัวอย่างกลับมา เพราะเช็ก `parsed.length > 0` | `storage.ts:29,52,103` | แยกกรณี "ยังไม่เคยบันทึก" (`null`) ออกจาก "บันทึกเป็นรายการว่าง" และถ้าคลังว่างให้แสดงคำเตือนแทน | 4 |
| B8 ✅ | แก้ข้อมูลจากรีโมตแล้วจอเวทีไม่อัปเดต: `App` เก็บ `contestants`/`words` ไว้ใน state ครั้งเดียว และ `StageOverlay` memo `loadWords()` ด้วย `[]` ทำให้ป้ายชื่อและวงล้อแสดงข้อมูลเก่า | `App.tsx:68-70`, `StageOverlay.tsx:44-52` | ใช้ repository ที่ subscribe `storage` event (ข้อ 4) | 4 |
| B9 ✅ | คีย์ลัดยิงซ้อนกับปุ่ม: ถ้าปุ่มใน drawer ถูก focus อยู่แล้วกด Space/Enter ปุ่มจะทำงานพร้อมคีย์ลัด (เช่น เริ่มแล้วหยุดทันที) และการกดค้างก็ยิงซ้ำ เพราะไม่เช็ก `e.repeat` | `KeyboardController.tsx:21-35` | ข้าม event เมื่อ `e.repeat` เป็นจริง, เมื่อ target เป็น `button`/`[contenteditable]`/`[role=button]` หรืออยู่ใน drawer/modal | 2 |
| B10 ✅ | `alert()` โผล่บนจอโปรเจกเตอร์ตอนไม่มีคำถามเหลือ | `useStageSync.ts:305` | ใช้ toast ที่แสดงเฉพาะฝั่งผู้ควบคุม | 2 |
| B11 ✅ | ตัวสุ่มเปลี่ยนไปหยิบรอบหรือหมวดอื่นแทนโดยไม่บอก และเมื่อคำถามหมดคลังก็วนกลับมาใช้ซ้ำแบบเงียบ ๆ | `questionSelector.ts:45-74` | คืนค่า `fallbackReason` แล้วแสดงคำเตือนให้ผู้ควบคุม โดยตรรกะการเลือกยังเหมือนเดิม | 2 |
| B12 ✅ | ไม่มีโฟลเดอร์ `public/` ทำให้ favicon `/leaf.svg` เป็น 404 และฟอนต์ Amoria/Verve ไม่มีไฟล์ | `index.html:5`, `index.css` (`/fonts/*`) | เพิ่ม `public/` พร้อม favicon และฟอนต์ หรือเอา preset ออก (ข้อ Q4) | 8 |
| B13 ✅ | **ความเสี่ยงที่ refactor จะสร้างขึ้นเอง:** `markAnswered` คำนวณเวลาที่ใช้จาก `remainingMs` ใน session ซึ่งตอนนี้ถูกอัปเดตทุก 100ms ถ้าเลิกอัปเดตตาม PF1 แล้วไม่แก้จุดนี้ เวลาที่บันทึกใน history จะเป็น 0 | `useStageSync.ts:388` | คำนวณจาก `startTimestamp` ด้วย `calculateRemainingMs()` ณ ตอนกด และเพิ่มเทสต์ | 1 (ทำพร้อม PF1) |

### 1.2 ประสิทธิภาพ (PF)

| # | ปัญหา | ตำแหน่ง | วิธีแก้ | Phase |
|---|---|---|---|---|
| PF1 ✅ | ตัวนับเวลาเรียก `setSession` ทุก 100ms ทำให้ `App`, `StageOverlay`, `ControlDrawer` และ callback ทั้ง 20 ตัวถูกสร้างใหม่ราว 10 ครั้งต่อวินาที | `useStageSync.ts:268` | ให้ `TimerDisplay` ใช้ hook `useRemainingMs(timerState)` อัปเดตตัวเองตัวเดียว | 1 |
| PF2 ✅ | `useRef(new XSystem())` 10 จุด สร้าง object ทิ้งในทุก render | `StageCanvas.tsx:29-40` | ใช้ lazy init (`useLazyRef`) | 1 |
| PF3 ✅ | ไม่มี code splitting: JS ก้อนเดียว 750 KB (gzip ~212 KB) จอเวทีต้องโหลด WebGPU ~215 KB และโค้ดแผงควบคุม ~163 KB ที่ยังไม่ได้ใช้ | ทั้ง bundle | ใช้ `React.lazy` กับ AeroShards+`vgpu`, RemoteController/ControlCenter, ControlDrawer และหน้าควบคุมทุกหน้า | 1, 5 |
| PF4 ✅ | WordCarousel เรียก `setFloatOffset` ทุกเฟรม rAF ระหว่างวงล้อหมุน จึง re-render carousel และ view ทั้งหมด 60 ครั้งต่อวินาที | `WordCarousel.tsx:79,89` | เก็บตำแหน่งไว้ใน ref แล้วเขียน `transform` หรือ CSS variable ลง DOM ตรง ๆ ให้ React render เฉพาะตอน `currentIndex` เปลี่ยน | 1 |
| PF5 ✅ | `musicPlayer.notifyState()` ถูกเรียกจาก `timeupdate` (~4 ครั้งต่อวินาที) และจาก simulated playback (2 ครั้งต่อวินาที) ทำให้ `App` และ `ControlCenter` re-render ตลอดที่เพลงเล่น | `musicPlayerEngine.ts:60-66,418-430`, `App.tsx:56` | subscribe แบบ selector ให้เฉพาะคอมโพเนนต์ที่แสดงแถบเวลาเพลงฟัง `currentTime` | 1 |
| PF6 ✅ | `KeyboardController` ถอดและผูก listener ใหม่ทุก render เพราะ handler ใน `App` เป็น inline function (ผลคูณกับ PF1 คือ 10 ครั้งต่อวินาที) | `KeyboardController.tsx:67`, `App.tsx:98-134` | ผูก listener ครั้งเดียว แล้วอ่าน handler ล่าสุดผ่าน ref | 1 |
| PF7 ✅ | StageCanvas สร้าง `createLinearGradient` ใหม่ทุกเฟรม และอ่าน `window.innerWidth` ทุกเฟรม | `StageCanvas.tsx:261-314` | cache ค่าเหล่านี้ไว้ใน resize handler | 1 |
| PF8 ✅ | StageCanvas ยัง update และวาด Rain/WaterDrop/Leaf ตามเงื่อนไข ทั้งที่ทุก state ที่ใช้จริงตั้งค่าไว้ 0 | `StageCanvas.tsx:35-38,341-356` | ลบทิ้งตาม D4 | 9 |
| PF9 ✅ | มี `AudioContext` 2 ตัว (`audioEngine` และ `musicPlayer`) | `audioEngine.ts:22`, `musicPlayerEngine.ts:91` | ใช้ context และ master gain ร่วมกัน | 6 |
| PF10 ✅ | Google Fonts เป็น CSS ภายนอกที่ block การ render และถ้าหน้างานไม่มีอินเทอร์เน็ต ฟอนต์จะไม่ขึ้นเลย (ขัดกับที่ README บอกว่าออฟไลน์ได้ 100%) | `index.html:11-13` | self-host ไฟล์ woff2 ของ Cinzel/Outfit/Prompt ใน `public/fonts` + `preload` + `font-display: swap` | 8 |
| PF11 ✅ | มี inline `style={{...}}` ราว 560 จุด ซึ่งสร้าง object ใหม่ทุก render | `TimerPanel` 98, `MusicPanel` 95, `QuestionBankDashboard` 94, `AppearanceSettings` 79, `ControlCenter` 69, `HistoryPanel` 48 | ย้ายไปเป็น class และ `shared/ui` | 7 |
| PF12 ✅ | `loadQuestions()`/`loadWords()` ทำ `JSON.parse` ซ้ำหลายจุด เช่นตอนเริ่มสุ่มทุกครั้งและใน `StageOverlay` | `useStageSync.ts:287-289,389`, `StageOverlay.tsx:44-52` | ใช้ repository ที่ cache ข้อมูลไว้ในหน่วยความจำ | 4 |

### 1.3 ความปลอดภัยและความถูกต้องของข้อมูล (S)

แอปนี้ทำงานฝั่ง client ล้วน ไม่มี backend ความเสี่ยงหลักจึงอยู่ที่ข้อมูลเสียหายหรือหายกลางงาน มากกว่าการถูกเจาะจากภายนอก

| # | ปัญหา | ตำแหน่ง | วิธีแก้ | Phase |
|---|---|---|---|---|
| S1 ✅ | การนำเข้า JSON **แทนที่คลังคำถามทั้งหมดทันที** โดยไม่ถามยืนยัน ไม่สำรองข้อมูล ไม่จำกัดขนาดไฟล์ ไม่เช็กว่า `category`/`difficulty`/`round` เป็นค่าที่ระบบรู้จัก (ใช้ `as any`) และไม่เช็ก id ซ้ำ | `storage.ts:178-209`, `QuestionBankDashboard.tsx:170-187` | validator ตาม schema, หน้าพรีวิวให้เลือกรวมหรือแทนที่, สำรองอัตโนมัติก่อนแทนที่, จำกัดขนาดไว้ราว 2 MB | 4 |
| S2 ✅ | CSV injection: `escapeCSV` ไม่กันเซลล์ที่ขึ้นต้นด้วย `= + - @` หรือ tab/CR พอเปิดไฟล์ history ใน Excel ข้อความนั้นจะกลายเป็นสูตร | `storage.ts:227-231` | เติม `'` นำหน้าค่าที่ขึ้นต้นด้วยอักขระเหล่านี้ | 4 |
| S3 ✅ | ข้อมูลใน localStorage ไม่มี schema version และไม่ validate ทีละรายการ ข้อมูลที่เสียหรือเป็นรูปแบบเก่าทำให้ UI พังได้ (ตอนนี้ migration ของ key เก่าก็ทำแบบเฉพาะกิจ) | `storage.ts` ทั้งไฟล์ | ใส่ `schemaVersion` + validate ตอนโหลด + ฟังก์ชัน migrate ที่อยู่รวมกันที่เดียว | 4 |
| S4 ✅ | บันทึกไม่สำเร็จ (เช่นพื้นที่เต็ม) แล้วระบบเงียบ ระหว่างงานจริง history อาจไม่ถูกบันทึกโดยไม่มีใครรู้ | ทุก `save*` ใน `storage.ts` และ `musicStorage.ts` | คืนผลสำเร็จหรือล้มเหลว แล้วแสดง toast ฝั่งผู้ควบคุม | 4 |
| S5 ✅ | ไม่มี Content-Security-Policy | `index.html` | เพิ่ม meta CSP: `script-src 'self'` และอนุญาต `fonts.googleapis.com`/`fonts.gstatic.com` เฉพาะที่จำเป็นสำหรับฟีเจอร์ฟอนต์ custom | 8 |
| S6 ✅ | ชื่อฟอนต์ custom ถูกใส่ลง CSS variable ตรง ๆ โดยไม่ตรวจ (ความเสี่ยงต่ำ) | `typography.ts:58-59` | จำกัดอักขระให้เหลือตัวอักษร ตัวเลข ช่องว่าง `-` `,` และ `'` | 4 |
| S7 ✅ | BroadcastChannel รับ message ทุกรูปแบบแล้วเอา `payload` มาแทน session ทั้งก้อน | `useStageSync.ts:147-159` | protocol แบบมี type + validate ก่อนนำไปใช้ | 3 |
| S8 ✅ | object URL รั่ว: สร้าง URL ไว้อ่านความยาวเพลงแล้วไม่ revoke และ `getAllTracksFromStorage()` ถูกเรียกทั้งใน `App` และ `ControlCenter` จึงสร้าง URL ซ้ำทุกครั้ง | `AppearanceSettings.tsx:44`, `ControlDrawer.tsx:81`, `MusicPanel.tsx:74`, `musicStorage.ts:105` | รวมไว้ใน `useMusicLibrary` ที่สร้าง URL ครั้งเดียวและ revoke ตอนลบหรือ unmount | 2, 5 |
| S9 ✅ | dependency มีช่องโหว่ 9 รายการ (critical 2, high 6, moderate 1): vitest/tinypool, vite, happy-dom, source-map-js และ `vgpu` ที่ดึง `@modelcontextprotocol/server` + `zod` มาด้วย | `package.json` | ดู Phase 10 | 10 |

### 1.4 โครงสร้างและคุณภาพโค้ด (A)

| # | ปัญหา | ตำแหน่ง | วิธีแก้ | Phase |
|---|---|---|---|---|
| A1 ✅ | `useStageSync` (596 บรรทัด) ทำทุกอย่างในที่เดียว และทุก action ก๊อป `{...session}` จาก closure | `hooks/useStageSync.ts` | reducer + store + channel + host (ข้อ 3.3) | 3 |
| A2 ✅ | ไฟล์ใหญ่เกินไป: `AeroShards` 1,644, `ControlCenter` 960, `MusicPanel` 866, `TimerPanel` 805, `AppearanceSettings` 708, `QuestionBankDashboard` 674, `audioEngine` 503 บรรทัด | หลายไฟล์ | แยกตาม section (Phase 6) | 5, 6 |
| A3 ✅ | แผงควบคุมมี 2 ชุดที่ทำงานซ้ำกัน (`ControlDrawer` กับแท็บ `stage` ใน `ControlCenter` บรรทัด 387–808) และ handler เพลงก็ซ้ำทั้งใน `App` และ `ControlCenter` | `components/Control/*` | `features/control-sections` + `useMusicLibrary` | 5 |
| A4 ✅ | แท็บ 8 อันใน `ControlCenter` เขียนแบบ copy-paste | `ControlCenter.tsx:232-375` | ใช้ `Tabs` ที่สร้างจาก config (ซึ่งจะกลายเป็น nav ของ router) | 5 |
| A5 ✅ | มี `any` 29 จุด และ `SyncMessage.payload?: any` | `useStageSync`, `musicPlayerEngine`, `AeroShards`, `MusicPanel`, `wordSpinEngine`, `storage`, `types/session` | ใส่ type ให้ครบ แล้วเปิด ESLint `no-explicit-any` แบบ warn | 3, 6 |
| A6 ✅ | `index.css` ยาว 3,347 บรรทัดในไฟล์เดียว | `src/index.css` | แยกเป็น tokens/base/components และ CSS ของแต่ละฟีเจอร์ | 7 |
| A7 ✅ | import แบบ `../../..` และไม่มี path alias | ทั้งโปรเจกต์ | ตั้ง alias `@/` | 6 |
| A8 ✅ | `StageCanvas` ใช้ `switch` ยาว 137 บรรทัดซึ่งมีค่าซ้ำกันเกือบทั้งหมด | `StageCanvas.tsx:62-199` | ย้ายไปเป็นตาราง `stateTargets.ts` + `stateSounds.ts` | 6 |
| A9 ✅ | StageOverlay และ StageBackground ประกาศ props ที่ไม่ได้ใช้ (`onNext`, `onStopSpin`, `onOpenControlDrawer`, `onLeafLanded`, `onQuestionReady`) | `StageOverlay.tsx:15-28`, `StageBackground.tsx:6-10` | ลบออกจาก interface และจุดที่เรียกใช้ | 6 |
| A10 ✅ | ไม่มี ESLint ซึ่งถ้ามี `react-hooks/exhaustive-deps` จะจับปัญหา PF6 กับ deps ของ effect ได้ และไม่มี CI | `package.json` | เพิ่ม ESLint (typescript-eslint + react-hooks) และ GitHub Actions ที่รัน lint/test/build (ข้อ Q6) | 0 |

### 1.5 โค้ดที่ไม่ได้ใช้แล้ว (D)

| # | รายการ | หลักฐาน | Phase |
|---|---|---|---|
| D1 ✅ | `CinematicNarrator`, `SeasonJourneyBreadcrumb`, `CategoryAnnouncementBanner` | ไม่มีไฟล์ไหน import | 9 |
| D2 ✅ | `hooks/useTimer.ts` (192 บรรทัด) | ไม่มีไฟล์ไหน import ทั้งใน src และ tests | 9 |
| D3 ✅ | `selectQuestionFlow`, `audioEngine.playTimerWarning`, `audioEngine.fadeRainOut` | ไม่มีจุดเรียกใช้ | 9 |
| D4 ✅ | AppState แบบ legacy 6 ตัว (`rain`…`sky-clear`) + ค่าใน `STAGE_DURATION`, case ใน StageCanvas ที่เล่นเสียงฝน/หยดน้ำ/ลม/ใบไม้, ระบบ `RainSystem`/`WaterDropSystem`/`LeafSystem` (+ `tests/leafSystem.test.ts`) | state เหล่านี้ไม่อยู่ใน `STAGE_SEQUENCE` และถ้ารีโหลดตอนอยู่ใน state พวกนี้ ระบบจะรีเซ็ตเป็น idle จึงเข้าถึงไม่ได้ ส่วนค่า target ของ rain/drop/leaf เป็น 0 ในทุก state ที่ใช้จริง **ยังต้องเก็บ `MistSystem` และ `SkySystem` ไว้** เพราะยังวาดอยู่ | 9 |
| D5 ✅ | ชนิด `SyncMessageType` ที่ไม่ได้ส่งจริง | `useStageSync` ส่งจริง 21 จาก 27 ตัว (`STAGE_START`, `STAGE_RESUME`, `STAGE_SET_CATEGORY`, `STAGE_SET_WORD`, `STAGE_SET_WORD_BANK`, `STAGE_SET_MUSIC_STATE` ไม่มีจุดส่ง) | 3 |
| D6 ✅ | `tsconfig.tsbuildinfo` ถูก commit เข้า repo | `git ls-files` | 0 |
| D7 ✅ | `QuestionCategory` ค่าเริ่มต้น `'rain'` ใน QuestionManagerModal | `QuestionManagerModal.tsx:25` ต้องเช็กว่ายังเป็นหมวดที่ใช้อยู่จริงไหม | 9 |

### 1.6 เอกสารและ assets (O)

| # | รายการ | Phase |
|---|---|---|
| O1 ✅ | README ยังอธิบายเวอร์ชัน 2.0 (ฝน หมอก ใบไม้) และบอกว่ามีเทสต์ 49 ตัว ทั้งที่โค้ดจริงเป็น 3.0 (วงล้อคำ) และมีเทสต์ 144 ตัว ท้ายไฟล์ยังมีบรรทัด `"# WebRandomStar"` หลงอยู่ | 9 |
| O2 ✅ | `PROJECT_SUMMARY.md` (339 บรรทัด) ต้องอัปเดตให้ตรงกับโครงสร้างใหม่ | 9 |
| O3 ✅ | Vite เตือนว่ามี chunk ใหญ่เกิน 500 KB ซึ่งจะหายไปเองหลังทำ PF3 | 1 |

---

## 2. เป้าหมายที่วัดได้

| ตัวชี้วัด | ตอนนี้ | เป้าหมาย |
|---|---|---|
| JS ที่จอเวทีต้องโหลดตอนเปิด (gzip) | ~212 KB | ~110 KB (ประมาณจากการแยก chunk ทดลอง) |
| จำนวนครั้งที่ `App` render ระหว่างจับเวลา | ~10 ครั้ง/วินาที (คำนวณจากโค้ด) | 0 ครั้ง ยกเว้นตอน state เปลี่ยน |
| จำนวนครั้งที่ React render ระหว่างวงล้อหมุน | ~60 ครั้ง/วินาที | เฉพาะตอนคำที่อยู่ตรงกลางเปลี่ยน |
| ตัวนับเวลาและตัวเลื่อน state ที่ทำงานพร้อมกัน | สูงสุด 3 | 1 (จอเวที) |
| เสียงหมดเวลาต่อ 1 ครั้งที่หมดเวลา | น่าจะ 1–3 ครั้ง | 1 ครั้ง (มีเทสต์ยืนยัน) |
| ไฟล์ที่ใหญ่ที่สุด | 1,644 บรรทัด | ไม่เกิน ~400 บรรทัด (ยกเว้นไฟล์ WGSL shader) |
| ใช้งานแบบไม่มีอินเทอร์เน็ต | ฟอนต์ไม่ขึ้น | ทำงานครบทุกอย่าง |
| ช่องโหว่ใน `npm audit` | 9 | 0 critical/high ในโค้ดที่ส่งไปให้ผู้ใช้ |
| เทสต์ | 144 ผ่าน | ผ่านเท่าเดิมหรือมากกว่า และทุกรายการใน B มีเทสต์กันไม่ให้กลับมาเกิดซ้ำ |

ผลแยก chunk ทดลอง (raw / gzip, KB): react-dom 210/65, control 163/32, vgpu (รวม wgsl+core) 172/55, AeroShards 43/14, stage 50/14, other 28/9, data 25/5, engine 24/6, lucide 24/6

## 3. โครงสร้างใหม่

### 3.1 หน้า (Routes)

ใช้ hash routing เพื่อให้เปิดจากไฟล์ static ได้ทุกที่ โดยไม่ต้องตั้ง rewrite บนเซิร์ฟเวอร์

| URL | หน้า | โหลด |
|---|---|---|
| `#/` | `StagePage`: จอเวที (พื้นหลัง, overlay, คีย์ลัด, drawer) | ทันที |
| `#/control` | `ControlLayout`: header, แถบแท็บ, สถานะการเชื่อมต่อกับเวที | lazy |
| `#/control/live` (index) | `LivePage`: ควบคุมการสุ่ม, ผู้เข้าแข่งขัน, รอบ, ปรับเวลาเร็ว | lazy |
| `#/control/words` | `WordsPage` | lazy |
| `#/control/questions` | `QuestionsPage` | lazy |
| `#/control/timer` | `TimerPage` | lazy |
| `#/control/music` | `MusicPage` | lazy |
| `#/control/contestants` | `ContestantsPage` | lazy |
| `#/control/history` | `HistoryPage` | lazy |
| `#/control/appearance` | `AppearancePage` | lazy |

- ลิงก์เก่า `?mode=controller` ต้อง redirect ไป `#/control` (backward compatible)
- รีเฟรชหน้าแล้วต้องอยู่แท็บเดิม (ตอนนี้กลับไปแท็บแรก)
- `ControlDrawer` บนเวทีจะ lazy โหลดตอนกด Esc ครั้งแรก

### 3.2 โฟลเดอร์ (Feature-based)

```text
src/
├── app/
│   ├── main.tsx
│   ├── router.tsx              # routes + lazy pages + redirect ?mode=controller
│   └── providers.tsx           # store, toast
├── pages/
│   ├── stage/StagePage.tsx
│   └── control/
│       ├── ControlLayout.tsx
│       ├── LivePage.tsx … AppearancePage.tsx
├── features/
│   ├── session/                # หัวใจของระบบ (แทน useStageSync)
│   │   ├── sessionReducer.ts   # pure: (state, command, now) => state
│   │   ├── commands.ts         # discriminated union ของคำสั่งทั้งหมด
│   │   ├── sessionStore.ts     # getState/subscribe/dispatch + useSession(selector)
│   │   ├── sessionChannel.ts   # BroadcastChannel protocol แบบมี type + validate
│   │   ├── stageHost.ts        # ทำงานเฉพาะจอเวที: auto-advance, timer finish, tick sound
│   │   ├── stateMachine.ts
│   │   └── persistence.ts
│   ├── stage/
│   │   ├── overlay/            # StageOverlay, StageHeader, ContestantBadge, QuestionCard, KeywordShowcaseCard
│   │   ├── word-spin/          # WordCarousel (ref-driven) + 4 views + WordLockEffect + wordSpinEngine
│   │   ├── background/
│   │   │   ├── StageBackground.tsx
│   │   │   ├── canvas/         # StageCanvas + Aurora/Crystal/Crown/Reflection/Mist/Sky/Lighting + stateTargets.ts
│   │   │   └── aero-shards/    # lazy chunk: shaders/*.wgsl.ts, presets.ts, motion.ts, renderGraph.ts, AeroShards.tsx
│   │   └── useStageShortcuts.ts
│   ├── timer/                  # timerEngine, useRemainingMs, TimerDisplay, panel/*
│   ├── questions/              # questionSelector, repository, importExport, QuestionBank/*, QuestionManagerModal
│   ├── words/                  # wordSelector, repository, WordBank/*, WordManagerModal
│   ├── contestants/
│   ├── history/                # historyManager, repository, HistoryPanel, csv (กัน injection)
│   ├── music/                  # musicPlayerEngine, musicStorage, useMusicLibrary, useMusicStageRouter, panel/*
│   ├── audio/                  # audioContext (ใช้ร่วม), audioEngine, recipes/*
│   ├── appearance/             # types, typography, AppearancePanel/*
│   └── control-sections/       # การ์ดที่ใช้ร่วมกันระหว่าง ControlDrawer กับ LivePage
├── shared/
│   ├── ui/                     # Button, IconButton, Toggle, Slider, Tabs, Card, Modal, StatTile, DataTable, Toast
│   ├── lib/                    # prng, createRepository, schema/validate, sanitize, csv, clamp, useLazyRef
│   └── styles/                 # tokens.css, base.css, components.css
├── data/                       # คำถาม/คำ/ผู้เข้าแข่งขันเริ่มต้น
└── types/                      # เฉพาะ type ที่ใช้ข้ามหลายฟีเจอร์
public/
├── leaf.svg
└── fonts/                      # Cinzel, Outfit, Prompt (+ Amoria, Verve ถ้ามีไฟล์)
```

### 3.3 การไหลของ state แบบใหม่ (แก้ B1, PF1, A1, S7)

```text
Controller window                         Stage window (host)
─────────────────                         ───────────────────
UI → dispatch(command) ──COMMAND──▶ validate → sessionReducer → store → render
                                          │       stageHost: timeouts, timer, sounds
store ◀──────────SNAPSHOT (เมื่อ state เปลี่ยน)──┘
```

- **จอเวทีเป็นเจ้าของ state ตัวเดียว** หน้าต่างอื่นทำได้แค่ส่งคำสั่ง แล้วรับ snapshot กลับไปแสดงผล
- snapshot ส่งเฉพาะตอน state เปลี่ยน ไม่ส่งทุก tick ส่วนเวลาที่เหลือให้แต่ละหน้าคำนวณเองจาก `startTimestamp`
- `useSession(selector)` ใช้ `useSyncExternalStore` คอมโพเนนต์จะ render ใหม่เฉพาะเมื่อข้อมูลที่ตัวเองเลือกไว้เปลี่ยน
- persistence ยังใช้ key `STORAGE_KEYS.SESSION` เดิม

---

## 4. แผนทีละ Phase

แต่ละ Phase จบได้ด้วยตัวเอง (1 Phase = 1 PR) และระบบต้องใช้งานได้ทุกครั้งที่จบ Phase

### Phase 0: ตาข่ายนิรภัย, tooling และค่า baseline
- [x] สร้าง branch `refactor/architecture`
- [x] A10: เพิ่ม ESLint (typescript-eslint + `eslint-plugin-react-hooks`) และ script `npm run lint` โดยตั้งกฎใหม่เป็น warn ก่อน จะได้ไม่ block งาน
- [x] A10: เพิ่ม GitHub Actions ที่รัน `lint`, `test` และ `build` (ข้อ Q6)
- [x] D6: เอา `tsconfig.tsbuildinfo` ออกจาก git แล้วเพิ่มลง `.gitignore`
- [x] เพิ่ม characterization tests ให้ `useStageSync` ตามรูปแบบใน `tests/*.test.tsx` ที่มีอยู่ ครอบคลุม: start → question → answered (ทั้งโหมด question และ keyword), manual spin stop, `showWordLockPhase=false`, pause/resume/adjust timer, `autoStartTimerOnReveal`, การรีโหลดกลางแอนิเมชัน, การบันทึก history (รวม `timerUsedMs`)
- [x] เขียนเทสต์ที่ fail ไว้ก่อนสำหรับรายการ ⚠️ (B1, B2, B3, B5) เพื่อยืนยันว่าบั๊กมีอยู่จริง ข้อไหนเทสต์ผ่านตั้งแต่แรกให้ลดเป็น "ไม่ใช่บั๊ก" แล้วจดไว้
- [x] บันทึก baseline: ขนาด chunk, จำนวน commit ต่อวินาทีจาก React Profiler ระหว่างจับเวลาและระหว่างวงล้อหมุน และ FPS

### Phase 1: Performance quick wins (พฤติกรรมเหมือนเดิม)
- [ ] PF2: `useLazyRef` แทน `useRef(new X())`
- [ ] PF7: cache gradient และขนาดจอไว้ใน resize handler
- [ ] PF3: `React.lazy` ให้ AeroShards (โดยใช้ `StageCanvas` เป็น fallback ระหว่างโหลด), RemoteController/ControlCenter และ ControlDrawer
- [ ] PF1 + B13: เลิกเขียน `remainingMs` ลง session ทุก 100ms แล้วใช้ `useRemainingMs` ใน `TimerDisplay`, ให้ StageCanvas คำนวณ timer phase ในลูป rAF และให้ `markAnswered` คำนวณเวลาจาก timestamp
- [ ] PF4: WordCarousel แบบ ref-driven
- [ ] PF5: subscribe เพลงแบบ selector
- [ ] PF6: ผูก listener คีย์ลัดครั้งเดียว
- [ ] O3: ยืนยันว่าคำเตือน chunk เกิน 500 KB หายไปแล้ว
- [ ] วัดผลเทียบกับ baseline แล้วจดตัวเลขไว้ใน PR

### Phase 2: แก้บั๊กที่แยกทำได้ (ไม่ต้องรอโครงสร้างใหม่)
- [ ] B2: ไม่บันทึก blob URL ลง storage และสร้างใหม่ตอนโหลดทุกครั้ง (มีเทสต์ save → reload → URL ใหม่)
- [ ] B3: fade แยกต่อ slot และการยกเลิก fade ต้อง pause slot ที่กำลังออก (มีเทสต์: เปลี่ยนเพลง 2 ครั้งภายใน 500ms แล้วต้องเหลือเล่นอยู่ slot เดียว)
- [ ] B4: ย้ายการเช็กเพลงเดิมขึ้นบรรทัดแรก
- [ ] B5: รับ error เฉพาะ slot ที่ active
- [ ] B6: `effectiveVolume(track)` ใช้ที่เดียวทั้ง fade, volume และ mute
- [ ] B9: คีย์ลัดข้าม `e.repeat` และข้าม button/contenteditable/drawer/modal
- [ ] B10: toast ฝั่งผู้ควบคุมแทน `alert()` (ทำ `shared/ui/Toast` ขั้นต่ำก่อน)
- [ ] B11: `fallbackReason` + คำเตือนให้ผู้ควบคุม
- [ ] S8 (ส่วนแรก): revoke object URL ที่สร้างไว้อ่านความยาวเพลง

### Phase 3: Session core (B1, A1, A5, S7, D5)
- [ ] ย้ายตรรกะของ 20 action ใน `useStageSync` มาเป็น `sessionReducer` + `commands.ts` แบบบรรทัดต่อบรรทัด แล้วเทสต์ทุก command
- [ ] `sessionStore` + `useSession(selector)`
- [ ] `sessionChannel`: `COMMAND`, `SNAPSHOT`, `HELLO`/heartbeat (แสดงสถานะ "เวทีเชื่อมต่ออยู่") และ validate ทุก message
- [ ] `stageHost` ทำงานเฉพาะจอเวที: auto-advance, ตรวจหมดเวลา, tick/finish sound ให้ดังครั้งเดียว
- [ ] เลิกเรียก hook ซ้ำในหน้าต่างรีโมต
- [ ] D5: ลบ `SyncMessageType` เดิมที่ไม่ได้ใช้ แล้วแทนด้วย protocol ใหม่
- [ ] คง `useStageSync` ไว้เป็น wrapper ชั่วคราวที่คืน API เดิม (ลบทิ้งใน Phase 9)
- [ ] เทสต์ sync สองหน้าต่างด้วย `BroadcastChannel` จำลอง เพื่อยืนยันว่าเสียง finish เล่นครั้งเดียว และไม่มีการเลื่อน state ซ้ำ

### Phase 4: Data repositories และความปลอดภัยของข้อมูล (B7, B8, PF12, S1–S4, S6)
- [ ] `shared/lib/createRepository<T>({ key, defaults, schemaVersion, validate, migrate })` → `load/save/subscribe` พร้อม cache ในหน่วยความจำ และรับ `storage` event จากหน้าต่างอื่น
- [ ] repository ของ questions, words, contestants, history และ settings ทั้ง 3 ตัว **โดยใช้ key ใน `STORAGE_KEYS` เดิมทุกตัว** และย้าย migration ของ key เก่ามาไว้ใน `migrate`
- [ ] B7: แยก `null` ออกจาก `[]`
- [ ] S4: `save()` คืนผลลัพธ์ และถ้าล้มเหลวให้แสดง toast
- [ ] S1: validator ของคำถาม (หมวดและรอบต้องเป็นค่าที่รู้จัก, id ไม่ซ้ำ, ความยาวข้อความ), จำกัดขนาดไฟล์, หน้าพรีวิวที่เลือกรวมหรือแทนที่ และสำรองอัตโนมัติก่อนแทนที่ (ข้อ Q5)
- [ ] S2: `toCsvCell()` กัน formula injection พร้อมเทสต์
- [ ] S6: จำกัดอักขระของชื่อฟอนต์ custom
- [ ] hooks `useQuestions()`, `useWords()`, `useContestants()`, `useHistory()` แทน `loadX()` ทุกจุด (B8, PF12)
- [ ] คง `utils/storage.ts` ไว้เป็น re-export ชั่วคราว

### Phase 5: Routing และแยกหน้า (A2 บางส่วน, A3, A4, PF3, S8)
- [ ] เพิ่ม router (ข้อ Q1) และสร้าง `app/router.tsx` ตามตาราง 3.1 พร้อม redirect `?mode=controller`
- [ ] แยก `ControlCenter`: header กับ tabs ไปอยู่ `ControlLayout` (A4), แท็บ `stage` ไปเป็น `LivePage` และแต่ละแท็บที่เหลือกลายเป็นหน้าของตัวเอง
- [ ] A3: การ์ดใน `features/control-sections/` (ContestantRoundCard, StageActionsCard, FlowModeCard, DirectWordPicker, QuickTimerCard, AudioCard, SpinMusicCard) ให้ `ControlDrawer` และ `LivePage` ใช้ร่วมกัน
- [ ] A3 + S8: `useMusicLibrary` รวม add/delete/play/stop และจัดการ object URL ไว้ที่เดียว

### Phase 6: ย้ายโฟลเดอร์ และแยกไฟล์ใหญ่ (A2, A5, A7, A8, A9, PF9)
- [ ] A7: ตั้ง alias `@/` แล้วย้ายไฟล์ด้วย `git mv` เพื่อเก็บ history และแก้ import ในเทสต์ (ตอนนี้มีราว 28 path)
- [ ] `AeroShards.tsx` → `shaders/` (บรรทัด 208–872), `presets.ts` (39–72), `motion.ts` (73–207), `renderGraph.ts` (873–1012), `AeroShards.tsx` (เฉพาะคอมโพเนนต์)
- [ ] A8: `stateTargets.ts` + `stateSounds.ts` แทน `switch` ใน StageCanvas
- [ ] `MusicPanel`, `TimerPanel`, `AppearanceSettings`, `QuestionBankDashboard` → แยกเป็นคอมโพเนนต์ย่อยตาม section
- [ ] PF9: `audio/audioContext.ts` ใช้ร่วมกัน และแยก `audioEngine` ออกเป็น recipe ทีละไฟล์ โดยคง API `audioEngine.*` เดิม
- [ ] A5: ลบ `any` ที่เหลือ
- [ ] A9: ลบ props ที่ไม่ได้ใช้

### Phase 7: Styles (A6, PF11)
- [ ] แยก `index.css` เป็น `tokens.css`, `base.css`, `components.css` แล้วย้าย CSS ของแต่ละฟีเจอร์ไปไว้ข้างคอมโพเนนต์ (Vite จะตัด CSS ไปตาม lazy chunk)
- [ ] สร้าง `shared/ui/*` แล้วแทน inline style ราว 560 จุดด้วย class และคอมโพเนนต์กลาง
- [ ] เช็กหน้าตาด้วยการเทียบ screenshot ก่อนและหลังของทุกหน้า (เวทีทุก state + ทุกหน้าควบคุม)

### Phase 8: Assets, ฟอนต์ และการใช้งานแบบออฟไลน์ (B12, PF10, S5)
- [ ] สร้าง `public/` + `leaf.svg`
- [ ] PF10: self-host Cinzel/Outfit/Prompt (woff2) + `preload` + `font-display: swap` แล้วเอา `<link>` ไป Google Fonts ออก
- [ ] B12: ใส่ฟอนต์ Amoria/Verve หรือเอา preset ออก (ข้อ Q4)
- [ ] S5: meta CSP
- [ ] ทดสอบแบบตัดอินเทอร์เน็ต (DevTools → Offline): ทุกหน้าต้องทำงานและฟอนต์ต้องขึ้นครบ

### Phase 9: Cleanup และเอกสาร (D1–D4, D7, PF8, O1, O2)
- [ ] ลบโค้ดใน D1–D4 พร้อมเทสต์ที่ผูกกับโค้ดนั้น (`tests/leafSystem.test.ts`) (ข้อ Q3)
- [ ] D7: เช็กค่าเริ่มต้นของหมวดใน QuestionManagerModal
- [ ] ลบ wrapper ชั่วคราวจาก Phase 3–4 (`useStageSync`, `utils/storage.ts`)
- [ ] เปลี่ยนกฎ ESLint จาก warn เป็น error เมื่อโค้ดสะอาดแล้ว
- [ ] O1, O2: เขียน README และ PROJECT_SUMMARY ใหม่ให้ตรงกับเวอร์ชัน 3.0 (หน้าใหม่, โครงสร้าง, คีย์ลัด, วิธีใช้สองหน้าต่าง)

### Phase 10: Dependencies (S9)
- [ ] อัปเดต `vite`, `vitest`, `happy-dom` เป็นเวอร์ชันที่แก้ช่องโหว่แล้ว แล้วรันเทสต์ทั้งหมด
- [ ] `vgpu`: หาเวอร์ชันใหม่ที่ไม่ดึง `@modelcontextprotocol/server` ติดมา ถ้าไม่มี ให้ใช้ `overrides` ใน `package.json` บังคับเวอร์ชันที่แก้แล้ว หรือพิจารณาเขียน WebGPU wrapper เอง (โค้ด MCP ไม่ได้ติดไปกับ bundle จึงเป็นความเสี่ยงเฉพาะฝั่ง dev/supply chain)
- [ ] เปิด install scripts เฉพาะแพ็กเกจที่จำเป็น (`esbuild`) ด้วย `npm install-scripts approve`
- [ ] `npm audit` ต้องไม่เหลือ critical/high

### Phase 11: ตรวจรับ
- [ ] `npm run lint`, `npm test` และ `npm run build` ผ่าน
- [ ] เทียบตัวชี้วัดในข้อ 2 กับ baseline
- [ ] ทดสอบจริงแบบเปิดสองหน้าต่าง (เวที + `#/control`): สุ่มครบรอบทั้งสองโหมด, จับเวลาจนหมด (เสียงต้องดังครั้งเดียว), แก้รายชื่อจากรีโมตแล้วเวทีต้องเปลี่ยนตาม, อัปโหลดเพลงแล้วรีโหลดแล้วยังเล่นได้, เปลี่ยน phase เร็ว ๆ แล้วเพลงไม่ซ้อน, รีโหลดกลางแอนิเมชัน, สลับพื้นหลัง WebGPU ↔ Canvas, นำเข้าไฟล์ JSON ที่ผิดรูปแบบ, ใช้งานแบบออฟไลน์
- [ ] ไล่เช็กทุกรายการในข้อ 1 ว่าแก้แล้วหรือระบุเหตุผลที่ไม่แก้

---

## 5. Backward compatibility และความเสี่ยง

- **ข้อมูลเดิม:** ใช้ key localStorage และ IndexedDB ชุดเดิมทั้งหมด ส่วน `schemaVersion` ใหม่ ถ้าไม่มีให้ถือเป็นเวอร์ชัน 0 แล้ว migrate ให้อัตโนมัติ
- **ลิงก์เดิม:** `?mode=controller` ยังเปิดได้ เพราะจะ redirect ไปหน้าใหม่
- **คีย์ลัด:** Space, Enter, T, Esc, M, F ยังทำงานเหมือนเดิม ยกเว้นตอน focus อยู่ที่ปุ่มหรืออยู่ใน drawer (B9) ซึ่งเป็นการแก้บั๊กโดยตั้งใจ
- **สิ่งที่พฤติกรรมเปลี่ยนโดยตั้งใจ:**
  - ถ้าเปิดรีโมตโดยไม่ได้เปิดจอเวที แอนิเมชันกับเวลาจะไม่เดิน (ข้อ Q2)
  - ลบรายการจนหมดแล้วรีโหลด จะยังว่างอยู่ ไม่กลับมาเป็นข้อมูลตัวอย่าง (B7)
  - การนำเข้า JSON มีขั้นตอนพรีวิวและยืนยันก่อน (S1)
  - ค่าใน CSV ที่ขึ้นต้นด้วย `= + - @` จะมี `'` นำหน้า (S2)
- **ความเสี่ยงสูงสุด:** Phase 3 (แกนกลางของ state) และ PF1 กับ B13 (เวลาใน history) ต้องมีเทสต์จาก Phase 0 ครบก่อนเริ่ม และมี wrapper ชั่วคราวไว้ย้อนกลับได้
- **อย่าลบ:** `MistSystem` และ `SkySystem` ยังถูกวาดอยู่ ลบได้เฉพาะ Rain/WaterDrop/Leaf

## 6. เรื่องที่ต้องให้เจ้าของโปรเจกต์ตัดสินใจ

- **Q1 Router:** แนะนำ `react-router` (HashRouter + lazy routes) อีกทางคือเขียน hash router เองราว 60 บรรทัดโดยไม่เพิ่ม dependency
- **Q2 Host:** แนะนำให้จอเวทีเป็น host ตัวเดียว และแสดง "เวทีไม่ได้เชื่อมต่อ" ที่หน้าต่างรีโมต อีกทางคือเลือก host อัตโนมัติ ซึ่งซับซ้อนกว่าและทดสอบยากกว่า
- **Q3 Dead code:** ลบรายการ D1–D4 ทิ้งเลย หรือเก็บไว้ใน branch อื่น
- **Q4 ฟอนต์:** มีไฟล์ Amoria/Verve (และสิทธิ์ใช้งาน) ไหม ถ้าไม่มี จะเอา preset นี้ออก
- **Q5 นำเข้าคำถาม:** ค่าเริ่มต้นควรเป็น "รวมกับคลังเดิม" (แนะนำ) หรือ "แทนที่ทั้งหมด" แบบที่ทำอยู่ตอนนี้
- **Q6 Tooling:** เพิ่ม ESLint และ GitHub Actions CI ไหม (แนะนำให้เพิ่ม เพราะจะกันปัญหาแบบ PF6 ไม่ให้กลับมา)
