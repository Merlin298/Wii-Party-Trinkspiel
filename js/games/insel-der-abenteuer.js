import { state, saveToStorage } from '../state.js';

let minispielPhase = 0;
let gefahrPlatz = 0;
let currentDoublePerson = null;
let currentDoubleAnzahl = 0;

const kugeln = [
    "3 Schlücke",
    "4 Schlücke",
    "5 Schlücke",
    "Exen",
    "Exen verteilen",
    "Nichts",
    "Zufall 0-10 Schlücke"
];

export function initInselDerAbenteuer() {
    document.getElementById("modusAuswahl").classList.add("hidden");
    // CRITICAL: Hide setup if it's visible (e.g. on F5 reload)
    const setup = document.getElementById("setup");
    if (setup) setup.style.display = "none";

    document.getElementById("spiel").classList.remove("hidden");
    document.getElementById("resetButtonContainer").style.display = "block";

    document.getElementById("backButtonContainer").style.display = "block";
    document.getElementById("gameTitleContainer").classList.remove("hidden");
    document.getElementById("gameTitle").textContent = "🏝️ Insel der Abenteuer 🏝️";

    // Hide setuplist if visible
    const liste = document.getElementById("spielerListe");
    if (liste) {
        liste.style.display = "none";
        liste.classList.add("hidden");
    }

    updateLeaderboard();

    // Attach Event Listeners
    document.getElementById("btnFelder").onclick = felderTrinken;
    document.getElementById("btnHoelle").onclick = hoelle;
    document.getElementById("btnBlau").onclick = blauerWerfer;
    document.getElementById("btnRot").onclick = roterWerfer;
    document.getElementById("btnMinispiel").onclick = minispiel;

    document.getElementById("btnDoubleYes").onclick = confirmDouble;
    document.getElementById("btnDoubleNo").onclick = cancelDouble;

    // Hard Mode Button Listeners (Ensure these elements exist before attaching)
    const btnPasch = document.getElementById("btn3erPasch");
    if (btnPasch) {
        btnPasch.onclick = pasch;
    } else {
        console.error("btn3erPasch not found in DOM");
    }

    const btnTornado = document.getElementById("btnTornado");
    if (btnTornado) btnTornado.onclick = tornado;

    const btnDino = document.getElementById("btnDino");
    if (btnDino) btnDino.onclick = dino;

    const btn1v1 = document.getElementById("btn1v1");
    if (btn1v1) btn1v1.onclick = duell1v1;

    const btn1v3 = document.getElementById("btn1v3");
    if (btn1v3) btn1v3.onclick = duell1v3;

    // Update Title/Subtitle if needed

    // Render initial log (restored from storage)
    renderLog();

    // Toggle Hard Mode Buttons
    const hardContainer = document.getElementById("inselButtonsHard");
    if (state.difficulty === 'hard') {
        hardContainer.classList.remove("hidden");
        hardContainer.style.display = "flex"; // Ensure it respects flex layout
        hardContainer.style.flexWrap = "wrap";
        hardContainer.style.justifyContent = "center";
    } else {
        hardContainer.classList.add("hidden");
        hardContainer.style.display = "none";
    }
}

// ------------------------------------------------------------------
// Core Logic
// ------------------------------------------------------------------

export function updateLeaderboard() {
    const { spieler, trinkCounter } = state;

    // Ensure counters exist (sanity check)
    spieler.forEach(s => {
        if (!trinkCounter[s]) trinkCounter[s] = { schluecke: 0, exen: 0 };
    });

    const hasPoints = spieler.some(s =>
        (trinkCounter[s].schluecke || 0) + (trinkCounter[s].exen || 0) * 10 > 0
    );

    let rankedPlayers;

    if (!hasPoints) {
        rankedPlayers = spieler.map(name => ({
            name,
            schluecke: 0,
            exen: 0,
            punkte: 0
        }));
    } else {
        rankedPlayers = spieler.map(name => {
            const schluecke = trinkCounter[name].schluecke || 0;
            const exen = trinkCounter[name].exen || 0;
            const punkte = schluecke + exen * 10;
            return { name, schluecke, exen, punkte };
        }).sort((a, b) => b.punkte - a.punkte);
    }

    const tbody = document.getElementById("leaderboardBody");
    if (tbody) {
        tbody.innerHTML = "";

        rankedPlayers.forEach((player, index) => {
            const row = document.createElement("tr");
            if (index === 0 && player.punkte > 0) {
                row.className = "rank-1";
            }

            row.innerHTML = `
          <td>${index + 1}</td>
          <td>${player.name}</td>
          <td>${player.schluecke}</td>
          <td>${player.exen}</td>
          <td>${player.punkte}</td>
        `;

            tbody.appendChild(row);
        });
    }
}

