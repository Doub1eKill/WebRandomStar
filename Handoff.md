# 🔄 Project Hand-Off Summary
> Generated: 2026-11-26 (อัปเดตหลัง merge PR #11 Done รีเซ็ตเวทีเอง เข้า `main`)

## 1. [Project Overview & Tech Stack]

**WebRandomStar / Season Transition Quiz (เวอร์ชัน 3.0 "Royal Word Spin")**: เว็บสุ่มคำถามสำหรับเวทีประกวดดาว–เดือน ขึ้นจอโปรเจกเตอร์ ตัวเว็บสุ่ม "คำสำคัญ" ด้วยวงล้อหมุนก่อน แล้วเปิดคำถามที่สุ่มจากรอบที่เลือก (ไม่มีระบบหมวดหมู่แล้ว ตั้งแต่ 2026-11-26) มีตัวจับเวลา ประวัติ เพลงประกอบ และหน้าควบคุมระยะไกลในอีกหน้าต่าง

- **Stack:** React 19, TypeScript ~5.7, Vite 6, Vitest 4 + happy-dom 21, react-router 7 (`HashRouter`), lucide-react, `vgpu` (WebGPU สำหรับพื้นหลัง AeroShards ซึ่งโหลดแบบ lazy)
- **ไม่มี backend:** ข้อมูลเก็บใน localStorage ส่วนไฟล์เพลงเก็บใน IndexedDB หน้าต่างต่าง ๆ ซิงก์กันผ่าน `BroadcastChannel`
- **Repo:**
  - โคลนจาก `peak822/WebRandomStar` (commit ฐาน `0885cd9`) มาไว้ที่ `C:\Star` บน Windows
  - remote `origin` = `github.com/Doub1eKill/WebRandomStar` (private)
  - remote `upstream` = repo ต้นฉบับ
  - งาน refactor ทำบน branch `refactor/architecture` และ **merge เข้า `main` แล้ว** (merge commit `da0d00d`, 2026-11-25) ลบ branch `refactor/architecture` และ `docs/architecture-refactor-plan` แล้วทั้งในเครื่องและบน GitHub (ทุก commit อยู่ใน `main` ครบ hash ที่อ้างในเอกสารจึงยังใช้ได้) ตอนนี้ origin มีแค่ `main`
  - ไม่ส่งงานกลับ `upstream` เพราะเพื่อนส่งต่อโปรเจกต์นี้มาให้แล้ว (ผู้ใช้ยืนยัน) งานจึงอยู่ใน fork `Doub1eKill/WebRandomStar`
- **เป้าหมาย:** refactor ตามแผน 12 Phase ใน `docs/superpowers/plans/2026-11-24-architecture-refactor.md` (Master Fix List 55 รายการ: B1–B15, PF1–PF12, S1–S9, A1–A10, D1–D7, O1–O3) โดย **หน้าตาและขั้นตอนบนเวทีต้องเหมือนเดิม** ยกเว้นจุดที่แผนระบุว่าเป็นการแก้บั๊ก
- **กติกาที่ผู้ใช้สั่งไว้:**
  - ทำทีละ Phase แล้ว **หยุดรออนุมัติทุก Phase**
  - **ทุก Phase ต้องอัปเดต Handoff.md, commit และ push**

## 2. [Completed Milestones]

ทุก Phase จบด้วย tsc + lint (0 errors) + เทสต์ + build ผ่าน และทดสอบในเบราว์เซอร์จริงแล้ว (Phase 1 ขึ้นไป)

| Phase | Commit | สรุป |
|---|---|---|
| แผน | `39e9f27` | แผน refactor + Master Fix List (เดิมอยู่บน branch `docs/architecture-refactor-plan` ซึ่งลบแล้ว commit อยู่ใน `main`) |
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
| 10 | `0bb5808` | S9: vite 6.4.3 → 6.4.6, vitest 3 → **4.1.12** (เลิกใช้ tinypool), happy-dom 20 → **21.0.4**, `overrides` บังคับ `@modelcontextprotocol/server` เป็น `^2.4.0` (`vgpu` 0.5.0 และ 0.6.0 ล็อก 2.0.0 ไว้ จึงไม่อัปเกรด vgpu), zod และ source-map-js อัปเดตใน lockfile, `allowScripts` อนุญาตแค่ `esbuild` (deny `webgpu`, `@vgpu/adapter-node`), `npm audit` จาก 9 รายการ (critical 2, high 6) เหลือ **0** ส่วน bundle เหมือนเดิม (`index-B-H4j1M7.js` 403 KB) |
| 11 | `f72b909` | ตรวจรับ: รายงานที่ `docs/superpowers/plans/2026-11-25-acceptance.md` ตัวชี้วัดผ่าน 7 จาก 9 ข้อ (JS ตอนเปิด 123 KB gzip เกินเป้า ~110 เพราะ react-router และ `AeroShards.tsx` 737 บรรทัด), ทดสอบสองหน้าต่างบน `vite preview` ผ่านครบ 10 รายการ (gong ดัง 1 ครั้ง, เพลงที่อัปโหลดเล่นได้หลังรีโหลด, เพลงไม่ซ้อน ฯลฯ), Master Fix List แก้ครบ ยกเว้น A2/PF11 ที่ทำบางส่วนพร้อมเหตุผล, เพิ่ม `tests/assets.test.ts` (B12), README/PROJECT_SUMMARY อัปเดตเป็น 277 เทสต์ และ Vitest 4 |
| Design: Control | `115c7d5` (PR #2) | ผู้ใช้สั่ง "ปรับ Desire (= Design) ของฝั่ง Control ทั้งหมด": ธีม **Backstage Console** ใช้กับหน้ารีโมต `#/control/*` ทั้ง 8 หน้า (เวทีกับ drawer ไม่เปลี่ยน) — token `--ctl-*` ใน `tokens.css` (สี nebula-violet `#7c3aed` / diamond-cyan `#38bdf8` ของเวทีแทน indigo `#6366f1`, พื้นกรมท่าเข้ม, ฟอนต์ Prompt แทน system-ui), `controlLayout.css` เป็นธีมทั้งหน้าต่าง scope ใต้ `.control-app` (ปรับ class ร่วมของ dashboard/appearance/modals ด้วย specificity ไม่ต้องแก้ไฟล์ร่วม), header ใหม่มี pill สถานะเชื่อมต่อจอเวที/สถานะเวที/session, แท็บแบบ pill พร้อม badge จำนวน, focus ring สีฟ้า (WCAG 2.4.7), prefers-reduced-motion, ปุ่มเล็กในตารางคำถามใหญ่ขึ้น, หน้า Live เป็น 2 คอลัมน์สมดุล, หน้าผู้เข้าแข่งขันใช้ class แทน inline (`aria-pressed`) ส่วน inline style ใน panel ที่ใช้สี indigo/slate เปลี่ยนเป็น `var(--ctl-*)` / สีโทนเดียวกัน ตรรกะไม่เปลี่ยน |
| Design: ไอคอนแทน emoji | `ac03e24` (PR #2) | ผู้ใช้สั่ง "ปรับ UX UI ให้ใช้งานสะดวกและสวย เปลี่ยน Emoji เป็น Icon ทั้งหมด ห้ามใช้ Emoji": emoji/สัญลักษณ์ (เช่น ✦ ↺ ● ✕ ✓) ในหน้า `#/control/*` ทุกหน้า, modal จัดการคำถาม/คำสำคัญ/ผู้เข้าแข่งขัน และ `ControlDrawer` บนเวที เปลี่ยนเป็นไอคอน lucide-react (มีอยู่แล้ว ไม่เพิ่ม dependency) — `shared/ui/icons.tsx` (`CategoryIcon` ตามหมวด, `MusicPhaseIcon`), `SettingGroup`/`ModeCard` รับ `icon: ReactNode`, `ControlCard` มี prop `icon`, ไอคอนหัวข้อเป็น tile สีม่วงใน `ui.css` (`.ui-ico-label` จัดไอคอน+ข้อความ), ใน `<option>` ใส่ svg ไม่ได้จึงตัดสัญลักษณ์ออก, ปุ่มไอคอนอย่างเดียวมี `aria-label`, หน้า Live มีไอคอนตามหมวดบนชิปคำและ empty state ของมอนิเตอร์ ข้อมูล `CATEGORY_CONFIGS.icon` ยังอยู่ (UI แค่ไม่แสดงแล้ว) ส่วนลวดลาย ✦/◆ บนจอเวทีฝั่งผู้ชมไม่ได้แตะ ตรรกะไม่เปลี่ยน |
| UI: ลำดับแท็บ | `81efcc3` (PR #3) | ผู้ใช้สั่ง "ปรับ Timer ไปอยู่ข้าง Stage" และ "ต่อด้วยเพลงประกอบ": แท็บหน้ารีโมตเป็น Stage → Timer → เพลงประกอบ → คำสำคัญ → คำถาม → ผู้เข้าแข่งขัน → ประวัติ → หน้าตา (`ControlLayout.tsx` + `CONTROL_PAGES`) URL ทุกหน้าเหมือนเดิม |
| Fix: ความเร็ววงล้อ | `e0612fc`, `38ea0eb` (PR #3) | ผู้ใช้แจ้ง "ตอนสุ่มเดี๋ยวเร็วเดี๋ยวช้า": ช่วงชะลอเดิมใช้เวลาตายตัวไปหาเป้าที่อยู่ห่าง 8–50 ช่อง จึงกระโดดเร็วขึ้น 3–18 เท่า (วัดใน Chrome: 3.8 → ~40 คำ/วินาที) แก้ใน `wordSpinEngine.ts`: วางเป้าไว้ตรงจุดหยุดของการหมุนอัตโนมัติ (`plannedTargetIndex`), เบรกแบบ Hermite ที่เริ่มเท่าความเร็วหมุนแล้วลดลงอย่างเดียว (`brakePosition`, 1.7s ภายในช่วง word-decelerate 2s), ถ้าหยุดผิดแผนจะเขียนเป้าลงช่องนอกจอ (`chooseStopSlot`, `spinViewLookahead`) หลังแก้วัดได้สูงสุด 3.81/13.08 คำ/วินาที และหยุดตรงเป้า เทสต์ `tests/spinSpeed.test.tsx` (281 เทสต์) STAGE_DURATION ไม่เปลี่ยน ต่อมาผู้ใช้สั่ง "ปรับความเร็วสุ่มคลังคำถามให้พอๆ กับคำสำคัญ": `SPIN_SPEED_ITEMS_PER_MS.question` 0.0038 → 0.013 (13 ข้อ/วินาที เท่าคำสำคัญ วัดใน Chrome แล้ว หยุดตรงเป้า) |
| Content: คำสำคัญ 20 คำ | `6aa266e` (PR #5) | ผู้ใช้ส่งรายการ 20 คำ (2026-11-26): `src/data/defaultWords.ts` เปลี่ยนจาก 10 คำเดิมเป็น คุณค่าในตัวเอง (Self-Worth) … ความเป็นมนุษย์ (Humanity) ตามลำดับที่ให้มา `englishTheme` = คำภาษาอังกฤษ (ขึ้นบนเวทีตอนล็อกคำ) และ `category` ผูกหมวดคำถามตามความหมาย (star 4, mist 3, moon 3, rain 3, wind 3, leaf 2, final 2) snapshot `spinViews` อัปเดตเพราะใช้ 12 คำแรก (ต่างแค่ข้อความ) เบราว์เซอร์ที่เคยบันทึกคลังคำเองต้องกด "คืนค่าเริ่มต้น" ในหน้าคลังคำสำคัญ |
| UI: หน้าต่างแก้ไขคำสำคัญ | `9a0694b` (PR #4, merge `53ec99a`, ลบ branch แล้ว) | ผู้ใช้ส่งภาพหน้าต่าง Edit Keyword ที่ไม่มีสไตล์ (class `modal-panel`/`form-group`/`form-input` ไม่มี CSS เลย) แล้วสั่ง "ปรับส่วนนี้": `WordManagerModal` ใช้ class `kw-*` ใน `features/words/wordManagerModal.css` (โหลดกับ chunk คลังคำ) — label อยู่เหนือช่อง, ช่องสูง 44px พร้อม focus ring, หมวดหมู่กับธีมอังกฤษอยู่แถวเดียวกัน, การ์ดตัวอย่างคำ (สี + ไอคอนหมวด) อัปเดตตามที่พิมพ์, สวิตช์เปิดใช้งานแบบการ์ด, ปุ่มยกเลิก/บันทึกชิดขวา, `role=dialog` + label ผูกกับช่อง, กด Esc เพื่อปิด ข้อมูลที่บันทึกเหมือนเดิม |
| Fix: AeroShards ไม่ขึ้น | `4929153` (PR #6) | ผู้ใช้แจ้ง "พื้นหลังไม่เปลี่ยน" (กดแล้วเหมือนโหลดใหม่แต่ยังเป็น Cosmic Canvas): ใน Chrome ของผู้ใช้ `navigator.gpu.requestAdapter()` คืน `null` AeroShards จึงล้มแล้ว `StageBackground` สลับกลับ Cosmic Canvas แบบเงียบ ๆ และค้างอย่างนั้นจนรีโหลด แก้ใน `StageBackground.tsx`: ส่ง `notifyOperator('error', …)` พร้อมข้อความจาก WebGPU (ขึ้นที่มุมหน้า control เพราะจอเวทีซ่อน toast เมื่อรีโมตเชื่อมอยู่) และล้างสถานะล้มเมื่อเปลี่ยนโหมด จึงสลับไป Cosmic แล้วกลับมาเพื่อลองใหม่ได้ ทดสอบใน browser pane บน `vite preview`: ปิด `navigator.gpu` → toast ขึ้นในหน้า control, คืนค่าแล้วสลับกลับ → AeroShards mount ใหม่ไม่ล้ม ต้นเหตุฝั่งผู้ใช้ไม่ใช่โค้ด ดู "ข้อควรรู้" |
| Content: TINE → THE | `603b269` (PR #6) | ผู้ใช้สั่ง "เปลี่ยน TINE เป็น THE": `✦ SCI TECH THE ✦` บนหัวเวที (`StageHeader.tsx`), หัวหน้า control (`ControlLayout.tsx`), `<title>`/description ใน `index.html`, `tests/setup.test.ts`, README, PROJECT_SUMMARY ส่วนแผน/สเปกเก่าใน `docs/` และ `Plan/` คงชื่อเดิมไว้เพราะเป็นบันทึกย้อนหลัง |
| Refactor: เอาหมวดหมู่ออก | `ba71ce6` (PR #7) | ผู้ใช้สั่ง "ปรับแก้ระบบเอาหมวดหมู่ออก" และเลือกขอบเขต "ลบออกจากระบบทั้งหมด": ลบ `Question.category`, `KeywordItem.category`, `HistoryRecord.category`, `SessionState.selectedCategory`, `QuestionCategory`, `CATEGORY_CONFIGS`, `CategoryIcon` และ fallback `category-empty` คำถามสุ่มจากรอบที่เลือกอย่างเดียว คำสำคัญกับคำถามไม่ผูกกัน (`selectTargetWord(words, seed)`) ข้อมูลเก่าที่มีหมวดโหลดได้: `withoutCategory()` ใน `storage/repositories.ts` ตัดทิ้งตอนโหลด (คำถาม/คำสำคัญ/ประวัติ) และ `persistence.ts` ตัด `selectedCategory` ของ session ส่วนการนำเข้า JSON ละ `category` ไว้ หน้าจอ: เอาป้ายหมวดออกจากเวที (word lock, การ์ดคำสำคัญ, ribbon) และรีโมต (ตัวกรอง/คอลัมน์/ช่องกรอกในคลังคำถาม คลังคำสำคัญ หน้าต่างเพิ่มคำ, มอนิเตอร์ Live, ประวัติ และคอลัมน์ Category ใน CSV) คอลัมน์ "จำนวนคำถาม" ในคลังคำสำคัญก็เอาออก (เดิมนับตามหมวด) id คำถามเดิม (`Q_RAIN_01` ฯลฯ) คงไว้เพราะ `usedQuestionIds` อ้างอยู่ |
| Feature: รีเซ็ตคำถามที่ใช้แล้ว | `9a6f6f8` (PR #8) | ผู้ใช้ถาม "ทำไมขึ้นว่าใช้แล้ว" (Q_WIND_01 ใน Chrome: `usedQuestionIds` มีข้อนี้แต่ประวัติว่าง เพราะกด Done แล้วล้างประวัติทีหลัง ซึ่งไม่คืนสถานะคำถาม และไม่มีทางรีเซ็ต) แล้วสั่ง "เพิ่มปุ่มรีเซ็ต": คำสั่ง session `RESET_USED_QUESTIONS` (รับจากรีโมตได้) ล้าง `usedQuestionIds` โดยไม่แตะสถานะเวทีและประวัติ ปุ่ม "รีเซ็ตคำถามที่ใช้แล้ว (n)" ในคลังคำถาม (ข้าง Import JSON) ถามยืนยันแล้วล้างทั้งรายการของ session และธง `used` ในคลัง กดไม่ได้เมื่อ n = 0 เทสต์ `tests/resetUsedQuestions.test.tsx` (285 เทสต์) |
| Feature + Fix: คำสำคัญที่ใช้แล้ว | `dc5793d` (PR #9) | ผู้ใช้สั่ง "เพิ่มให้คำสำคัญด้วย": session มี `usedWordIds` (optional, session เก่าไม่มี) กด Done ในโหมดคำสำคัญแล้วจำคำนั้น การสุ่มข้ามคำที่ใช้แล้วจนกว่าจะใช้ครบ แล้วแจ้งเตือนและวนซ้ำ (`selectTargetWord(words, seed, usedWordIds)`, `allWordsUsed`) คำสั่ง `RESET_USED_WORDS` หน้าคลังคำสำคัญมีการ์ด "ใช้แล้ว" ป้าย "ใช้แล้ว" และปุ่ม "รีเซ็ตคำที่ใช้แล้ว (n)" **บั๊กที่เจอและแก้ (ผู้ใช้สั่ง "แก้ด้วย")**: เดิมโหมดคำสำคัญยังสุ่มคำถามแอบไว้ พอกด Done จึงบันทึกคำถามนั้นลงประวัติและนับเป็นใช้แล้ว ตอนนี้โหมดคำสำคัญไม่สุ่มคำถาม (เริ่มได้แม้คลังคำถามว่าง) Done บันทึกคำสำคัญ (`KW_<wordId>`) Skip ใช้คำสำคัญ และมอนิเตอร์ Live แสดงคำสำคัญ เทสต์ 294 |
| UX: สุ่มต่อหลัง Done | `0a3e368` (PR #10) | ผู้ใช้สั่ง "ทำให้สุ่มต่อได้เลยโดยไม่ต้องกด Reset": `stageControls` มี `canSpin` (idle หรือ answered) ปุ่ม SPIN WORD ในหน้า Live และ drawer ใช้ค่านี้ และบนเวทีกด Space/Enter ตอน answered แล้วหมุนรอบใหม่ทันที (เดิมรีเซ็ตไป idle ก่อน) reducer ไม่ต้องแก้ เพราะ `START_JOURNEY` จาก answered สุ่มใหม่ ตั้งตัวจับเวลาใหม่ และเปลี่ยนเพลงอยู่แล้ว ปุ่ม Reset ยังอยู่ เทสต์ 296 |
| UX: Done รีเซ็ตเวทีเอง + ปุ่มคืนคำ | `e8400f7` (PR #11) | ผู้ใช้สั่ง "หลังกด Done ให้ Reset เวทีอัตโนมัติ แล้วเอาปุ่ม Reset ออก" และเลือก "ทันที" กับ "เปลี่ยนปุ่ม Reset เป็นปุ่มคืนคำที่สุ่มแล้วทั้งหมด": `MARK_ANSWERED` บันทึกประวัติและนับใช้แล้ว แล้วกลับ idle ทันทีผ่าน `backToIdle()` (ไม่มีการ์ด answered และเพลงฉลองแล้ว) `RESET_STAGE` ใช้ helper เดียวกันและคงไว้ใน protocol ส่วนปุ่ม "รีเซ็ตเวที" ในหน้า Live และ drawer เปลี่ยนเป็น "คืนคำที่สุ่มแล้วทั้งหมด (n)" (`stageControls.drawnCount` / `returnAllDrawn` → `RESET_USED_QUESTIONS` + `RESET_USED_WORDS` ถามยืนยัน ประวัติยังอยู่) ข้อจำกัด: หมุนผิดแล้วยกเลิกรอบไม่ได้ ต้อง Skip + Done (ผู้ใช้รับทราบแล้ว) เทสต์ 297 |

**ตัวเลขล่าสุด:**
- เทสต์ผ่าน **281/281** (44 ไฟล์), **lint 0 ปัญหา ทุกกฎเป็น error**, `npm audit` **0**
- inline style **445** จุด (เดิม 574), CSS หลัก 87.0 KB (gzip 14.4 KB รวม `@font-face` ของฟอนต์ที่ self-host) ส่วน CSS ของหน้าควบคุมบางส่วนโหลดพร้อม lazy chunk
- ไม่มี request ออกไปภายนอกตอนใช้งานปกติ (ยกเว้นตอนผู้ใช้ตั้งฟอนต์ custom ของ Google หรือเพิ่มเพลงจาก URL)
- JS ที่จอเวทีโหลดตอนเปิด **403 KB (gzip 123 KB)** เทียบกับ baseline 751 KB (gzip 208 KB)
- PR: [Doub1eKill/WebRandomStar#1](https://github.com/Doub1eKill/WebRandomStar/pull/1) **merged** เข้า `main` แล้ว (CI `verify` ผ่านบน `a68bafb` ก่อน merge)

**การตัดสินใจของผู้ใช้:**
- Q1 = react-router
- Q2 = จอเวทีเป็น host ตัวเดียว
- Q5 = ให้เลือกตอนนำเข้า (UI มีทั้ง "รวม" และ "แทนที่")
- Q6 = ESLint + CI ทำไปแล้ว ผู้ใช้ไม่ได้คัดค้าน
- Q3 = ลบ dead code (D1–D4) ออกเลย เพราะกู้คืนจาก git ได้ (รวม `legacyRemote.css`)
- Q4 = ใช้ฟอนต์ฟรี (OFL) ที่หน้าตาใกล้เคียงแทน: Amoria → **Playfair Display**, Verve → **Cinzel Decorative** โดย self-host ผ่าน `@fontsource` และแก้ชื่อบนการ์ดให้ตรงกับฟอนต์จริง (ไฟล์ Amoria/Verve ตัวจริงมีแจกแค่บนเว็บรวมฟอนต์ภายนอก Amoria เป็นรุ่น demo ที่ใช้ได้แค่ส่วนตัว ส่วน Verve ไม่มีใบอนุญาตเชิงพาณิชย์ที่ยืนยันได้ จึงไม่ดาวน์โหลด)

## 3. [Current Task & Blockers]

- **สถานะ:** แผน refactor ครบทุก Phase และ merge เข้า `main` แล้ว (`da0d00d`) งานปรับดีไซน์ฝั่ง Control ทั้งหมด + เปลี่ยน emoji เป็นไอคอน (ดูแถว "Design: Control" และ "Design: ไอคอนแทน emoji" ด้านบน) **merge เข้า `main` แล้ว** ผ่าน [Doub1eKill/WebRandomStar#2](https://github.com/Doub1eKill/WebRandomStar/pull/2) (merge commit `d9a0567`, 2026-11-25, ผู้ใช้สั่ง merge; CI `verify` ผ่านบน `cdacb09` ส่วน commit หลังจากนั้นแก้แค่ Handoff.md) และลบ branch `design/control-backstage` แล้วทั้งในเครื่องและบน GitHub (ทุก commit อยู่ใน `main` แล้ว) origin เหลือแค่ `main` งานถัดมา (ลำดับแท็บ + ความเร็ววงล้อ ดูสองแถวสุดท้ายในตาราง) **merge เข้า `main` แล้ว** ผ่าน [Doub1eKill/WebRandomStar#3](https://github.com/Doub1eKill/WebRandomStar/pull/3) (merge commit `bb167ca`, 2026-11-25, ผู้ใช้สั่ง merge; CI `verify` ผ่านบน `38ea0eb`) และลบ branch `ui/timer-tab-next-to-stage` แล้วทั้งในเครื่องและบน GitHub origin เหลือแค่ `main` งานถัดมา (คำสำคัญ 20 คำ ดูแถว "Content: คำสำคัญ 20 คำ") **merge เข้า `main` แล้ว** ผ่าน [Doub1eKill/WebRandomStar#5](https://github.com/Doub1eKill/WebRandomStar/pull/5) (merge commit `d28455e`, ผู้ใช้สั่ง merge; CI `verify` ผ่านบน `447c5b4`) และลบ branch `content/keywords-20` แล้วทั้งในเครื่องและบน GitHub origin เหลือแค่ `main` งานล่าสุด (แก้ AeroShards ไม่ขึ้น + TINE → THE ดูสองแถวสุดท้ายในตาราง) **merge เข้า `main` แล้ว** ผ่าน [Doub1eKill/WebRandomStar#6](https://github.com/Doub1eKill/WebRandomStar/pull/6) (merge commit `18b077f`, 2026-11-26, ผู้ใช้สั่ง merge; CI `verify` ผ่านบน `439c419`) และลบ branch `fix/stage-title-and-webgpu-notice` แล้วทั้งในเครื่องและบน GitHub origin เหลือแค่ `main` งานถัดมา (เอาหมวดหมู่ออก ดูแถว "Refactor: เอาหมวดหมู่ออก") **merge เข้า `main` แล้ว** ผ่าน [Doub1eKill/WebRandomStar#7](https://github.com/Doub1eKill/WebRandomStar/pull/7) (merge commit `1c06c5c`, ผู้ใช้สั่ง merge; CI `verify` ผ่านบน `cd73750`) และลบ branch `refactor/remove-categories` แล้วทั้งในเครื่องและบน GitHub origin เหลือแค่ `main` งานถัดมา (ปุ่มรีเซ็ตคำถามที่ใช้แล้ว ดูแถว "Feature: รีเซ็ตคำถามที่ใช้แล้ว") **merge เข้า `main` แล้ว** ผ่าน [Doub1eKill/WebRandomStar#8](https://github.com/Doub1eKill/WebRandomStar/pull/8) (merge commit `ce487b1`, ผู้ใช้สั่ง merge; CI `verify` ผ่านบน `5b24406`) และลบ branch `feat/reset-used-questions` แล้วทั้งในเครื่องและบน GitHub origin เหลือแค่ `main` งานถัดมา (คำสำคัญที่ใช้แล้ว + แก้บั๊กโหมดคำสำคัญ ดูแถว "Feature + Fix: คำสำคัญที่ใช้แล้ว") **merge เข้า `main` แล้ว** ผ่าน [Doub1eKill/WebRandomStar#9](https://github.com/Doub1eKill/WebRandomStar/pull/9) (merge commit `1385464`, ผู้ใช้สั่ง merge; CI `verify` ผ่านบน `f3cedea`) และลบ branch `feat/reset-used-words` แล้วทั้งในเครื่องและบน GitHub origin เหลือแค่ `main` งานถัดมา (สุ่มต่อหลัง Done ดูแถว "UX: สุ่มต่อหลัง Done") **merge เข้า `main` แล้ว** ผ่าน [Doub1eKill/WebRandomStar#10](https://github.com/Doub1eKill/WebRandomStar/pull/10) (merge commit `e9ac000`, ผู้ใช้สั่ง merge; CI `verify` ผ่านบน `ac25f5e`) และลบ branch `feat/spin-again-after-done` แล้วทั้งในเครื่องและบน GitHub origin เหลือแค่ `main` งานถัดมา (Done รีเซ็ตเวทีเอง + ปุ่มคืนคำ ดูแถว "UX: Done รีเซ็ตเวทีเอง + ปุ่มคืนคำ") **merge เข้า `main` แล้ว** ผ่าน [Doub1eKill/WebRandomStar#11](https://github.com/Doub1eKill/WebRandomStar/pull/11) (merge commit `a913b24`, ผู้ใช้สั่ง merge; CI `verify` ผ่านบน `688496d`) และลบ branch `feat/auto-reset-after-done` แล้วทั้งในเครื่องและบน GitHub origin เหลือแค่ `main` ตอนนี้ไม่มีงานค้าง
  - ต้นเหตุที่ AeroShards ไม่ขึ้นใน Chrome ของผู้ใช้ยังไม่ได้แก้ (เป็นที่ Chrome ไม่ใช่โค้ด ดู "ข้อควรรู้") ผู้ใช้ได้ขั้นตอนแก้ไปแล้ว ยังไม่ได้ยืนยันผล
  - กติกาใหม่จากผู้ใช้: **ห้ามใช้ emoji ใน UI ฝั่ง Control** ให้ใช้ไอคอน lucide-react แทน
- **ขั้นต่อไป (ให้ผู้ใช้ตัดสินใจ):**
  - ถ้าต้องการให้ drawer บนจอเวที (`ControlDrawer`) ใช้ธีมสีเดียวกัน ต้องทำเพิ่ม (รอบนี้เปลี่ยนแค่ emoji เป็นไอคอน)
  - ลวดลาย ✦ ✧ ◆ ◇ บนจอเวทีฝั่งผู้ชม (หัวเวที, การ์ดคำ, วงล้อ) คงไว้เป็นตัวอักษรตามที่ผู้ใช้ตัดสินใจ (2026-11-25) (มีเทสต์ `tests/setup.test.ts` ตรวจข้อความ `✦ SCI TECH THE ✦` อยู่)
  - ก่อนวันงาน: วัด FPS/React Profiler บนเครื่องหน้างานจริง และลองเปิดเวทีตอนตัดเน็ต (ดูข้อ 5 ในรายงานตรวจรับ)
  - งานที่เลือกทำต่อได้ (ไม่อยู่ในแผน): แยก `AeroShards.tsx` / `ControlDrawer.tsx` / `musicPlayerEngine.ts` ให้ต่ำกว่า ~400 บรรทัด (A2), ย้าย inline style ที่เหลือ (PF11)
- **ไฟล์ที่ยังใหญ่ (ตั้งใจเหลือไว้):**
  - `AeroShards.tsx` 730: effect WebGPU ก้อนเดียวที่แชร์ state ผ่าน closure
  - `shaders.ts` 666: WGSL
  - `musicPlayerEngine` ~540 และ `ControlDrawer` 528
- **คำถามที่ยังค้าง:**
  - ไม่มี (Q3 และ Q4 ได้คำตอบแล้ว ดูหัวข้อการตัดสินใจของผู้ใช้)
- **ข้อควรรู้:**
  - **AeroShards ต้องการการ์ดจอจริงใน Chrome:** บนเครื่องผู้ใช้ Chrome รายงาน WebGL renderer เป็น `ANGLE (Microsoft, Microsoft Basic Render Driver … D3D11)` คือวาดด้วย CPU (WARP) WebGPU จึงขึ้น `No available adapters` ส่วนเบราว์เซอร์ในแอป Claude บนเครื่องเดียวกันได้ adapter และวาด AeroShards ได้ (การ์ดจอใช้ได้ ปัญหาอยู่ที่ Chrome) ขั้นแก้ที่ให้ผู้ใช้ไป: `chrome://restart`, เปิด "Use graphics acceleration" ใน `chrome://settings/system`, `chrome://flags` → ANGLE backend เป็น Default (หรือ Reset all), Windows Graphics settings ของ Chrome, เช็ก `--disable-gpu`/`--use-angle=warp` ใน shortcut ถ้ายังไม่หาย ให้ดู `chrome://gpu` (Graphics Feature Status / Problems Detected) **เครื่องหน้างานจริงต้องเช็กเรื่องนี้ก่อนวันงาน** ถ้าใช้ไม่ได้ Cosmic Canvas ยังใช้ได้เสมอ
  - **หลัง `npm run build` ต้องกด F5 ทั้งหน้าเวทีและหน้า control:** แค่เปลี่ยน URL หลัง `#` ไม่โหลด JS ใหม่ หน้าที่เปิดค้างจึงยังรัน build เก่า (เคยทำให้สับสนตอนทดสอบ)
  - **git identity:** เครื่องนี้ไม่มี `user.name`/`user.email` แบบ global ตั้งไว้ระดับ repo (`git config user.name peak822`) ตาม commit ก่อนหน้า
  - **snapshot กับ line ending:** หลัง `npm test` ไฟล์ `tests/__snapshots__/*.snap` อาจขึ้นว่าแก้ไขทั้งที่ต่างแค่ CRLF/LF ให้ `git checkout -- tests/__snapshots__` ก่อน commit (เช็กด้วย `git diff --ignore-cr-at-eol --stat`)
  - **CSP ใส่แค่ตอน build** (`vite.config.ts` → `CONTENT_SECURITY_POLICY`): ถ้าเพิ่มฟีเจอร์ที่โหลดของจาก host อื่น ต้องแก้ policy และทดสอบด้วย `npx vite build && npx vite preview` (ตั้งไว้ใน `.claude/launch.json` ชื่อ `vite-preview` port 4173) เพราะ dev server ไม่มี CSP จึงไม่เห็นปัญหานี้
  - **ลำดับ CSS สำคัญ:** `src/app/styles.css` เป็นรายการ `@import` ตามลำดับ cascade เดิม ห้ามสลับลำดับโดยไม่เช็ก computed style ไฟล์ที่ import จากคอมโพเนนต์ (lazy chunk) จะโหลดหลัง CSS หลักเสมอ จึงใช้ได้เฉพาะกับ CSS ที่ควรอยู่ท้าย cascade
  - เครื่องมือเช็กหน้าตา: `.claude/fp.js` (ไม่ได้ commit) ใช้ใน dev server ด้วย `await import('/.claude/fp.js')` แล้วเรียก `save(name, selector)` หรือ `compare(name, selector)` เพื่อบันทึก computed style ทุก property ลง IndexedDB แล้วเทียบ ตัวเครื่องมือจะทำ transition ให้จบก่อนวัด และ rewind keyframe animation ไปที่ t=0 ข้อควรระวัง: แท็บต้องอยู่หน้า (rAF ไม่ทำงานในแท็บพื้นหลัง)
  - การ์ดของ drawer กับหน้า Live ใช้ `ControlCard`/`QuizModeToggle` ร่วมกันแล้ว แต่ข้อความปุ่ม, icon และเงื่อนไข disabled ของ pause/skip ต่างกันมาแต่เดิม จึงยังไม่ได้รวม เพราะถ้ารวมพฤติกรรมของหน้าใดหน้าหนึ่งจะเปลี่ยน
  - เบราว์เซอร์จะหน่วง timer ในแท็บที่ถูกซ่อน จึงควรเปิดหน้าเวทีไว้ในหน้าต่างที่มองเห็นได้ ปุ่ม popout เปิดรีโมตเป็นหน้าต่างแยกอยู่แล้ว และระบบเตือนผู้ควบคุมเมื่อหน้าเวทีถูกซ่อน
  - **state เก่าของ v2** (`rain`, `water-drop`, `mist`, `wind`, `leaf`, `sky-clear`) คือลำดับเวทีแบบเล่าเรื่องฤดูก่อนจะมีวงล้อคำ ใช้จริงจนถึง commit `179d876` (15 ก.ย. ในโปรเจกต์ต้นฉบับ) หลังจากนั้นเข้าถึงไม่ได้อีก และลบไปใน Phase 9 ถ้าจะเอากลับมา โค้ดเดิมอยู่ที่ commit ฐาน `0885cd9` เช่น `git show 0885cd9:src/components/Stage/canvas/LeafSystem.ts`
  - **install scripts:** `package.json` → `allowScripts` อนุมัติ `esbuild@0.25.12` แบบระบุเวอร์ชัน ถ้า esbuild เปลี่ยนเวอร์ชัน (เช่นตอนอัปเดต vite) ต้องรัน `npm install-scripts approve esbuild` ใหม่ ส่วน `webgpu` และ `@vgpu/adapter-node` ถูก deny เพราะเป็น native adapter ของ Node ที่เว็บไม่ได้ใช้ (CI ใช้ npm 10 ซึ่งไม่รู้จัก `allowScripts` จึงรัน script ทั้งหมดเหมือนเดิม)
  - **`overrides` ของ `@modelcontextprotocol/server`:** ถ้า `vgpu` ออกเวอร์ชันที่ไม่ล็อก 2.0.0 แล้ว ให้ลบ override ออก
  - **Vitest 4:** ถ้ามี `console.*` (เช่นคำเตือน act ของ React) ที่ยังส่งไม่เสร็จตอน worker ปิด จะนับเป็น error (`EnvironmentTeardownError ... onUserConsoleLog`) เทสต์ที่ mount หน้าควบคุมต้องรอ async (IndexedDB ของคลังเพลง) ให้เสร็จใน `act()` ก่อน unmount (ดู `afterEach` ใน `tests/routing.test.tsx`)
  - **ธีมหน้ารีโมต (Backstage Console):** ปรับสีทั้งหน้าต่างได้จาก token `--ctl-*` ใน `src/shared/styles/tokens.css` ส่วน rule อยู่ใน `src/pages/control/controlLayout.css` (ทุก rule ขึ้นต้นด้วย `.control-app` จึงไม่กระทบเวที) ถ้าเพิ่ม class ใหม่ในหน้า control ให้ใช้ token เหล่านี้ ไม่ใช้สี indigo `#6366f1` อีก
  - **ถ่าย screenshot หน้า control ความละเอียดเต็ม:** pane ของแอปแคบ (~464px) ใช้ Edge headless แทนได้ เช่น `msedge --headless=new --hide-scrollbars --window-size=1366,900 --screenshot=out.png "http://localhost:3000/#/control/live"` (profile ใหม่จึงไม่มีจอเวทีเปิด แถบเตือน "ไม่พบหน้าจอเวที" จะขึ้น และ headless กว้างได้ไม่ต่ำกว่า ~500px)
  - **happy-dom 21** ไม่โหลด stylesheet ภายนอกเป็นค่าเริ่มต้น (เทสต์จึงไม่ออกเน็ต) และ `vite.config.ts` → `test.environmentOptions` ตั้ง `handleDisabledFileLoadingAsSuccess` ไว้ เพื่อไม่ให้พิมพ์ DOMException

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
- **PR:** [Doub1eKill/WebRandomStar#1](https://github.com/Doub1eKill/WebRandomStar/pull/1) (`refactor/architecture` → `main`) merged แล้ว งานใหม่ให้แตก branch ใหม่จาก `main` แล้วเปิด PR ใหม่ (CI `.github/workflows/ci.yml` รัน lint/test/build บนทุก PR)

## 5. [Prompt for the Next AI]

```text
คุณกำลังดูแลโปรเจกต์ WebRandomStar (React 19 + Vite + TS) ที่ C:Star
(origin = github.com/Doub1eKill/WebRandomStar; งาน refactor merge เข้า main แล้วผ่าน PR #1, ไม่ส่งกลับ upstream)
อ่านไฟล์เหล่านี้ก่อนเริ่ม:
1) Handoff.md (ฉบับล่าสุดเสมอ; สำเนาตามวันที่อยู่ใน docs/handoff-summary-*.md)
2) docs/superpowers/plans/2026-11-24-architecture-refactor.md (Phase 0–11 ติ๊กครบแล้ว)
3) docs/superpowers/plans/2026-11-25-acceptance.md (ผลตรวจรับ) และ 2026-11-24-baseline.md

สถานะ: แผน refactor ครบทุก Phase แล้ว ห้ามเริ่มงานใหม่เอง ให้ถามผู้ใช้ก่อน
PR #1 merge เข้า main แล้ว
ตัวเลือกถัดไป: ทำงานเสริมนอกแผน (A2 แยกไฟล์ใหญ่, PF11 inline style) ถ้าผู้ใช้สั่ง
โดยแตก branch ใหม่จาก main แล้วเปิด PR ใหม่ (ห้าม merge เองถ้าผู้ใช้ไม่สั่ง)
กติกา:
- ทำทีละขั้นและหยุดรออนุมัติ
- หน้าตาต้องเหมือนเดิม: เทียบ computed style ก่อน/หลังด้วย .claude/fp.js (หรือ screenshot) ทุกหน้า (เวทีทุก state + #/control ทุกหน้า)
- ห้ามเปลี่ยน STORAGE_KEYS หรือชื่อ BroadcastChannel; ย้ายไฟล์ด้วย git mv; import ใช้ @/
- จบ Phase ด้วย npm run lint (0 errors, 0 warnings), npm test, npm run build ที่ผ่านทั้งหมด
- ติ๊ก checklist ในแผน อัปเดต Handoff.md แล้ว commit (อ้างรหัสรายการใน message) และ push branch ของงานนั้น
- Q3 = ลบ dead code, Q4 = Playfair Display / Cinzel Decorative แทน Amoria/Verve
```
