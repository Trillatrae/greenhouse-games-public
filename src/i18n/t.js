// Minimal i18n harness. Day-1 cost: discipline.
// Day-100 retrofit cost: weeks of boring work. Non-negotiable.

import en from './en.json';

const locales = { en };
let active = 'en';

/**
 * Translate a dotted key. Example: t('phone.actions.call_back').
 * If a key is missing, returns the key itself (loud fail — easy to spot).
 * Variables: t('app.day_label', { n: 1 }) replaces {n} in the string.
 */
export function t(key, vars) {
  const parts = key.split('.');
  let v = locales[active];
  for (const p of parts) {
    if (v == null) return key;
    v = v[p];
  }
  if (typeof v !== 'string') return key;
  if (!vars) return v;
  return v.replace(/\{(\w+)\}/g, (_, name) =>
    name in vars ? String(vars[name]) : `{${name}}`
  );
}

export function setLocale(name) {
  if (locales[name]) active = name;
}
