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
