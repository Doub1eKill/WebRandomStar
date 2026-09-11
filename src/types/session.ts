import { Question, QuestionCategory } from './question.ts';

export type AppState =
  | 'idle'           // เวทีพร้อม รอเริ่มรอบ
  | 'rain'           // เม็ดฝนเริ่มโปรยปรายแล้วค่อย ๆ เบาลง
  | 'water-drop'     // หยดน้ำรวมตัวและไหลตามเส้นทาง
  | 'mist'           // ม่านหมอกค่อย ๆ ปกคลุม
  | 'wind'           // ลมหนาวแรกพัดผ่าน
  | 'leaf'           // ใบไม้ปลิวตามแรงลม กำหนดหมวดคำถาม
  | 'question'       // เปิดเผยคำถาม
  | 'answered';      // ผู้เข้าแข่งขันตอบคำถามเสร็จสิ้น

export interface StarNode {
  id: string;
  questionId: string;
  question: Question;
  x: number;
  y: number;
  brightness: number;
  radius: number;
}

export interface MeteorTrajectory {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  endX: number;
  endY: number;
  angle: number;
  speed: number;
}

export interface SessionState {
  sessionId: string;
  seed: string;
  currentState: AppState;
  selectedContestantId?: string;
  selectedRound: string;
  selectedCategory?: QuestionCategory;
  selectedQuestion?: Question;
  usedQuestionIds: string[];
  isMuted: boolean;
  volume: number;
  isPaused: boolean;
  candidateNodes: StarNode[];
  meteorTrajectory?: MeteorTrajectory;
}
