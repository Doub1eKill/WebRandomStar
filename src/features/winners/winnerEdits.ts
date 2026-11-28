/**
 * Pure edits on the winner list (the control window sends the result with setWinners).
 */
import { MAX_WINNERS, WinnerAnnouncement, WinnerEntry } from '@/types/session.ts';

/** Rounds / awards offered as one-click choices and in the award fields (any text can be typed). */
export const AWARD_SUGGESTIONS = [
  'THE WINNER',
  'ดาว SCI TECH 2026',
  'เดือน SCI TECH 2026',
  'SCI TECH Ambassador 2026',
  'รองอันดับ 1',
  'รองอันดับ 2',
  'ขวัญใจมหาชน',
  'Popular Vote'
];

export const isWinner = (winners: WinnerEntry[], contestantId: string): boolean =>
  winners.some(w => w.contestantId === contestantId);

/** Add the contestant at the end (no-op when full), or take them off when already listed. */
export function toggleWinner(winners: WinnerEntry[], contestantId: string): WinnerEntry[] {
  if (isWinner(winners, contestantId)) return winners.filter(w => w.contestantId !== contestantId);
  if (winners.length >= MAX_WINNERS) return winners;
  return [...winners, { contestantId, award: '' }];
}

export function removeWinner(winners: WinnerEntry[], contestantId: string): WinnerEntry[] {
  return winners.filter(w => w.contestantId !== contestantId);
}

/** Move a winner one place left (-1) or right (+1) on the stage; ends stay put. */
export function moveWinner(winners: WinnerEntry[], contestantId: string, delta: -1 | 1): WinnerEntry[] {
  const from = winners.findIndex(w => w.contestantId === contestantId);
  const to = from + delta;
  if (from < 0 || to < 0 || to >= winners.length) return winners;
  const out = winners.slice();
  [out[from], out[to]] = [out[to], out[from]];
  return out;
}

export function setWinnerAward(winners: WinnerEntry[], contestantId: string, award: string): WinnerEntry[] {
  return winners.map(w => (w.contestantId === contestantId ? { ...w, award } : w));
}

/** Drop winners whose contestant no longer exists (deleted from the list). */
export function knownWinners(winners: WinnerEntry[], contestantIds: ReadonlySet<string>): WinnerEntry[] {
  return winners.filter(w => contestantIds.has(w.contestantId));
}

/** Is the prepared heading and list exactly what is on the winner screen now? */
export function isSameAsAnnounced(headline: string, winners: WinnerEntry[], announcement?: WinnerAnnouncement): boolean {
  if (!announcement || announcement.headline !== headline || announcement.winners.length !== winners.length) return false;
  return announcement.winners.every((w, i) => w.contestantId === winners[i].contestantId && w.award === winners[i].award);
}
