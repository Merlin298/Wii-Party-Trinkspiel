let spieler = [];
let trinkCounter = {};
let aktuellerIndex = 0;
let gefahrPlatz = 0;
let minispielPhase = 0; // 0 = noch nicht gestartet, 1 = Platz gelost, 2 = Person gewählt

const kugeln = [
  "4 Schlücke","4 Schlücke","4 Schlücke",
  "5 Schlücke","5 Schlücke",
  "Exen","Exen",
  "Exen verteilen",
  "Nichts","Nichts",
  "Zufall 0-10 Schlücke"
];

// === Setup & Spielerwahl bleibt gleich wie vorher ===
// (die Funktionen spielerHinzufuegen, renderSetupListe, spielStarten, setAktuellerSpieler, renderSpielerButtons, updateTracker – einfach drinlassen)

function zeigeMeldung(html, dauer = 4000) {
  const div = document.createElement("div");
  div.className = "meldung";
  div.innerHTML = html;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), dauer);
}

// === FELDER – jetzt mit echten Wii-Party-Buttons ===
function felderTrinken() {
  const name = spieler[aktuellerIndex];

  const overlay = document.createElement("div");
  overlay.style.cssText = `position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.97);
    display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;gap:20px;color:white;`;
  overlay.innerHTML = `
    <h2>${name} – wie viele Felder?</h2>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:15px;">
      ${[1,2,3,4,5,6,7,8,10,12].map(n => 
        `<button onclick="felderBestaetigt(${n}, this)" 
                 style="padding:20px;font-size:2rem;background:#ff4757;border:none;border-radius:15px;">
          ${n === 10 ? '10' : n}
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
  trinkCounter[name] += anzahl;
  zeigeMeldung(`<b>${name}</b> trinkt <b>${anzahl} Schlücke</b>!`);
  updateTracker();
  btn.closest("div").remove();
}

// === Die vier normalen Events (unverändert) ===
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

// ==================== MINISPIEL – JETZT 100 % RICHTIGE REIHENFOLGE ====================
function minispiel() {
  if (minispielPhase !== 0) return;
  minispielPhase = 1;

  // 1. Zuerst Platz losen
  gefahrPlatz = Math.floor(Math.random() * 4) + 1;

  zeigeMeldung(`
    <div style="font-size:4rem">⚠️</div>
    <b>Achtung!</b><br>
    Wer <span style="color:#ff4757;font-size:3rem">${gefahrPlatz}. Platz</span> wird,<br>
    muss eine Kugel ziehen!
  `, 5000);

  // 2. Buttons: Wer war’s?
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
}

function personGewaehlt(person) {
  document.getElementById("minispielOverlay")?.remove();
  minispielPhase = 2;

  if (person === "BOT") {
    zeigeMeldung(`BOT war ${gefahrPlatz}. Platz → Niemand trinkt! 😅`);
    minispielPhase = 0;
    return;
  }

  // 3. Jetzt erst die Kugelanimation!
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
    } else if (kugelInhalt === "Exen") {
      schluecke = 10;
      kugel.innerHTML = "EXEN";
      text.innerHTML = `${person}<br><span class="kugel-ergebnis">EXEN!</span>`;
    } else if (kugelInhalt === "Nichts") {
      kugel.innerHTML = "NICHTS";
      text.innerHTML = `${person}<br><span class="kugel-ergebnis">NICHTS!</span>`;
    } else {
      schluecke = parseInt(kugelInhalt);
      kugel.innerHTML = schluecke;
      text.innerHTML = `${person}<br><span class="kugel-ergebnis">${kugelInhalt}</span>`;
    }

    if (schluecke > 0) trinkCounter[person] += schluecke;
    updateTracker();

    setTimeout(() => { overlay.style.display = "none"; minispielPhase = 0; }, 3000);
  }, 2500);
}
