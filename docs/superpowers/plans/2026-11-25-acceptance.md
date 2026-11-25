# ผลตรวจรับ (Phase 11)

ตรวจเมื่อ 2026-11-25 บน branch `refactor/architecture` (ต่อจาก commit `1e24f35`) เทียบกับ [baseline](2026-11-24-baseline.md) และเป้าหมายในข้อ 2 ของ[แผน](2026-11-24-architecture-refactor.md)

## 1. คำสั่งตรวจ

| คำสั่ง | ผล |
|---|---|
| `npm run lint` | 0 errors, 0 warnings (ทุกกฎเป็น error) |
| `npm test` | 43 ไฟล์, **277/277** ผ่าน ไม่มี unhandled error (รันซ้ำ 5 รอบติดผ่านทุกรอบ) |
| `npm run build` | ผ่าน ไม่มีคำเตือน chunk เกิน 500 KB |
| `npm audit` | **0** vulnerabilities |

## 2. ตัวชี้วัดเทียบกับเป้าหมาย

| ตัวชี้วัด | Baseline | เป้าหมาย | ตอนนี้ | ผล |
|---|---|---|---|---|
| JS ที่จอเวทีโหลดตอนเปิด (gzip) | 208 KB (751 KB raw) | ~110 KB | **123 KB** (403 KB raw) | ⚠️ เกินเป้า 13 KB: ส่วนต่างเกือบทั้งหมดคือ react-router (~14 KB gzip เมื่อแยก chunk ทดลอง) ซึ่งเพิ่มเข้ามาตามข้อ Q1 หลังจากที่ตั้งเป้านี้ไว้ ก่อนเพิ่ม router (Phase 1) วัดได้ 106 KB |
| `App`/ตัวถือ session render ระหว่างจับเวลา | ~10 ครั้ง/วินาที | 0 | **0** (เหลือแค่ `TimerDisplay`) | ✅ `PF1:` ใน `tests/session.characterization.test.tsx` |
| React render ระหว่างวงล้อหมุน | 62.5 ครั้ง/วินาที | เฉพาะตอนคำตรงกลางเปลี่ยน | **12.5 ครั้ง/วินาที** | ✅ `PF4:` ใน `tests/baseline.perf.test.tsx` |
| ตัวนับเวลาและตัวเลื่อน state ที่ทำงานพร้อมกัน | สูงสุด 3 | 1 (จอเวที) | **1** | ✅ `B1: phases advance exactly once` |
| เสียงหมดเวลาต่อการหมดเวลา 1 ครั้ง | 3 | 1 | **1** (ทั้งในเทสต์และในเบราว์เซอร์จริง) | ✅ |
| ไฟล์ที่ใหญ่ที่สุด (ไม่นับ shader) | 1,644 บรรทัด | ไม่เกิน ~400 | **737** (`AeroShards.tsx`) | ⚠️ ดูข้อ A2 ด้านล่าง |
| ใช้งานแบบไม่มีอินเทอร์เน็ต | ฟอนต์ไม่ขึ้น | ทำงานครบ | ทุก request ไปที่ localhost เท่านั้น ฟอนต์ self-host | ✅ |
| ช่องโหว่ใน `npm audit` | 9 (critical 2, high 6) | 0 critical/high | **0** | ✅ |
| เทสต์ | 144 | เท่าเดิมหรือมากกว่า และทุกข้อ B มีเทสต์ | **277** และ B1–B16 มีเทสต์ครบ | ✅ (B12 เพิ่ม `tests/assets.test.ts` ใน Phase นี้) |

## 3. ทดสอบจริงแบบเปิดสองหน้าต่าง

ทดสอบบน `vite preview` (build จริงที่มี CSP) โดยให้เวที (`/`) อยู่แท็บหน้า และรีโมต (`#/control/*`) อยู่อีกแท็บ ทุกคำสั่งส่งจากรีโมต