// Meldung
export function zeigeMeldung(html, dauer = 2750) {
    const div = document.createElement("div");
    div.className = "meldung";
    div.innerHTML = html;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), dauer);
}

// Log Logic
// Log Logic
export function addToLog(text) {
    // const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    // User requested NO time
    const entry = { text };

    // Ensure state.log exists
    if (!state.log) state.log = [];

    // Add to beginning
    state.log.unshift(entry);

    // Limit log size
    if (state.log.length > 50) state.log.pop();

    saveToStorage();
    renderLog();
}

export function renderLog() {
    const list = document.getElementById("gameLogList");
    if (!list) return;

    // If state.log is empty/undefined
    if (!state.log || state.log.length === 0) {
        list.innerHTML = "";
        return;
    }

    list.innerHTML = state.log.map(entry => `
        <li>
            ${entry.text}
        </li>
    `).join("");
}

// Overlay Helper
function erstellePersonenOverlay(titel, callbackName, ausgeschlossene = []) {
    const overlay = document.createElement("div");
    overlay.id = "personenOverlay";
    overlay.style.cssText = `position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.97);
    display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;gap:30px;color:white;`;

    // NOTE: callbackName is a string here to keep compatibility with innerHTML onclicks, 
    // but since we are modules, we cannot use global function names easily in HTML strings.
    // We need to attach listeners dynamically or expose to window. 
    // For this overlay, since we are generating HTML strings, it's easier to use a data attribute and add listener to container.

    overlay.innerHTML = `
  <h2 style="font-size: 3rem; margin-bottom: 30px; text-shadow: 3px 3px #000;">${titel}</h2>
  <div class="overlay-buttons" style="display:flex; gap:20px; flex-wrap:wrap; justify-content:center; max-width:90%;">
    ${state.spieler.filter(s => !ausgeschlossene.includes(s)).map(s =>
        `<button class="spieler-btn" data-player="${s}" style="padding:25px 40px; font-size:2rem; background:#333; color:white; border:none; border-radius:30px; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow: inset 0 -8px 12px -6px #0008, inset 0 8px 12px -6px #fff4; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${s}</button>`
    ).join("")}
  </div>
    ${!titel.includes("Exen verteilen") ? `
    <button id="overlayCancelBtn"
        style="padding:15px 30px; background:#333; border:none; border-radius:15px; color:white; font-size:1.4rem; margin-top:20px; cursor:pointer; line-height:1.2; padding-top:15px; display:flex; align-items:center; justify-content:center;">
      Abbrechen
    </button>
  ` : ''}
