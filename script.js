let spieler = [];
let trinkCounter = {}; // schluecke: 0, exen: 0 pro Spieler
let aktuellerIndex = 0;
let gefahrPlatz = 0;
let minispielPhase = 0;

const kugeln = [
  "3 Schlücke",
  "4 Schlücke",
  "5 Schlücke",
  "Exen",
  "Exen verteilen",
  "Nichts",
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
  updateTracker(); // Tracker ohne Spieler-Auswahl, da Events jetzt unabhängig sind
}

// Tracker
function updateTracker() {
  document.getElementById("trinkStand").innerHTML =
    spieler.map(s => `<div><b>${s}</b>: ${trinkCounter[s].schluecke} Schlücke, ${trinkCounter[s].exen} Exen</div>`).join("");
}

// Meldung
function zeigeMeldung(html, dauer = 4000) {
  const div = document.createElement("div");
  div.className = "meldung";
  div.innerHTML = html;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), dauer);
}

// Hilfsfunktion: Overlay für Personenauswahl erstellen
function erstellePersonenOverlay(titel, callback, ausgeschlossene = []) {
  const overlay = document.createElement("div");
  overlay.id = "personenOverlay";
  overlay.style.cssText = `position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.97);
    display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;gap:30px;color:white;`;
  overlay.innerHTML = `
    <h2>${titel}</h2>
    <div style="display:flex;gap:20px;flex-wrap:wrap;justify-content:center;">
      ${spieler.filter(s => !ausgeschlossene.includes(s)).map(s => 
        `<button class="spieler-btn" style="padding:25px 40px;font-size:2rem;" onclick="${callback}('${s}')">${s}</button>`
      ).join("")}
    </div>
    <button onclick="document.getElementById('personenOverlay').remove()" 
            style="padding:15px 30px;background:#333;">Abbrechen</button>
  `;
  document.body.appendChild(overlay);
}

// Felder vor/zurück
function felderTrinken() {
  erstellePersonenOverlay("Wer ist vor/zurückgesprungen?", "personFeldGewaehlt");
}

function personFeldGewaehlt(person) {
  document.getElementById("personenOverlay").remove();
  const overlay = document.createElement("div");
  overlay.id = "felderOverlay"; // Feste ID für sicheres Schließen
  overlay.style.cssText = `position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.97);
    display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;gap:20px;color:white;`;
  overlay.innerHTML = `
    <h2>${person} – wie viele Felder?</h2>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:15px;max-width:80%;">
      ${[4,5,6,7].map(n => 
        `<button onclick="felderBestaetigt('${person}', ${n})" 
                 style="padding:20px;font-size:2rem;background:#ff4757;border:none;border-radius:15px;">
          ${n}
        </button>`
      ).join("")}
    </div>
  `;
  document.body.appendChild(overlay);
}

function felderBestaetigt(person, anzahl) {
  showDoubleConfirm(person, anzahl);
  document.getElementById("felderOverlay").remove(); // Garantiert schließen – direkt zurück zum Hauptbildschirm
}

// Hölle
function hoelle() {
  erstellePersonenOverlay("Wer ist in die Hölle gefallen?", "personHoelleGewaehlt");
}

function personHoelleGewaehlt(person) {
  document.getElementById("personenOverlay").remove();
  trinkCounter[person].exen += 1;
  zeigeMeldung(`<b>${person}</b> fällt in die HÖLLE → <b>EXEN!</b>`);
  updateTracker();
}

// Blauer Werfer
function blauerWerfer() {
  erstellePersonenOverlay("Wen soll's treffen? (Blauer Werfer)", "opferBlauGewaehlt");
}

function opferBlauGewaehlt(opfer) {
  document.getElementById("personenOverlay").remove();
  trinkCounter[opfer].exen += 1;
  zeigeMeldung(`<b>${opfer}</b> muss <b>EXEN!</b> (Blauer Werfer)`);
  updateTracker();
}

// Roter Werfer
function roterWerfer() {
  erstellePersonenOverlay("Wer tritt auf roten Werfer?", "personRoterGewaehlt");
}

function personRoterGewaehlt(person) {
  document.getElementById("personenOverlay").remove();
  trinkCounter[person].exen += 1;
  zeigeMeldung(`<b>${person}</b> tritt auf roten Werfer → <b>SELBER EXEN!</b>`);
  updateTracker();
}

