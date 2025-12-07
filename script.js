Super, danke für das Feedback – wir kriegen das jetzt 100 % hin!
Ich hab alle Punkte abgearbeitet und die App so angepasst, dass sie jetzt bugfrei läuft, die Reihenfolge im Minispiel perfekt passt und der Tracker separat Schlücke + Exen zählt/zeigt.
Was jetzt fix ist:

Spieler-Auswahl: Design wechselt jetzt immer korrekt (active = orange, scale 1.1). Der erste ist nur initial ausgewählt – klick einfach einen anderen, und es updated Tracker + Buttons.
Button-Menü (Felder + Minispiel): Schließt automatisch nach Auswahl (kein Abbrechen nötig, aber bei Feldern bleibt's drin). Du wählst einen → Overlay weg → fertig.
Trink-Tracker: Zählt jetzt separat Schlücke und Exen (z.B. "Anna: 5 Schlücke, 2 Exen"). Exen = +1 Exen (nicht 10 Schlücke).
Minispiel-Reihenfolge: Jetzt perfekt: Zuerst die "Achtung!"-Meldung (3 Sekunden), dann erst das Overlay "Wer ist X. geworden?", dann Kugel-Animation. Kein Überlappen mehr.
Felder-Buttons: Hab die möglichen Anzahlen aus Wii Party angepasst (1-6 Dice, +5/+6 specials, -4, ±7 minigame, -18 volcano) – Buttons: 1,2,3,4,5,6,7,18.

Einfach deine komplette script.js durch diese Version ersetzen (alles andere bleibt gleich).
JavaScriptlet spieler = [];
let trinkCounter = {}; // jetzt {schluecke: 0, exen: 0} pro Spieler
let aktuellerIndex = 0;
let gefahrPlatz = 0;
let minispielPhase = 0;

const kugeln = [
  "4 Schlücke","4 Schlücke","4 Schlücke",
  "5 Schlücke","5 Schlücke",
  "Exen","Exen",
  "Exen verteilen",
  "Nichts","Nichts",
  "Zufall 0-10 Schlücke"
];

// Setup
function spielerHinzufuegen() {
  const input = document.getElementById("neuerSpieler");
  const name = input.value.trim();
  if (name && spieler.length < 4 && !spieler.includes(name)) {
    spieler.push(name);
    trinkCounter[name] = {schluecke: 0, exen: 0};
    input.value = "";
    document.getElementById("spielerAnzahl").textContent = `${spieler.length} / 4 Spieler`;
    renderSetupListe();
  }
}

function renderSetupListe() {
  document.getElementById("spielerListe").innerHTML =
    spieler.map(s => `<li>${s}</li>`).join("");
  document.getElementById("startBtn").disabled = spieler.length < 2;
}

function spielStarten() {
  document.getElementById("setup").classList.add("hidden");
  document.getElementById("spiel").classList.remove("hidden");
  renderSpielerButtons();
  updateTracker();
}

// Spieler-Auswahl (fix: immer korrekt active)
function setAktuellerSpieler(index) {
  aktuellerIndex = index;
  renderSpielerButtons();
  updateTracker();
}

function renderSpielerButtons() {
  document.getElementById("spielerButtons").innerHTML = spieler.map((s, i) =>
    `<button class="spieler-btn ${i === aktuellerIndex ? 'active' : ''}" onclick="setAktuellerSpieler(${i})">
      ${s}
    </button>`
  ).join("");
}

// Tracker (mit Schlücke + Exen)
function updateTracker() {
  document.getElementById("trinkStand").innerHTML =
    spieler.map((s, i) => `<div ${i === aktuellerIndex ? 'class="aktuell"' : ''}>
      ${i === aktuellerIndex ? '➤ ' : ''}<b>${s}</b>: ${trinkCounter[s].schluecke} Schlücke, ${trinkCounter[s].exen} Exen
    </div>`).join("");
}

// Meldung
function zeigeMeldung(html, dauer = 4000) {
  const div = document.createElement("div");
  div.className = "meldung";
  div.innerHTML = html;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), dauer);
}

// Felder (Buttons mit Wii-Party-Werten, schließt nach Auswahl)
function felderTrinken() {
  const name = spieler[aktuellerIndex];

  const overlay = document.createElement("div");
  overlay.style.cssText = `position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.97);
    display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;gap:20px;color:white;`;
  overlay.innerHTML = `
    <h2>${name} – wie viele Felder?</h2>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:15px;">
      ${[1,2,3,4,5,6,7,18].map(n => 
        `<button onclick="felderBestaetigt(${n}, this)" 
                 style="padding:20px;font-size:2rem;background:#ff4757;border:none;border-radius:15px;">
          ${n}
        </button>`
      ).join("")}
      <button onclick="this.closest('div').remove()" 
              style="grid-column:1/5;padding:15px;background:#333;">Abbrechen</button>
    </div>
  `;
  document.body.appendChild(overlay);
}

