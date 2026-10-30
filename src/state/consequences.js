// Consequences ledger — the system that makes choices matter.
// Pure functions that take state + record choices + compute outcomes.
// Setbacks not failures: every path finishes the day, but with different
// numbers and different problems queued for tomorrow.

/**
 * Called whenever the player makes a scored choice. Stores it on state
 * for later computation. Pass a key + value.
 */
export function recordChoice(state, key, value) {
  state.choices = state.choices || {};
  state.choices[key] = value;
}

/**
 * Which Patel reply variant to show, based on the quote the player sent.
 * Returns the replyId to use.
 */
export function pickClientReply(state) {
  const price = state.choices?.quotePrice;
  const flags = state.choices?.quoteFlags || [];
  const fair = 54500;
  const permitFlag = flags.includes('permit-flag');

  if (!permitFlag && price >= fair * 0.9) {
    // Didn't flag the permit on a reasonable quote → she gets cold
    return 'patel-ghost';
  }
  if (price > fair * 1.15) {
    // Greedy → she pushes back
    return 'patel-pushback';
  }
  if (price < fair * 0.85) {
    // Lowball → she signs but you ate margin
    return 'patel-lowball-accept';
  }
  return 'patel-fast-reply';
}

/**
 * Compute the end-of-day stat deltas from everything the player did.
 * Returns an object with bank, reviews, karma, energy deltas plus lessons.
 */
export function computeEndOfDay(state) {
  const c = state.choices || {};
  const deltas = {
    bank: 0,
    reviews: null, // null = none earned, else { stars, text }
    karma: 0,
    energy: -40, // base cost of a long day
    lessons: [],
    futureProblems: [],
  };

  // --- Patel quote outcome ---
  if (c.replyPicked === 'patel-fast-reply' || c.replyPicked === 'patel-lowball-accept') {
    deltas.bank += 2500; // deposit
    deltas.lessons.push('Honesty flagged early beats a lower price.');
  }
  if (c.replyPicked === 'patel-pushback') {
    deltas.lessons.push('She pushed back on price. Negotiating next week.');
  }
  if (c.replyPicked === 'patel-ghost') {
    deltas.lessons.push("Didn't flag the permit upfront. She went quiet.");
    deltas.karma -= 1;
  }
  if (c.replyPicked === 'patel-lowball-accept') {
    deltas.lessons.push('Signed at a lowball. Margin thin all build.');
    deltas.bank -= 500;
  }

  // --- Permit response ---
  if (c.permitResponse === 'we-handle') {
    deltas.bank += 1500;
  }

  // --- Drive event ---
  if (c.driveEvent === 'pull-over') {
    deltas.karma += 1;
    deltas.energy -= 10;
  }
  if (c.driveEvent === 'call-tow') {
    deltas.karma += 1;
    deltas.bank -= 20;
  }

  // --- Drive hazards (clean driving earns karma, hits eat energy) ---
  if (typeof c.driveClean === 'number') {
    if (c.driveClean === 3) {
      deltas.karma += 1;
      deltas.lessons.push('Clean drive, no scrapes. Trevor would be proud.');
    } else if (c.driveHits >= 2) {
      deltas.energy -= 10;
      deltas.lessons.push('Rough drive. The trailer rattled all day.');
    }
  }

  // --- Steph interruption ---
  if (c.stephInterruption === 'read') {
    deltas.karma += 1; // responsive = good crew relationship
  }

  // --- Jefferson install outcomes ---
  if (c.jeffersonSetback === 'straighten') {
    deltas.lessons.push('Took the time to do it right. The daughter saw.');
    if (c.jeffersonWalkthrough === 'walk-through') {
      deltas.reviews = { stars: 5, text: 'Came out same week we called. Didn\'t try to sell us anything we didn\'t need. Pointed out stuff about our lot we hadn\'t thought of.', author: 'M. Patel' };
      deltas.bank += 1800; // repair invoice
    } else if (c.jeffersonWalkthrough === 'honest') {
      deltas.reviews = { stars: 5, text: 'Honest and quick. Will call again.', author: 'Jenny' };
      deltas.bank += 1800;
    } else {
      deltas.bank += 1800;
      deltas.lessons.push('Modest answer. No review earned.');
    }
  }
  if (c.jeffersonSetback === 'shim') {
    deltas.bank += 1800; // repair invoice today
    deltas.futureProblems.push({
      triggerDay: 3,
      kind: 'callback',
      source: 'jefferson',
      summary: 'Jefferson pane cracked. "Didn\'t last a week."',
    });
    deltas.lessons.push('Shimmed instead of straightening. It\'ll come back.');
  }
  if (c.jeffersonSetback === 'tarp') {
    deltas.bank += 400; // partial payment
    deltas.futureProblems.push({
      triggerDay: 2,
      kind: 'callback',
      source: 'jefferson',
      summary: 'Jefferson pane install reschedule — the right part came in.',
    });
    deltas.lessons.push('Walked away with the right call. Back on Monday.');
  }

  // --- Energy sanity ---
  deltas.energy = Math.max(0, Math.min(100, deltas.energy));

  return deltas;
}

/**
 * Apply the deltas to the save state. Returns the new values for display.
 */
export function applyDeltas(state, deltas) {
  state.player.bank += deltas.bank;
  state.player.karma += deltas.karma;
  state.player.energy = Math.max(0, Math.min(100, state.player.energy + deltas.energy));
  if (deltas.reviews) {
    state.reviews.push({
      ...deltas.reviews,
      date: `day${state.player.dayNumber}`,
    });
  }
  for (const p of deltas.futureProblems) {
    state.ongoingThreads.push({
      ...p,
      startDay: state.player.dayNumber,
      status: 'queued',
    });
  }
}

/**
 * Tone-calibrated opening line for the end-of-day screen.
 */
export function dayVoiceLine(state, deltas) {
  if (deltas.reviews && deltas.reviews.stars === 5 && deltas.futureProblems.length === 0) {
    return 'Day one, well handled.';
  }
  if (deltas.futureProblems.length >= 1 || deltas.bank < 500) {
    return "Rough one. Tomorrow's fresh.";
  }
  if (deltas.karma > 0 && deltas.reviews) {
    return 'Solid day. Earned some good will.';
  }
  return 'Day done. Call it.';
}
