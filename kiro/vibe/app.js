/* Personal Productivity Dashboard
   - Daily motivation quote (local bank, same quote per day, shuffle on demand)
   - Current weather via Open-Meteo (no API key), geolocation + city search
   - Task tracker with localStorage persistence and a colorful progress bar
*/

/* ----------------------------- Greeting & clock ----------------------------- */
function updateGreeting() {
  const h = new Date().getHours();
  const name =
    h < 5 ? "Burning the midnight oil 🌙"
    : h < 12 ? "Good morning ☀️"
    : h < 18 ? "Good afternoon 🌤️"
    : "Good evening 🌆";
  document.getElementById("greeting").textContent = name;

  document.getElementById("today").textContent = new Date().toLocaleDateString(
    undefined,
    { weekday: "long", month: "long", day: "numeric" }
  );
}

function updateClock() {
  document.getElementById("clock").textContent = new Date().toLocaleTimeString(
    undefined,
    { hour: "2-digit", minute: "2-digit" }
  );
}

/* --------------------------------- Quotes --------------------------------- */
const QUOTES = [
  { t: "The secret of getting ahead is getting started.", a: "Mark Twain" },
  { t: "It always seems impossible until it's done.", a: "Nelson Mandela" },
  { t: "Well done is better than well said.", a: "Benjamin Franklin" },
  { t: "Action is the foundational key to all success.", a: "Pablo Picasso" },
  { t: "Done is better than perfect.", a: "Sheryl Sandberg" },
  { t: "Focus on being productive instead of busy.", a: "Tim Ferriss" },
  { t: "You don't have to be great to start, but you have to start to be great.", a: "Zig Ziglar" },
  { t: "Little by little, a little becomes a lot.", a: "Tanzanian Proverb" },
  { t: "Simplicity is the soul of efficiency.", a: "Austin Freeman" },
  { t: "The way to get started is to quit talking and begin doing.", a: "Walt Disney" },
  { t: "Quality is not an act, it is a habit.", a: "Aristotle" },
  { t: "What you do today can improve all your tomorrows.", a: "Ralph Marston" },
  { t: "Start where you are. Use what you have. Do what you can.", a: "Arthur Ashe" },
  { t: "A year from now you may wish you had started today.", a: "Karen Lamb" },
  { t: "Discipline is choosing between what you want now and what you want most.", a: "Abraham Lincoln" },
];

function dayOfYear(d = new Date()) {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d - start) / 86400000);
}

function renderQuote(index) {
  const q = QUOTES[index % QUOTES.length];
  document.getElementById("quote-text").textContent = `"${q.t}"`;
  document.getElementById("quote-author").textContent = `— ${q.a}`;
}

function setupQuotes() {
  // Deterministic "quote of the day" so it stays stable through the day.
  renderQuote(dayOfYear());

  let shuffleIndex = dayOfYear();
  document.getElementById("new-quote").addEventListener("click", () => {
    shuffleIndex = (shuffleIndex + 1) % QUOTES.length;
    renderQuote(shuffleIndex);
  });
}

/* --------------------------------- Weather -------------------------------- */
// WMO weather codes -> emoji + label (Open-Meteo uses these codes)
const WEATHER_CODES = {
  0: ["☀️", "Clear sky"],
  1: ["🌤️", "Mainly clear"],
  2: ["⛅", "Partly cloudy"],
  3: ["☁️", "Overcast"],
  45: ["🌫️", "Fog"],
  48: ["🌫️", "Rime fog"],
  51: ["🌦️", "Light drizzle"],
  53: ["🌦️", "Drizzle"],
  55: ["🌧️", "Heavy drizzle"],
  61: ["🌦️", "Light rain"],
  63: ["🌧️", "Rain"],
  65: ["🌧️", "Heavy rain"],
  66: ["🌧️", "Freezing rain"],
  67: ["🌧️", "Freezing rain"],
  71: ["🌨️", "Light snow"],
  73: ["🌨️", "Snow"],
  75: ["❄️", "Heavy snow"],
  77: ["🌨️", "Snow grains"],
  80: ["🌦️", "Rain showers"],
  81: ["🌧️", "Rain showers"],
  82: ["⛈️", "Violent showers"],
  85: ["🌨️", "Snow showers"],
  86: ["❄️", "Snow showers"],
  95: ["⛈️", "Thunderstorm"],
  96: ["⛈️", "Thunderstorm, hail"],
  99: ["⛈️", "Thunderstorm, hail"],
};

const weatherBody = document.getElementById("weather-body");

function setWeatherMessage(msg) {
  weatherBody.innerHTML = `<p class="muted">${msg}</p>`;
}

function renderWeather(data, locationLabel) {
  const c = data.current;
  const [icon, desc] = WEATHER_CODES[c.weather_code] || ["🌡️", "Unknown"];
  weatherBody.innerHTML = `
    <div class="weather-icon">${icon}</div>
    <div>
      <div class="weather-temp">${Math.round(c.temperature_2m)}°</div>
      <div class="weather-desc">${desc}</div>
      <div class="weather-loc">${locationLabel}</div>
    </div>
    <div class="weather-extra">
      Feels like ${Math.round(c.apparent_temperature)}°<br />
      Humidity ${c.relative_humidity_2m}%<br />
      Wind ${Math.round(c.wind_speed_10m)} km/h
    </div>
  `;
}

