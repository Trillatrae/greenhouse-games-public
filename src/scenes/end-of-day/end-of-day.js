// End-of-day wrap screen — the first time the player sees their choices
// turned into real numbers. Setbacks not failures: every day finishes
// here, but with wildly different stats depending on how it went.

import { el, statusBar } from '../../ui/components.js';
import { t } from '../../i18n/t.js';

export function endOfDay({ state, deltas, voiceLine, onSleep, onBack }) {
  return el('div', { class: 'screen end-of-day' }, [
    statusBar('9:47'),
    el('div', { class: 'eod-opening' }, [
      el('div', { class: 'eod-eyebrow' }, 'END OF DAY · WED OCT 21'),
      el('div', { class: 'eod-headline' }, voiceLine),
    ]),
    el('div', { class: 'eod-scroll' }, [
      // Stat tiles
      el('div', { class: 'eod-stats' }, [
        statTile('Bank', '$' + state.player.bank.toLocaleString('en-US'),
          deltas.bank >= 0 ? `+$${deltas.bank.toLocaleString('en-US')}` : `-$${Math.abs(deltas.bank).toLocaleString('en-US')}`,
          deltas.bank >= 0 ? 'tone-good' : 'tone-warn'),
        statTile('Reviews',
          state.reviews.length + (deltas.reviews ? ` (${deltas.reviews.stars}★ new)` : ''),
          deltas.reviews ? 'first review in' : 'no change',
          deltas.reviews ? 'tone-good' : 'tone-muted'),
        statTile('Karma',
          String(state.player.karma),
          deltas.karma > 0 ? `+${deltas.karma}` : deltas.karma < 0 ? String(deltas.karma) : 'no change',
          deltas.karma > 0 ? 'tone-good' : deltas.karma < 0 ? 'tone-warn' : 'tone-muted'),
        statTile('Energy',
          state.player.energy + '%',
          deltas.energy >= 0 ? `+${deltas.energy}%` : `${deltas.energy}%`,
          state.player.energy > 50 ? 'tone-good' : 'tone-warn'),
      ]),

      // Review card
      deltas.reviews && reviewCard(deltas.reviews),

      // Lessons callout
      deltas.lessons.length > 0 && el('div', { class: 'callout', style: 'margin: 10px 14px' }, [
        el('div', { class: 'callout-label' }, '✦ WHAT TODAY TAUGHT YOU'),
        el('div', { class: 'callout-body' },
          deltas.lessons.map((l) => el('div', { class: 'lesson-row' }, '• ' + l))
        ),
      ]),

      // Future problems (if any)
      deltas.futureProblems.length > 0 && el('div', { class: 'callout callout-warning', style: 'margin: 10px 14px' }, [
        el('div', { class: 'callout-label' }, '⚠ QUEUED FOR LATER'),
        el('div', { class: 'callout-body' },
          deltas.futureProblems.map((p) => el('div', { class: 'lesson-row' },
            `• Day ${state.player.dayNumber + p.triggerDay}: ${p.summary}`
          ))
        ),
      ]),

      // Tomorrow preview
      el('div', { class: 'eod-tomorrow' }, [
        el('div', { class: 'eod-tomorrow-label' }, '🌅 TOMORROW · THU OCT 22'),
        el('div', { class: 'eod-tomorrow-body' },
          state.player.energy < 30
            ? 'Energy low. Go easy. One job max.'
            : 'Open day. Weather holds. Follow up on open threads.'
        ),
      ]),
    ]),
    el('div', { class: 'walkthrough-footer' }, [
      el('div', {
        class: 'phone-cta phone-cta-flat',
        style: 'margin: 0',
        onclick: onSleep,
      }, '🌙 Call it a day'),
    ]),
  ]);
}

function statTile(label, value, deltaText, toneClass) {
  return el('div', { class: 'eod-stat-tile' }, [
    el('div', { class: 'eod-stat-label' }, label),
    el('div', { class: 'eod-stat-value' }, value),
    el('div', { class: 'eod-stat-delta ' + toneClass }, deltaText),
  ]);
}

function reviewCard(review) {
  const stars = '★'.repeat(review.stars) + '☆'.repeat(5 - review.stars);
  return el('div', { class: 'eod-review-card' }, [
    el('div', { class: 'eod-review-eyebrow' }, '⭐ FIRST REVIEW'),
    el('div', { class: 'eod-review-stars' }, stars),
    el('div', { class: 'eod-review-text' }, '"' + review.text + '"'),
    el('div', { class: 'eod-review-author' }, '— ' + review.author),
  ]);
}