`;
    document.body.appendChild(overlay);

    // Attach Listeners
    overlay.querySelectorAll('.spieler-btn').forEach(btn => {
        btn.onclick = () => {
            const p = btn.dataset.player;
            if (callbackName === 'personFeldGewaehlt') personFeldGewaehlt(p);
            if (callbackName === 'personHoelleGewaehlt') personHoelleGewaehlt(p);
            if (callbackName === 'opferBlauGewaehlt') opferBlauGewaehlt(p);
            if (callbackName === 'personRoterGewaehlt') personRoterGewaehlt(p);
            if (callbackName === 'minispielExenVerteilen') minispielExenVerteilen(p);

            // Hard Mode Callbacks
            if (callbackName === 'paschGewaehlt') window.paschGewaehlt(p);
            if (callbackName === 'tornadoGewaehlt') window.tornadoGewaehlt(p);
            if (callbackName === 'dinoBlauVerteiler') window.dinoBlauVerteiler(p);
            if (callbackName === 'dinoBlauOpfer') window.dinoBlauOpfer(p);
            if (callbackName === 'dinoRotTrinker') window.dinoRotTrinker(p);
            if (callbackName === 'duellVerlierer') window.duellVerlierer(p);
            if (callbackName === 'duell1v3Solo') window.duell1v3Solo(p);
        };
    });

    const cancel = document.getElementById("overlayCancelBtn");
    if (cancel) cancel.onclick = () => document.getElementById('personenOverlay').remove();
}

// Felder vor/zurück
export function felderTrinken() {
    erstellePersonenOverlay("Wer ist vor/zurück gesprungen?", "personFeldGewaehlt");
}

function personFeldGewaehlt(person) {
    document.getElementById("personenOverlay").remove();
    const overlay = document.createElement("div");
    overlay.id = "felderOverlay";
    overlay.style.cssText = `position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.97);
    display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;gap:20px;color:white;`;

    overlay.innerHTML = `
    <h2 style="font-size: 3rem; margin-bottom: 30px;">${person} – Wie viele Felder?</h2>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:15px;max-width:80%;">
      ${[4, 5, 6].map(n =>
        `<button class="felder-btn" data-n="${n}"
            style="padding: 0; padding-bottom: 10px; font-size:2.6rem; background:#ff4757; border:none; border-radius:30px; line-height:1.2; display:flex; align-items:center; justify-content:center; min-width:80px; height:100px;">
            ${n}
         </button>`
    ).join("")}
    </div>
    <button id="felderCancelBtn" 
        style="padding:15px 30px; background:#333; border:none; border-radius:15px; color:white; font-size:1.4rem; margin-top:20px; cursor:pointer; line-height:1.2; padding-top:15px; display:flex; align-items:center; justify-content:center;">
        Abbrechen
    </button>
  `;
    document.body.appendChild(overlay);

    overlay.querySelectorAll('.felder-btn').forEach(btn => {
        btn.onclick = () => {
            const n = parseInt(btn.dataset.n);
            // Only reduce sips in Easy mode
            const sips = (state.difficulty === 'easy') ? (n - 2) : n;
            felderBestaetigt(person, sips);
        };
    });

    document.getElementById("felderCancelBtn").onclick = () => {
        document.getElementById("felderOverlay").remove();
    };
}

function felderBestaetigt(person, anzahl) {
    showDoubleConfirm(person, anzahl);
    document.getElementById("felderOverlay").remove();
}

// Hölle
export function hoelle() {
    erstellePersonenOverlay("Wer ist in die Hölle gefallen?", "personHoelleGewaehlt");
}

function personHoelleGewaehlt(person) {
    document.getElementById("personenOverlay").remove();

    // Scale Difficulty
    let amount = 0;
    let isExen = false;

    if (state.difficulty === 'easy') {
        // 80% just 5 sips, 20% Exen
        if (Math.random() > 0.8) {
            state.trinkCounter[person].exen += 1;
            isExen = true;
        } else {
            amount = 5;
            state.trinkCounter[person].schluecke += amount;
        }
    } else {
        // Medium & Hard: Always Exen
        state.trinkCounter[person].exen += 1;
        isExen = true;
    }

    if (isExen) {
        zeigeMeldung(`<b>${person}</b> fällt in die HÖLLE → <b>EXEN!</b>`);
        addToLog(`${person} fällt in die HÖLLE (Exen)`);
    } else {
        zeigeMeldung(`<b>${person}</b> fällt in die HÖLLE → <b>${amount} Schlücke!</b> (Glück gehabt)`);
        addToLog(`${person} in Hölle: ${amount} Schlücke (Easy Mode)`);
    }

    updateLeaderboard();
    saveToStorage();
}

// Blauer Werfer
export function blauerWerfer() {
    erstellePersonenOverlay("Wen soll's treffen? (Blauer Werfer)", "opferBlauGewaehlt");
}

function opferBlauGewaehlt(opfer) {
    document.getElementById("personenOverlay").remove();

    let isExen = false;
    let amount = 0;

    if (state.difficulty === 'easy') {
        if (Math.random() > 0.8) {
            state.trinkCounter[opfer].exen += 1;
            isExen = true;
        } else {
            amount = 5;
            state.trinkCounter[opfer].schluecke += amount;
        }
    } else {
        state.trinkCounter[opfer].exen += 1;
        isExen = true;
    }

    if (isExen) {
        zeigeMeldung(`<b>${opfer}</b> muss <b>EXEN!</b> (Blauer Werfer)`);
        addToLog(`${opfer} muss EXEN (Blauer Werfer)`);
    } else {
        zeigeMeldung(`<b>${opfer}</b> muss <b>${amount} Schlücke</b> trinken (Blauer Werfer)`);
        addToLog(`${opfer}: ${amount} Schlücke (Blauer Werfer - Easy)`);
    }

    updateLeaderboard();
    saveToStorage();
}

// Roter Werfer
export function roterWerfer() {
    erstellePersonenOverlay("Wer tritt auf roten Werfer?", "personRoterGewaehlt");
}

function personRoterGewaehlt(person) {
    document.getElementById("personenOverlay").remove();

    let isExen = false;
    let amount = 0;

    if (state.difficulty === 'easy') {
        if (Math.random() > 0.8) {
            state.trinkCounter[person].exen += 1;
            isExen = true;
        } else {
            amount = 5;
            state.trinkCounter[person].schluecke += amount;
        }
    } else {
        state.trinkCounter[person].exen += 1;
        isExen = true;
    }

    if (isExen) {
        zeigeMeldung(`<b>${person}</b> tritt auf roten Werfer → <b>SELBER EXEN!</b>`);
        addToLog(`${person} tritt auf roten Werfer (Exen)`);
    } else {
        zeigeMeldung(`<b>${person}</b> tritt auf roten Werfer → <b>${amount} Schlücke!</b>`);
        addToLog(`${person} tritt auf roten Werfer: ${amount} Schlücke (Easy)`);
    }

    updateLeaderboard();
    saveToStorage();
}

// Minispiel
export function minispiel() {
    if (minispielPhase !== 0) return;
    minispielPhase = 1;

    gefahrPlatz = Math.floor(Math.random() * 4) + 1;

    zeigeMeldung(`
    <div style="font-size:4rem">⚠️</div>
    <b>Achtung!</b><br>
    Wer <span style="color:#ff4757;font-size:3rem">${gefahrPlatz}. Platz</span> wird,<br>
    muss eine Kugel ziehen!
  `, 4000);

    setTimeout(() => {
        const overlay = document.createElement("div");
        overlay.id = "minispielOverlay";
        overlay.style.cssText = `position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.97);
      display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;gap:30px;color:white;`;

        // Using data attributes for click handling
        overlay.innerHTML = `
      <h2 style="font-size: 3rem; margin-bottom: 30px;">Wer ist <span style="color:#ff4757;font-size:3rem">${gefahrPlatz}. Platz</span> geworden?</h2>
      <div style="display:flex;gap:20px;flex-wrap:wrap;justify-content:center;max-width:90%;">
        ${state.spieler.map(s =>
            `<button class="spieler-btn" data-person="${s}" style="padding:25px 40px;font-size:2rem; border-radius:30px;">${s}</button>`
        ).join("")}
      </div>
      
      ${state.spieler.length < 4 ? `
      <div style="width:100%; display:flex; justify-content:center; margin-top:20px;">
        <button class="spieler-btn" data-person="BOT" 
                style="padding:25px 40px; font-size:2rem; background: linear-gradient(135deg, #44bd32, #0097e6); color:white; border:none; border-radius:30px; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow: 0 7px #000; max-width: 220px;">
            🤖 BOT
        </button>
      </div>`
                : ""}
    `;
        document.body.appendChild(overlay);

        // Attach listeners
        overlay.querySelectorAll('.spieler-btn').forEach(btn => {
            btn.onclick = () => personGewaehlt(btn.dataset.person);
        });

    }, 3500);
}

function personGewaehlt(person) {
    document.getElementById("minispielOverlay")?.remove();
    minispielPhase = 2;

    if (person === "BOT") {
        zeigeMeldung(`BOT war ${gefahrPlatz}. Platz → Niemand trinkt! 😅`);
        minispielPhase = 0;
        return;
    }

    const overlay = document.getElementById("kugelOverlay");
    const kugel = document.getElementById("kugel");
    const text = document.getElementById("kugelText");

    overlay.style.display = "flex";
    text.innerHTML = `${person} zieht eine Kugel...`;
    kugel.innerHTML = "?";
    kugel.style.animation = "roll 2s infinite linear";

    setTimeout(() => {
        kugel.style.animation = "none";
        kugel.offsetHeight;
        kugel.style.animation = "bounce 0.6s";

        // Logic based on Difficulty
        let kugelInhalt;
        const roll = Math.random();

        if (state.difficulty === 'easy') {
            // Easy: Reduced sips, rare Exen, includes Wheel
            const easyKugeln = ["1 Schluck", "2 Schlücke", "3 Schlücke", "4 Schlücke", "Nichts", "Exen verteilen", "Zufall 0-10 Schlücke"];
            if (roll > 0.95) easyKugeln.push("Exen"); // Very Rare
            kugelInhalt = easyKugeln[Math.floor(Math.random() * easyKugeln.length)];
        } else {
            // Medium & Hard: Standard sips (3-5), Exen, Wheel
            kugelInhalt = kugeln[Math.floor(Math.random() * kugeln.length)];
        }

        if (kugelInhalt === "Exen verteilen") {
            kugel.innerHTML = "↔️";
            text.innerHTML = `${person}<br><span class="kugel-ergebnis">EXEN VERTEILEN!</span>`;

            setTimeout(() => {
                overlay.style.display = "none";

                if (state.spieler.length === 2) {
                    const opfer = state.spieler.find(s => s !== person);
                    state.trinkCounter[opfer].exen += 1;
                    zeigeMeldung(`<b>${person}</b> verteilt → <b>${opfer}</b> muss <b>EXEN!</b>`);
                    updateLeaderboard();
                    saveToStorage();
                } else {
                    erstellePersonenOverlay(
                        `${person} darf Exen verteilen!<br>Wen soll's treffen?`,
                        "minispielExenVerteilen",
                        [person]
                    );
                }
                minispielPhase = 0;
            }, 2500);
            return;
        }

        // Zufall
        if (kugelInhalt.includes("Zufall")) {
            overlay.style.display = "none";
            glückradZiehen(person);
            return;
        }

        if (kugelInhalt === "Exen") {
            kugel.innerHTML = "💀";
            text.innerHTML = `${person}<br><span class="kugel-ergebnis">EXEN!</span>`;
            state.trinkCounter[person].exen += 1;
            addToLog(`${person} zieht Kugel: EXEN!`);
        } else if (kugelInhalt === "Nichts") {
            kugel.innerHTML = "🍀";
            text.innerHTML = `${person}<br><span class="kugel-ergebnis">NICHTS!</span>`;
            addToLog(`${person} zieht Kugel: NICHTS!`);
        } else {
            const schluecke = parseInt(kugelInhalt);
            kugel.innerHTML = `<span style="color: black; font-weight: bold; font-size: 8rem;">${schluecke}</span>`;
            text.innerHTML = `${person}<br><span class="kugel-ergebnis">${schluecke} Schlücke!</span>`;
            state.trinkCounter[person].schluecke += schluecke;
            addToLog(`${person} zieht Kugel: ${schluecke} Schlücke`);
        }

        updateLeaderboard();
        saveToStorage();
        setTimeout(() => {
            overlay.style.display = "none";
            minispielPhase = 0;
        }, 3000);
    }, 2500);
}

