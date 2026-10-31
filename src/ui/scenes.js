// Stylized SVG scenes — real illustrations in code.
// Hand-drawn-ish, same vocabulary as walk-the-land. These replace the
// grey "ART PLACEHOLDER" boxes everywhere.

function svg(viewBox, inner) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  el.setAttribute('viewBox', viewBox);
  el.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  el.classList.add('inline-scene');
  el.innerHTML = inner;
  return el;
}

// ===== Site visit — the backyard spot with Patel walking toward truck =====
export function sceneBackyard() {
  return svg('0 0 300 200', `
    <rect width="300" height="80" fill="#2a3a52"/>
    <path d="M 0 80 Q 30 65 60 75 Q 100 60 140 72 Q 180 58 220 70 Q 260 62 300 72 L 300 80 L 0 80 Z"
          fill="#1a3020"/>
    <rect y="80" width="300" height="120" fill="#2d4a2a"/>

    <!-- creek on the right -->
    <path d="M 300 80 Q 250 110 260 150 Q 240 180 240 200 L 300 200 Z"
          fill="#3a5a7a" opacity="0.75"/>
    <path d="M 258 110 Q 252 140 262 170" stroke="#5a7a9a" stroke-width="1.5" fill="none" opacity="0.6"/>

    <!-- gravel drive + truck -->
    <path d="M 0 60 L 70 90 L 70 100 L 0 70 Z" fill="#5a5a4a" opacity="0.8"/>
    <g transform="translate(28 55)">
      <rect x="0" y="8" width="36" height="12" rx="2" fill="#22863a"/>
      <rect x="0" y="2" width="14" height="10" rx="1.5" fill="#22863a"/>
      <rect x="3" y="4" width="9" height="5" rx="0.5" fill="#4a6878" opacity="0.7"/>
      <rect x="15" y="8" width="20" height="4" rx="0.5" fill="#1a5a2a"/>
      <circle cx="5" cy="20" r="3" fill="#1a1a1a"/>
      <circle cx="28" cy="20" r="3" fill="#1a1a1a"/>
      <text x="2" y="7" fill="#f5f5f0" font-size="3" font-family="sans-serif" font-weight="bold">HBG</text>
    </g>

    <!-- Build stake -->
    <line x1="150" y1="100" x2="150" y2="120" stroke="#f5f5f0" stroke-width="2"/>
    <circle cx="150" cy="100" r="3" fill="#e24b4a"/>

    <!-- Maya walking toward truck, holding mug -->
    <g transform="translate(170 115)">
      <ellipse cx="0" cy="42" rx="7" ry="2" fill="#0a0a0a" opacity="0.3"/>
      <rect x="-3" y="18" width="6" height="24" fill="#3a4a5a"/>  <!-- jeans -->
      <rect x="-5" y="10" width="10" height="10" rx="2" fill="#8a4a4a"/>  <!-- quilted vest -->
      <circle cx="0" cy="6" r="4" fill="#c99a7a"/>  <!-- head -->
      <rect x="-7" y="12" width="3" height="2" fill="#c99a7a"/>  <!-- hand with mug -->
      <rect x="-9" y="11" width="3" height="4" rx="0.5" fill="#f5f5f0"/>  <!-- mug -->
    </g>

    <!-- Sun hint top-right -->
    <circle cx="265" cy="25" r="12" fill="#fbbf24" opacity="0.6"/>

    <!-- some trees in the distance -->
    <circle cx="100" cy="76" r="7" fill="#1a3020"/>
    <circle cx="195" cy="74" r="6" fill="#1a3020"/>
  `);
}