// Minispiel
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

    const kugelInhalt = kugeln[Math.floor(Math.random() * kugeln.length)];

    if (kugelInhalt === "Exen verteilen") {
      kugel.innerHTML = "↔";
      text.innerHTML = `${person}<br><span class="kugel-ergebnis">EXEN VERTEILEN!</span>`;

      setTimeout(() => {
        overlay.style.display = "none";

        if (spieler.length === 2) {
          const opfer = spieler.find(s => s !== person);
          trinkCounter[opfer].exen += 1;
          zeigeMeldung(`<b>${person}</b> verteilt → <b>${opfer}</b> muss <b>EXEN!</b>`);
          updateTracker();
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
      kugel.innerHTML = "EXEN";
      text.innerHTML = `${person}<br><span class="kugel-ergebnis">EXEN!</span>`;
      trinkCounter[person].exen += 1;
    } else if (kugelInhalt === "Nichts") {
      kugel.innerHTML = "NICHTS";
      text.innerHTML = `${person}<br><span class="kugel-ergebnis">NICHTS!</span>`;
    } else {
      const schluecke = parseInt(kugelInhalt);
      kugel.innerHTML = schluecke;
      text.innerHTML = `${person}<br><span class="kugel-ergebnis">${schluecke} Schlücke!</span>`;
      trinkCounter[person].schluecke += schluecke;
    }

    updateTracker();
    setTimeout(() => {
      overlay.style.display = "none";
      minispielPhase = 0;
    }, 3000);
  }, 2500);
}

function minispielExenVerteilen(opfer) {
  document.getElementById("personenOverlay")?.remove();
  trinkCounter[opfer].exen += 1;
  zeigeMeldung(`<b>Verteiler</b> → <b>${opfer}</b> muss <b>EXEN!</b>`);
  updateTracker();
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
  const zahlen = [0,1,2,3,4,5,6,7,8,9,10];
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

    trinkCounter[person].schluecke += endZahl;
    updateTracker();

    setTimeout(() => {
      radOverlay.style.display = "none";
      minispielPhase = 0;
    }, 3000);
  }, extraZeit * 1000);
}

// Reset-Button wird erst nach Spielstart sichtbar
function spielStarten() {
  document.getElementById("setup").classList.add("hidden");
  document.getElementById("spiel").classList.remove("hidden");
  updateTracker();
  document.getElementById("resetButtonContainer").style.display = "block";
}

// Reset-Button öffnet das Overlay
function resetTracker() {
  document.getElementById("resetOverlay").classList.remove("hidden");
}

// Ja → zurücksetzen
function resetBestaetigt() {
  spieler.forEach(name => {
    trinkCounter[name] = { schluecke: 0, exen: 0 };
  });
  updateTracker();
  zeigeMeldung("Tracker wurde zurückgesetzt! Neue Runde startet!", 3000);
  document.getElementById("resetOverlay").classList.add("hidden");
}

let currentDoublePerson = null;
let currentDoubleAnzahl = 0;

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

function confirmDouble() {
  document.getElementById("doubleConfirmOverlay").style.display = "none";
  showDoubleOrNothing(currentDoublePerson, currentDoubleAnzahl);
}

function cancelDouble() {
  document.getElementById("doubleConfirmOverlay").style.display = "none";
  trinkCounter[currentDoublePerson].schluecke += currentDoubleAnzahl;
  updateTracker();
  zeigeMeldung(`<b>${currentDoublePerson}</b> nimmt sicher <b>${currentDoubleAnzahl} Schlücke</b>!`);
}

function flipCoin() {
  const coin = document.getElementById("coin");
  coin.style.transition = "transform 3s ease-in-out";
  coin.style.transform = "rotateY(1800deg)"; // 5 volle Drehungen + 180°

  setTimeout(() => {
    const isDouble = Math.random() < 0.5;
    coin.style.transform = `rotateY(${isDouble ? 0 : 180}deg)`;

    let message = "";
    let schluecke = 0;

    if (isDouble) {
      schluecke = currentDoubleAnzahl * 2;
      message = `DOUBLE! +${schluecke} Schlücke!`;
      document.getElementById("doubleResult").innerHTML = `<span style="color:#ffd700;">${message}</span>`;
      trinkCounter[currentDoublePerson].schluecke += schluecke;
    } else {
      schluecke = 0;
      message = `NOTHING! 0 Schlücke`;
      document.getElementById("doubleResult").innerHTML = `<span style="color:#ff4757;">${message}</span>`;
      // Keine Schlücke addiert
    }

    updateTracker();

    // Wichtiger Teil: Die normale Meldung mit „Du musst X Schlücke trinken!“
    setTimeout(() => {
      zeigeMeldung(`<b>${currentDoublePerson}</b> muss <b>${schluecke} Schlücke</b> trinken!`);
      document.getElementById("doubleOverlay").style.display = "none";
    }, 1500); // 1,5 Sekunden nach Ergebnis (damit man das Ergebnis kurz sieht)

  }, 3000); // 3 Sekunden Drehung
}