function minispielExenVerteilen(opfer) {
    document.getElementById("personenOverlay")?.remove();
    state.trinkCounter[opfer].exen += 1;
    zeigeMeldung(`<b>Verteiler</b> → <b>${opfer}</b> muss <b>EXEN!</b>`);
    updateLeaderboard();
    saveToStorage();
    minispielPhase = 0;
}

function glückradZiehen(person) {
    const radOverlay = document.getElementById("glueckradOverlay");
    const rad = document.getElementById("glueckrad");
    const radText = document.getElementById("radText");
    const endZahlDiv = document.getElementById("endZahl");

    radOverlay.style.display = "flex";
    radText.innerHTML = `${person} dreht das Glücksrad...`;
    endZahlDiv.style.display = "none";

    // Zufällige Reihenfolge der Zahlen 0–10
    const zahlen = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    for (let i = zahlen.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [zahlen[i], zahlen[j]] = [zahlen[j], zahlen[i]];
    }

    // Labels neu befüllen
    document.querySelectorAll(".label").forEach((label, i) => {
        label.textContent = zahlen[i];
        label.style.setProperty("--i", i);
    });

    // Zufällige Gewinnerzahl + Drehung
    const endZahl = Math.floor(Math.random() * 11);
    const endIndex = zahlen.indexOf(endZahl);

    const extraUmdrehungen = Math.floor(Math.random() * 8) + 5;
    const extraZeit = Math.random() * 2 + 4.5;
    const sector = 360 / 11;
    const targetRotation = extraUmdrehungen * 360 + (10 - endIndex) * sector + (sector / 2);

    rad.style.animation = 'none';
    rad.style.transform = 'rotate(0deg)';
    rad.offsetHeight;

    requestAnimationFrame(() => {
        rad.style.transition = `transform ${extraZeit}s cubic-bezier(0.17, 0.67, 0.12, 0.99)`;
        rad.style.transform = `rotate(${targetRotation}deg)`;
    });

    setTimeout(() => {
        endZahlDiv.innerHTML = endZahl;
        endZahlDiv.style.display = "block";
        radText.innerHTML = `<span class="rad-ergebnis">${endZahl} Schlücke!</span>`;

        state.trinkCounter[person].schluecke += endZahl;
        addToLog(`${person} dreht Rad: ${endZahl} Schlücke`);
        updateLeaderboard();
        saveToStorage();

        setTimeout(() => {
            radOverlay.style.display = "none";
            minispielPhase = 0;
        }, 3000);
    }, extraZeit * 1000);
}

