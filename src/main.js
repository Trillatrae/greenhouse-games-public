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
import { load, save, newState } from './state/save.js';

// --- state ---
let state = load() || newState();
state.player.name = state.player.name || 'You';
state.player.companyName = state.player.companyName || 'HBGreenhouses';

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
        onContinue: () => toast('Quote write-up — coming in Phase 4'),
        onBack: () => go('home'),
      });
    default:
      return el('div', {}, 'Unknown screen: ' + current);
  }
}

// --- boot ---
document.addEventListener('DOMContentLoaded', render);
if (document.readyState !== 'loading') render();
