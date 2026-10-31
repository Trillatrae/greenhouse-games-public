// Install day — three scene types: load out, on-site stages, walk-through.
// Reusable across every install. Jefferson repair is the first content.

import { el, statusBar } from '../../ui/components.js';
import { t } from '../../i18n/t.js';
import installsData from '../../data/install-days.json';
import { playSetGlass } from './set-glass-minigame.js';
import { sceneLoadOut, sceneOnSite, sceneWalkThrough } from '../../ui/scenes.js';

const SLOT_CAP = 8;

// ===== Scene 1: Load out =====
export function installLoadOut({ installId, onDepart, onBack }) {
  const install = installsData.installs[installId];
  if (!install) throw new Error('install not found: ' + installId);

  const packed = new Set(install.pack_list.filter((p) => p.required).map((p) => p.id));

  const refs = {};
  refs.slotCounter = el('div', { class: 'cards-counter-left' },
    '📦 ' + t('install.pack_list_label', { count: packed.size, max: SLOT_CAP }));
  refs.weightWarning = el('div', { class: 'cards-counter-right pack-weight-warn' },
    packed.size >= 6 ? t('install.weight_warning') : '');

  function renderPackCard(item) {
    const picked = packed.has(item.id);
    const card = el('div', {
      class: 'pack-card ' + (picked ? 'pack-card-on' : 'pack-card-off'),
      onclick: () => {
        if (item.required) return; // can't un-pack required items
        if (picked) packed.delete(item.id);
        else if (packed.size < SLOT_CAP) packed.add(item.id);
        refreshPackUi();
      },
    }, [
      el('div', { class: 'pack-card-head' }, [
        el('span', { class: 'pack-check' }, picked ? '✓' : '+'),
        el('span', { class: 'pack-label' }, item.label),
      ]),
      el('div', { class: 'pack-why' }, item.why),
    ]);
    return card;
  }

  function refreshPackUi() {
    refs.grid.replaceChildren(...install.pack_list.map(renderPackCard));
    refs.slotCounter.textContent = '📦 ' + t('install.pack_list_label', { count: packed.size, max: SLOT_CAP });
    refs.weightWarning.textContent = packed.size >= 6 ? t('install.weight_warning') : '';
  }

  refs.grid = el('div', { class: 'cards-grid pack-grid' },
    install.pack_list.map(renderPackCard)
  );

  return el('div', { class: 'screen install-loadout' }, [
    statusBar('8:14'),
    el('div', { class: 'back-row', onclick: onBack }, [
      el('span', {}, '‹ Home'),
    ]),
    el('div', { class: 'site-visit-eyebrow-row' }, [
      el('div', { class: 'screen-eyebrow site-visit-eyebrow' },
        '🛻 ' + t('install.load_out_eyebrow', { client: install.clientName })),
      el('div', { class: 'site-visit-city' }, t('install.load_out_title')),
    ]),
    el('div', { class: 'scene-frame' }, [sceneLoadOut()]),
    el('div', { class: 'cards-counter-row' }, [refs.slotCounter, refs.weightWarning]),
    refs.grid,
    el('div', { class: 'callout', style: 'margin: 6px 14px' }, [
      el('div', { class: 'callout-label' }, '✦ ' + t('site_visit.scope_read_label')),
      el('div', { class: 'callout-body' }, install.scope_read),
    ]),
    el('div', {
      class: 'phone-cta phone-cta-flat',
      style: 'margin: 6px 14px 14px',
      onclick: () => onDepart(installId, Array.from(packed)),
    }, t('install.load_up_cta')),
  ]);
}

