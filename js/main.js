import { loadFromStorage, state, resetState, resetTrackerOnly } from './state.js';
import { initSetup, showSetup, spielerHinzufuegen } from './start.js';
import { zeigeModusAuswahl } from './modus-auswahl.js';
import { initInselDerAbenteuer, updateLeaderboard, renderLog } from './games/insel-der-abenteuer.js';

import { updateSpielerAnzahl } from './start.js';

window.addEventListener('load', () => {
    loadFromStorage();

    // Update button state immediately after load
    updateSpielerAnzahl();

    // Check for saved game (Resilience)
    const hasPoints = Object.values(state.trinkCounter).some(c => (c.schluecke || 0) > 0 || (c.exen || 0) > 0);

    if (state.spieler.length >= 2 && hasPoints) {
        initInselDerAbenteuer();
        updateLeaderboard(); // Ensure leaderboard is rendered on F5
    } else {
        showSetup();
    }

    // Global Listeners
    setupGlobalListeners();
});

function setupGlobalListeners() {
    // Add Player Button
    const btnAdd = document.getElementById("btnAddPlayer");
    if (btnAdd) btnAdd.onclick = spielerHinzufuegen;

    // Player Input Enter Key
    const input = document.getElementById("neuerSpieler");
    if (input) {
        input.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') spielerHinzufuegen();
        });
    }

    // Start Button (To Modus Auswahl)
    const btnStart = document.getElementById("startBtn");
    if (btnStart) {
        btnStart.onclick = () => {
            if (state.spieler.length >= 2) zeigeModusAuswahl();
        }
    }

    // Reset Game Button
    const btnReset = document.getElementById("btnResetGame");
    if (btnReset) {
        btnReset.onclick = () => {
            document.getElementById("resetOverlay").classList.remove("hidden");
        };
    }

    // Reset Confirm
    const btnResetConfirm = document.getElementById("btnResetConfirm");
    if (btnResetConfirm) {
        btnResetConfirm.onclick = () => {
            resetTrackerOnly();
            updateLeaderboard(); // Refresh view
            renderLog(); // Clear Log View
            document.getElementById("resetOverlay").classList.add("hidden");
            document.getElementById("resetOverlay").classList.add("hidden");

            // Stay in game, no showSetup()
        };
    }

    // Reset Cancel
    const btnResetCancel = document.getElementById("btnResetCancel");
    if (btnResetCancel) {
        btnResetCancel.onclick = () => {
            document.getElementById("resetOverlay").classList.add("hidden");
        }
    }

    // Back Button Logic
    const btnBack = document.getElementById("btnBack");
    if (btnBack) {
        btnBack.onclick = () => {
            const spiel = document.getElementById("spiel");
            const modus = document.getElementById("modusAuswahl");

            if (!spiel.classList.contains("hidden")) {
                // In Game
                // Check if any points exist
                const hasPoints = Object.values(state.trinkCounter).some(c => (c.schluecke || 0) > 0 || (c.exen || 0) > 0);

                if (hasPoints) {
                    // Ask specifically
                    document.getElementById("quitOverlay").classList.remove("hidden");
                } else {
                    // No points, just leave
                    zeigeModusAuswahl();
                    document.getElementById("resetButtonContainer").style.display = "none";
                }
            } else if (!modus.classList.contains("hidden")) {
                // In Modus -> Back to Setup (No warning needed usually)
                showSetup();
            }
        };
    }

    // Quit Confirm code
    const btnQuitConfirm = document.getElementById("btnQuitConfirm");
    if (btnQuitConfirm) {
        btnQuitConfirm.onclick = () => {
            resetTrackerOnly(); // Reset stats on quit as requested
            document.getElementById("quitOverlay").classList.add("hidden");
            zeigeModusAuswahl();
            document.getElementById("resetButtonContainer").style.display = "none";
        };
    }

    const btnQuitCancel = document.getElementById("btnQuitCancel");
    if (btnQuitCancel) {
        btnQuitCancel.onclick = () => {
            document.getElementById("quitOverlay").classList.add("hidden");
        };
    }
}
