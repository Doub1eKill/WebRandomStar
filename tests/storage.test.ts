import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadQuestions,
  saveQuestions,
  loadContestants,
  saveContestants,
  loadWords,
  saveWords,
  loadAppearanceSettings,
  saveAppearanceSettings,
  loadHistory,
  saveHistory,
  appendHistoryRecord,
  clearHistory,
  exportQuestionsAsJSON,
  parseImportedQuestions,
  loadTimerSoundSettings,
  saveTimerSoundSettings,
  loadStageDisplaySettings,
  saveStageDisplaySettings
} from '../src/utils/storage.ts';
import { DEFAULT_QUESTIONS } from '../src/data/defaultQuestions.ts';
import { DEFAULT_CONTESTANTS } from '../src/data/defaultContestants.ts';
import { DEFAULT_WORDS } from '../src/data/defaultWords.ts';
import { DEFAULT_TIMER_SOUND_SETTINGS } from '../src/types/timer.ts';
import { DEFAULT_APPEARANCE_SETTINGS } from '../src/types/appearance.ts';
import { Question } from '../src/types/question.ts';
import { KeywordItem } from '../src/types/word.ts';
import { HistoryRecord } from '../src/types/history.ts';

describe('Storage Utilities & Multi-Namespace Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return default questions when storage is empty', () => {
    const questions = loadQuestions();
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
    saveQuestions(custom);
    const loaded = loadQuestions();
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
    expect(loadContestants().length).toBe(DEFAULT_CONTESTANTS.length);
    saveContestants(DEFAULT_CONTESTANTS.slice(0, 2));
    expect(loadContestants().length).toBe(2);
  });

  it('should load default words and save modified word bank', () => {
    expect(loadWords().length).toBe(DEFAULT_WORDS.length);
    const customWords: KeywordItem[] = [
      { id: 'w-1', word: 'ความรัก', category: 'moon', enabled: true }
    ];
    saveWords(customWords);
    expect(loadWords().length).toBe(1);
    expect(loadWords()[0].word).toBe('ความรัก');
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
    expect(loadHistory()).toEqual([]);
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
    const loaded = loadHistory();
    expect(loaded.length).toBe(1);
    expect(loaded[0].id).toBe('h1');

    saveHistory([]);
    expect(loadHistory().length).toBe(0);

    clearHistory();
    expect(loadHistory()).toEqual([]);
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
});
