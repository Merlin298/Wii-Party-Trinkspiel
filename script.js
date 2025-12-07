let spieler = [];
let trinkCounter = {};
let aktuellerIndex = 0; // wer ist gerade dran im Wii-Spiel

const kugeln = [
  "4 Schlücke", "4 Schlücke", "4 Schlücke",
  "5 Schlücke", "5 Schlücke",
  "Exen", "Exen",
  "Exen verteilen",
  "Nichts", "Nichts",
  "Zufall 0-10 Schlücke"
];

function spielerHinzufuegen() {
  const input = document.getElementById("neuerSpieler");
  const name = input.value.trim();
  if (name && !spieler.includes(name)) {
    spieler.push(name);
    trinkCounter[name] = 0;
    input.value = "";
    renderSpieler();
  }
}

function renderSpieler() {
  const liste = document.getElementById("spielerListe");
  liste.innerHTML = spieler.map((s, i) => `
    <li class="${i === aktuellerIndex ? 'aktuell' : ''}">
      ${i === aktuellerIndex ? '➤ ' : ''}${s} → ${trinkCounter[s]} Schlücke
    </li>`).join("");
  document.getElementById("startBtn").disabled = spieler.length < 2;
}

function spielStarten() {
  document.getElementById("setup").classList.add("hidden");
  document.getElementById("spiel").classList.remove("hidden");
  naechsterSpieler(); // zeigt direkt den ersten an
}

function naechsterSpieler() {
  aktuellerIndex = (aktuellerIndex + 1) % spieler.length;
  updateTracker();
}

function aktuellerSpieler() {
  return spieler[aktuellerIndex];
}

// Schöneres Feedback + Animation
function zeigeMeldung(text) {
  const meldung = document.createElement("div");
  meldung.className = "meldung";
  meldung.innerHTML = text;
  document.body.appendChild(meldung);
  setTimeout(() => meldung.remove(), 3000);
}

// === Ereignisse ===
function felderTrinken() {
  const felder = prompt(`➤ ${aktuellerSpieler()} ist dran!\nWie viele Felder vor-/zurück?`, "3");
  if (!felder) return;
  const n = parseInt(felder);
  if (n > 0) {
    trinkCounter[aktuellerSpieler()] += n;
    zeigeMeldung(`<b>${aktuellerSpieler()}</b> trinkt <b>${n} Schlücke</b>! 🍻`);
    updateTracker();
  }
  naechsterSpieler();
}

function hoelle() {
  trinkCounter[aktuellerSpieler()] += 10;
  zeigeMeldung(`<b>${aktuellerSpieler()}</b> fällt in die HÖLLE → <b>EXEN!</b> 🔥`);
  updateTracker();
  naechsterSpieler();
}

function blauerWerfer() {
  const verteiler = aktuellerSpieler();
  const opferName = prompt(`${verteiler} steht auf blauem Werfer!\nAn wen Exen verteilen?`, spieler.find(s => s !== verteiler) || "");
  const opfer = spieler.find(s => s.toLowerCase() === opferName?.toLowerCase());
  if (opfer) {
    trinkCounter[opfer] += 10;
    zeigeMeldung(`<b>${verteiler}</b> verteilt → <b>${opfer} muss EXEN!</b> 😈`);
    updateTracker();
  }
  naechsterSpieler();
}

function roterWerfer() {
  trinkCounter[aktuellerSpieler()] += 10;
  zeigeMeldung(`<b>${aktuellerSpieler()}</b> tritt auf roten Werfer → <b>SELBER EXEN!</b> 😵`);
  updateTracker();
  naechsterSpieler();
}

function minispiel() {
  const platz = Math.floor(Math.random() * spieler.length) + 1;
  const opfer = spieler[platz - 1];

  // Overlay anzeigen + Animation starten
  const overlay = document.getElementById("kugelOverlay");
  const kugel = document.getElementById("kugel");
  const text = document.getElementById("kugelText");
  
  overlay.classList.remove("hidden");
  text.innerHTML = `${opfer} (Platz ${platz}) zieht eine Kugel...`;

  // Nach 2,5 Sekunden Kugel "stoppt" und Ergebnis kommt
  setTimeout(() => {
    kugel.style.animation = "none";
    kugel.offsetHeight; // force reflow
    kugel.style.animation = "bounce 0.6s";

    const kugelInhalt = kugeln[Math.floor(Math.random() * kugeln.length)];
    let schluecke = 0;
    let finalText = "";

    if (kugelInhalt.includes("Zufall")) {
      schluecke = Math.floor(Math.random() * 11);
      finalText = `${opfer}<br><span class="kugel-ergebnis">${schluecke} Schlücke!</span>`;
    } else if (kugelInhalt === "Exen verteilen") {
      kugel.innerHTML = "↔";
      setTimeout(() => {
        overlay.classList.add("hidden");
        blauerWerfer(); // nutzt deine bestehende Funktion
      }, 2000);
      return;
    } else if (kugelInhalt === "Exen") {
      schluecke = 10;
      kugel.innerHTML = "🍺";
      finalText = `${opfer}<br><span class="kugel-ergebnis">EXEN!</span>`;
    } else if (kugelInhalt === "Nichts") {
      kugel.innerHTML = "😇";
      finalText = `${opfer}<br><span class="kugel-ergebnis">NICHTS!</span>`;
    } else {
      schluecke = parseInt(kugelInhalt);
      kugel.innerHTML = schluecke;
      finalText = `${opfer}<br><span class="kugel-ergebnis">${kugelInhalt}</span>`;
    }

    if (schluecke > 0) trinkCounter[opfer] += schluecke;
    text.innerHTML = finalText;
    updateTracker();

    // Nach weiteren 2,5 Sekunden wieder weg
    setTimeout(() => {
      overlay.classList.add("hidden");
    }, 3000);

  }, 2500);
}

function updateTracker() {
  document.getElementById("trinkStand").innerHTML = 
    spieler.map((s, i) => `<div ${i === aktuellerIndex ? 'class="aktuell"' : ''}>
      ${i === aktuellerIndex ? '➤ ' : ''}<b>${s}</b>: ${trinkCounter[s]} Schlücke
    </div>`).join("");
}

// Nächster-Spieler-Button (optional, falls ihr manuell weiter wollt)
document.getElementById("spiel").insertAdjacentHTML("beforeend", 
  `<button onclick="naechsterSpieler()" class="big" style="margin-top:20px;background:#2ed573">Nächster Spieler ➜</button>`
);
