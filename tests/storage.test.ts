import { describe, it, expect, beforeEach } from 'vitest';
import { loadAppearanceSettings, saveAppearanceSettings } from '@/features/appearance/appearanceSettings.ts';
import { appendHistoryRecord, clearHistory } from '@/features/history/historyManager.ts';
import { exportQuestionsAsJSON, parseImportedQuestions } from '@/features/questions/importQuestions.ts';
import { loadTimerSoundSettings, saveTimerSoundSettings, loadStageDisplaySettings, saveStageDisplaySettings } from '@/features/timer/timerSettings.ts';
import { questionsRepository, contestantsRepository, wordsRepository, historyRepository } from '@/storage/repositories.ts';
import { DEFAULT_QUESTIONS } from '@/data/defaultQuestions.ts';
import { DEFAULT_CONTESTANTS } from '@/data/defaultContestants.ts';
import { DEFAULT_WORDS } from '@/data/defaultWords.ts';
import { DEFAULT_TIMER_SOUND_SETTINGS } from '@/types/timer.ts';
import { DEFAULT_APPEARANCE_SETTINGS } from '@/types/appearance.ts';
import { Question } from '@/types/question.ts';
import { KeywordItem } from '@/types/word.ts';
import { HistoryRecord } from '@/types/history.ts';

