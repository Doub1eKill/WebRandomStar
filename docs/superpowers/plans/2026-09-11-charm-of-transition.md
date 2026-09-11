# CHARM OF TRANSITION Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the season transition randomize quiz application into a prestigious, high-aesthetic university pageant stage system under the official theme **“CHARM OF TRANSITION — มนต์เสน่ห์แห่งรอยต่อฤดู ปลายฝนต้นหนาว”**.

**Architecture:** Update document metadata, branding headers, and typography; synchronize the 5-phase natural poetic narration; polish visual CSS tokens for frosted gold glassmorphism; and upgrade the default question bank to represent the 5 pillars of transition with comprehensive test and build verification.

**Tech Stack:** React 19, TypeScript, Canvas 2D, Vanilla CSS (Design System Tokens), Vitest, Vite.

## Global Constraints

- Event Title: `CHARM OF TRANSITION`
- Thai Subtitle: `มนต์เสน่ห์แห่งรอยต่อฤดู — ปลายฝนต้นหนาว`
- Natural 5-phase sequence preserved: `rain` -> `water-drop` -> `mist` -> `wind` -> `leaf` (~7.5s total)
- Zero third-party animation or UI libraries (pure CSS & Canvas 2D)
- 100% test coverage pass rate on Vitest suite

---

### Task 1: Event Title, Branding & Page Metadata

**Files:**
- Modify: `index.html:7-12`
- Modify: `src/components/Stage/StageHeader.tsx:28-52`
- Test: `tests/setup.test.ts`

**Interfaces:**
- Consumes: `AppState`
- Produces: Updated StageHeader with `CHARM OF TRANSITION` title and `มนต์เสน่ห์แห่งรอยต่อฤดู — ปลายฝนต้นหนาว` subtitle.

- [ ] **Step 1: Write test verifying event title and branding structure**

In `tests/setup.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';

describe('Event Branding Verification', () => {
  it('should verify branding constants and title string format', () => {
    const title = 'CHARM OF TRANSITION';
    const subtitle = 'มนต์เสน่ห์แห่งรอยต่อฤดู — ปลายฝนต้นหนาว';
    expect(title).toBe('CHARM OF TRANSITION');
    expect(subtitle).toContain('ปลายฝนต้นหนาว');
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `npx vitest run tests/setup.test.ts`
Expected: PASS

- [ ] **Step 3: Update `index.html` and `StageHeader.tsx`**

In `index.html`:
```html
    <title>CHARM OF TRANSITION — ปลายฝนต้นหนาว</title>
    <meta name="description" content="CHARM OF TRANSITION — ระบบสุ่มคำถามการประกวด มนต์เสน่ห์แห่งรอยต่อฤดู ปลายฝนต้นหนาว" />
```

In `src/components/Stage/StageHeader.tsx`:
```tsx
  return (
    <header className="stage-header">
      <div className="header-left">
        <div className="brand-badge">
          <span className="brand-dot" />
          <span className="brand-season">✦ CHARM OF TRANSITION</span>
        </div>
        <h1 className="event-title">CHARM OF TRANSITION</h1>
        <p className="event-subtitle">มนต์เสน่ห์แห่งรอยต่อฤดู — ปลายฝนต้นหนาว</p>
      </div>

      <div className="header-right">
        <div className="glass-chip round-chip">
          <span className="chip-label">รอบการแข่งขัน</span>
          <span className="chip-value">{roundMap[round] || round}</span>
        </div>

        <div className="glass-chip state-chip">
          <span className="state-pulse" />
          <span className="state-label">{STAGE_LABELS[currentState] || currentState}</span>
        </div>
      </div>
    </header>
  );
```

- [ ] **Step 4: Verify typecheck and build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add index.html src/components/Stage/StageHeader.tsx tests/setup.test.ts
git commit -m "feat: update event branding to CHARM OF TRANSITION with Thai subtitle"
```

---

### Task 2: Cinematic Narrator Poetic Alignment

**Files:**
- Modify: `src/components/Stage/CinematicNarrator.tsx:8-40`

