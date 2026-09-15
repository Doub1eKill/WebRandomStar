# 🍂 รอยต่อฤดู — Season Transition Question
## Revised AI-Ready Project Specification
### Version: 2.0 — No Constellation / No Meteor

> เว็บแอปพลิเคชันสุ่มคำถามสำหรับกิจกรรมประกวดดาว–เดือน (Star & Moon Contest)
> โดยใช้แนวคิด **“การเปลี่ยนผ่านจากปลายฝนสู่ต้นหนาว”**
>
> ฉบับนี้ปรับจากระบบเดิมโดย **ตัดทุกส่วนที่เกี่ยวข้องกับ “กลุ่มดาว” และ “ดาวตก” ออกทั้งหมด**
> และเพิ่มระบบ **Question Bank / Competition Control Center / Timer / History / Session Management**
> เพื่อให้เหมาะกับการใช้งานจริงบนเวทีมากขึ้น

---

# 1. เป้าหมายของระบบ

ระบบต้องทำหน้าที่เป็นทั้ง:

1. ระบบสุ่มคำถามบนเวที
2. ระบบแสดงผล Stage สำหรับ Projector / LED
3. ระบบควบคุมจากหลังเวที
4. ระบบจัดการคลังคำถาม
5. ระบบจัดการผู้เข้าแข่งขัน
6. ระบบจับเวลาตอบคำถาม
7. ระบบบันทึกประวัติการสุ่มและเวลาที่ใช้
8. ระบบ Import / Export ข้อมูล
9. ระบบ Synchronize ระหว่าง Stage และ Controller
10. ระบบรองรับการสุ่มซ้ำอย่างควบคุมได้และป้องกันคำถามซ้ำภายใน Session

แนวคิดหลัก:

> **ผู้ควบคุมไม่ได้กด “Random Question” เพื่อสุ่มทันที**
> แต่เริ่มกระบวนการเปลี่ยนผ่านของธรรมชาติ แล้วระบบค่อย ๆ นำไปสู่คำถามที่ถูกเลือก

---

# 2. ข้อกำหนดสำคัญที่ต้องยึด

## 2.1 สิ่งที่ต้องไม่มี

ระบบใหม่ต้อง **ไม่มี** สิ่งเหล่านี้:

- ❌ Constellation
- ❌ Constellation Node
- ❌ Star Node ที่ใช้เลือกคำถาม
- ❌ Meteor
- ❌ Meteor trajectory
- ❌ Meteor collision
- ❌ Meteor animation
- ❌ Star-to-Meteor transition
- ❌ Logic ที่ผูก Question Selection กับกลุ่มดาว
- ❌ Logic ที่ผูก Question Selection กับดาวตก
- ❌ ไฟล์ `ConstellationSystem.ts`
- ❌ ไฟล์ `MeteorSystem.ts`
- ❌ หมวดคำถามที่ตั้งชื่อว่า Star / Constellation / Meteor หากมีไว้เพียงเพื่อรองรับ animation เดิม

ไม่ควรเหลือ dead code หรือ import ที่ไม่ได้ใช้

---

## 2.2 สิ่งที่ยังคงใช้

ยังคงรักษาแนวคิด:

- ฝน
- หยดน้ำ
- หมอก
- ลมต้นหนาว
- ใบไม้
- ท้องฟ้าเปิด
- การเปลี่ยนบรรยากาศ
- การสุ่มแบบเป็นธรรมชาติ
- Cinematic Reveal
- Canvas 2D
- Procedural Audio
- Stage / Controller แยกจอ
- Seeded PRNG
- ป้องกันคำถามซ้ำ
- LocalStorage
- Import / Export

---

# 3. Natural Transition Flow ใหม่

## 3.1 State Machine

เส้นทางใหม่:

```text
[idle]
   ↓
[rain]
   ↓
[water-drop]
   ↓
[mist]
   ↓
[wind]
   ↓
[leaf]
   ↓
[sky-clear]
   ↓
[question-reveal]
   ↓
[question]
   ↓
[timer-ready]
   ↓
[timer-running]
   ↓
[answered]
```

ระบบไม่ควรมี `constellation` หรือ `meteor` อีกต่อไป

---

# 4. ความหมายของแต่ละ Stage

## 4.1 Idle

สถานะเริ่มต้น

แสดง:

- ชื่อกิจกรรม
- ชื่อผู้เข้าแข่งขัน
- รอบ
- คำแนะนำสั้น ๆ
- สถานะพร้อมสุ่ม

ยังไม่เปิดคำถาม

---

## 4.2 Rain

ฝนช่วงสุดท้ายของฤดูฝน

Visual:

- Rain particles
- Background dark seasonal atmosphere
- ความเร็วฝนอาจเพิ่ม/ลดอย่างเป็นธรรมชาติ

