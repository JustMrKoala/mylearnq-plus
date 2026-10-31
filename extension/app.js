// LearnQ+ : een volledig nieuwe interface voor MyLearnQ.
// De originele SvelteKit app blijft onzichtbaar draaien (voor inloggen en sessies).
// Gegevens komen uit dezelfde __data.json endpoints die de site zelf gebruikt.
// Bewerken gebeurt in het originele formulier, geopend in een paneel.
(() => {
  if (window !== window.top) return;
  if (/^\/(login|auth|logout)/.test(location.pathname)) return;

  /* ---------- Hulpjes ---------- */

  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = n => String(n).padStart(2, "0");
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const has = v => v !== null && v !== undefined && v !== "";
  const parse = s => { const [y, m, d] = String(s).slice(0, 10).split("-").map(Number); return new Date(y, m - 1, d); };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const monday = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); return addDays(x, -((x.getDay() + 6) % 7)); };
  const toDate = x => typeof x === "string" ? parse(x) : x;
  const daysBetween = (a, b) => Math.round((parse(iso(toDate(b))) - parse(iso(toDate(a)))) / 864e5);
  const fmt = (d, o) => new Intl.DateTimeFormat("nl-NL", o).format(typeof d === "string" ? parse(d) : d);
  const isoWeek = d => {
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
    return Math.ceil(((t - Date.UTC(t.getUTCFullYear(), 0, 1)) / 864e5 + 1) / 7);
  };
  const today = () => iso(new Date());
  const firstName = n => { const p = String(n || "").split(","); return (p[1] || p[0]).trim().split(" ")[0]; };
  const initials = n => { const p = String(n || "").split(","); const f = (p[1] || "").trim(), l = p[0].trim(); return ((f[0] || "") + (l[0] || "")).toUpperCase() || "?"; };
  const hue = s => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 360; return `hsl(${h} 70% 55%)`; };
  const mins = m => m >= 60 ? `${Math.floor(m / 60)}u${m % 60 ? " " + (m % 60) + "m" : ""}` : `${m}m`;
  const camel = k => k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

  const ICONS = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    calendar: '<rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5.5"/><circle cx="12" cy="12" r="2"/>',
    book: '<path d="M4 19.5V5a2 2 0 0 1 2-2h14v14H6a2 2 0 0 0-2 2.5zM4 19.5A2 2 0 0 0 6 21h14v-4"/>',
    trend: '<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
    sliders: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    up: '<path d="m18 15-6-6-6 6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    check: '<path d="m5 12 5 5L20 7"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    panel: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M9 4v16"/>',
    swap: '<path d="M7 7h13l-3-3M17 17H4l3 3"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/>',
    spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
    pin: '<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="1.5"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
    shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    send: '<path d="M4 12 20 4l-4 16-4-7z"/><path d="m12 13 8-9"/>',
    leave: '<path d="M14 4h5a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-5M10 16l-4-4 4-4M6 12h10"/>',
    join: '<path d="M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5M14 16l4-4-4-4M18 12H8"/>'
  };
  const icon = (n, s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${ICONS[n] || ""}</svg>`;

  const WORLD_COLORS = { 1: "#0ea5e9", 2: "#f59e0b", 3: "#ec4899", 4: "#14b8a6", 5: "#8b5cf6" };

  const PALETTES = {
    midnight: {
      dark: ["#080a16", "#12152a", "#141829", "#1c2036", "#262b42", "#eceef5", "#9097ad", "#5d637b"],
      light: ["#f3f4f9", "#e9ebf3", "#ffffff", "#f3f4f9", "#e1e4ee", "#12152a", "#5b6178", "#9097ad"]
    },
    zinc: {
      dark: ["#09090b", "#121214", "#161618", "#1f1f22", "#2a2a2e", "#f4f4f5", "#a1a1aa", "#63636b"],
      light: ["#f5f5f6", "#ececee", "#ffffff", "#f5f5f6", "#e4e4e7", "#18181b", "#5f5f68", "#a1a1aa"]
    },
    stone: {
      dark: ["#0c0a09", "#151311", "#1b1917", "#25221f", "#2f2b27", "#f5f5f4", "#a8a29e", "#6b645f"],
      light: ["#f6f4f1", "#ede9e4", "#ffffff", "#f8f6f3", "#e7e3dd", "#1c1917", "#615a54", "#a8a29e"]
    }
  };

  /* ---------- SvelteKit data ---------- */

  // __data.json gebruikt het "devalue" formaat: een platte array met verwijzingen
  function decode(arr) {
    const memo = {};
    const h = i => {
      if (i === -1) return undefined;
      if (i < 0) return null;
      if (i in memo) return memo[i];
      const v = arr[i];
      if (v === null || typeof v !== "object") return (memo[i] = v);
      if (Array.isArray(v)) {
        if (typeof v[0] === "string") {
          if (v[0] === "Date") return (memo[i] = v[1]);
          if (v[0] === "Set") return (memo[i] = v.slice(1).map(h));
          if (v[0] === "Map") { const o = {}; for (let k = 1; k < v.length; k += 2) o[h(v[k])] = h(v[k + 1]); return (memo[i] = o); }
          return (memo[i] = v);
        }
        const a = (memo[i] = []);
        v.forEach(x => a.push(h(x)));
        return a;
      }
      const o = (memo[i] = {});
      for (const k in v) o[k] = h(v[k]);
      return o;
    };
    return h(0);
  }

  class AuthError extends Error {}

  async function fetchRoute(path) {
    const r = await fetch(path + "/__data.json", { credentials: "same-origin" });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const j = await r.json();
    if (j.type === "redirect") throw new AuthError(j.location);
    const out = {};
    for (const n of j.nodes || []) if (n && n.type === "data") Object.assign(out, decode(n.data));
    delete out.session; // tokens hebben we niet nodig
    return out;
  }

  /* ---------- Staat ---------- */

  const S = {
    settings: { ...LQ_DEFAULTS },
    view: "dashboard",
    uid: null,
    user: null,
    data: {},
    loading: {},
    error: null,
    ui: { weekOffset: 0, chFilter: "active", chQuery: "", chDetail: null, drawer: null, panel: null }
  };

  const ROUTES = {
    checkin: uid => `/checkin/${uid}`,
    challenges: uid => `/challenges/${uid}`,
    notes: uid => `/notion/${uid}`,
    growth: uid => `/growth/${uid}`
  };

  async function ensure(key, force) {
    if (!force && (S.data[key] || S.loading[key])) return S.loading[key];
    S.loading[key] = fetchRoute(ROUTES[key](S.uid))
      .then(d => { S.data[key] = d; })
      .catch(e => { if (e instanceof AuthError) S.error = "auth"; else S.data[key] = { _error: String(e.message || e) }; })
      .finally(() => { delete S.loading[key]; render(); });
    return S.loading[key];
  }

  function needsFor(view) {
    return {
      dashboard: ["checkin", "challenges", "growth"],
      checkin: ["checkin"],
      challenges: ["challenges", "checkin"],
      notes: ["notes"],
      growth: ["growth"]
    }[view] || [];
  }

  /* ---------- Shadow root ---------- */

  const host = document.createElement("div");
  host.id = "lq-host";
  const shadow = host.attachShadow({ mode: "open" });
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = chrome.runtime.getURL("app.css");
  const app = document.createElement("div");
  app.className = "app";
  const shellEl = document.createElement("div");
  shellEl.className = "shell";
  const overlayEl = document.createElement("div");
  overlayEl.className = "overlay";
  const toastEl = document.createElement("div");
  toastEl.className = "toasts";
  app.append(shellEl, overlayEl, toastEl);
  shadow.append(link, app);

  function mount() {
    const attach = () => { if (!host.isConnected) document.body.appendChild(host); };
    if (document.body) attach();
    else document.addEventListener("DOMContentLoaded", attach, { once: true });
    // Svelte kan de body opnieuw vullen; zorg dat we blijven bestaan
    new MutationObserver(() => { if (S.settings.mode === "rewrite" && document.body && !host.isConnected) attach(); })
      .observe(document.documentElement, { childList: true, subtree: true });
  }

  /* ---------- Thema ---------- */

  function isDark() {
    const t = S.settings.theme;
    if (t === "dark") return true;
    if (t === "light") return false;
    return document.documentElement.classList.contains("dark") || matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function onAccent(hex) {
    const n = parseInt(hex.slice(1), 16);
    const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.45 ? "#111318" : "#ffffff";
  }

  function applyTheme() {
    const s = S.settings;
    const mode = isDark() ? "dark" : "light";
    let p;
    if (s.surface === "tinted") {
      const base = PALETTES.midnight[mode];
      p = base.map((c, i) => i < 5 ? `color-mix(in oklab, ${s.accent} ${mode === "dark" ? 9 : 5}%, ${c})` : c);
    } else {
      p = (PALETTES[s.surface] || PALETTES.midnight)[mode];
    }
    const vars = {
      "--bg": p[0], "--bg-2": p[1], "--panel": p[2], "--panel-2": p[3], "--line": p[4],
      "--text": p[5], "--muted": p[6], "--faint": p[7],
      "--accent": s.accent, "--on-accent": onAccent(s.accent),
      "--r": s.radius + "px",
      "--font": LQ_FONTS[s.font] || LQ_FONTS.modern,
      "--scale": s.scale / 100
    };
    for (const [k, v] of Object.entries(vars)) host.style.setProperty(k, v);
    Object.assign(app.dataset, {
      theme: mode, bg: s.background, glass: s.glass ? "on" : "off", motion: s.motion ? "on" : "off",
      layout: s.layout, compact: s.sidebarCompact ? "on" : "off", density: s.density
    });
    host.style.colorScheme = mode;
  }

  /* ---------- Rendering ---------- */

  const NAV = [
    { id: "dashboard", label: "Overzicht", icon: "home" },
    { id: "checkin", label: "Check-in", icon: "calendar" },
    { id: "challenges", label: "Challenges", icon: "target" },
    { id: "notes", label: "Ideeën", icon: "book" },
    { id: "growth", label: "Groei in beeld", icon: "trend" },
    { id: "chat", label: "Chat", icon: "chat", group: "Samen" }
  ];

  const TITLES = {
    dashboard: () => [`Overzicht`, fmt(new Date(), { weekday: "long", day: "numeric", month: "long" })],
    checkin: () => ["Check-in", "Plan je dag en kijk terug op je week"],
    challenges: () => ["Challenges", "Al je projecten op één plek"],
    notes: () => ["Ideeën", "Verzamel inspiratie voor nieuwe challenges"],
    growth: () => ["Groei in beeld", "Jouw ontwikkeling in kernwaarden en werelden"],
    chat: () => ["Chat", "Versleuteld met AES-256"]
  };

  let lastShell = "";
  let lastOverlay = null;

  function render() {
    applyTheme();
    if (S.error === "auth") { shellEl.innerHTML = authScreen(); overlayEl.innerHTML = ""; lastOverlay = null; return; }

    const [title, sub] = (TITLES[S.view] || TITLES.dashboard)();
    const activeCount = (S.data.challenges?.challenges || []).filter(c => !has(c.endChallengeDate)).length;

    siteLogo();
    const shellKey = [!!logoSrc, S.view, S.settings.layout, S.settings.sidebarCompact, activeCount, S.user?.name, S.ui.room].join("|");
    const side = `
      <aside class="side">
        <div class="brand">${siteLogo() ? `<img class="logo-img" src="${esc(siteLogo())}" alt="">` : `<div class="logo">LQ</div>`}<span>MyLearnQ</span></div>
        <nav class="nav">
          ${NAV.map(n => `${n.group ? `<div class="nav-label">${n.group}</div>` : ""}<button data-nav="${n.id}" class="${S.view === n.id ? "active" : ""}" title="${n.label}">${icon(n.icon, 18)}<span>${n.label}</span>${navBadge(n.id, activeCount)}</button>`).join("")}
        </nav>
        <div class="side-foot nav">
          ${S.settings.layout === "sidebar" ? `<button data-act="toggleCompact" title="Zijbalk in- of uitklappen">${icon("panel", 18)}<span>${S.settings.sidebarCompact ? "Uitklappen" : "Inklappen"}</span></button>` : ""}
          <button data-act="classic" title="Naar de originele weergave">${icon("swap", 18)}<span>Klassieke weergave</span></button>
        </div>
      </aside>`;

    const top = `
      <header class="top">
        <div><h1>${esc(title)}</h1><p>${esc(sub)}</p></div>
        <div class="actions">
          <button class="btn ghost icon" data-act="refresh" title="Vernieuwen">${icon("refresh")}</button>
          <button class="btn ghost icon" data-act="toggleTheme" title="Licht of donker">${icon(isDark() ? "sun" : "moon")}</button>
          <button class="btn" data-act="customize">${icon("sliders", 16)}<span>Aanpassen</span></button>
          <div class="avatar" title="${esc(S.user?.name || "")}">${esc(initials(S.user?.name))}</div>
        </div>
      </header>`;

    const scrollTop = shellEl.querySelector(".scroll")?.scrollTop || 0;
    const same = shellKey === lastShell;
    const kept = keepInputs();
    const msgsEl = shellEl.querySelector(".msgs");
    const nearBottom = !msgsEl || msgsEl.scrollHeight - msgsEl.scrollTop - msgsEl.clientHeight < 80;
    const msgsTop = msgsEl ? msgsEl.scrollTop : 0;

    shellEl.innerHTML = `${side}<div class="main">${top}<div class="scroll ${S.view === "chat" ? "fill" : ""}"><div class="view">${viewHtml()}</div></div></div>`;
    // Zelfde weergave: scrollpositie bewaren en de intro animaties niet opnieuw afspelen
    shellEl.classList.toggle("still", same);
    if (same) shellEl.querySelector(".scroll").scrollTop = scrollTop;
    restoreInputs(kept);
    const m = shellEl.querySelector(".msgs");
    if (m) m.scrollTop = !same || nearBottom ? m.scrollHeight : msgsTop;
    lastShell = shellKey;
    renderOverlay();
  }

  // Tekstvelden met een id behouden hun inhoud, focus en cursor bij elke render
  function keepInputs() {
    const active = shadow.activeElement;
    const vals = {};
    shellEl.querySelectorAll("input[id], textarea[id]").forEach(el => { vals[el.id] = el.value; });
    return { vals, focus: active?.id, sel: active && "selectionStart" in active ? [active.selectionStart, active.selectionEnd] : null };
  }
  function restoreInputs(k) {
    for (const [id, v] of Object.entries(k.vals)) { const el = shellEl.querySelector("#" + id); if (el && el.id !== "chq") el.value = v; }
    if (k.focus) {
      const el = shellEl.querySelector("#" + k.focus);
      if (el) { el.focus(); if (k.sel) try { el.setSelectionRange(k.sel[0], k.sel[1]); } catch (e) {} }
    }
  }

  // Het logo van de site zelf, uit de (verborgen) originele kop. Zo zit het
  // logo niet in deze extensie en past het altijd bij de school.
  let logoSrc = null;
  function siteLogo() {
    if (logoSrc) return logoSrc;
    const img = document.querySelector('body > :not(#lq-host) header img[src], img[alt="MyLearnQ"]');
    if (img?.src) logoSrc = img.src;
    else if (!siteLogo.retry) siteLogo.retry = setTimeout(() => { siteLogo.retry = null; if (document.querySelector("header img[src]")) { lastShell = ""; render(); } }, 1500);
    return logoSrc;
  }

  function navBadge(id, activeCount) {
    if (id === "challenges" && activeCount) return `<em class="badge">${activeCount}</em>`;
    if (id === "chat" && S.chatReady) {
      const n = LQChat.rooms.reduce((a, r) => a + LQChat.unread(r.id), 0);
      if (n) return `<em class="badge hot">${n}</em>`;
    }
    return "";
  }

  // De overlay wordt alleen vervangen als hij echt verandert, zodat een open
  // bewerkpaneel (iframe) niet herlaadt en ingevulde formulieren niet kwijtraken
  function overlayKey() {
    const dr = S.ui.drawer;
    if (!dr) return null;
    if (dr.type === "ci") return "ci:" + dr.date + ":" + !!S.data.checkin;
    if (dr.type === "settings") return "settings:" + JSON.stringify(S.settings);
    if (dr.type === "panel") return "panel:" + dr.route;
    if (dr.type === "chatInfo") return "chatInfo:" + dr.id + ":" + LQChat.messages(dr.id).length;
    if (dr.type === "chatJoin") return "chatJoin:" + (dr.error || "");
    return dr.type;
  }

  function renderOverlay() {
    const key = overlayKey();
    if (key === lastOverlay) return;
    const kind = k => k && k.split(":")[0];
    const still = !!key && kind(key) === kind(lastOverlay);
    const body = overlayEl.querySelector(".drawer-b");
    const st = body ? body.scrollTop : 0;
    overlayEl.innerHTML = overlayHtml();
    overlayEl.classList.toggle("still", still);
    if (still && overlayEl.querySelector(".drawer-b")) overlayEl.querySelector(".drawer-b").scrollTop = st;
    lastOverlay = key;
  }

  function viewHtml() {
    const keys = needsFor(S.view);
    const missing = keys.filter(k => !S.data[k]);
    if (missing.length && keys.every(k => !S.data[k])) {
      missing.forEach(k => ensure(k));
      return `<div class="card"><div class="loader" style="height:240px"><div class="spin"></div></div></div>`;
    }
    missing.forEach(k => ensure(k));
    try {
      switch (S.view) {
        case "checkin": return checkinView();
        case "challenges": return S.ui.chDetail ? challengeDetail() : challengesView();
        case "notes": return notesView();
        case "growth": return growthView();
        case "chat": return chatView();
        default: return dashboardView();
      }
    } catch (e) {
      console.error("[MyLearnQ+]", e);
      return errorCard(e.message || String(e));
    }
  }

  function authScreen() {
    return `<div class="main" style="grid-column:1/-1;display:grid;place-items:center">
      <div class="card" style="max-width:420px;text-align:center">
        <div class="empty"><div class="big">${icon("spark", 26)}</div>
          <h2 style="margin:0;color:var(--text)">Je sessie is verlopen</h2>
          <p style="margin:0">Log opnieuw in met je schoolaccount om verder te gaan.</p>
          <button class="btn primary" data-act="relogin">Opnieuw inloggen</button>
        </div>
      </div></div>`;
  }

  /* ---------- Afgeleide gegevens ---------- */

  function phaseOf(c) {
    if (has(c.endChallengeDate)) return { idx: 3, label: "Afgerond", start: c.endChallengeDate, progress: 100 };
    if (has(c.startEvaluationDate)) return { idx: 2, label: "Evaluatie", start: c.startEvaluationDate, progress: c.evaluationProgress || 0 };
    if (has(c.startExecutionDate)) return { idx: 1, label: "Uitvoering", start: c.startExecutionDate, progress: c.executionProgress || 0 };
    return { idx: 0, label: "Voorbereiding", start: c.startPreparationDate, progress: c.preparationProgress || 0 };
  }

  function people() {
    const map = {};
    for (const p of S.data.challenges?.collaboratorUsers || []) map[p.userId] = p.name;
    for (const p of S.data.checkin?.challengeOwners || []) map[p.userId] = p.name;
    if (S.user) map[S.uid] = S.user.name;
    return map;
  }

  function perspectiveMap() {
    const map = {};
    const worlds = S.data.challenges?.worlds || S.data.checkin?.worlds || [];
    for (const w of worlds) for (const p of w.perspectives || []) map[p.id] = { ...p, world: w };
    return map;
  }

  function worldMap() {
    const map = {};
    for (const w of S.data.challenges?.worlds || S.data.checkin?.worlds || []) map[w.id] = w;
    return map;
  }

  function stepper(c, labels) {
    const ph = phaseOf(c);
    const vals = [c.preparationProgress, c.executionProgress, c.evaluationProgress];
    const bars = [0, 1, 2].map(i => {
      const w = ph.idx > i ? 100 : ph.idx === i ? Math.max(4, Math.min(100, vals[i] || 0)) : 0;
      return `<div class="bar"><i style="width:${w}%"></i></div>`;
    }).join("");
    const lab = labels ? `<div class="steps-l">${["Voorbereiding", "Uitvoering", "Evaluatie"].map((l, i) => `<span class="${ph.idx === i ? "on" : ""}">${l}</span>`).join("")}</div>` : "";
    return `<div class="steps">${bars}</div>${lab}`;
  }

  function checkInsByDate() {
    const map = {};
    for (const c of S.data.checkin?.checkIns || []) map[c.date] = c;
    return map;
  }

  function challengeTitle(id) {
    const c = (S.data.challenges?.challenges || S.data.checkin?.challenges || []).find(x => x.challengeId === id);
    return c ? c.title : null;
  }

  /* ---------- Overzicht ---------- */

  function dashboardView() {
    const name = firstName(S.user?.name);
    const h = new Date().getHours();
    const greet = h < 6 ? "Goedenacht" : h < 12 ? "Goedemorgen" : h < 18 ? "Goedemiddag" : "Goedenavond";
    const chs = S.data.challenges?.challenges || [];
    const active = chs.filter(c => !has(c.endChallengeDate));
    const recent = lastSchoolDays(10);
    const byDate = checkInsByDate();
    const filled = recent.filter(d => byDate[d]?.status === "published").length;
    const todayCi = byDate[today()];

    const subline = isWeekend(new Date())
      ? "Fijn weekend! Hier is een overzicht van waar je staat."
      : todayCi?.status === "published"
        ? "Je check-in voor vandaag staat erin. Lekker bezig!"
        : "Je hebt je check-in voor vandaag nog niet afgerond.";

    const hero = `
      <section class="card hero">
        <div>
          <div class="eyebrow">${esc(fmt(new Date(), { weekday: "long", day: "numeric", month: "long" }))}, week ${isoWeek(new Date())}</div>
          <h2>${greet}, ${esc(name)}</h2>
          <p>${subline}</p>
        </div>
        <div class="stats">
          <div class="stat"><b>${active.length}<small class="faint" style="font-size:14px">/${S.data.challenges?.maxOpenChallenges ?? 5}</small></b><span>Open challenges</span></div>
          <div class="stat"><b>${filled}<small class="faint" style="font-size:14px">/10</small></b><span>Check-ins recent</span></div>
        </div>
      </section>`;

    const W = {
      today: () => widgetToday(todayCi),
      streak: () => widgetStreak(recent, byDate, filled),
      challenges: () => widgetChallenges(active),
      growth: () => widgetGrowth(),
      worlds: () => widgetWorlds(),
      quick: () => widgetQuick()
    };
    const sizes = { today: "w-7", streak: "w-5", challenges: "w-7", growth: "w-5", worlds: "w-5", quick: "w-7" };
    const order = normalizedWidgets().filter(w => w.on);
    const cards = order.map(w => { const html = W[w.id]?.(); return html ? `<div class="${sizes[w.id]}">${html}</div>` : ""; }).join("");

    return hero + `<div class="grid dash">${cards}</div>`;
  }

  function normalizedWidgets() {
    const list = (S.settings.widgets || []).filter(w => LQ_WIDGETS.some(x => x.id === w.id));
    for (const w of LQ_WIDGETS) if (!list.some(x => x.id === w.id)) list.push({ id: w.id, on: true });
    return list;
  }

  const isWeekend = d => d.getDay() === 0 || d.getDay() === 6;

  function lastSchoolDays(n) {
    const out = [];
    let d = new Date();
    while (out.length < n) { if (!isWeekend(d)) out.unshift(iso(d)); d = addDays(d, -1); }
    return out;
  }

  function widgetToday(ci) {
    const status = ci?.status === "published" ? `<span class="pill ok"><i class="dot"></i>Ingevuld</span>`
      : ci?.status === "draft" ? `<span class="pill warn"><i class="dot"></i>Concept</span>`
      : isWeekend(new Date()) ? `<span class="pill">Weekend</span>`
      : `<span class="pill bad"><i class="dot"></i>Nog niet ingevuld</span>`;
    const items = (ci?.items || []).slice().sort((a, b) => (a.blockNumber || 0) - (b.blockNumber || 0));
    const body = items.length
      ? `<ul class="list">${items.map(itemRow).join("")}</ul>`
      : `<div class="empty" style="padding:22px"><div class="big">${icon("calendar", 24)}</div><div>Nog niets gepland voor vandaag.</div></div>`;
    return `<section class="card">
      <div class="card-h"><h2>Vandaag</h2>${status}
        <button class="btn sm primary more" data-panel="checkin">${icon(ci ? "edit" : "plus", 15)}${ci ? "Bewerken" : "Check-in"}</button></div>
      ${body}
      ${ci?.successCriteria ? `<p class="muted" style="margin:12px 0 0;font-size:13px">${icon("flag", 14)} <b style="color:var(--text)">Geslaagd als:</b> ${esc(ci.successCriteria)}</p>` : ""}
    </section>`;
  }

  function itemRow(it) {
    const ct = it.challengeId ? challengeTitle(it.challengeId) : null;
    return `<li class="item"><div class="blk">${it.blockNumber ?? "•"}</div><div class="body">
      <div>${esc(it.description || "Zonder omschrijving")}</div>
      <div class="meta">${it.estimatedDuration ? `<span>${icon("clock", 13)} ${mins(it.estimatedDuration)}</span>` : ""}${ct ? `<span>${icon("target", 13)} ${esc(ct)}</span>` : ""}</div>
    </div></li>`;
  }

  function widgetStreak(days, byDate, filled) {
    const t = today();
    return `<section class="card">
      <div class="card-h"><h2>Check-in ritme</h2><span class="muted more" style="font-size:12.5px">${filled} van 10 schooldagen</span></div>
      <div class="strip">${days.map(d => {
        const st = byDate[d]?.status || "";
        return `<div class="d ${st} ${d === t ? "today" : ""}" title="${esc(fmt(d, { weekday: "long", day: "numeric", month: "long" }))}"><span>${fmt(d, { weekday: "narrow" })}</span><b>${parse(d).getDate()}</b><i></i></div>`;
      }).join("")}</div>
      <div class="legend-inline"><span><i style="--c:var(--accent)"></i>Ingevuld</span><span><i style="--c:color-mix(in oklab, #d39b2a 55%, var(--panel))"></i>Concept</span><span><i style="--c:var(--panel-2)"></i>Leeg</span></div>
    </section>`;
  }

  function widgetChallenges(active) {
    const planned = S.data.checkin?.plannedMinutesByChallenge || {};
    const rows = active.slice(0, 5).map(c => {
      const ph = phaseOf(c);
      return `<div class="item clickable" data-ch="${c.challengeId}" style="flex-direction:column;gap:8px">
        <div style="display:flex;gap:10px;align-items:center;width:100%"><b style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(c.title)}</b>
          <span class="pill acc">${ph.label}</span></div>
        <div style="width:100%">${stepper(c)}</div>
        <div class="meta" style="width:100%"><span>${icon("clock", 13)} ${daysBetween(ph.start || c.startPreparationDate, new Date()) + 1} dagen in fase</span>${planned[c.challengeId] ? `<span>${mins(planned[c.challengeId])} gepland</span>` : ""}${has(c.scheduledPresentationDate) ? `<span>${icon("flag", 13)} ${fmt(c.scheduledPresentationDate, { day: "numeric", month: "short" })}</span>` : ""}</div>
      </div>`;
    }).join("");
    return `<section class="card">
      <div class="card-h"><h2>Actieve challenges</h2><button class="btn sm ghost more" data-nav="challenges">Alles ${icon("right", 14)}</button></div>
      ${rows ? `<div class="list">${rows}</div>` : `<div class="empty">Geen actieve challenges.</div>`}
    </section>`;
  }

  function widgetGrowth() {
    const cv = S.data.growth?.coreValueScores;
    if (!cv?.length) return "";
    return `<section class="card">
      <div class="card-h"><h2>Kernwaarden</h2><button class="btn sm ghost more" data-nav="growth">Details ${icon("right", 14)}</button></div>
      ${cv.map(c => `<div class="cv"><b>${esc(c.title)}</b><div class="bar"><i style="width:${(c.studentScore || 0) / 5 * 100}%"></i></div><span>${(c.studentScore || 0).toFixed(1)}</span></div>`).join("")}
    </section>`;
  }

  function donut(dist) {
    return `<div class="stack">${dist.worlds.filter(w => w.fraction > 0).map(w => `<i style="--c:${WORLD_COLORS[w.worldId] || "#888"};flex:${w.fraction}" title="${esc(w.shortName)}"></i>`).join("")}</div>`;
  }

  function widgetWorlds() {
    const dist = S.data.growth?.worldDistribution;
    if (!dist?.worlds?.length) return "";
    return `<section class="card">
      <div class="card-h"><h2>Werelden</h2>${dist.favorite ? `<span class="muted more" style="font-size:12.5px">Favoriet: ${esc(dist.favorite.shortName)}</span>` : ""}</div>
      <div class="donut-row">${donut(dist)}
        <div class="legend">${dist.worlds.map(w => `<div style="--c:${WORLD_COLORS[w.worldId] || "#888"}"><i></i>${esc(w.shortName)}<span>${Math.round(w.fraction * 100)}%</span></div>`).join("")}</div>
      </div>
    </section>`;
  }

  function widgetQuick() {
    const full = (S.data.challenges?.openChallengesCount ?? 0) >= (S.data.challenges?.maxOpenChallenges ?? 99);
    return `<section class="card">
      <div class="card-h"><h2>Snel naar</h2></div>
      <div class="quick">
        <button data-panel="checkin">${icon("calendar", 20)}<div>Check-in<small>Plan je dag</small></div></button>
        <button data-panel="challenges" ${full ? 'title="Je hebt het maximum aantal open challenges"' : ""}>${icon("plus", 20)}<div>Challenge<small>${full ? "Maximum bereikt" : "Start iets nieuws"}</small></div></button>
        <button data-panel="notes">${icon("book", 20)}<div>Idee<small>Schrijf het op</small></div></button>
        <button data-panel="growth">${icon("trend", 20)}<div>Reflectie<small>Jouw groei</small></div></button>
      </div>
    </section>`;
  }

  /* ---------- Check-in ---------- */

  function checkinView() {
    const d = S.data.checkin;
    if (d?._error) return errorCard(d._error);
    const start = addDays(monday(new Date()), S.ui.weekOffset * 7);
    const days = [0, 1, 2, 3, 4].map(i => iso(addDays(start, i)));
    const byDate = checkInsByDate();
    const t = today();

    const head = `<div class="toolbar">
      <div class="seg"><button data-act="weekPrev" title="Vorige week">${icon("left", 16)}</button><button data-act="weekNow" class="${S.ui.weekOffset === 0 ? "active" : ""}">Deze week</button><button data-act="weekNext" title="Volgende week">${icon("right", 16)}</button></div>
      <div><b style="font-size:16px">Week ${isoWeek(start)}</b> <span class="muted">${fmt(start, { day: "numeric", month: "short" })} tot ${fmt(addDays(start, 4), { day: "numeric", month: "short" })}</span></div>
      <div class="grow"></div>
      <button class="btn primary" data-panel="checkin">${icon("edit", 16)}Check-in invullen</button>
    </div>`;

    const cols = days.map(day => {
      const ci = byDate[day];
      const isToday = day === t;
      const status = ci?.status === "published" ? `<span class="pill ok">${icon("check", 12)}Klaar</span>`
        : ci?.status === "draft" ? `<span class="pill warn">Concept</span>`
        : day < t ? `<span class="pill">Leeg</span>` : "";
      const items = (ci?.items || []).slice().sort((a, b) => (a.blockNumber || 0) - (b.blockNumber || 0));
      return `<div class="card day ${isToday ? "today" : ""} ${ci ? "clickable" : ""}" ${ci ? `data-ci="${day}"` : ""}>
        <div class="day-h"><div><div class="w">${fmt(day, { weekday: "long" })}</div><div class="n">${parse(day).getDate()}</div></div>${status}</div>
        ${items.length ? `<div class="mini">${items.map(it => `<div><b>${it.blockNumber ?? ""}</b> ${esc(it.description || "")}${it.estimatedDuration ? ` <span class="faint">· ${mins(it.estimatedDuration)}</span>` : ""}</div>`).join("")}</div>` : ""}
        ${ci?.yesterdayReflection ? `<div class="q">${esc(ci.yesterdayReflection)}</div>` : ""}
        ${!ci ? `<div class="empty" style="padding:18px 0;margin:auto 0;font-size:12.5px">${day > t ? "Nog niet gepland" : "Geen check-in"}</div>` : ""}
      </div>`;
    }).join("");

    // Lijst met eerdere check-ins
    const recent = (d?.checkIns || []).filter(c => c.date < iso(start) || c.date > days[4]).slice(0, 6);
    const hist = recent.length ? `<section class="card">
      <div class="card-h"><h2>Eerdere check-ins</h2></div>
      <div class="list">${recent.map(c => `<div class="item clickable" data-ci="${c.date}"><div class="blk">${parse(c.date).getDate()}</div><div class="body"><div class="cap">${fmt(c.date, { weekday: "long", day: "numeric", month: "long" })}</div><div class="meta"><span>${(c.items || []).length} blokken</span><span>${c.status === "published" ? "Gepubliceerd" : "Concept"}</span></div></div>${icon("right", 16)}</div>`).join("")}</div>
    </section>` : "";

    return head + `<div class="week">${cols}</div>` + hist;
  }

  function checkinDetail(date) {
    const ci = checkInsByDate()[date];
    if (!ci) return "";
    const labels = {};
    for (const s of S.data.checkin?.checkInSettings || []) if (!labels[s.fieldKey]) labels[s.fieldKey] = s.customLabel || s.fieldName;
    const fields = Object.keys(labels).length ? Object.keys(labels) : ["yesterday_reflection", "learnings_or_results", "today_items", "help_or_obstacles", "success_criteria"];
    const qa = fields.map(k => {
      if (k === "today_items") {
        const items = (ci.items || []).slice().sort((a, b) => (a.blockNumber || 0) - (b.blockNumber || 0));
        return `<div><dt>${esc(labels[k] || "Planning")}</dt><dd>${items.length ? `<ul class="list">${items.map(itemRow).join("")}</ul>` : `<span class="faint">Niets ingevuld</span>`}</dd></div>`;
      }
      const v = ci[camel(k)];
      return `<div><dt>${esc(labels[k] || k)}</dt><dd>${has(v) ? `<p class="prose">${esc(v)}</p>` : `<span class="faint">Niet ingevuld</span>`}</dd></div>`;
    }).join("");
    const extra = has(ci.checkoutReflection) ? `<div><dt>Check-out</dt><dd><p class="prose">${esc(ci.checkoutReflection)}</p></dd></div>` : "";
    return drawer(fmt(date, { weekday: "long", day: "numeric", month: "long" }),
      `<dl class="qa">${qa}${extra}</dl>`,
      `<button class="btn sm primary" data-panel="checkin">${icon("edit", 14)}Bewerken</button>`);
  }

  /* ---------- Challenges ---------- */

  function challengesView() {
    const d = S.data.challenges;
    if (d?._error) return errorCard(d._error);
    const all = d?.challenges || [];
    const active = all.filter(c => !has(c.endChallengeDate));
    const done = all.filter(c => has(c.endChallengeDate));
    const f = S.ui.chFilter;
    const q = S.ui.chQuery.trim().toLowerCase();
    let list = f === "active" ? active : f === "done" ? done : all;
    if (q) list = list.filter(c => [c.title, c.learningQuestion, c.pitch].some(t => String(t || "").toLowerCase().includes(q)));
    const full = (d?.openChallengesCount ?? 0) >= (d?.maxOpenChallenges ?? 99);

    const head = `<div class="toolbar">
      <div class="seg">
        <button data-chf="active" class="${f === "active" ? "active" : ""}">Actief<span class="n">${active.length}</span></button>
        <button data-chf="done" class="${f === "done" ? "active" : ""}">Afgerond<span class="n">${done.length}</span></button>
        <button data-chf="all" class="${f === "all" ? "active" : ""}">Alles<span class="n">${all.length}</span></button>
      </div>
      <label class="input">${icon("search", 16)}<input id="chq" placeholder="Zoek in challenges" value="${esc(S.ui.chQuery)}"></label>
      <div class="grow"></div>
      <span class="muted" style="font-size:12.5px">${d?.openChallengesCount ?? active.length} van ${d?.maxOpenChallenges ?? "?"} open</span>
      <button class="btn primary" data-panel="challenges" ${full ? 'title="Je hebt het maximum aantal open challenges bereikt"' : ""}>${icon("plus", 16)}Nieuwe challenge</button>
    </div>`;

    if (!list.length) return head + `<div class="card"><div class="empty"><div class="big">${icon("target", 26)}</div>${q ? "Geen challenges gevonden." : "Nog geen challenges in deze lijst."}</div></div>`;
    return head + `<div class="grid cols-auto">${list.map(challengeCard).join("")}</div>`;
  }

  function challengeCard(c) {
    const ph = phaseOf(c);
    const ppl = people();
    const wm = worldMap();
    const end = has(c.endChallengeDate) ? parse(c.endChallengeDate) : new Date();
    const total = daysBetween(c.startPreparationDate, end) + 1;
    const owner = c.ownerId === S.uid ? "Jij" : (ppl[c.ownerId] || "Onbekend");
    const collabs = (c.collaborators || []).map(id => ppl[id] || "?");
    return `<article class="card ch clickable" data-ch="${c.challengeId}">
      <div style="display:flex;gap:10px;align-items:flex-start">
        <h3 style="flex:1">${esc(c.title)}</h3>
        <span class="pill ${ph.idx === 3 ? "ok" : "acc"}">${ph.label}</span>
      </div>
      ${has(c.learningQuestion) ? `<p class="lq">${esc(c.learningQuestion)}</p>` : `<p class="lq faint">Nog geen leervraag</p>`}
      ${ph.idx < 3 ? stepper(c, true) : ""}
      ${(c.worlds || []).length ? `<div class="chips">${c.worlds.map(id => `<span class="chip" style="--c:${WORLD_COLORS[id] || "#888"}">${esc(wm[id]?.shortName || "Wereld")}</span>`).join("")}</div>` : ""}
      <div class="foot">
        <div class="faces">${[owner === "Jij" ? S.user?.name : ppl[c.ownerId], ...collabs].filter(Boolean).slice(0, 4).map(n => `<i style="--h:${hue(n)}" title="${esc(n)}">${esc(initials(n))}</i>`).join("")}</div>
        <span>${owner === "Jij" ? "Van jou" : "Van " + esc(firstName(owner))}</span>
        <span style="margin-left:auto">${icon("clock", 13)} ${total} dagen</span>
        ${has(c.scheduledPresentationDate) && ph.idx < 3 ? `<span class="pill warn">${icon("flag", 12)}${fmt(c.scheduledPresentationDate, { weekday: "short", day: "numeric", month: "short" })}</span>` : ""}
      </div>
    </article>`;
  }

  function challengeDetail() {
    const c = (S.data.challenges?.challenges || []).find(x => x.challengeId === S.ui.chDetail);
    if (!c) { S.ui.chDetail = null; return challengesView(); }
    const ph = phaseOf(c);
    const ppl = people();
    const pm = perspectiveMap();
    const wm = worldMap();
    const planned = S.data.checkin?.plannedMinutesByChallenge?.[c.challengeId];
    const t = d => has(d) ? fmt(d, { day: "numeric", month: "short" }) : "Nog niet";
    const phases = [
      ["Voorbereiding", c.startPreparationDate, 0],
      ["Uitvoering", c.startExecutionDate, 1],
      ["Evaluatie", c.startEvaluationDate, 2],
      ["Afgerond", c.endChallengeDate, 3]
    ];

    return `
      <div class="toolbar"><button class="btn ghost" data-act="chBack">${icon("left", 16)}Terug naar challenges</button><div class="grow"></div>
        <button class="btn primary" data-panel="challenges">${icon("edit", 16)}Bewerken in MyLearnQ</button></div>
      <section class="card">
        <div class="detail-h"><div style="flex:1">
          <span class="pill ${ph.idx === 3 ? "ok" : "acc"}">${ph.label}</span>
          <h2 style="margin-top:10px">${esc(c.title)}</h2>
          <p class="muted" style="margin:6px 0 0">Gemaakt door ${c.ownerId === S.uid ? "jou" : esc(ppl[c.ownerId] || "onbekend")} op ${fmt(c.creationDate, { day: "numeric", month: "long", year: "numeric" })}</p>
        </div></div>
        <div class="timeline" style="margin-top:18px">${phases.map(([l, d, i]) => `<div class="${ph.idx === i ? "on" : ""}"><b>${l}</b><span>${t(d)}</span>${i < 3 ? `<div class="bar" style="margin-top:8px"><i style="width:${ph.idx > i ? 100 : ph.idx === i ? ph.progress : 0}%"></i></div>` : ""}</div>`).join("")}</div>
      </section>
      <div class="grid dash">
        <div class="w-8" style="display:flex;flex-direction:column;gap:var(--gap)">
          ${has(c.learningQuestion) ? `<section class="card"><div class="card-h"><h2>Leervraag</h2></div><p class="prose" style="font-size:16px">${esc(c.learningQuestion)}</p></section>` : ""}
          ${has(c.pitch) ? `<section class="card"><div class="card-h"><h2>Pitch</h2></div><p class="prose">${esc(c.pitch)}</p></section>` : ""}
          ${(c.subQuestions || []).length ? `<section class="card"><div class="card-h"><h2>Deelvragen</h2><span class="pill more">${c.subQuestions.length}</span></div>
            <ul class="list">${c.subQuestions.map((q, i) => { const p = q.sourceId ? pm[q.sourceId] : null; return `<li class="item"><div class="blk">${i + 1}</div><div class="body">${esc(q.text)}${p ? `<div class="meta"><span class="chip" style="--c:${p.color}">${esc(p.title)}</span></div>` : ""}</div></li>`; }).join("")}</ul></section>` : ""}
        </div>
        <div class="w-4" style="display:flex;flex-direction:column;gap:var(--gap)">
          <section class="card"><div class="card-h"><h2>Details</h2></div>
            <div class="kv">
              <div class="row"><span class="muted">Totaal</span><b>${daysBetween(c.startPreparationDate, has(c.endChallengeDate) ? parse(c.endChallengeDate) : new Date()) + 1} dagen</b></div>
              ${planned ? `<div class="row"><span class="muted">Gepland in check-ins</span><b>${mins(planned)}</b></div>` : ""}
              ${has(c.scheduledPresentationDate) ? `<div class="row"><span class="muted">Presentatie</span><b>${fmt(c.scheduledPresentationDate, { weekday: "short", day: "numeric", month: "short" })}</b></div>` : ""}
              ${c.timeBudgetHours ? `<div class="row"><span class="muted">Tijdsbudget</span><b>${c.timeBudgetHours} uur</b></div>` : ""}
              <div class="row"><span class="muted">Schooljaar</span><b>${esc(c.schoolYear || "")}</b></div>
            </div></section>
          ${(c.collaborators || []).length ? `<section class="card"><div class="card-h"><h2>Deelnemers</h2></div>
            <div class="list">${c.collaborators.map(id => { const n = ppl[id] || "Onbekend"; return `<div class="row" style="justify-content:flex-start"><div class="faces"><i style="--h:${hue(n)}">${esc(initials(n))}</i></div>${esc(n)}</div>`; }).join("")}</div></section>` : ""}
          ${(c.worlds || []).length || (c.perspectives || []).length ? `<section class="card"><div class="card-h"><h2>Werelden en vensters</h2></div>
            <div class="chips">${(c.worlds || []).map(id => `<span class="chip" style="--c:${WORLD_COLORS[id] || "#888"}">${esc(wm[id]?.name || "Wereld")}</span>`).join("")}</div>
            <div class="chips" style="margin-top:8px">${(c.perspectives || []).map(id => pm[id] ? `<span class="chip" style="--c:${pm[id].color}">${esc(pm[id].title)}</span>` : "").join("")}</div></section>` : ""}
        </div>
      </div>`;
  }

  /* ---------- Ideeën ---------- */

  function notesView() {
    const d = S.data.notes;
    if (d?._error) return errorCard(d._error);
    const notes = d?.notes || [];
    const head = `<div class="toolbar"><div class="grow"></div><button class="btn primary" data-panel="notes">${icon("plus", 16)}Nieuw idee</button></div>`;
    if (!notes.length) {
      return head + `<div class="card"><div class="empty" style="padding:70px 16px"><div class="big">${icon("book", 26)}</div>
        <h2 style="margin:0;color:var(--text);font-size:18px">Nog geen ideeën</h2>
        <p style="margin:0;max-width:340px">Schrijf hier ideeën op voor toekomstige challenges, zodat je ze niet vergeet.</p>
        <button class="btn primary" data-panel="notes">${icon("plus", 16)}Eerste idee toevoegen</button></div></div>`;
    }
    // Het precieze formaat van een notitie is onbekend, dus we kiezen de meest logische velden
    const pick = (n, ks) => { for (const k of ks) if (has(n[k])) return n[k]; return ""; };
    return head + `<div class="grid cols-auto">${notes.map(n => `
      <article class="card ch clickable" data-panel="notes">
        <h3>${esc(pick(n, ["title", "name", "subject"]) || "Idee")}</h3>
        <p class="lq" style="-webkit-line-clamp:5">${esc(pick(n, ["content", "description", "text", "body"]))}</p>
        <div class="foot">${has(n.createdAt || n.creationDate) ? `<span>${fmt(n.createdAt || n.creationDate, { day: "numeric", month: "short", year: "numeric" })}</span>` : ""}</div>
      </article>`).join("")}</div>`;
  }

  /* ---------- Groei ---------- */

  function growthView() {
    const d = S.data.growth;
    if (d?._error) return errorCard(d._error);
    const cv = d?.coreValueScores || [];
    const dist = d?.worldDistribution;

    const intro = `<section class="card hero">
      <div><div class="eyebrow">${esc(d?.intro?.title || "Mijn jaar in beeld")}</div>
        <h2>${d?.latestEntry ? "Jouw groei" : "Nog geen reflectie"}</h2>
        <p>${esc(d?.intro?.description || "")}</p>
        <button class="btn primary" style="margin-top:14px" data-panel="growth">${icon("edit", 16)}${d?.latestEntry ? "Reflectie bekijken" : "Reflectie invullen"}</button>
      </div>
      <div class="stats">
        <div class="stat"><b>${d?.challengeCount ?? 0}</b><span>Challenges</span></div>
        ${!S.settings.hideSessions && d?.sessionAttendance ? `<div class="stat"><b>${d.sessionAttendance.attended}<small class="faint" style="font-size:14px">/${d.sessionAttendance.total}</small></b><span>Sessies</span></div>` : ""}
        ${dist?.favorite ? `<div class="stat"><b style="font-size:17px;padding:4px 0">${esc(dist.favorite.shortName)}</b><span>Favoriete wereld</span></div>` : ""}
      </div>
    </section>`;

    const cards = cv.map(c => {
      return `<section class="card" style="display:flex;gap:16px;align-items:flex-start">
        <div class="score"><b>${(c.studentScore || 0).toFixed(1)}</b><span>/5</span></div>
        <div style="flex:1;min-width:0"><h3 style="margin:2px 0 2px;font-size:16px">${esc(c.title)}</h3>
          <p class="muted" style="margin:0 0 10px;font-size:13px">${esc(c.subtitle || "")}</p>
          <div class="chips">${(c.skillKeys || []).map(s => `<span class="chip">${esc(s)}</span>`).join("")}</div>
          ${c.coachScore != null ? `<p class="muted" style="margin:10px 0 0;font-size:12.5px">Coach: <b style="color:var(--text)">${Number(c.coachScore).toFixed(1)}</b></p>` : ""}
        </div>
      </section>`;
    }).join("");

    const worlds = dist?.worlds?.length ? `<section class="card">
      <div class="card-h"><h2>Verdeling over werelden</h2></div>
      <div class="donut-row">${donut(dist)}
        <div class="legend">${dist.worlds.map(w => `<div style="--c:${WORLD_COLORS[w.worldId] || "#888"}"><i></i>${esc(w.name)}<span>${w.count}</span></div>`).join("")}</div></div>
    </section>` : "";

    const notes = (d?.coachNotes || []).length ? `<section class="card"><div class="card-h"><h2>Notities van je coach</h2></div>
      <div class="list">${d.coachNotes.map(n => `<div class="item"><div class="body">${esc(n.content || n.text || n.note || "")}</div></div>`).join("")}</div></section>` : "";

    return intro + (cards ? `<div class="grid cols-auto">${cards}</div>` : "") + `<div class="grid dash"><div class="w-7">${worlds}</div><div class="w-5">${notes}</div></div>`;
  }

  function errorCard(msg) {
    return `<div class="card"><div class="empty"><div class="big">${icon("x", 24)}</div>Kon gegevens niet laden (${esc(msg)}).<button class="btn" data-act="refresh">${icon("refresh", 16)}Opnieuw proberen</button></div></div>`;
  }

  /* ---------- Chat ---------- */

  const seenMsgs = new Set();
  let chatPrimed = false;

  function chatView() {
    if (S.chatErr) return errorCard("Chat kon niet starten: " + S.chatErr);
    if (!S.chatReady) return `<div class="card"><div class="loader" style="height:240px"><div class="spin"></div></div></div>`;
    const rooms = LQChat.rooms;
    if (S.ui.room && !rooms.some(r => r.id === S.ui.room)) S.ui.room = null;
    const active = rooms.find(r => r.id === S.ui.room);

    const roomList = rooms.length ? rooms.map(r => {
      const last = LQChat.messages(r.id).at(-1);
      const n = LQChat.unread(r.id);
      return `<button class="room ${r.id === S.ui.room ? "active" : ""}" data-room="${r.id}">
        <div class="t">${esc(r.label)}${n ? `<em>${n}</em>` : ""}</div>
        <div class="p">${last ? esc((last.mine ? "Jij: " : firstWord(last.name) + ": ") + last.text) : "Nog geen berichten"}</div>
      </button>`;
    }).join("") : `<div class="empty" style="padding:28px 16px;font-size:13px">Je zit nog in geen enkele kamer.</div>`;

    return `<div class="card chat ${active ? "has-room" : ""}">
      <div class="chat-rooms">
        <div class="head">
          <button class="btn sm" data-act="chatNew">${icon("plus", 14)}Nieuw</button>
          <button class="btn sm" data-act="chatJoin">${icon("join", 14)}Deelnemen</button>
        </div>
        <div class="list">${roomList}</div>
        <div class="lock" style="padding-top:10px">${icon("lock", 12)} Jouw sleutel: <span class="fp-me">${esc(LQChat.me?.fp || "")}</span></div>
      </div>
      <div class="chat-main">${active ? chatRoom(active) : chatIntro()}</div>
    </div>`;
  }

  const firstWord = n => String(n || "").split(" ")[0];

  function chatIntro() {
    return `<div class="empty" style="margin:auto;max-width:400px">
      <div class="big">${icon("chat", 30)}</div>
      <h2>Versleutelde chat</h2>
      <p style="margin:0">Maak een kamer en deel de geheime code met je klasgenoten, of doe mee met een code die je hebt gekregen. Berichten worden in je browser versleuteld voordat ze verstuurd worden.</p>
      <div style="display:flex;gap:8px;margin-top:6px"><button class="btn primary" data-act="chatNew">${icon("plus", 15)}Nieuwe kamer</button><button class="btn" data-act="chatJoin">Code invoeren</button></div>
    </div>`;
  }

  function chatRoom(r) {
    const msgs = LQChat.messages(r.id);
    const people = new Set(msgs.map(m => m.fp));
    const rejected = LQChat.rejected(r.id).length;
    let lastDay = "", lastWho = "";
    const items = msgs.map(m => {
      const d = new Date(m.ts);
      const day = iso(d);
      let out = "";
      if (day !== lastDay) {
        out += `<div class="day-sep">${day === today() ? "Vandaag" : esc(fmt(d, { weekday: "long", day: "numeric", month: "long" }))}</div>`;
        lastDay = day;
        lastWho = "";
      }
      const isNew = chatPrimed && !seenMsgs.has(m.id);
      seenMsgs.add(m.id);
      const who = m.fp + day;
      const showWho = who !== lastWho;
      lastWho = who;
      out += `<div class="msg ${m.mine ? "mine" : ""} ${isNew ? "new" : ""}">
        ${showWho ? `<div class="who">${m.mine ? "Jij" : esc(m.name)}<span class="fp" title="Sleutelvingerafdruk van de afzender">${esc(m.fp.slice(0, 9))}</span>${m.keyChanged ? `<span class="warnk" title="Deze naam gebruikte eerder een andere sleutel. Controleer of dit echt dezelfde persoon is.">andere sleutel</span>` : ""}</div>` : ""}
        <div class="bubble">${esc(m.text)}</div>
        <div class="time">${d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}</div>
      </div>`;
      return out;
    }).join("");
    chatPrimed = true;

    return `<div class="chat-head">
        <button class="btn ghost icon only-mobile" data-act="chatBack" title="Terug">${icon("left", 16)}</button>
        <div><h3>${esc(r.label)}</h3>
          <div class="sub">${icon("lock", 12)} End-to-end versleuteld · ${Math.max(1, people.size)} ${people.size > 1 ? "personen" : "persoon"} · ${esc(LQChat.status(r.id))}</div></div>
        <div class="actions">
          <button class="btn ghost sm" data-act="copyCode" data-code="${esc(r.code)}" title="Kamercode kopiëren">${icon("copy", 14)}Code</button>
          <button class="btn ghost icon" data-act="chatInfo" title="Beveiliging en instellingen">${icon("shield", 16)}</button>
        </div>
      </div>
      <div class="msgs">${items || `<div class="empty" style="margin:auto">Nog geen berichten. Zeg hallo!</div>`}
        ${rejected ? `<div class="day-sep">${rejected} bericht${rejected === 1 ? "" : "en"} geweigerd omdat de beveiligingscontrole faalde</div>` : ""}
      </div>
      <div class="composer">
        <textarea id="composer" rows="1" maxlength="${LQChat.MAX_TEXT}" placeholder="Schrijf een bericht"></textarea>
        <button class="btn primary" data-act="chatSend">${icon("send", 15)}Stuur</button>
      </div>
      <div class="lock">${icon("lock", 11)} AES-256-GCM in twee lagen, elk bericht ondertekend met ECDSA</div>`;
  }

  function chatDrawer(dr) {
    if (dr.type === "chatNew") {
      return drawer("Nieuwe kamer", `
        <div class="field"><label for="room-label">Naam van de kamer</label><input id="room-label" placeholder="Bijvoorbeeld: Project Theologie" maxlength="40"></div>
        <p class="note">Er wordt een willekeurige geheime code van 20 tekens gemaakt. Alleen wie die code heeft kan de berichten lezen.</p>
        <div style="margin-top:16px"><button class="btn primary" data-act="chatCreate">Kamer maken</button></div>`);
    }
    if (dr.type === "chatCreated") {
      return drawer("Kamer gemaakt", `
        <p style="margin:0 0 12px">Deel deze code met de mensen die mee mogen praten. Stuur hem bij voorkeur persoonlijk, niet in een openbare groep.</p>
        <div class="code">${esc(LQChat.prettyCode(dr.code))}</div>
        <div style="display:flex;gap:8px;margin-top:14px"><button class="btn" data-act="copyCode" data-code="${esc(dr.code)}">${icon("copy", 14)}Kopiëren</button><button class="btn primary" data-act="closeDrawer">Naar de kamer</button></div>
        <p class="note warn" style="margin-top:18px">Wie deze code kent, kan alle berichten in deze kamer lezen. Raak je hem kwijt of lekt hij uit, maak dan een nieuwe kamer.</p>`);
    }
    if (dr.type === "chatJoin") {
      return drawer("Deelnemen aan kamer", `
        ${dr.error ? `<p class="err">${esc(dr.error)}</p>` : ""}
        <div class="field"><label for="join-code">Kamercode</label><input id="join-code" placeholder="XXXX XXXX XXXX XXXX XXXX" autocomplete="off" spellcheck="false" style="font-family:Consolas,monospace;letter-spacing:.06em"></div>
        <div class="field"><label for="join-label">Naam voor jezelf (optioneel)</label><input id="join-label" placeholder="Hoe deze kamer bij jou heet" maxlength="40"><small>Alleen zichtbaar op jouw computer.</small></div>
        <button class="btn primary" data-act="chatDoJoin">Deelnemen</button>`);
    }
    if (dr.type === "chatInfo") {
      const r = LQChat.rooms.find(x => x.id === dr.id);
      if (!r) return "";
      const senders = {};
      for (const m of LQChat.messages(r.id)) senders[m.fp] = m.mine ? "Jij" : m.name;
      return drawer("Beveiliging", `
        <div class="set"><h3>Naam</h3>
          <div style="display:flex;gap:8px"><div class="field" style="flex:1;margin:0"><input id="rename" value="${esc(r.label)}" maxlength="40"></div><button class="btn" data-act="chatRename" data-id="${r.id}">Opslaan</button></div>
        </div>
        <div class="set"><h3>Kamercode</h3>
          <div class="code" style="font-size:15px">${esc(LQChat.prettyCode(r.code))}</div>
          <button class="btn sm" data-act="copyCode" data-code="${esc(r.code)}" style="align-self:flex-start">${icon("copy", 13)}Kopiëren</button>
        </div>
        <div class="set"><h3>Hoe je berichten beschermd zijn</h3>
          <div class="kv">
            <div class="row"><span>Binnenste laag</span><b>AES-256-GCM, sleutel uit kamercode</b></div>
            <div class="row"><span>Buitenste laag</span><b>AES-256-GCM, appsleutel</b></div>
            <div class="row"><span>Sleutelafleiding</span><b>PBKDF2-SHA256, 250.000×</b></div>
            <div class="row"><span>Afzender</span><b>ECDSA P-256 handtekening</b></div>
            <div class="row"><span>Tegen herhaling</span><b>uniek ID + tijdstempel</b></div>
          </div>
          <p class="note">De relay (ntfy.sh) ziet alleen versleutelde tekst en een willekeurige kanaalnaam. Hij bewaart berichten maximaal 12 uur; je eigen geschiedenis staat versleuteld op deze computer.</p>
        </div>
        <div class="set"><h3>Sleutels in deze kamer</h3>
          <p class="muted" style="margin:0;font-size:12.5px">Vergelijk een vingerafdruk met de persoon zelf om zeker te weten dat je met de echte persoon praat.</p>
          <div class="kv">${Object.entries(senders).map(([fp, n]) => `<div class="row"><span>${esc(n)}</span><b class="fp-me" style="font-size:12px">${esc(fp)}</b></div>`).join("") || `<div class="row"><span class="muted">Nog niemand</span></div>`}</div>
        </div>
        <div class="set"><button class="btn danger" data-act="chatLeave" data-id="${r.id}">${icon("leave", 14)}Kamer verlaten</button></div>`);
    }
    return "";
  }

  async function chatAction(act, el) {
    try {
      if (act === "chatNew") { S.ui.drawer = { type: "chatNew" }; render(); focusIn("#room-label"); return; }
      if (act === "chatJoin") { S.ui.drawer = { type: "chatJoin" }; render(); focusIn("#join-code"); return; }
      if (act === "chatCreate") {
        const label = overlayEl.querySelector("#room-label")?.value.trim() || "Nieuwe kamer";
        const { id, code } = await LQChat.createRoom(label);
        S.ui.room = id;
        S.ui.drawer = { type: "chatCreated", id, code };
        return render();
      }
      if (act === "chatDoJoin") {
        const code = overlayEl.querySelector("#join-code")?.value || "";
        const label = overlayEl.querySelector("#join-label")?.value.trim();
        try {
          S.ui.room = await LQChat.joinRoom(code, label);
          S.ui.drawer = null;
        } catch (e) {
          S.ui.drawer = { type: "chatJoin", error: e.message };
        }
        return render();
      }
      if (act === "chatSend") return sendComposer();
      if (act === "chatInfo") { S.ui.drawer = { type: "chatInfo", id: S.ui.room }; return render(); }
      if (act === "chatBack") { S.ui.room = null; return render(); }
      if (act === "chatRename") {
        const v = overlayEl.querySelector("#rename")?.value.trim();
        if (v) await LQChat.renameRoom(el.dataset.id, v);
        toast("Naam opgeslagen");
        return;
      }
      if (act === "chatLeave") {
        if (!confirm("Kamer verlaten? Je berichtgeschiedenis op deze computer wordt gewist.")) return;
        await LQChat.leaveRoom(el.dataset.id);
        S.ui.room = null;
        S.ui.drawer = null;
        return render();
      }
      if (act === "copyCode") {
        await navigator.clipboard.writeText(LQChat.prettyCode(el.dataset.code));
        toast("Code gekopieerd");
      }
    } catch (e) {
      toast(e.message || "Er ging iets mis");
    }
  }

  function focusIn(sel) { setTimeout(() => overlayEl.querySelector(sel)?.focus(), 30); }

  let sending = false;
  async function sendComposer() {
    const ta = shellEl.querySelector("#composer");
    if (!ta || sending || !ta.value.trim()) return;
    const text = ta.value;
    sending = true;
    ta.value = "";
    try {
      await LQChat.send(S.ui.room, text);
    } catch (e) {
      const t = shellEl.querySelector("#composer");
      if (t && !t.value) t.value = text;
      toast(e.message || "Versturen mislukt");
    } finally {
      sending = false;
      shellEl.querySelector("#composer")?.focus();
    }
  }

  function onChatUpdate() {
    if (S.view === "chat" && S.ui.room && document.visibilityState === "visible") LQChat.markRead(S.ui.room);
    // Een open formulier in een lade niet verstoren
    if (S.ui.drawer && /^chat(New|Join)$/.test(S.ui.drawer.type)) return;
    render();
  }

  /* ---------- Lades en panelen ---------- */

  function drawer(title, body, actions = "", wide = false) {
    return `<div class="scrim" data-act="closeDrawer"></div>
      <aside class="drawer ${wide ? "wide" : ""}">
        <div class="drawer-h"><h2 class="cap">${esc(title)}</h2><div class="actions">${actions}<button class="btn ghost icon" data-act="closeDrawer" title="Sluiten">${icon("x")}</button></div></div>
        ${body.startsWith("<iframe") ? body : `<div class="drawer-b">${body}</div>`}
      </aside>`;
  }

  function overlayHtml() {
    const dr = S.ui.drawer;
    if (!dr) return "";
    if (dr.type === "ci") return checkinDetail(dr.date);
    if (dr.type === "settings") return settingsDrawer();
    if (dr.type.startsWith("chat")) return chatDrawer(dr);
    if (dr.type === "panel") {
      const url = ROUTES[dr.route](S.uid);
      return drawer(dr.title, `<iframe src="${url}" title="${esc(dr.title)}"></iframe>`,
        `<a class="btn sm ghost" href="${url}" target="_blank" rel="noopener">${icon("external", 14)}Nieuw tabblad</a>`, true);
    }
    return "";
  }

  const PANEL_TITLES = { checkin: "Check-in", challenges: "Challenges", notes: "Ideeën", growth: "Groei in beeld" };

  function settingsDrawer() {
    const s = S.settings;
    const seg = (key, opts) => `<div class="seg full">${opts.map(([v, l]) => `<button data-set="${key}" data-val="${v}" class="${s[key] === v ? "active" : ""}">${l}</button>`).join("")}</div>`;
    const sw = (key, label) => `<label class="row"><span>${label}</span><span class="switch"><input type="checkbox" data-setb="${key}" ${s[key] ? "checked" : ""}><span></span></span></label>`;
    const sel = (key, label, opts) => `<label class="row"><span>${label}</span><select data-sets="${key}">${opts.map(([v, l]) => `<option value="${v}" ${String(s[key]) === v ? "selected" : ""}>${l}</option>`).join("")}</select></label>`;
    const widgets = normalizedWidgets();

    const body = `
      <div class="set"><h3>Kleur</h3>
        <div class="swatches">${LQ_PRESETS.map(p => `<button class="swatch ${p.accent.toLowerCase() === s.accent.toLowerCase() ? "active" : ""}" style="--c:${p.accent}" title="${p.name}" data-set="accent" data-val="${p.accent}"></button>`).join("")}</div>
        <label class="row"><span>Eigen kleur</span><input type="color" data-setc="accent" value="${esc(s.accent)}"></label>
      </div>
      <div class="set"><h3>Thema</h3>
        ${seg("theme", [["site", "Auto"], ["light", "Licht"], ["dark", "Donker"]])}
        ${sel("surface", "Oppervlak", [["zinc", "Neutraal"], ["midnight", "Middernacht"], ["stone", "Warm"], ["tinted", "Getint met accent"]])}
        ${sel("background", "Achtergrond", [["plain", "Effen"], ["grid", "Raster"], ["dots", "Stippen"]])}
        ${sw("glass", "Glaseffect")}
        ${sw("motion", "Animaties")}
      </div>
      <div class="set"><h3>Lay-out</h3>
        ${seg("layout", [["sidebar", "Zijbalk"], ["topbar", "Bovenbalk"]])}
        ${s.layout === "sidebar" ? sw("sidebarCompact", "Compacte zijbalk") : ""}
        ${seg("density", [["cozy", "Ruim"], ["normal", "Normaal"], ["compact", "Compact"]])}
        ${sel("startView", "Startpagina", NAV.map(n => [n.id, n.label]))}
      </div>
      <div class="set"><h3>Vorm en tekst</h3>
        <label class="row"><span>Afronding <span class="muted">${s.radius}px</span></span><input type="range" min="0" max="30" data-setr="radius" value="${s.radius}"></label>
        <label class="row"><span>Tekstgrootte <span class="muted">${s.scale}%</span></span><input type="range" min="85" max="125" step="5" data-setr="scale" value="${s.scale}"></label>
        ${sel("font", "Lettertype", [["modern", "Modern"], ["rounded", "Rond"], ["serif", "Klassiek"], ["mono", "Code"]])}
      </div>
      <div class="set"><h3>Dashboard</h3>
        <div class="wl">${widgets.map((w, i) => `<div>
          <span class="switch"><input type="checkbox" data-widget="${w.id}" ${w.on ? "checked" : ""}><span></span></span>
          <span>${esc(LQ_WIDGETS.find(x => x.id === w.id).name)}</span>
          <button class="btn ghost icon" data-wmove="${i}" data-dir="-1" ${i === 0 ? "disabled" : ""} title="Omhoog">${icon("up", 15)}</button>
          <button class="btn ghost icon" data-wmove="${i}" data-dir="1" ${i === widgets.length - 1 ? "disabled" : ""} title="Omlaag">${icon("down", 15)}</button>
        </div>`).join("")}</div>
        ${sw("hideSessions", "Inspiratiesessies verbergen")}
      </div>
      <div class="set"><h3>Weergave</h3>
        ${seg("mode", [["rewrite", "Nieuwe UI"], ["classic", "Klassiek"], ["off", "Uit"]])}
        <button class="btn ghost" data-act="reset">Alles terugzetten</button>
      </div>`;
    return drawer("Aanpassen", body);
  }

  /* ---------- Interactie ---------- */

  function save(patch) {
    S.settings = { ...S.settings, ...patch };
    chrome.storage.sync.set(patch);
    render();
  }

  function setView(v) {
    S.view = v;
    S.ui.chDetail = null;
    try { sessionStorage.setItem("lq-view", v); } catch (e) {}
    render();
  }

  function refreshAll() {
    // Oude gegevens blijven zichtbaar tot de nieuwe binnen zijn
    Object.keys(S.data).forEach(k => ensure(k, true));
  }

  function toast(msg) {
    toastEl.innerHTML = `<div class="toast">${esc(msg)}</div>`;
    clearTimeout(toast.t);
    toast.t = setTimeout(() => { toastEl.innerHTML = ""; }, 2200);
  }

  app.addEventListener("click", e => {
    const el = e.target.closest("[data-nav],[data-act],[data-panel],[data-ch],[data-ci],[data-chf],[data-set],[data-wmove],[data-room]");
    if (!el || !app.contains(el)) return;
    const ds = el.dataset;

    if (ds.nav) return setView(ds.nav);
    if (ds.panel) {
      e.stopPropagation();
      S.ui.drawer = { type: "panel", route: ds.panel, title: PANEL_TITLES[ds.panel] };
      return render();
    }
    if (ds.ch) { S.view = "challenges"; S.ui.chDetail = Number(ds.ch); return render(); }
    if (ds.ci) { S.ui.drawer = { type: "ci", date: ds.ci }; return render(); }
    if (ds.chf) { S.ui.chFilter = ds.chf; return render(); }
    if (ds.room) { S.ui.room = ds.room; LQChat.markRead(ds.room); return render(); }
    if (ds.act && ds.act.startsWith("chat") || ds.act === "copyCode") return chatAction(ds.act, el);
    if (ds.set) return save({ [ds.set]: ds.val });
    if (ds.wmove) {
      const list = normalizedWidgets();
      const i = Number(ds.wmove), j = i + Number(ds.dir);
      [list[i], list[j]] = [list[j], list[i]];
      return save({ widgets: list });
    }

    switch (ds.act) {
      case "customize": S.ui.drawer = { type: "settings" }; return render();
      case "closeDrawer": {
        const wasPanel = S.ui.drawer?.type === "panel";
        S.ui.drawer = null;
        if (wasPanel) { refreshAll(); toast("Gegevens bijgewerkt"); } else render();
        return;
      }
      case "toggleTheme": return save({ theme: isDark() ? "light" : "dark" });
      case "toggleCompact": return save({ sidebarCompact: !S.settings.sidebarCompact });
      case "classic": return save({ mode: "classic" });
      case "refresh": refreshAll(); return toast("Vernieuwd");
      case "relogin": location.href = "/login"; return;
      case "chBack": S.ui.chDetail = null; return render();
      case "weekPrev": S.ui.weekOffset--; return render();
      case "weekNext": S.ui.weekOffset++; return render();
      case "weekNow": S.ui.weekOffset = 0; return render();
      case "reset": return save({ ...LQ_DEFAULTS, mode: "rewrite" });
    }
  });

  app.addEventListener("change", e => {
    const t = e.target;
    if (t.dataset.setb) return save({ [t.dataset.setb]: t.checked });
    if (t.dataset.sets) return save({ [t.dataset.sets]: t.value });
    if (t.dataset.setr) return save({ [t.dataset.setr]: Number(t.value) });
    if (t.dataset.setc) return save({ [t.dataset.setc]: t.value });
    if (t.dataset.widget) {
      const list = normalizedWidgets().map(w => w.id === t.dataset.widget ? { ...w, on: t.checked } : w);
      return save({ widgets: list });
    }
  });

  // Live voorbeeld tijdens het slepen, zonder elke stap op te slaan
  app.addEventListener("input", e => {
    const t = e.target;
    if (t.dataset.setr) {
      S.settings[t.dataset.setr] = Number(t.value);
      applyTheme();
      const lbl = t.closest(".row")?.querySelector(".muted");
      if (lbl) lbl.textContent = t.value + (t.dataset.setr === "radius" ? "px" : "%");
    }
    if (t.dataset.setc) { S.settings.accent = t.value; applyTheme(); }
    if (t.id === "chq") {
      S.ui.chQuery = t.value;
      const pos = t.selectionStart;
      render();
      const inp = shellEl.querySelector("#chq");
      inp.focus();
      inp.setSelectionRange(pos, pos);
    }
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && S.ui.drawer) { S.ui.drawer = null; render(); }
  });
  app.addEventListener("keydown", e => {
    const t = e.target;
    if (t.id === "composer" && e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendComposer(); }
    if (t.id === "join-code" && e.key === "Enter") chatAction("chatDoJoin");
    if (t.id === "room-label" && e.key === "Enter") chatAction("chatCreate");
  });
  app.addEventListener("input", e => {
    if (e.target.id === "composer") { e.target.style.height = "auto"; e.target.style.height = Math.min(140, e.target.scrollHeight) + "px"; }
  });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => S.settings.theme === "site" && render());

  /* ---------- Opstarten ---------- */

  function initialView() {
    const p = location.pathname;
    if (p.startsWith("/checkin")) return "checkin";
    if (p.startsWith("/challenges")) return "challenges";
    if (p.startsWith("/notion")) return "notes";
    if (p.startsWith("/growth")) return "growth";
    if (sessionStorage.getItem("lq-view") === "chat") return "chat";
    let v = null;
    try { v = sessionStorage.getItem("lq-view"); } catch (e) {}
    return v || S.settings.startView || "dashboard";
  }

  async function boot() {
    mount();
    shellEl.innerHTML = `<div class="main" style="grid-column:1/-1"><div class="loader"><div class="spin"></div></div></div>`;
    applyTheme();
    try {
      const root = await fetchRoute("/student");
      S.user = root.dbUser || root.user;
      S.uid = S.user?.userId;
      if (!S.uid) throw new AuthError();
    } catch (e) {
      S.error = "auth";
      return render();
    }
    S.view = initialView();
    render();
    const parts = String(S.user.name || "").split(",");
    const display = ((parts[1] || parts[0]).trim().split(" ")[0] + " " + (parts[1] ? parts[0].trim()[0] + "." : "")).trim();
    LQChat.init(display, onChatUpdate)
      .then(() => { S.chatReady = true; render(); })
      .catch(e => { S.chatErr = e.message || String(e); render(); });
  }

  chrome.storage.sync.get(LQ_DEFAULTS, stored => {
    S.settings = { ...LQ_DEFAULTS, ...stored };
    if (S.settings.mode === "rewrite") boot();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    const was = S.settings.mode;
    for (const [k, { newValue }] of Object.entries(changes)) S.settings[k] = newValue;
    if (changes.mode && was !== S.settings.mode) {
      if (S.settings.mode === "rewrite") { if (!S.uid) boot(); else { mount(); render(); } }
      else host.remove();
      return;
    }
    if (S.settings.mode === "rewrite" && S.uid) render();
  });
})();
