// Game entry point. Phase 1: lock → home → phone → voicemail.
// Setbacks not failures. Nothing kills the player.

import './ui/tokens.css';
import './ui/phone.css';
import './ui/screens.css';

import { el, phoneFrame } from './ui/components.js';
import { lockScreen } from './phone/lock-screen.js';
import { homeScreen } from './phone/home-screen.js';
import { phoneRecents, voicemailDetail } from './apps/phone/phone-app.js';
import { messagesInbox, messagesThread } from './apps/messages/messages-app.js';
import { mailInbox, mailDetail } from './apps/mail/mail-app.js';
import { weatherApp } from './apps/weather/weather-app.js';
import { mapsApp } from './apps/maps/maps-app.js';
import { driveScene } from './scenes/drive/drive-scene.js';
import { siteVisitScoping, siteRead } from './scenes/site-visit/site-visit.js';
import { quoteScene } from './scenes/quote/quote-scene.js';
import { clientReply } from './scenes/client-reply/client-reply.js';
import { installLoadOut, installOnSite, installWalkThrough } from './scenes/install/install-scenes.js';
import { endOfDay } from './scenes/end-of-day/end-of-day.js';
import { recordChoice, pickClientReply, computeEndOfDay, applyDeltas, dayVoiceLine } from './state/consequences.js';
import { load, save, newState } from './state/save.js';

// --- state ---
let state = load() || newState();
// Migration safety: an older saved file may be missing newer fields.
state.player = state.player || newState().player;
state.player.name = state.player.name || 'You';
state.player.companyName = state.player.companyName || 'HBGreenhouses';
state.reviews = state.reviews || [];
state.ongoingThreads = state.ongoingThreads || [];
state.choices = state.choices || {};
state.seenVoicemails = state.seenVoicemails || [];

// --- toast ---
let toastTimer = null;
function toast(message) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const node = el('div', { class: 'toast' }, message);
  document.body.append(node);
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.remove(), 1800);
}

// --- router ---
let current = 'lock';
let currentArgs = {};

function go(screen, args = {}) {
  current = screen;
  currentArgs = args;
  render();
}

function render() {
  const root = document.getElementById('app');
  root.innerHTML = '';
  let screen;
  try {
    screen = buildScreen();
  } catch (err) {
    console.error('Scene build failed in "' + current + '":', err);
    screen = el('div', { class: 'screen', style: 'padding: 40px 20px; color: #e24b4a;' }, [
      el('div', { style: 'font-size: 14px; margin-bottom: 10px;' }, 'Something broke in: ' + current),
      el('div', { style: 'font-size: 11px; color: #999; line-height: 1.5;' }, err.message || String(err)),
      el('div', {
        class: 'phone-cta phone-cta-flat',
        style: 'margin-top: 20px;',
        onclick: () => go('home'),
      }, 'Back to Home'),
    ]);
  }
  root.append(phoneFrame(screen));
}

