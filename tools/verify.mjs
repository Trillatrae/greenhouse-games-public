#!/usr/bin/env node
// Content validator. Runs on every commit touching src/data/.
// Fails loud. Fast. No dependencies.

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

let fails = 0;
let passes = 0;

function pass(msg) { passes++; console.log(`  ✓ ${msg}`); }
function fail(msg) { fails++; console.log(`  ✗ ${msg}`); }
function section(name) { console.log(`\n[${name}]`); }

// --- 1. Leads integrity ---
section('leads');
const leadsRaw = readFileSync(resolve(ROOT, 'src/data/leads.json'), 'utf8');
const leadsFile = JSON.parse(leadsRaw);

if (!Array.isArray(leadsFile.leads)) {
  fail('leads: missing leads[] array');
} else {
  pass(`leads: ${leadsFile.leads.length} entries`);
}

const seenIds = new Set();
const requiredFields = ['id', 'name', 'source', 'tags', 'state', 'channel'];

for (const lead of leadsFile.leads || []) {
  for (const field of requiredFields) {
    if (!(field in lead)) fail(`lead ${lead.id || '???'}: missing "${field}"`);
  }
  if (seenIds.has(lead.id)) fail(`lead ${lead.id}: duplicate id`);
  seenIds.add(lead.id);
  if (!Array.isArray(lead.thread) || lead.thread.length === 0) {
    fail(`lead ${lead.id}: thread must have ≥1 entry`);
  }
  if (!['new', 'contacted', 'scoped', 'quoted', 'signed', 'declined'].includes(lead.state)) {
    fail(`lead ${lead.id}: invalid state "${lead.state}"`);
  }
}
if (seenIds.size > 0) pass(`leads: ${seenIds.size} unique ids`);

// --- 1b. Messages integrity ---
section('messages');
const messagesFile = JSON.parse(readFileSync(resolve(ROOT, 'src/data/messages.json'), 'utf8'));
if (!Array.isArray(messagesFile.threads)) {
  fail('messages: missing threads[] array');
} else {
  pass(`messages: ${messagesFile.threads.length} thread(s)`);
}

for (const th of messagesFile.threads || []) {
  if (!th.id) fail('message thread: missing id');
  if (!Array.isArray(th.messages) || th.messages.length === 0) {
    fail(`thread ${th.id}: must have ≥1 message`);
  }
  for (const m of th.messages || []) {
    if (!m.id || !m.from || !m.body) {
      fail(`thread ${th.id}: message missing id/from/body`);
    }
    if (!['me', 'steph', 'trevor', 'trae'].includes(m.from)) {
      fail(`thread ${th.id}: unknown sender "${m.from}"`);
    }
  }
}

// --- 1c. Mail integrity ---
section('mail');
const mailFile = JSON.parse(readFileSync(resolve(ROOT, 'src/data/mail.json'), 'utf8'));
if (!Array.isArray(mailFile.emails)) {
  fail('mail: missing emails[] array');
} else {
  pass(`mail: ${mailFile.emails.length} email(s)`);
}
const mailIds = new Set();
for (const em of mailFile.emails || []) {
  if (!em.id || !em.fromName || !em.subject || !Array.isArray(em.body)) {
    fail(`mail ${em.id || '???'}: missing required field`);
  }
  if (mailIds.has(em.id)) fail(`mail ${em.id}: duplicate id`);
  mailIds.add(em.id);
  for (const c of em.scopingCues || []) {
    if (!['good', 'warn', 'neutral'].includes(c.tone)) {
      fail(`mail ${em.id}: cue has invalid tone "${c.tone}"`);
    }
  }
}

// --- 1d. Weather integrity ---
section('weather');
const weatherFile = JSON.parse(readFileSync(resolve(ROOT, 'src/data/weather.json'), 'utf8'));
if (!weatherFile.install_window || !Array.isArray(weatherFile.install_window.days)) {
  fail('weather: missing install_window.days[]');
} else if (weatherFile.install_window.days.length !== 7) {
  fail(`weather: install window must be 7 days, got ${weatherFile.install_window.days.length}`);
} else {
  pass('weather: 7-day install window present');
}
if (!Array.isArray(weatherFile.forecast) || weatherFile.forecast.length !== 7) {
  fail('weather: forecast must be 7 days');
} else {
  pass('weather: 7-day forecast present');
}
for (const d of (weatherFile.install_window?.days || [])) {
  if (!['open', 'marginal', 'killed', 'unknown'].includes(d.state)) {
    fail(`weather: invalid day state "${d.state}"`);
  }
}

