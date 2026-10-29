// Client reply — Patel's response to the sent quote.
// Fast-reply tag, deal-signal callout, 3-choice response.

import { el, statusBar } from '../../ui/components.js';
import { t } from '../../i18n/t.js';
import repliesData from '../../data/client-replies.json';

export function clientReply({ replyId, onRespond, onBack }) {
  const reply = repliesData.replies[replyId];
  if (!reply) throw new Error('reply not found: ' + replyId);

  const bodyParagraphs = reply.body.map((para) =>
    el('p', { class: 'mail-paragraph' }, para)
  );

  return el('div', { class: 'screen client-reply' }, [
    statusBar('8:14'),
    el('div', { class: 'back-row', onclick: onBack }, [
      el('span', {}, '‹ Inbox'),
    ]),
    el('div', { class: 'reply-header' }, [
      el('div', { class: 'reply-subject' }, reply.subject),
      el('div', { class: 'reply-from-row' }, [
        el('div', { class: 'mail-detail-avatar' }, reply.fromInitials),
        el('div', { class: 'reply-from-info' }, [
          el('div', { class: 'reply-from-name' }, reply.fromClient),
          el('div', { class: 'reply-from-meta' }, reply.receivedLabel),
        ]),
        reply.fastReply && el('span', { class: 'tag-chip tag-accent' }, t('client_reply.fast_reply_tag')),
      ]),
    ]),
    el('div', { class: 'reply-body' }, [
      ...bodyParagraphs,
      el('div', { class: 'callout', style: 'margin-top: 10px' }, [
        el('div', { class: 'callout-label' }, '🏆 ' + t('client_reply.deal_signal_label')),
        el('div', { class: 'callout-body' },
          reply.deal_signal.map((s) =>
            el('div', { class: 'deal-signal-row' }, [
              '• ',
              el('span', { class: 'deal-signal-tone-' + s.tone }, s.text),
            ])
          )
        ),
      ]),
    ]),
    el('div', { class: 'reply-choices' },
      reply.choices.map((c) =>
        el('div', {
          class: 'reply-choice reply-choice-' + c.tone,
          onclick: () => onRespond(replyId, c.id),
        }, [
          el('div', { class: 'reply-choice-label' }, c.label + ' ›'),
          el('div', { class: 'reply-choice-sub' }, c.sub),
        ])
      )
    ),
  ]);
}
