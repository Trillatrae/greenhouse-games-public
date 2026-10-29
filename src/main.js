// Game entry point. Phase 1: lock → home → phone → voicemail.
// Setbacks not failures. Nothing kills the player.

import './ui/tokens.css';
import './ui/phone.css';
import './ui/screens.css';

import { el, phoneFrame } from './ui/components.js';
import { lockScreen } from './phone/lock-screen.js';
import { homeScreen } from './phone/home-screen.js';
import { phoneRecents, voicemailDetail } from './apps/phone/phone-app.js';
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
  switch (current) {
    case 'lock':
      screen = lockScreen({ onUnlock: () => go('home') });
      break;
    case 'home':
      screen = homeScreen({
        onOpenApp: (appId) => {
          if (appId === 'phone') go('phone');
          else toast(appId + ' — coming next phase');
        },
        onToast: toast,
      });
      break;
    case 'phone':
      screen = phoneRecents({
        onOpenVoicemail: (leadId) => go('voicemail', { leadId }),
        onBack: () => go('home'),
        seenVoicemails: state.seenVoicemails,
      });
      break;
    case 'voicemail':
      // Mark it seen the moment the detail opens.
      if (!state.seenVoicemails.includes(currentArgs.leadId)) {
        state.seenVoicemails.push(currentArgs.leadId);
        save(state);
      }
      screen = voicemailDetail({
        leadId: currentArgs.leadId,
        onBack: () => go('phone'),
        onCallBack: () => toast('Call back — coming next phase'),
        onSave: () => toast('Save contact — coming next phase'),
        onBlock: () => toast('Block number — coming next phase'),
      });
      break;
    default:
      screen = el('div', {}, 'Unknown screen: ' + current);
  }
  root.append(phoneFrame(screen));
}

// --- boot ---
document.addEventListener('DOMContentLoaded', render);
if (document.readyState !== 'loading') render();