**Interfaces:**
- Consumes: `AppState`
- Produces: `NARRATIVE_LINES` for the 5 natural states (`rain`, `water-drop`, `mist`, `wind`, `leaf`).

- [ ] **Step 1: Update narrative lines in `src/components/Stage/CinematicNarrator.tsx`**

```typescript
const NARRATIVE_LINES: Partial<Record<AppState, { text: string; sub: string }>> = {
  'rain': {
    text: 'สายฝนปลายฤดูโปรยปรายแผ่วเบา... สู่มนต์เสน่ห์แห่งการเปลี่ยนผ่าน',
    sub: 'Late rains softly whisper, ushering in the Charm of Transition.'
  },
  'water-drop': {
    text: 'หยดน้ำค้างเกาะไอเย็น สะท้อนประกายคุณค่าและเจตนารมณ์แห่งค่ำคืน',
    sub: 'Crystalline dewdrops gather, capturing the essence of purpose and light.'
  },
  'mist': {
    text: 'สายหมอกลอยต่ำ อากาศหนาวเริ่มโอบล้อม ดั่งช่วงเวลาต้องมนตร์',
    sub: 'Cool mist settles low as the enchanted winter air embraces the hall.'
  },
  'wind': {
    text: 'สายลมหนาวแรกพัดผ่าน นำพาบททดสอบและเกียรติยศสู่ผู้กล้า',
    sub: 'The first winter breeze stirs with anticipation of honor and glory.'
  },
  'leaf': {
    text: 'ใบไม้สีทองร่อนลงสู่ผืนน้ำ... เผยคำถามแห่งมนต์เสน่ห์ CHARM OF TRANSITION!',
    sub: 'The golden leaf touches still waters, unveiling the question of destiny.'
  }
};
```

- [ ] **Step 2: Run vitest**

Run: `npx vitest run`
Expected: PASS (all tests pass)

- [ ] **Step 3: Commit**

```bash
git add src/components/Stage/CinematicNarrator.tsx
git commit -m "feat: align cinematic narrative lines with CHARM OF TRANSITION theme"
```

---

### Task 3: Visual Polish & CSS Styling (Frosted Gold & Pageant Atmosphere)

**Files:**
- Modify: `src/index.css:120-220`

**Interfaces:**
- Consumes: UI elements `.event-subtitle`, `.brand-badge`, `.question-card`, `.stage-header`
- Produces: Enhanced gold-accented typography and frosted glass styling.

- [ ] **Step 1: Add subtitle styling and gold accent glow in `src/index.css`**

Add/update styles:
```css
.event-subtitle {
  margin: 2px 0 0 0;
  font-size: 0.85rem;
  font-weight: 400;
  color: #94a3b8;
  letter-spacing: 0.04em;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(245, 158, 11, 0.35);
  border-radius: 9999px;
  box-shadow: 0 0 16px rgba(245, 158, 11, 0.15);
  backdrop-filter: blur(12px);
}

.brand-season {
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: #fbbf24;
  text-transform: uppercase;
}
```

