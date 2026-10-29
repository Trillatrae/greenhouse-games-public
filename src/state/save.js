// Save state via localStorage, wrapped in try/catch.
// The game must play with storage blocked. Rule 1.

const KEY = 'hbg.save.v1';

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function clear() {
  try {
    localStorage.removeItem(KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * Fresh save-file shape. Mirrors §6 of the design doc.
 * One JSON blob, under 1 MB, versioned.
 */
export function newState() {
  return {
    schemaVersion: 1,
    player: {
      name: '',
      companyName: '',
      homeBase: 'Athens, GA',
      lean: 'builder',
      bank: 5920,
      karma: 0,
      energy: 100,
      dayNumber: 1,
    },
    leads: [],
    jobs: [],
    reviews: [],
    npcs: {
      steph: { instinct: 1, fullTime: false },
      trevor: { skill: 1, fullTime: false },
    },
    calendar: {},
    upgrades: {
      spamFilterLevel: 1,
      secondTruck: false,
      weatherPro: false,
    },
    ongoingThreads: [],
    seenVoicemails: [],
  };
}
