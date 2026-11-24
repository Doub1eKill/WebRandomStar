/**
 * Phase 4: one place for reading and writing a localStorage-backed collection.
 *
 * - B7: "never saved" (no key) gives the defaults; a saved empty list stays empty.
 * - S3: every load is validated/repaired; older shapes go through `migrate`. The schema
 *   version lives in a separate key, so the stored data keeps exactly the format and key it
 *   had before (older builds of the app can still read it).
 * - S4: a failed write is reported to the operator and returned to the caller.
 * - B8/PF12: parsed values are cached per raw string, and `subscribe` also fires when another
 *   window changes the key, so every window shows the same data without re-parsing JSON.
 */
import { notifyOperator } from '@/shared/notices/operatorNotices.ts';

export const SCHEMA_VERSIONS_KEY = 'season_transition_schema_versions';

export interface SaveResult {
  ok: boolean;
  error?: string;
}

export interface RepositoryOptions<T> {
  key: string;
  /** Human-readable name used in operator notices. */
  label: string;
  defaults: () => T;
  schemaVersion: number;
  /** Return a valid value (repairing what it can) or null if the data is unusable. */
  validate: (raw: unknown) => T | null;
  /** Upgrade data written by an older schema version (0 = data saved before versioning). */
  migrate?: (raw: unknown, fromVersion: number) => unknown;
  /** Older keys read when `key` has never been written. */
  legacyKeys?: string[];
}

export interface Repository<T> {
  readonly key: string;
  load: () => T;
  save: (value: T) => SaveResult;
  subscribe: (listener: () => void) => () => void;
}

function readVersions(): Record<string, number> {
  try {
    const raw = localStorage.getItem(SCHEMA_VERSIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeVersion(key: string, version: number): void {
  const versions = readVersions();
  if (versions[key] === version) return;
  versions[key] = version;
  localStorage.setItem(SCHEMA_VERSIONS_KEY, JSON.stringify(versions));
}

export function createRepository<T>(options: RepositoryOptions<T>): Repository<T> {
  const { key, label, defaults, schemaVersion, validate, migrate, legacyKeys = [] } = options;
  const listeners = new Set<() => void>();
  let cachedRaw: string | null | undefined; // undefined = nothing cached yet
  let cachedValue: T;
  let defaultsValue: T | undefined;
  let reportedCorruptRaw: string | null = null;

  const readRaw = (): { raw: string | null; legacy: boolean } => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) return { raw, legacy: false };
      for (const legacyKey of legacyKeys) {
        const legacyRaw = localStorage.getItem(legacyKey);
        if (legacyRaw !== null) return { raw: legacyRaw, legacy: true };
      }
    } catch {
      // storage unavailable
    }
    return { raw: null, legacy: false };
  };

  const fallback = (): T => {
    if (defaultsValue === undefined) defaultsValue = defaults();
    return defaultsValue;
  };

  const parse = (raw: string | null, legacy: boolean): T => {
    if (raw === null) return fallback(); // B7: never saved
    try {
      let data: unknown = JSON.parse(raw);
      const version = legacy ? 0 : (readVersions()[key] ?? 0);
      if (migrate && version < schemaVersion) data = migrate(data, version);
      const valid = validate(data);
      if (valid !== null) return valid;
    } catch {
      // fall through to the corrupt-data path
    }
    if (reportedCorruptRaw !== raw) {
      reportedCorruptRaw = raw;
      notifyOperator('warning', `ข้อมูล${label}ที่บันทึกไว้อ่านไม่ได้ ระบบจึงใช้ค่าเริ่มต้นแทน (ข้อมูลเดิมยังไม่ถูกลบ)`);
    }
    return fallback();
  };

  const load = (): T => {
    const { raw, legacy } = readRaw();
    if (cachedRaw !== undefined && raw === cachedRaw) return cachedValue;
    cachedValue = parse(raw, legacy);
    cachedRaw = raw;
    return cachedValue;
  };

  const notify = () => listeners.forEach(fn => fn());

  const save = (value: T): SaveResult => {
    let raw: string;
    try {
      raw = JSON.stringify(value);
      localStorage.setItem(key, raw);
      writeVersion(key, schemaVersion);
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      notifyOperator('error', `บันทึก${label}ไม่สำเร็จ (พื้นที่เก็บข้อมูลของเบราว์เซอร์อาจเต็ม) การเปลี่ยนแปลงล่าสุดจะหายเมื่อรีโหลด`);
      return { ok: false, error };
    }
    cachedRaw = raw;
    cachedValue = value;
    notify();
    return { ok: true };
  };

  const onStorage = (e: StorageEvent) => {
    if (e.key === key || e.key === null) notify(); // null = localStorage.clear() elsewhere
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    if (listeners.size === 1 && typeof window !== 'undefined') window.addEventListener('storage', onStorage);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0 && typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
    };
  };

  return { key, load, save, subscribe };
}
