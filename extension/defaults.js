// Standaardinstellingen, gedeeld door alle scripts van de extensie
const LQ_WIDGETS = [
  { id: "today", name: "Vandaag" },
  { id: "streak", name: "Check-in ritme" },
  { id: "challenges", name: "Actieve challenges" },
  { id: "growth", name: "Kernwaarden" },
  { id: "worlds", name: "Werelden" },
  { id: "quick", name: "Snel naar" }
];

const LQ_DEFAULTS = {
  mode: "rewrite",      // rewrite (nieuwe UI) | classic (alleen restyle) | off
  enabled: true,
  accent: "#3f7f6e",
  theme: "site",        // site | light | dark
  surface: "zinc",      // zinc | midnight | stone | tinted
  background: "plain",  // plain | grid | dots
  radius: 8,
  font: "modern",       // modern | rounded | serif | mono
  scale: 100,
  glass: false,
  motion: true,
  hideSessions: true,
  block4: true,         // 4e werkblok tonen bij het plannen van taken
  layout: "sidebar",    // sidebar | topbar
  sidebarCompact: false,
  density: "normal",    // cozy | normal | compact
  startView: "dashboard",
  widgets: LQ_WIDGETS.map(w => ({ id: w.id, on: true })),
  accent2: "#7c5cff",   // tweede kleur voor verlopen
  gradient: false,      // knoppen en balken met een verloop van accent naar accent2
  cards: "default",     // default | float | flat | outline
  sideStyle: "default", // default | tinted | blend
  side: "left",         // left | right
  width: "normal",      // narrow | normal | wide | full
  iconWeight: "normal", // thin | normal | bold
  bgBlur: 8,            // achtergrondafbeelding: vervagen in px
  bgDim: 55,            // achtergrondafbeelding: verduisteren in procenten
  nickname: ""          // naam in de begroeting, leeg is je voornaam
};

// Kant-en-klare looks: elke look zet een groep instellingen tegelijk
const LQ_LOOKS = [
  { name: "Standaard", set: { theme: "site", surface: "zinc", accent: "#3f7f6e", gradient: false, background: "plain", glass: false, cards: "default", sideStyle: "default", font: "modern", radius: 8, iconWeight: "normal" } },
  { name: "Neon", set: { theme: "dark", surface: "midnight", accent: "#22d3ee", accent2: "#a855f7", gradient: true, background: "aurora", glass: true, cards: "default", sideStyle: "blend", font: "modern", radius: 14, iconWeight: "normal" } },
  { name: "Oceaan", set: { theme: "dark", surface: "midnight", accent: "#0ea5e9", accent2: "#14b8a6", gradient: true, background: "gradient", glass: true, cards: "float", sideStyle: "blend", font: "rounded", radius: 16, iconWeight: "normal" } },
  { name: "Pastel", set: { theme: "light", surface: "tinted", accent: "#e0648f", accent2: "#8b5cf6", gradient: true, background: "gradient", glass: false, cards: "float", sideStyle: "tinted", font: "rounded", radius: 20, iconWeight: "normal" } },
  { name: "Papier", set: { theme: "light", surface: "stone", accent: "#b05a32", gradient: false, background: "dots", glass: false, cards: "flat", sideStyle: "default", font: "serif", radius: 4, iconWeight: "thin" } },
  { name: "Terminal", set: { theme: "dark", surface: "zinc", accent: "#22c55e", gradient: false, background: "grid", glass: false, cards: "outline", sideStyle: "default", font: "mono", radius: 0, iconWeight: "bold" } },
  { name: "Zonsondergang", set: { theme: "dark", surface: "stone", accent: "#f97316", accent2: "#e11d48", gradient: true, background: "aurora", glass: true, cards: "float", sideStyle: "blend", font: "modern", radius: 12, iconWeight: "normal" } },
  { name: "Strak", set: { theme: "light", surface: "zinc", accent: "#18181b", gradient: false, background: "plain", glass: false, cards: "outline", sideStyle: "default", font: "condensed", radius: 2, iconWeight: "bold" } }
];

const LQ_PRESETS = [
  { name: "Opal", accent: "#3f7f6e" },
  { name: "Inkt", accent: "#3563c9" },
  { name: "Zee", accent: "#0f7c8c" },
  { name: "Bos", accent: "#4d7c32" },
  { name: "Klei", accent: "#b05a32" },
  { name: "Oker", accent: "#b28a1e" },
  { name: "Pruim", accent: "#85406f" },
  { name: "Grafiet", accent: "#5b6472" }
];

const LQ_FONTS = {
  modern: '"Inter", "Segoe UI Variable Text", "Segoe UI", system-ui, sans-serif',
  rounded: 'ui-rounded, "Nunito", "Quicksand", "Segoe UI Variable Text", system-ui, sans-serif',
  serif: '"Iowan Old Style", "Charter", Georgia, "Times New Roman", serif',
  mono: '"Cascadia Code", "JetBrains Mono", Consolas, ui-monospace, monospace',
  condensed: '"Bahnschrift", "DIN Alternate", "Arial Narrow", system-ui, sans-serif',
  hand: '"Segoe Print", "Bradley Hand", "Comic Sans MS", cursive',
  elegant: '"Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif'
};