// Double or Nothing Functions
function showDoubleOrNothing(person, anzahl) {
    currentDoublePerson = person;
    currentDoubleAnzahl = anzahl;
    document.getElementById("doubleOverlay").style.display = "flex";
    document.getElementById("doubleResult").textContent = "";
    flipCoin();
}

function showDoubleConfirm(person, anzahl) {
    currentDoublePerson = person;
    currentDoubleAnzahl = anzahl;
    document.getElementById("confirmAnzahl").textContent = anzahl;
    document.getElementById("doubleConfirmOverlay").style.display = "flex";
}

export function confirmDouble() {
    document.getElementById("doubleConfirmOverlay").style.display = "none";
    showDoubleOrNothing(currentDoublePerson, currentDoubleAnzahl);
}

export function cancelDouble() {
    document.getElementById("doubleConfirmOverlay").style.display = "none";
    state.trinkCounter[currentDoublePerson].schluecke += currentDoubleAnzahl;
    addToLog(`${currentDoublePerson} nimmt ${currentDoubleAnzahl} Schlücke (Sicher)`);
    updateLeaderboard();
    saveToStorage();
    zeigeMeldung(`<b>${currentDoublePerson}</b> nimmt sicher <b>${currentDoubleAnzahl} Schlücke</b>!`);
}

