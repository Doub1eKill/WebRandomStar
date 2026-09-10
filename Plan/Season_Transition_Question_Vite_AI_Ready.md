# แผนการพัฒนาเว็บสุ่มคำถาม “รอยต่อฤดู — ปลายฝนต้นหนาว”
## Vite + React — AI-Ready Project Plan

> เอกสารนี้เป็น Technical/Product Specification สำหรับใช้ส่งให้ AI ตัวใดก็ได้เพื่อวางแผน สร้าง แก้ไข หรือรีวิวโปรเจกต์  
> เป้าหมาย: สร้างเว็บสุ่มคำถามสำหรับกิจกรรมดาว–เดือน โดยใช้ “การเปลี่ยนผ่านจากปลายฝนสู่ต้นหนาว” เป็นทั้งธีม เนื้อเรื่อง และกลไกการสุ่ม  
> ข้อกำหนดสำคัญ: ห้ามใช้สล็อตหมุน, ห้ามใช้วงล้อสุ่ม, ห้ามใช้การจิ้มเปิดกล่องคำถาม

---

## 1. Project Overview

### ชื่อโครงการ
**รอยต่อฤดู — Season Transition Question**

### แนวคิดหลัก
การสุ่มคำถามต้องรู้สึกเหมือนธรรมชาติกำลังพาผู้เข้าแข่งขันเดินทางจาก “ปลายฝน” ไปสู่ “ต้นหนาว”

ลำดับหลัก:

`ฝนสุดท้าย → หยดน้ำ → หมอก → ลมต้นหนาว → ใบไม้ → ฟ้าเปิด → กลุ่มดาว → ดาวตก → คำถาม`

ระบบต้องทำให้ผู้ใช้รู้สึกว่า **คำถามถูกเลือกโดยเหตุการณ์ธรรมชาติ** ไม่ใช่เครื่องสุ่มตัวเลขธรรมดา

### กลุ่มเป้าหมาย
- กิจกรรมดาว–เดือน
- พิธีกร
- กรรมการ
- ผู้เข้าแข่งขัน
- ผู้จัดกิจกรรม

### ลักษณะเว็บ
- Full-screen / Stage Mode
- เหมาะกับจอโปรเจกเตอร์และจอ LED
- Responsive
- รองรับ Desktop เป็นหลัก และ Mobile/Tablet สำหรับผู้ควบคุม

---

# 2. Non-Goals / สิ่งที่ห้ามทำ

AI ที่พัฒนาโปรเจกต์นี้ต้องไม่เพิ่มสิ่งต่อไปนี้เป็นกลไกหลัก:

- Slot Machine
- Slot Reel
- Wheel of Fortune
- Random Wheel
- Loot Box
- Mystery Box
- กดเปิดกล่องเพื่อเห็นคำถาม
- การสุ่มที่ดูเหมือนคาสิโน
- Animation ที่เร็วและฉูดฉาดจนเสียบรรยากาศ
- UI เกมแฟนตาซีที่หลุดจากธีมปลายฝนต้นหนาว

สามารถใช้ปุ่ม Start/Begin/Continue ได้ แต่ปุ่มต้องเป็นเพียงตัวควบคุมการเริ่มกระบวนการ ไม่ใช่ตัวเลือกคำถาม

---

# 3. Core Experience

## 3.1 Experience Flow

1. ผู้ควบคุมเลือกผู้เข้าแข่งขัน
2. กด Start
3. ฝนช่วงท้ายค่อย ๆ เบาลง
4. หยดน้ำปรากฏ
5. หยดน้ำเลือกเส้นทางแบบ deterministic/randomized
6. หมอกค่อย ๆ ปกคลุม
7. ลมต้นหนาวเริ่มพัด
8. ใบไม้ถูกลมพัด
9. ใบไม้เป็นตัวกำหนดหมวดคำถาม
10. เมฆค่อย ๆ เปิด
11. พระจันทร์และดาวปรากฏ
12. ดาวเชื่อมกันเป็นกลุ่มดาว
13. ดาวบางดวงทำหน้าที่เป็น Candidate Question Nodes
14. ดาวตกเกิดขึ้น
15. ดาวตกเคลื่อนผ่านกลุ่มดาว
16. จุดที่ดาวตกเลือก/ตัดผ่าน Candidate Node ถูกใช้เป็นคำถามสุดท้าย
17. คำถามแสดงด้วย Transition แบบนุ่มนวล
18. ผู้เข้าแข่งขันตอบ
19. ผู้ควบคุมสามารถไปคำถามถัดไปหรือ Reset

