// Draait in elk frame. Zet de weergavemodus vroeg (tegen flitsen) en past de
// restyle toe in de klassieke modus en in de bewerkpanelen van de nieuwe UI.
(() => {
  const root = document.documentElement;
  const isEmbed = window !== window.top;
  const isAuthPage = /^\/(login|auth|logout)/.test(location.pathname);
  let settings = { ...LQ_DEFAULTS };

  if (isEmbed) root.dataset.lqEmbed = "on";

  // localStorage is synchroon leesbaar, dus de modus staat er voordat de pagina tekent
  let cachedMode = null;
  try { cachedMode = localStorage.getItem("lq-mode"); } catch (e) {}
  if (cachedMode && !isAuthPage) root.dataset.lqMode = cachedMode;

  function restyleActive() {
    if (settings.mode === "off") return false;
    return isEmbed || settings.mode === "classic" || isAuthPage;
  }

  function apply() {
    root.dataset.lqHideSessions = settings.hideSessions && settings.mode !== "off" ? "on" : "off";
    if (!isAuthPage) root.dataset.lqMode = settings.mode;

    if (!restyleActive()) {
      ["lq", "lqSurface", "lqBg", "lqGlass", "lqMotion"].forEach(k => delete root.dataset[k]);
      ["accent", "radius", "font", "scale"].forEach(k => root.style.removeProperty("--lq-" + k));
      return;
    }

    root.dataset.lq = "on";
    root.dataset.lqSurface = settings.surface;
    root.dataset.lqBg = isEmbed ? "plain" : settings.background;
    root.dataset.lqGlass = settings.glass ? "on" : "off";
    root.dataset.lqMotion = settings.motion ? "on" : "off";

    root.style.setProperty("--lq-accent", settings.accent);
    root.style.setProperty("--lq-radius", settings.radius + "px");
    root.style.setProperty("--lq-font", LQ_FONTS[settings.font] || LQ_FONTS.modern);
    root.style.setProperty("--lq-scale", settings.scale / 100);

    enforceTheme();
  }

  // De site zet zelf de class "dark" op <html>; bij een gekozen thema houden we die vast
  function enforceTheme() {
    if (!restyleActive() || settings.theme === "site") return;
    const wantDark = settings.theme === "dark";
    if (root.classList.contains("dark") !== wantDark) root.classList.toggle("dark", wantDark);
  }

  new MutationObserver(() => {
    if (restyleActive() && root.dataset.lq !== "on") apply();
    else enforceTheme();
  }).observe(root, { attributes: true, attributeFilter: ["class", "data-lq"] });

  chrome.storage.sync.get(LQ_DEFAULTS, stored => {
    settings = { ...LQ_DEFAULTS, ...stored };
    try { localStorage.setItem("lq-mode", settings.mode); } catch (e) {}
    apply();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    for (const [key, { newValue }] of Object.entries(changes)) settings[key] = newValue;
    try { localStorage.setItem("lq-mode", settings.mode); } catch (e) {}
    apply();
  });
})();