| รายการ | วิธีทดสอบ | ผล |
|---|---|---|
| สุ่มครบรอบ โหมดคลังคำถาม | เลือกผู้เข้าแข่งขัน → SPIN WORD → Done | ✅ pre-spin → word-spin → word-decelerate → word-lock → question-reveal → question แล้ว Done บันทึกประวัติ 1 รายการ (ผู้เข้าแข่งขัน, คำถาม, รอบ ถูกต้อง) |
| สุ่มครบรอบ โหมดคำสำคัญ | สลับโหมด → Reset → SPIN WORD | ✅ ข้ามขั้น question-reveal ตามที่ออกแบบใน `stateMachine.ts` และเวทีแสดงคำสำคัญ |
| จับเวลาจนหมด เสียงดังครั้งเดียว | เริ่มจับเวลาจากรีโมตแล้วลดเหลือ 10 วินาที โดยดัก `AudioParam.setValueAtTime` บนเวทีเพื่อนับคอร์ด C4-G4-C5 ของเสียง gong | ✅ เวทีขึ้น "หมดเวลา" และ gong ดัง **1** ครั้ง |
| แก้รายชื่อจากรีโมตแล้วเวทีเปลี่ยนตาม | ลบผู้เข้าแข่งขันที่อยู่บนเวที แล้วคืนค่าเริ่มต้น | ✅ ป้ายชื่อบนเวทีหายทันที และกลับมาเมื่อคืนค่า โดยไม่ต้องรีโหลด |
| อัปโหลดเพลง แล้วรีโหลดแล้วยังเล่นได้ | อัปโหลด WAV 4 วินาที ตั้งเป็นเพลงช่วงคำถาม แล้วรีโหลดจอเวที | ✅ เล่นจาก `blob:` URL ใหม่ ไม่มี error เวลาเดินจริง และใน localStorage ไม่เก็บ URL ไว้ (B2) |
| เปลี่ยน phase เร็ว ๆ แล้วเพลงไม่ซ้อน | กด Reset/SPIN/Skip/Done สลับกัน 9 ครั้งห่างกัน 200–600ms | ✅ มี `<audio>` เล่นอยู่ตัวเดียว และ volume ขึ้นไปหยุดที่ 0.64 (= 0.8 × defaultVolume 0.8, B6) |
| รีโหลดกลางแอนิเมชัน | รีโหลดจอเวทีขณะอยู่ใน word-spin | ✅ เวทีและรีโมตกลับเป็น IDLE ตามที่ออกแบบไว้ใน `persistence.ts` |
| สลับพื้นหลัง WebGPU ↔ Canvas | เลือก AeroShards แล้วสลับกลับเป็น Cosmic Canvas | ✅ chunk AeroShards โหลดตอนเลือก และวาดด้วย WebGPU ได้ ส่วน Canvas 2D กลับมาปกติ ไม่มี error (มีแค่คำเตือน `powerPreference` ของ Chrome บน Windows) |
| นำเข้า JSON ที่ผิดรูปแบบ | JSON พัง, โครงสร้างไม่ใช่ Array, หมวดที่ระบบไม่รู้จัก และไฟล์ขนาด 2.67 MB | ✅ ทั้ง 4 แบบถูกปฏิเสธพร้อมข้อความบอกเหตุผล และคลังคำถามยังเป็น 42 ข้อ ไม่ถูกเขียนทับ |
| ใช้งานแบบออฟไลน์ | ดู host ของทุก request และฟอนต์ที่โหลด | ✅ ทุก request ไปที่ `localhost:4173` เท่านั้น ฟอนต์ 9 ไฟล์โหลดจากเครื่อง (Cinzel, Prompt ขึ้นครบ) เครื่องมือในเบราว์เซอร์นี้ตัดเน็ตจริงไม่ได้ จึงใช้หลักฐานนี้แทน |

