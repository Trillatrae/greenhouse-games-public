// Drive scene — hybrid top-down.
// Truck crawls the route; when it hits the event trigger point,
// we switch to the event-card overlay. On choice, we continue.

import { el, statusBar } from '../../ui/components.js';
import { t } from '../../i18n/t.js';
import routesData from '../../data/routes.json';

// --- Simple state ---
let anim = null;
let progressPct = 0;
let currentTruckEl = null;

export function driveScene({ routeId, onEventChoice, onArrive, onToast }) {
  const route = routesData.routes[routeId];
  if (!route) throw new Error('route not found: ' + routeId);

  // Reset state each entry
  progressPct = 0;

  const node = el('div', { class: 'screen drive-scene' }, [
    statusBar('9:34'),
    el('div', { class: 'drive-header' }, [
      el('div', { class: 'drive-eyebrow' },
        '🚗 ' + t('drive.en_route', { dest: route.to.split(' (')[0] })),
      el('div', { class: 'drive-eta' },
        'ETA 10:04 ', el('span', { class: 'drive-eta-penalty' }, '(+4)')),
    ]),
    el('div', { class: 'drive-canvas-wrap' }, [
      driveSvg(),
      el('div', { class: 'drive-hud' }, [
        hudTile('speed', '52', 'mph'),
        hudTile('fuel', '¾', ''),
        hudTile('dist', '18', 'mi'),
      ]),
      el('div', { class: 'drive-event-hint', id: 'drive-event-hint' }, [
        el('div', { class: 'drive-event-hint-icon' }, '?'),
        el('div', { class: 'drive-event-hint-body' }, [
          el('div', { class: 'drive-event-hint-label' }, t('drive.event_ahead')),
          el('div', { class: 'drive-event-hint-text' }, 'something on the shoulder'),
        ]),
      ]),
    ]),
    el('div', { class: 'drive-footer-row' }, [
      el('div', { class: 'drive-footer-btn', onclick: () => onToast('Pull over — later phase') },
        '⏸ ' + t('drive.pull_over')),
      el('div', { class: 'drive-footer-btn', onclick: () => onToast('Hands-free — later phase') },
        '📞 ' + t('drive.hands_free')),
    ]),
  ]);

  // Start the truck animation. When it reaches the event trigger pct,
  // show the event overlay. On choice, resume to arrival.
  queueMicrotask(() => startDriveAnimation(node, route, onEventChoice, onArrive));

  return node;
}

function hudTile(labelKey, value, unit) {
  return el('div', { class: 'drive-hud-tile' }, [
    el('div', { class: 'drive-hud-label' }, labelKey),
    el('div', { class: 'drive-hud-value' }, [
      value,
      unit && el('span', { class: 'drive-hud-unit' }, ' ' + unit),
    ]),
  ]);
}

function driveSvg() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 300 420');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  svg.classList.add('drive-svg');
  svg.innerHTML = `
    <rect width="300" height="420" fill="#0f1a14"/>

    <path d="M 60 180 Q 100 200 130 220 T 200 260 Q 240 290 290 310"
          stroke="#1a1a1a" stroke-width="5" fill="none" stroke-linecap="round"/>

    <path id="drive-road-base" d="M 20 20 Q 60 60 50 100 T 100 180 Q 140 220 160 240 T 220 300 Q 260 340 280 400"
          stroke="#1a2a1a" stroke-width="16" fill="none" stroke-linecap="round"/>
    <path d="M 20 20 Q 60 60 50 100 T 100 180 Q 140 220 160 240 T 220 300 Q 260 340 280 400"
          stroke="#2a2a2a" stroke-width="11" fill="none" stroke-linecap="round"/>

    <!-- travelled path trail -->
    <path id="drive-trail" d="M 20 20 Q 60 60 50 100 T 100 180 Q 140 220 160 240 T 220 300 Q 260 340 280 400"
          stroke="#4ade80" stroke-width="3" fill="none" stroke-linecap="round"
          stroke-dasharray="1 1000" />

    <circle cx="40" cy="60"  r="6" fill="#1a4a2a" opacity="0.6"/>
    <circle cx="130" cy="100" r="7" fill="#1a4a2a" opacity="0.6"/>
    <circle cx="200" cy="200" r="6" fill="#1a4a2a" opacity="0.6"/>
    <circle cx="90" cy="320" r="5" fill="#1a4a2a" opacity="0.6"/>
    <circle cx="240" cy="240" r="6" fill="#1a4a2a" opacity="0.6"/>

    <!-- traffic warning on 316 -->
    <circle cx="160" cy="240" r="6" fill="#fbbf24" opacity="0.4"/>
    <text x="166" y="244" fill="#fbbf24" font-size="7" font-family="sans-serif">slow</text>

    <!-- event marker (purple ?) -->
    <circle cx="65" cy="285" r="9" fill="#a78bfa" opacity="0.2"/>
    <text x="60.5" y="289" fill="#a78bfa" font-size="11" font-family="sans-serif" font-weight="bold">?</text>

    <circle cx="20" cy="20" r="5" fill="#1a4a2a" stroke="#2a5a3a" stroke-width="1"/>
    <text x="30" y="18" fill="#999" font-size="8" font-family="sans-serif">Athens</text>
    <circle cx="280" cy="400" r="7" fill="#22863a" stroke="#4ade80" stroke-width="1.5" opacity="0.6"/>
    <text x="235" y="396" fill="#999" font-size="8" font-family="sans-serif">Watkinsville</text>

    <!-- truck + radar -->
    <g id="drive-truck" transform="translate(20 20)">
      <circle r="30" fill="none" stroke="#4ade80" stroke-width="0.5" opacity="0.15"/>
      <circle r="22" fill="none" stroke="#4ade80" stroke-width="1" opacity="0.3"/>
      <rect x="-6" y="-9" width="12" height="18" rx="2" fill="#22863a" stroke="#4ade80" stroke-width="1.5"/>
    </g>
  `;
  return svg;
}