---

# 4. Randomization Design

## 4.1 หลักการ

อย่าสุ่มคำถามโดยตรงเพียงครั้งเดียว

ให้ใช้ Multi-stage Selection:

`Seed → Weather Event → Category → Candidate Pool → Constellation → Meteor Selection → Final Question`

ตัวอย่าง:

```text
Session Seed
   ↓
Weather State
   ↓
Wind / Leaf Event
   ↓
Question Category
   ↓
Candidate Questions
   ↓
Constellation Nodes
   ↓
Meteor Path
   ↓
Selected Node
   ↓
Final Question
```

## 4.2 ความยุติธรรม

ระบบต้อง:
- ไม่เลือกคำถามซ้ำใน Session เดียวกันจนกว่าจะหมด Pool
- กระจายหมวดคำถาม
- รองรับ Random Seed สำหรับ Debug
- บันทึกผลการสุ่ม
- สามารถ Replay ผลเดิมได้
- ห้ามใช้ Math.random() กระจายอยู่ทั่ว Components
- รวม logic การสุ่มไว้ใน utility/service เดียว

## 4.3 Seed

สร้าง Session Seed เมื่อเริ่มรอบ

ตัวอย่างแนวคิด:

```ts
type RandomSeed = string | number;

interface RandomContext {
  seed: RandomSeed;
  sessionId: string;
  usedQuestionIds: string[];
}
```

หากต้องการ reproducible testing ให้ใช้ seeded PRNG แทน Math.random() ใน core selection

---

# 5. Question Data Model

ใช้ข้อมูลแบบแยกจาก UI

ตัวอย่าง:

```ts
type QuestionCategory =
  | "rain"
  | "wind"
  | "mist"
  | "leaf"
  | "moon"
  | "star"
  | "final";

interface Question {
  id: string;
  text: string;
  category: QuestionCategory;
  difficulty: "easy" | "medium" | "hard";
  round: "intro" | "general" | "attitude" | "scenario" | "final";
  enabled: boolean;
  tags: string[];
}
```

ห้าม hard-code คำถามไว้ใน Component

ควรเก็บใน:
- JSON สำหรับ MVP หรือ
- LocalStorage/IndexedDB หากต้องการแก้ไขจากเว็บ

---

# 6. Suggested Question Categories

หมวดควรสัมพันธ์กับธรรมชาติ แต่ความหมายต้องเหมาะกับดาว–เดือน

### 🌧️ Rain — ความรู้สึกและตัวตน
คำถามเกี่ยวกับ:
- ตัวตน
- ความรู้สึก
- ประสบการณ์
- การแนะนำตัว

### 🌫️ Mist — มุมมอง
คำถามเกี่ยวกับ:
- ความคิด
- ทัศนคติ
- การตัดสินใจ
- มุมมองต่อสังคม

### 🍃 Wind — การเปลี่ยนแปลง
คำถามเกี่ยวกับ:
- การปรับตัว
- ความเปลี่ยนแปลง
- ความท้าทาย
- การแก้ปัญหา

### 🍂 Leaf — ประสบการณ์
คำถามเกี่ยวกับ:
- ชีวิตมหาวิทยาลัย
- ความทรงจำ
- การทำงานร่วมกับผู้อื่น
- บทเรียน

### 🌙 Moon — ความฝัน
คำถามเกี่ยวกับ:
- เป้าหมาย
- อนาคต
- ความฝัน
- สิ่งที่อยากพัฒนา

### ⭐ Star — สังคมและความคิดสร้างสรรค์
คำถามเกี่ยวกับ:
- มหาวิทยาลัย
- สังคม
- ความคิดสร้างสรรค์
- ความเป็นผู้นำ