// ===== Install load-out — HBG shop bay, open bay door, Trevor loading =====
export function sceneLoadOut() {
  return svg('0 0 300 200', `
    <!-- interior wall -->
    <rect width="300" height="200" fill="#2a2a28"/>

    <!-- concrete floor -->
    <polygon points="0,120 300,120 300,200 0,200" fill="#5a5a52"/>
    <line x1="0" y1="150" x2="300" y2="150" stroke="#4a4a42" stroke-width="0.5"/>
    <line x1="0" y1="175" x2="300" y2="175" stroke="#4a4a42" stroke-width="0.5"/>

    <!-- open bay door at top, early morning light pouring in -->
    <rect x="30" y="0" width="240" height="100" fill="#f5c99a" opacity="0.4"/>
    <rect x="30" y="0" width="240" height="18" fill="#f5c99a" opacity="0.8"/>
    <line x1="30" y1="18" x2="270" y2="18" stroke="#5a5a52" stroke-width="2"/>
    <line x1="30" y1="30" x2="270" y2="30" stroke="#5a5a52" stroke-width="0.5"/>
    <line x1="30" y1="45" x2="270" y2="45" stroke="#5a5a52" stroke-width="0.5"/>

    <!-- light shaft on floor -->
    <polygon points="30,100 270,100 290,180 10,180" fill="#f5c99a" opacity="0.12"/>

    <!-- pegboard with tools (left wall) -->
    <rect x="5" y="40" width="20" height="60" fill="#8a7a5a" opacity="0.7"/>
    <circle cx="10" cy="48" r="1" fill="#1a1a1a"/>
    <circle cx="20" cy="48" r="1" fill="#1a1a1a"/>
    <circle cx="10" cy="60" r="1" fill="#1a1a1a"/>
    <circle cx="20" cy="60" r="1" fill="#1a1a1a"/>
    <line x1="7" y1="68" x2="15" y2="80" stroke="#3a2a1a" stroke-width="1.5"/>
    <rect x="17" y="68" width="3" height="18" fill="#4a3a2a"/>

    <!-- F-250 backed into bay, tailgate down -->
    <g transform="translate(90 115)">
      <!-- bed -->
      <rect x="0" y="0" width="80" height="30" rx="2" fill="#22863a"/>
      <!-- cab -->
      <rect x="0" y="-20" width="36" height="24" rx="3" fill="#22863a"/>
      <rect x="4" y="-16" width="28" height="12" rx="1" fill="#4a6878" opacity="0.7"/>
      <!-- tailgate down -->
      <rect x="78" y="10" width="20" height="4" fill="#1a5a2a"/>
      <!-- wheels -->
      <circle cx="12" cy="32" r="6" fill="#1a1a1a"/>
      <circle cx="12" cy="32" r="3" fill="#3a3a3a"/>
      <circle cx="70" cy="32" r="6" fill="#1a1a1a"/>
      <circle cx="70" cy="32" r="3" fill="#3a3a3a"/>
      <!-- HBG logo -->
      <text x="40" y="-5" fill="#f5f5f0" font-size="4" font-family="sans-serif" font-weight="bold">HBGreenhouses</text>
      <!-- cargo in bed: wrapped pane -->
      <rect x="20" y="-8" width="55" height="6" rx="1" fill="#4a4a52" opacity="0.9"/>
      <rect x="22" y="-10" width="55" height="4" fill="#8a8a92" opacity="0.6"/>
    </g>

    <!-- Trevor loading a pane -->
    <g transform="translate(195 115)">
      <ellipse cx="0" cy="60" rx="8" ry="2" fill="#0a0a0a" opacity="0.3"/>
      <rect x="-3" y="30" width="6" height="30" fill="#3a3a3a"/>  <!-- pants -->
      <rect x="-6" y="18" width="12" height="14" rx="2" fill="#4a7a4a"/>  <!-- HBG tee -->
      <circle cx="0" cy="12" r="4" fill="#6a4a3a"/>  <!-- head -->
      <!-- arms carrying pane -->
      <rect x="-18" y="22" width="4" height="2" fill="#6a4a3a"/>
      <rect x="14" y="22" width="4" height="2" fill="#6a4a3a"/>
      <!-- the pane he's carrying -->
      <rect x="-22" y="18" width="40" height="10" fill="#8a9aaa" opacity="0.4" stroke="#5a6a7a" stroke-width="0.5"/>
    </g>
  `);
}

