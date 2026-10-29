// Mail app — inbox + email detail.
// Phase 2: the Patel referral is the primary "quality buyer" moment.
// Scoping cues callout is the OS fingerprint here.

import { el, statusBar } from '../../ui/components.js';
import { t } from '../../i18n/t.js';
import mailData from '../../data/mail.json';

export function mailInbox({ onOpenEmail, onBack }) {
  const emails = mailData.emails;

  return el('div', { class: 'screen mail-app' }, [
    statusBar('6:54'),
    el('div', { class: 'back-row', onclick: onBack }, [
      el('span', {}, '‹ Home'),
    ]),
    el('div', { class: 'screen-title-row' }, [
      el('div', { class: 'screen-eyebrow' }, t('mail.title')),
      el('div', { class: 'screen-title' }, t('mail.inbox')),
      el('div', { class: 'mail-search' }, [
        el('span', { class: 'mail-search-icon' }, '🔍'),
        el('span', { class: 'mail-search-placeholder' }, t('mail.search_placeholder')),
      ]),
    ]),
    el('div', { class: 'mail-list' },
      emails.map((e) => emailRow(e, onOpenEmail))
    ),
  ]);
}

function emailRow(email, onOpenEmail) {
  const classes = ['mail-row'];
  if (!email.unread) classes.push('mail-row-read');
  if (email.flagColor === 'accent') classes.push('mail-row-accent');

  return el('div', {
    class: classes.join(' '),
    onclick: () => onOpenEmail(email.id),
  }, [
    el('div', { class: 'mail-row-head' }, [
      el('span', { class: 'mail-row-dot ' + (email.unread ? 'mail-row-dot-unread' : '') }),
      el('span', { class: 'mail-row-from' }, email.fromName),
      el('span', { class: 'mail-row-time' }, email.receivedLabel),
    ]),
    el('div', { class: 'mail-row-subject' }, email.subject),
    el('div', { class: 'mail-row-preview' }, email.preview),
    email.tags.length > 0 && el('div', { class: 'mail-row-tags' },
      email.tags.map((tag) => tagChip(tag, email.flagColor))
    ),
  ]);
}

function tagChip(label, flagColor) {
  const colorClass =
    flagColor === 'accent' ? 'tag-accent' :
    flagColor === 'warn' ? 'tag-warn' :
    flagColor === 'unusual' ? 'tag-unusual' :
    'tag-neutral';
  return el('span', { class: 'tag-chip ' + colorClass }, label);
}

export function mailDetail({ emailId, onBack, onCta, onReply, onToast }) {
  const email = mailData.emails.find((e) => e.id === emailId);
  if (!email) throw new Error('mail detail not found: ' + emailId);

  const bodyParagraphs = email.body.map((para) =>
    el('p', { class: 'mail-paragraph' }, para)
  );

  return el('div', { class: 'screen mail-detail' }, [
    statusBar('6:55'),
    el('div', { class: 'mail-detail-nav' }, [
      el('div', { class: 'back-row-inline', onclick: onBack }, '‹ ' + t('mail.inbox')),
      el('div', { class: 'mail-detail-icons' }, [
        el('span', { class: 'mail-icon', onclick: () => onToast('Archived (demo)') }, '🗄'),
        el('span', { class: 'mail-icon', onclick: () => onToast('Trash (demo)') }, '🗑'),
      ]),
    ]),
    el('div', { class: 'mail-detail-header' }, [
      el('div', { class: 'mail-detail-subject' }, email.subject),
      el('div', { class: 'mail-detail-sender' }, [
        el('div', { class: 'mail-detail-avatar' }, email.initials),
        el('div', { class: 'mail-detail-from' }, [
          el('div', { class: 'mail-detail-from-name' }, [
            el('span', {}, email.fromName + ' '),
            el('span', { class: 'mail-detail-from-email' }, '<' + email.fromEmail + '>'),
          ]),
          el('div', { class: 'mail-detail-from-meta' },
            email.receivedLabel + (email.city ? ' · ' + email.city : '')
          ),
        ]),
      ]),
      email.tags.length > 0 && el('div', { class: 'mail-detail-tags' },
        email.tags.map((tag) => tagChip(tag, email.flagColor))
      ),
    ]),
    el('div', { class: 'mail-detail-body' }, [
      ...bodyParagraphs,
      email.scopingCues.length > 0 && scopingCuesCallout(email.scopingCues),
    ]),
    email.ctaLabel && el('div', { class: 'mail-detail-footer' }, [
      el('div', {
        class: 'phone-cta phone-cta-flat',
        onclick: () => onCta(email.id),
      }, email.ctaLabel),
      el('div', {
        class: 'mail-reply-arrow',
        onclick: () => onReply(email.id),
      }, '↩'),
    ]),
  ]);
}

function scopingCuesCallout(cues) {
  return el('div', { class: 'callout', style: 'margin-top:16px' }, [
    el('div', { class: 'callout-label' }, '✦ ' + t('mail.scoping_cues')),
    el('div', { class: 'callout-body' },
      cues.map((c) =>
        el('div', { class: 'cue-row' }, [
          '• ',
          el('span', { class: cueClass(c.tone) }, c.text),
        ])
      )
    ),
  ]);
}

function cueClass(tone) {
  if (tone === 'good') return 'cue-good';
  if (tone === 'warn') return 'cue-warn';
  return 'cue-neutral';
}