Audio:

- ฝนเบา
- ambience

Narrative:

> “เมื่อปลายฝนกำลังผ่านพ้น...”

---

## 4.3 Water Drop

ให้ความรู้สึกว่าฝนกำลังลดลงและหยดน้ำเริ่มนิ่ง

Visual:

- หยดน้ำตกลง
- ripple
- water reflection
- ลด density ของฝน

Narrative:

> “หยดสุดท้ายกำลังพาเราเข้าสู่การเปลี่ยนแปลง...”

---

## 4.4 Mist

หมอกปรากฏ

Visual:

- Mist particles
- opacity เปลี่ยน
- visibility จำกัดในช่วงสั้น ๆ
- หมอกค่อย ๆ เปิดพื้นที่

Audio:

- low atmospheric pad
- soft ambience

Narrative:

> “เมื่อสิ่งเดิมเริ่มเลือนหาย สิ่งใหม่จึงกำลังปรากฏ...”

---

## 4.5 Wind

ลมต้นหนาวเริ่มพัด

Visual:

- wind streaks
- movement direction
- ใบไม้บางส่วนเริ่มปรากฏ

Audio:

- wind sweep

Narrative:

> “สายลมแรกของฤดูหนาวกำลังเข้ามา...”

---

## 4.6 Leaf

ใบไม้ถูกพัดไปตามแรงลม

Visual:

- ใบไม้หลายรูปแบบ
- variation ของ rotation
- velocity
- drift
- gravity
- air resistance

จุดสำคัญ:

ใบไม้เป็น **ภาพบรรยากาศ** ไม่จำเป็นต้องเป็น node โดยตรง

อย่าทำให้คำถามขึ้นกับตำแหน่งใบไม้แบบ deterministic จนผู้ชมสามารถเดาได้

---

## 4.7 Sky Clear

หมอกค่อย ๆ จาง ท้องฟ้าเปิด

Visual:

- ลด opacity ของ mist
- background สว่างขึ้นเล็กน้อย
- เพิ่ม ambient light
- ลด rain particles เหลือศูนย์
- อาจมีเมฆเคลื่อนออก

ไม่มี:

- constellation
- meteor
- star selection
- meteor selection

หน้าที่ของ stage นี้คือเป็น **transition ก่อน reveal**

Narrative:

> “เมื่อฤดูกาลกำลังเปลี่ยนผ่าน คำตอบของค่ำคืนนี้กำลังจะปรากฏ...”

---

## 4.8 Question Reveal

ระบบเลือกคำถามจาก Question Engine

ทำ animation เช่น:

```text
Sky Clear
   ↓
soft fade
   ↓
light sweep
   ↓
question card reveal
   ↓
question shown
```

ห้ามใช้:

- ดาวตก
- กลุ่มดาว
- node constellation
- trajectory ของ meteor

---

# 5. Question Selection Architecture

การเลือกคำถามต้องแยกออกจาก Visual Animation

```text
Natural Transition
       |
       v
Question Selector
       |
       +--> Filter eligible questions
       |
       +--> Apply round/category rules
       |
       +--> Exclude previously used
       |
       +--> Seeded PRNG
       |
       v
Selected Question
```

Visual ไม่ควรเป็นตัวตัดสินคำถาม

---

# 6. Question Selector

ไฟล์:

```text
src/engine/questionSelector.ts
```

หน้าที่:

1. รับ question bank
2. ตรวจคำถามที่ enabled
3. ตรวจ round
4. ตรวจ category
5. ตรวจ difficulty
6. ตรวจ used questions
7. เลือก candidate
8. ใช้ PRNG
9. return selected question
10. update history

ตัว selector ต้องไม่รู้เรื่อง Canvas

---

# 7. Seeded PRNG

ไฟล์:

```text
src/engine/prng.ts
```

ใช้:

```text
Mulberry32
```

รองรับ:

- seed
- replay
- deterministic test
- random selection
- session reproducibility

ตัวอย่าง:

```text
Session Seed:
20260914-001

Question Result:
Q-024
```

เมื่อใช้ seed เดียวกัน + question bank เดียวกัน + rule เดียวกัน
ควรได้ผลลัพธ์เหมือนกัน

---

# 8. ระบบป้องกันคำถามซ้ำ

ภายใน Session เดียวกัน:

```text
Question A → used
Question B → used
Question C → used
```

คำถามเหล่านี้ไม่ควรถูกเลือกซ้ำจนกว่าจะ:

- reset session
- enable repeat mode
- start session ใหม่

ต้องมีสถานะ:

```text
unused
used
disabled
```

---

# 9. Question Bank Dashboard

สร้างระบบหลังบ้านที่ละเอียดกว่าเดิม