// --- 1e. Routes + site visits ---
section('routes');
const routesFile = JSON.parse(readFileSync(resolve(ROOT, 'src/data/routes.json'), 'utf8'));
const routes = routesFile.routes || {};
const routeIds = Object.keys(routes);
if (routeIds.length === 0) fail('routes: no routes defined');
else pass(`routes: ${routeIds.length} route(s)`);
for (const [rid, r] of Object.entries(routes)) {
  if (!Array.isArray(r.segments)) fail(`route ${rid}: missing segments[]`);
  for (const ev of r.events || []) {
    if (!Array.isArray(ev.choices) || ev.choices.length !== 3) {
      fail(`route ${rid} event ${ev.id}: must have exactly 3 choices`);
    }
    for (const c of ev.choices || []) {
      if (!['good', 'warn', 'neutral', 'danger'].includes(c.tone)) {
        fail(`route ${rid} event ${ev.id} choice ${c.id}: invalid tone "${c.tone}"`);
      }
    }
  }
  for (const h of r.hazards || []) {
    if (typeof h.atPct !== 'number' || h.atPct < 0 || h.atPct > 100) {
      fail(`route ${rid} hazard: atPct must be 0–100`);
    }
    if (!['left', 'right'].includes(h.swerve)) {
      fail(`route ${rid} hazard: swerve must be "left" or "right"`);
    }
  }
}

section('site-visits');
const visitsFile = JSON.parse(readFileSync(resolve(ROOT, 'src/data/site-visits.json'), 'utf8'));
const visits = visitsFile.visits || {};
if (Object.keys(visits).length === 0) fail('site-visits: no visits defined');
else pass(`site-visits: ${Object.keys(visits).length} visit(s)`);
for (const [vid, v] of Object.entries(visits)) {
  if (!Array.isArray(v.scoping_cards) || v.scoping_cards.length < v.pickCount) {
    fail(`visit ${vid}: scoping_cards must be ≥ pickCount`);
  }
  for (const c of v.scoping_cards || []) {
    if (!c.id || !c.label || !c.reveal) {
      fail(`visit ${vid} card: missing id/label/reveal`);
    }
    if (!['good', 'warn', 'danger', 'neutral'].includes(c.reveal.tone)) {
      fail(`visit ${vid} card ${c.id}: invalid reveal tone "${c.reveal.tone}"`);
    }
  }
  // Walk-the-land hotspots must each unlock a real card
  if (v.walkTheLand) {
    const cardIds = new Set((v.scoping_cards || []).map((c) => c.id));
    for (const h of v.walkTheLand.hotspots || []) {
      if (!cardIds.has(h.unlocks)) {
        fail(`visit ${vid} hotspot ${h.id}: unlocks unknown card "${h.unlocks}"`);
      }
      if (typeof h.x !== 'number' || typeof h.y !== 'number') {
        fail(`visit ${vid} hotspot ${h.id}: missing x/y coords`);
      }
    }
    if (v.walkTheLand.hotspots.length < v.walkTheLand.requiredSpots) {
      fail(`visit ${vid}: not enough hotspots for requiredSpots`);
    }
  }
}

// --- 1f. Quotes + client replies + installs ---
section('quotes');
const quotesFile = JSON.parse(readFileSync(resolve(ROOT, 'src/data/quotes.json'), 'utf8'));
const qCount = Object.keys(quotesFile.templates || {}).length;
if (qCount === 0) fail('quotes: no templates'); else pass(`quotes: ${qCount} template(s)`);
for (const [qid, q] of Object.entries(quotesFile.templates || {})) {
  if (!(q.min < q.fair && q.fair < q.max)) fail(`quote ${qid}: fair must be between min and max`);
  if (!Array.isArray(q.flags)) fail(`quote ${qid}: missing flags[]`);
}

