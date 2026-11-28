import React, { useEffect, useId, useMemo, useState } from 'react';
import { Contestant } from '@/types/question.ts';
import { DEFAULT_WINNER_HEADLINE, WinnerAnnouncement, WinnerEntry } from '@/types/session.ts';
import { winnerImage } from '@/data/winnerPhotos.ts';
import { audioEngine } from '@/features/audio/audioEngine.ts';
import { useFadePresence } from './useFadePresence.ts';

/** The reveal: anticipation until the burst (ms), then the result. */
export const REVEAL_BURST_MS = 1700;
/** An announcement older than this (a reload of the stage) is shown without the reveal or sound. */
const FRESH_MS = 20_000;
/** Cards come in one after another after the burst, this far apart. */
const CARD_STAGGER_MS = 300;
const CARD_FIRST_DELAY_MS = 450;

/**
 * Poster height (vh) for the number of winners: one is shown large, many share the stage.
 * Heading ≈ 26vh; tiara + caption ≈ 0.32 × poster + 2vh, so one row fits up to ≈ 53vh.
 */
export function winnerPosterHeightVh(count: number): number {
  if (count <= 1) return 52;
  if (count === 2) return 50;
  if (count === 3) return 45;
  if (count === 4) return 39;
  if (count <= 6) return 33;
  return 22; // 7–12: two rows
}

/** Cards per row: one row up to 6, then two even rows (7 → 4 + 3, 12 → 6 + 6). */
export const winnersPerRow = (count: number): number => (count <= 6 ? Math.max(1, count) : Math.ceil(count / 2));

const THAI = /[฀-๿]/;

/**
 * Split a heading into the pieces that drop in one by one: letters for Latin text, words for
 * text with Thai (a Thai letter cannot be separated from its vowel and tone marks).
 */
export function headlinePieces(text: string): string[] {
  if (THAI.test(text)) return text.split(/\s+/).filter(Boolean).flatMap((w, i) => (i === 0 ? [w] : [' ', w]));
  return Array.from(text);
}

