# 🕐 แผนการแก้ไข (Implementation Plan)
## อัปเกรดระบบตัวจับเวลาถอยหลัง — Countdown Timer Enhancement
### สำหรับโปรเจกต์: รอยต่อฤดู — Season Transition Question System v2.0

> **วิธีใช้เอกสารนี้:** นี่คือสเปกงานสำหรับส่งต่อให้ AI coding assistant (Claude Code, Cursor, GitHub Copilot ฯลฯ) ที่มีสิทธิ์เข้าถึงซอร์สโค้ดจริงของโปรเจกต์ ให้ AI นั้นเปิดไฟล์ที่ระบุไว้ อ่านโค้ดปัจจุบันก่อน แล้วแก้ไขตามสเปกด้านล่าง โดยต้อง**คงรูปแบบสถาปัตยกรรมเดิมไว้ทั้งหมด** (Timestamp-based Timer, Procedural Web Audio, BroadcastChannel Sync, Mulberry32 PRNG ฯลฯ)

---

## 1. เป้าหมายและขอบเขตงาน (Objective & Scope)

ผู้ใช้ต้องการยกระดับ "ประสบการณ์การนับเวลาถอยหลัง" บนเวที ให้มีความรู้สึกลุ้นระทึกและสมพระเกียรติมากขึ้น โดยมี 5 ข้อกำหนดหลัก:

| # | ข้อกำหนด | รายละเอียด |
|---|---|---|
| 1 | **ตัวเลขนับถอยหลังเด่นชัด/ใหญ่ขึ้น** | เมื่อผู้ควบคุมกดเริ่มจับเวลา ตัวเลขต้องแสดงผลใหญ่ เด่น เป็นจุดสนใจหลักของเวที |
| 2 | **เสียงติ๊กถอยหลัง** | มีเสียง "ติ๊ก" ดังทุกวินาทีระหว่างนับถอยหลัง แบบ Procedural Synthesis (ไม่ใช้ไฟล์ MP3) |
| 3 | **Toggle เปิด/ปิดเสียงจากหลังบ้าน** | ทีมงานที่ Control Center ต้องเปิด/ปิดเสียงติ๊กได้ และค่าต้องซิงก์ไปจอเวทีทันที |
| 4 | **เอฟเฟกต์ลุ้นระทึก/ตื่นเต้น** | เพิ่มแอนิเมชัน/เอฟเฟกต์ที่ทวีความเข้มขึ้นเมื่อเวลาใกล้หมด |
| 5 | **พื้นหลังสวยงามและอลังการขึ้น** | ปรับบรรยากาศฉากหลังช่วง `question` state ให้หรูหรา น่าตื่นตาตื่นใจกว่าเดิม |

**นอกขอบเขต (Out of scope):** ไม่แตะ State Machine 10 ลำดับ, ไม่แตะระบบสุ่มคำถาม (PRNG/Question Selector), ไม่แตะ History/Audit Log

---

## 2. ไฟล์ที่เกี่ยวข้อง (Files In Scope)

| ไฟล์ | ประเภทการแก้ไข |
|---|---|
| `src/components/Stage/TimerDisplay.tsx` | แก้ไขหลัก — ดีไซน์ใหม่ทั้งหมด |
| `src/engine/audioEngine.ts` | เพิ่มฟังก์ชันเสียงติ๊กใหม่ |
| `src/engine/timerEngine.ts` | ตรวจสอบ/เพิ่ม threshold logic ถ้ายังไม่มี |
| `src/hooks/useTimer.ts` | เพิ่ม hook เรียกเสียงติ๊กทุกวินาที |
| `src/components/Control/TimerPanel.tsx` | เพิ่ม UI toggle เปิด/ปิดเสียงติ๊ก |
| `src/types/timer.ts` | เพิ่ม field settings ใหม่ |
| `src/types/session.ts` | เพิ่ม field settings ใหม่ (ถ้าเก็บ global settings ตรงนี้) |
| `src/utils/storage.ts` | เพิ่มการบันทึก/โหลดค่า setting ใหม่ + migration |
| `src/hooks/useStageSync.ts` | ตรวจสอบว่า sync message ส่งค่า sound setting ข้ามจอด้วย |
| `src/index.css` | ปรับพื้นหลัง/เอฟเฟกต์ช่วง `question` state |
| `src/components/Stage/canvas/TransitionLightingSystem.ts` | (ถ้าจำเป็น) เพิ่มความเข้มแสง/vignette ตามช่วงเวลาวิกฤต |
| `tests/timerEngine.test.ts`, `tests/audioEngine.test.ts` | อัปเดตเทสให้ครอบคลุม logic ใหม่ |

