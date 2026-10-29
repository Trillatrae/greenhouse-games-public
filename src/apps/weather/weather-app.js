// Weather app — the clock the game runs on.
// Install-window bar is the OS fingerprint callout here.

import { el, statusBar } from '../../ui/components.js';
import { t } from '../../i18n/t.js';
import weatherData from '../../data/weather.json';

const ICONS = {
  sun: '☀',
  cloud: '☁',
  storm: '⛈',
  rain: '🌧',
};

export function weatherApp({ onBack }) {
  const w = weatherData;

  return el('div', { class: 'screen weather-app' }, [
    statusBar('6:57'),
    el('div', { class: 'back-row', onclick: onBack }, [
      el('span', {}, '‹ Home'),
    ]),
    el('div', { class: 'weather-head' }, [
      el('div', { class: 'weather-location' }, w.location),
      el('div', { class: 'weather-temp' }, w.now.temp + '°'),
      el('div', { class: 'weather-cond' }, w.now.condition),
      el('div', { class: 'weather-hilo' }, `H: ${w.now.hi}°  L: ${w.now.lo}°`),
    ]),

    installWindowCallout(w.install_window),

    el('div', { class: 'weather-forecast' }, [
      el('div', { class: 'weather-forecast-label' }, t('weather.forecast_label')),
      el('div', { class: 'forecast-rows' },
        w.forecast.map((row) => forecastRow(row))
      ),
    ]),

    el('div', { class: 'weather-tiles' }, [
      conditionTile('wind', w.now),
      conditionTile('ground', w.now),
    ]),
  ]);
}

function installWindowCallout(iw) {
  return el('div', { class: 'install-window-card' }, [
    el('div', { class: 'install-window-head' }, [
      el('span', { class: 'install-window-label' }, '🔧 ' + iw.label),
      el('span', { class: 'install-window-open' },
        t('weather.install_window_body', { n: iw.openDays })
      ),
    ]),
    el('div', { class: 'install-window-bars' },
      iw.days.map((d) =>
        el('div', { class: 'iw-bar iw-' + d.state, title: d.label })
      )
    ),
    el('div', { class: 'install-window-summary' }, iw.summary),
  ]);
}

function forecastRow(row) {
  const dayClass =
    row.state === 'open' && row.day === 'Today' ? 'forecast-today' :
    row.state === 'marginal' ? 'forecast-marginal' :
    row.state === 'killed' ? 'forecast-killed' :
    '';

  return el('div', { class: 'forecast-row' }, [
    el('span', { class: 'forecast-day ' + dayClass }, row.day),
    el('span', { class: 'forecast-icon' }, ICONS[row.icon] || '○'),
    el('div', { class: 'forecast-range' }, [
      el('div', {
        class: 'forecast-range-bar forecast-bar-' + row.state,
        style: `width: ${rangeWidth(row.hi, row.lo)}%; margin-left: ${rangeOffset(row.lo)}%;`,
      }),
    ]),
    el('span', { class: 'forecast-lo' }, row.lo + '°'),
    el('span', { class: 'forecast-hi' }, row.hi + '°'),
  ]);
}

function rangeWidth(hi, lo) {
  return Math.round(((hi - lo) / 30) * 100);
}
function rangeOffset(lo) {
  return Math.max(0, Math.round(((lo - 40) / 40) * 100));
}

function conditionTile(kind, now) {
  if (kind === 'wind') {
    const safe = now.wind_mph < 15;
    return el('div', { class: 'weather-tile' }, [
      el('div', { class: 'weather-tile-label' }, '💨 ' + t('weather.wind_label')),
      el('div', { class: 'weather-tile-value' }, now.wind_mph + ' mph'),
      el('div', { class: 'weather-tile-note ' + (safe ? '' : 'tile-warn') },
        safe ? t('weather.wind_safe') : t('weather.wind_warn')
      ),
    ]);
  }
  const firm = now.ground === 'firm';
  return el('div', { class: 'weather-tile' }, [
    el('div', { class: 'weather-tile-label' }, '💧 ' + t('weather.ground_label')),
    el('div', { class: 'weather-tile-value' }, firm ? 'firm' : 'soft'),
    el('div', { class: 'weather-tile-note ' + (firm ? '' : 'tile-warn') },
      firm ? t('weather.ground_firm') : t('weather.ground_soft')
    ),
  ]);
}
