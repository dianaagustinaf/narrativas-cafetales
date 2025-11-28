// --- Lista fija ---
const NAMES = [
  "Pablo", "Ale", "Flor", "Andre", "Meri",
  "Gas", "Majo", "Cande", "Valen", "Didi",
  "Gise", "Marian", "Héctor", "Gabo", "Boga", "Invitado"
];

const DRINKS = [
  "Solo",
  "Cortado",
  "Cortado doble",
  "Café con leche",
  "Lágrima",
  "Té"
];

// Libro telefónico
const phoneBook = {
  "Pablo": "5491112345678",
  "Ale": "5491187654321",
  "Flor": "5491133344455",
  "Andre": "5491198765432",
  "Meri": "5491122211122",
  "Gas": "5491112345678",
  "Majo": "5491187654321",
  "Cande": "5491133344455",
  "Valen": "5491198765432",
  "Didi": "54911234234552",
  "Gise": "5491112345678",
  "Marian": "5491187654321",
  "Héctor": "5491133344455",
  "Gabo": "5491198765432",
  "Boga": "5491122211122",
};


let lastWinner = null;


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
/*
function updateRoulette(names) {
  const r = document.getElementById("roulette");
  r.innerHTML = names.length === 0 ? "" : names.join(" · ");
}
*/

function updateRoulette() {
  const r = document.getElementById("roulette");
  r.innerHTML = "☕"; // café grande como “ruleta”
  r.style.fontSize = "4rem";   // ajustá el tamaño que quieras
}

function spinRouletteAndPick(names) {
  return new Promise(resolve => {
    const roulette = document.getElementById("roulette");

    // Animación suave
    roulette.style.transition = "transform 3s cubic-bezier(0.12, 0.85, 0.35, 1)";

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

  w.textContent = `Hoy le toca a ${name} ☕`;
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

  //updateRoulette(eligible);
  updateRoulette();

  const winner = await spinRouletteAndPick(eligible);
  lastWinner = winner;   //  guarda ganador globalmente
  animateWinner(winner);
  showOrderPanel();

  saveHistory({
    date: new Date().toISOString().split("T")[0],
    name: winner
  });

  renderStats();
};






// -----------------------------------------------------
// PANEL COUNT CAFECITOS
// -----------------------------------------------------

function showOrderPanel() {
  const panel = document.getElementById("orderPanel");
  const list = document.getElementById("orderList");

  panel.classList.remove("hidden");
  list.innerHTML = ""; // limpiar por si ya se usó antes

  DRINKS.forEach(drink => {
    const row = document.createElement("div");
    row.className = "flex items-center justify-between bg-white p-3 rounded-lg border";

    row.innerHTML = `
      <span class="font-medium">${drink}</span>
      <div class="flex items-center gap-3">
        <button class="minus bg-blue-200 px-2 rounded">−</button>
        <span class="count text-lg font-semibold">0</span>
        <button class="plus bg-blue-200 px-2 rounded">+</button>
      </div>
    `;

    const minus = row.querySelector(".minus");
    const plus = row.querySelector(".plus");
    const countSpan = row.querySelector(".count");

    minus.onclick = () => {
      let v = parseInt(countSpan.textContent);
      if (v > 0) countSpan.textContent = v - 1;
    };

    plus.onclick = () => {
      let v = parseInt(countSpan.textContent);
      countSpan.textContent = v + 1;
    };

    list.appendChild(row);
  });
}






// -----------------------------------------------------
// BOTON ENVIAR + WASAP
// -----------------------------------------------------


document.getElementById("sendOrderBtn").onclick = () => {
  const rows = document.querySelectorAll("#orderList > div");
  const order = [];

  rows.forEach(row => {
    const drink = row.querySelector("span").textContent;
    const count = parseInt(row.querySelector(".count").textContent);

    if (count > 0) {
      order.push({ drink, count });
    }
  });

  if (order.length === 0) {
    alert("No pediste nada todavía ☕");
    return;
  }
// arma pedido
  let summary = "Pedido:\n\n";
  order.forEach(o => summary += `${o.count} × ${o.drink}\n`);

  //alert(summary);

  document.getElementById("sendOrderBtn").onclick = () => {
  const rows = document.querySelectorAll("#orderList > div");
  const order = [];

  rows.forEach(row => {
    const drink = row.querySelector("span").textContent;
    const count = parseInt(row.querySelector(".count").textContent);

    if (count > 0) {
      order.push({ drink, count });
    }
  });

  if (order.length === 0) {
    alert("No pediste nada todavía ☕");
    return;
  }

  // -------------------------
  // 📌 OBTENER GANADOR ACTUAL
  // -------------------------
  const winner = lastWinner; // si tu variable global se llama distinto, decime
  const number = phoneBook[winner];

  if (!number) {
    alert("No tengo el número del ganador para enviar el pedido de café ☕");
    return;
  }

  // -------------------------
  // 📌 ARMAR EL MENSAJE
  // -------------------------
  let summary = `☕ *Pedido para ${winner}*\n\n`;

  order.forEach(o => {
    summary += `${o.count} × ${o.drink}\n`;
  });

  // -------------------------
  // 📌 ABRIR WHATSAPP
  // -------------------------
  const url = `https://wa.me/${number}?text=${encodeURIComponent(summary)}`;
  window.open(url, "_blank");
};


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
