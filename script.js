let spieler = [];
let trinkCounter = {};
let aktuellerIndex = 0;
let gefahrPlatz = 0;          // der Platz, der die Kugel ziehen muss
let minispielLäuft = false;   // verhindert doppelklicks

const kugeln = [
  "4 Schlücke","4 Schlücke","4 Schlücke",
  "5 Schlücke","5 Schlücke",
  "Exen","Exen",
  "Exen verteilen",
  "Nichts","Nichts",
  "Zufall 0-10 Schlücke"
];

// === Setup bleibt gleich ===
function spielerHinzufuegen() {
  const input = document.getElementById("neuerSpieler");
  const name = input.value.trim();
  if (name && spieler.length < 4 && !spieler.includes(name)) {
    spieler.push(name);
    trinkCounter[name] = 0;
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

// === Spielerwahl + Tracker ===
function setAktuellerSpieler(index) {
  aktuellerIndex = index;
  updateTracker();
  renderSpielerButtons();
}

function renderSpielerButtons() {
  const container = document.getElementById("spielerButtons");
  container.innerHTML = spieler.map((s, i) =>
    `<button class="spieler-btn ${i === aktuellerIndex ? 'active' : ''}" onclick="setAktuellerSpieler(${i})">
      ${s}
    </button>`
  ).join("");
}

function updateTracker() {
  document.getElementById("trinkStand").innerHTML =
    spieler.map((s, i) => `<div ${i === aktuellerIndex ? 'class="aktuell"' : ''}>
      ${i === aktuellerIndex ? '➤ ' : ''}<b>${s}</b>: ${trinkCounter[s]} Schlücke
    </div>`).join("");
}

// === Meldung ===
function zeigeMeldung(html) {
  const div = document.createElement("div");
  div.className = "meldung";
  div.innerHTML = html;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 4000);
}

// === Normale Events (unverändert) ===
function felderTrinken() { /* ... bleibt wie vorher ... */ }
function hoelle() { /* ... bleibt wie vorher ... */ }
function blauerWerfer() { /* ... bleibt wie vorher ... */ }
function roterWerfer() { /* ... bleibt wie vorher ... */ }
// (die vier Funktionen von oben einfach drinlassen – ich kürze hier nur)

function felderTrinken() {
  const name = spieler[aktuellerIndex];
  const eingabe = prompt(`${name} – wie viele Felder vor oder zurück?`, "3");
  if (!eingabe) return;
  const n = parseInt(eingabe);
  if (n > 0) {
    trinkCounter[name] += n;
    zeigeMeldung(`<b>${name}</b> trinkt <b>${n} Schlücke</b>!`);
    updateTracker();
  }
}

function hoelle() {
  const name = spieler[aktuellerIndex];
  trinkCounter[name] += 10;
  zeigeMeldung(`<b>${name}</b> fällt in die HÖLLE → <b>EXEN!</b>`);
  updateTracker();
}

function blauerWerfer() {
  const verteiler = spieler[aktuellerIndex];
  const opfer = prompt(`${verteiler} darf Exen verteilen!\nAn wen?`, "");
  const gefunden = spieler.find(s => s.toLowerCase() === opfer?.trim().toLowerCase());
  if (gefunden) {
    trinkCounter[gefunden] += 10;
    zeigeMeldung(`<b>${verteiler}</b> → <b>${gefunden}</b> muss <b>EXEN!</b>`);
    updateTracker();
  }
}

function roterWerfer() {
  const name = spieler[aktuellerIndex];
  trinkCounter[name] += 10;
  zeigeMeldung(`<b>${name}</b> tritt auf roten Werfer → <b>SELBER EXEN!</b>`);
  updateTracker();
}

// ==================== NEUES MINISPIEL – EXAKT WIE IHR ES SPIELT ====================
function minispiel() {
  if (minispielLäuft) return;
  minispielLäuft = true;

  // 1. Zufälliger Gefahrenplatz 1–4
  gefahrPlatz = Math.floor(Math.random() * 4) + 1;

  zeigeMeldung(`
    <div style="font-size:3rem">⚠️</div>
    <b>Achtung!</b><br>
    Wer <span style="color:#ff4757;font-size:2.5rem">${gefahrPlatz}. Platz</span> wird,<br>
    muss eine Kugel ziehen!
  `);

  // 2. Buttons erscheinen: Wer war auf diesem Platz?
  const overlay = document.createElement("div");
  overlay.id = "platzOverlay";
  overlay.style.cssText = `
    position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.97);
    display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;
    gap:20px;font-size:2rem;color:white;
  `;

  overlay.innerHTML = `
    <h2>Wer ist ${gefahrPlatz}. geworden?</h2>
    <div style="display:flex;gap:15px;flex-wrap:wrap;justify-content:center;">
      ${spieler.map((s,i) => 
        `<button class="spieler-btn" style="padding:20px 30px;font-size:1.8rem;" onclick="kugelZiehen('${s}')">${s}</button>`
      ).join("")}
      ${spieler.length < 4 ? `<button class="spieler-btn" style="padding:20px 30px;font-size:1.8rem;background:#444;" onclick="kugelZiehen('BOT')">BOT</button>` : ""}
    </div>
  `;

  document.body.appendChild(overlay);
}

function kugelZiehen(person) {
  document.getElementById("platzOverlay")?.remove();
  if (person === "BOT") {
    zeigeMeldung("BOT war Platz " + gefahrPlatz + " → Keiner trinkt! 😅");
    minispielLäuft = false;
    return;
  }

  // Echte Kugel-Animation für echte Spieler
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
      setTimeout(() => { overlay.style.display = "none"; blauerWerfer(); }, 2500);
    } else if (kugelInhalt.includes("Zufall")) {
      schluecke = Math.floor(Math.random() * 11);
      kugel.innerHTML = schluecke;
      text.innerHTML = `${person}<br><span class="kugel-ergebnis">${schluecke} Schlücke!</span>`;
      trinkCounter[person] += schluecke;
    } else if (kugelInhalt === "Exen") {
      schluecke = 10;
      kugel.innerHTML = "EXEN";
      text.innerHTML = `${person}<br><span class="kugel-ergebnis">EXEN!</span>`;
      trinkCounter[person] += 10;
    } else if (kugelInhalt === "Nichts") {
      kugel.innerHTML = "NICHTS";
      text.innerHTML = `${person}<br><span class="kugel-ergebnis">NICHTS!</span>`;
    } else {
      schluecke = parseInt(kugelInhalt);
      kugel.innerHTML = schluecke;
      text.innerHTML = `${person}<br><span class="kugel-ergebnis">${kugelInhalt}</span>`;
      trinkCounter[person] += schluecke;
    }

    updateTracker();
    setTimeout(() => { overlay.style.display = "none"; minispielLäuft = false; }, 3000);
  }, 2500);
}
