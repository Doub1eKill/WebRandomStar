/**
 * Routes (Phase 5, Q1 = react-router). Hash routing works from any static host without
 * server rewrites.
 *
 *   #/                      stage (projector + session host)
 *   #/control/<page>        remote control window, one lazy-loaded route per page
 *                           (live, winners, timer, music, words, questions, contestants, history, appearance)
 *
 * Declarative <Routes> + React.lazy instead of a data router: the stage needs none of the
 * data-router APIs and this keeps react-router at ~15 KB gzip instead of ~32 KB.
 * The old popout link `?mode=controller` is redirected to `#/control/live`.
 */
import React, { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { StagePage } from '@/pages/stage/StagePage.tsx';

const ControlLayout = lazy(() => import('@/pages/control/ControlLayout.tsx'));
const LivePage = lazy(() => import('@/pages/control/LivePage.tsx'));
const WordsPage = lazy(() => import('@/pages/control/WordsPage.tsx'));
const QuestionsPage = lazy(() => import('@/pages/control/QuestionsPage.tsx'));
const TimerPage = lazy(() => import('@/pages/control/TimerPage.tsx'));
const MusicPage = lazy(() => import('@/pages/control/MusicPage.tsx'));
const ContestantsPage = lazy(() => import('@/pages/control/ContestantsPage.tsx'));
const HistoryPage = lazy(() => import('@/pages/control/HistoryPage.tsx'));
const AppearancePage = lazy(() => import('@/pages/control/AppearancePage.tsx'));
const WinnersPage = lazy(() => import('@/pages/control/WinnersPage.tsx'));

export const CONTROL_PAGES = ['live', 'winners', 'timer', 'music', 'words', 'questions', 'contestants', 'history', 'appearance'] as const;

const page = (Component: React.ComponentType) => (
  <Suspense fallback={null}>
    <Component />
  </Suspense>
);

export const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<StagePage />} />
    <Route path="/control" element={page(ControlLayout)}>
      {/* Absolute targets: a relative "live" inside the splat route would resolve to
          /control/<unknown>/live, match the splat again and redirect forever. */}
      <Route index element={<Navigate to="/control/live" replace />} />
      <Route path="live" element={page(LivePage)} />
      <Route path="winners" element={page(WinnersPage)} />
      <Route path="words" element={page(WordsPage)} />
      <Route path="questions" element={page(QuestionsPage)} />
      <Route path="timer" element={page(TimerPage)} />
      <Route path="music" element={page(MusicPage)} />
      <Route path="contestants" element={page(ContestantsPage)} />
      <Route path="history" element={page(HistoryPage)} />
      <Route path="appearance" element={page(AppearancePage)} />
      <Route path="*" element={<Navigate to="/control/live" replace />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

/** Backward compatibility: `/?mode=controller` (old popout/bookmarks) → `/#/control/live`. */
export function redirectLegacyControllerUrl(location: Location = window.location, history: History = window.history): boolean {
  const params = new URLSearchParams(location.search);
  if (params.get('mode') !== 'controller') return false;
  params.delete('mode');
  const search = params.toString();
  history.replaceState(null, '', `${location.pathname}${search ? `?${search}` : ''}#/control/live`);
  return true;
}
