// Site visit — walk the land (new) → scoping cards (pick N of M) → site read.
// Walk-the-land is the action layer: tap hotspots on a stylized backyard SVG
// before you earn the right to ask questions. Discovery, not just picking.

import { el, statusBar } from '../../ui/components.js';
import { t } from '../../i18n/t.js';
import siteVisitsData from '../../data/site-visits.json';
import { sceneBackyard } from '../../ui/scenes.js';

// ===== Scene A: Walk the land =====
export function walkTheLand({ visitId, onComplete, onBack }) {
  const visit = siteVisitsData.visits[visitId];
  if (!visit) throw new Error('site visit not found: ' + visitId);
  const wtl = visit.walkTheLand;
  if (!wtl) {
    // Fallback — if there's no walkTheLand, skip straight to scoping
    onComplete(visitId, []);
    return el('div', { class: 'screen' }, 'Loading…');
  }

  const spotted = new Set();
  const refs = {};

  function updateHud() {
    refs.counter.textContent = `${spotted.size} / ${wtl.requiredSpots}`;
    const ready = spotted.size >= wtl.requiredSpots;
    refs.continueBtn.style.opacity = ready ? '1' : '0.5';
    refs.continueBtn.style.pointerEvents = ready ? 'auto' : 'none';
  }

  function spotHotspot(h) {
    if (spotted.has(h.id)) return;
    spotted.add(h.id);
    const dot = refs.hotspotDots[h.id];
    if (dot) {
      dot.classList.add('hotspot-dot-spotted');
      dot.textContent = '✓';
    }
    // Show the "noticed" note at the top
    refs.noteSlot.replaceChildren(
      el('div', { class: 'noticed-callout' }, [
        el('div', { class: 'noticed-label' }, '👁 NOTICED · ' + h.label),
        el('div', { class: 'noticed-body' }, h.note),
      ])
    );
    setTimeout(() => {
      if (refs.noteSlot.firstChild) refs.noteSlot.replaceChildren();
    }, 2600);
    updateHud();
  }

  refs.counter = el('span', { class: 'walk-counter' },
    `0 / ${wtl.requiredSpots}`);

  refs.noteSlot = el('div', { class: 'walk-note-slot' });

  // Build the SVG scene with the hotspot pulse dots
  refs.hotspotDots = {};
  const sceneSvg = buildBackyardScene();
  const hotspotLayer = el('div', { class: 'hotspot-layer' },
    wtl.hotspots.map((h) => {
      const dot = el('div', {
        class: 'hotspot-dot',
        style: `left: ${h.x}%; top: ${h.y}%`,
        onclick: () => spotHotspot(h),
      }, '●');
      refs.hotspotDots[h.id] = dot;
      return dot;
    })
  );

  refs.continueBtn = el('div', {
    class: 'phone-cta phone-cta-flat',
    style: 'margin: 0; opacity: 0.5; pointer-events: none;',
    onclick: () => onComplete(visitId, Array.from(spotted)),
  }, 'Ask her questions ›');

  return el('div', { class: 'screen walk-the-land' }, [
    statusBar('10:04'),
    el('div', { class: 'back-row', onclick: onBack }, [
      el('span', {}, '‹ Home'),
    ]),
    el('div', { class: 'site-visit-eyebrow-row' }, [
      el('div', { class: 'screen-eyebrow site-visit-eyebrow' },
        '🚶 WALK THE LAND · ' + visit.clientName.split(' ').slice(-1)[0]),
      el('div', { class: 'site-visit-city' }, 'Tap what you notice'),
    ]),
    el('div', { class: 'walk-scene-wrap' }, [
      sceneSvg,
      hotspotLayer,
      refs.noteSlot,
    ]),
    el('div', { class: 'cards-counter-row' }, [
      el('div', { class: 'cards-counter-left' },
        `👁 Spot at least ${wtl.requiredSpots}`),
      el('div', { class: 'cards-counter-right' }, refs.counter),
    ]),
    el('div', { class: 'walkthrough-footer' }, refs.continueBtn),
  ]);
}