### ☄️ Final — Final Question
คำถามที่ต้องใช้การคิด วิเคราะห์ หรือแสดงตัวตนอย่างชัดเจน

---

# 7. Visual Direction

## 7.1 Mood

ต้องสื่อ:

**อบอุ่น + สงบ + ลึกลับเล็กน้อย + โรแมนติก + ธรรมชาติ + ช่วงเปลี่ยนฤดู**

ไม่ควรสื่อ:
- Cyberpunk
- Neon gaming
- Casino
- Sci-fi มากเกินไป
- Winter แบบหิมะตกหนัก
- Autumn ต่างประเทศแบบใบไม้แดงเต็มเมือง

## 7.2 Color Direction

ใช้โทน:
- น้ำเงินเข้มของท้องฟ้าหลังฝน
- เทาอมฟ้าของเมฆ
- เขียวหม่นของธรรมชาติ
- น้ำตาลอ่อนของใบไม้
- สีเงิน/ขาวนวลของพระจันทร์
- แสงดาวแบบ soft glow

อย่าใช้สีจัดจนกลบอารมณ์ธรรมชาติ

---

# 8. Animation Specification

## Stage 1 — Last Rain

องค์ประกอบ:
- Rain particles จำนวนไม่มาก
- Wet surface
- Water droplets
- Clouds

Animation:
- ฝนเบาลง
- เสียงฝน fade out
- หยดน้ำตกเป็นช่วง ๆ

หลีกเลี่ยง particle จำนวนมากจน FPS ลด

---

## Stage 2 — Water Drop

สร้างหยดน้ำหลายจุด

แต่ละหยดมีเส้นทางเป็น curve

เลือกหนึ่งหยดด้วย seeded random

Animation:

```text
Spawn
→ Move
→ Curve Follow
→ Merge / Stop
→ Category Selected
```

---

## Stage 3 — Mist

หมอกแบบ layered gradient / CSS animation

ไม่ควรใช้ภาพใหญ่เป็น background ถ้าไม่จำเป็น

เป้าหมาย:
- สร้าง depth
- transition จากฝนไปต้นหนาว
- ลด visibility ชั่วคราว

---

## Stage 4 — Cold Wind

ใช้ particle / SVG / CSS motion

ทิศทางลมเปลี่ยนเล็กน้อยแบบ deterministic

ตัวแปร:

```ts
interface WindState {
  direction: number;
  strength: number;
  duration: number;
}
```

---

## Stage 5 — Leaf Selection

ใบไม้เคลื่อนตาม wind vector

เมื่อ animation จบ:

`leaf.position → category mapping`

ตัวอย่าง:

```text
North   → Moon
East    → Star
South   → Leaf
West    → Wind
Center  → Mist
```

Mapping ต้อง configurable ไม่ hard-code ใน animation component

---

# 9. Constellation System

หลังหมอกจางและเมฆเปิด:

1. ดาวปรากฏทีละกลุ่ม
2. ดาวเคลื่อนเข้าตำแหน่ง
3. สร้างเส้นเชื่อมระหว่าง Node
4. Candidate Questions ถูกวางเป็น Node
5. แสดง Constellation

ข้อมูล:

```ts
interface StarNode {
  id: string;
  questionId: string;
  x: number;
  y: number;
  brightness: number;
}
```

ไม่ต้องแสดง Question Text ก่อนเลือก

แสดงเพียง:
- ดาว
- glow
- constellation line

---

# 10. Meteor Selection

ดาวตกเป็นขั้นสุดท้ายของระบบสุ่ม

Flow:

```text
Constellation Complete
→ Select Meteor Origin
→ Generate Meteor Path
→ Calculate Node Intersections
→ Select Valid Candidate
→ Meteor Animation
→ Reveal Question
```

สำคัญ:
- ดาวตกต้องมี trajectory ที่คำนวณได้
- ไม่ควรสุ่มตำแหน่งสุดท้ายแบบไม่สัมพันธ์กับ animation
- จุดที่ดาวตกผ่านต้องตรงกับ Node ที่ระบบเลือกจริง

Pseudo logic:

```ts
const candidateNodes = getCandidateNodes(category);

const meteorPath = generateMeteorPath(seed);

const hitCandidates = candidateNodes.filter(node =>
  intersects(meteorPath, node)
);

const selectedNode =
  seededPick(hitCandidates.length ? hitCandidates : candidateNodes, seed);
```

ถ้าจำเป็นต้อง guarantee ให้ดาวตกโดน Node:
1. เลือก Node ก่อน
2. สร้าง trajectory ให้ผ่าน Node
3. เล่น animation ตาม trajectory ที่สร้างแล้ว

วิธีนี้เหมาะกับระบบที่ต้องการความสวยและความถูกต้องพร้อมกัน

---

# 11. UI Structure

## Main Stage

```text
┌───────────────────────────────────────────┐
│  EVENT TITLE                     ROUND 01 │
│                                           │
│                ☁️                         │
│         ⭐       ⭐                        │
│             ⭐       ⭐                   │
│                                           │
│                    ☾                      │
│                                           │
│        🍃        🌫️        🍂            │
│                                           │
│                                           │
│              [ START ]                    │
└───────────────────────────────────────────┘
```

เมื่อเลือกคำถาม:

```text
┌───────────────────────────────────────────┐
│              QUESTION                     │
│                                           │
│     “คำถามแสดงตรงกลางหน้าจอ”              │
│                                           │
│                                           │
│              [ NEXT ]                     │
└───────────────────────────────────────────┘
```

---

# 12. Admin / Control Mode

ควรมี Control Panel แยกจาก Stage

ความสามารถ:
- เลือกรอบ
- เลือกผู้เข้าแข่งขัน
- Start
- Pause Animation
- Skip Animation
- Reset
- Next Question
- Previous Result
- ดู Question ID
- ดู Category
- ดู Random Seed
- ดู Event Log
- เปิด/ปิดเสียง
- เปิด/ปิด Motion Effects

ไม่ควรแสดง Control Panel บนจอ Stage

---

# 13. Application States

ใช้ State Machine แทน Boolean จำนวนมาก

ตัวอย่าง:

```ts
type AppState =
  | "idle"
  | "rain"
  | "water-drop"
  | "mist"
  | "wind"
  | "leaf"
  | "sky-opening"
  | "constellation"
  | "meteor"
  | "question"
  | "answered"
  | "result";
```

Transitions:

```text
idle
 ↓
rain
 ↓
water-drop
 ↓
mist
 ↓
wind
 ↓
leaf
 ↓
sky-opening
 ↓
constellation
 ↓
meteor
 ↓
question
 ↓
answered
 ↓
idle
```

ควรมี guard เพื่อป้องกันการกด Start ซ้ำระหว่าง animation

---

# 14. Recommended Tech Stack

## Required

- Vite
- React
- TypeScript
- HTML5
- CSS / CSS Modules หรือ Tailwind CSS
- ESLint
- Prettier

## Animation

เริ่มจาก:
- CSS transitions
- CSS keyframes
- SVG
- requestAnimationFrame เมื่อจำเป็น

หากต้องการ animation ซับซ้อนในภายหลัง สามารถเพิ่ม:
- Framer Motion หรือ
- GSAP

อย่าเพิ่ม library จำนวนมากโดยไม่มีเหตุผล

## Storage

MVP:
- JSON question bank
- LocalStorage สำหรับ settings/session

Future:
- IndexedDB
- Backend API
- Database

---

# 15. Vite Project Setup

สร้างโปรเจกต์:

```bash
npm create vite@latest season-question -- --template react-ts
cd season-question
npm install
npm run dev
```

ติดตั้งเฉพาะ package ที่จำเป็น

ตัวอย่างหากใช้ animation library:

```bash
npm install framer-motion
```

หรือเลือก GSAP:

```bash
npm install gsap
```

ไม่ควรติดตั้งทั้งสอง library หากไม่มีความจำเป็น

---

# 16. Recommended Folder Structure