หน้า:

```text
Control Center
 └── Question Bank
```

## 9.1 Summary Cards

แสดง:

```text
Total Questions
Enabled
Disabled
Used
Remaining
Categories
```

ตัวอย่าง:

```text
42 Questions
38 Enabled
4 Disabled
12 Used
26 Remaining
```

---

# 10. Question Table

ตารางควรมี:

| Field | Description |
|---|---|
| ID | Question ID |
| Question | ข้อความคำถาม |
| Category | หมวด |
| Difficulty | ระดับ |
| Round | รอบ |
| Enabled | เปิดใช้หรือไม่ |
| Used | ใช้แล้วหรือยัง |
| Actions | Preview/Edit/Duplicate/Delete |

ควรมี:

- Search
- Category filter
- Round filter
- Difficulty filter
- Enabled filter
- Used filter
- Sort

---

# 11. Question Preview

เมื่อกด Preview:

แสดง:

```text
Question ID
Question Text
Category
Difficulty
Round
Status
Created At
Updated At
```

Preview ใน Controller เท่านั้น

**ห้ามเปิดคำถามบน Stage เพียงเพราะกด Preview**

---

# 12. Question CRUD

ต้องรองรับ:

- Add
- Edit
- Duplicate
- Delete
- Enable
- Disable
- Import
- Export

ก่อน Delete ควรมี confirmation

---

# 13. Question Categories

หมวดคำถามควรอิงกับกิจกรรม ไม่จำเป็นต้องผูกกับ animation

ตัวอย่าง:

```text
Rain
Water
Mist
Wind
Leaf
Moon
Final
```

สามารถเพิ่มหมวดอื่นได้ภายหลัง

ข้อสำคัญ:

> Category เป็นข้อมูลคำถาม ไม่ใช่ stage animation

ดังนั้นไม่ควรเขียน logic เช่น:

```text
Category = Wind
→ must use Wind Animation
```

ให้แยกสองระบบออกจากกัน

---

# 14. Question Data Model

ตัวอย่าง TypeScript:

```ts
export interface Question {
  id: string;
  text: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  round: string;
  enabled: boolean;
  used: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}
```

สามารถเพิ่มเติม:

```ts
timeLimit?: number;
notes?: string;
```

แต่ข้อมูลที่ไม่จำเป็นไม่ควรถูกเพิ่มโดยไม่มี use case

---

# 15. ระบบผู้เข้าแข่งขัน

ยังคงมี:

```text
Name
Faculty
Number
Round
```

เพิ่ม:

```text
Status
Current Question
Questions Answered
Time Used
```

ตัวอย่าง:

```text
Contestant #05
Name: XXXX
Faculty: XXXXX
Round: Round 2

Question: Q-024
Status: Answering
Timer: 00:48
```

---

# 16. Competition Control Center

ปรับ `RemoteController` ให้กลายเป็นศูนย์ควบคุมหลัก

โครงสร้าง:

```text
Competition Control Center
│
├── Session
├── Contestants
├── Question Bank
├── Randomizer
├── Timer
├── History
├── Audio
├── Display
└── Settings
```

---

# 17. Session Management

ระบบต้องมีคำว่า:

```text
Competition Session
```

หนึ่ง session อาจเป็น:

```text
EVENT
  ↓
ROUND
  ↓
CONTESTANT
  ↓
QUESTION
  ↓
TIMER
  ↓
ANSWERED
```

---

# 18. Session Controls

Controller ต้องมี:

```text
New Session
Resume Session
Pause Session
Reset Session
End Session
Export Session
```

เมื่อ Reset ต้องมี confirmation

---

# 19. Randomizer Control

Controller ต้องมีปุ่ม:

```text
Start Randomization
Pause
Resume
Skip
Reveal Question
```

และแสดง:

```text
Current Stage
Elapsed
Selected Question
Current Contestant
```

---

# 20. Timer System

## 20.1 ต้องสร้าง Timer Engine แยก

ไฟล์ใหม่:

```text
src/engine/timerEngine.ts
```

อย่าผูก timer เข้า `QuestionCard.tsx` โดยตรง

Architecture:

```text
Timer Engine
     |
     +---- Controller
     |
     +---- Stage
     |
     +---- Session
```

---

# 21. Timer States

```text
idle
ready
running
paused
finished
reset
```

---

# 22. Timer Modes

ควรรองรับอย่างน้อย:

### Preparation Timer

ตัวอย่าง:

```text
00:15
```

ใช้สำหรับเตรียมตัว

### Answer Timer

ตัวอย่าง:

```text
01:30
```

ใช้สำหรับตอบคำถาม

### Final Timer

ตัวอย่าง:

```text
02:00
```