function flipCoin() {
    const coin = document.getElementById("coin");
    const result = document.getElementById("doubleResult");

    result.innerHTML = "";

    // Transition kurz ausschalten & Reset
    coin.style.transition = "none";
    coin.style.transform = "rotateY(0deg)";

    // Reflow erzwingen
    coin.offsetHeight;

    // Jetzt Transition + Drehung starten
    const isDouble = Math.random() < 0.5;

    coin.style.transition = "transform 4.5s ease-in-out";
    coin.style.transform = `rotateY(${isDouble ? 2160 : 2340}deg)`;
    // Ergebnis nach 4,5s
    setTimeout(() => {
        let schluecke = isDouble ? currentDoubleAnzahl * 2 : 0;
        let text = isDouble
            ? `DOUBLE! +${schluecke} Schlücke!`
            : `NOTHING! 0 Schlücke`;

        result.innerHTML = `<span style="color:${isDouble ? '#ffd700' : '#ff4757'}">${text}</span>`;

        state.trinkCounter[currentDoublePerson].schluecke += schluecke;

        if (isDouble) {
            addToLog(`${currentDoublePerson}: DOUBLE! (${schluecke} Schlücke)`);
        } else {
            addToLog(`${currentDoublePerson}: NOTHING! (Glück gehabt)`);
        }

        updateLeaderboard();
        saveToStorage();

        if (isDouble) {
            launchConfetti();
        }

        setTimeout(() => {
            zeigeMeldung(`<b>${currentDoublePerson}</b> muss <b>${schluecke} Schlücke</b> trinken!`);
            setTimeout(() => {
                document.getElementById("doubleOverlay").style.display = "none";
            }, 1000);
        }, 1200);
    }, 4500);
}

function launchConfetti() {
    const canvas = document.getElementById("confettiCanvas");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ["#ffd700", "#ffaa00", "#006400", "#ff4757", "#00d2d3", "#ffa502"];

    for (let i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            r: Math.random() * 6 + 2,
            d: Math.random() * 150 + 50,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.random() * 10 - 5,
            tiltAngle: 0,
            tiltAngleIncremental: Math.random() * 0.07 + 0.05
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p, i) => {
            p.tiltAngle += p.tiltAngleIncremental;
            p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
            p.tilt = Math.sin(p.tiltAngle) * 12;

            if (p.y > canvas.height) particles.splice(i, 1);

            ctx.beginPath();
            ctx.lineWidth = p.r;
            ctx.strokeStyle = p.color;
            ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
            ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
            ctx.stroke();
        });

        if (particles.length > 0) requestAnimationFrame(draw);
        else canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    }

    draw();
}

/* =========================================
   HARD MODE FEATURES
   ========================================= */

// 1. 3er Pasch (Instant Exen)
export function pasch() {
    erstellePersonenOverlay("Wer hat einen 3er Pasch gewürfelt?", "paschGewaehlt");
}

window.paschGewaehlt = (person) => {
    document.getElementById("personenOverlay").remove();
    state.trinkCounter[person].exen += 1;
    zeigeMeldung(`<b>${person}</b> hat 3er Pasch → <b>EXEN!</b>`);
    addToLog(`${person}: 3er Pasch (Exen)`);
    updateLeaderboard();
    saveToStorage();
};

// 2. Tornado (4, 5, 6 Felder -> Double)
export function tornado() {
    erstellePersonenOverlay("Wen hat der Tornado erwischt?", "tornadoGewaehlt");
}