```text
season-question/
├── public/
│   ├── audio/
│   └── assets/
│
├── src/
│   ├── components/
│   │   ├── Stage/
│   │   ├── Rain/
│   │   ├── WaterDrop/
│   │   ├── Mist/
│   │   ├── Wind/
│   │   ├── Leaves/
│   │   ├── Moon/
│   │   ├── Stars/
│   │   ├── Constellation/
│   │   ├── Meteor/
│   │   ├── QuestionDisplay/
│   │   └── ControlPanel/
│   │
│   ├── data/
│   │   ├── questions.json
│   │   └── categories.ts
│   │
│   ├── engine/
│   │   ├── random.ts
│   │   ├── questionSelector.ts
│   │   ├── constellation.ts
│   │   ├── meteor.ts
│   │   └── stateMachine.ts
│   │
│   ├── hooks/
│   │   ├── useQuestionSession.ts
│   │   ├── useAnimationSequence.ts
│   │   └── useSeededRandom.ts
│   │
│   ├── types/
│   │   ├── question.ts
│   │   ├── session.ts
│   │   └── animation.ts
│   │
│   ├── utils/
│   │   ├── geometry.ts
│   │   ├── storage.ts
│   │   └── timing.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── tests/
│   ├── random.test.ts
│   ├── questionSelector.test.ts
│   ├── meteor.test.ts
│   └── stateMachine.test.ts
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

# 17. Component Responsibilities

### Stage
รับผิดชอบ:
- Full-screen composition
- Global stage state
- Transition

ไม่รับผิดชอบ:
- Random algorithm
- Question database

### Rain
แสดงเฉพาะฝนและ transition

### WaterDrop
คำนวณ/แสดงเส้นทางหยดน้ำ

### Mist
แสดงหมอกและ transition

### Wind
แสดงทิศทางและแรงลม

### Leaves
แสดงใบไม้และส่ง selection event

### Constellation
รับ Candidate Nodes แล้ว render

### Meteor
รับ selected node แล้วสร้าง animation

### QuestionDisplay
แสดงคำถามที่เลือกแล้ว

### ControlPanel
ควบคุม Session และ Stage

---

# 18. Separation of Concerns

ห้ามทำ:

```tsx
// Component ทำทุกอย่าง
randomQuestion();
calculateMeteor();
updateLocalStorage();
playAudio();
renderStars();
```

ควรทำ:

```text
UI
 ↓
Session Controller
 ↓
Random Engine
 ↓
Question Selector
 ↓
