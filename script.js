let minispielPhase = 0;

const kugeln = [
  "3 Schlücke",
  "3 Schlücke",
"4 Schlücke",
"5 Schlücke",
"Exen",
"Exen verteilen",
  "Nichts",
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