window.tornadoGewaehlt = (person) => {
    document.getElementById("personenOverlay").remove();

    // Custom Overlay selection for 4, 5, 6
    const overlay = document.createElement("div");
    overlay.id = "tornadoOverlay";
    overlay.style.cssText = `position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.97);
    display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;gap:20px;color:white;`;

    overlay.innerHTML = `
    <h2 style="font-size: 3rem; margin-bottom: 25px; color:#0984e3; text-shadow:2px 2px #000;">🌪️ Tornado: ${person}</h2>
    <h3 style="margin-bottom:20px; font-size: 2.5rem;">Wähle die Felder-Anzahl:</h3>
    <div style="display:flex; gap:25px;">
      ${[4, 5, 6].map(n =>
        `<button class="tornado-btn" data-n="${n}"
            style="padding:0; padding-top:5px; font-size:2.5rem; background:#0984e3; color:white; border:none; border-radius:30px; line-height:1;width:100px; height:100px; box-shadow:0 8px #000; display:flex; align-items:center; justify-content:center;">
            ${n}
         </button>`
    ).join("")}
    </div>
    <button onclick="document.getElementById('tornadoOverlay').remove()" 
        style="padding:0px 30px 30px 30px; background:#333; border-radius:15px; border:none; color:white; margin-top:30px; font-size:1.3rem;">Abbrechen</button>
  `;
    document.body.appendChild(overlay);

    overlay.querySelectorAll('.tornado-btn').forEach(btn => {
        btn.onclick = () => {
            document.getElementById("tornadoOverlay").remove();
            showDoubleConfirm(person, parseInt(btn.dataset.n));
        };
    });
};

// 3. Dino Button (Blau vs Rot)
export function dino() {
    const overlay = document.createElement("div");
    overlay.id = "dinoOverlay";
    overlay.style.cssText = `position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.97);
    display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;gap:30px;color:white;`;

    overlay.innerHTML = `
    <h2 style="font-size: 3.5rem; margin-bottom: 20px; text-shadow:3px 3px #000;">🦖 Welcher Dino?</h2>
    <div style="display:flex; gap:40px; flex-wrap:wrap; justify-content:center;">
        <button id="dinoBlau" style="padding:15px; min-height:100px; font-size:2rem; background:#0984e3; color:white; border:none; border-radius:20px; box-shadow:0 10px #000; min-width:250px; display:flex; flex-direction:column; align-items:center; justify-content:center; line-height:1.2;">
            🦅 Pterodactylus<br><span style="font-size:1rem; margin-top:5px;">(10 Verteilen)</span>
        </button>
        <button id="dinoRot" style="padding:15px; min-height:100px; font-size:2rem; background:#d63031; color:white; border:none; border-radius:20px; box-shadow:0 10px #000; min-width:250px; display:flex; flex-direction:column; align-items:center; justify-content:center; line-height:1.2;">
            🦖 T-Rex<br><span style="font-size:1rem; margin-top:5px;">(10 Trinken)</span>
        </button>
    </div>
    <button onclick="document.getElementById('dinoOverlay').remove()" style="margin-top:20px; background:#333; padding:0px 30px 30px 30px; border-radius:15px; border:none; color:white; font-size: 1.3rem;">Abbrechen</button>
    `;
    document.body.appendChild(overlay);

    document.getElementById("dinoBlau").onclick = () => {
        document.getElementById("dinoOverlay").remove();
        erstellePersonenOverlay("Wer ist der Pterodactylus (Verteiler)?", "dinoBlauVerteiler");
    };

    document.getElementById("dinoRot").onclick = () => {
        document.getElementById("dinoOverlay").remove();
        erstellePersonenOverlay("Wer ist der T-Rex (Trinker)?", "dinoRotTrinker");
    };
}

window.dinoBlauVerteiler = (verteiler) => {
    document.getElementById("personenOverlay").remove();
    // Now select victim
    erstellePersonenOverlay(`${verteiler} verteilt 10 Schlücke an...`, "dinoBlauOpfer", [verteiler]);
    window.tempVerteiler = verteiler;
};

window.dinoBlauOpfer = (opfer) => {
    document.getElementById("personenOverlay").remove();
    const verteiler = window.tempVerteiler;
    state.trinkCounter[opfer].schluecke += 10;
    zeigeMeldung(`<b>${verteiler}</b> verteilt 10 an <b>${opfer}</b>! 🦖`);
    addToLog(`${verteiler} verteilt 10 Schlücke an ${opfer} (Dino)`);
    updateLeaderboard();
    saveToStorage();
};

window.dinoRotTrinker = (trinker) => {
    document.getElementById("personenOverlay").remove();
    // Offer Double or Nothing for 10
    showDoubleConfirm(trinker, 10);
};


// 4. 1 vs 1 (Verlierer Chance)
export function duell1v1() {
    erstellePersonenOverlay("Wer hat das Duell verloren?", "duellVerlierer");
}

