# 🍂 รอยต่อฤดู — Season Transition Question (V2.0)
## เว็บสุ่มคำถามสำหรับกิจกรรมประกวดดาว–เดือน (Vite + React 19 + TypeScript)

> ระบบสุ่มคำถามสำหรับเวทีกิจกรรมดาว–เดือน ภายใต้แนวคิด **“การเปลี่ยนผ่านจากปลายฝนสู่ต้นหนาว”** (Version 2.0 — No Constellation / No Meteor)  
> โดยใช้เหตุการณ์ธรรมชาติจริงเป็นทั้งธีม เนื้อเรื่อง และกลไกการสุ่ม (ไร้สล็อต ไร้วงล้อ ไร้กล่องสุ่ม) พร้อมศูนย์ควบคุม **Competition Control Center**, **Timer Engine** ระบบจับเวลาความแม่นยำสูง และ **History Audit Log**

---

## 🌟 ฟีเจอร์เด่น (Key Features - V2.0)

1. **Natural Transition Lifecycle (No Constellation / No Meteor)**:
   - ลำดับธรรมชาติ 9 ขั้นตอน: `ฝนสุดท้าย (Rain) → หยดน้ำ (Water Drop) → หมอก (Mist) → ลมหนาว (Wind) → ใบไม้ร่วง (Leaf) → ฟ้าเปิด (Sky Clear) → เปิดเผยคำถาม (Question Reveal) → แสดงคำถาม (Question) → ตอบเสร็จสิ้น (Answered)`
   - การสุ่มคำถามแยกเป็น Pure Logic อิสระจาก Canvas

2. **Competition Control Center (ศูนย์ควบคุมหลังเวที)**:
   - **Question Bank Dashboard**: สรุปสถิติคำถาม (Total, Enabled, Disabled, Used, Remaining), ตารางค้นหา/ฟิลเตอร์, CRUD, Duplicate, นำเข้า/ส่งออก JSON พร้อม Data Validation
   - **Timer Control Panel**: ตัวจับเวลาพร้อม Presets (30s, 60s, 90s, 120s, Custom), สัญญาณเตือน Warning ที่ ≤30s และเสียงหมดเวลา
   - **History Audit Panel**: บันทึกประวัติการสุ่ม, ผู้เข้าแข่งขัน, คำถาม, เวลาที่ใช้จริง และส่งออก JSON / CSV
   - **Contestant Manager**: จัดการรายชื่อผู้เข้าแข่งขัน คณะ และหมายเลข

3. **Timestamp-based Timer Synchronization**:
   - ซิงก์เวลาระหว่าง Stage และ Controller ผ่าน `BroadcastChannel API` โดยใช้ `startTimestamp` และ `durationMs` เพื่อความแม่นยำสูงสุดและลด Traffic

4. **Seeded PRNG (Mulberry32)**:
   - ผลการสุ่มสามารถ **Replay ผลเดิมได้ 100%** ด้วย Seed เดิม
   - มีระบบป้องกันคำถามซ้ำใน Session เดียวกัน

5. **Procedural Web Audio API Soundscapes**:
   - เสียงสังเคราะห์ออฟไลน์ 100% (เสียงฝนซา, หยดน้ำ, ลมหนาว, ใบไม้เสียดสี, เสียงฟ้าเปิด, เสียงเปิดเผยคำถาม, เสียงเตือนตัวจับเวลา และเสียงจบเวลา)

---

## ⌨️ คีย์ลัดบนเวที (Keyboard Shortcuts)

- `Space` : เริ่มสุ่มคำถาม (Start) / หยุดชั่วคราว (Pause & Resume)
- `Enter` : ดำเนินการต่อ (Next) / เสร็จสิ้นคำถาม (Done)
- `Key T` : เริ่ม / หยุดตัวจับเวลา (Start / Pause Timer)
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

# รันชุดการทดสอบทั้งหมด (Vitest: 49/49 tests pass)
npm run test

# สั่ง Build สำหรับใช้งานจริง (Production Build)
npm run build
```

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
src/
├── components/
│   ├── Stage/                     # องค์ประกอบบนเวที (Canvas 2D, Overlay, QuestionCard, Badges, Timer)
│   │   ├── canvas/                # ระบบฟิสิกส์อนุภาคและแสงธรรมชาติ
│   │   │   ├── RainSystem.ts
│   │   │   ├── WaterDropSystem.ts
│   │   │   ├── MistSystem.ts
│   │   │   ├── LeafSystem.ts
│   │   │   ├── SkySystem.ts
│   │   │   └── TransitionLightingSystem.ts
│   │   ├── StageCanvas.tsx
│   │   ├── StageOverlay.tsx
│   │   ├── QuestionCard.tsx
│   │   ├── StageHeader.tsx
│   │   ├── ContestantBadge.tsx
│   │   ├── TimerDisplay.tsx
│   │   ├── SeasonJourneyBreadcrumb.tsx
│   │   └── CinematicNarrator.tsx
│   └── Control/                   # Competition Control Center & Panels
│       ├── ControlCenter.tsx
│       ├── QuestionBankDashboard.tsx
│       ├── TimerPanel.tsx
│       ├── HistoryPanel.tsx
│       ├── ControlDrawer.tsx
│       ├── RemoteController.tsx
│       ├── KeyboardController.tsx
│       ├── QuestionManagerModal.tsx
│       └── ContestantManagerModal.tsx
├── engine/                        # Core Pure Engines
│   ├── prng.ts                    # Mulberry32 PRNG
│   ├── questionSelector.ts        # Decoupled Question Selector
│   ├── stateMachine.ts            # State Machine 10 ลำดับ
│   ├── timerEngine.ts             # Pure Timer Calculations
│   ├── historyManager.ts          # History Logger & CSV/JSON Export
│   └── audioEngine.ts             # Web Audio API Procedural Synthesizer
├── hooks/
│   ├── useStageSync.ts            # BroadcastChannel Two-Way Sync
│   └── useTimer.ts                # Synchronized Timer Hook
├── types/                         # TypeScript Type Definitions
├── data/                          # ฐานข้อมูลคำถาม 42 ข้อ และรายชื่อผู้เข้าแข่งขันเริ่มต้น
└── utils/                         # Multi-Namespace LocalStorage & JSON Schema Validation
```