// ===== Scene 2: On-site stages =====
export function installOnSite({ installId, onResolveSetback, onComplete, onBack, onGlassResult }) {
  const install = installsData.installs[installId];
  if (!install) throw new Error('install not found: ' + installId);

  // State: step through stages. The setback stage shows a setback card.
  const stages = install.stages.map((s) => ({ ...s }));
  const setback = install.setback;
  let currentStageIndex = 0;
  const setbackIndex = stages.findIndex((s) => s.id === setback.stageId);

  const refs = {};

  function stepUi() {
    stages.forEach((s, i) => {
      s.state = i < currentStageIndex ? 'done' : i === currentStageIndex ? 'now' : 'next';
    });
    const progress = Math.round((currentStageIndex / stages.length) * 100);

    refs.stagesRow.replaceChildren(...stages.map((s) =>
      el('div', { class: 'stage-chip stage-chip-' + s.state }, [
        el('div', { class: 'stage-chip-state' }, t('install.stage_' + s.state)),
        el('div', { class: 'stage-chip-label' }, s.label),
      ])
    ));
    refs.progressBar.style.width = progress + '%';
    refs.progressLabel.textContent = progress + '%';

    // Show setback at the setback stage (after glass minigame runs)
    if (currentStageIndex === setbackIndex && !refs.setbackShown) {
      refs.setbackShown = true;
      refs.setbackActive = true;
      // Play the Set-Glass minigame first, then reveal the setback
      refs.setbackActive = true;
      playSetGlass(refs.setbackSlot).then((results) => {
        if (onGlassResult) onGlassResult(installId, results);
        renderSetback(results);
      });
    }
  }

  function renderSetback(glassResults) {
    const score = glassResults
      ? `${glassResults.perfects} perfect · ${glassResults.oks} ok · ${glassResults.misses} missed`
      : '';
    const setbackCard = el('div', { class: 'callout callout-danger setback-card' }, [
      el('div', { class: 'callout-label' }, '⚠ ' + t('install.setback_label')),
      el('div', { class: 'callout-body' }, [
        glassResults && el('div', { class: 'setback-glass-summary' }, '🪟 ' + score),
        el('div', {}, setback.body),
      ]),
    ]);

    const choices = el('div', { class: 'setback-choices' },
      setback.choices.map((c) =>
        el('div', {
          class: 'reply-choice reply-choice-' + c.tone,
          onclick: () => {
            onResolveSetback(installId, c.id);
            refs.setbackActive = false;
            refs.setbackSlot.replaceChildren();
            advanceStage();
          },
        }, [
          el('div', { class: 'reply-choice-label' }, c.label + ' ›'),
          el('div', { class: 'reply-choice-sub' }, c.sub),
        ])
      )
    );

    refs.setbackSlot.replaceChildren(setbackCard, choices);
  }

  function advanceStage() {
    currentStageIndex++;
    if (currentStageIndex >= stages.length) {
      onComplete(installId);
      return;
    }
    stepUi();
    // Non-setback stages auto-advance after a short beat
    setTimeout(() => {
      if (currentStageIndex !== setbackIndex && currentStageIndex < stages.length - 1) {
        // keep user in control — don't autoplay past the setback
      }
    }, 400);
  }

  refs.stagesRow = el('div', { class: 'stages-row' });
  refs.progressBar = el('div', { class: 'progress-bar-fill' });
  refs.progressLabel = el('span', { class: 'progress-label' }, '0%');
  refs.setbackSlot = el('div', { class: 'setback-slot' });
  refs.stageEyebrow = el('div', { class: 'site-visit-city' },
    t('install.on_site_title', { stage: 1, total: stages.length }));
  refs.nextBtn = el('div', {
    class: 'phone-cta phone-cta-flat',
    style: 'margin: 0',
    onclick: () => {
      if (refs.setbackActive) return; // must resolve setback first
      advanceStage();
    },
  }, 'Next stage ›');

  // Patched stepUi: also update the eyebrow with the real current stage.
  const originalStep = stepUi;
  stepUi = function () {
    originalStep();
    refs.stageEyebrow.textContent = t('install.on_site_title', {
      stage: Math.min(currentStageIndex + 1, stages.length),
      total: stages.length,
    });
    refs.nextBtn.style.opacity = refs.setbackActive ? '0.5' : '1';
    refs.nextBtn.style.pointerEvents = refs.setbackActive ? 'none' : 'auto';
  };

  // Prime
  queueMicrotask(stepUi);

  const screen = el('div', { class: 'screen install-site' }, [
    statusBar('11:47'),
    el('div', { class: 'back-row', onclick: onBack }, [
      el('span', {}, '‹ Home'),
    ]),
    el('div', { class: 'site-visit-eyebrow-row' }, [
      el('div', { class: 'screen-eyebrow site-visit-eyebrow' }, '🔧 ' + t('install.on_site_eyebrow')),
      refs.stageEyebrow,
    ]),
    el('div', { class: 'on-site-scroll' }, [
      el('div', { class: 'scene-frame' }, [sceneOnSite()]),
      el('div', { class: 'progress-row' }, [
        el('div', { class: 'progress-top' }, [
          el('span', { class: 'progress-label-text' }, t('install.progress_label')),
          refs.progressLabel,
        ]),
        el('div', { class: 'progress-bar-track' }, refs.progressBar),
      ]),
      refs.stagesRow,
      refs.setbackSlot,
    ]),
    el('div', { class: 'walkthrough-footer' }, refs.nextBtn),
  ]);

  return screen;
}

// ===== Scene 3: Walk-through =====
export function installWalkThrough({ installId, onInvoice, onChoose, onBack }) {
  const install = installsData.installs[installId];
  if (!install) throw new Error('install not found: ' + installId);
  const wt = install.walkthrough;

  return el('div', { class: 'screen install-walkthrough' }, [
    statusBar('3:28'),
    el('div', { class: 'back-row', onclick: onBack }, [
      el('span', {}, '‹ Home'),
    ]),
    el('div', { class: 'site-visit-eyebrow-row' }, [
      el('div', { class: 'screen-eyebrow site-visit-eyebrow' }, '✓ ' + t('install.wrap_eyebrow')),
      el('div', { class: 'site-visit-city' }, t('install.wrap_title')),
    ]),
    el('div', { class: 'walkthrough-scroll' }, [
      el('div', { class: 'scene-frame' }, [sceneWalkThrough()]),
      el('div', { class: 'site-visit-greeting' }, [
        el('div', { class: 'site-visit-greeting-avatar', style: 'background:#a78bfa' }, wt.askerInitials),
        el('div', { class: 'site-visit-greeting-body' }, [
          el('div', { class: 'site-visit-greeting-name' }, wt.askerName),
          el('div', { class: 'site-visit-greeting-line' }, wt.question),
        ]),
      ]),
      el('div', { class: 'cards-counter-row' }, [
        el('div', { class: 'cards-counter-left' }, '💬 ' + t('install.how_you_answer')),
      ]),
      el('div', { class: 'reply-choices', style: 'padding: 0 10px' },
        wt.choices.map((c) =>
          el('div', {
            class: 'reply-choice reply-choice-' + c.tone,
            onclick: () => onChoose(installId, c.id),
          }, [
            el('div', { class: 'reply-choice-label' }, c.label + ' ›'),
            el('div', { class: 'reply-choice-sub' }, c.sub),
          ])
        )
      ),
      el('div', { class: 'callout', style: 'margin: 10px 14px 6px' }, [
        el('div', { class: 'callout-label' }, '✦ ' + t('install.education_label')),
        el('div', { class: 'callout-body' }, wt.education_moment),
      ]),
    ]),
    el('div', { class: 'walkthrough-footer' }, [
      el('div', {
        class: 'phone-cta phone-cta-flat',
        style: 'margin: 0',
        onclick: () => onInvoice(installId),
      }, '🧾 ' + t('install.send_invoice')),
    ]),
  ]);
}