สำหรับรอบ Final

---

# 23. Timer Presets

Controller:

```text
Quick
00:30

Short
01:00

Standard
01:30

Final
02:00

Custom
--:--
```

สามารถเปลี่ยน preset ได้ก่อน Start

---

# 24. ตั้งเวลาถอยหลัง

UI:

```text
Timer Duration
[ 01:30 ]

[Set Timer]
```

จากนั้นสถานะ:

```text
READY
01:30
```

เมื่อกด Start:

```text
01:30
01:29
01:28
...
00:01
00:00
```

---

# 25. Timer Start

เมื่อผู้ควบคุมกด:

```text
START TIMER
```

Stage ต้องเริ่มแสดง countdown พร้อมกัน

ไม่ควรส่งคำสั่ง:

```text
tick
tick
tick
tick
```

ทุกวินาทีผ่าน BroadcastChannel

ควรส่ง:

```ts
{
  type: "TIMER_START",
  startTimestamp: number,
  durationMs: number
}
```

แต่ละฝั่งคำนวณ:

```text
remaining = duration - (Date.now() - startTimestamp)
```

ข้อดี:

- sync แม่นกว่า
- ลด network/message spam
- Stage และ Controller ไม่ drift ง่าย
- Pause/Resume ควบคุมง่ายกว่า

---

# 26. Timer Synchronization

ใช้:

```text
BroadcastChannel API
```

ตัวอย่าง event:

```ts
type TimerStartMessage = {
  type: "TIMER_START";
  startTimestamp: number;
  durationMs: number;
};

type TimerPauseMessage = {
  type: "TIMER_PAUSE";
  remainingMs: number;
};

type TimerResetMessage = {
  type: "TIMER_RESET";
};

type TimerFinishMessage = {
  type: "TIMER_FINISH";
};
```

---

# 27. Timer Display บน Stage

แสดงให้ผู้เข้าแข่งขันเห็นชัดเจน

ตัวอย่าง:

```text
┌─────────────┐
│   01:25     │
└─────────────┘
```

เมื่อใกล้หมดเวลา:

```text
00:30
```

ระบบสามารถเปลี่ยน visual emphasis ได้

ช่วง:

```text
00:30
00:20
00:10
```

อาจมี:

- pulse
- sound cue
- subtle screen effect

ไม่ควรทำให้รบกวนคำถาม

---

# 28. Warning Time

ตั้งค่าได้:

```text
Warning At:
00:30
```

เมื่อเหลือ 30 วินาที:

- เล่นเสียงเตือน
- เปลี่ยนสถานะ timer
- แจ้ง Controller
- Stage แสดง warning แบบชัดเจน

---

# 29. หมดเวลา

เมื่อ:

```text
00:00
```

ต้อง:

1. หยุด timer
2. บันทึก timestamp
3. บันทึกเวลาที่ใช้
4. เล่นเสียงหมดเวลา
5. แสดง `หมดเวลา`
6. รอผู้ควบคุม

**ห้ามเปลี่ยนผู้เข้าแข่งขันอัตโนมัติเป็นค่าเริ่มต้น**

เหตุผล:

ผู้ดำเนินรายการอาจต้องพูดต่อ หรือบันทึกผลก่อน

---

# 30. Pause / Resume Timer

Pause:

```text
remainingMs
```

ต้องถูกเก็บไว้

Resume:

```text
newStartTimestamp = Date.now()
```

แล้วคำนวณใหม่จาก remaining

---

# 31. Timer Data Model

```ts
export interface TimerState {
  status: "idle" | "ready" | "running" | "paused" | "finished";
  durationMs: number;
  remainingMs: number;
  startTimestamp?: number;
  warningAtMs?: number;
}
```

---

# 32. Time Statistics

บันทึก:

```text
Configured Time
Actual Time Used
Remaining Time
Paused Duration
Timeout
```

ต่อผู้เข้าแข่งขัน:

```text
Contestant #05

Configured:
01:30

Used:
01:07

Remaining:
00:23

Timeout:
No
```

---

# 33. Randomization History

สร้าง:

```text
src/types/history.ts
src/engine/historyManager.ts
```

บันทึก:

```text
timestamp
sessionId
round
contestantId
questionId
category
seed
timerDuration
timerUsed
result
```

---

# 34. History Dashboard

Controller แสดง:

```text
History

12:30  Contestant #01  Q-012  Completed
12:34  Contestant #02  Q-031  Completed
12:38  Contestant #03  Q-008  Timeout
```

Filter:

- Session
- Round
- Contestant
- Question
- Date
- Result

---

# 35. Export History

รองรับ:

```text
Export JSON
Export CSV
```

ตัวอย่างข้อมูล:

```csv
timestamp,contestant,question,timeUsed,result
...
```

