// Quote write-up scene — price slider + honesty flags + close read.
// This is where the player's judgment gets its first real test.

import { el, statusBar } from '../../ui/components.js';
import { t } from '../../i18n/t.js';
import quotesData from '../../data/quotes.json';

export function quoteScene({ templateId, onSend, onBack, onToast }) {
  const quote = quotesData.templates[templateId];
  if (!quote) throw new Error('quote template not found: ' + templateId);

  // Mutable state for this screen
  let price = quote.fair;
  const flagsOn = new Set(quote.flags.filter((f) => f.defaultOn).map((f) => f.id));

  // Refs
  const refs = {};
  refs.priceLabel = el('span', { class: 'price-value' }, formatPrice(price));
  refs.tensionMarker = el('div', { class: 'tension-marker' });
  refs.tensionLabel = el('div', { class: 'tension-marker-label' }, 'you');
  refs.closeReadBody = el('div', { class: 'callout-body' });
  refs.flagRows = {};

  function updatePriceUi() {
    refs.priceLabel.textContent = formatPrice(price);
    const pctAcross = Math.max(0, Math.min(100,
      ((price - quote.min) / (quote.max - quote.min)) * 100
    ));
    refs.tensionMarker.style.left = `${pctAcross}%`;
    refs.tensionLabel.style.left = `${pctAcross}%`;
    refs.closeReadBody.replaceChildren(renderCloseRead(price, quote, flagsOn));
  }

  function flagRow(flag) {
    const rowEl = el('div', { class: 'flag-row' + (flagsOn.has(flag.id) ? ' flag-on' : '') }, [
      el('div', { class: 'flag-body' }, [
        el('div', { class: 'flag-label' }, flag.label),
        el('div', { class: 'flag-sub' }, flag.sub),
      ]),
      el('div', { class: 'flag-toggle' }, [
        el('div', { class: 'flag-thumb' }),
      ]),
    ]);
    rowEl.addEventListener('click', () => {
      if (flagsOn.has(flag.id)) flagsOn.delete(flag.id);
      else flagsOn.add(flag.id);
      rowEl.classList.toggle('flag-on', flagsOn.has(flag.id));
      updatePriceUi();
    });
    refs.flagRows[flag.id] = rowEl;
    return rowEl;
  }

  const screen = el('div', { class: 'screen quote-scene' }, [
    statusBar('2:17'),
    el('div', { class: 'quote-head' }, [
      el('div', { class: 'screen-eyebrow quote-eyebrow' },
        '📝 ' + t('quote.eyebrow', { client: 'Patel' })),
      el('div', { class: 'quote-title' }, t('quote.title')),
    ]),
    el('div', { class: 'quote-body' }, [
      el('div', { class: 'scope-summary' }, [
        el('div', { class: 'scope-summary-label' }, t('quote.scope_summary_label')),
        el('div', { class: 'scope-summary-body' }, quote.scopeSummary),
      ]),
      el('div', { class: 'price-card' }, [
        el('div', { class: 'price-card-head' }, [
          el('span', { class: 'price-card-label' }, t('quote.your_price_label')),
          el('span', { class: 'price-card-market' },
            t('quote.market_label', { lo: quote.marketLo / 1000, hi: quote.marketHi / 1000 })),
        ]),
        el('div', { class: 'price-value-row' }, refs.priceLabel),
        el('div', { class: 'tension-bar-wrap' }, [
          el('div', { class: 'tension-bar' }),
          refs.tensionMarker,
          refs.tensionLabel,
        ]),
        el('div', { class: 'tension-ends' }, [
          el('span', {}, t('quote.tension_lowball')),
          el('span', {}, t('quote.tension_fair')),
          el('span', {}, t('quote.tension_greedy')),
        ]),
        el('div', { class: 'price-adjust-row' }, [
          adjustPill('−$1k', -1000),
          adjustPill('+$1k', 1000),
          adjustPill('+$5k', 5000),
        ]),
      ]),
      el('div', { class: 'honesty-flags' }, [
        el('div', { class: 'honesty-flags-label' }, t('quote.honesty_flags_label')),
        ...quote.flags.map((f) => flagRow(f)),
      ]),
      el('div', { class: 'callout', style: 'margin-top: 10px' }, [
        el('div', { class: 'callout-label' }, '✦ ' + t('quote.close_read_label')),
        refs.closeReadBody,
      ]),
    ]),
    el('div', { class: 'quote-footer' }, [
      el('div', { class: 'quote-save', onclick: () => onToast('Draft saved (demo)') }, t('quote.save_draft')),
      el('div', {
        class: 'phone-cta phone-cta-flat quote-send',
        onclick: () => onSend(templateId, { price, flags: Array.from(flagsOn) }),
      }, '✉ ' + t('quote.send_quote')),
    ]),
  ]);

  function adjustPill(label, delta) {
    return el('div', {
      class: 'adjust-pill',
      onclick: () => {
        price = Math.max(quote.min, Math.min(quote.max, price + delta));
        updatePriceUi();
      },
    }, label);
  }

  // Prime UI
  queueMicrotask(updatePriceUi);

  return screen;
}

function formatPrice(n) {
  return '$' + Math.round(n).toLocaleString('en-US');
}

function renderCloseRead(price, quote, flagsOn) {
  // Simple heuristic: starts at a base, bump up for honesty flags,
  // down for lowball/greedy pricing. Numbers are placeholders tuned
  // to feel honest for Patel's quality-buyer profile.
  const permitFlag = flagsOn.has('permit-flag');
  const noteMissing = flagsOn.has('note-missing');
  const attachRef = flagsOn.has('attach-reference');

  let close = 55;
  if (permitFlag) close += 20;
  if (noteMissing) close += 5;
  if (attachRef) close += 7;

  // Price deviation from fair
  const dev = (price - quote.fair) / quote.fair;
  if (dev > 0.1) close -= 15;
  if (dev > 0.25) close -= 20;
  if (dev < -0.1) close += 5; // underpricing bumps close a bit but hurts bank

  close = Math.max(5, Math.min(96, Math.round(close)));

  return document.createTextNode(
    t('quote.close_read_body', {
      price: Math.round(price).toLocaleString('en-US'),
      close,
    })
  );
}
