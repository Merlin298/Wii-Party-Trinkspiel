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
  showExenChoice(person);
  zeigeMeldung(`<b>${person}</b> fällt in die HÖLLE → <b>EXEN!</b>`);
  updateTracker();
}

// Blauer Werfer
function blauerWerfer() {
  erstellePersonenOverlay("Wen soll's treffen? (Blauer Werfer)", "opferBlauGewaehlt");
}

function opferBlauGewaehlt(opfer) {
  document.getElementById("personenOverlay").remove();
  showExenChoice(person);
  zeigeMeldung(`<b>${opfer}</b> muss <b>EXEN!</b> (Blauer Werfer)`);
  updateTracker();
}

// Roter Werfer
function roterWerfer() {
  erstellePersonenOverlay("Wer tritt auf roten Werfer?", "personRoterGewaehlt");
}

function personRoterGewaehlt(person) {
  document.getElementById("personenOverlay").remove();
  showExenChoice(person);
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
      showExenChoice(person);
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
  const result = document.getElementById("doubleResult");

  result.innerHTML = "";

  // 1️⃣ Transition kurz ausschalten & Reset
  coin.style.transition = "none";
  coin.style.transform = "rotateY(0deg)";

  // 2️⃣ Reflow erzwingen (SEHR WICHTIG)
  coin.offsetHeight;

    // 3️⃣ Jetzt Transition + Drehung starten
  const isDouble = Math.random() < 0.5;
  
  coin.style.transition = "transform 4.5s ease-in-out";
  coin.style.transform = `rotateY(${isDouble ? 2160 : 2340}deg)`;
  // 4️⃣ Ergebnis nach 4,5s
  setTimeout(() => {
    let schluecke = isDouble ? currentDoubleAnzahl * 2 : 0;
    let text = isDouble
      ? `DOUBLE! +${schluecke} Schlücke!`
      : `NOTHING! 0 Schlücke`;

    result.innerHTML = `<span style="color:${isDouble ? '#ffd700' : '#ff4757'}">${text}</span>`;

    trinkCounter[currentDoublePerson].schluecke += schluecke;
    updateTracker();

    if (isDouble) {
      launchConfetti();  // ← HIER einfügen: Konfetti nur bei Double!
    }

    setTimeout(() => {
      zeigeMeldung(`<b>${currentDoublePerson}</b> muss <b>${schluecke} Schlücke</b> trinken!`);
      setTimeout(() => {
        document.getElementById("doubleOverlay").style.display = "none";
      }, 1000);
    }, 1200);
  }, 4500);
}

// Konfetti-Funktion (bei Double aufrufen)
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

let currentExenPerson = null;
let plinkoBallsLeft = 10;
let plinkoTotalDrinks = 0;
let activeBalls = []; // Array für alle aktiven Bälle

const plinkoMultipliers = [0, 0, 0, 5, 3, 2, 1, 0, 0, 0, 1, 2, 3, 5, 0, 0, 0]; // 17 Slots
const plinkoLabels = [
  "Volles Getränk Exen verteilen", // Slot 0
  "Volles Getränk Exen", // Slot 1
  "Exen", // Slot 2
  "5×", "3×", "2×", "1×", "0×", // Slot 3-7
  "0", // Mitte Slot 8
  "0×", "1×", "2×", "3×", "5×", // Slot 9-13
  "Exen", // Slot 14
  "Volles Getränk Exen", // Slot 15
  "Volles Getränk Exen verteilen" // Slot 16
];

function showExenChoice(person) {
  currentExenPerson = person;
  document.getElementById("exenChoiceOverlay").style.display = "flex";
}

function chooseDrink() {
  document.getElementById("exenChoiceOverlay").style.display = "none";
  trinkCounter[currentExenPerson].exen += 1;
  updateTracker();
  zeigeMeldung(`<b>${currentExenPerson}</b> trinkt direkt eine EXE!`);
}

