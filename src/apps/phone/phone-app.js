// Phone app — Recents + voicemail detail.
// Jefferson voicemail is the first storyline the player encounters.

import { el, statusBar } from '../../ui/components.js';
import { t } from '../../i18n/t.js';
import leadsData from '../../data/leads.json';

export function phoneRecents({ onOpenVoicemail, onBack, seenVoicemails = [] }) {
  const leads = leadsData.leads;
  const jefferson = leads.find((l) => l.id === 'jefferson-repair-01');
  const repeat = leads.find((l) => l.id === 'repeat-caller-770');
  const spam = leads.find((l) => l.id === 'spam-warranty-01');

  const jeffersonSeen = seenVoicemails.includes(jefferson.id);

  return el('div', { class: 'screen phone-app' }, [
    statusBar('6:48'),
    el('div', { class: 'back-row', onclick: onBack }, [
      el('span', {}, '‹ Home'),
    ]),
    el('div', { class: 'screen-title-row' }, [
      el('div', { class: 'screen-eyebrow' }, t('phone.title')),
      el('div', { class: 'screen-title' }, t('phone.recents')),
      el('div', { class: 'spam-filter-chip' }, [
        el('span', { class: 'spam-filter-label' }, '🛡 ' + t('phone.spam_filter')),
        el('span', { class: 'spam-filter-desc' }, t('phone.spam_filter_desc')),
      ]),
    ]),
    el('div', { class: 'recents-list' }, [
      // Repeat caller — red flag
      el('div', { class: 'recent-row recent-flag' }, [
        el('div', { class: 'recent-avatar recent-avatar-danger' }, '!'),
        el('div', { class: 'recent-body' }, [
          el('div', { class: 'recent-head' }, [
            el('span', { class: 'recent-name recent-name-danger' }, repeat.name),
            el('span', { class: 'recent-time' }, '6:38 AM'),
          ]),
          el('div', { class: 'recent-meta' }, repeat.city + ' · 3rd call this week'),
        ]),
      ]),
      // Jefferson — primary tap target
      el('div', {
        class: 'recent-row recent-tappable',
        onclick: () => onOpenVoicemail(jefferson.id),
      }, [
        el('div', { class: 'recent-avatar recent-avatar-green' }, '📞'),
        el('div', { class: 'recent-body' }, [
          el('div', { class: 'recent-head' }, [
            el('span', { class: 'recent-name' }, t('callers.jefferson.name')),
            el('span', { class: 'recent-time' }, '5:42 AM'),
          ]),
          el('div', { class: 'recent-meta' }, t('callers.jefferson.location') + ' · voicemail (0:34)'),
          el('div', { class: 'voicemail-preview' }, [
            el('span', { class: 'play-dot' }, '▶ '),
            '"' + t('callers.jefferson.preview') + '"',
          ]),
          !jeffersonSeen && el('div', { class: 'voicemail-hint' }, '→ ' + t('phone.voicemail_hint')),
        ]),
      ]),
      // Spam — demoted
      el('div', { class: 'recent-row recent-dim' }, [
        el('div', { class: 'recent-avatar recent-avatar-dim' }, '🚫'),
        el('div', { class: 'recent-body' }, [
          el('div', { class: 'recent-dim-label' }, t('phone.blocked_by_spam')),
          el('div', { class: 'recent-meta' }, '(888) 555-0100 · auto home warranty'),
        ]),
      ]),
    ]),
  ]);
}

export function voicemailDetail({ leadId, onBack, onCallBack, onSave, onBlock }) {
  const lead = leadsData.leads.find((l) => l.id === leadId);
  if (!lead) throw new Error('voicemail detail: lead not found ' + leadId);

  const vm = lead.thread.find((t) => t.kind === 'voicemail');
  const reveals = vm?.reveals || {};

  return el('div', { class: 'screen voicemail-detail' }, [
    statusBar('6:49'),
    el('div', { class: 'back-row', onclick: onBack }, [
      el('span', {}, '‹ ' + t('phone.recents')),
    ]),
    el('div', { class: 'voicemail-header' }, [
      el('div', { class: 'voicemail-avatar' }, '📞'),
      el('div', { class: 'voicemail-caller' }, t('callers.jefferson.name')),
      el('div', { class: 'voicemail-meta' }, t('callers.jefferson.location') + ' · 5:42 AM'),
      el('div', { class: 'voicemail-actions' }, [
        actionButton('call_back', '📞', onCallBack),
        actionButton('save', '+', onSave),
        actionButton('block', '🚫', onBlock),
      ]),
    ]),
    el('div', { class: 'voicemail-body' }, [
      el('div', { class: 'voicemail-section-head' }, [
        el('span', {}, t('phone.voicemail')),
        el('span', { class: 'voicemail-duration' }, '0:34'),
      ]),
      el('div', { class: 'voicemail-player' }, [
        el('div', { class: 'play-button' }, '▶'),
        waveform(),
      ]),
      el('div', { class: 'voicemail-transcript' },
        '"' + t('callers.jefferson.full') + '"'
      ),
      el('div', { class: 'callout', style: 'margin-top:12px' }, [
        el('div', { class: 'callout-label' }, '✦ ' + t('phone.unlocked_title')),
        el('div', { class: 'callout-body' }, [
          el('div', {}, '• Location: ' + bold(reveals.location)),
          el('div', {}, '• Urgency: ' + reveals.urgency),
          el('div', {}, '• Likely scope: ' + reveals.scope),
        ]),
      ]),
    ]),
  ]);
}

function actionButton(labelKey, glyph, onClick) {
  return el('div', { class: 'action-stack', onclick: onClick }, [
    el('div', { class: 'action-circle' }, glyph),
    el('span', { class: 'action-label' }, t(`phone.actions.${labelKey}`)),
  ]);
}

function bold(text) {
  const span = el('span', { style: 'color:#4ade80' }, text || '');
  return span;
}

function waveform() {
  const heights = [6, 12, 16, 10, 14, 8, 18, 12, 6, 14, 10, 16, 8, 12, 6];
  return el('div', { class: 'waveform' },
    heights.map((h, i) =>
      el('div', {
        class: 'wave-bar ' + (i < 8 ? 'wave-played' : ''),
        style: `height:${h}px`,
      })
    )
  );
}
