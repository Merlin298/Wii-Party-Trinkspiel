let spieler = [];
let trinkCounter = {};
let aktuellerIndex = 0;

const kugeln = [
  "4 Schlücke","4 Schlücke","4 Schlücke",
  "5 Schlücke","5 Schlücke",
  "Exen","Exen",
  "Exen verteilen",
  "Nichts","Nichts",
  "Zufall 0-10 Schlücke"
];

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

// --- Meldungssystem ---
function zeigeMeldung(html) {
  const div = document.createElement("div");
  div.className = "meldung";
  div.innerHTML = html;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3500);
}

// --- Ereignisse ---
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
  const opfer = prompt(`${verteiler} darf Exen verteilen!\nAn wen? (Name eingeben)`);
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

// --- Minispiel mit geiler Kugel-Animation (jetzt bugfrei!) ---
function minispiel() {
  const platz = Math.floor(Math.random() * spieler.length) + 1;
  const opfer = spieler[platz - 1];

  const overlay = document.getElementById("kugelOverlay");
  const kugel = document.getElementById("kugel");
  const text = document.getElementById("kugelText");

  overlay.style.display = "flex";
  text.innerHTML = `${opfer} (Platz ${platz}) zieht eine Kugel...`;
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
      text.innerHTML = `${opfer}<br><span class="kugel-ergebnis">EXEN VERTEILEN!</span>`;
      setTimeout(() => { overlay.style.display = "none"; blauerWerfer(); }, 2500);
      return;
    }
    if (kugelInhalt.includes("Zufall")) {
      schluecke = Math.floor(Math.random() * 11);
      kugel.innerHTML = schluecke;
      text.innerHTML = `${opfer}<br><span class="kugel-ergebnis">${schluecke} Schlücke!</span>`;
    } else if (kugelInhalt === "Exen") {
      schluecke = 10;
      kugel.innerHTML = "EXEN";
      text.innerHTML = `${opfer}<br><span class="kugel-ergebnis">EXEN!</span>`;
    } else if (kugelInhalt === "Nichts") {
      kugel.innerHTML = "NICHTS";
      text.innerHTML = `${opfer}<br><span class="kugel-ergebnis">NICHTS!</span>`;
    } else {
      schluecke = parseInt(kugelInhalt);
      kugel.innerHTML = schluecke;
      text.innerHTML = `${opfer}<br><span class="kugel-ergebnis">${kugelInhalt}</span>`;
    }

    if (schluecke > 0) trinkCounter[opfer] += schluecke;
    updateTracker();

    setTimeout(() => overlay.style.display = "none", 3000);
  }, 2500);
}