Animation Controller
```

แต่ละส่วนมีหน้าที่ชัดเจน

---

# 19. Accessibility

ต้องรองรับ:
- Keyboard navigation
- Enter = Start/Continue
- Escape = Exit control mode
- Space = Pause/Resume
- ปุ่มที่มี aria-label
- Contrast ที่อ่านคำถามได้ชัด
- Reduced Motion

หาก `prefers-reduced-motion: reduce`:
- ลด particle
- ลด animation duration
- ไม่ทำ camera shake
- ให้ sequence จบเร็วขึ้น

---

# 20. Performance Requirements

เป้าหมาย:
- 60 FPS บนเครื่องทั่วไปเมื่อเป็นไปได้
- หลีกเลี่ยง DOM particle หลายพัน element
- ใช้ CSS/SVG สำหรับองค์ประกอบง่าย
- ใช้ Canvas หาก particle จำนวนมาก
- หลีกเลี่ยงการ render React ใหม่ทุก frame
- ใช้ requestAnimationFrame อย่างเหมาะสม
- Cleanup animation/timer เมื่อ component unmount

ต้องทดสอบ:
- Chrome
- Edge
- Firefox
- Desktop projector resolution
- 1920×1080
- 1366×768

---

# 21. Audio Design

เสียงควรเป็น ambient ไม่ใช่เพลงเกม

Layers:
1. Rain ambience
2. Water drop
3. Soft wind
4. Leaf movement
5. Ambient night
6. Constellation shimmer
7. Meteor whoosh
8. Question reveal

ทุกเสียงต้อง:
- มี volume control
- mute ได้
- fade in/out
- ไม่ autoplay หาก browser policy ป้องกัน

---

# 22. Question Management

MVP ใช้ JSON:

```json
[
  {
    "id": "Q001",
    "text": "คำถามตัวอย่าง",
    "category": "wind",
    "difficulty": "medium",
    "round": "attitude",
    "enabled": true,
    "tags": ["attitude", "leadership"]
  }
]
```

ควรมีอย่างน้อย:
- 30–50 คำถามสำหรับทดสอบระบบ
- หมวดละหลายคำถาม
- คำถามมีระดับความยากต่างกัน
- ไม่มีคำถามซ้ำโดยไม่ตั้งใจ

---

# 23. Session Management

```ts
interface Session {
  id: string;
  startedAt: string;
  contestantId?: string;
  round: string;
  seed: string;
  currentState: AppState;
  selectedQuestionIds: string[];
  eventLog: SessionEvent[];
}
```

Event:

```ts
interface SessionEvent {
  timestamp: string;
  type: string;
  payload?: unknown;
}
```

ตัวอย่าง event:

```text
SESSION_STARTED
CATEGORY_SELECTED
LEAF_SELECTED
CONSTELLATION_CREATED
METEOR_STARTED
QUESTION_SELECTED
QUESTION_REVEALED
SESSION_RESET
```

---

# 24. Testing Plan

## Unit Tests

ทดสอบ:
- Seeded random
- Question filtering
- Duplicate prevention
- Category selection
- Candidate selection
- Meteor path calculation
- Node intersection
- State transition

## Integration Tests

ทดสอบ:

```text
Start
→ Rain
→ Water
→ Mist
→ Wind
→ Leaf
→ Constellation
→ Meteor
→ Question
```

ต้องตรวจว่าทุก state transition ถูกต้อง

## Visual Tests

ตรวจ:
- ไม่มีข้อความถูกบัง
- ดาวตกตรงกับ Node
- Question reveal ไม่กระพริบ
- Responsive
- Full-screen

---

# 25. Edge Cases

ต้องรองรับ:

### ไม่มีคำถามในหมวด
Fallback ไปยัง:
1. หมวดใกล้เคียง
2. Global question pool

### คำถามหมด
แจ้งว่าหมวดนี้หมดแล้ว และเลือกจากหมวดอื่น

### User กด Start หลายครั้ง
Ignore input ระหว่าง animation

### Browser Resize
Recalculate:
- Star coordinates
- Meteor path
- Canvas/SVG dimensions

### Refresh
Session สามารถ reset อย่างปลอดภัย

### Audio Blocked
ระบบต้องทำงานต่อได้แม้ไม่มีเสียง

---

# 26. Security / Reliability

สำหรับ MVP ที่เป็น client-side:
- ไม่ต้องมี authentication
- ไม่ต้องมี backend หากไม่จำเป็น
- ไม่เก็บข้อมูลส่วนตัวเกินความจำเป็น
- Validate question JSON
- ป้องกัน malformed data
- ไม่ใช้ eval()
- ไม่โหลด script จากแหล่งที่ไม่จำเป็น

---

# 27. Development Phases

## Phase 1 — Foundation
- สร้าง Vite React TypeScript
- Folder structure
- Type definitions
- Basic routing/state
- ESLint/Prettier

## Phase 2 — Question Engine
- Question model
- JSON question bank
- Seeded random
- Duplicate prevention
- Category selection

## Phase 3 — Visual Environment
- Background
- Rain
- Clouds
- Mist
- Moon
- Stars

## Phase 4 — Natural Randomization
- Water drop path
- Wind simulation
- Leaf selection
- Category mapping

## Phase 5 — Constellation
- Star nodes
- Connection lines
- Candidate questions
- Node positioning

## Phase 6 — Meteor
- Meteor trajectory
- Collision/intersection
- Guaranteed selected node
- Meteor animation

## Phase 7 — Question Reveal
- Question transition
- Question metadata
- Next/Reset

## Phase 8 — Control Panel
- Contestant
- Round
- Start
- Pause
- Skip
- Reset
- Seed/debug

## Phase 9 — Audio
- Ambient sound
- Effects
- Mute/volume

## Phase 10 — Testing
- Unit
- Integration
- Responsive
- Performance
- Browser compatibility

## Phase 11 — Production
```bash
npm run build
npm run preview
```

ตรวจ production build ก่อน deploy

---

# 28. AI Implementation Rules

AI ที่ได้รับเอกสารนี้ต้อง:

1. อ่าน Requirement ทั้งหมดก่อนเขียนโค้ด
2. ห้ามเปลี่ยน Core Concept โดยไม่ได้รับอนุญาต
3. ห้ามเพิ่ม Slot/Wheel/Box Randomization
4. ใช้ Vite + React + TypeScript
5. แยก Random Engine ออกจาก UI
6. แยก Question Data ออกจาก Components
7. ใช้ State Machine สำหรับ Animation Sequence
8. ทำให้ Seeded Random สามารถทดสอบซ้ำได้
9. เขียน code ที่อ่านง่าย
10. หลีกเลี่ยง dependency ที่ไม่จำเป็น
11. รองรับ reduced motion
12. คำนึงถึง performance
13. ทุก animation ต้อง cleanup ได้
14. ต้องไม่ hard-code magic numbers กระจายทั่ว code
15. ก่อนเพิ่ม feature ใหม่ให้ตรวจสอบ architecture เดิม

---

# 29. AI Coding Workflow

เมื่อให้ AI สร้างโปรเจกต์ ให้ทำตามลำดับ:

### Step 1
วิเคราะห์ Requirement และสรุป Architecture สั้น ๆ

### Step 2
สร้าง Vite project structure

### Step 3
สร้าง TypeScript types

### Step 4
สร้าง Question Engine

### Step 5
สร้าง State Machine

### Step 6
สร้าง visual components ทีละระบบ

### Step 7
เชื่อม Animation Sequence

### Step 8
เชื่อม Random Engine กับ Animation

### Step 9
เพิ่ม Question Display

### Step 10
เพิ่ม Control Panel

### Step 11
เพิ่ม Audio

### Step 12
เขียน Tests

### Step 13
ตรวจ TypeScript/ESLint

### Step 14
Build production

### Step 15
Review UX, performance และ edge cases

ห้ามสร้างทุกอย่างเป็นไฟล์เดียว

---

# 30. Definition of Done

ถือว่า MVP เสร็จเมื่อ:

- [ ] เปิดเว็บได้ด้วย Vite
- [ ] Full-screen Stage ทำงาน
- [ ] มีบรรยากาศปลายฝนต้นหนาว
- [ ] มีฝนช่วงท้าย
- [ ] มีหยดน้ำ
- [ ] มีหมอก
- [ ] มีลม
- [ ] มีใบไม้
- [ ] ฟ้าเปิด
- [ ] มีพระจันทร์
- [ ] มีกลุ่มดาว
- [ ] มีดาวตก
- [ ] ดาวตกเชื่อมโยงกับ Question Node จริง
- [ ] Question ถูกเลือกจาก Question Pool
- [ ] ไม่ใช้สล็อต
- [ ] ไม่ใช้วงล้อ
- [ ] ไม่ใช้กล่องคำถาม
- [ ] ไม่มีคำถามซ้ำโดยไม่ตั้งใจ
- [ ] มี Seed สำหรับทดสอบ
- [ ] มี Reset
- [ ] มี Control Mode
- [ ] รองรับ Keyboard
- [ ] รองรับ Reduced Motion
- [ ] ไม่มี console error
- [ ] Production build ผ่าน
- [ ] Animation ไม่ทำให้ UI กระตุกอย่างเห็นได้ชัด

---

# 31. Recommended MVP Scope

อย่าทำระบบใหญ่เกินไปใน Version 1

### MVP ต้องมี

`Rain → Water Drop → Mist → Wind → Leaf → Constellation → Meteor → Question`

ยังไม่จำเป็นต้องมี:
- Login
- Database Server
- Cloud
- Multiplayer
- AI-generated questions
- ระบบคะแนนซับซ้อน
- ระบบบัญชีผู้ใช้

สิ่งเหล่านี้สามารถเพิ่มใน Version 2 ได้

---

# 32. Version 2 Ideas

หลัง MVP เสถียร สามารถเพิ่ม:

- Question Editor
- Import/Export JSON
- Question Bank Management
- Contestant Management
- รอบการแข่งขันหลายรอบ
- Scoreboard
- Timer
- Auto Question Difficulty
- Replay Session
- Presentation Mode
- Remote Controller
- Backend
- Database
- Analytics

แต่ต้องไม่ทำให้ Core Experience หลุดจาก “ปลายฝนต้นหนาว”

---

# 33. Final Design Principle

โปรเจกต์นี้ไม่ได้ต้องการเพียง “เว็บสุ่มคำถามที่มีธีมฝนและดาว”

แต่ต้องการให้:

> **ธรรมชาติเป็นตัวดำเนินการสุ่ม**

ดังนั้นทุกขั้นควรมีความหมาย:

`ฝน` = จุดเริ่มต้น  
`หยดน้ำ` = การเลือกเส้นทาง  
`หมอก` = ความไม่แน่นอน  
`ลม` = การเปลี่ยนแปลง  
`ใบไม้` = การเลือกหมวด  
`ฟ้าเปิด` = การเปิดเผย  
`พระจันทร์` = จุดนำทาง  
`กลุ่มดาว` = ตัวเลือกคำถาม  
`ดาวตก` = การตัดสินใจสุดท้าย  
`คำถาม` = สิ่งที่ธรรมชาติพามาพบ

เป้าหมายสูงสุดคือให้ผู้ชมรู้สึกว่า:

**“เราไม่ได้กดสุ่มคำถาม แต่กำลังรอให้ฤดูกาลเลือกคำถามให้เรา”**

---

# 34. Prompt สำหรับสั่ง AI ให้เริ่มสร้างโปรเจกต์

ใช้ Prompt นี้พร้อมกับเอกสารทั้งหมด:

```text
You are a senior frontend engineer and UI/UX developer.

