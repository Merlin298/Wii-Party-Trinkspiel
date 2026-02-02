import { initInselDerAbenteuer } from './games/insel-der-abenteuer.js';
import { state, saveToStorage } from './state.js';

export function zeigeModusAuswahl() {
    document.getElementById("setup").classList.add("hidden");
    document.getElementById("spiel").classList.add("hidden");
    document.getElementById("gameTitleContainer").classList.add("hidden");
    document.getElementById("backButtonContainer").style.display = "block";
    document.getElementById("resetButtonContainer").style.display = "none";

    const modusSection = document.getElementById("modusAuswahl");
    modusSection.classList.remove("hidden");

    const liste = document.getElementById("modusAuswahlListe");
    liste.innerHTML = "";

    // Hide player list if visible
    const spielerListe = document.getElementById("spielerListe");
    if (spielerListe) {
        spielerListe.classList.add("hidden");
        spielerListe.style.display = "none";
    }

    // 1. Difficulty Select (Inline)
    const diffContainer = document.createElement("div");
    diffContainer.id = "difficultyInlineSelector";
    diffContainer.style.cssText = "display:flex; justify-content:center; gap:10px; margin-bottom:25px; flex-wrap:wrap;";

    // Initial state check
    if (!state.difficulty) state.difficulty = 'medium';

    const levels = [
        { id: 'easy', label: '🐣 Leicht', color: 'linear-gradient(135deg, #44bd32, #2ecc71)' },
        { id: 'medium', label: '⚖️ Mittel', color: 'linear-gradient(135deg, #f39c12, #e67e22)' },
        { id: 'hard', label: '🔥 Schwer', color: 'linear-gradient(135deg, #c0392b, #e74c3c)' }
    ];

    levels.forEach(lvl => {
        const btn = document.createElement("button");
        btn.innerHTML = lvl.label;
        btn.className = "diff-toggle-btn";
        // Base Style
        btn.style.cssText = `
            padding: 10px 20px 10px 20px; 
            border-radius: 20px; 
            border: 2px solid transparent; 
            font-size: 1.2rem; 
            cursor: pointer; 
            color: white; 
            background: #333; /* Default inactive */
            opacity: 0.6;
            transition: all 0.2s;
            line-height: 1.2;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        // Active Logic
        if (state.difficulty === lvl.id) {
            btn.style.background = lvl.color;
            btn.style.opacity = "1";
            btn.style.transform = "scale(1.1)";
            btn.style.border = "2px solid white";
            btn.style.fontWeight = "bold";
        }

        btn.onclick = () => {
            // Update State
            state.difficulty = lvl.id;
            saveToStorage();
            // Re-render this selector to update styles
            zeigeModusAuswahl();
        };
        diffContainer.appendChild(btn);
    });

    liste.appendChild(diffContainer);


    // 2. Game Button (Direct Start)
    const btnInsel = document.createElement("button");
    btnInsel.className = "modus-btn big";
    btnInsel.setAttribute("data-game", "insel");
    btnInsel.innerHTML = `<span style="font-size:1.5rem;">🏝️ Insel der Abenteuer 🏝️</span>`;
    btnInsel.onclick = initInselDerAbenteuer; // Direct Start
    liste.appendChild(btnInsel);

    // 3. Placeholder Button (Restored)
    const btnWip = document.createElement("button");
    btnWip.className = "modus-btn big";
    btnWip.disabled = true;
    btnWip.style.cssText = "background: #555; cursor: not-allowed; opacity: 0.6; margin-top: 10px;";
    btnWip.innerHTML = "🚧 Mehr Spiele bald... 🚧";
    liste.appendChild(btnWip);
}

function zeigeSchwierigkeitsgradAuswahl() {
    // Check if Overlay already exists
    if (document.getElementById("difficultyOverlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "difficultyOverlay";
    overlay.style.cssText = `position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.95);
    display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;gap:20px;color:white;`;

    overlay.innerHTML = `
    <h2 style="font-size: 2.5rem; margin-bottom: 20px; color: #ffa502; text-shadow: 2px 2px #000;">Schwierigkeitsgrad</h2>
    <div style="display:flex; flex-direction:column; gap:15px; width: 100%; align-items:center;">
        <button class="diff-btn" data-diff="easy" style="background: linear-gradient(135deg, #44bd32, #2ecc71);">
            🐣 Leicht <br><span style="font-size:0.9rem">Weniger Schlücke, selten Exen</span>
        </button>
        <button class="diff-btn" data-diff="medium" style="background: linear-gradient(135deg, #f39c12, #e67e22);">
            ⚖️ Mittel <br><span style="font-size:0.9rem">Standard Regeln</span>
        </button>
        <button class="diff-btn" data-diff="hard" style="background: linear-gradient(135deg, #c0392b, #e74c3c);">
            🔥 Schwer <br><span style="font-size:0.9rem">Chaos, mehr Schlücke & neue Buttons (Tornado, Dino, etc.)</span>
        </button>
    </div>
    <button id="diffCancel" style="margin-top:30px; background:#555;">Abbrechen</button>
    `;

    document.body.appendChild(overlay);

    // Style buttons dynamically
    overlay.querySelectorAll('.diff-btn').forEach(btn => {
        btn.style.cssText += `width: 300px; padding: 20px; font-size: 1.5rem; border: none; border-radius: 15px; 
        cursor: pointer; box-shadow: 0 5px #000; color: white; text-align:center; transition: transform 0.1s;`;

        btn.onclick = () => {
            initInselDerAbenteuer();
        };
    });
}