async function fetchWeather(lat, lon, locationLabel) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather request failed");
    const data = await res.json();
    renderWeather(data, locationLabel);
  } catch (err) {
    setWeatherMessage("Couldn't load weather. Try searching a city below.");
  }
}

async function fetchByCity(city) {
  setWeatherMessage(`Searching for ${city}…`);
  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        city
      )}&count=1`
    );
    const geo = await geoRes.json();
    if (!geo.results || geo.results.length === 0) {
      setWeatherMessage(`No match for "${city}". Try another spelling.`);
      return;
    }
    const place = geo.results[0];
    const label = [place.name, place.admin1, place.country_code]
      .filter(Boolean)
      .join(", ");
    fetchWeather(place.latitude, place.longitude, label);
  } catch (err) {
    setWeatherMessage("City search failed. Check your connection.");
  }
}

function setupWeather() {
  // Try geolocation first; fall back to a default city if denied/unavailable.
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        fetchWeather(
          pos.coords.latitude.toFixed(3),
          pos.coords.longitude.toFixed(3),
          "Your location"
        ),
      () => {
        setWeatherMessage("Location off — showing a default. Search your city below.");
        fetchByCity("New York");
      },
      { timeout: 8000 }
    );
  } else {
    fetchByCity("New York");
  }

  document.getElementById("city-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("city-input");
    const city = input.value.trim();
    if (city) {
      fetchByCity(city);
      input.blur();
    }
  });
}

/* ------------------------------ Task tracker ------------------------------ */
const STORAGE_KEY = "dashboard.tasks.v1";
let tasks = [];

function loadTasks() {
  try {
    tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    tasks = [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function updateProgress() {
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  document.getElementById("progress-bar").style.width = pct + "%";
  document.getElementById("progress-pct").textContent = pct + "%";
  document.getElementById("progress-count").textContent =
    `${done} of ${total} done`;
}

function renderTasks() {
  const list = document.getElementById("task-list");
  const empty = document.getElementById("empty-state");
  list.innerHTML = "";

  empty.style.display = tasks.length === 0 ? "block" : "none";

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item" + (task.done ? " done" : "");

    const check = document.createElement("input");
    check.type = "checkbox";
    check.className = "task-check";
    check.checked = task.done;
    check.setAttribute("aria-label", "Mark task complete");
    check.addEventListener("change", () => {
      task.done = check.checked;
      saveTasks();
      renderTasks();
    });

    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = task.text;

    const del = document.createElement("button");
    del.className = "task-delete";
    del.textContent = "✕";
    del.setAttribute("aria-label", "Delete task");
    del.addEventListener("click", () => {
      tasks = tasks.filter((t) => t.id !== task.id);
      saveTasks();
      renderTasks();
    });

    li.append(check, span, del);
    list.appendChild(li);
  });

  updateProgress();
}

function setupTasks() {
  loadTasks();
  renderTasks();

  document.getElementById("task-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("task-input");
    const text = input.value.trim();
    if (!text) return;
    tasks.push({ id: Date.now().toString(), text, done: false });
    input.value = "";
    saveTasks();
    renderTasks();
  });
}

/* ------------------------------- Cat facts -------------------------------- */
// Shown during breaks as a fun palate cleanser. Uses catfact.ninja with a
// small offline fallback so breaks still get a fact if the API is unreachable.
const CAT_FACT_FALLBACKS = [
  "Cats sleep for around 13 to 16 hours a day.",
  "A group of cats is called a clowder.",
  "Cats have five toes on their front paws but only four on the back.",
  "A cat's purr vibrates at a frequency that can promote healing.",
  "Cats can rotate their ears 180 degrees.",
  "A house cat can run roughly 30 mph over short distances.",
];

async function loadCatFact() {
  const el = document.getElementById("cat-fact-text");
  el.textContent = "Fetching a cat fact…";
  try {
    const res = await fetch("https://catfact.ninja/fact");
    if (!res.ok) throw new Error("Cat fact request failed");
    const data = await res.json();
    el.textContent = data.fact;
  } catch {
    const pick =
      CAT_FACT_FALLBACKS[Math.floor(Math.random() * CAT_FACT_FALLBACKS.length)];
    el.textContent = pick;
  }
}

function showCatFact() {
  document.getElementById("cat-fact").hidden = false;
  loadCatFact();
}

function hideCatFact() {
  document.getElementById("cat-fact").hidden = true;
}

/* ----------------------------- Pomodoro timer ----------------------------- */
const pomo = {
  mode: "focus", // "focus" | "break"
  running: false,
  remaining: 25 * 60, // seconds left in current phase
  total: 25 * 60, // length of current phase, for the progress bar
  completed: 0, // completed focus sessions
  tickId: null,
};

function pomoMinutes(id, fallback) {
  const v = parseInt(document.getElementById(id).value, 10);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

function focusSeconds() {
  return pomoMinutes("pomo-focus-min", 25) * 60;
}

function breakSeconds() {
  return pomoMinutes("pomo-break-min", 5) * 60;
}

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function renderPomo() {
  document.getElementById("pomo-time").textContent = formatTime(pomo.remaining);

  const badge = document.getElementById("pomo-mode-badge");
  const ring = document.getElementById("pomo-ring");
  if (pomo.mode === "focus") {
    badge.textContent = "Focus";
    badge.className = "mode-badge focus";
    ring.classList.remove("break");
  } else {
    badge.textContent = "Break";
    badge.className = "mode-badge break";
    ring.classList.add("break");
  }

  const elapsed = pomo.total - pomo.remaining;
  const pct = pomo.total === 0 ? 0 : (elapsed / pomo.total) * 100;
  ring.style.width = pct + "%";

  const roundNum = pomo.completed + (pomo.mode === "focus" ? 1 : 0);
  document.getElementById("pomo-round").textContent =
    `Round ${Math.max(roundNum, 1)} · ${pomo.completed} completed`;

  document.getElementById("pomo-start").textContent = pomo.running
    ? "Pause"
    : pomo.remaining === pomo.total
    ? "Start"
    : "Resume";
}

function notify(title, body) {
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(title, { body, icon: undefined });
    } catch {
      /* some environments block the constructor; ignore */
    }
  }
}

function beep() {
  // Short tone so there's a cue even if notifications are off.
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = 660;
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    /* audio not available; ignore */
  }
}

function switchPhase() {
  beep();
  if (pomo.mode === "focus") {
    // Finished a focus session -> start a break and show a cat fact.
    pomo.completed += 1;
    pomo.mode = "break";
    pomo.total = breakSeconds();
    pomo.remaining = pomo.total;
    notify("Break time! 🐱", "Nice focus session. Here's a cat fact while you rest.");
    showCatFact();
  } else {
    // Break over -> back to focus.
    pomo.mode = "focus";
    pomo.total = focusSeconds();
    pomo.remaining = pomo.total;
    notify("Back to work 💪", "Break's over. Let's get another session in.");
    hideCatFact();
  }
  renderPomo();
}

function pomoTick() {
  pomo.remaining -= 1;
  if (pomo.remaining <= 0) {
    switchPhase();
  } else {
    renderPomo();
  }
}

function startPomo() {
  if (pomo.running) return;
  pomo.running = true;
  pomo.tickId = setInterval(pomoTick, 1000);
  renderPomo();
}

function pausePomo() {
  pomo.running = false;
  clearInterval(pomo.tickId);
  pomo.tickId = null;
  renderPomo();
}

function resetPomo() {
  pausePomo();
  pomo.mode = "focus";
  pomo.completed = 0;
  pomo.total = focusSeconds();
  pomo.remaining = pomo.total;
  hideCatFact();
  renderPomo();
}

function setupPomodoro() {
  pomo.total = focusSeconds();
  pomo.remaining = pomo.total;
  renderPomo();

  document.getElementById("pomo-start").addEventListener("click", () => {
    pomo.running ? pausePomo() : startPomo();
  });

  document.getElementById("pomo-reset").addEventListener("click", resetPomo);

  document.getElementById("pomo-skip").addEventListener("click", () => {
    switchPhase();
  });

  // When settings change while idle at the start of a phase, apply immediately.
  document.getElementById("pomo-focus-min").addEventListener("change", () => {
    if (pomo.mode === "focus" && !pomo.running && pomo.remaining === pomo.total) {
      pomo.total = focusSeconds();
      pomo.remaining = pomo.total;
      renderPomo();
    }
  });
  document.getElementById("pomo-break-min").addEventListener("change", () => {
    if (pomo.mode === "break" && !pomo.running && pomo.remaining === pomo.total) {
      pomo.total = breakSeconds();
      pomo.remaining = pomo.total;
      renderPomo();
    }
  });

  // Notification permission toggle.
  const notifyBtn = document.getElementById("pomo-notify");
  function reflectNotifyState() {
    if (!("Notification" in window)) {
      notifyBtn.textContent = "Notifications unsupported";
      notifyBtn.disabled = true;
      return;
    }
    if (Notification.permission === "granted") {
      notifyBtn.textContent = "Notifications on ✓";
      notifyBtn.classList.add("enabled");
    } else if (Notification.permission === "denied") {
      notifyBtn.textContent = "Notifications blocked";
    } else {
      notifyBtn.textContent = "Enable notifications 🔔";
    }
  }
  notifyBtn.addEventListener("click", () => {
    if (!("Notification" in window)) return;
    Notification.requestPermission().then(reflectNotifyState);
  });
  reflectNotifyState();

  // Manual "another fact" button.
  document.getElementById("cat-fact-new").addEventListener("click", loadCatFact);
}

/* ---------------------------------- Init ---------------------------------- */
function init() {
  updateGreeting();
  updateClock();
  setInterval(updateClock, 1000);
  setupQuotes();
  setupWeather();
  setupPomodoro();
  setupTasks();
}

document.addEventListener("DOMContentLoaded", init);