function buildScreen() {
  switch (current) {
    case 'lock':
      return lockScreen({ onUnlock: () => go('home') });
    case 'home':
      return homeScreen({
        onOpenApp: (appId) => {
          if (appId === 'phone') go('phone');
          else if (appId === 'messages') go('messages');
          else if (appId === 'mail') go('mail');
          else if (appId === 'weather') go('weather');
          else if (appId === 'maps') go('maps');
          else toast(appId + ' — coming next phase');
        },
        onToast: toast,
      });
    case 'phone':
      return phoneRecents({
        onOpenVoicemail: (leadId) => go('voicemail', { leadId }),
        onBack: () => go('home'),
        seenVoicemails: state.seenVoicemails,
      });
    case 'voicemail':
      if (!state.seenVoicemails.includes(currentArgs.leadId)) {
        state.seenVoicemails.push(currentArgs.leadId);
        save(state);
      }
      return voicemailDetail({
        leadId: currentArgs.leadId,
        onBack: () => go('phone'),
        onCallBack: () => toast('Call back — coming next phase'),
        onSave: () => toast('Save contact — coming next phase'),
        onBlock: () => toast('Block number — coming next phase'),
      });
    case 'messages':
      return messagesInbox({
        onOpenThread: (threadId) => go('thread', { threadId }),
        onBack: () => go('home'),
      });
    case 'thread':
      return messagesThread({
        threadId: currentArgs.threadId,
        onBack: () => go('messages'),
      });
    case 'mail':
      return mailInbox({
        onOpenEmail: (emailId) => go('email', { emailId }),
        onBack: () => go('home'),
      });
    case 'email':
      return mailDetail({
        emailId: currentArgs.emailId,
        onBack: () => go('mail'),
        onCta: (emailId) => {
          if (emailId === 'patel-referral') go('maps');
          else toast('Reply flow — coming next phase');
        },
        onReply: () => toast('Reply composer — coming next'),
        onToast: toast,
      });
    case 'weather':
      return weatherApp({ onBack: () => go('home') });
    case 'maps':
      return mapsApp({
        routeId: 'home-to-patel',
        onBack: () => go('home'),
        onStartDrive: (routeId) => go('drive', { routeId }),
      });
    case 'drive':
      return driveScene({
        routeId: currentArgs.routeId,
        onEventChoice: (choiceId) => {
          recordChoice(state, 'driveEvent', choiceId);
          save(state);
          const messages = {
            'pull-over': 'You pulled over. Karma +1.',
            'honk': 'Kept driving. On schedule.',
            'call-tow': 'Tow called in. $20 spent. Back on the road.',
          };
          toast(messages[choiceId] || 'Choice registered.');
        },
        onArrive: () => go('site-visit', { visitId: 'patel-watkinsville' }),
        onToast: toast,
      });
    case 'site-visit':
      return siteVisitScoping({
        visitId: currentArgs.visitId,
        onComplete: (visitId, pickedIds) => go('site-read', { visitId, pickedIds }),
        onBack: () => go('home'),
      });
    case 'site-read':
      return siteRead({
        visitId: currentArgs.visitId,
        pickedIds: currentArgs.pickedIds || [],
        onContinue: (visitId) => go('quote', { templateId: visitId }),
        onBack: () => go('home'),
      });
    case 'quote':
      return quoteScene({
        templateId: currentArgs.templateId,
        onSend: (templateId, { price, flags }) => {
          recordChoice(state, 'quotePrice', price);
          recordChoice(state, 'quoteFlags', flags);
          const replyId = pickClientReply(state);
          recordChoice(state, 'replyPicked', replyId);
          save(state);
          toast('Quote sent.');
          setTimeout(() => go('client-reply', { replyId }), 1200);
        },
        onBack: () => go('home'),
        onToast: toast,
      });
    case 'client-reply':
      return clientReply({
        replyId: currentArgs.replyId,
        onRespond: (replyId, choiceId) => {
          recordChoice(state, 'permitResponse', choiceId);
          save(state);
          const messages = {
            'we-handle': "You own the permit side. Deal moves.",
            'you-pull': "You held the line. She'll decide this week.",
            'split': "Split arrangement. One short call to confirm.",
          };
          toast(messages[choiceId] || 'Response sent.');
          setTimeout(() => go('install-loadout', { installId: 'jefferson-repair' }), 1500);
        },
        onBack: () => go('home'),
      });
    case 'install-loadout':
      return installLoadOut({
        installId: currentArgs.installId,
        onDepart: (installId) => go('install-site', { installId }),
        onBack: () => go('home'),
      });
    case 'install-site':
      return installOnSite({
        installId: currentArgs.installId,
        onResolveSetback: (installId, choiceId) => {
          recordChoice(state, 'jeffersonSetback', choiceId);
          save(state);
          const messages = {
            'straighten': 'Right way. Client sees the care. +40 min.',
            'shim': 'Shimmed. Looks fine. Will fail next storm.',
            'tarp': 'Tarped. Coming back with the right part.',
          };
          toast(messages[choiceId] || 'Setback handled.');
        },
        onComplete: (installId) => go('install-walkthrough', { installId }),
        onBack: () => go('home'),
      });
    case 'install-walkthrough':
      return installWalkThrough({
        installId: currentArgs.installId,
        onChoose: (installId, choiceId) => {
          recordChoice(state, 'jeffersonWalkthrough', choiceId);
          save(state);
          const messages = {
            'walk-through': 'You walked her through it. Reviews +1 predicted.',
            'modest': 'Modest answer. Didn\'t teach.',
            'honest': 'Honest. She\'ll remember.',
          };
          toast(messages[choiceId] || 'Choice registered.');
        },
        onInvoice: () => {
          toast('Invoice sent. Day wrap-up ahead.');
          setTimeout(() => go('end-of-day'), 1400);
        },
        onBack: () => go('home'),
      });
    case 'end-of-day': {
      const deltas = computeEndOfDay(state);
      applyDeltas(state, deltas);
      save(state);
      const voiceLine = dayVoiceLine(state, deltas);
      return endOfDay({
        state,
        deltas,
        voiceLine,
        onSleep: () => {
          // Start Day 2 fresh. Keep running totals, bump day, clear turn choices.
          state.player.dayNumber += 1;
          state.choices = {};
          save(state);
          toast('Day 2 — coming next phase.');
          setTimeout(() => go('home'), 1200);
        },
        onBack: () => go('home'),
      });
    }
    default:
      return el('div', {}, 'Unknown screen: ' + current);
  }
}

// --- boot ---
document.addEventListener('DOMContentLoaded', render);
if (document.readyState !== 'loading') render();