function buildBackyardScene() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 300 200');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  svg.classList.add('walk-svg');
  svg.innerHTML = `
    <!-- Sky -->
    <rect width="300" height="80" fill="#2a3a52"/>
    <!-- Tree line far -->
    <path d="M 0 80 Q 30 65 60 75 Q 100 60 140 72 Q 180 58 220 70 Q 260 62 300 72 L 300 80 L 0 80 Z"
          fill="#1a3020"/>
    <!-- Grass -->
    <rect y="80" width="300" height="120" fill="#2d4a2a"/>
    <!-- Creek (right side) -->
    <path d="M 300 80 Q 250 110 260 150 Q 240 180 240 200 L 300 200 Z"
          fill="#3a5a7a" opacity="0.75"/>
    <path d="M 258 110 Q 252 140 262 170" stroke="#5a7a9a" stroke-width="1.5" fill="none" opacity="0.6"/>
    <!-- Gravel drive (left-top) -->
    <path d="M 0 60 L 70 90 L 70 100 L 0 70 Z" fill="#5a5a4a" opacity="0.8"/>
    <!-- Gate posts -->
    <rect x="65" y="78" width="3" height="14" fill="#3a2a1a"/>
    <rect x="80" y="78" width="3" height="14" fill="#3a2a1a"/>
    <!-- Shed (bottom-left) -->
    <rect x="30" y="130" width="40" height="30" fill="#5a4a3a"/>
    <polygon points="30,130 50,118 70,130" fill="#3a2a1a"/>
    <circle cx="55" cy="150" r="2" fill="#4ade80" opacity="0.9"/>
    <!-- Veggie beds (lower center) -->
    <rect x="150" y="150" width="50" height="10" fill="#4a3a2a"/>
    <rect x="150" y="162" width="50" height="10" fill="#4a3a2a"/>
    <circle cx="160" cy="155" r="2" fill="#4ade80"/>
    <circle cx="175" cy="155" r="2" fill="#4ade80"/>
    <circle cx="190" cy="155" r="2" fill="#4ade80"/>
    <circle cx="160" cy="167" r="2" fill="#4ade80"/>
    <circle cx="175" cy="167" r="2" fill="#4ade80"/>
    <!-- Property fence (right) -->
    <line x1="235" y1="90" x2="235" y2="200" stroke="#6a5a4a" stroke-width="2" opacity="0.7"/>
    <line x1="232" y1="92" x2="238" y2="92" stroke="#6a5a4a" stroke-width="1" opacity="0.7"/>
    <line x1="232" y1="105" x2="238" y2="105" stroke="#6a5a4a" stroke-width="1" opacity="0.7"/>
    <line x1="232" y1="125" x2="238" y2="125" stroke="#6a5a4a" stroke-width="1" opacity="0.7"/>
    <line x1="232" y1="145" x2="238" y2="145" stroke="#6a5a4a" stroke-width="1" opacity="0.7"/>
    <!-- Build stake marker (center) -->
    <line x1="150" y1="100" x2="150" y2="120" stroke="#f5f5f0" stroke-width="2"/>
    <circle cx="150" cy="100" r="3" fill="#e24b4a"/>
    <!-- Sun hint top-right -->
    <circle cx="265" cy="25" r="12" fill="#fbbf24" opacity="0.7"/>
  `;
  return svg;
}

export function siteVisitScoping({ visitId, onComplete, onBack, spottedIds = [] }) {
  const visit = siteVisitsData.visits[visitId];
  if (!visit) throw new Error('site visit not found: ' + visitId);

  const picked = new Set();

  // Which scoping cards are unlocked by the hotspots the player noticed
  const unlockedCardIds = new Set();
  if (visit.walkTheLand) {
    for (const h of visit.walkTheLand.hotspots) {
      if (spottedIds.includes(h.id)) unlockedCardIds.add(h.unlocks);
    }
  } else {
    // Legacy: all cards unlocked
    for (const c of visit.scoping_cards) unlockedCardIds.add(c.id);
  }
  const availableCards = visit.scoping_cards.filter((c) => unlockedCardIds.has(c.id));
  const effectivePick = Math.min(visit.pickCount, availableCards.length);

  // Build refs first, assemble second — closures over refs stay valid.
  const refs = {};

  refs.counter = el('div', { class: 'cards-counter-right' },
    t('site_visit.picked_counter', { picked: 0, total: effectivePick }));

  refs.askBtn = el('div', {
    class: 'phone-cta phone-cta-flat cards-ask-btn',
    style: 'opacity: 0.5; pointer-events: none;',
    onclick: () => {
      if (picked.size === effectivePick) {
        onComplete(visitId, Array.from(picked));
      }
    },
  }, t('site_visit.ask_cta'));

  const cardNodes = availableCards.map((card) =>
    scopingCard(card, picked, effectivePick, refs)
  );
  refs.cardNodes = cardNodes;

  refs.grid = el('div', { class: 'cards-grid' }, cardNodes);

  return el('div', { class: 'screen site-visit' }, [
    statusBar('10:04'),
    el('div', { class: 'site-visit-eyebrow-row' }, [
      el('div', { class: 'screen-eyebrow site-visit-eyebrow' },
        '📍 ' + t('site_visit.eyebrow', { client: visit.clientName.split(' ').slice(-1)[0] })),
      el('div', { class: 'site-visit-city' }, visit.city),
    ]),
    el('div', { class: 'scene-frame' }, [sceneBackyard()]),
    el('div', { class: 'site-visit-greeting' }, [
      el('div', { class: 'site-visit-greeting-avatar' }, visit.clientInitials),
      el('div', { class: 'site-visit-greeting-body' }, [
        el('div', { class: 'site-visit-greeting-name' }, visit.clientName),
        el('div', { class: 'site-visit-greeting-line' }, visit.greeting),
      ]),
    ]),
    el('div', { class: 'cards-counter-row' }, [
      el('div', { class: 'cards-counter-left' },
        '🂠 ' + t('site_visit.cards_hint', { picked: effectivePick, total: availableCards.length })),
      refs.counter,
    ]),
    refs.grid,
    refs.askBtn,
  ]);
}