describe('Storage Utilities & Multi-Namespace Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return default questions when storage is empty', () => {
    const questions = questionsRepository.load();
    expect(questions.length).toBe(DEFAULT_QUESTIONS.length);
  });

  it('should save and load modified questions to/from localStorage', () => {
    const custom: Question[] = [
      {
        id: 'CUSTOM_01',
        text: 'คำถามทดสอบระบบ',
        category: 'Wind',
        difficulty: 'easy',
        round: 'attitude',
        enabled: true,
        tags: ['test']
      }
    ];
    questionsRepository.save(custom);
    const loaded = questionsRepository.load();
    expect(loaded.length).toBe(1);
    expect(loaded[0].id).toBe('CUSTOM_01');
  });

  it('should export questions as valid JSON string', () => {
    const jsonStr = exportQuestionsAsJSON(DEFAULT_QUESTIONS.slice(0, 3));
    const parsed = JSON.parse(jsonStr);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(3);
  });

  it('should parse and validate imported questions JSON correctly', () => {
    const validJson = JSON.stringify([
      {
        id: 'IMP_01',
        text: 'คำถามนำเข้า',
        category: 'Rain',
        difficulty: 'medium',
        round: 'intro',
        enabled: true,
        tags: ['imported']
      }
    ]);

    const result = parseImportedQuestions(validJson);
    expect(result.success).toBe(true);
    expect(result.data?.length).toBe(1);
    expect(result.data?.[0].id).toBe('IMP_01');
  });

  it('should reject malformed or invalid imported JSON', () => {
    const malformed = '{ invalid json';
    const result1 = parseImportedQuestions(malformed);
    expect(result1.success).toBe(false);

    const missingFields = JSON.stringify([{ id: '1' }]); // missing text and category
    const result2 = parseImportedQuestions(missingFields);
    expect(result2.success).toBe(false);
  });

  it('should load and save contestants correctly', () => {
    expect(contestantsRepository.load().length).toBe(DEFAULT_CONTESTANTS.length);
    contestantsRepository.save(DEFAULT_CONTESTANTS.slice(0, 2));
    expect(contestantsRepository.load().length).toBe(2);
  });

  it('should load default words and save modified word bank', () => {
    expect(wordsRepository.load().length).toBe(DEFAULT_WORDS.length);
    const customWords: KeywordItem[] = [
      { id: 'w-1', word: 'ความรัก', category: 'moon', enabled: true }
    ];
    wordsRepository.save(customWords);
    expect(wordsRepository.load().length).toBe(1);
    expect(wordsRepository.load()[0].word).toBe('ความรัก');
  });

  it('should load default appearance settings and save customized settings', () => {
    const def = loadAppearanceSettings();
    expect(def.themeName).toBe(DEFAULT_APPEARANCE_SETTINGS.themeName);
    expect(def.spinMode).toBe(DEFAULT_APPEARANCE_SETTINGS.spinMode);

    saveAppearanceSettings({
      spinMode: '3d',
      particleDensity: 1.5,
      showCrownSilhouette: false
    });

    const updated = loadAppearanceSettings();
    expect(updated.spinMode).toBe('3d');
    expect(updated.particleDensity).toBe(1.5);
    expect(updated.showCrownSilhouette).toBe(false);
  });

  it('should manage history records lifecycle', () => {
    expect(historyRepository.load()).toEqual([]);
    const record: HistoryRecord = {
      id: 'h1',
      timestamp: Date.now(),
      sessionId: 's1',
      round: 'Round 1',
      contestantId: 'c1',
      contestantName: 'สมชาย',
      questionId: 'q1',
      questionText: 'คำถาม',
      category: 'Rain',
      seed: 123,
      timerConfiguredMs: 90000,
      timerUsedMs: 45000,
      isTimeout: false,
      result: 'completed'
    };
    appendHistoryRecord(record);
    const loaded = historyRepository.load();
    expect(loaded.length).toBe(1);
    expect(loaded[0].id).toBe('h1');

    historyRepository.save([]);
    expect(historyRepository.load().length).toBe(0);

    clearHistory();
    expect(historyRepository.load()).toEqual([]);
  });

  it('should load default timer sound settings when none exist', () => {
    const settings = loadTimerSoundSettings();
    expect(settings.tickSoundEnabled).toBe(DEFAULT_TIMER_SOUND_SETTINGS.tickSoundEnabled);
    expect(settings.warningSoundEnabled).toBe(DEFAULT_TIMER_SOUND_SETTINGS.warningSoundEnabled);
    expect(settings.finishSoundEnabled).toBe(DEFAULT_TIMER_SOUND_SETTINGS.finishSoundEnabled);
    expect(settings.tickVolume).toBe(DEFAULT_TIMER_SOUND_SETTINGS.tickVolume);
  });

  it('should save and load custom timer sound settings with migration fallback', () => {
    saveTimerSoundSettings({ tickSoundEnabled: false, warningSoundEnabled: false, finishSoundEnabled: true, tickVolume: 0.85 });
    const loaded = loadTimerSoundSettings();
    expect(loaded.tickSoundEnabled).toBe(false);
    expect(loaded.warningSoundEnabled).toBe(false);
    expect(loaded.finishSoundEnabled).toBe(true);
    expect(loaded.tickVolume).toBe(0.85);
  });

  it('should load default stage display settings and save custom overrides', () => {
    const defaultSettings = loadStageDisplaySettings();
    expect(defaultSettings.timerDisplayMode).toBe('center');
    expect(defaultSettings.showTimerOnlyWhenRunning).toBe(true);
    expect(defaultSettings.autoStartTimerOnReveal).toBe(false);

    saveStageDisplaySettings({
      timerDisplayMode: 'corner',
      showTimerOnlyWhenRunning: false,
      autoStartTimerOnReveal: true,
      questionFontSize: 'huge',
      warningThresholdMs: 45000,
      criticalThresholdMs: 15000
    });

    const loaded = loadStageDisplaySettings();
    expect(loaded.timerDisplayMode).toBe('corner');
    expect(loaded.showTimerOnlyWhenRunning).toBe(false);
    expect(loaded.autoStartTimerOnReveal).toBe(true);
    expect(loaded.questionFontSize).toBe('huge');
    expect(loaded.warningThresholdMs).toBe(45000);
    expect(loaded.criticalThresholdMs).toBe(15000);
  });

  it('should cap history to MAX_HISTORY_RECORDS (200 records)', () => {
    for (let i = 0; i < 250; i++) {
      appendHistoryRecord({
        id: `h_${i}`,
        sessionId: 'sess',
        timestamp: Date.now() + i,
        round: 'attitude',
        contestantId: `C_${i}`,
        contestantName: `ผู้เข้าแข่งขัน ${i}`,
        contestantNumber: i + 1,
        questionId: `Q_${i}`,
        questionText: `คำถาม ${i}`,
        category: 'Rain',
        seed: i,
        timerConfiguredMs: 90000,
        timerUsedMs: 30000,
        isTimeout: false,
        result: 'completed'
      });
    }
    const history = historyRepository.load();
    expect(history.length).toBe(200);
    expect(history[0].id).toBe('h_249'); // latest record is at the front
  });

  it('should sanitize HTML and script tags in imported questions', () => {
    const maliciousJson = JSON.stringify([
      {
        id: 'MAL_01',
        text: '<script>alert("xss")</script><b>คำถามทดสอบ</b><img src=x onerror=alert(1)>',
        category: '<svg onload=alert(1)>Rain</svg>',
        difficulty: 'medium',
        round: 'attitude',
        notes: '<iframe src="evil.html"></iframe>โน้ตทดสอบ',
        tags: ['<script>evil</script>', 'valid-tag']
      }
    ]);

    const result = parseImportedQuestions(maliciousJson);
    expect(result.success).toBe(true);
    expect(result.data?.length).toBe(1);
    const q = result.data![0];
    expect(q.text).not.toContain('<script>');
    expect(q.text).not.toContain('<img');
    expect(q.text).toContain('คำถามทดสอบ');
    expect(q.category).not.toContain('<svg');
    expect(q.notes).not.toContain('<iframe');
    expect(q.tags).not.toContain('<script>evil</script>');
    expect(q.tags).toEqual(['valid-tag']);
  });

  it('should export history records as valid CSV string', async () => {
    // Phase 9: the facade's duplicate CSV export is gone; this is the one the History page uses.
    const { exportHistoryToCSV } = await import('@/features/history/historyManager.ts');
    const records: HistoryRecord[] = [
      {
        id: 'rec_1',
        sessionId: 'sess_100',
        timestamp: 1774000000000,
        round: 'attitude',
        contestantId: 'C_1',
        contestantName: 'สมชาย ใจดี',
        contestantNumber: 1,
        questionId: 'Q_1',
        questionText: 'คำถามข้อที่หนึ่ง "มีเครื่องหมายคำพูด"',
        category: 'Rain',
        seed: 'seed-123',
        timerConfiguredMs: 90000,
        timerUsedMs: 45000,
        isTimeout: false,
        result: 'completed'
      }
    ];

    const csv = exportHistoryToCSV(records);
    const header = csv.split('\n')[0];
    expect(header).toContain('Contestant Name');
    expect(header).toContain('Time Used (s)');
    expect(csv).toContain('สมชาย ใจดี');
    expect(csv).toContain('45');
  });
});


