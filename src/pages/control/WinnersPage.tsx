/**
 * Remote "Winners" page (2026-11-29): choose what the stage shows (spin / standby / winner) and
 * run the announcements. Prepare first — the round or award, then the winners — and nothing
 * shows on the projector; "announce" puts exactly that on the winner screen with the reveal.
 * Editing afterwards does not change the screen until the next announcement.
 */
import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Crown, EyeOff, Megaphone, MonitorPlay, Radio, Sparkles, Trash2, Trophy, Volume2, VolumeX, X } from 'lucide-react';
import { useSession, useSessionActions } from '@/features/session/SessionProvider.tsx';
import { useContestants } from '@/storage/useRepository.ts';
import { ControlCard } from '@/features/control/ControlCard.tsx';
import { StageScreenSwitcher } from '@/features/control/StageScreenSwitcher.tsx';
import { DraftTextInput } from '@/features/winners/DraftTextInput.tsx';
import {
  AWARD_SUGGESTIONS,
  isSameAsAnnounced,
  knownWinners,
  moveWinner,
  removeWinner,
  setWinnerAward,
  toggleWinner
} from '@/features/winners/winnerEdits.ts';
import { winnerImage } from '@/data/winnerPhotos.ts';
import { DEFAULT_WINNER_HEADLINE, MAX_WINNERS, stageScreenOf, WinnerEntry } from '@/types/session.ts';
import { Contestant } from '@/types/question.ts';
import './livePage.css';
import './winnersPage.css';

const SOUND_KEY = 'winner_reveal_sound_v1';

function loadSoundPref(): boolean {
  try {
    return localStorage.getItem(SOUND_KEY) !== 'off';
  } catch {
    return true;
  }
}

