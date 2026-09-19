export type QuestionCategory =
  | 'Rain'
  | 'Water'
  | 'Mist'
  | 'Wind'
  | 'Leaf'
  | 'Moon'
  | 'Final'
  | 'rain'
  | 'mist'
  | 'wind'
  | 'leaf'
  | 'moon'
  | 'star'
  | 'final'
  | string;

export interface CategoryConfig {
  id: string;
  name: string;
  englishName: string;
  subtitle: string;
  icon: string;
  color: string;
  description: string;
}

export const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
  rain: {
    id: 'rain',
    name: 'สายฝนแห่งการปรับตัว',
    englishName: 'Rain',
    subtitle: 'Adaptability & Growth',
    icon: '◈',
    color: '#38bdf8',
    description: 'คำถามสะท้อนจิตใจ การเติบโต และความงดงามในการปรับตัว'
  },
  mist: {
    id: 'mist',
    name: 'สายหมอกแห่งวิสัยทัศน์',
    englishName: 'Mist',
    subtitle: 'Vision & Perspective',
    icon: '◇',
    color: '#94a3b8',
    description: 'คำถามเชิงวิสัยทัศน์ ทัศนคติ และการตัดสินใจ'
  },
  wind: {
    id: 'wind',
    name: 'ลมหนาวแห่งแรงบันดาลใจ',
    englishName: 'Wind',
    subtitle: 'Leadership & Impact',
    icon: '❖',
    color: '#86efac',
    description: 'คำถามเกี่ยวกับการนำทีม ภาวะผู้นำ และการสร้างแรงบันดาลใจ'
  },
  leaf: {
    id: 'leaf',
    name: 'ใบไม้ทองแห่งพันธกิจ',
    englishName: 'Leaf',
    subtitle: 'Purpose & Legacy',
    icon: '✧',
    color: '#fbbf24',
    description: 'คำถามบทเรียนชีวิต ประสบการณ์ และคุณค่าแห่งพันธกิจ'
  },
  moon: {
    id: 'moon',
    name: 'แสงจันทร์สะท้อนคุณค่า',
    englishName: 'Moon',
    subtitle: 'Authenticity & Empathy',
    icon: '⬡',
    color: '#e2e8f0',
    description: 'คำถามความจริงใจ ความเห็นอกเห็นใจ และพลังความฝัน'
  },
  star: {
    id: 'star',
    name: 'คุณค่าและความเป็นผู้นำ',
    englishName: 'Star',
    subtitle: 'Character & Leadership',
    icon: '✦',
    color: '#fde047',
    description: 'คำถามอัตลักษณ์ ตัวตน และการสร้างสรรค์สังคม'
  },
  final: {
    id: 'final',
    name: 'คำถามรอบตัดสิน',
    englishName: 'Final',
    subtitle: 'Final Decisive Question',
    icon: '✦',
    color: '#f43f5e',
    description: 'คำถามชี้ขาดคุณค่า ความเป็นผู้นำ และพันธกิจประจำตำแหน่ง'
  }
};

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export type QuestionRound = 'intro' | 'general' | 'attitude' | 'scenario' | 'final' | string;

export interface Question {
  id: string;
  text: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  round: QuestionRound;
  enabled: boolean;
  used?: boolean;
  tags?: string[];
  timeLimit?: number; // Optional custom time limit in seconds
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Contestant {
  id: string;
  number: number | string;
  name: string;
  faculty: string;
  title?: 'ดาว' | 'เดือน' | 'ดาวจำแลง' | 'ทั่วไป' | string;
  round?: string;
  avatarUrl?: string;
  status?: 'waiting' | 'answering' | 'completed';
  questionsAnswered?: number;
  timeUsedMs?: number;
}