---

## 3. รายละเอียดการแก้ไขแต่ละไฟล์ (File-by-File Specification)

### 3.1 `TimerDisplay.tsx` — ดีไซน์ใหม่ของตัวเลขนับถอยหลัง

**พฤติกรรมที่ต้องการ:**
- ตัวเลขนับถอยหลังต้องมีขนาดใหญ่กว่าปัจจุบันอย่างชัดเจน (แนะนำ `clamp(8rem, 15vw, 20rem)` หรือปรับตามขนาดจอ LED เวทีจริง) และอยู่กึ่งกลางจุดสนใจ
- ใช้ font ที่มีอยู่แล้วในโปรเจกต์ (Cinzel สำหรับความหรูหรา หรือ Outfit สำหรับความคมชัดอ่านง่าย — เลือกตามที่เข้ากับดีไซน์ปัจจุบันของ `QuestionCard.tsx`)
- แบ่ง 3 สถานะตามเวลาที่เหลือ (ใช้ threshold เดียวกับที่มีอยู่แล้วที่ ≤30s เป็นฐาน แล้วเพิ่มระดับ):

| สถานะ | ช่วงเวลา | สี | แอนิเมชัน |
|---|---|---|---|
| **Normal** | > 30s | โทนทอง/ขาวนวล (ตามธีม Glassmorphism เดิม) | เรืองแสงเบาๆ (soft glow), นิ่ง |
| **Warning** | ≤ 30s ถึง 11s | เปลี่ยนเป็นสีอำพัน/ส้ม (amber) | Pulse เบาๆ ทุกวินาที (scale 1 → 1.05 → 1) พร้อม glow เข้มขึ้น |
| **Critical** | ≤ 10s | สีแดงเข้ม | Pulse แรงขึ้น (scale 1 → 1.12), shake เบาๆ, vignette ขอบจอกระพริบแดงจางๆ ทุกวินาที |
| **Last 3s** | ≤ 3s | แดงสด | ตัวเลขขยายเต็มจอชั่วขณะ (scale burst) + เสียงเน้นพิเศษ (ดูข้อ 3.2) |

- แอนิเมชันการเปลี่ยนตัวเลขแต่ละวินาที: ใช้ transition แบบ "digit flip" หรือ "fade+slide" (เลือกแบบที่ perf ดีที่สุดบน Canvas/DOM ผสมที่มีอยู่) — ห้ามใช้ library ภายนอกเพิ่ม ให้ใช้ CSS transition/keyframes ล้วนตามแนวทางเดิมของโปรเจกต์ (Modern CSS, ไม่มี framework เสริม)
- เพิ่ม prop `soundEnabled?: boolean` ส่งต่อจาก session settings เพื่อควบคุม UI indicator (ไอคอนลำโพงเล็กๆ มุมจอ แสดงสถานะเปิด/ปิดเสียงให้พิธีกรเห็น)

### 3.2 `audioEngine.ts` — เสียงติ๊กถอยหลัง (Procedural)

เพิ่มฟังก์ชันใหม่ เช่น `playTickSound(remainingSeconds: number)` ตามแนวทาง Procedural Synthesis เดิมของระบบ (ดูตารางเสียงเดิมในเอกสารโปรเจกต์เป็นแนวทาง):

| ช่วงเวลา | ลักษณะเสียง | สเปกเสียงแนะนำ |
|---|---|---|
| ปกติ (> 10s) | ติ๊กเบา สั้น กระชับ | Sine/Triangle wave ความถี่ ~660Hz, envelope decay 0.05s, gain ต่ำ |
| วิกฤต (≤ 10s) | ติ๊กเข้มขึ้น ระดับเสียงดังขึ้นทีละนิด | ความถี่ขยับขึ้นเป็น ~880Hz, gain เพิ่มขึ้นตามสัดส่วน `(10 - remaining) / 10` |
| 3 วินาทีสุดท้าย | เสียงเน้นพิเศษต่างจากติ๊กปกติ | Dual-tone chime สั้น คล้าย pattern ของ "Timer Warning" ที่มีอยู่ แต่ pitch สูงกว่าเพื่อสร้างความเร่งด่วน |
| หมดเวลา | คงเสียง "Timer Finish" เดิมไว้ (Triangle Tone 440Hz → 220Hz) | ไม่ต้องแก้ |

