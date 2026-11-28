# 👑 รอยต่อฤดู — Royal Word Spin (V3.0)
## ระบบสุ่มคำถามบนเวทีประกวด ✦ SCi TECH THE ✦ CHARM OF TRANSITION AMBASSADOR 2026

> เว็บสำหรับจอโปรเจกเตอร์บนเวทีประกวดดาว–เดือน: หมุน **"คำสำคัญ"** บนวงล้อ แล้วเปิดคำถามที่สุ่มจากรอบที่เลือก พร้อมตัวจับเวลา เพลงประกอบ ประวัติการตอบ และหน้าควบคุมระยะไกลในอีกหน้าต่าง
> React 19 + TypeScript + Vite ไม่มี backend และ**ใช้งานแบบออฟไลน์ได้** (ฟอนต์ เสียง และข้อมูลทั้งหมดอยู่ในเครื่อง)

รายละเอียดเชิงเทคนิค (สถาปัตยกรรม, state, ข้อมูลที่เก็บ) อยู่ใน [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

---

## 🌟 ฟีเจอร์หลัก

- **Royal Word Spin:** วงล้อคำสำคัญ 4 แบบ (แนวตั้ง, ทรงกระบอก 3D, วงโคจร, ริบบิ้น) ผลการสุ่มคำนวณล่วงหน้าด้วย seed (Mulberry32) แล้วค่อยชะลอวงล้อให้หยุดที่คำนั้นพอดี หยุดได้ทั้งแบบอัตโนมัติ (4.5 วินาที) และกดหยุดเอง
- **สองโหมดการแข่งขัน:** สุ่มจากคลังคำถาม (เปิดการ์ดคำถาม) หรือสุ่มเฉพาะคำสำคัญ (แสดงการ์ดคำแล้วเริ่มจับเวลาตอบสด)
- **ตัวจับเวลา:** อิงเวลาจริง (`startTimestamp`) จึงตรงกันทุกหน้าต่าง มี preset, ช่วงเตือนและวิกฤต, เสียง tick/เตือน/หมดเวลา และแสดงได้ 3 แบบ (กลางจอ, มุมขวาบน, แบบย่อ)
- **หน้าควบคุม 8 หน้า:** ควบคุมเวที, คลังคำสำคัญ, คลังคำถาม (นำเข้า JSON ได้ทั้งแบบ "รวม" และ "แทนที่" มีหน้าตรวจสอบก่อนนำเข้าและสำรองอัตโนมัติ), ตัวจับเวลา, เพลงประกอบ, ผู้เข้าแข่งขัน, ประวัติ (ส่งออก CSV/JSON) และปรับแต่งหน้าตา
- **พื้นหลังเวที 2 แบบ:** Cosmic Canvas (Canvas 2D) และ AeroShards (WebGPU โหลดเฉพาะตอนเลือก)
- **เสียง:** เสียงประกอบสังเคราะห์สดด้วย Web Audio API และเพลงประกอบแต่ละช่วงของเวที (อัปโหลดไฟล์เองหรือใช้ preset ที่เป็น arpeggio สังเคราะห์)
- **ฟอนต์:** Cinzel, Outfit, Prompt (ไทย), Playfair Display และ Cinzel Decorative ฝังมากับแอป (OFL-1.1 ผ่าน `@fontsource`) หรือใส่ฟอนต์ Google ของตัวเองก็ได้

---

## 🖥️ การใช้งานบนเวที (สองหน้าต่าง)

1. เปิด `http://localhost:3000/` (หรือไฟล์ที่ build แล้ว) บนจอโปรเจกเตอร์ **หน้านี้เป็นตัวหลัก (host)** ที่เก็บสถานะการแข่งขัน
2. กด `Esc` เพื่อเปิดแผงควบคุมบนเวที แล้วกด **"🖥️ เปิดหน้าต่างแยกจอ (Dual Display)"** หรือเปิด `#/control/live` เองในอีกหน้าต่างของเบราว์เซอร์เดียวกัน
3. หน้าควบคุมจะส่งคำสั่งไปที่จอเวทีผ่าน `BroadcastChannel` ถ้าจอเวทีปิดอยู่จะมีแถบเตือนด้านบน

ข้อควรรู้:
- ทั้งสองหน้าต่างต้องเปิดใน**เบราว์เซอร์และโปรไฟล์เดียวกัน** และ origin เดียวกัน
- ให้หน้าจอเวทีแสดงอยู่ตลอด (ไม่ย่อหรือซ่อนแท็บ) เพราะเบราว์เซอร์จะหน่วง timer ของแท็บที่ถูกซ่อน
- ลิงก์เก่า `?mode=controller` จะพาไปที่ `#/control/live` ให้อัตโนมัติ

### ส่งภาพเข้า OBS (เห็นแค่เวที)

เปิดหน้าเวทีด้วย `?obs=1` เช่น `http://localhost:4173/#/?obs=1` หน้านี้จะแสดงเฉพาะเวที: ไม่มีแผงควบคุม, คีย์ลัดไม่ทำงาน (กด `Esc` ก็ไม่เปิดแผง), ไม่มีข้อความแจ้งเตือน, คลิกไม่ได้ และไม่มีเคอร์เซอร์ ให้คุมทั้งหมดจาก `#/control/live` ในอีกหน้าต่าง

```powershell
Start-Process chrome -ArgumentList '--new-window','--app=http://localhost:4173/#/?obs=1','--window-size=1920,1080'
```

ใน OBS ใช้ **Window Capture** เลือกหน้าต่างเวที (Capture Method: Windows 10 (1903 and up), ปิด Capture Cursor, ติ๊ก Client area) และ **Application Audio Capture** ของ `chrome.exe` สำหรับเสียง อย่าใช้ Display Capture และอย่าใช้ Browser Source ของ OBS (เป็นเบราว์เซอร์แยก จึงเชื่อมกับหน้าควบคุมใน Chrome ไม่ได้)

---

## ⌨️ คีย์ลัดบนจอเวที

| ปุ่ม | การทำงาน |
|---|---|
| `Space` | ว่าง → เริ่มหมุน · กำลังหมุน → หยุดหมุน · แสดงคำถาม → ตอบแล้ว · ตอบแล้ว → รีเซ็ต · ช่วงอื่น → หยุดชั่วคราว/เล่นต่อ |
| `Enter` | เหมือน `Space` แต่ช่วงอื่นจะ**ข้ามไปที่คำถาม**แทนการหยุดชั่วคราว |
| `T` | เริ่ม / หยุด / เล่นต่อ ตัวจับเวลา |
| `Esc` | เปิด/ปิดแผงควบคุมบนเวที |
| `M` | ปิด/เปิดเสียง |
| `F` | เข้า/ออกโหมดเต็มจอ |

กดค้างจะไม่ยิงซ้ำ และคีย์ลัดจะไม่ทำงานขณะพิมพ์ในช่องกรอกข้อความ

---

## 🚀 การติดตั้งและคำสั่ง

ต้องใช้ Node.js 22 ขึ้นไป

```bash
npm install          # ติดตั้ง dependencies
npm run dev          # dev server ที่ http://localhost:3000
npm test             # Vitest (277 เทสต์)
npm run lint         # ESLint (ทุกกฎเป็น error)
npm run build        # type-check + build ลง dist/
npm run preview      # เปิด build จริงเพื่อทดสอบ (มี Content-Security-Policy)
```

- CI (GitHub Actions, Node 22) รัน `lint`, `test` และ `build` ทุกครั้งที่ push
- CSP ใส่ให้เฉพาะตอน build (ดู `vite.config.ts`) เพราะ dev server ต้องใช้ inline script ถ้าเพิ่มฟีเจอร์ที่โหลดของจาก host อื่น ให้ทดสอบด้วย `npm run build && npm run preview`

---

## 📁 โครงสร้างโดยย่อ

```text
src/
├── app/        # main.tsx, App (HashRouter), router (#/ = เวที, #/control/<หน้า>), styles.css (ลำดับ CSS)
├── pages/      # stage/StagePage (host) และ control/* (8 หน้า + ControlLayout)
├── features/   # session, stage, timer, music, audio, questions, words, contestants, history, appearance, control
├── shared/     # lib (createRepository, csv, prng, …), notices, styles (tokens, base, fonts, …), ui
├── storage/    # repositories (STORAGE_KEYS) และ useRepository
├── data/       # คำถาม 42 ข้อ, คำสำคัญ 10 คำ, ผู้เข้าแข่งขัน 10 คน (ค่าเริ่มต้น)
└── types/
tests/          # Vitest + happy-dom
public/         # leaf.svg (favicon)
```

---

## 📜 เครดิตฟอนต์

Cinzel, Cinzel Decorative (Natanael Gama), Outfit, Prompt (Cadson Demak) และ Playfair Display (Claus Eggers Sørensen) ใช้สัญญาอนุญาต SIL Open Font License 1.1 ติดตั้งผ่านแพ็กเกจ `@fontsource/*`
