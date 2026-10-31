const swatches = document.getElementById("swatches");
let state = { ...LQ_DEFAULTS };

for (const preset of LQ_PRESETS) {
  const b = document.createElement("button");
  b.className = "swatch";
  b.title = preset.name;
  b.style.setProperty("--c", preset.accent);
  b.dataset.accent = preset.accent;
  b.addEventListener("click", () => save({ accent: preset.accent }));
  swatches.appendChild(b);
}

function render() {
  document.documentElement.style.setProperty("--accent", state.accent);
  document.getElementById("controls").classList.toggle("off", state.mode === "off");

  for (const el of document.querySelectorAll("input[data-key], select[data-key]")) {
    const v = state[el.dataset.key];
    if (el.type === "checkbox") el.checked = !!v;
    else el.value = v;
  }
  for (const seg of document.querySelectorAll(".segmented")) {
    for (const b of seg.children) b.classList.toggle("active", b.value === state[seg.dataset.key]);
  }
  for (const s of swatches.children) {
    s.classList.toggle("active", s.dataset.accent.toLowerCase() === state.accent.toLowerCase());
  }
  document.getElementById("radiusOut").textContent = state.radius + "px";
  document.getElementById("scaleOut").textContent = state.scale + "%";
}

function save(patch) {
  state = { ...state, ...patch };
  render();
  chrome.storage.sync.set(patch);
}

for (const el of document.querySelectorAll("input[data-key], select[data-key]")) {
  el.addEventListener("input", () => {
    let v = el.type === "checkbox" ? el.checked : el.value;
    if (el.type === "range") v = Number(v);
    save({ [el.dataset.key]: v });
  });
}

for (const seg of document.querySelectorAll(".segmented")) {
  seg.addEventListener("click", e => {
    if (e.target.value) save({ [seg.dataset.key]: e.target.value });
  });
}

document.getElementById("reset").addEventListener("click", () => save({ ...LQ_DEFAULTS }));

chrome.storage.sync.get(LQ_DEFAULTS, stored => {
  state = { ...LQ_DEFAULTS, ...stored };
  render();
});