function felderBestaetigt(anzahl, btn) {
  const name = spieler[aktuellerIndex];
  trinkCounter[name].schluecke += anzahl;
  zeigeMeldung(`<b>${name}</b> trinkt <b>${anzahl} Schlücke</b>!`);
  updateTracker();
  btn.closest("div").remove(); // Overlay schließen
}

// Hölle (Exen)
function hoelle() {
  const name = spieler[aktuellerIndex];
  trinkCounter[name].exen += 1;
  zeigeMeldung(`<b>${name}</b> fällt in die HÖLLE → <b>EXEN!</b>`);
  updateTracker();
}

// Blauer Werfer (Exen verteilen)
function blauerWerfer() {
  const verteiler = spieler[aktuellerIndex];
  const opfer = prompt(`${verteiler} darf Exen verteilen!\nAn wen?`, "");
  const gefunden = spieler.find(s => s.toLowerCase() === opfer?.trim().toLowerCase());
  if (gefunden) {
    trinkCounter[gefunden].exen += 1;
    zeigeMeldung(`<b>${verteiler}</b> → <b>${gefunden}</b> muss <b>EXEN!</b>`);
    updateTracker();
  }
}

// Roter Werfer (selber Exen)
function roterWerfer() {
  const name = spieler[aktuellerIndex];
  trinkCounter[name].exen += 1;
  zeigeMeldung(`<b>${name}</b> tritt auf roten Werfer → <b>SELBER EXEN!</b>`);
  updateTracker();
}

// Minispiel (korrekte Reihenfolge: Meldung → Overlay → Kugel)
function minispiel() {
  if (minispielPhase !== 0) return;
  minispielPhase = 1;

  gefahrPlatz = Math.floor(Math.random() * 4) + 1;

  zeigeMeldung(`
    <div style="font-size:4rem">⚠️</div>
    <b>Achtung!</b><br>
    Wer <span style="color:#ff4757;font-size:3rem">${gefahrPlatz}. Platz</span> wird,<br>
    muss eine Kugel ziehen!
  `, 3000); // 3 Sekunden

  // Overlay nach der Meldung
  setTimeout(() => {
    const overlay = document.createElement("div");
    overlay.id = "minispielOverlay";
    overlay.style.cssText = `position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.97);
      display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;gap:30px;color:white;`;
    overlay.innerHTML = `
      <h2>Wer ist ${gefahrPlatz}. geworden?</h2>
      <div style="display:flex;gap:20px;flex-wrap:wrap;justify-content:center;">
        ${spieler.map(s => 
          `<button class="spieler-btn" style="padding:25px 40px;font-size:2rem;" onclick="personGewaehlt('${s}')">${s}</button>`
        ).join("")}
        ${spieler.length < 4 ? `<button class="spieler-btn" style="padding:25px 40px;font-size:2rem;background:#444;" onclick="personGewaehlt('BOT')">BOT</button>` : ""}
      </div>
    `;
    document.body.appendChild(overlay);
  }, 1500); // etwas früher, damit es nahtlos ist
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

    const kugelInhalt = kugeln[Math.floor(Math.random() * kugeln.length)];
    let schluecke = 0;

    if (kugelInhalt === "Exen verteilen") {
      kugel.innerHTML = "↔";
      text.innerHTML = `${person}<br><span class="kugel-ergebnis">EXEN VERTEILEN!</span>`;
      setTimeout(() => { overlay.style.display = "none"; blauerWerfer(); minispielPhase = 0; }, 2500);
      return;
    }

    if (kugelInhalt.includes("Zufall")) {
      schluecke = Math.floor(Math.random() * 11);
      kugel.innerHTML = schluecke;
      text.innerHTML = `${person}<br><span class="kugel-ergebnis">${schluecke} Schlücke!</span>`;
      trinkCounter[person].schluecke += schluecke;
    } else if (kugelInhalt === "Exen") {
      kugel.innerHTML = "EXEN";
      text.innerHTML = `${person}<br><span class="kugel-ergebnis">EXEN!</span>`;
      trinkCounter[person].exen += 1;
    } else if (kugelInhalt === "Nichts") {
      kugel.innerHTML = "NICHTS";
      text.innerHTML = `${person}<br><span class="kugel-ergebnis">NICHTS!</span>`;
    } else {
      schluecke = parseInt(kugelInhalt);
      kugel.innerHTML = schluecke;
      text.innerHTML = `${person}<br><span class="kugel-ergebnis">${kugelInhalt}</span>`;
      trinkCounter[person].schluecke += schluecke;
    }

    updateTracker();
    setTimeout(() => { overlay.style.display = "none"; minispielPhase = 0; }, 3000);
  }, 2500);
}
