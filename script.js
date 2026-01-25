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
  if (spieler.length < 2) {
    zeigeMeldung("Mindestens 2 Spieler!", 1000);
    return;
  }
  
  document.getElementById("setup").classList.add("hidden");
  document.getElementById("spiel").classList.remove("hidden");
  
  updateLeaderboard();
  
  // Namen-Liste oben verstecken
  const liste = document.getElementById("spielerListe");
  if (liste) {
    liste.style.display = "none";
    liste.classList.add("hidden");
  }

  document.getElementById("resetButtonContainer").style.display = "block";
}

// Tracker
function updateTracker() {
  document.getElementById("trinkStand").innerHTML =
    spieler.map(s => `<div><b>${s}</b>: ${trinkCounter[s].schluecke} Schlücke, ${trinkCounter[s].exen} Exen</div>`).join("");
}

// Meldung
function zeigeMeldung(html, dauer = 2750) {
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
  <h2 style="font-size: 3rem; margin-bottom: 30px; text-shadow: 3px 3px #000;">${titel}</h2>
  <div style="display:flex; gap:20px; flex-wrap:wrap; justify-content:center; max-width:90%;">
    ${spieler.filter(s => !ausgeschlossene.includes(s)).map(s =>
      `<button class="spieler-btn" style="padding:20px 35px; font-size:1.6rem; min-width:180px; height:70px; line-height:70px; background:#333; border:3px solid #555; border-radius:15px; color:white; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 6px #222; transition:all 0.2s;" onclick="${callback}('${s}')">${s}</button>`
    ).join("")}
  </div>
  ${!titel.includes("Exen verteilen") ? `
    <button onclick="document.getElementById('personenOverlay').remove()"
        style="padding:15px 30px; background:#333; border:none; border-radius:15px; color:white; font-size:1.4rem; margin-top:20px; cursor:pointer; line-height:1.2; padding-top:15px; display:flex; align-items:center; justify-content:center;">
      Abbrechen
    </button>
  ` : ''}
`;
  document.body.appendChild(overlay);
}

// Felder vor/zurück
function felderTrinken() {
  erstellePersonenOverlay("Wer ist vor/zurück gesprungen?", "personFeldGewaehlt");
}

function personFeldGewaehlt(person) {
  document.getElementById("personenOverlay").remove();
  const overlay = document.createElement("div");
  overlay.id = "felderOverlay"; // Feste ID für sicheres Schließen
  overlay.style.cssText = `position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.97);
    display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;gap:20px;color:white;`;
  overlay.innerHTML = `
    <h2 style="font-size: 3rem; margin-bottom: 30px;">${person} – Wie viele Felder?</h2>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:15px;max-width:80%;">
      ${[4,5,6,7].map(n => 
        `<button onclick="felderBestaetigt('${person}', ${n})"
            style="padding:20px; font-size:2rem; background:#ff4757; border:none; border-radius:15px; line-height:1.2; padding-top:23px; display:flex; align-items:center; justify-content:center; min-width:80px;">
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
  updateLeaderboard();
}

// Blauer Werfer
function blauerWerfer() {
  erstellePersonenOverlay("Wen soll's treffen? (Blauer Werfer)", "opferBlauGewaehlt");
}

function opferBlauGewaehlt(opfer) {
  document.getElementById("personenOverlay").remove();
  trinkCounter[opfer].exen += 1;
  zeigeMeldung(`<b>${opfer}</b> muss <b>EXEN!</b> (Blauer Werfer)`);
  updateLeaderboard();
}

// Roter Werfer
function roterWerfer() {
  erstellePersonenOverlay("Wer tritt auf roten Werfer?", "personRoterGewaehlt");
}

function personRoterGewaehlt(person) {
  document.getElementById("personenOverlay").remove();
  trinkCounter[person].exen += 1;
  zeigeMeldung(`<b>${person}</b> tritt auf roten Werfer → <b>SELBER EXEN!</b>`);
  updateLeaderboard();
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
      <h2 style="font-size: 3rem; margin-bottom: 30px;">Wer ist ${gefahrPlatz}. geworden?</h2>
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
          updateLeaderboard();
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

    updateLeaderboard();
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
  updateLeaderboard();
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
    updateLeaderboard();

    setTimeout(() => {
      radOverlay.style.display = "none";
      minispielPhase = 0;
    }, 3000);
  }, extraZeit * 1000);
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
  updateLeaderboard();
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
  updateLeaderboard();
  zeigeMeldung(`<b>${currentDoublePerson}</b> nimmt sicher <b>${currentDoubleAnzahl} Schlücke</b>!`);
}

function flipCoin() {
  const coin = document.getElementById("coin");
  const result = document.getElementById("doubleResult");

  result.innerHTML = "";

  // Transition kurz ausschalten & Reset
  coin.style.transition = "none";
  coin.style.transform = "rotateY(0deg)";

  // Reflow erzwingen (SEHR WICHTIG)
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

    trinkCounter[currentDoublePerson].schluecke += schluecke;
    updateLeaderboard();

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

function updateLeaderboard() {
  const hasPoints = spieler.some(s => 
    (trinkCounter[s].schluecke || 0) + (trinkCounter[s].exen || 0) * 10 > 0
  );

  let rankedPlayers;

  if (!hasPoints) {
    // Am Anfang: einfach Eingabereihenfolge
    rankedPlayers = spieler.map(name => ({
      name,
      schluecke: 0,
      exen: 0,
      punkte: 0
    }));
  } else {
    // Sortiert nach Punkten
    rankedPlayers = spieler.map(name => {
      const schluecke = trinkCounter[name].schluecke || 0;
      const exen = trinkCounter[name].exen || 0;
      const points = schluecke + exen * 10;
      return { name, schluecke, exen, punkte };
    }).sort((a, b) => b.points - a.points);
  }

  const tbody = document.getElementById("leaderboardBody");
  tbody.innerHTML = "";

  rankedPlayers.forEach((player, index) => {
    const row = document.createElement("tr");
    if (index === 0 && player.points > 0) {
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
