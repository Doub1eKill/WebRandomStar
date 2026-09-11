# Design Specification: CHARM OF TRANSITION (ปลายฝนต้นหนาว)

**Goal**: Transform the season transition randomize quiz application into a prestigious, high-aesthetic university pageant stage system under the official theme **“CHARM OF TRANSITION — มนต์เสน่ห์แห่งรอยต่อฤดู ปลายฝนต้นหนาว”**.

---

## 1. Context & Motivation

The system serves as the central live stage question randomizer for an annual university ambassador / pageant competition (ดาว–เดือน). The overarching concept of the event is the natural transition from the late monsoon season into the early winter breeze ("ปลายฝนต้นหนาว"), titled **"CHARM OF TRANSITION"**.

Following the removal of sci-fi celestial elements (meteors and constellations), the experience is now grounded 100% in natural earthly phenomena across 5 phases (~7.5s):
1. `rain` (ฝนซา)
2. `water-drop` (หยดน้ำ)
3. `mist` (สายหมอก)
4. `wind` (ลมหนาว)
5. `leaf` (ใบไม้ทอง)

To complete the transformation, the branding, color palette, stage header, typography, poetic cinematic narration, and question bank must align cohesively with **CHARM OF TRANSITION**.

---

## 2. Brand Identity & Header Presentation

### 2.1 Event Titles & Taglines
- **Primary Event Title**: `CHARM OF TRANSITION`
- **Thai Subtitle / Tagline**: `มนต์เสน่ห์แห่งรอยต่อฤดู — ปลายฝนต้นหนาว`
- **Browser Document Title (`index.html`)**: `CHARM OF TRANSITION — ปลายฝนต้นหนาว`
- **Brand Badge in StageHeader**:
  - Gold pulsing indicator dot (`#f59e0b`)
  - Label: `✦ CHARM OF TRANSITION`

### 2.2 StageHeader Layout & Chips
- **Left Side**:
  - `brand-badge`: Golden border, ambient backdrop blur, `✦ CHARM OF TRANSITION`
  - `event-title`: Display typography in pristine white with subtle gold ambient drop-shadow
  - `event-subtitle`: Elegant Thai typography `มนต์เสน่ห์แห่งรอยต่อฤดู — ปลายฝนต้นหนาว`
- **Right Side**:
  - `round-chip`: Displays the active competition round (เช่น `รอบทัศนคติ (Attitude)`, `รอบชิงชนะเลิศ (Final)`)
  - `state-chip`: Displays current natural phase indicator with pulsing status dot

---

## 3. Visual Tone & Atmospheric Design

### 3.1 Color Palette
- **Canvas Sky & Deep Waters**:
  - Top Sky: `#08121e` (Deep Late-Rain Night)
  - Mid-Atmosphere: `#0c1e2e` (Cool Mist Indigo)
  - Base Water Stage: `#060a12` (Abyssal Still Waters)
- **Atmospheric Particles**:
  - Rain: Translucent cool cyan-white streaks (`rgba(186, 230, 253, 0.75)`)
  - Condensation Drops: Glistening reflective water bead particles
  - Cold Morning Mist: Low-altitude diffuse silver-blue gradients (`rgba(226, 232, 240, 0.08)`)
  - Golden Hero Leaf: Radiant amber-gold leaf (`#f59e0b`, `#fbbf24`) with golden particle trail (`rgba(253, 224, 71, ...)`)
  - Water Ripples: Expanding elliptical concentric golden waves with central highlight
- **Question Card & UI Panels**:
  - Frost Glassmorphism: Deep translucent navy background with `backdrop-filter: blur(20px)`
  - Golden Border: Subtle warm gold outline (`rgba(245, 158, 11, 0.45)`) with soft box glow

---

## 4. Cinematic Poetic Storytelling (5 Phases)

The `CinematicNarrator` presents bilingual subtitles synchronized with each stage state:

| State | Thai Narrative | English Subtitle |
|---|---|---|
| `rain` | สายฝนปลายฤดูโปรยปรายแผ่วเบา... สู่มนต์เสน่ห์แห่งการเปลี่ยนผ่าน | Late rains softly whisper, ushering in the Charm of Transition. |
| `water-drop` | หยดน้ำค้างเกาะไอเย็น สะท้อนประกายคุณค่าและเจตนารมณ์แห่งค่ำคืน | Crystalline dewdrops gather, capturing the essence of purpose and light. |
| `mist` | สายหมอกลอยต่ำ อากาศหนาวเริ่มโอบล้อม ดั่งช่วงเวลาต้องมนตร์ | Cool mist settles low as the enchanted winter air embraces the hall. |
| `wind` | สายลมหนาวแรกพัดผ่าน นำพาบททดสอบและเกียรติยศสู่ผู้กล้า | The first winter breeze stirs with anticipation of honor and glory. |
| `leaf` | ใบไม้สีทองร่อนลงสู่ผืนน้ำ... เผยคำถามแห่งมนต์เสน่ห์ CHARM OF TRANSITION! | The golden leaf touches still waters, unveiling the question of destiny. |

---

## 5. Question Bank: 5 Pillars of Transition

