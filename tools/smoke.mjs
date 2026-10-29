#!/usr/bin/env node
// Smoke test. Loads the built bundle in a mock DOM, drives through
// lock → home → phone → voicemail, asserts the right things render.
// No puppeteer yet (Phase 1); we use a tiny jsdom-free check against source.

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

let fails = 0;
let passes = 0;

function pass(msg) { passes++; console.log(`  ✓ ${msg}`); }
function fail(msg) { fails++; console.log(`  ✗ ${msg}`); }
function section(name) { console.log(`\n[${name}]`); }

function readSrc(path) {
  return readFileSync(resolve(ROOT, path), 'utf8');
}

// --- 1. All referenced source files exist ---
section('files');
const required = [
  'index.html',
  'package.json',
  'vite.config.js',
  'src/main.js',
  'src/i18n/t.js',
  'src/i18n/en.json',
  'src/state/save.js',
  'src/ui/components.js',
  'src/ui/tokens.css',
  'src/ui/phone.css',
  'src/ui/screens.css',
  'src/phone/lock-screen.js',
  'src/phone/home-screen.js',
  'src/apps/phone/phone-app.js',
  'src/apps/messages/messages-app.js',
  'src/apps/mail/mail-app.js',
  'src/apps/weather/weather-app.js',
  'src/apps/maps/maps-app.js',
  'src/scenes/drive/drive-scene.js',
  'src/scenes/site-visit/site-visit.js',
  'src/scenes/quote/quote-scene.js',
  'src/scenes/client-reply/client-reply.js',
  'src/scenes/install/install-scenes.js',
  'src/data/leads.json',
  'src/data/messages.json',
  'src/data/mail.json',
  'src/data/weather.json',
  'src/data/routes.json',
  'src/data/site-visits.json',
  'src/data/quotes.json',
  'src/data/client-replies.json',
  'src/data/install-days.json',
];
for (const f of required) {
  if (existsSync(resolve(ROOT, f))) pass(f);
  else fail('missing: ' + f);
}

// --- 2. Entry point wires the slice ---
section('wiring');
const main = readSrc('src/main.js');
for (const needle of [
  'lockScreen',
  'homeScreen',
  'phoneRecents',
  'voicemailDetail',
  'messagesInbox',
  'messagesThread',
  'mailInbox',
  'mailDetail',
  'weatherApp',
  'mapsApp',
  'driveScene',
  'siteVisitScoping',
  'siteRead',
  'quoteScene',
  'clientReply',
  'installLoadOut',
  'installOnSite',
  'installWalkThrough',
  "case 'lock'",
  "case 'home'",
  "case 'phone'",
  "case 'voicemail'",
  "case 'messages'",
  "case 'thread'",
  "case 'mail'",
  "case 'email'",
  "case 'weather'",
  "case 'maps'",
  "case 'drive'",
  "case 'site-visit'",
  "case 'site-read'",
  "case 'quote'",
  "case 'client-reply'",
  "case 'install-loadout'",
  "case 'install-site'",
  "case 'install-walkthrough'",
]) {
  if (main.includes(needle)) pass(`main.js wires ${needle}`);
  else fail(`main.js missing ${needle}`);
}

// --- 3. Save state is wrapped in try/catch (Rule 1) ---
section('save-state');
const save = readSrc('src/state/save.js');
const tryCount = (save.match(/try\s*{/g) || []).length;
const catchCount = (save.match(/catch\b/g) || []).length;
if (tryCount >= 3 && catchCount >= 3) {
  pass(`save.js has ${tryCount} try/catch pairs`);
} else {
  fail(`save.js: only ${tryCount} try blocks, ${catchCount} catch — Rule 1 requires wrapped storage`);
}
if (save.includes('schemaVersion')) pass('save.js: schema is versioned');
else fail('save.js: missing schemaVersion');

// --- 4. No hard-coded English in screen components (spot check) ---
section('i18n-discipline');
const screens = [
  'src/phone/lock-screen.js',
  'src/phone/home-screen.js',
  'src/apps/phone/phone-app.js',
  'src/apps/messages/messages-app.js',
  'src/apps/mail/mail-app.js',
  'src/apps/weather/weather-app.js',
  'src/apps/maps/maps-app.js',
  'src/scenes/drive/drive-scene.js',
  'src/scenes/site-visit/site-visit.js',
  'src/scenes/quote/quote-scene.js',
  'src/scenes/client-reply/client-reply.js',
  'src/scenes/install/install-scenes.js',
];
let hardCoded = 0;
for (const path of screens) {
  const src = readSrc(path);
  if (!src.includes("import { t }") && !src.includes("from '../i18n/t.js'") && !src.includes("from '../../i18n/t.js'")) {
    fail(`${path}: does not import t()`);
    hardCoded++;
  }
}
if (hardCoded === 0) pass('all screens import t()');

// --- 5. Brand tokens exist ---
section('brand');
const tokens = readSrc('src/ui/tokens.css');
for (const [name, value] of [
  ['--hb-green', '#22863a'],
  ['--accent-green', '#4ade80'],
  ['--dark', '#0a0a0a'],
  ['--light-bg', '#f5f5f0'],
]) {
  if (tokens.includes(`${name}: ${value}`)) pass(`${name} = ${value}`);
  else fail(`${name} missing or wrong value`);
}

// --- 6. Jefferson lead is the primary slice ---
section('slice-content');
const leads = JSON.parse(readSrc('src/data/leads.json'));
const jefferson = leads.leads.find((l) => l.id === 'jefferson-repair-01');
if (jefferson) pass('jefferson-repair-01 lead exists');
else fail('jefferson-repair-01 lead missing');

if (jefferson?.thread?.[0]?.reveals) pass('jefferson voicemail has reveals (Unlocked by listening)');
else fail('jefferson voicemail missing reveals');

// --- summary ---
console.log(`\n${passes} passed · ${fails} failed`);
process.exit(fails === 0 ? 0 : 1);
