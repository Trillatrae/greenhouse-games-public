// Lock screen — first thing the player sees every day.
// Day 1 highlights the Jefferson voicemail as the tap-first.

import { el, statusBar } from '../ui/components.js';
import { t } from '../i18n/t.js';

export function lockScreen({ onUnlock }) {
  const notifications = [
    {
      kind: 'voicemail',
      labelKey: 'callers.jefferson.location',
      time: '5:42 AM',
      icon: '📞',
      title: 'Missed call · Jefferson, GA',
      body: `Voicemail (0:34) · "${t('callers.jefferson.preview').slice(0, 60)}..."`,
      highlight: true,
    },
    {
      kind: 'message',
      time: '6:12 AM',
      icon: '💬',
      title: 'Steph (office)',
      body: "treehouse lady called back. she's serious this time. wants a quote by friday 🌳",
      highlight: false,
    },
    {
      kind: 'missed',
      time: '6:38 AM',
      icon: '📞',
      title: '(770) 555-0144',
      body: 'no voicemail · 3rd call this week',
      highlight: false,
    },
  ];

  const notifEls = notifications.map((n) =>
    el('div', {
      class: `notification ${n.highlight ? 'notification-highlight' : ''}`,
      onclick: n.highlight ? () => onUnlock(n.kind) : null,
    }, [
      n.highlight && el('div', { class: 'notification-chip' }, t('lock.tap_first')),
      el('div', { class: 'notification-head' }, [
        el('span', { class: 'notification-title' }, n.title),
        el('span', { class: 'notification-time' }, n.time),
      ]),
      el('div', { class: 'notification-body' }, n.body),
    ])
  );

  return el('div', { class: 'screen lock-screen' }, [
    statusBar('6:47'),
    el('div', { class: 'lock-time-block' }, [
      el('div', { class: 'lock-date' }, 'Wednesday, October 21'),
      el('div', { class: 'lock-clock' }, '6:47'),
      el('div', { class: 'lock-day-label' }, t('app.day_label', { n: 1 })),
    ]),
    el('div', { class: 'notifications' }, notifEls),
    el('div', { class: 'lock-hints' }, [
      el('div', { class: 'lock-swipe-pill' }, [
        '👆 ',
        t('lock.tap_first'),
      ]),
      el('div', { class: 'lock-fine' }, t('lock.day_hint')),
    ]),
  ]);
}
