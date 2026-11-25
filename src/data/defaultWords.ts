import { KeywordItem } from '@/types/word.ts';

/**
 * Default keyword bank: the 20 words the show uses (list supplied on 2026-11-26).
 * `category` picks the question category in question-bank mode, so every word maps to one of
 * the seven categories in CATEGORY_CONFIGS; `englishTheme` is the English word the stage shows
 * under the keyword when it locks.
 */
export const DEFAULT_WORDS: KeywordItem[] = [
  {
    id: 'w-self-worth',
    word: 'คุณค่าในตัวเอง',
    category: 'star',
    englishTheme: 'Self-Worth',
    color: '#fde047',
    enabled: true,
    priority: 1,
    description: 'การรู้คุณค่าของตัวเองโดยไม่ต้องรอการยอมรับจากผู้อื่น'
  },
  {
    id: 'w-confidence',
    word: 'ความมั่นใจ',
    category: 'star',
    englishTheme: 'Confidence',
    color: '#fde047',
    enabled: true,
    priority: 2,
    description: 'ความเชื่อมั่นในตัวเองที่จะก้าวออกมายืนอย่างสง่างาม'
  },
  {
    id: 'w-true-beauty',
    word: 'ความงามที่แท้จริง',
    category: 'mist',
    englishTheme: 'True Beauty',
    color: '#94a3b8',
    enabled: true,
    priority: 3,
    description: 'ความงามที่มาจากภายใน ทัศนคติ และการกระทำ'
  },
  {
    id: 'w-equality',
    word: 'ความเท่าเทียม',
    category: 'final',
    englishTheme: 'Equality',
    color: '#f43f5e',
    enabled: true,
    priority: 4,
    description: 'การให้โอกาสและศักดิ์ศรีที่เท่ากันแก่ทุกคน'
  },
  {
    id: 'w-diversity',
    word: 'การยอมรับความแตกต่าง',
    category: 'moon',
    englishTheme: 'Diversity',
    color: '#e2e8f0',
    enabled: true,
    priority: 5,
    description: 'การเปิดใจเคารพความหลากหลายของผู้คน'
  },
  {
    id: 'w-courage',
    word: 'ความกล้าหาญ',
    category: 'star',
    englishTheme: 'Courage',
    color: '#fde047',
    enabled: true,
    priority: 6,
    description: 'ความกล้าที่จะลงมือทำและยืนหยัดเพื่อสิ่งที่ถูกต้อง'
  },
  {
    id: 'w-failure',
    word: 'ความล้มเหลว',
    category: 'rain',
    englishTheme: 'Failure',
    color: '#38bdf8',
    enabled: true,
    priority: 7,
    description: 'บทเรียนจากความผิดพลาดและการลุกขึ้นใหม่'
  },
  {
    id: 'w-success',
    word: 'ความสำเร็จ',
    category: 'rain',
    englishTheme: 'Success',
    color: '#38bdf8',
    enabled: true,
    priority: 8,
    description: 'ความหมายของความสำเร็จและหนทางสู่เป้าหมาย'
  },
  {
    id: 'w-forgiveness',
    word: 'การให้อภัย',
    category: 'moon',
    englishTheme: 'Forgiveness',
    color: '#e2e8f0',
    enabled: true,
    priority: 9,
    description: 'การปล่อยวาง เข้าใจ และให้โอกาสผู้อื่นและตัวเอง'
  },
  {
    id: 'w-empathy',
    word: 'ความเห็นอกเห็นใจ',
    category: 'moon',
    englishTheme: 'Empathy',
    color: '#e2e8f0',
    enabled: true,
    priority: 10,
    description: 'การเข้าใจความรู้สึกและมุมมองของผู้อื่น'
  },
  {
    id: 'w-justice',
    word: 'ความยุติธรรม',
    category: 'final',
    englishTheme: 'Justice',
    color: '#f43f5e',
    enabled: true,
    priority: 11,
    description: 'ความถูกต้องและความเป็นธรรมในสังคม'
  },
  {
    id: 'w-leadership',
    word: 'ความเป็นผู้นำ',
    category: 'wind',
    englishTheme: 'Leadership',
    color: '#86efac',
    enabled: true,
    priority: 12,
    description: 'การนำผู้อื่นด้วยวิสัยทัศน์และการเป็นแบบอย่าง'
  },
  {
    id: 'w-sacrifice',
    word: 'การเสียสละ',
    category: 'leaf',
    englishTheme: 'Sacrifice',
    color: '#fbbf24',
    enabled: true,
    priority: 13,
    description: 'การให้เพื่อส่วนรวมโดยไม่หวังสิ่งตอบแทน'
  },
  {
    id: 'w-responsibility',
    word: 'ความรับผิดชอบ',
    category: 'wind',
    englishTheme: 'Responsibility',
    color: '#86efac',
    enabled: true,
    priority: 14,
    description: 'การรับผิดชอบต่อหน้าที่ ตัวเอง และสังคม'
  },
  {
    id: 'w-change',
    word: 'การเปลี่ยนแปลง',
    category: 'rain',
    englishTheme: 'Change',
    color: '#38bdf8',
    enabled: true,
    priority: 15,
    description: 'การปรับตัวและการเป็นผู้ริเริ่มการเปลี่ยนแปลง'
  },
  {
    id: 'w-prejudice',
    word: 'อคติ',
    category: 'mist',
    englishTheme: 'Prejudice',
    color: '#94a3b8',
    enabled: true,
    priority: 16,
    description: 'การมองเห็นและก้าวข้ามอคติในตัวเองและสังคม'
  },
  {
    id: 'w-truth',
    word: 'ความจริง',
    category: 'mist',
    englishTheme: 'Truth',
    color: '#94a3b8',
    enabled: true,
    priority: 17,
    description: 'ความซื่อตรงและกล้าที่จะพูดความจริง'
  },
  {
    id: 'w-self-respect',
    word: 'การเคารพตัวเอง',
    category: 'star',
    englishTheme: 'Self-Respect',
    color: '#fde047',
    enabled: true,
    priority: 18,
    description: 'การให้เกียรติตัวเองและรักษาคุณค่าของตน'
  },
  {
    id: 'w-women-empowerment',
    word: 'พลังของผู้หญิง',
    category: 'wind',
    englishTheme: 'Women Empowerment',
    color: '#86efac',
    enabled: true,
    priority: 19,
    description: 'บทบาทและพลังของผู้หญิงในการขับเคลื่อนสังคม'
  },
  {
    id: 'w-humanity',
    word: 'ความเป็นมนุษย์',
    category: 'leaf',
    englishTheme: 'Humanity',
    color: '#fbbf24',
    enabled: true,
    priority: 20,
    description: 'ความเมตตาและคุณค่าความเป็นมนุษย์ที่มีต่อกัน'
  }
];