/** Deterministic pseudo-random numbers in [0, 1) (no Math.random during render). */
const rand = (i: number, n: number) => {
  const x = Math.sin((i + 1) * 12.9898 + n * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

interface WinnerScreenProps {
  active: boolean;
  /** What was announced; none = waiting for the announcement. */
  announcement?: WinnerAnnouncement;
  contestants: Contestant[];
}

/**
 * Winner screen. Before an announcement: "and the winner is…" with a slowly pulsing tiara.
 * On an announcement: anticipation (light gathers into an orb), the burst (flash, shockwaves,
 * crystal shards, light pillars, confetti from both sides, a chime), then the heading and each
 * winner's poster in a crystal frame with a tiara. A new announcement replays the reveal.
 */
export const WinnerScreen: React.FC<WinnerScreenProps> = ({ active, announcement, contestants }) => {
  const { mounted, leaving } = useFadePresence(active);
  if (!mounted) return null;
  return (
    <div
      className={`stage-screen winner-screen${leaving ? ' is-leaving' : ''}`}
      data-testid="winner-screen"
      aria-hidden={leaving || undefined}
    >
      <div className="winner-backdrop" aria-hidden="true" />
      <div className="winner-stars" aria-hidden="true" />
      <div className="winner-rays" aria-hidden="true" />
      <div className="winner-spotlight winner-spotlight--left" aria-hidden="true" />
      <div className="winner-spotlight winner-spotlight--right" aria-hidden="true" />
      <div className="winner-floor" aria-hidden="true" />
      <Stardust />
      {announcement ? (
        <Reveal key={announcement.id} announcement={announcement} contestants={contestants} />
      ) : (
        <Waiting />
      )}
    </div>
  );
};

const Waiting: React.FC = () => (
  <div className="winner-content winner-waiting" data-testid="winner-waiting">
    <header className="winner-header">
      <div className="winner-eyebrow">SCI TECH · The Charm of Transition · Ambassador 2026</div>
      <Headline text="And the winner is…" />
    </header>
    <div className="winner-waiting-stage">
      <div className="winner-waiting-orb" aria-hidden="true" />
      <TiaraIcon className="winner-waiting-tiara" />
    </div>
  </div>
);

const Reveal: React.FC<{ announcement: WinnerAnnouncement; contestants: Contestant[] }> = ({ announcement, contestants }) => {
  // Fixed at mount: a fresh announcement plays the whole reveal; an old one just appears.
  const [fresh] = useState(() => Date.now() - announcement.at < FRESH_MS);
  const burstMs = fresh ? REVEAL_BURST_MS : 0;

  useEffect(() => {
    if (!fresh || !announcement.sound) return;
    const timer = setTimeout(() => audioEngine.playWordLock(), REVEAL_BURST_MS);
    return () => clearTimeout(timer);
  }, [fresh, announcement.sound]);

  const shown = announcement.winners
    .map(entry => ({ entry, contestant: contestants.find(c => c.id === entry.contestantId) }))
    .filter((w): w is { entry: WinnerEntry; contestant: Contestant } => Boolean(w.contestant));
  const count = shown.length;
  const title = announcement.headline.trim() || DEFAULT_WINNER_HEADLINE;

  return (
    <div
      className={`winner-content winner-reveal${fresh ? ' is-fresh' : ' is-settled'}`}
      data-testid="winner-reveal"
      data-count={count}
      style={{
        '--burst': `${burstMs}ms`,
        '--poster-h': `${winnerPosterHeightVh(count)}vh`,
        '--per-row': winnersPerRow(count)
      } as React.CSSProperties}
    >
      {fresh && <RevealEffects />}

      <header className="winner-header">
        <div className="winner-eyebrow">SCI TECH · The Charm of Transition · Ambassador 2026</div>
        <Headline text={title} />
        <div className="winner-divider" aria-hidden="true">
          <span className="winner-divider-line" />
          <span className="winner-divider-gem">✦</span>
          <span className="winner-divider-line" />
        </div>
      </header>

      <div className={`winner-stage${count > 6 ? ' is-two-rows' : ''}`}>
        {shown.map(({ entry, contestant }, i) => (
          <WinnerCard key={contestant.id} contestant={contestant} award={entry.award} delayMs={CARD_FIRST_DELAY_MS + i * CARD_STAGGER_MS} />
        ))}
      </div>

      {fresh && <ConfettiCannons />}
    </div>
  );
};

/** Heading in chrome-silver pieces that drop in one after another, then a gold glint sweeps across. */
const Headline: React.FC<{ text: string }> = ({ text }) => {
  const thai = THAI.test(text);
  const pieces = headlinePieces(text);
  // Thai sets narrower than Cinzel capitals, so it can run longer at full size.
  const length = Array.from(text).length;
  const [long, xlong] = thai ? [26, 40] : [16, 30];
  const size = length > xlong ? ' is-xlong' : length > long ? ' is-long' : '';
  return (
    <h1 className={`winner-headline${thai ? ' is-thai' : ''}${size}`} aria-label={text}>
      {pieces.map((piece, k) =>
        piece === ' ' ? (
          <span key={k} className="winner-headline-space" aria-hidden="true"> </span>
        ) : (
          <span key={k} className="winner-headline-piece" style={{ '--k': k } as React.CSSProperties} aria-hidden="true">
            {piece}
          </span>
        )
      )}
    </h1>
  );
};

const WinnerCard: React.FC<{ contestant: Contestant; award: string; delayMs: number }> = ({ contestant, award, delayMs }) => {
  const image = winnerImage(contestant);
  const nickname = contestant.nickname?.trim();
  const number = String(contestant.number).padStart(2, '0');
  const label = nickname || contestant.name;
  const meta = `No. ${number}${nickname && contestant.name && contestant.name !== nickname ? ` · ${contestant.name}` : ''}`;

  return (
    <figure className="winner-card" style={{ '--delay': `${delayMs}ms` } as React.CSSProperties}>
      <div className="winner-card-glow" aria-hidden="true" />
      <TiaraIcon className="winner-tiara" />
      <div className={`winner-frame${image ? ` is-${image.kind}` : ' is-empty'}`}>
        {image ? (
          <img className="winner-poster" src={image.url} alt={label} draggable={false} decoding="async" />
        ) : (
          <div className="winner-number" aria-label={`หมายเลข ${number}`}>
            <span className="winner-number-label">No.</span>
            <span className="winner-number-value">{number}</span>
          </div>
        )}
        <div className="winner-frame-shine" aria-hidden="true" />
      </div>
      <figcaption className={`winner-caption${award.trim() ? ' has-award' : ''}`}>
        {award.trim() && <div className="winner-award"><span>{award.trim()}</span></div>}
        <div className="winner-name">{label}</div>
        <div className="winner-meta">{meta}</div>
      </figcaption>
    </figure>
  );
};

/** Anticipation and burst layers of a fresh announcement (all CSS-timed from --burst). */
const RevealEffects: React.FC = () => {
  const shards = useMemo(
    () =>
      Array.from({ length: 44 }, (_, i) => {
        const angle = (i / 44) * Math.PI * 2 + (rand(i, 1) - 0.5) * 0.3;
        const distance = 34 + rand(i, 2) * 46; // vmax
        const tone = rand(i, 3);
        return {
          dx: `${(Math.cos(angle) * distance).toFixed(2)}vmax`,
          dy: `${(Math.sin(angle) * distance).toFixed(2)}vmax`,
          rot: `${((angle * 180) / Math.PI + 90).toFixed(1)}deg`,
          spin: `${((rand(i, 4) - 0.5) * 540).toFixed(0)}deg`,
          size: (0.7 + rand(i, 5) * 1.1).toFixed(2),
          delay: `${Math.round(rand(i, 6) * 120)}ms`,
          tone: tone > 0.7 ? 'is-gold' : tone > 0.4 ? 'is-ice' : ''
        };
      }),
    []
  );
  return (
    <div className="reveal-effects" aria-hidden="true">
      <div className="reveal-dim" />
      <div className="reveal-converge" />
      <div className="reveal-orb" />
      <div className="reveal-flash" />
      <div className="reveal-ring" />
      <div className="reveal-ring reveal-ring--late" />
      <div className="reveal-pillars">
        {[12, 30, 50, 70, 88].map((left, i) => (
          <span key={left} style={{ left: `${left}%`, '--p': i } as React.CSSProperties} />
        ))}
      </div>
      <div className="reveal-shards">
        {shards.map((s, i) => (
          <span
            key={i}
            className={s.tone || undefined}
            style={{
              '--dx': s.dx,
              '--dy': s.dy,
              '--rot': s.rot,
              '--spin': s.spin,
              '--size': s.size,
              '--d': s.delay
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
};

/** Confetti shot up from both bottom corners at the burst, then fluttering down. */
const ConfettiCannons: React.FC = () => {
  const pieces = useMemo(
    () =>
      Array.from({ length: 72 }, (_, i) => {
        const left = i % 2 === 0;
        const tone = rand(i, 7);
        return {
          side: left ? 'is-left' : 'is-right',
          dx: `${((left ? 1 : -1) * (12 + rand(i, 8) * 52)).toFixed(2)}vw`,
          rise: `${(-52 - rand(i, 9) * 40).toFixed(2)}vh`,
          duration: `${(3.6 + rand(i, 10) * 2.6).toFixed(2)}s`,
          delay: `${Math.round(rand(i, 11) * 450)}ms`,
          w: `${(0.5 + rand(i, 12) * 0.6).toFixed(2)}vh`,
          h: `${(0.9 + rand(i, 13) * 1.1).toFixed(2)}vh`,
          flip: `${Math.round(540 + rand(i, 14) * 900)}deg`,
          tone: tone > 0.72 ? 'is-gold' : tone > 0.48 ? 'is-lavender' : tone > 0.26 ? 'is-ice' : ''
        };
      }),
    []
  );
  return (
    <div className="reveal-confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          className={`reveal-confetti-piece ${p.side}`}
          style={{ '--dx': p.dx, '--rise': p.rise, '--dur': p.duration, '--d': p.delay, '--flip': p.flip } as React.CSSProperties}
        >
          <span className="reveal-confetti-rise">
            <span className={`reveal-confetti-paper ${p.tone}`.trim()} style={{ width: p.w, height: p.h }} />
          </span>
        </span>
      ))}
    </div>
  );
};

/** Slowly falling glitter (same layout every time). */
const Stardust: React.FC = () => {
  const specks = useMemo(
    () =>
      Array.from({ length: 46 }, (_, i) => ({
        left: `${(rand(i, 1) * 100).toFixed(2)}%`,
        size: `${(0.25 + rand(i, 2) * 0.55).toFixed(2)}vh`,
        duration: `${(7 + rand(i, 3) * 8).toFixed(2)}s`,
        delay: `${(-rand(i, 4) * 15).toFixed(2)}s`,
        drift: `${((rand(i, 5) - 0.5) * 8).toFixed(2)}vw`,
        gold: rand(i, 6) > 0.62
      })),
    []
  );
  return (
    <div className="winner-stardust" aria-hidden="true">
      {specks.map((s, i) => (
        <span
          key={i}
          className={s.gold ? 'is-gold' : undefined}
          style={{
            left: s.left,
            width: s.size,
            height: s.size,
            animationDuration: s.duration,
            animationDelay: s.delay,
            '--drift': s.drift
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

/** Crystal tiara, matching the crown in the key visual (silver band, gold star, ice gems). */
const TiaraIcon: React.FC<{ className?: string }> = ({ className }) => {
  // Unique gradient ids per tiara: several are on screen at once.
  const id = useId().replace(/:/g, '');
  const silver = `${id}-silver`;
  const gold = `${id}-gold`;
  const gem = `${id}-gem`;
  return (
    <svg className={className} viewBox="0 0 120 64" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={silver} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor="#dfe4f5" />
          <stop offset="0.55" stopColor="#9aa3c7" />
          <stop offset="1" stopColor="#f2f4ff" />
        </linearGradient>
        <linearGradient id={gold} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff3c4" />
          <stop offset="1" stopColor="#e0b458" />
        </linearGradient>
        <radialGradient id={gem} cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#a5f3fc" />
          <stop offset="1" stopColor="#6d5bd0" />
        </radialGradient>
      </defs>
      <path
        d="M8 54 L14 28 L30 42 L42 16 L52 36 L60 8 L68 36 L78 16 L90 42 L106 28 L112 54 Z"
        fill={`url(#${silver})`}
        stroke="#ffffff"
        strokeOpacity="0.7"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <rect x="8" y="52" width="104" height="8" rx="3" fill={`url(#${silver})`} stroke="#ffffff" strokeOpacity="0.6" strokeWidth="1" />
      <circle cx="14" cy="27" r="3.2" fill={`url(#${gem})`} />
      <circle cx="42" cy="15" r="3.6" fill={`url(#${gem})`} />
      <circle cx="78" cy="15" r="3.6" fill={`url(#${gem})`} />
      <circle cx="106" cy="27" r="3.2" fill={`url(#${gem})`} />
      <ellipse cx="60" cy="43" rx="6" ry="7.5" fill={`url(#${gem})`} />
      <path d="M60 0 L62.6 6.4 L69 9 L62.6 11.6 L60 18 L57.4 11.6 L51 9 L57.4 6.4 Z" fill={`url(#${gold})`} />
      <circle cx="30" cy="56" r="1.6" fill="#a5f3fc" />
      <circle cx="45" cy="56" r="1.6" fill="#ffffff" />
      <circle cx="75" cy="56" r="1.6" fill="#ffffff" />
      <circle cx="90" cy="56" r="1.6" fill="#a5f3fc" />
    </svg>
  );
};
