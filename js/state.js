export const state = {
    spieler: [],
    trinkCounter: {}, // { "Name": { schluecke: 0, exen: 0 } }
    log: [], // Array of strings or objects { text, time }
    activeGame: null,
    difficulty: 'medium' // 'easy', 'medium', 'hard'
};

export function loadFromStorage() {
    const savedSpieler = localStorage.getItem('wiiPartySpieler');
    const savedCounter = localStorage.getItem('wiiPartyCounter');
    const savedLog = localStorage.getItem('wiiPartyLog');
    const savedDifficulty = localStorage.getItem('wiiPartyDifficulty');

    if (savedSpieler) {
        state.spieler = JSON.parse(savedSpieler);
    } else {
        state.spieler = [];
    }

    if (savedCounter) {
        state.trinkCounter = JSON.parse(savedCounter);
    } else {
        state.trinkCounter = {};
    }

    if (savedLog) {
        state.log = JSON.parse(savedLog);
    } else {
        state.log = [];
    }

    if (savedDifficulty) {
        state.difficulty = savedDifficulty;
    } else {
        state.difficulty = 'medium';
    }
}

export function saveToStorage() {
    localStorage.setItem('wiiPartySpieler', JSON.stringify(state.spieler));
    localStorage.setItem('wiiPartyCounter', JSON.stringify(state.trinkCounter));
    localStorage.setItem('wiiPartyLog', JSON.stringify(state.log));
    localStorage.setItem('wiiPartyDifficulty', state.difficulty);
}

export function resetState() {
    state.spieler = [];
    state.trinkCounter = {};
    state.activeGame = null;
    saveToStorage();
}

export function resetTrackerOnly() {
    state.spieler.forEach(name => {
        state.trinkCounter[name] = { schluecke: 0, exen: 0 };
    });
    state.log = []; // Clear Log on Reset
    saveToStorage();
}
