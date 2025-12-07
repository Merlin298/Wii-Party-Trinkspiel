let spieler = [];
let trinkCounter = {};

const kugeln = [
  "4 Schlücke", "4 Schlücke",
  "5 Schlücke",
  "Exen", "Exen",
  "Exen verteilen",
  "Nichts",
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
  liste.innerHTML = spieler.map(s => `<li>${s} → ${trinkCounter[s]} Schlücke</li>`).join("");
  document.getElementById("startBtn").disabled = spieler.length < 2;
}

function spielStarten() {
  document.getElementById("setup").classList.add("hidden");
  document.getElementById("spiel").classList.remove("hidden");
  updateTracker();
}

function updateTracker() {
  document.getElementById("trinkStand").innerHTML = 
    spieler.map(s => `<div><b>${s}</b>: ${trinkCounter[s]} Schlücke</div>`).join("");
}

// === Die eigentlichen Trink-Events ===
function wuerfeln(max) { return Math.floor(Math.random() * max); }

function aktuellerSpieler() {
  return spieler[wuerfeln(spieler.length)];
}

function felderTrinken() {
  const felder = prompt("Wie viele Felder vor- oder zurückgesprungen?", "3");
  if (!felder) return;
  const sp = aktuellerSpieler();
  trinkCounter[sp] += parseInt(felder);
  alert(`${sp} trinkt ${felder} Schlücke! 🍺`);
  updateTracker();
}

function hoelle() {
  const sp = aktuellerSpieler();
  trinkCounter[sp] += 10; // Exen ≈ 10 Schlücke
  alert(`${sp} ist in der HÖLLE → EXEN! 🔥`);
  updateTracker();
}

function blauerWerfer() {
  const verteiler = aktuellerSpieler();
  const opfer = prompt(`${verteiler} darf Exen verteilen!\nAn wen? (Name eingeben)`);
  if (opfer && spieler.includes(opfer)) {
    trinkCounter[opfer] += 10;
    alert(`${opfer} muss exen! (von ${verteiler})`);
    updateTracker();
  }
}

function roterWerfer() {
  const sp = aktuellerSpieler();
  trinkCounter[sp] += 10;
  alert(`${sp} tritt auf roten Werfer → SELBER EXEN! 😵`);
  updateTracker();
}

function minispiel() {
  const platz = wuerfeln(spieler.length) + 1;
  alert(`Minispiel-Platzierung wird gelost…\nPlatz ${platz} zieht eine Kugel!`);
  const opfer = spieler[platz - 1];
  const kugel = kugeln[wuerfeln(kugeln.length)];

  let schluecke = 0;
  let text = "";

  if (kugel.includes("Zufall")) {
    schluecke = wuerfeln(11);
    text = `${opfer} zieht Zufall → ${schluecke} Schlücke!`;
  } else if (kugel === "Exen verteilen") {
    const ziel = prompt(`${opfer} darf Exen verteilen!\nAn wen?`);
    if (ziel && spieler.includes(ziel)) {
      trinkCounter[ziel] += 10;
      text = `${ziel} muss exen! (von ${opfer})`;
    }
  } else if (kugel === "Exen") {
    schluecke = 10;
    text = `${opfer} zieht ${kugel} → EXEN!`;
  } else if (kugel === "Nichts") {
    text = `${opfer} hat Glück → NICHTS! 😇`;
  } else {
    schluecke = parseInt(kugel);
    text = `${opfer} zieht ${kugel}!`;
  }

  if (schluecke > 0) trinkCounter[opfer] += schluecke;
  else if (!text.includes("verteilen") && !text.includes("Nichts")) schluecke = 0;

  alert(text);
  updateTracker();
}
