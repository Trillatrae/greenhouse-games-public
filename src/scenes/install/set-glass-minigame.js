// Set-glass minigame — tap when the sweeping cursor hits the green zone.
// Three panes. Performance feeds back into install consequences.

import { el } from '../../ui/components.js';

const PANE_COUNT = 3;
const SWEEP_MS = 1600;         // one full sweep (left → right)
const PERFECT_ZONE_PCT = 10;   // width of center "perfect" window
const OK_ZONE_PCT = 30;        // width of "ok" window around perfect

/**
 * Returns a Promise that resolves with { perfects, oks, misses } when done.
 */
export function playSetGlass(container) {
  return new Promise((resolve) => {
    let currentPane = 0;
    const results = { perfects: 0, oks: 0, misses: 0 };
    let rafId = null;
    let startedAt = 0;

    const refs = {};
    refs.paneLabel = el('div', { class: 'sg-pane-label' }, 'Pane 1 of ' + PANE_COUNT);
    refs.scoreRow = el('div', { class: 'sg-score-row' }, renderDots(results));
    refs.cursor = el('div', { class: 'sg-cursor' });
    refs.feedback = el('div', { class: 'sg-feedback' });

    const bar = el('div', { class: 'sg-bar', onclick: handleTap }, [
      el('div', { class: 'sg-zone sg-zone-miss' }),
      el('div', {
        class: 'sg-zone sg-zone-ok',
        style: `left: ${50 - OK_ZONE_PCT / 2}%; width: ${OK_ZONE_PCT}%`,
      }),
      el('div', {
        class: 'sg-zone sg-zone-perfect',
        style: `left: ${50 - PERFECT_ZONE_PCT / 2}%; width: ${PERFECT_ZONE_PCT}%`,
      }),
      refs.cursor,
    ]);

    const screen = el('div', { class: 'sg-screen' }, [
      el('div', { class: 'sg-header' }, [
        el('span', {}, '🪟 SET GLASS'),
        refs.scoreRow,
      ]),
      refs.paneLabel,
      el('div', { class: 'sg-instructions' }, 'Tap when the cursor hits the center.'),
      bar,
      refs.feedback,
    ]);
    container.replaceChildren(screen);

    function animateSweep() {
      startedAt = performance.now();
      function tick(now) {
        if (!document.body.contains(screen)) return;
        const elapsed = (now - startedAt) % SWEEP_MS;
        // Triangle wave: 0 → 100 → 0 (bounces)
        const half = SWEEP_MS / 2;
        const pct = elapsed < half
          ? (elapsed / half) * 100
          : (1 - (elapsed - half) / half) * 100;
        refs.cursor.style.left = pct + '%';
        rafId = requestAnimationFrame(tick);
      }
      rafId = requestAnimationFrame(tick);
    }

    function handleTap() {
      if (currentPane >= PANE_COUNT) return;
      const left = parseFloat(refs.cursor.style.left) || 0;
      const dist = Math.abs(left - 50);
      let kind;
      if (dist <= PERFECT_ZONE_PCT / 2) {
        results.perfects++;
        kind = 'perfect';
      } else if (dist <= OK_ZONE_PCT / 2) {
        results.oks++;
        kind = 'ok';
      } else {
        results.misses++;
        kind = 'miss';
      }
      flashFeedback(kind);
      refs.scoreRow.replaceChildren(...renderDots(results));
      currentPane++;
      if (currentPane >= PANE_COUNT) {
        cancelAnimationFrame(rafId);
        setTimeout(() => resolve(results), 700);
      } else {
        refs.paneLabel.textContent = `Pane ${currentPane + 1} of ${PANE_COUNT}`;
      }
    }

    function flashFeedback(kind) {
      const text = kind === 'perfect' ? 'PERFECT' : kind === 'ok' ? 'OK' : 'MISS';
      const flash = el('div', { class: 'sg-flash sg-flash-' + kind }, text);
      refs.feedback.replaceChildren(flash);
      setTimeout(() => { if (refs.feedback.firstChild) refs.feedback.replaceChildren(); }, 650);
    }

    animateSweep();
  });
}

function renderDots(results) {
  const dots = [];
  for (let i = 0; i < results.perfects; i++) dots.push(dot('perfect'));
  for (let i = 0; i < results.oks; i++) dots.push(dot('ok'));
  for (let i = 0; i < results.misses; i++) dots.push(dot('miss'));
  const remaining = PANE_COUNT - dots.length;
  for (let i = 0; i < remaining; i++) dots.push(dot('empty'));
  return dots;
}

function dot(kind) {
  return el('span', { class: 'sg-score-dot sg-score-' + kind });
}