ระหว่างทดสอบ ไม่มี error ใน console ของทั้งสองแท็บ และไม่มี CSP violation ระบบแจ้งเตือนผู้ควบคุมทำงานตามที่ควร: เตือนเมื่อสุ่มนอกหมวด (B11) และเตือนเมื่อหน้าเวทีถูกซ่อน

## 4. ไล่เช็ก Master Fix List

✅ = แก้แล้วและมีหลักฐาน · ⚠️ = แก้บางส่วน พร้อมเหตุผล

### บั๊ก (B)

| # | สถานะ | หลักฐาน |
|---|---|---|
| B1 | ✅ | `tests/session.characterization.test.tsx` (`B1:` ×2) + เบราว์เซอร์: gong 1 ครั้ง |
| B2 | ✅ | `tests/music.regressions.test.ts` + เบราว์เซอร์: เล่นได้หลังรีโหลด |
| B3–B6 | ✅ | `tests/music.regressions.test.ts` + เบราว์เซอร์: ไม่มีเพลงซ้อน, volume 0.64 |
| B7, B8 | ✅ | `tests/phase4.data.test.ts` + เบราว์เซอร์: ลบหรือคืนค่ารายชื่อแล้วเวทีเปลี่ยนทันที |
| B9 | ✅ | `tests/phase1.subscriptions.test.tsx` (ข้าม `e.repeat`) |
| B10, B11 | ✅ | `tests/operatorNotices.test.tsx` + ไม่มี `alert()` ในโค้ด + เบราว์เซอร์: notice เรื่องหมวด |
| B12 | ✅ | `tests/assets.test.ts` (เพิ่มใน Phase นี้) + `tests/appearancePanel.test.tsx` |
| B13 | ✅ | `markAnswered() records history with the time actually used` |
| B14, B15 | ✅ | `tests/musicRemote.test.tsx` + เบราว์เซอร์: สั่งเพลงจากรีโมตแล้วเวทีเล่น |
| B16 | ✅ | `tests/presetArpeggio.test.ts` |

### ประสิทธิภาพ (PF)

| # | สถานะ | หลักฐาน |
|---|---|---|
| PF1, PF4, PF5, PF6, PF12 | ✅ | เทสต์ที่ขึ้นต้นด้วยรหัสนั้น (ดูตัวเลขในข้อ 2) |
| PF2 | ✅ | `useLazyRef` ใน StageCanvas |
| PF3, O3 | ✅ | หน้าควบคุม, drawer, modal และ AeroShards เป็น lazy chunk และไม่มีคำเตือน chunk เกิน 500 KB |
| PF7 | ✅ | cache gradient/ขนาดจอไว้ใน resize handler |
| PF8 | ✅ | ระบบ Rain/WaterDrop/Leaf ถูกลบแล้ว (D4) |
| PF9 | ✅ | `new AudioContext` เหลือจุดเดียว (`features/audio/audioContext.ts`) |
| PF10 | ✅ | ฟอนต์ self-host และไม่มี request ออกนอกเครื่อง |
| PF11 | ⚠️ | inline style ลดจาก 574 เหลือราว 440 จุดตามขอบเขต Targeted ที่ตกลงใน Phase 7 ส่วนที่เหลือเป็น style ที่ขึ้นกับค่า runtime หรืออยู่ในหน้าควบคุมที่ไม่ได้ render ถี่ |

### ความปลอดภัยและความถูกต้องของข้อมูล (S)

| # | สถานะ | หลักฐาน |
|---|---|---|
| S1 | ✅ | หน้าตรวจสอบก่อนนำเข้า (รวม/แทนที่ + สำรองอัตโนมัติ) + เบราว์เซอร์: ไฟล์ผิดรูปแบบและไฟล์เกิน 2 MB ถูกปฏิเสธ |
| S2 | ✅ | `shared/lib/csv.ts` (`FORMULA_START`) + เทสต์ |
| S3, S4 | ✅ | `createRepository` (schema version, validate, notice เมื่อบันทึกไม่สำเร็จ) |
| S5 | ✅ | CSP meta ใน `dist/index.html` และไม่มี violation ตอนทดสอบ |
| S6 | ✅ | `sanitizeFontFamily` ใน `typography.ts` |
| S7 | ✅ | `sessionChannel.ts` protocol แบบมี type + validate |
| S8 | ✅ | `useMusicLibrary` สร้างและ revoke URL ที่เดียว |
| S9 | ✅ | Phase 10: `npm audit` 0 |