// ===== Install on-site — Trevor on ladder setting glass =====
export function sceneOnSite() {
  return svg('0 0 300 200', `
    <!-- sky -->
    <rect width="300" height="100" fill="#8a9aaa"/>  <!-- overcast -->
    <!-- distant tree line -->
    <path d="M 0 100 Q 40 85 80 95 Q 130 80 180 90 Q 230 78 300 90 L 300 100 Z"
          fill="#1a3020"/>
    <!-- grass -->
    <rect y="100" width="300" height="100" fill="#2d4a2a"/>

    <!-- small lean-to greenhouse structure (damaged) -->
    <g transform="translate(90 60)">
      <!-- frame -->
      <polygon points="0,80 0,20 60,0 120,20 120,80" fill="none" stroke="#f5f5f0" stroke-width="1.5" opacity="0.8"/>
      <line x1="0" y1="20" x2="120" y2="20" stroke="#f5f5f0" stroke-width="1.5" opacity="0.8"/>
      <line x1="30" y1="10" x2="30" y2="80" stroke="#f5f5f0" stroke-width="1" opacity="0.6"/>
      <line x1="60" y1="0" x2="60" y2="80" stroke="#f5f5f0" stroke-width="1" opacity="0.6"/>
      <line x1="90" y1="10" x2="90" y2="80" stroke="#f5f5f0" stroke-width="1" opacity="0.6"/>
      <!-- intact panes -->
      <polygon points="2,22 28,22 28,78 2,78" fill="#8a9aaa" opacity="0.3"/>
      <polygon points="92,22 118,22 118,78 92,78" fill="#8a9aaa" opacity="0.3"/>
      <!-- missing pane (where Trevor is working) -->
      <polygon points="62,22 88,22 88,78 62,78" fill="#0a0a0a" opacity="0.5"/>
    </g>

    <!-- Ladder -->
    <g transform="translate(145 60)">
      <line x1="0" y1="100" x2="-10" y2="0" stroke="#8a7a5a" stroke-width="2"/>
      <line x1="12" y1="100" x2="2" y2="0" stroke="#8a7a5a" stroke-width="2"/>
      <line x1="-7" y1="25" x2="4" y2="25" stroke="#8a7a5a" stroke-width="1.5"/>
      <line x1="-6" y1="45" x2="6" y2="45" stroke="#8a7a5a" stroke-width="1.5"/>
      <line x1="-4" y1="65" x2="8" y2="65" stroke="#8a7a5a" stroke-width="1.5"/>
      <line x1="-2" y1="85" x2="10" y2="85" stroke="#8a7a5a" stroke-width="1.5"/>
    </g>

    <!-- Trevor on the ladder with a new pane -->
    <g transform="translate(148 48)">
      <rect x="-3" y="4" width="6" height="18" fill="#3a3a3a"/>
      <rect x="-5" y="-5" width="10" height="10" rx="2" fill="#4a7a4a"/>
      <circle cx="0" cy="-10" r="3.5" fill="#6a4a3a"/>
      <!-- arms up setting the pane -->
      <rect x="-11" y="-10" width="3" height="2" fill="#6a4a3a"/>
      <rect x="8" y="-10" width="3" height="2" fill="#6a4a3a"/>
      <!-- the pane being set -->
      <rect x="-15" y="-18" width="30" height="12" fill="#8a9aaa" opacity="0.5" stroke="#5a6a7a" stroke-width="0.5"/>
    </g>

    <!-- Player (you) handing up from the base -->
    <g transform="translate(170 150)">
      <ellipse cx="0" cy="38" rx="7" ry="2" fill="#0a0a0a" opacity="0.3"/>
      <rect x="-3" y="18" width="6" height="20" fill="#2a3040"/>
      <rect x="-5" y="8" width="10" height="12" rx="2" fill="#5a3a2a"/>
      <circle cx="0" cy="4" r="3.5" fill="#c99a7a"/>
      <!-- raised arms -->
      <rect x="-7" y="-4" width="2" height="14" fill="#c99a7a"/>
      <rect x="5" y="-4" width="2" height="14" fill="#c99a7a"/>
    </g>

    <!-- Broken pane in bucket foreground, lower left -->
    <g transform="translate(30 155)">
      <ellipse cx="20" cy="30" rx="22" ry="4" fill="#0a0a0a" opacity="0.3"/>
      <path d="M 0 10 L 40 10 L 36 30 L 4 30 Z" fill="#8a4a3a"/>
      <!-- jagged glass sticking out -->
      <polygon points="8,12 14,-2 16,10" fill="#8a9aaa" opacity="0.6"/>
      <polygon points="20,10 22,-6 26,10" fill="#8a9aaa" opacity="0.6"/>
      <polygon points="28,12 32,0 34,10" fill="#8a9aaa" opacity="0.6"/>
    </g>
  `);
}