---

# 36. Stage / Controller Responsibility

## Stage

Stage มีหน้าที่:

- Visual
- Question
- Contestant display
- Timer display
- Status
- Cinematic animation
- Audio playback

Stage **ไม่มีสิทธิ์แก้ Question Bank**

---

## Controller

Controller มีหน้าที่:

- Question CRUD
- Contestant CRUD
- Start randomization
- Timer
- Session
- History
- Settings
- Import / Export

---

# 37. Recommended UI Layout

## Controller

```text
┌─────────────────────────────────────────────┐
│ Competition Control Center                  │
├─────────────────────────────────────────────┤
│ Session: Active                             │
│ Round: Round 2                              │
│ Contestant: #05                             │
├─────────────────────────────────────────────┤
│ RANDOMIZER                                  │
│ [ Start ] [ Pause ] [ Skip ]                │
├─────────────────────────────────────────────┤
│ QUESTION                                    │
│ Q-024                                       │
│ Category: Wind                              │
│ Status: Selected                            │
├─────────────────────────────────────────────┤
│ TIMER                                       │
│ [01:30]                                     │
│ [Set] [Start] [Pause] [Reset]               │
├─────────────────────────────────────────────┤
│ SESSION                                     │
│ Answered: 4                                 │
│ Remaining Questions: 26                     │
├─────────────────────────────────────────────┤
│ [Question Bank] [Contestants] [History]     │
└─────────────────────────────────────────────┘
```

---

# 38. Stage UI

บน Stage ควรลด control ลง

```text
┌────────────────────────────────────────┐
│        SEASON TRANSITION               │
│                                        │
│     Rain → Mist → Wind → Leaf          │
│              ↓                         │
│          SKY CLEAR                     │
│              ↓                         │
│       QUESTION REVEAL                  │
│                                        │
├────────────────────────────────────────┤
│ Contestant #05                         │
│ XXXX XXXXX                             │
├────────────────────────────────────────┤
│                                        │
│     “คำถามจะปรากฏที่นี่”               │
│                                        │
├────────────────────────────────────────┤
│                  01:30                 │
└────────────────────────────────────────┘
```

---

# 39. Keyboard Controls

คง:

```text
Space
Start / Pause Randomization

Enter
Next / Skip / Done

Esc
Toggle Control Drawer

M
Mute / Unmute

F
Fullscreen
```

เพิ่ม:

```text
T
Start / Pause Timer
```

แต่ควรมี setting ให้ปิด shortcut ได้

---

# 40. Audio Engine

ไฟล์:

```text
src/engine/audioEngine.ts
```

เก็บ:

- Rain Soundscape
- Water Drop
- Wind
- Leaf Rustle
- Sky Transition
- Question Reveal
- Timer Warning
- Timer Finish

ลบเสียง:

- Celestial Shimmer ที่ผูกกับ constellation
- Meteor Whoosh

หากเสียง celestial มีประโยชน์ สามารถแทนด้วย:

```text
soft atmospheric transition
```

โดยไม่อ้างอิงดาวหรือกลุ่มดาว

---

# 41. Canvas Systems

โครงสร้างใหม่:

```text
canvas/
├── RainSystem.ts
├── WaterDropSystem.ts
├── MistSystem.ts
├── LeafSystem.ts
├── SkySystem.ts
└── TransitionLightingSystem.ts
```

ลบ:

```text
ConstellationSystem.ts
MeteorSystem.ts
```

---

# 42. StageCanvas

`StageCanvas.tsx` ต้องรับ state:

```text
idle
rain
water-drop
mist
wind
leaf
sky-clear
question-reveal
question
```

ไม่ควรรู้เรื่อง:

```text
constellation
meteor
```

---

# 43. State Machine ใหม่

ไฟล์:

```text
src/engine/stateMachine.ts
```

ตัวอย่าง:

```ts
type StageState =
  | "idle"
  | "rain"
  | "water-drop"
  | "mist"
  | "wind"
  | "leaf"
  | "sky-clear"
  | "question-reveal"
  | "question"
  | "answered";
```

Timer ไม่ควรถูกยัดเป็น visual stage ทั้งหมด

แยก Timer State ออกอีกระบบ

---

# 44. Recommended Architecture

```text
                    ┌──────────────────┐
                    │ Competition      │
                    │ Session          │
                    └────────┬─────────┘
                             │
              ┌──────────────┼───────────────┐
              │              │               │
              ▼              ▼               ▼
       Random Engine     Timer Engine   History Engine
              │              │               │
              └───────┬──────┴───────────────┘
                      │
                      ▼
              Controller / Stage
                      │
              BroadcastChannel
                      │
             ┌────────┴────────┐
             ▼                 ▼
          Stage              Controller
```