The default question bank (`DEFAULT_QUESTIONS`) in `src/data/defaultQuestions.ts` is re-curated into 5 meaningful categories representing the virtues of modern leadership:

### 5.1 Pillar Categories
1. **`rain` — สายฝนแห่งการปรับตัว (Adaptability & Resilience)**:
   - Color: `#38bdf8` (Raindrop Blue)
   - Focus: Overcoming hardship, learning from storms, flexibility in changing times.
2. **`water-drop` / `droplet` (or mapped to existing categories `mist` / `leaf` / `wind` / `moon` / `star`)**:
   - Note: To maintain seamless backward compatibility with existing type definitions (`QuestionCategory = 'rain' | 'leaf' | 'wind' | 'mist' | 'moon' | 'star'`), we cleanly map the 5 pillars to the established categories:
     - `rain`: สายฝนแห่งการปรับตัว (Adaptability & Growth)
     - `mist`: สายหมอกแห่งวิสัยทัศน์ (Vision & Perspective)
     - `wind`: ลมหนาวแห่งแรงบันดาลใจ (Leadership & Impact)
     - `leaf`: ใบไม้ทองแห่งพันธกิจ (Purpose & Legacy)
     - `moon`: แสงจันทร์สะท้อนคุณค่า (Authenticity & Empathy)

### 5.2 Curated Questions Sample
- **Adaptability (Rain)**:
  - *"ในยุคที่โลกและสังคมเปลี่ยนแปลงอย่างรวดเร็ว คุณคิดว่า 'เสน่ห์' ของการเป็นผู้นำที่พร้อมปรับตัวรับมือกับความไม่แน่นอนคืออะไร?"*
  - *"หากเปรียบชีวิตช่วงที่ผ่านมาเป็นฤดูฝนที่มีมรสุม บทเรียนสำคัญที่สุดที่คุณได้เรียนรู้เพื่อเติบโตมาเป็นคุณในวันนี้คืออะไร?"*
- **Authenticity & Empathy (Moon)**:
  - *"ในสังคมที่ทุกคนต่างนำเสนอความสมบูรณ์แบบบนโลกออนไลน์ คุณรักษา 'ความเป็นตัวของตัวเอง' (Authenticity) ไว้อย่างไรให้ทรงคุณค่าที่สุด?"*
  - *"ความเข้าอกเข้าใจผู้อื่น (Empathy) มีพลังในการเยียวยาและสร้างการเปลี่ยนแปลงให้แก่สังคมในมิติใดได้บ้าง?"*
- **Vision & Critical Thinking (Mist)**:
  - *"เมื่อต้องเผชิญหน้ากับการตัดสินใจครั้งสำคัญท่ามกลางความคิดเห็นที่แตกต่างและข้อมูลที่คลุมเครือ คุณมีหลักคิดในการค้นหาคำตอบที่ถูกต้องอย่างไร?"*
  - *"ในมุมมองของคุณ อะไรคือความแตกต่างระหว่าง 'การมองเห็นโอกาส' กับ 'การสร้างโอกาส' ให้แก่ผู้ด้อยโอกาสในสังคม?"*
- **Leadership & Social Impact (Wind)**:
  - *"หากคุณได้รับเลือกให้ดำรงตำแหน่งนี้ สิ่งแรกที่คุณต้องการใช้เสียงของคุณ (Platform) เป็นกระบอกเสียงเพื่อขับเคลื่อนสังคมคือเรื่องใด และทำไม?"*
  - *"คุณคิดว่าพลังของคนรุ่นใหม่ (Youth Power) สามารถขับเคลื่อนการเปลี่ยนแปลงเชิงบวกให้กับชุมชนและประเทศได้อย่างไร?"*
- **Purpose & Legacy (Leaf)**:
  - *"คำว่า 'มรดกทางความคิด' (Legacy) ที่คุณต้องการทิ้งไว้ให้ผู้คนจดจำคุณในฐานะตัวแทนของเวทีนี้คืออะไร?"*
  - *"ความงามที่แท้จริงที่คงทนเหนือกาลเวลา ไม่แปรเปลี่ยนไปตามกาลเวลาและฤดูกาล ในนิยามของคุณคืออะไร?"*

---

## 6. Verification & Quality Gates

1. **Unit & Integration Tests**:
   - `tests/data.test.ts`: Verify all default questions have valid categories, non-empty text, and unique IDs.
   - `tests/stateMachine.test.ts`: Ensure sequence remains 8 states (`idle` -> 5 natural -> `question` -> `answered`).
   - `tests/e2e.test.ts`: Verify end-to-end question flow and seed reproducibility.
   - All 31 tests must pass 100%.
2. **Type Checking & Production Build**:
   - `npm run build` (`tsc -b && vite build`) must succeed with zero errors.
3. **Live Browser Verification**:
   - Check typography rendering and Thai diacritics.
   - Verify header branding "CHARM OF TRANSITION" and tagline "มนต์เสน่ห์แห่งรอยต่อฤดู — ปลายฝนต้นหนาว".
   - Confirm QuestionCard reflects new prestigious questions and glass styling.