function scopingCard(card, pickedSet, max, refs) {
  const cardNode = el('div', {
    class: 'scoping-card',
    onclick: () => {
      const isPicked = pickedSet.has(card.id);
      if (isPicked) {
        pickedSet.delete(card.id);
      } else if (pickedSet.size < max) {
        pickedSet.add(card.id);
      } else {
        return; // soft rejection — already at max
      }
      updatePickedUi(refs, pickedSet, max);
    },
  }, [
    el('div', { class: 'scoping-card-head' }, [
      el('span', { class: 'scoping-card-icon' }, card.icon),
      el('span', { class: 'scoping-card-label' }, card.label),
    ]),
    el('div', { class: 'scoping-card-hint' }, card.hint),
  ]);
  cardNode.dataset.cardId = card.id;
  return cardNode;
}

function updatePickedUi(refs, pickedSet, max) {
  if (!refs || !refs.cardNodes) return;

  refs.cardNodes.forEach((cardEl) => {
    cardEl.classList.toggle('scoping-card-picked', pickedSet.has(cardEl.dataset.cardId));
  });
  if (refs.counter) {
    refs.counter.textContent = t('site_visit.picked_counter', { picked: pickedSet.size, total: max });
  }
  const ready = pickedSet.size === max;
  if (refs.askBtn) {
    refs.askBtn.style.opacity = ready ? '1' : '0.5';
    refs.askBtn.style.pointerEvents = ready ? 'auto' : 'none';
  }
}

export function siteRead({ visitId, pickedIds, onContinue, onBack }) {
  const visit = siteVisitsData.visits[visitId];
  if (!visit) throw new Error('site visit not found: ' + visitId);

  const pickedSet = new Set(pickedIds);
  const asked = visit.scoping_cards.filter((c) => pickedSet.has(c.id));
  const skipped = visit.scoping_cards.filter((c) => !pickedSet.has(c.id));

  return el('div', { class: 'screen site-read' }, [
    statusBar('10:42'),
    el('div', { class: 'back-row', onclick: onBack }, [
      el('span', {}, '‹ Site visit'),
    ]),
    el('div', { class: 'site-visit-eyebrow-row' }, [
      el('div', { class: 'screen-eyebrow site-visit-eyebrow' },
        '📓 ' + t('site_visit.site_read_eyebrow', { client: visit.clientName.split(' ').slice(-1)[0] })),
      el('div', { class: 'site-read-title' }, t('site_visit.site_read_title')),
    ]),
    el('div', { class: 'site-read-cards' }, [
      ...asked.map((c) => readCardAsked(c)),
      ...skipped.map((c) => readCardSkipped(c)),
    ]),
    el('div', { class: 'callout', style: 'margin: 8px 14px' }, [
      el('div', { class: 'callout-label' }, '✦ ' + t('site_visit.scope_read_label')),
      el('div', { class: 'callout-body' }, visit.scope_read),
    ]),
    el('div', {
      class: 'phone-cta phone-cta-flat',
      style: 'margin: 6px 14px 14px',
      onclick: () => onContinue(visitId),
    }, '📝 ' + t('site_visit.write_quote')),
  ]);
}

function readCardAsked(c) {
  const toneClass =
    c.reveal.tone === 'good' ? 'read-card-good' :
    c.reveal.tone === 'warn' ? 'read-card-warn' :
    c.reveal.tone === 'danger' ? 'read-card-danger' :
    '';
  return el('div', { class: 'read-card ' + toneClass }, [
    el('div', { class: 'read-card-head' }, [
      el('span', { class: 'read-card-icon' }, c.icon),
      el('span', { class: 'read-card-label' }, c.label.toUpperCase() + flagSuffix(c.reveal.tone)),
    ]),
    el('div', { class: 'read-card-body' }, c.reveal.text),
  ]);
}

function flagSuffix(tone) {
  if (tone === 'warn') return ' · flagged';
  if (tone === 'danger') return ' · must check';
  return '';
}

function readCardSkipped(c) {
  return el('div', { class: 'read-card read-card-skipped' }, [
    el('div', { class: 'read-card-head' }, [
      el('span', { class: 'read-card-icon' }, c.icon),
      el('span', { class: 'read-card-label' }, c.label.toUpperCase() + ' · ' + t('site_visit.not_asked_prefix')),
    ]),
    el('div', { class: 'read-card-body skipped-note' }, c.skipped_hint || "You didn't ask this one."),
  ]);
}
