export type QuestionCategory =
  | 'rain'     // ความรู้สึกและตัวตน (Feelings & Identity)
  | 'mist'     // มุมมองและทัศนคติ (Perspective & Attitude)
  | 'wind'     // การเปลี่ยนแปลงและความท้าทาย (Change & Challenge)
  | 'leaf'     // ประสบการณ์และชีวิตมหาวิทยาลัย (Experience & Memory)
  | 'moon'     // ความฝันและเป้าหมาย (Dreams & Ambition)
  | 'star'     // สังคมและความคิดสร้างสรรค์ (Society & Leadership)
  | 'final';   // คำถามรอบตัดสิน (Final Decisive Question)

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export type QuestionRound = 'intro' | 'general' | 'attitude' | 'scenario' | 'final';

export interface Question {
  id: string;
  text: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  round: QuestionRound;
  enabled: boolean;
  tags: string[];
}

export interface Contestant {
  id: string;
  number: number;
  name: string;
  faculty: string;
  title: 'ดาว' | 'เดือน' | 'ดาวจำแลง' | 'ทั่วไป';
}