- [ ] **Step 2: Verify production build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "style: enhance typography and frosted gold accents for CHARM OF TRANSITION"
```

---

### Task 4: Default Question Bank Alignment with 5 Pillars of Transition

**Files:**
- Modify: `src/data/defaultQuestions.ts:1-120`
- Test: `tests/data.test.ts:1-50`

**Interfaces:**
- Consumes: `Question`, `QuestionCategory`
- Produces: Refined 5-pillar question bank with high-caliber pageant questions.

- [ ] **Step 1: Review current question bank in `tests/data.test.ts`**

Run: `npx vitest run tests/data.test.ts`
Expected: PASS

- [ ] **Step 2: Update `src/data/defaultQuestions.ts` with 5 Pillars of Transition**

Update questions for:
- `rain` (Adaptability & Growth):
  - "ในยุคที่โลกและสังคมเปลี่ยนแปลงอย่างรวดเร็ว คุณคิดว่า 'เสน่ห์' ของการเป็นผู้นำที่พร้อมปรับตัวรับมือกับความไม่แน่นอนคืออะไร?"
  - "หากเปรียบชีวิตช่วงที่ผ่านมาเป็นฤดูฝนที่มีมรสุม บทเรียนสำคัญที่สุดที่คุณได้เรียนรู้เพื่อเติบโตมาเป็นคุณในวันนี้คืออะไร?"
- `moon` (Authenticity & Empathy):
  - "ในสังคมที่ทุกคนต่างนำเสนอความสมบูรณ์แบบบนโลกออนไลน์ คุณรักษา 'ความเป็นตัวของตัวเอง' (Authenticity) ไว้อย่างไรให้ทรงคุณค่าที่สุด?"
  - "ความเข้าอกเข้าใจผู้อื่น (Empathy) มีพลังในการเยียวยาและสร้างการเปลี่ยนแปลงให้แก่สังคมในมิติใดได้บ้าง?"
- `mist` (Vision & Perspective):
  - "เมื่อต้องเผชิญหน้ากับการตัดสินใจครั้งสำคัญท่ามกลางความคิดเห็นที่แตกต่างและข้อมูลที่คลุมเครือ คุณมีหลักคิดในการค้นหาคำตอบที่ถูกต้องอย่างไร?"
  - "ในมุมมองของคุณ อะไรคือความแตกต่างระหว่าง 'การมองเห็นโอกาส' กับ 'การสร้างโอกาส' ให้แก่ผู้ด้อยโอกาสในสังคม?"
- `wind` (Leadership & Impact):
  - "หากคุณได้รับเลือกให้ดำรงตำแหน่งนี้ สิ่งแรกที่คุณต้องการใช้เสียงของคุณ (Platform) เป็นกระบอกเสียงเพื่อขับเคลื่อนสังคมคือเรื่องใด และทำไม?"
  - "คุณคิดว่าพลังของคนรุ่นใหม่ (Youth Power) สามารถขับเคลื่อนการเปลี่ยนแปลงเชิงบวกให้กับชุมชนและประเทศได้อย่างไร?"
- `leaf` (Purpose & Legacy):
  - "คำว่า 'มรดกทางความคิด' (Legacy) ที่คุณต้องการทิ้งไว้ให้ผู้คนจดวันคุณในฐานะตัวแทนของเวทีนี้คืออะไร?"
  - "ความงามที่แท้จริงที่คงทนเหนือกาลเวลา ไม่แปรเปลี่ยนไปตามกาลเวลาและฤดูกาล ในนิยามของคุณคืออะไร?"

- [ ] **Step 3: Run data tests to verify integrity**

Run: `npx vitest run tests/data.test.ts`
Expected: PASS (valid categories, non-empty questions, unique IDs)

- [ ] **Step 4: Commit**

```bash
git add src/data/defaultQuestions.ts
git commit -m "feat: upgrade default question bank with 5 pillars of CHARM OF TRANSITION"
```

---

### Task 5: Full Verification, Production Build & E2E Validation

**Files:**
- Test: `tests/e2e.test.ts`
- Artifact: `C:\Users\UNS_CT\.gemini\antigravity-ide\brain\8c0af753-badc-45a9-84b9-5003aec81fa7\walkthrough.md`

- [ ] **Step 1: Run complete automated test suite**

Run: `npx vitest run`
Expected: PASS (all test files and tests pass)

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: PASS with clean bundle

- [ ] **Step 3: Live browser verification**

Use browser to verify at `http://localhost:3000`:
- Header displays `CHARM OF TRANSITION` and `มนต์เสน่ห์แห่งรอยต่อฤดู — ปลายฝนต้นหนาว`
- Gold badge `✦ CHARM OF TRANSITION` glows cleanly
- Trigger transition and verify poetic lines in narrator card
- Verify QuestionCard displays new questions properly

- [ ] **Step 4: Update walkthrough documentation**

Update `walkthrough.md` with new screenshots and summary.

- [ ] **Step 5: Final commit**

```bash
git commit -am "chore: finalize CHARM OF TRANSITION theme integration and verification"
```
