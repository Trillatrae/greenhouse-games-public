// Home screen — HBGreenhouses OS, 8 apps.
// Phase 1: only Phone is functional. Others show a "coming soon" toast.

import { el, statusBar } from '../ui/components.js';
import { t } from '../i18n/t.js';

const APPS = [
  { id: 'phone',    label: 'Phone',    color: '#22863a', text: '#fff',   badge: 3, icon: '📞', live: true  },
  { id: 'messages', label: 'Messages', color: '#4ade80', text: '#0a0a0a', badge: 2, icon: '💬', live: true  },
  { id: 'mail',     label: 'Mail',     color: '#f5f5f0', text: '#22863a', badge: 1, icon: '✉', live: false },
  { id: 'weather',  label: 'Weather',  color: '#1a2744', text: '#f5f5f0', badge: 0, icon: '☁', live: false },
  { id: 'maps',     label: 'Maps',     color: '#22863a', text: '#fff',   badge: 0, icon: '📍', live: false },
  { id: 'camera',   label: 'Camera',   color: '#f5f5f0', text: '#0a0a0a', badge: 0, icon: '📷', live: false },
  { id: 'reviews',  label: 'Reviews',  color: '#1a1a1a', text: '#666',   badge: 0, icon: '★', live: false },
  { id: 'bank',     label: 'Bank',     color: '#22863a', text: '#f5f5f0', badge: 0, icon: '🏦', live: false },
];

export function homeScreen({ onOpenApp, onToast }) {
  const grid = el('div', { class: 'home-grid' },
    APPS.map((a) =>
      el('button', {
        class: 'app-tile',
        onclick: () => (a.live ? onOpenApp(a.id) : onToast(a.label + ' — coming next phase')),
      }, [
        el('div', {
          class: 'app-icon',
          style: `background:${a.color};color:${a.text};`,
        }, [
          el('span', { class: 'app-glyph' }, a.icon),
          a.badge > 0 && el('div', { class: 'app-badge' }, String(a.badge)),
        ]),
        el('span', { class: 'app-label' }, a.label),
      ])
    )
  );

  const dock = el('div', { class: 'home-dock' },
    ['phone', 'messages', 'mail', 'camera'].map((id) => {
      const app = APPS.find((a) => a.id === id);
      return el('button', {
        class: 'dock-icon',
        onclick: () => (app.live ? onOpenApp(id) : onToast(app.label + ' — coming next phase')),
      }, app.icon);
    })
  );

  return el('div', { class: 'screen home-screen' }, [
    statusBar('6:47'),
    el('div', { class: 'home-header' }, [
      el('div', { class: 'home-date' }, 'WED · OCT 21'),
      el('div', { class: 'home-temp' }, '66°'),
      el('div', { class: 'home-cond' }, 'partly cloudy · wind 6 mph'),
    ]),
    el('div', { class: 'callout', style: 'margin:10px 20px 20px' }, [
      el('div', { class: 'callout-label' }, t('home.install_window_label')),
      el('div', { class: 'callout-body' }, t('home.install_window_open')),
    ]),
    grid,
    dock,
  ]);
}