function startDriveAnimation(screenNode, route, onEventChoice, onArrive) {
  const svg = screenNode.querySelector('.drive-svg');
  if (!svg) return;
  const roadPath = svg.querySelector('#drive-road-base');
  const trail = svg.querySelector('#drive-trail');
  const truck = svg.querySelector('#drive-truck');
  const hint = screenNode.querySelector('#drive-event-hint');
  if (!roadPath || !truck || !trail) return;

  const pathLength = roadPath.getTotalLength();
  const event = route.events[0];
  const triggerPct = event?.triggerAtPct ?? 101;

  const DURATION_MS = 8000; // ~8 sec from start to arrival
  const startedAt = performance.now();
  let eventFired = false;
  let arrived = false;

  function tick(now) {
    if (!document.body.contains(screenNode)) return; // navigated away
    const pct = Math.min(100, ((now - startedAt) / DURATION_MS) * 100);
    progressPct = pct;

    const point = roadPath.getPointAtLength((pct / 100) * pathLength);
    truck.setAttribute('transform', `translate(${point.x} ${point.y})`);

    trail.setAttribute('stroke-dasharray', `${(pct / 100) * pathLength} ${pathLength}`);

    if (hint) {
      // show the hint only when near the event (within 10%)
      const distanceToEvent = triggerPct - pct;
      hint.style.opacity = (distanceToEvent > 0 && distanceToEvent < 15) ? '1' : '0.2';
    }

    if (!eventFired && pct >= triggerPct) {
      eventFired = true;
      showEventOverlay(screenNode, event, (choiceId) => {
        onEventChoice(choiceId);
        // Resume toward arrival
        continueToArrival(screenNode, roadPath, trail, truck, pathLength, pct, DURATION_MS, now, onArrive);
      });
      return; // pause the animation while event is up
    }

    if (pct >= 100 && !arrived) {
      arrived = true;
      onArrive();
      return;
    }
    anim = requestAnimationFrame(tick);
  }

  anim = requestAnimationFrame(tick);
  currentTruckEl = truck;
}

function continueToArrival(screenNode, roadPath, trail, truck, pathLength, resumePct, totalMs, resumedAtTick, onArrive) {
  const resumeStart = performance.now();
  const remaining = (1 - resumePct / 100) * totalMs;

  function tick(now) {
    if (!document.body.contains(screenNode)) return;
    const elapsed = now - resumeStart;
    const pct = Math.min(100, resumePct + (elapsed / remaining) * (100 - resumePct));
    const point = roadPath.getPointAtLength((pct / 100) * pathLength);
    truck.setAttribute('transform', `translate(${point.x} ${point.y})`);
    trail.setAttribute('stroke-dasharray', `${(pct / 100) * pathLength} ${pathLength}`);

    if (pct >= 100) {
      onArrive();
      return;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function showEventOverlay(screenNode, event, onChoice) {
  const overlay = el('div', { class: 'drive-event-overlay' }, [
    el('div', { class: 'drive-event-card' }, [
      el('div', { class: 'drive-event-label' }, '⚠ ' + t('drive.event_label')),
      el('div', { class: 'drive-event-title' }, event.title),
      el('div', { class: 'drive-event-scene' }, event.scene),
      el('div', { class: 'drive-event-choices' },
        event.choices.map((c) =>
          el('div', {
            class: 'drive-event-choice drive-choice-' + c.tone,
            onclick: () => {
              overlay.remove();
              onChoice(c.id);
            },
          }, [
            el('div', { class: 'drive-choice-label' }, c.label + ' ›'),
            el('div', { class: 'drive-choice-cost' }, c.cost),
          ])
        )
      ),
      el('div', { class: 'drive-event-timer' }, t('drive.pick_in', { n: 10 })),
    ]),
  ]);
  screenNode.append(overlay);
}