---

# 45. แยก Responsibility อย่างชัดเจน

## Random Engine

รู้:

- Questions
- Seed
- Selection rules
- Used questions

ไม่รู้:

- Canvas
- Audio
- Timer UI

## Timer Engine

รู้:

- duration
- remaining
- start
- pause
- resume
- finish
- warning

ไม่รู้:

- Question Bank
- Canvas animation

## History Engine

รู้:

- session history
- question result
- timer result

ไม่รู้:

- Visual rendering

## Stage Renderer

รู้:

- animation
- visual
- question display
- timer display

ไม่รู้:

- CRUD database logic

---

# 46. Project Structure ใหม่

```text
RandomizeQuiz/
├── src/
│   ├── components/
│   │   ├── Stage/
│   │   │   ├── canvas/
│   │   │   │   ├── RainSystem.ts
│   │   │   │   ├── WaterDropSystem.ts
│   │   │   │   ├── MistSystem.ts
│   │   │   │   ├── LeafSystem.ts
│   │   │   │   ├── SkySystem.ts
│   │   │   │   └── TransitionLightingSystem.ts
│   │   │   ├── StageCanvas.tsx
│   │   │   ├── StageOverlay.tsx
│   │   │   ├── QuestionCard.tsx
│   │   │   ├── StageHeader.tsx
│   │   │   ├── ContestantBadge.tsx
│   │   │   ├── TimerDisplay.tsx
│   │   │   └── CinematicNarrator.tsx
│   │   │
│   │   └── Control/
│   │       ├── ControlCenter.tsx
│   │       ├── ControlDrawer.tsx
│   │       ├── RemoteController.tsx
│   │       ├── KeyboardController.tsx
│   │       ├── QuestionManagerModal.tsx
│   │       ├── QuestionBankDashboard.tsx
│   │       ├── ContestantManagerModal.tsx
│   │       ├── TimerPanel.tsx
│   │       ├── SessionPanel.tsx
│   │       └── HistoryPanel.tsx
│   │
│   ├── engine/
│   │   ├── prng.ts
│   │   ├── questionSelector.ts
│   │   ├── stateMachine.ts
│   │   ├── timerEngine.ts
│   │   ├── historyManager.ts
│   │   └── audioEngine.ts
│   │
│   ├── hooks/
│   │   ├── useStageSync.ts
│   │   ├── useTimer.ts
│   │   └── useCompetitionSession.ts
│   │
│   ├── types/
│   │   ├── question.ts
│   │   ├── contestant.ts
│   │   ├── timer.ts
│   │   ├── history.ts
│   │   └── session.ts
│   │
│   ├── data/
│   │   ├── defaultQuestions.ts
│   │   └── defaultContestants.ts
│   │
│   ├── utils/
│   │   └── storage.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── tests/
│   ├── audioEngine.test.ts
│   ├── data.test.ts
│   ├── e2e.test.ts
│   ├── leafSystem.test.ts
│   ├── prng.test.ts
│   ├── questionSelector.test.ts
│   ├── stateMachine.test.ts
│   ├── storage.test.ts
│   ├── timerEngine.test.ts
│   └── historyManager.test.ts
│
├── docs/
├── package.json
└── README.md
```

---

# 47. Storage

ยังใช้:

```text
LocalStorage
```

แยก namespace:

```text
season_transition_questions
season_transition_contestants
season_transition_session
season_transition_history
season_transition_settings
```

อย่าเก็บทุกอย่างรวมเป็น object เดียว

---

# 48. Import / Export

Question Bank:

```text
JSON
```

History:

```text
JSON
CSV
```

Session:

```text
JSON
```

ต้อง validate schema ก่อน import

---

# 49. Validation

หาก import question:

ตรวจ:

```text
id exists
text exists
category valid
difficulty valid
round valid
enabled boolean
```

ถ้าผิด:

```text
Import failed
Row 12: difficulty is invalid
```

อย่า import ครึ่งไฟล์โดยเงียบ ๆ

---

# 50. Safety Against Accidental Changes

AI coding agent ต้อง:

1. อ่านโค้ดเดิมก่อน
2. ระบุ files ที่จะเปลี่ยน
3. ห้าม rewrite ทั้งโปรเจกต์โดยไม่จำเป็น
4. ห้ามเปลี่ยน architecture หลักโดยไม่มีเหตุผล
5. ห้ามลบระบบเดิมที่ไม่เกี่ยวข้อง
6. แก้เฉพาะ module ที่เกี่ยวข้อง
7. รัน tests หลังแก้
8. รัน build หลังแก้
9. ตรวจ TypeScript
10. ตรวจ Stage/Controller sync

---

# 51. Migration จากระบบเดิม

ขั้นตอน:

## Phase 1 — Remove obsolete systems

ลบ:

```text
ConstellationSystem.ts
MeteorSystem.ts
```

และ:

- references
- imports
- state
- transitions
- audio
- tests ที่เกี่ยวข้องโดยตรง

ตรวจด้วย search:

```text
constellation
meteor
```

ต้องเหลือเฉพาะ documentation ที่ระบุว่า “removed” ถ้าจำเป็น

---

## Phase 2 — Replace transition

จาก:

```text
leaf
→ constellation
→ meteor
→ question
```

เป็น:

```text
leaf
→ sky-clear
→ question-reveal
→ question
```

---

## Phase 3 — Separate Question Selection

ย้าย question selection logic ให้อยู่ใน:

```text
questionSelector.ts
```

และไม่ผูกกับ Canvas

---

## Phase 4 — Build Control Center

เพิ่ม:

```text
Question Bank
Contestants
Session
History
Timer
```

---

## Phase 5 — Build Timer Engine

เริ่มจาก:

```text
ready
running
paused
finished
reset
```

จากนั้นเพิ่ม:

```text
warning
presets
statistics
```

---

## Phase 6 — Synchronization

เพิ่ม BroadcastChannel messages สำหรับ:

```text
RANDOM_START
RANDOM_PAUSE
RANDOM_RESUME
QUESTION_SELECTED

TIMER_SET
TIMER_START
TIMER_PAUSE
TIMER_RESUME
TIMER_RESET
TIMER_FINISH

SESSION_UPDATE
```

---

# 52. Testing Requirements

ก่อนถือว่างานเสร็จ ต้องทดสอบอย่างน้อย:

## Randomizer

- ไม่ได้คำถามซ้ำ
- seed เดิมได้ผลเดิม
- disabled question ไม่ถูกเลือก
- used question ไม่ถูกเลือก

## State Machine

ตรวจลำดับ:

```text
idle
→ rain
→ water-drop
→ mist
→ wind
→ leaf
→ sky-clear
→ question-reveal
→ question
→ answered
```

และต้องตรวจว่าไม่มี:

```text
constellation
meteor
```

## Timer

ทดสอบ:

- set timer
- start
- countdown
- pause
- resume
- reset
- warning
- finish
- timeout

## Sync

ทดสอบ:

- controller start
- stage receives
- controller timer start
- stage timer sync
- pause/resume
- reset

## Storage

ทดสอบ:

- save
- load
- import
- export
- invalid schema

---

# 53. End-to-End Scenario

Scenario จริง:

```text
1. เปิด Controller
2. เปิด Stage
3. Start Session
4. เลือก Round
5. เลือก Contestant
6. ตรวจ Question Bank
7. กำหนด Timer = 01:30
8. กด Start Randomization
9. Stage แสดง Rain
10. Water Drop
11. Mist
12. Wind
13. Leaf
14. Sky Clear
15. Question Reveal
16. แสดง Question
17. Controller กด Start Timer
18. Stage แสดง 01:30
19. Countdown
20. Warning at 00:30
21. ถึง 00:00
22. แสดงหมดเวลา
23. Controller กด Done
24. บันทึก History
25. ไป Contestant ถัดไป
```

---

# 54. Future Expansion

ระบบควรออกแบบให้เพิ่มภายหลังได้ เช่น:

### Randomization Style A
Rain → Water → Mist → Question

### Randomization Style B
Rain → Wind → Leaf → Question

### Randomization Style C
Mist → Wind → Sky Clear → Question

### Randomization Style D
Rain → Ripple → Leaf → Question

### Randomization Style E
Heavy Rain → Calm → Fog → Wind → Question

ทั้งหมดต้องใช้ Question Selector ตัวเดียวกัน

เพียงเปลี่ยน visual transition

---

# 55. หลักการสำคัญสำหรับ AI Coding Assistant

เมื่อได้รับ repository นี้ ให้ทำตามลำดับ:

```text
1. Inspect existing code
2. Map current architecture
3. Find all constellation/meteor dependencies
4. Remove obsolete dependencies
5. Implement new transition
6. Separate question selection
7. Implement Question Bank
8. Implement Competition Control Center
9. Implement Timer Engine
10. Implement History
11. Implement BroadcastChannel sync
12. Update tests
13. Run test suite
14. Run type-check
15. Run production build
16. Report changed files
17. Report remaining issues
```

---

# 56. ห้าม AI ทำสิ่งต่อไปนี้

