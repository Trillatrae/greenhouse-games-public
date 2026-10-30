// Drive scene — real action layer.
// Top-down crawl + hazards you have to swerve around in real time
// + optional text interruption + the event card we already had.
// Tap LEFT ← or RIGHT → when a hazard is called out. Miss = HIT.

import { el, statusBar } from '../../ui/components.js';
import { t } from '../../i18n/t.js';
import routesData from '../../data/routes.json';

const DURATION_MS = 11000;

export function driveScene({ routeId, onEventChoice, onArrive, onHazard, onInterruption, onToast }) {
  const route = routesData.routes[routeId];
  if (!route) throw new Error('route not found: ' + routeId);

  // Build the screen first so we have refs
  const refs = {};
  refs.hud = el('div', { class: 'drive-hud' }, [
    hudTile('speed', '52', 'mph'),
    hudTile('fuel', '¾', ''),
    hudTile('clean', '0 / 3', ''),
  ]);
  refs.canvas = driveSvg();
  refs.hazardOverlay = el('div', { class: 'drive-hazard-slot' });
  refs.interruptionSlot = el('div', { class: 'drive-interruption-slot' });

  const node = el('div', { class: 'screen drive-scene' }, [
    statusBar('9:34'),
    el('div', { class: 'drive-header' }, [
      el('div', { class: 'drive-eyebrow' },
        '🚗 ' + t('drive.en_route', { dest: route.to.split(' (')[0] })),
      el('div', { class: 'drive-eta', id: 'drive-eta' },
        'ETA 10:04 ', el('span', { class: 'drive-eta-penalty', id: 'drive-penalty' }, '(+4)')),
    ]),
    el('div', { class: 'drive-canvas-wrap' }, [
      refs.canvas,
      refs.hud,
      refs.hazardOverlay,
      refs.interruptionSlot,
      // Steering tap zones — invisible, overlay the whole canvas
      el('div', {
        class: 'steer-zone steer-zone-left',
        onclick: () => handleSteer('left'),
      }, el('div', { class: 'steer-arrow' }, '←')),
      el('div', {
        class: 'steer-zone steer-zone-right',
        onclick: () => handleSteer('right'),
      }, el('div', { class: 'steer-arrow' }, '→')),
    ]),
    el('div', { class: 'drive-footer-row' }, [
      el('div', { class: 'drive-footer-btn', onclick: () => onToast('Pull over — later phase') },
        '⏸ ' + t('drive.pull_over')),
      el('div', { class: 'drive-footer-btn', onclick: () => onToast('Hands-free — later phase') },
        '📞 ' + t('drive.hands_free')),
    ]),
  ]);

  // --- Animation + hazard state ---
  const hazards = (route.hazards || []).map((h) => ({ ...h, resolved: false }));
  const interruption = route.interruption;
  const event = route.events[0];
  let currentHazard = null;
  let currentHazardFiredAt = 0;
  let cleanHits = 0;
  let totalHits = 0;
  let penaltySeconds = 4;
  let eventFired = false;
  let interruptionShown = false;
  let paused = false;
  let pausedPct = 0;
  let startedAt = performance.now();

  function handleSteer(direction) {
    if (!currentHazard || currentHazard.resolved) return;
    currentHazard.resolved = true;
    if (direction === currentHazard.swerve) {
      cleanHits++;
      flashOverlay('clean', 'CLEAN SWERVE');
      onHazard(currentHazard.kind, true);
    } else {
      totalHits++;
      penaltySeconds += 3;
      shakeCanvas();
      flashOverlay('hit', 'HIT · +3 min');
      onHazard(currentHazard.kind, false);
      updateEta();
    }
    hideHazardCallout();
    currentHazard = null;
  }

  function showHazardCallout(h) {
    refs.hazardOverlay.replaceChildren(
      el('div', { class: 'hazard-callout hazard-' + h.kind }, [
        el('div', { class: 'hazard-icon' }, h.kind === 'deer' ? '🦌' : h.kind === 'pothole' ? '🕳' : '⚠'),
        el('div', { class: 'hazard-body' }, [
          el('div', { class: 'hazard-label' }, h.label),
          el('div', { class: 'hazard-swerve' },
            h.swerve === 'left' ? '← SWERVE LEFT' : 'SWERVE RIGHT →'),
        ]),
        el('div', { class: 'hazard-timer-bar' }, [
          el('div', { class: 'hazard-timer-fill' }),
        ]),
      ])
    );
    // Animate the timer bar
    const fill = refs.hazardOverlay.querySelector('.hazard-timer-fill');
    if (fill) {
      fill.style.transition = `width ${h.window}ms linear`;
      requestAnimationFrame(() => { fill.style.width = '0%'; });
    }
  }

  function hideHazardCallout() {
    refs.hazardOverlay.replaceChildren();
  }

  function flashOverlay(kind, text) {
    const flash = el('div', { class: 'drive-flash flash-' + kind }, text);
    refs.hazardOverlay.append(flash);
    setTimeout(() => flash.remove(), 650);
    // Update HUD clean counter
    const cleanTile = refs.hud.querySelectorAll('.drive-hud-value')[2];
    if (cleanTile) {
      cleanTile.firstChild && (cleanTile.firstChild.nodeValue = `${cleanHits} / ${hazards.length}`);
    }
  }

  function shakeCanvas() {
    const wrap = refs.canvas.parentElement;
    if (!wrap) return;
    wrap.classList.add('canvas-shake');
    setTimeout(() => wrap.classList.remove('canvas-shake'), 400);
  }

  function updateEta() {
    const penalty = document.getElementById('drive-penalty');
    if (penalty) penalty.textContent = `(+${penaltySeconds})`;
  }

  function showInterruption() {
    if (interruptionShown || !interruption) return;
    interruptionShown = true;
    const card = el('div', { class: 'drive-interruption-card' }, [
      el('div', { class: 'interruption-head' }, [
        el('span', { class: 'interruption-from' }, '💬 ' + interruption.from),
        el('span', { class: 'interruption-x', onclick: () => {
          onInterruption('dismissed');
          card.remove();
        } }, '×'),
      ]),
      el('div', { class: 'interruption-body' }, interruption.preview),
      el('div', { class: 'interruption-actions' }, [
        el('div', {
          class: 'interruption-btn',
          onclick: () => { onInterruption('read'); card.remove(); },
        }, 'Pull up'),
        el('div', {
          class: 'interruption-btn secondary',
          onclick: () => { onInterruption('deferred'); card.remove(); },
        }, 'Later'),
      ]),
    ]);
    refs.interruptionSlot.append(card);
    setTimeout(() => { if (card.parentElement) card.remove(); }, 5000);
  }

  // --- Core animation ---
  const roadPath = refs.canvas.querySelector('#drive-road-base');
  const trail = refs.canvas.querySelector('#drive-trail');
  const truck = refs.canvas.querySelector('#drive-truck');
  const pathLength = roadPath.getTotalLength();

  function tick(now) {
    if (!document.body.contains(node)) return;
    if (paused) { requestAnimationFrame(tick); return; }

    const pct = Math.min(100, ((now - startedAt) / DURATION_MS) * 100);

    const point = roadPath.getPointAtLength((pct / 100) * pathLength);
    truck.setAttribute('transform', `translate(${point.x} ${point.y})`);
    trail.setAttribute('stroke-dasharray', `${(pct / 100) * pathLength} ${pathLength}`);

    // Fire hazards as the truck reaches their trigger pct
    for (const h of hazards) {
      if (!h.resolved && !h.fired && pct >= h.atPct) {
        h.fired = true;
        currentHazard = h;
        currentHazardFiredAt = now;
        showHazardCallout(h);
        // Auto-resolve if the player doesn't tap in time
        setTimeout(() => {
          if (!h.resolved) {
            h.resolved = true;
            if (currentHazard === h) currentHazard = null;
            totalHits++;
            penaltySeconds += 3;
            shakeCanvas();
            flashOverlay('hit', 'MISSED · +3 min');
            hideHazardCallout();
            onHazard(h.kind, false);
            updateEta();
          }
        }, h.window + 100);
      }
    }

    // Fire interruption
    if (interruption && pct >= interruption.atPct) {
      showInterruption();
    }

    // Event trigger (preserved from before)
    if (!eventFired && event && pct >= event.triggerAtPct) {
      eventFired = true;
      paused = true;
      pausedPct = pct;
      showEventOverlay(node, event, (choiceId) => {
        onEventChoice(choiceId);
        paused = false;
        startedAt = performance.now() - (pausedPct / 100) * DURATION_MS;
      });
    }

    if (pct >= 100) {
      // Final toast of clean/dirty summary via onHazard with 'summary'
      onHazard('__summary', { clean: cleanHits, hits: totalHits, penalty: penaltySeconds });
      onArrive();
      return;
    }
    requestAnimationFrame(tick);
  }

  queueMicrotask(() => requestAnimationFrame(tick));

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
    <path id="drive-trail" d="M 20 20 Q 60 60 50 100 T 100 180 Q 140 220 160 240 T 220 300 Q 260 340 280 400"
          stroke="#4ade80" stroke-width="3" fill="none" stroke-linecap="round"
          stroke-dasharray="1 1000" />
    <circle cx="40" cy="60"  r="6" fill="#1a4a2a" opacity="0.6"/>
    <circle cx="130" cy="100" r="7" fill="#1a4a2a" opacity="0.6"/>
    <circle cx="200" cy="200" r="6" fill="#1a4a2a" opacity="0.6"/>
    <circle cx="90" cy="320" r="5" fill="#1a4a2a" opacity="0.6"/>
    <circle cx="240" cy="240" r="6" fill="#1a4a2a" opacity="0.6"/>
    <circle cx="160" cy="240" r="6" fill="#fbbf24" opacity="0.4"/>
    <text x="166" y="244" fill="#fbbf24" font-size="7" font-family="sans-serif">slow</text>
    <circle cx="65" cy="285" r="9" fill="#a78bfa" opacity="0.2"/>
    <text x="60.5" y="289" fill="#a78bfa" font-size="11" font-family="sans-serif" font-weight="bold">?</text>
    <circle cx="20" cy="20" r="5" fill="#1a4a2a" stroke="#2a5a3a" stroke-width="1"/>
    <text x="30" y="18" fill="#999" font-size="8" font-family="sans-serif">Athens</text>
    <circle cx="280" cy="400" r="7" fill="#22863a" stroke="#4ade80" stroke-width="1.5" opacity="0.6"/>
    <text x="235" y="396" fill="#999" font-size="8" font-family="sans-serif">Watkinsville</text>
    <g id="drive-truck" transform="translate(20 20)">
      <circle r="30" fill="none" stroke="#4ade80" stroke-width="0.5" opacity="0.15"/>
      <circle r="22" fill="none" stroke="#4ade80" stroke-width="1" opacity="0.3"/>
      <rect x="-6" y="-9" width="12" height="18" rx="2" fill="#22863a" stroke="#4ade80" stroke-width="1.5"/>
    </g>
  `;
  return svg;
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
