// --- Lista fija ---
const NAMES = [
  "Pablo", "Ale", "Flor", "Andre", "Meri",
  "Gasti", "Majo", "Cande", "Valen", "Didi",
  "Gise", "Marian", "Héctor", "Gabi", "Bogado"
];

// --- Render botones ---
const nameList = document.getElementById("nameList");
NAMES.forEach(name => {
  const div = document.createElement("button");
  div.className =
    "person border border-blue-300 rounded-lg py-2 text-center capitalize bg-white hover:bg-blue-100 transition";
  div.textContent = name;
  div.onclick = () => {
    div.classList.toggle("bg-blue-200");
    div.classList.toggle("border-blue-600");
    div.classList.toggle("text-blue-900");
  };
  nameList.appendChild(div);
});

// --- Historial ---
function loadHistory() {
  return JSON.parse(localStorage.getItem("coffeeHistory") || "[]");
}
function saveHistory(entry) {
  const hist = loadHistory();
  hist.push(entry);
  localStorage.setItem("coffeeHistory", JSON.stringify(hist));
}

// --- Reglas ---
function applyRules(selected) {
  const history = loadHistory();
  if (history.length === 0) return selected;

  let eligible = [...selected];

  const last = history[history.length - 1].name;
  const last5 = history.slice(-5);

  // Regla 1: no repetir el último
  eligible = eligible.filter(n => n !== last);

  // Regla 2: no más de 2 veces en 5 días
  const counts = {};
  last5.forEach(e => counts[e.name] = (counts[e.name] || 0) + 1);
  eligible = eligible.filter(n => (counts[n] || 0) < 2);

  return eligible;
}

// -----------------------------------------------------
// 🎰 RULETA + ANIMACIÓN
// -----------------------------------------------------

function updateRoulette(names) {
  const r = document.getElementById("roulette");
  r.innerHTML = names.length === 0 ? "" : names.join(" · ");
}

function spinRouletteAndPick(names) {
  return new Promise(resolve => {
    const roulette = document.getElementById("roulette");

    // giro aleatorio grande
    const angle = 720 + Math.random() * 720;
    roulette.style.transform = `rotate(${angle}deg)`;

    setTimeout(() => {
      const winner = names[Math.floor(Math.random() * names.length)];
      resolve(winner);
    }, 3000);
  });
}

function animateWinner(name) {
  const w = document.getElementById("winner");
  const steam = document.getElementById("steamContainer");

  w.textContent = `Ganó: ${name} ☕`;
  w.classList.remove("opacity-0");
  w.classList.add("opacity-100");

  steam.classList.remove("opacity-0");
  steam.classList.add("opacity-100");

  // Fade del vapor lento
  setTimeout(() => {
    steam.classList.add("opacity-0");
  }, 4000);
}


// -----------------------------------------------------
// BOTÓN SORTEAR
// -----------------------------------------------------
document.getElementById("drawBtn").onclick = async () => {
  const selected = Array.from(document.querySelectorAll(".person"))
    .filter(btn => btn.classList.contains("bg-blue-200"))
    .map(btn => btn.textContent);

  if (selected.length === 0) {
    alert("Seleccioná quiénes están hoy.");
    return;
  }

  let eligible = applyRules(selected);
  if (eligible.length === 0) eligible = selected;

  updateRoulette(eligible);

  const winner = await spinRouletteAndPick(eligible);
  animateWinner(winner);

  saveHistory({
    date: new Date().toISOString().split("T")[0],
    name: winner
  });

  renderStats();
};


// -----------------------------------------------------
// DASHBOARD
// -----------------------------------------------------
function renderStats() {
  const hist = loadHistory();
  const statsDiv = document.getElementById("stats");

  if (hist.length === 0) {
    statsDiv.innerHTML = "<p>No hay datos todavía.</p>";
    return;
  }

  const counts = {};
  NAMES.forEach(n => counts[n] = 0);
  hist.forEach(h => counts[h.name]++);

  statsDiv.innerHTML = `
    <p class="mb-2"><strong>Días registrados:</strong> ${hist.length}</p>
    <p class="mb-4"><strong>Último ganador:</strong> ${hist[hist.length - 1].name}</p>

    <h3 class="font-semibold mb-2">Total por persona:</h3>
    <ul class="grid grid-cols-2 gap-1">
      ${Object.keys(counts)
        .map(n => `<li class="capitalize">${n}: <strong>${counts[n]}</strong></li>`)
        .join("")}
    </ul>
  `;
}

renderStats();
