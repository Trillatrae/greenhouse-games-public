// Site visit — scoping cards (pick N of M) + site read.
// This is where the player's attention has real consequences.

import { el, statusBar } from '../../ui/components.js';
import { t } from '../../i18n/t.js';
import siteVisitsData from '../../data/site-visits.json';

export function siteVisitScoping({ visitId, onComplete, onBack }) {
  const visit = siteVisitsData.visits[visitId];
  if (!visit) throw new Error('site visit not found: ' + visitId);

  const picked = new Set();
  const node = el('div', { class: 'screen site-visit' }, [
    statusBar('10:04'),
    el('div', { class: 'site-visit-eyebrow-row' }, [
      el('div', { class: 'screen-eyebrow site-visit-eyebrow' },
        '📍 ' + t('site_visit.eyebrow', { client: visit.clientName.split(' ').slice(-1)[0] })),
      el('div', { class: 'site-visit-city' }, visit.city),
    ]),
    el('div', { class: 'site-visit-placeholder' }, [
      el('div', { class: 'site-visit-placeholder-label' }, '🖼 ART PLACEHOLDER'),
      el('div', { class: 'site-visit-placeholder-brief' },
        'Watkinsville back lot · creek visible 40ft out · morning overcast · client walking toward truck'),
    ]),
    el('div', { class: 'site-visit-greeting' }, [
      el('div', { class: 'site-visit-greeting-avatar' }, visit.clientInitials),
      el('div', { class: 'site-visit-greeting-body' }, [
        el('div', { class: 'site-visit-greeting-name' }, visit.clientName),
        el('div', { class: 'site-visit-greeting-line' }, visit.greeting),
      ]),
    ]),
    el('div', { class: 'cards-counter-row' }, [
      el('div', { class: 'cards-counter-left' },
        '🂠 ' + t('site_visit.cards_hint', { picked: visit.pickCount, total: visit.scoping_cards.length })),
      el('div', { class: 'cards-counter-right', id: 'cards-counter' },
        t('site_visit.picked_counter', { picked: 0, total: visit.pickCount })),
    ]),
    el('div', { class: 'cards-grid', id: 'cards-grid' },
      visit.scoping_cards.map((card) => scopingCard(card, picked, visit.pickCount, node))
    ),
    el('div', {
      class: 'phone-cta phone-cta-flat cards-ask-btn',
      id: 'cards-ask-btn',
      style: 'opacity: 0.5; pointer-events: none;',
      onclick: () => {
        if (picked.size === visit.pickCount) {
          onComplete(visitId, Array.from(picked));
        }
      },
    }, t('site_visit.ask_cta')),
  ]);

  return node;
}

function scopingCard(card, pickedSet, max, rootNode) {
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
      updatePickedUi(rootNode, pickedSet, max);
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

function updatePickedUi(rootNode, pickedSet, max) {
  const grid = rootNode.querySelector('#cards-grid');
  const counter = rootNode.querySelector('#cards-counter');
  const askBtn = rootNode.querySelector('#cards-ask-btn');
  if (!grid || !counter || !askBtn) return;

  grid.querySelectorAll('.scoping-card').forEach((cardEl) => {
    cardEl.classList.toggle('scoping-card-picked', pickedSet.has(cardEl.dataset.cardId));
  });
  counter.textContent = t('site_visit.picked_counter', { picked: pickedSet.size, total: max });

  const ready = pickedSet.size === max;
  askBtn.style.opacity = ready ? '1' : '0.5';
  askBtn.style.pointerEvents = ready ? 'auto' : 'none';
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
