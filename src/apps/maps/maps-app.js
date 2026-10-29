// Maps app — route visualization + pre-drive setup.
// Stylized hand-drawn map, consistent with the drive scene.

import { el, statusBar } from '../../ui/components.js';
import { t } from '../../i18n/t.js';
import routesData from '../../data/routes.json';

export function mapsApp({ routeId = 'home-to-patel', onBack, onStartDrive }) {
  const route = routesData.routes[routeId];
  if (!route) throw new Error('route not found: ' + routeId);

  return el('div', { class: 'screen maps-app' }, [
    statusBar('6:59'),
    el('div', { class: 'back-row', onclick: onBack }, [
      el('span', {}, '‹ Home'),
    ]),
    el('div', { class: 'maps-canvas' }, [
      routeSvg(),
      el('div', { class: 'maps-header-card' }, [
        el('div', {}, [
          el('div', { class: 'maps-eyebrow' }, t('maps.to_label', { dest: route.to.split(' (')[0] })),
          el('div', { class: 'maps-eta-primary' },
            `${route.etaMin} min · ${route.distanceMi} mi`),
        ]),
        el('div', { class: 'maps-eta-right' }, [
          el('div', { class: 'maps-eta-label' }, t('maps.eta_label')),
          el('div', { class: 'maps-eta-time' }, route.arriveAt),
        ]),
      ]),
    ]),
    el('div', { class: 'maps-footer' }, [
      slowdownCallout(route),
      el('div', { class: 'maps-tiles' }, [
        tile(t('maps.fuel_label'), fuelFraction(route.fuelFraction), null),
        tile(
          t('maps.trailer_label'),
          route.trailerNeeded ? t('maps.trailer_loaded') : t('maps.trailer_not_needed'),
          route.trailerNeeded ? null : 'tile-ok'
        ),
      ]),
      el('div', {
        class: 'phone-cta phone-cta-flat maps-start-drive',
        onclick: () => onStartDrive(routeId),
      }, '🚗  ' + t('maps.start_drive')),
    ]),
  ]);
}

function routeSvg() {
  // Hand-drawn stylized route. Consistent with the drive scene.
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 300 420');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  svg.classList.add('maps-svg');
  svg.innerHTML = `
    <!-- backdrop -->
    <rect width="300" height="420" fill="#0f1a14"/>

    <!-- side roads (background) -->
    <path d="M 60 180 Q 100 200 130 220 T 200 260 Q 240 290 290 310"
          stroke="#1a1a1a" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M 20 240 Q 80 250 140 260"
          stroke="#1a1a1a" stroke-width="4" fill="none" stroke-linecap="round"/>

    <!-- main road: dark base + lighter asphalt -->
    <path d="M 20 20 Q 60 60 50 100 T 100 180 Q 140 220 160 240 T 220 300 Q 260 340 280 400"
          stroke="#1a2a1a" stroke-width="16" fill="none" stroke-linecap="round"/>
    <path d="M 20 20 Q 60 60 50 100 T 100 180 Q 140 220 160 240 T 220 300 Q 260 340 280 400"
          stroke="#2a2a2a" stroke-width="11" fill="none" stroke-linecap="round"/>

    <!-- route color: green open, yellow slow, green open -->
    <path d="M 20 20 Q 60 60 50 100 T 100 180"
          stroke="#4ade80" stroke-width="4" fill="none" stroke-linecap="round" stroke-dasharray="6,4"/>
    <path d="M 100 180 Q 140 220 160 240 T 220 300"
          stroke="#fbbf24" stroke-width="4" fill="none" stroke-linecap="round" stroke-dasharray="6,4"/>
    <path d="M 220 300 Q 260 340 280 400"
          stroke="#4ade80" stroke-width="4" fill="none" stroke-linecap="round" stroke-dasharray="6,4"/>

    <!-- trees -->
    <circle cx="40" cy="60"  r="6" fill="#1a4a2a" opacity="0.6"/>
    <circle cx="70" cy="130" r="5" fill="#1a4a2a" opacity="0.6"/>
    <circle cx="130" cy="100" r="7" fill="#1a4a2a" opacity="0.6"/>
    <circle cx="200" cy="200" r="6" fill="#1a4a2a" opacity="0.6"/>
    <circle cx="90" cy="320" r="5" fill="#1a4a2a" opacity="0.6"/>
    <circle cx="240" cy="240" r="6" fill="#1a4a2a" opacity="0.6"/>

    <!-- traffic warning marker on 316 -->
    <circle cx="160" cy="240" r="8" fill="#fbbf24" opacity="0.25"/>
    <circle cx="160" cy="240" r="4" fill="#fbbf24"/>

    <!-- start -->
    <circle cx="20" cy="20" r="7" fill="#4ade80" stroke="#0a0a0a" stroke-width="2"/>
    <circle cx="20" cy="20" r="3" fill="#0a0a0a"/>
    <text x="30" y="18" fill="#f5f5f0" font-size="9" font-family="sans-serif">Athens</text>

    <!-- destination -->
    <circle cx="280" cy="400" r="10" fill="#22863a" stroke="#4ade80" stroke-width="2"/>
    <text x="235" y="395" fill="#f5f5f0" font-size="9" font-family="sans-serif">Watkinsville</text>
  `;
  return svg;
}

function slowdownCallout(route) {
  const slow = route.segments.find((s) => s.state === 'slow');
  if (!slow) return null;
  return el('div', { class: 'callout callout-warning' }, [
    el('div', { class: 'callout-label' }, '⚠ ' + slow.label.split(' · ')[0]),
    el('div', { class: 'callout-body' },
      t('maps.slowdown_body', { leave: route.leaveBy, arrive: route.arriveAt })),
  ]);
}

function fuelFraction(f) {
  if (f >= 0.95) return 'full';
  if (f >= 0.7) return '¾ tank';
  if (f >= 0.45) return '½ tank';
  if (f >= 0.2) return '¼ tank';
  return 'low';
}

function tile(label, value, extraClass) {
  return el('div', { class: 'maps-tile' }, [
    el('div', { class: 'maps-tile-label' }, label),
    el('div', { class: 'maps-tile-value ' + (extraClass || '') }, value),
  ]);
}
