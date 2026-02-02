import { state, saveToStorage } from './state.js';
import { zeigeModusAuswahl } from './modus-auswahl.js';

export function initSetup() {
    const input = document.getElementById("neuerSpieler");
    const addBtn = document.querySelector("#setup button[onclick*='spielerHinzufuegen']");
    // We will replace onclicks in main.js or here. 
    // actually, let's export functions that Main can attach, or attach them here if we have the elements.

    renderSetupListe();
    updateSpielerAnzahl();
}

export function spielerHinzufuegen() {
    const input = document.getElementById("neuerSpieler");
    const name = input.value.trim();
    if (name && state.spieler.length < 4 && !state.spieler.includes(name)) {
        state.spieler.push(name);
        state.trinkCounter[name] = { schluecke: 0, exen: 0 };
        input.value = "";
        updateSpielerAnzahl();
        renderSetupListe();
        saveToStorage();
    }
}

export function spielerEntfernen(index) {
    const name = state.spieler[index];
    state.spieler.splice(index, 1);
    delete state.trinkCounter[name];

    saveToStorage();
    renderSetupListe();
    updateSpielerAnzahl();
}

export function updateSpielerAnzahl() {
    document.getElementById("spielerAnzahl").textContent = `${state.spieler.length} / 4 Spieler`;
    const startBtn = document.getElementById("startBtn");
    if (startBtn) startBtn.disabled = state.spieler.length < 2;
}

export function renderSetupListe() {
    const liste = document.getElementById("spielerListe");
    if (!liste) return;

    if (state.spieler.length === 0) {
        liste.innerHTML = "<li>Noch keine Spieler hinzugefügt</li>";
    } else {
        liste.innerHTML = state.spieler.map((name, index) => `
      <li style="display:flex; align-items:center;">
        <span style="flex:1; text-align:center;">${name}</span>
        <button 
          class="remove-btn"
          data-index="${index}">
          ✖
        </button>
      </li>
    `).join("");

        // Attach event listeners for remove buttons
        liste.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                spielerEntfernen(idx);
            });
        });
    }
}

export function showSetup() {
    const setup = document.getElementById("setup");
    if (setup) {
        setup.classList.remove("hidden");
        setup.style.display = ""; // Reset inline style from F5 fix
    }

    document.getElementById("spiel").classList.add("hidden");
    document.getElementById("modusAuswahl").classList.add("hidden");
    document.getElementById("resetButtonContainer").style.display = "none";
    document.getElementById("backButtonContainer").style.display = "none";
    document.getElementById("gameTitleContainer").classList.add("hidden");

    const liste = document.getElementById("spielerListe");
    if (liste) {
        liste.style.display = "block";
        liste.classList.remove("hidden");
    }
    renderSetupListe();
}