### โครงสร้างและคุณภาพโค้ด (A)

| # | สถานะ | หลักฐาน |
|---|---|---|
| A1, A3, A4 | ✅ | reducer + runtime + `SessionProvider`, `useStageControls`, nav ของ router |
| A2 | ⚠️ | ไฟล์ที่ยาวเกิน ~400 บรรทัด เหลือ 3 ไฟล์ (ไม่นับ `shaders.ts` 666 ที่เป็น WGSL): `AeroShards.tsx` 737 (effect WebGPU ก้อนเดียวที่แชร์ state ผ่าน closure ถ้าแยกต่อต้องเปลี่ยนเป็น class/ref ซึ่งเสี่ยงต่อการเรนเดอร์), `ControlDrawer.tsx` 528 และ `musicPlayerEngine.ts` 523 (ลดจาก 1,644 / 960 / 866 เดิม) ตั้งใจเหลือไว้ตั้งแต่ Phase 6 |
| A5 | ✅ | ไม่มี `any` ในโค้ด (คำที่เจอเป็นคอมเมนต์อธิบายของเดิม) และ ESLint `no-explicit-any` เป็น error |
| A6 | ✅ | `app/styles.css` + 15 ไฟล์ตามลำดับ cascade |
| A7 | ✅ | alias `@/` และไม่มี import `../../` |
| A8, A9 | ✅ | `stateTargets.ts` และ props ที่ไม่ได้ใช้ถูกลบ |
| A10 | ✅ | ESLint + `.github/workflows/ci.yml` |

### โค้ดที่ไม่ได้ใช้ (D) และเอกสาร (O)

| # | สถานะ | หลักฐาน |
|---|---|---|
| D1–D4 | ✅ | grep ไม่เจอชื่อคอมโพเนนต์, `useTimer`, `selectQuestionFlow`, ระบบฝน/หยดน้ำ/ใบไม้ ในโค้ด |
| D5 | ✅ | `SyncMessage`/`SyncMessageType` ถูกแทนด้วย protocol ใหม่ |
| D6 | ✅ | `git ls-files` ไม่มี `tsbuildinfo` |
| D7 | ✅ | `QuestionManagerModal` ใช้หมวดแรกของ dropdown เป็นค่าเริ่มต้น |
| O1, O2 | ✅ | README และ PROJECT_SUMMARY เขียนใหม่ตาม v3 (อัปเดตจำนวนเทสต์และเวอร์ชัน Vitest ใน Phase นี้) |

## 5. สิ่งที่ยังไม่ได้ทำ หรือควรทำต่อ

- **วัด FPS และ React Profiler บนเครื่องที่จะใช้หน้างานจริง:** ตัวเลข render ข้างบนวัดใน happy-dom ซึ่งนับจำนวน commit ได้แม่น แต่ไม่ได้วัดเวลา render จริง (ข้อนี้ค้างมาจาก baseline)
- **ทดสอบตัดเน็ตจริง:** ควรปิด Wi-Fi บนเครื่องหน้างานแล้วเปิดเวทีสักครั้งก่อนวันงาน
- **ข้อมูลทดสอบ:** ข้อมูลที่สร้างระหว่างตรวจรับ (เพลง `qa-tone`, ประวัติ 1 รายการ, การตั้งเพลงช่วงคำถาม) อยู่ใน origin `localhost:4173` ของเบราว์เซอร์ที่ใช้ทดสอบเท่านั้น ไม่กระทบ repo
