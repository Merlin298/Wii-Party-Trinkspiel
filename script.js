let spieler = [];
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

// Setup (fix: korrekter Init für trinkCounter)
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

// Spieler-Auswahl (fix: active wechselt korrekt)
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

// Tracker (Schlücke + Exen separat)
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
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:15px;max-width:80%;">
      ${[4,5,6,7].map(n => 
        `<button onclick="felderBestaetigt(${n}, this)" 
                 style="padding:20px;font-size:2rem;background:#ff4757;border:none;border-radius:15px;">
          ${n}
        </button>`
      ).join("")}
    </div>
    <button onclick="this.closest('div').remove()" 
            style="margin-top:20px;padding:15px 30px;background:#333;">Abbrechen</button>
  `;
  document.body.appendChild(overlay);
}

function felderBestaetigt(anzahl, btn) {
  const name = spieler[aktuellerIndex];
  trinkCounter[name].schluecke += anzahl;
  zeigeMeldung(`<b>${name}</b> trinkt <b>${anzahl} Schlücke</b>!`);
  updateTracker();
  btn.closest("div").remove(); // Overlay sofort schließen
}

// Hölle
function hoelle() {
  const name = spieler[aktuellerIndex];
  trinkCounter[name].exen += 1;
  zeigeMeldung(`<b>${name}</b> fällt in die HÖLLE → <b>EXEN!</b>`);
  updateTracker();
}

// Blauer Bimbo
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

// Roter Bimbo
function roterWerfer() {
  const name = spieler[aktuellerIndex];
  trinkCounter[name].exen += 1;
  zeigeMeldung(`<b>${name}</b> tritt auf roten Werfer → <b>SELBER EXEN!</b>`);
  updateTracker();
}

// Minispiel (fix: Reihenfolge Achtung! → Wer? → Kugel)
function minispiel() {
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
    overlay.innerHTML = `
      <h2>Wer ist ${gefahrPlatz}. geworden?</h2>
      <div style="display:flex;gap:20px;flex-wrap:wrap;justify-content:center;max-width:90%;">
        ${spieler.map(s => 
          `<button class="spieler-btn" style="padding:25px 40px;font-size:2rem;" onclick="personGewaehlt('${s}')">${s}</button>`
        ).join("")}
        ${spieler.length < 4 ? `<button class="spieler-btn" style="padding:25px 40px;font-size:2rem;background:#444;" onclick="personGewaehlt('BOT')">BOT</button>` : ""}
      </div>
    `;
    document.body.appendChild(overlay);
  }, 3500); // nach der Meldung
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

   /* if(kugelInhalt == "Zufall 0-10 Schlücke"){
      
      
    }*/

    updateTracker();
    setTimeout(() => { overlay.style.display = "none"; minispielPhase = 0; }, 3000);
  }, 2500);
}