export const WinnersPage: React.FC = () => {
  const screen = useSession(stageScreenOf);
  const savedWinners = useSession(s => s.winners);
  const headline = useSession(s => s.winnerHeadline) ?? '';
  const announcement = useSession(s => s.winnerAnnouncement);
  const { setStageScreen, setWinners, announceWinners, clearAnnouncement } = useSessionActions();
  const contestants = useContestants();
  const [sound, setSound] = useState(loadSoundPref);

  const ids = new Set(contestants.map(c => c.id));
  const winners = knownWinners(savedWinners ?? [], ids);
  const byId = new Map(contestants.map(c => [c.id, c] as const));
  const update = (next: WinnerEntry[]) => setWinners(next);
  const isFull = winners.length >= MAX_WINNERS;
  const onAir = announcement && screen === 'winner';
  const sameAsOnScreen = isSameAsAnnounced(headline, winners, announcement);

  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    try {
      localStorage.setItem(SOUND_KEY, next ? 'on' : 'off');
    } catch {
      // per-window convenience only
    }
  };

  return (
    <div className="win-page">
      <ControlCard variant="live" wide icon={<MonitorPlay size={16} aria-hidden="true" />} title="หน้าจอบนเวที (Stage Screen)">
        <StageScreenSwitcher variant="live" screen={screen} onChange={setStageScreen} winnerCount={announcement?.winners.length ?? 0} />
        <p className="win-hint">
          เปิดหน้า "ประกาศผู้ชนะ" ไว้ก่อนได้ จอจะขึ้นว่า "And the winner is…" รอไว้ แล้วค่อยกด "ประกาศผล" ด้านล่างตอนจะเฉลย
        </p>
      </ControlCard>

      <ControlCard variant="live" wide icon={<Radio size={16} aria-hidden="true" />} title="ผลที่แสดงบนจอตอนนี้">
        {announcement ? (
          <div className="win-onair">
            <div className="win-onair-head">
              <span className={`win-onair-badge${onAir ? ' is-live' : ''}`}>{onAir ? 'กำลังแสดง' : 'ประกาศแล้ว (จออยู่หน้าอื่น)'}</span>
              <span className="win-onair-title">{announcement.headline.trim() || DEFAULT_WINNER_HEADLINE}</span>
            </div>
            <div className="win-onair-people">
              {announcement.winners.map(w => {
                const c = byId.get(w.contestantId);
                if (!c) return null;
                return (
                  <span key={w.contestantId} className="win-onair-person">
                    <WinnerThumb contestant={c} className="win-onair-thumb" />
                    <span>
                      <span className="win-onair-name">{c.nickname?.trim() || c.name}</span>
                      {w.award.trim() && <span className="win-onair-award">{w.award.trim()}</span>}
                    </span>
                  </span>
                );
              })}
            </div>
            <button type="button" className="live-btn win-hide-btn" onClick={clearAnnouncement}>
              <EyeOff size={15} aria-hidden="true" />
              ซ่อนผล (กลับไปหน้า "And the winner is…")
            </button>
          </div>
        ) : (
          <div className="win-empty win-empty--inline">
            <Sparkles size={20} aria-hidden="true" />
            <span>ยังไม่ได้ประกาศผล หน้าผู้ชนะจะขึ้นว่า "And the winner is…" รอไว้</span>
          </div>
        )}
      </ControlCard>

      <div className="win-grid">
        <ControlCard variant="live" icon={<Megaphone size={16} aria-hidden="true" />} title="เตรียมประกาศผล">
          {/* ① Round / award */}
          <section className="win-step">
            <div className="win-step-title"><span className="win-step-no">1</span>รอบ / รางวัลที่จะประกาศ</div>
            <DraftTextInput
              id="win-headline"
              className="live-select live-select--full win-input"
              value={headline}
              placeholder={`เช่น ดาว SCI TECH 2026 (เว้นว่าง = ${DEFAULT_WINNER_HEADLINE})`}
              aria-label="รอบหรือรางวัลที่จะประกาศ"
              list="win-award-suggestions"
              maxLength={80}
              onCommit={value => setWinners(winners, value)}
            />
            <div className="win-chips" role="group" aria-label="รางวัลที่ใช้บ่อย">
              {AWARD_SUGGESTIONS.map(a => (
                <button
                  key={a}
                  type="button"
                  className={`win-chip${headline === a ? ' is-on' : ''}`}
                  aria-pressed={headline === a}
                  onClick={() => setWinners(winners, a)}
                >
                  {a}
                </button>
              ))}
            </div>
          </section>

          {/* ② Winners */}
          <section className="win-step">
            <div className="win-step-title">
              <span className="win-step-no">2</span>ผู้ชนะ ({winners.length}/{MAX_WINNERS})
              <span className="win-step-note">คลิกรูปทางขวาเพื่อเลือก</span>
            </div>
            {winners.length === 0 ? (
              <div className="win-empty">
                <Crown size={24} aria-hidden="true" />
                <span>ยังไม่ได้เลือกผู้ชนะ</span>
              </div>
            ) : (
              <ol className="win-list">
                {winners.map((w, i) => {
                  const c = byId.get(w.contestantId)!;
                  const name = c.nickname?.trim() || c.name;
                  return (
                    <li key={w.contestantId} className="win-row">
                      <span className="win-row-order" aria-hidden="true">{i + 1}</span>
                      <WinnerThumb contestant={c} className="win-row-thumb" />
                      <div className="win-row-body">
                        <div className="win-row-name">No. {String(c.number).padStart(2, '0')} · {name}</div>
                        <DraftTextInput
                          className="live-select win-input win-row-award"
                          value={w.award}
                          placeholder="รางวัลรายคน (ถ้ามี)"
                          aria-label={`รางวัลของ ${name}`}
                          list="win-award-suggestions"
                          maxLength={80}
                          onCommit={award => update(setWinnerAward(winners, w.contestantId, award))}
                        />
                      </div>
                      <div className="win-row-actions">
                        <button
                          type="button"
                          className="live-icon-btn win-icon-btn"
                          onClick={() => update(moveWinner(winners, w.contestantId, -1))}
                          disabled={i === 0}
                          aria-label={`เลื่อน ${name} ไปทางซ้าย`}
                          title="เลื่อนไปทางซ้ายบนจอ"
                        >
                          <ArrowLeft size={14} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="live-icon-btn win-icon-btn"
                          onClick={() => update(moveWinner(winners, w.contestantId, 1))}
                          disabled={i === winners.length - 1}
                          aria-label={`เลื่อน ${name} ไปทางขวา`}
                          title="เลื่อนไปทางขวาบนจอ"
                        >
                          <ArrowRight size={14} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="live-icon-btn win-icon-btn win-icon-btn--danger"
                          onClick={() => update(removeWinner(winners, w.contestantId))}
                          aria-label={`เอา ${name} ออก`}
                          title="เอาออก"
                        >
                          <X size={14} aria-hidden="true" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
          <datalist id="win-award-suggestions">
            {AWARD_SUGGESTIONS.map(a => <option key={a} value={a} />)}
          </datalist>

          {/* ③ Announce */}
          <section className="win-step win-step--announce">
            <div className="win-step-title"><span className="win-step-no">3</span>ประกาศผลบนจอ</div>
            <button
              type="button"
              className="win-announce-btn"
              onClick={() => announceWinners(sound)}
              disabled={winners.length === 0}
            >
              <Trophy size={20} aria-hidden="true" />
              {sameAsOnScreen ? 'ประกาศซ้ำ (เล่นเอฟเฟคอีกครั้ง)' : 'ประกาศผล'}
            </button>
            <div className="win-announce-row">
              <button type="button" className={`win-toggle${sound ? ' is-on' : ''}`} onClick={toggleSound} aria-pressed={sound}>
                {sound ? <Volume2 size={14} aria-hidden="true" /> : <VolumeX size={14} aria-hidden="true" />}
                เสียงตอนประกาศ: {sound ? 'เปิด' : 'ปิด'}
              </button>
              <button
                type="button"
                className="win-link-btn"
                onClick={() => setWinners([], '')}
                disabled={winners.length === 0 && !headline}
              >
                <Trash2 size={14} aria-hidden="true" />
                ล้างเพื่อเตรียมรางวัลถัดไป
              </button>
            </div>
            <p className="win-hint">
              {winners.length === 0
                ? 'เลือกผู้ชนะอย่างน้อย 1 คนก่อน'
                : announcement && !sameAsOnScreen
                  ? 'รายการนี้ยังไม่ได้ประกาศ จอยังแสดงผลเดิมอยู่จนกว่าจะกด "ประกาศผล"'
                  : 'กดแล้วจอจะเปลี่ยนเป็นหน้าประกาศผู้ชนะและเล่นเอฟเฟคทันที'}
            </p>
          </section>
        </ControlCard>

        <ControlCard variant="live" icon={<Trophy size={16} aria-hidden="true" />} title="เลือกผู้ชนะ (คลิกเพื่อเพิ่ม / เอาออก)">
          {contestants.length === 0 ? (
            <div className="win-empty">ยังไม่มีรายชื่อผู้เข้าแข่งขัน เพิ่มได้ที่แท็บ "ผู้เข้าแข่งขัน"</div>
          ) : (
            <div className="win-pick-grid">
              {contestants.map(c => {
                const order = winners.findIndex(w => w.contestantId === c.id);
                const picked = order >= 0;
                const name = c.nickname?.trim() || c.name;
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={`win-pick${picked ? ' is-picked' : ''}`}
                    aria-pressed={picked}
                    disabled={!picked && isFull}
                    onClick={() => update(toggleWinner(winners, c.id))}
                    title={picked ? `เอา ${name} ออก` : `เลือก ${name}`}
                  >
                    <WinnerThumb contestant={c} className="win-pick-thumb" />
                    {picked && (
                      <span className="win-pick-badge" aria-hidden="true">
                        <Check size={12} aria-hidden="true" /> {order + 1}
                      </span>
                    )}
                    <span className="win-pick-name">
                      <span className="win-pick-number">{String(c.number).padStart(2, '0')}</span>
                      {name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </ControlCard>
      </div>
    </div>
  );
};

/** The poster (or photo, or number) of a contestant, as small as the list needs. */
const WinnerThumb: React.FC<{ contestant: Contestant; className: string }> = ({ contestant, className }) => {
  const image = winnerImage(contestant);
  return (
    <span className={`win-thumb ${className}${image ? '' : ' is-empty'}`}>
      {image
        ? <img src={image.url} alt="" loading="lazy" draggable={false} />
        : <span>{contestant.number}</span>}
    </span>
  );
};

export default WinnersPage;