- ❌ Rewrite project from scratch
- ❌ เปลี่ยน React/Vite โดยไม่จำเป็น
- ❌ เปลี่ยน Canvas เป็น library อื่นโดยไม่มีเหตุผล
- ❌ เปลี่ยน storage architecture ทั้งหมด
- ❌ ผูก Timer เข้ากับ QuestionCard โดยตรง
- ❌ ผูก Question Selector เข้ากับ Canvas
- ❌ ใช้ animation เป็นตัวเลือกคำถาม
- ❌ เพิ่ม constellation กลับมา
- ❌ เพิ่ม meteor กลับมา
- ❌ เพิ่ม random wheel
- ❌ เพิ่ม slot-machine randomizer
- ❌ ทำ click-to-open question box
- ❌ ส่ง timer tick ทุกวินาทีผ่าน BroadcastChannel
- ❌ auto-skip contestant เมื่อหมดเวลาโดยค่าเริ่มต้น
- ❌ เปิด question preview บน Stage โดยไม่ได้สั่ง Reveal
- ❌ ลบระบบเก่าที่ไม่เกี่ยวข้อง

---

# 57. Definition of Done

ถือว่า feature set นี้เสร็จเมื่อ:

### Randomization

- [ ] ไม่มี constellation
- [ ] ไม่มี meteor
- [ ] Transition ใหม่ทำงานครบ
- [ ] Question selection แยกจาก visual
- [ ] ไม่เลือกคำถามซ้ำ

### Question Bank

- [ ] Search
- [ ] Filter
- [ ] Preview
- [ ] Add
- [ ] Edit
- [ ] Duplicate
- [ ] Delete
- [ ] Enable/Disable
- [ ] Import
- [ ] Export

### Competition

- [ ] Session
- [ ] Contestant
- [ ] Round
- [ ] Question
- [ ] Result

### Timer

- [ ] Set duration
- [ ] Start
- [ ] Pause
- [ ] Resume
- [ ] Reset
- [ ] Warning
- [ ] Finish
- [ ] Stage countdown
- [ ] Controller countdown
- [ ] Sync

### History

- [ ] Question history
- [ ] Timer history
- [ ] Session history
- [ ] Export

### Quality

- [ ] TypeScript pass
- [ ] Tests pass
- [ ] Production build pass
- [ ] Stage works
- [ ] Controller works
- [ ] Sync works
- [ ] No obsolete constellation/meteor references

---

# 58. Prompt สำหรับใช้กับ AI Coding Assistant

ใช้ข้อความนี้เป็น prompt หลัก:

> Review and upgrade the existing Vite + React + TypeScript project according to this specification.
>
> IMPORTANT:
> - Do not rebuild the project from scratch.
> - Preserve the existing architecture unless a change is required.
> - Remove all constellation and meteor systems completely.
> - Do not introduce constellation, meteor, star-node, meteor trajectory, slot-machine, roulette, wheel, or click-to-open randomization.
> - Replace the old transition path with:
>   idle → rain → water-drop → mist → wind → leaf → sky-clear → question-reveal → question → answered.
> - Keep question selection independent from Canvas animation.
> - Implement a robust Question Bank Dashboard.
> - Implement a complete Competition Control Center.
> - Implement a separate Timer Engine.
> - Timer must support set duration, start, pause, resume, reset, warning time, finish, and countdown display.
> - Synchronize timer using timestamps rather than sending a timer tick every second through BroadcastChannel.
> - Keep Stage and Controller responsibilities separate.
> - Add session management and history.
> - Preserve LocalStorage and JSON import/export unless a change is necessary.
> - Update tests for the changed architecture.
> - Run tests, TypeScript checks, and production build after modifications.
> - Before editing, inspect the repository and identify the exact files that need to change.
> - Avoid unrelated refactoring.
> - At the end, report:
>   1. changed files,
>   2. removed files,
>   3. new files,
>   4. implemented features,
>   5. tests,
>   6. build result,
>   7. remaining issues.

---

# 59. สรุปสถาปัตยกรรมฉบับสุดท้าย

```text
                     SEASON TRANSITION
                            |
       ┌────────────────────┼────────────────────┐
       │                    │                    │
       ▼                    ▼                    ▼
 Natural Transition    Question Engine       Timer Engine
       │                    │                    │
       │                    │                    │
       └──────────────┬─────┴──────────────┬─────┘
                      │                    │
                      ▼                    ▼
                 Competition Session    History
                      │
                 ┌────┴────┐
                 ▼         ▼
              STAGE    CONTROLLER
                 \         /
                  \       /
                BroadcastChannel
```

เป้าหมายของเวอร์ชันนี้คือ:

> **“ธรรมชาติเป็นผู้พาผู้ชมเข้าสู่คำถาม แต่ระบบหลังบ้านเป็นผู้ควบคุมทุกอย่างอย่างเป็นระบบ”**

และที่สำคัญ:

> **ไม่มี Constellation และไม่มี Meteor ในสถาปัตยกรรมใหม่**