function choosePlinko() {
  document.getElementById("exenChoiceOverlay").style.display = "none";
  startPlinko(currentExenPerson);
}

function startPlinko(person) {
  currentExenPerson = person;
  plinkoBallsLeft = 10;
  plinkoTotalDrinks = 0;
  window.plinkoExenVerteilen = 0; // Reset für Verteilen
  document.getElementById("ballsLeft").textContent = "10";
  document.getElementById("totalDrinks").innerHTML = "0";
  document.getElementById("plinkoOverlay").style.display = "flex";

  const canvas = document.getElementById("plinkoCanvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Initiales Zeichnen (Hintergrund + Pegs + Slots)
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Pegs
  const pegRows = 16;
  const pegsPerRow = Array.from({length: pegRows}, (_, i) => i + 3);
  const pegRadius = 7;
  const startY = 100;
  const rowHeight = 42;
  ctx.fillStyle = "#00d2d3";
  pegsPerRow.forEach((count, row) => {
    const y = startY + row * rowHeight;
    const offset = (canvas.width - count * 55) / 2 + 27.5;
    for (let i = 0; i < count; i++) {
      ctx.beginPath();
      ctx.arc(offset + i * 55, y, pegRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Slots
  const slotWidth = canvas.width / 17;
  plinkoLabels.forEach((label, i) => {
    const x = i * slotWidth;
    let bgColor = "#555";
    if (label.includes("Volles") || label.includes("Exen")) bgColor = "#444";
    else if (label === "0") bgColor = "#333";
    else if (parseFloat(label) >= 5) bgColor = "#ff4757";
    else if (parseFloat(label) >= 2) bgColor = "#ffa502";

    ctx.fillStyle = bgColor;
    ctx.fillRect(x, canvas.height - 90, slotWidth, 90);

    ctx.fillStyle = "white";
    ctx.font = label.length > 15 ? "bold 14px Arial" : "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(label, x + slotWidth / 2, canvas.height - 45);
  });

  activeBalls = [];
  document.getElementById("dropBallBtn").onclick = dropPlinkoBall;
}

function dropPlinkoBall() {
  const canvas = document.getElementById("plinkoCanvas");

  // Maximal 10 Bälle aktiv
  if (activeBalls.length >= 10) return;

  const newBall = {
    x: canvas.width / 2,
    y: 60,
    vx: (Math.random() - 0.5) * 3,
    vy: 0,
    landed: false
  };

  activeBalls.push(newBall);

  // Starte Animation, falls sie nicht läuft
  if (!window.plinkoAnimationRunning) {
    window.plinkoAnimationRunning = true;
    animateAllBalls();
  }

  // Update Anzeige: noch zu dropende Bälle
  document.getElementById("ballsLeft").textContent = 10 - activeBalls.length;
}

function animateAllBalls() {
  const canvas = document.getElementById("plinkoCanvas");
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Hintergrund zeichnen
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Pegs zeichnen
  const pegRows = 16;
  const pegsPerRow = Array.from({length: pegRows}, (_, i) => i + 3);
  const pegRadius = 7;
  const startY = 100;
  const rowHeight = 42;
  ctx.fillStyle = "#00d2d3";
  pegsPerRow.forEach((count, row) => {
    const y = startY + row * rowHeight;
    const offset = (canvas.width - count * 55) / 2 + 27.5;
    for (let i = 0; i < count; i++) {
      ctx.beginPath();
      ctx.arc(offset + i * 55, y, pegRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Slots zeichnen
  const slotWidth = canvas.width / 17;
  plinkoLabels.forEach((label, i) => {
    const x = i * slotWidth;
    let bgColor = "#555";
    if (label.includes("Volles") || label.includes("Exen")) bgColor = "#444";
    else if (label === "0") bgColor = "#333";
    else if (parseFloat(label) >= 5) bgColor = "#ff4757";
    else if (parseFloat(label) >= 2) bgColor = "#ffa502";

    ctx.fillStyle = bgColor;
    ctx.fillRect(x, canvas.height - 90, slotWidth, 90);

    ctx.fillStyle = "white";
    ctx.font = label.length > 15 ? "bold 14px Arial" : "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(label, x + slotWidth / 2, canvas.height - 45);
  });

  const gravity = 0.4;
  const bounce = 0.6;

  // Alle Bälle animieren
  activeBalls = activeBalls.filter(ball => {
    if (ball.landed) return true;

    // Wände
    if (ball.x < 20) { ball.x = 20; ball.vx = -ball.vx * bounce; }
    if (ball.x > canvas.width - 20) { ball.x = canvas.width - 20; ball.vx = -ball.vx * bounce; }

    ball.vy += gravity;
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Peg-Kollisionen
    const row = Math.floor((ball.y - startY) / rowHeight);
    if (row >= 0 && row < 16) {
      const count = pegsPerRow[row];
      const offset = (canvas.width - count * 55) / 2 + 27.5;
      for (let i = 0; i < count; i++) {
        const px = offset + i * 55;
        const py = startY + row * rowHeight;
        const dist = Math.hypot(ball.x - px, ball.y - py);
        if (dist < pegRadius + 12) {
          ball.vx = (ball.x - px) * 0.3 + (Math.random() - 0.5) * 2;
          ball.vy = -ball.vy * bounce;
        }
      }
    }

    // Ball zeichnen
    ctx.fillStyle = "#ff4757";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 10, 0, Math.PI * 2);
    ctx.fill();

    // Landen
    if (ball.y > canvas.height - 100 && ball.vy > 0) {
      ball.landed = true;
      ball.y = canvas.height - 100;
      ball.vy = 0;
      ball.vx *= 0.8;

      const slot = Math.floor(ball.x / slotWidth);
      const mult = plinkoMultipliers[slot] || 0;
      const drink = mult * 1;
      plinkoTotalDrinks += drink;

      let extraText = "";
      if (plinkoLabels[slot].includes("Exen verteilen")) {
        if (!window.plinkoExenVerteilen) window.plinkoExenVerteilen = 0;
        window.plinkoExenVerteilen += 1;
        extraText = ` + <span style="color:#ff4757">${window.plinkoExenVerteilen} Exen verteilen</span>`;
      } else if (plinkoLabels[slot].includes("Exen")) {
        extraText = ` + <span style="color:#ff4757">+1 Exe</span>`;
        trinkCounter[currentExenPerson].exen += 1;
        updateTracker();
      } else {
        trinkCounter[currentExenPerson].schluecke += drink;
        updateTracker();
      }

      document.getElementById("totalDrinks").innerHTML = plinkoTotalDrinks.toFixed(1) + extraText;

      // Jetzt plinkoBallsLeft reduzieren, Overlay erst schließen, wenn alle Bälle gelandet
      plinkoBallsLeft--;
      document.getElementById("ballsLeft").textContent = plinkoBallsLeft;
      if (plinkoBallsLeft === 0 && activeBalls.every(b => b.landed)) {
        setTimeout(() => {
          document.getElementById("plinkoOverlay").style.display = "none";
        }, 1000);
      }

      // Ball nach 2 Sekunden aus activeBalls entfernen
      setTimeout(() => {
        activeBalls = activeBalls.filter(b => b !== ball);
      }, 2000);

      return true;
    }

    return true;
  });

  if (activeBalls.length > 0 || plinkoBallsLeft > 0) {
    requestAnimationFrame(animateAllBalls);
  } else {
    window.plinkoAnimationRunning = false;
  }
}

  
function plinkoExenVerteilen(opfer) {
  document.getElementById("personenOverlay")?.remove();
  trinkCounter[opfer].exen += window.plinkoExenVerteilen;
  updateTracker();
  zeigeMeldung(`Plinko: <b>${window.plinkoExenVerteilen} Exen</b> an <b>${opfer}</b> verteilt!`);
  window.plinkoExenVerteilen = 0;
  document.getElementById("plinkoOverlay").style.display = "none";
}
