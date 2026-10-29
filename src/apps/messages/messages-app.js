// Messages app — threaded iMessage-style.
// Phase 2: inbox + Steph thread with the instinct callout.

import { el, statusBar } from '../../ui/components.js';
import { t } from '../../i18n/t.js';
import messagesData from '../../data/messages.json';

export function messagesInbox({ onOpenThread, onBack }) {
  const threads = messagesData.threads;

  return el('div', { class: 'screen messages-app' }, [
    statusBar('6:50'),
    el('div', { class: 'back-row', onclick: onBack }, [
      el('span', {}, '‹ Home'),
    ]),
    el('div', { class: 'screen-title-row' }, [
      el('div', { class: 'screen-eyebrow' }, t('messages.title')),
      el('div', { class: 'screen-title' }, t('messages.title')),
    ]),
    el('div', { class: 'thread-list' },
      threads.map((th) => threadRow(th, onOpenThread))
    ),
  ]);
}

function threadRow(thread, onOpenThread) {
  const last = thread.messages[thread.messages.length - 1];
  const initial = thread.contactName.charAt(0).toUpperCase();

  return el('div', {
    class: 'thread-row',
    onclick: () => onOpenThread(thread.id),
  }, [
    el('div', { class: 'thread-avatar' }, initial),
    el('div', { class: 'thread-body' }, [
      el('div', { class: 'thread-head' }, [
        el('span', { class: 'thread-name' }, thread.contactName),
        thread.unreadCount > 0 && el('span', { class: 'thread-badge' }, String(thread.unreadCount)),
      ]),
      el('div', { class: 'thread-preview' }, last.body),
    ]),
  ]);
}

export function messagesThread({ threadId, onBack }) {
  const thread = messagesData.threads.find((t) => t.id === threadId);
  if (!thread) throw new Error('messages thread not found: ' + threadId);

  const initial = thread.contactName.charAt(0).toUpperCase();
  const presence = thread.online ? t('messages.online') : t('messages.offline');

  // Group messages: insert date labels when present on a message.
  const bubbles = [];
  for (const m of thread.messages) {
    if (m.dateLabel) bubbles.push(el('div', { class: 'date-stamp' }, m.dateLabel));
    bubbles.push(bubble(m));
    if (m.flag === 'instinct') bubbles.push(instinctCallout(thread));
  }

  return el('div', { class: 'screen thread-screen' }, [
    statusBar('6:51'),
    el('div', { class: 'back-row', onclick: onBack }, [
      el('span', {}, '‹ ' + t('messages.title')),
    ]),
    el('div', { class: 'thread-header' }, [
      el('div', { class: 'thread-header-avatar' }, initial),
      el('div', { class: 'thread-header-info' }, [
        el('div', { class: 'thread-header-name' }, thread.contactName),
        el('div', { class: 'thread-header-presence ' + (thread.online ? 'presence-online' : '') },
          (thread.online ? '● ' : '○ ') + presence),
      ]),
      el('div', { class: 'thread-header-phone' }, '📞'),
    ]),
    el('div', { class: 'bubble-list' }, bubbles),
    el('div', { class: 'compose-row' }, [
      el('div', { class: 'compose-plus' }, '＋'),
      el('div', { class: 'compose-input' }, t('messages.input_placeholder')),
      el('div', { class: 'compose-mic' }, '🎤'),
    ]),
  ]);
}

function bubble(m) {
  const mine = m.from === 'me';
  return el('div', { class: 'bubble ' + (mine ? 'bubble-me' : 'bubble-them') }, m.body);
}

function instinctCallout(thread) {
  return el('div', { class: 'callout callout-inline-instinct' }, [
    el('div', { class: 'callout-label' },
      '✦ ' + t('messages.instinct_label', { n: thread.instinctLevel })
    ),
    el('div', { class: 'callout-body' },
      t('messages.instinct_body', { track: thread.instinctTrack })
    ),
  ]);
}