Build the project according to this specification.

Requirements:
- Use Vite + React + TypeScript.
- Follow the architecture and folder structure defined in the specification.
- The core experience is a question randomization journey based on the transition from the end of the rainy season to the beginning of the cool season.
- The sequence must be:
  Rain → Water Drop → Mist → Wind → Leaf → Sky Opening → Moon → Constellation → Meteor → Question.
- Do NOT use a slot machine.
- Do NOT use a random wheel.
- Do NOT use loot boxes or question boxes.
- Do NOT replace the natural randomization concept with a generic random button.
- Keep question data separate from UI.
- Keep randomization logic separate from animation components.
- Use seeded randomization so results can be reproduced during testing.
- Use a state machine for the animation sequence.
- Ensure the meteor animation corresponds to the actual selected question node.
- Prioritize visual quality, performance, accessibility, responsive behavior, and maintainable code.

Development process:
1. Analyze the specification.
2. Explain the proposed architecture briefly.
3. Create the project structure.
4. Implement types and question data.
5. Implement the randomization engine.
6. Implement the state machine.
7. Implement the visual stages one by one.
8. Connect the randomization engine to the animation sequence.
9. Implement the constellation and meteor selection.
10. Implement the question reveal.
11. Implement the control panel.
12. Add audio only if it does not interfere with the core experience.
13. Add tests.
14. Run type checking and linting.
15. Run the production build.
16. Review the implementation against every Definition of Done item.

Do not skip requirements.
Do not silently change the concept.
If a technical decision is ambiguous, choose the simplest maintainable solution that preserves the intended user experience.
When modifying existing code, preserve working functionality unless the specification explicitly requires a change.
```

---

# 35. Important AI Instruction

หาก AI ไม่สามารถทำทุกส่วนในครั้งเดียว ให้แบ่งงานเป็น Phase และทำทีละ Phase

**ห้ามสร้าง mockup ที่ดูสวยแต่ไม่มี Randomization Engine จริง**

และ **ห้ามสร้าง Animation ที่ดูเหมือนสุ่ม แต่ผลลัพธ์จริงถูก hard-code**

ระบบต้องมีความสัมพันธ์จริงระหว่าง:

`Random Seed → Selection Logic → Animation → Selected Node → Question`

นี่คือหัวใจทางเทคนิคของโปรเจกต์