section('client-replies');
const repliesFile = JSON.parse(readFileSync(resolve(ROOT, 'src/data/client-replies.json'), 'utf8'));
const rCount = Object.keys(repliesFile.replies || {}).length;
if (rCount === 0) fail('replies: no entries'); else pass(`replies: ${rCount} entry(ies)`);
// All four Patel variants (fast, pushback, lowball-accept, ghost) must exist
for (const required of ['patel-fast-reply', 'patel-pushback', 'patel-lowball-accept', 'patel-ghost']) {
  if (!repliesFile.replies[required]) fail(`replies: missing variant "${required}"`);
  else pass(`replies: ${required} present`);
}
for (const [rid, r] of Object.entries(repliesFile.replies || {})) {
  if (!Array.isArray(r.choices) || r.choices.length !== 3) {
    fail(`reply ${rid}: must have exactly 3 choices`);
  }
}

section('installs');
const installsFile = JSON.parse(readFileSync(resolve(ROOT, 'src/data/install-days.json'), 'utf8'));
const iCount = Object.keys(installsFile.installs || {}).length;
if (iCount === 0) fail('installs: no entries'); else pass(`installs: ${iCount} entry(ies)`);
for (const [iid, i] of Object.entries(installsFile.installs || {})) {
  if (!Array.isArray(i.pack_list)) fail(`install ${iid}: missing pack_list[]`);
  if (!Array.isArray(i.stages) || i.stages.length < 2) fail(`install ${iid}: need ≥ 2 stages`);
  if (!i.setback || !Array.isArray(i.setback.choices) || i.setback.choices.length !== 3) {
    fail(`install ${iid}: setback needs 3 choices`);
  }
  if (!i.walkthrough || !Array.isArray(i.walkthrough.choices) || i.walkthrough.choices.length !== 3) {
    fail(`install ${iid}: walkthrough needs 3 choices`);
  }
}

// --- 2. i18n keys referenced by leads must exist in en.json ---
section('i18n');
const en = JSON.parse(readFileSync(resolve(ROOT, 'src/i18n/en.json'), 'utf8'));

function hasKey(obj, dotted) {
  const parts = dotted.split('.');
  let v = obj;
  for (const p of parts) {
    if (v == null || typeof v !== 'object') return false;
    v = v[p];
  }
  return typeof v === 'string';
}

const i18nRefs = [];
JSON.stringify(leadsFile, (k, v) => {
  if (typeof v === 'string' && k.endsWith('Key')) i18nRefs.push(v);
  return v;
});

let missingKeys = 0;
for (const key of i18nRefs) {
  if (!hasKey(en, key)) {
    fail(`i18n: missing key "${key}" referenced by leads.json`);
    missingKeys++;
  }
}
if (missingKeys === 0) pass(`i18n: all ${i18nRefs.length} referenced keys exist in en.json`);

// --- 3. Trade-data regex (public safety) ---
section('public-safety');
const forbidden = [
  /FRAMEPARTS/i,
  /GASKETS/i,
  /\bCUTS\b/,
  /\bSITES\b/,
  /crescent\s+\d/i,
  /butterfly\s+\d/i,
  /royal\s+victorian\s+VI\s*\d/i,
];
const combined = JSON.stringify(leadsFile) + JSON.stringify(en);
let forbiddenHits = 0;
for (const rx of forbidden) {
  if (rx.test(combined)) {
    fail(`public-safety: forbidden token matched /${rx.source}/`);
    forbiddenHits++;
  }
}
if (forbiddenHits === 0) pass('public-safety: no trade-data tokens found');

// --- 4. Required UI strings exist ---
section('ui-strings');
const requiredStrings = [
  'app.name',
  'phone.title',
  'phone.recents',
  'phone.unlocked_title',
  'phone.voicemail_hint',
  'lock.tap_first',
  'lock.day_hint',
  'home.install_window_label',
];
let missingUi = 0;
for (const key of requiredStrings) {
  if (!hasKey(en, key)) {
    fail(`ui-strings: missing required key "${key}"`);
    missingUi++;
  }
}
if (missingUi === 0) pass(`ui-strings: all ${requiredStrings.length} required keys present`);

// --- summary ---
console.log(`\n${passes} passed · ${fails} failed`);
process.exit(fails === 0 ? 0 : 1);