**ข้อกำหนดสำคัญ:** ฟังก์ชันนี้ต้องเช็ค flag `tickSoundEnabled` (จาก settings) ก่อนเล่นเสียงทุกครั้ง — ถ้า `false` ให้ return ทันทีโดยไม่สร้าง AudioNode เลย (เพื่อประหยัด performance)

### 3.3 `useTimer.ts` — เชื่อมเสียงติ๊กเข้ากับ Timer Lifecycle

- ในทุก tick ที่ remaining time เปลี่ยนค่าเป็นจำนวนเต็มวินาทีใหม่ (whole-second boundary) ให้เรียก `audioEngine.playTickSound(remainingSeconds)` หนึ่งครั้งเท่านั้นต่อวินาที (ป้องกันเสียงซ้ำจาก re-render)
- ใช้ `useRef` เก็บค่าวินาทีล่าสุดที่เล่นเสียงไปแล้ว เพื่อไม่ให้ trigger ซ้ำ

### 3.4 `TimerPanel.tsx` — Toggle เปิด/ปิดเสียงติ๊ก (หลังบ้าน)

- เพิ่ม UI Switch/Toggle ในแท็บ "ตัวจับเวลา" ของ Control Center ชื่อ เช่น "เสียงติ๊กถอยหลัง (Tick Sound)"
- เมื่อ toggle เปลี่ยนค่า → บันทึกลง `localStorage` (namespace `SETTINGS`) → broadcast ผ่าน `useStageSync.ts` ไปยังจอเวทีทันที (Real-time, ไม่ต้อง refresh)
- แสดงสถานะปัจจุบัน sync กับจอเวทีตลอดเวลา (ถ้าจอเวทีปิดเสียงมาจากคีย์ลัด `M` ก็ควรสะท้อนกลับมาที่หลังบ้านด้วย ถ้าระบบเดิมรองรับ 2-way sync อยู่แล้ว)

### 3.5 Types & Schema — `timer.ts` / `session.ts` / `storage.ts`

เพิ่ม field ใหม่ในโครงสร้าง settings ที่มีอยู่ (ตัวอย่าง):

```typescript
// src/types/timer.ts (หรือไฟล์ settings ที่เกี่ยวข้อง)
export interface TimerSoundSettings {
  tickSoundEnabled: boolean;   // default: true
  tickVolume: number;          // default: 0.6 (0.0 - 1.0)
}
```

- อัปเดต `parseImportedQuestions`-style validator (หรือ settings validator ที่เทียบเท่า) ให้มี fallback default เมื่อโหลดค่าเก่าที่ยังไม่มี field นี้ (Data Migration ตามแพทเทิร์นเดิมของระบบ)
- คีย์ localStorage ใหม่หรือรวมใน `season_transition_settings` เดิมก็ได้ แล้วแต่โครงสร้างจริงที่มีอยู่

### 3.6 พื้นหลังและบรรยากาศ (Background & Atmosphere Enhancement)

- ช่วง state `question` (ที่ตัวจับเวลากำลังทำงาน): เพิ่ม
  - **Dynamic vignette** ที่ขอบจอเข้มขึ้นเล็กน้อยเมื่อเข้าสู่ warning/critical (ใช้ `TransitionLightingSystem.ts` ที่มีอยู่แล้ว ขยาย logic ให้รับ `timerPhase` เป็น input)
  - **Ambient glow** รอบการ์ดคำถาม/ตัวเลขเวลา ที่เต้นจังหวะ (breathing animation) สอดคล้องกับ warning/critical state
  - ปรับ gradient พื้นหลังให้มีมิติมากขึ้น (เช่น radial gradient หลายชั้น จำลองแสงจันทร์/ดาวที่ปรากฏใน `SkySystem.ts` ให้เด่นขึ้นในช่วงคำถาม เพื่อให้ภาพรวมดู "อลังการ" สมพระเกียรติ)