// ===== Walk-through — client in doorway, repaired structure, afternoon sun =====
export function sceneWalkThrough() {
  return svg('0 0 300 200', `
    <!-- sky, afternoon warm -->
    <rect width="300" height="100" fill="#f5a97a" opacity="0.65"/>
    <rect width="300" height="40" fill="#f5c99a" opacity="0.7"/>

    <!-- tree line -->
    <path d="M 0 100 Q 40 82 90 95 Q 140 78 190 93 Q 240 80 300 93 L 300 100 Z"
          fill="#1a3020"/>

    <!-- grass -->
    <rect y="100" width="300" height="100" fill="#3a5a2a"/>

    <!-- repaired greenhouse structure, now intact -->
    <g transform="translate(60 50)">
      <polygon points="0,90 0,25 80,0 160,25 160,90" fill="none" stroke="#f5f5f0" stroke-width="2"/>
      <line x1="0" y1="25" x2="160" y2="25" stroke="#f5f5f0" stroke-width="2"/>
      <!-- panes all intact, slightly warm reflection -->
      <polygon points="3,27 37,27 37,88 3,88" fill="#f5c99a" opacity="0.35"/>
      <polygon points="40,27 78,27 78,88 40,88" fill="#f5c99a" opacity="0.35"/>
      <polygon points="82,27 118,27 118,88 82,88" fill="#f5c99a" opacity="0.35"/>
      <polygon points="121,27 157,27 157,88 121,88" fill="#f5c99a" opacity="0.35"/>
      <!-- door frame -->
      <rect x="68" y="50" width="22" height="40" fill="#2a2a28"/>
      <rect x="70" y="52" width="18" height="36" fill="#4a4a42" opacity="0.6"/>
    </g>

    <!-- Jenny in doorway -->
    <g transform="translate(140 115)">
      <ellipse cx="0" cy="42" rx="7" ry="2" fill="#0a0a0a" opacity="0.3"/>
      <rect x="-3" y="18" width="6" height="24" fill="#3a4a5a"/>  <!-- jeans -->
      <rect x="-5" y="8" width="10" height="12" rx="1" fill="#8a5a4a"/>  <!-- flannel -->
      <line x1="0" y1="8" x2="0" y2="20" stroke="#4a2a1a" stroke-width="1"/>
      <line x1="-4" y1="12" x2="4" y2="12" stroke="#4a2a1a" stroke-width="0.5"/>
      <circle cx="0" cy="4" r="4" fill="#e8c8a8"/>
      <!-- arms crossed -->
      <rect x="-6" y="12" width="4" height="2" fill="#8a5a4a"/>
      <rect x="2" y="12" width="4" height="2" fill="#8a5a4a"/>
    </g>

    <!-- You pointing at the straightened frame -->
    <g transform="translate(195 125)">
      <ellipse cx="0" cy="34" rx="7" ry="2" fill="#0a0a0a" opacity="0.3"/>
      <rect x="-3" y="12" width="6" height="22" fill="#2a3040"/>
      <rect x="-5" y="2" width="10" height="12" rx="2" fill="#5a3a2a"/>
      <circle cx="0" cy="-3" r="3.5" fill="#c99a7a"/>
      <!-- pointing arm toward the structure -->
      <line x1="-5" y1="4" x2="-15" y2="2" stroke="#c99a7a" stroke-width="2"/>
      <!-- other arm hanging -->
      <rect x="5" y="2" width="2" height="12" fill="#c99a7a"/>
    </g>

    <!-- Toolbox and tarp foreground, lower left -->
    <g transform="translate(25 160)">
      <rect x="0" y="0" width="22" height="12" rx="1" fill="#8a4a3a"/>
      <rect x="2" y="2" width="18" height="2" fill="#5a2a1a"/>
      <rect x="26" y="4" width="30" height="10" fill="#4a5a4a" opacity="0.7"/>  <!-- folded tarp -->
    </g>

    <!-- afternoon sun ray hint -->
    <polygon points="280,0 300,0 300,80 240,80" fill="#f5c99a" opacity="0.15"/>
  `);
}
