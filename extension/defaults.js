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
  layout: "sidebar",    // sidebar | topbar
  sidebarCompact: false,
  density: "normal",    // cozy | normal | compact
  startView: "dashboard",
  widgets: LQ_WIDGETS.map(w => ({ id: w.id, on: true }))
};

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
  mono: '"Cascadia Code", "JetBrains Mono", Consolas, ui-monospace, monospace'
};