- **ห้าม** เพิ่ม element ที่ไม่สอดคล้องกับธรรมชาติ (ตามปรัชญาการออกแบบ Pure Nature Streamline ของโปรเจกต์ — งดใช้เอฟเฟกต์แบบไฟกระพริบดิสโก้ หรือกลิตเตอร์ที่ดูเป็นเกมโชว์ ให้คงความสง่างามแบบธรรมชาติไว้)

---

## 4. ตาราง Threshold รวม (Design Reference Table)

| เวลาที่เหลือ | ตัวเลข | สี | เสียงติ๊ก | พื้นหลัง/แสง |
|---|---|---|---|---|
| > 30s | ปกติ, glow เบา | ทอง/ขาวนวล | ติ๊กเบา 660Hz | ปกติ |
| 30s–11s | Pulse เบา | อำพัน | ติ๊กเข้มขึ้นตามสัดส่วน | Vignette เริ่มเข้มขึ้นเล็กน้อย |
| 10s–4s | Pulse แรง + shake | แดงเข้ม | ติ๊กดังขึ้น 880Hz | Vignette แดงจางกระพริบ |
| ≤ 3s | Scale burst | แดงสด | Dual-tone chime เร่งด่วน | Glow เต้นแรงสุด |
| 0s | หยุด/สัญญาณจบ | — | Timer Finish (เดิม) | คืนสู่ปกติ |

---

## 5. เกณฑ์ตรวจรับงาน (Acceptance Criteria)

- [ ] ตัวเลขนับถอยหลังใหญ่ขึ้นชัดเจน มองเห็นได้จากระยะไกลบนจอ LED เวที
- [ ] มีเสียงติ๊กดังทุกวินาทีระหว่างนับถอยหลัง โดยไม่มีเสียงซ้ำ/หลุดจังหวะ
- [ ] Toggle เปิด/ปิดเสียงที่ Control Center ทำงาน sync กับจอเวทีแบบ real-time ผ่าน BroadcastChannel เดิม
- [ ] ค่า toggle ถูกบันทึกใน localStorage และโหลดกลับมาถูกต้องหลัง refresh
- [ ] แอนิเมชัน/เอฟเฟกต์ทวีความเข้มขึ้นตามช่วงเวลาที่กำหนดในตาราง Threshold
- [ ] พื้นหลังช่วงคำถามดูอลังการขึ้น แต่ยังคงธีม "ธรรมชาติ" ตามปรัชญาโปรเจกต์เดิม (ไม่ใช้เอฟเฟกต์แบบเกมโชว์)
- [ ] ไม่กระทบ State Machine, PRNG, History Audit Log เดิม
- [ ] เทสเดิมทั้ง 49 ข้อยังผ่าน 100% + เพิ่มเทสใหม่สำหรับ tick sound logic และ settings migration
- [ ] Performance คงที่ 60fps บน Canvas (ตรวจสอบว่าเอฟเฟกต์ใหม่ไม่ทำให้เฟรมเรตตก)

---

## 6. หมายเหตุสำหรับ AI ที่รับงานต่อ (Notes for Implementing AI)

1. **อ่านโค้ดจริงก่อนแก้เสมอ** — เอกสารนี้อ้างอิงจากสถาปัตยกรรมที่บันทึกไว้ใน Project Summary เท่านั้น ชื่อฟังก์ชัน/ตัวแปรจริงในโค้ดอาจต่างไปบ้าง ให้ยึดโค้ดจริงเป็นหลัก
2. **คงแพทเทิร์นเดิม** — Timestamp-based Timer (ห้ามเปลี่ยนไปใช้ setInterval tick แบบส่งข้ามจอ), Procedural Web Audio (ห้ามโหลดไฟล์เสียงภายนอก), BroadcastChannel sync
3. **Backward compatibility** — ผู้ใช้มีข้อมูลคำถาม/ผู้เข้าแข่งขัน/ประวัติเก่าอยู่ใน localStorage แล้ว ต้อง migrate schema settings ใหม่โดยไม่ทำข้อมูลเดิมเสียหาย
4. ถ้ามีข้อจำกัดด้าน performance บนเครื่องที่ใช้จริงหน้างาน ให้เลือกแอนิเมชันที่เบาที่สุดที่ยังได้เอฟเฟกต์ตามต้องการ (CSS transform/opacity ดีกว่า reflow-heavy properties)