window.duellVerlierer = (verlierer) => {
    document.getElementById("personenOverlay").remove();
    personGewaehlt(verlierer); // Reuse Minigame Logic directly!
    // NOTE: personGewaehlt handles the ball draw animation and result logic.
};


// 5. 1 vs 3 
export function duell1v3() {
    erstellePersonenOverlay("Wer war der Einzelspieler?", "duell1v3Solo");
}

window.duell1v3Solo = (soloPlayer) => {
    document.getElementById("personenOverlay").remove();
    window.tempSolo = soloPlayer;

    // Who won?
    const overlay = document.createElement("div");
    overlay.id = "winnerCheckOverlay";
    overlay.style.cssText = `position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.97);
    display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;gap:30px;color:white;`;

    overlay.innerHTML = `
      <h2 style="font-size:2.5rem;">Wer hat gewonnen?</h2>
      <div style="display:flex; gap:20px; justify-content:center;">
        <button id="winSolo" style="padding:15px; min-height:120px; font-size:1.8rem; background:linear-gradient(135deg, #ff9f43, #ee5253); color:white; border-radius:20px; border:none; width:220px; display:flex; align-items:center; justify-content:center; box-shadow: 0 4px 15px rgba(238, 82, 83, 0.4);">Einzelspieler (${soloPlayer})</button>
        <button id="winTeam" style="padding:15px; min-height:120px; font-size:1.8rem; background:linear-gradient(135deg, #48dbfb, #2e86de); color:white; border-radius:20px; border:none; width:220px; display:flex; align-items:center; justify-content:center; box-shadow: 0 4px 15px rgba(46, 134, 222, 0.4);">Das Team</button>
      </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById("winSolo").onclick = () => {
        // Solo won -> Team lost -> Team draws
        document.getElementById("winnerCheckOverlay").remove();
        triggerTeamLoss(soloPlayer);
    };

    document.getElementById("winTeam").onclick = () => {
        // Team won -> Solo lost -> Solo draws
        document.getElementById("winnerCheckOverlay").remove();
        personGewaehlt(soloPlayer);
    };
};

function triggerTeamLoss(winnerSolo) {
    const losers = state.spieler.filter(s => s !== winnerSolo);

    // Animate for the first loser, then apply to all
    const overlay = document.getElementById("kugelOverlay");
    const kugel = document.getElementById("kugel");
    const text = document.getElementById("kugelText");

    overlay.style.display = "flex";
    text.innerHTML = `Das Team zieht eine Strafe...`;
    kugel.innerHTML = "?";
    kugel.style.animation = "roll 2s infinite linear";

    setTimeout(() => {
        kugel.style.animation = "none";
        kugel.offsetHeight;
        kugel.style.animation = "bounce 0.6s";

        // Filter out "Exen Verteil" as requested for 1v3 team penalty
        let availableKugeln = kugeln.filter(k => k !== "Exen verteilen");
        if (state.difficulty === 'hard') {
            availableKugeln = ["5 Schlücke", "6 Schlücke", "7 Schlücke", "8 Schlücke", "Exen", "Nichts"];
        }

        const kugelInhalt = availableKugeln[Math.floor(Math.random() * availableKugeln.length)];
        let logMsg = "";

        if (kugelInhalt === "Exen") {
            kugel.innerHTML = "💀";
            text.innerHTML = `Team<br><span class="kugel-ergebnis">ALLE EXEN!</span>`;
            losers.forEach(l => {
                state.trinkCounter[l].exen += 1;
            });
            logMsg = `Team (${losers.join(", ")}): ALLE EXEN!`;
        } else if (kugelInhalt === "Nichts") {
            kugel.innerHTML = "🍀";
            text.innerHTML = `Team<br><span class="kugel-ergebnis">NICHTS!</span>`;
            logMsg = `Team: Nichts passiert.`;
        } else {
            const schluecke = parseInt(kugelInhalt);
            kugel.innerHTML = `<span style="color: black; font-weight: bold; font-size: 8rem;">${schluecke}</span>`;
            text.innerHTML = `Team<br><span class="kugel-ergebnis">Jeder ${schluecke} Schlücke!</span>`;
            losers.forEach(l => {
                state.trinkCounter[l].schluecke += schluecke;
            });
            logMsg = `Team: Jeder ${schluecke} Schlücke`;
        }

        addToLog(logMsg);
        updateLeaderboard();
        saveToStorage();

        setTimeout(() => {
            overlay.style.display = "none";
        }, 3500);

    }, 2500);
}

// Attach global helpers for overlays
// Note: We used window.* assignments above for compatibility with onclick string generation
// Ideally we would rewrite overlays to use addEventListener, but for consistency with existing codebase structure we keep it mixed.

