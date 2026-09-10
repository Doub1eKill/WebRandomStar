# Design Specification: Cinematic Transitions, Storytelling Narrator, and Visual Polish

**Date**: 2026-09-10  
**Target Environment**: Stage Display & Projector (1080p / 4K)  
**Goal**: ยกระดับความเข้าใจ (UX Clarity) และความนุ่มนวลของแอนิเมชัน (Smooth Transitions) ในเว็บสุ่มคำถาม "รอยต่อฤดู — Season Transition Question"

---

## 1. Problem Statement
ในการทดลองใช้งานจริง ผู้ชมและผู้ดำเนินรายการรู้สึกว่า:
1. การสุ่ม "ยังดูงงๆ": ผู้ชมไม่ทราบว่าแต่ละปรากฏการณ์สื่อถึงอะไร และเมื่อใบไม้ร่อนลงแล้วได้หมวดอะไร ไม่มีการประกาศอย่างชัดเจนก่อนดาวตก
2. การเปลี่ยนผ่านฉาก (Transitions) ตัดสลับฉับพลันเกินไป (Abrupt stage jumps) แทนที่จะค่อย ๆ ละลายข้ามฉากอย่างเป็นธรรมชาติ
3. จังหวะเวลา (Pacing) เดิมใช้เวลารวม ~24 วินาที ซึ่งนานเกินไปสำหรับช่วงเวลาบนเวทีกิจกรรม

---

## 2. Solution Architecture

### 2.1 UI & Storytelling Layer
1. **`CinematicNarrator.tsx`**:
   - แสดงกล่องข้อความบรรยายบทกวีภาษาไทยขนาดใหญ่กลางล่างจอ
   - ข้อความเปลี่ยนผ่านอย่างนุ่มนวล (Fade & Slide) สอดคล้องกับแต่ละสเตท
   - ช่วยให้พิธีกรและผู้ชมเข้าใจความหมายของแต่ละปรากฏการณ์ธรรมชาติ
2. **`CategoryAnnouncementBanner.tsx`**:
   - เมื่อใบไม้ร่อนลง (หรือช่วงท้ายของสเตท `leaf` เข้าสู่ `sky-opening`) มีป้ายประกาศหมวดหมู่ขนาดใหญ่ลอยขึ้นมาเด่นชัด พร้อมเสียง Chime ให้ทุกคนรู้ว่าได้หมวดอะไร
3. **`SeasonJourneyBreadcrumb.tsx`**:
   - แถบความคืบหน้ารูปแบบ Breadcrumb แสดง 8 ไอคอนเรียงกันใต้ Header พร้อมไฟนำทาง (Glow indicator) ส่องสว่างที่สเตทปัจจุบัน

### 2.2 Canvas 2D LERP Cross-Fading Engine
- ปรับปรุง `StageCanvas.tsx`:
  - เลิกการกำหนดค่าแบบ Hard-switch ใน React effect
  - แต่ละระบบมี `currentValue` และ `targetValue`
  - ใช้อัลกอริทึม Linear Interpolation ในแต่ละเฟรม:
    `current += (target - current) * lerpRate`
  - ละอองฝน หมอก และแสงดาวจะค่อย ๆ เพิ่มหรือลดความเข้มข้นอย่างนุ่มนวลต่อเนื่องตลอด 60 FPS

### 2.3 Meteor Shockwave, Micro-shake & Card Bloom
- ใน `MeteorSystem.ts`:
  - เพิ่ม `ExpandingShockwave`: วงแหวนพลังงานสีฟ้า-ทองขยายรัศมีออกจาก Node เป้าหมายเมื่อดาวตกชน
  - เพิ่ม `CameraShake`: สั่นหน้าจอเบา ๆ 3px เพื่อเพิ่ม Impact
  - ละอองดาว (Stardust) หมุนวนดึงดูดเข้าหากึ่งกลางจอ
  - การ์ดคำถามคลี่ขยายตัวออกมาจากกลุ่มละอองดาวด้วยแอนิเมชัน Bloom & Scale

### 2.4 Pacing Optimization (12.5 วินาที)
ปรับปรุง `STAGE_DURATION` ใน `src/engine/stateMachine.ts`:
- `rain`: 1,500ms
- `water-drop`: 1,400ms
- `mist`: 1,500ms
- `wind`: 1,400ms
- `leaf`: 1,800ms
- `sky-opening`: 1,500ms
- `constellation`: 1,800ms
- `meteor`: 1,600ms
- รวมทั้งสิ้น: ~12.5 วินาที

---

## 3. Verification Plan
- `npx vitest run`: ทุก Unit และ E2E tests ต้องผ่าน 100%
- `npx tsc --noEmit`: ไม่มี error
- ทดสอบการเล่นบนเบราว์เซอร์ สังเกตความลื่นไหลของ LERP, คำบรรยาย Storytelling และการระเบิด Shockwave
