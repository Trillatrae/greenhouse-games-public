// Shared UI primitives. Pure DOM, no framework.
// Every string that reaches the DOM goes through t().

import { t } from '../i18n/t.js';

/** Create an element with props and children. */
export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') node.className = v;
    else if (k === 'style') node.style.cssText = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') {
      node.addEventListener(k.slice(2).toLowerCase(), v);
    } else if (k === 'dataset') {
      Object.assign(node.dataset, v);
    } else {
      node.setAttribute(k, v);
    }
  }
  for (const c of [].concat(children)) {
    // Skip falsy children so `cond && el(...)` doesn't render "false" / "0" / etc.
    if (c == null || c === false || c === true) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}

/** Phone status bar — the HBG leaf accent lives here. */
export function statusBar(timeText) {
  return el('div', { class: 'status-bar' }, [
    el('span', { class: 'status-left' }, [
      leafIcon(),
      el('span', { class: 'status-time' }, timeText),
    ]),
    el('span', { class: 'status-right' }, [
      el('span', { class: 'status-icon', title: t('status_bar.signal') }, '4G'),
      el('span', { class: 'status-icon' }, '•'),
      el('span', { class: 'status-icon' }, '◼'),
    ]),
  ]);
}

/** The HBGreenhouses leaf — tiny system signature. */
export function leafIcon() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('width', '12');
  svg.setAttribute('height', '12');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('leaf');
  svg.innerHTML = `
    <path d="M2 11 Q 2 4 9 2 Q 14 1 14 5 Q 14 12 7 13 Q 3 13 2 11 Z"
          fill="#4ade80" opacity="0.95"/>
    <path d="M3 11 Q 6 8 10 5" stroke="#22863a" stroke-width="0.6"
          fill="none" opacity="0.8"/>
  `;
  return svg;
}

/** The OS fingerprint — accent-green left-bar callout. */
export function callout({ label, body, variant = 'accent' }) {
  return el('div', { class: `callout callout-${variant}` }, [
    label && el('div', { class: 'callout-label' }, label),
    el('div', { class: 'callout-body' }, body),
  ]);
}

/** Phone frame — wraps a screen in the device chrome. */
export function phoneFrame(screen) {
  return el('div', { class: 'phone-outer' }, [
    el('div', { class: 'phone-inner' }, [
      el('div', { class: 'phone-notch' }),
      screen,
      el('div', { class: 'phone-home-indicator' }),
    ]),
  ]);
}
