/** Appearance settings storage (moved from the storage/storageApi facade in Phase 9). */
import { AppearanceSettings } from '@/types/appearance.ts';
import { appearanceRepository } from '@/storage/repositories.ts';
import { SaveResult } from '@/shared/lib/createRepository.ts';

export const loadAppearanceSettings = (): AppearanceSettings => appearanceRepository.load();

/** Saves a partial update merged over the stored settings. */
export function saveAppearanceSettings(settings: Partial<AppearanceSettings>): SaveResult {
  return appearanceRepository.save({ ...appearanceRepository.load(), ...settings });
}
