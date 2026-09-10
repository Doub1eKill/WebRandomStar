# รอยต่อฤดู — Season Transition Question
## เว็บสุ่มคำถามสำหรับกิจกรรมดาว–เดือน (Vite + React + TypeScript)

> ระบบสุ่มคำถามสำหรับเวทีกิจกรรมดาว–เดือน ภายใต้แนวคิด **“การเปลี่ยนผ่านจากปลายฝนสู่ต้นหนาว”**  
> โดยใช้เหตุการณ์ธรรมชาติจริงเป็นทั้งธีม เนื้อเรื่อง และกลไกการสุ่ม (ไร้สล็อต ไร้วงล้อ ไร้กล่องสุ่ม)

---

## 🌟 ฟีเจอร์เด่น (Key Features)

1. **Natural Multi-stage Randomization**:
   - ลำดับธรรมชาติ 9 ขั้นตอน: `ฝนสุดท้าย (Rain) → หยดน้ำ (Water Drop) → หมอก (Mist) → ลมหนาว (Wind) → ใบไม้ (Leaf) → ฟ้าเปิด (Sky Opening) → กลุ่มดาว (Constellation) → ดาวตก (Meteor) → คำถาม (Question)`
   - วิถีดาวตกคำนวณทางเรขาคณิตให้พุ่งตัดผ่าน Candidate Node ที่ถูกเลือกจริงอย่างแม่นยำ

2. **Seeded PRNG (Mulberry32)**:
   - ผลการสุ่มสามารถ **Replay ผลเดิมได้ 100%** ด้วย Seed เดิม
   - มีระบบป้องกันคำถามซ้ำใน Session เดียวกัน

3. **Hybrid Control & Dual Display**:
   - **Single-screen Mode**: ควบคุมผ่านแป้นพิมพ์ (`Space`, `Enter`, `Esc`, `KeyM`, `KeyF`) พร้อม Control Drawer ซ่อนได้
   - **Dual-screen Mode**: มีปุ่มเปิดหน้าต่าง Pop-up Controller แยกสำหรับต่อจอโปรเจกเตอร์บนเวที และควบคุมจากแล็ปท็อปผ่าน `BroadcastChannel API` แบบเรียลไทม์

4. **Procedural Web Audio API Soundscapes**:
   - เสียงสังเคราะห์ออฟไลน์ 100% (เสียงฝนซา, หยดน้ำ, ลมหนาว, ใบไม้เสียดสี, ชิมเมอร์กลุ่มดาว, เสียงดาวตก และเสียงเปิดเผยคำถาม)
   - ปรับระดับเสียง (Volume) และสลับ Mute ได้ทันที

5. **Question & Contestant Bank Manager**:
   - มีชุดคำถามภาษาไทย 42 ข้อ ครอบคลุม 7 หมวด (Rain, Mist, Wind, Leaf, Moon, Star, Final)
   - มีระบบเพิ่ม แก้ไข ลบ เปิด/ปิดคำถาม และส่งออก/นำเข้าไฟล์ JSON

---

## ⌨️ คีย์ลัดบนเวที (Keyboard Shortcuts)

- `Space` : เริ่มสุ่มคำถาม (Start) / หยุดชั่วคราว (Pause & Resume)
- `Enter` : ดำเนินการต่อ (Next) / เสร็จสิ้นคำถาม (Done)
- `Esc` : เปิด/ปิด แผงควบคุมผู้ดำเนินรายการ (Toggle Control Drawer)
- `Key M` : เปิด/ปิดเสียง (Mute/Unmute)
- `Key F` : เข้า/ออกจากโหมดเต็มหน้าจอ (Toggle Fullscreen)

---

## 🚀 การติดตั้งและรันโปรเจกต์ (Getting Started)

```bash
# ติดตั้ง dependencies
npm install

# รันโหมดทดสอบในเครื่อง (Development)
npm run dev

# รันชุดการทดสอบทั้งหมด (Vitest)
npm run test

# สั่ง Build สำหรับใช้งานจริง (Production Build)
npm run build
```

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
src/
├── components/
│   ├── Stage/                 # องค์ประกอบบนเวที (Canvas 2D, Overlay, QuestionCard, Badges)
│   │   ├── canvas/            # ระบบฟิสิกส์อนุภาคและดวงดาวธรรมชาติ
│   │   │   ├── RainSystem.ts
│   │   │   ├── WaterDropSystem.ts
│   │   │   ├── MistSystem.ts
│   │   │   ├── LeafSystem.ts
│   │   │   ├── SkySystem.ts
│   │   │   ├── ConstellationSystem.ts
│   │   │   └── MeteorSystem.ts
│   │   ├── StageCanvas.tsx
│   │   ├── StageOverlay.tsx
│   │   ├── QuestionCard.tsx
│   │   ├── StageHeader.tsx
│   │   └── ContestantBadge.tsx
│   └── Control/               # แผงควบคุมและหน้าต่างแยก
│       ├── ControlDrawer.tsx
│       ├── RemoteController.tsx
│       ├── KeyboardController.tsx
│       ├── QuestionManagerModal.tsx
│       └── ContestantManagerModal.tsx
├── engine/                    # กลไกตรรกะเบื้องหลัง
│   ├── prng.ts                # Mulberry32 PRNG
│   ├── questionSelector.ts    # ตรรกะการสุ่มและวิถีดาวตก
│   ├── stateMachine.ts        # State Machine 11 ลำดับ
│   └── audioEngine.ts         # Web Audio API Procedural Sound
├── hooks/
│   └── useStageSync.ts        # BroadcastChannel Sync
├── types/                     # TypeScript Types
├── data/                      # ข้อมูลคำถามและผู้เข้าแข่งขันตั้งต้น
└── utils/                     # Storage และ JSON Import/Export
```
