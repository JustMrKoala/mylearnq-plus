// Draait in elk frame. Zet de weergavemodus vroeg (tegen flitsen) en past de
// restyle toe in de klassieke modus en in de bewerkpanelen van de nieuwe UI.
(() => {
  const root = document.documentElement;
  const isEmbed = window !== window.top;
  const isAuthPage = /^\/(login|auth|logout)/.test(location.pathname);
  let settings = { ...LQ_DEFAULTS };
  // Eigen foto en eigen CSS voor de klassieke weergave staan in de lokale opslag
  const local = { bgImage: "", classicCss: "" };

  if (isEmbed) root.dataset.lqEmbed = "on";

  // localStorage is synchroon leesbaar, dus de modus staat er voordat de pagina tekent
  let cachedMode = null;
  try { cachedMode = localStorage.getItem("lq-mode"); } catch (e) {}
  if (cachedMode && !isAuthPage) root.dataset.lqMode = cachedMode;

  const ATTRS = ["lq", "lqSurface", "lqBg", "lqGlass", "lqMotion", "lqGrad", "lqCards", "lqWidth", "lqIcon", "lqHideFooter"];
  const VARS = ["accent", "accent2", "radius", "font", "scale", "bg-img", "bg-blur", "bg-dim"];
  let customEl = null;

  function restyleActive() {
    if (settings.mode === "off") return false;
    return isEmbed || settings.mode === "classic" || isAuthPage;
  }

  function apply() {
    root.dataset.lqHideSessions = settings.hideSessions && settings.mode !== "off" ? "on" : "off";
    if (!isAuthPage) root.dataset.lqMode = settings.mode;

    if (!restyleActive()) {
      ATTRS.forEach(k => delete root.dataset[k]);
      VARS.forEach(k => root.style.removeProperty("--lq-" + k));
      setCustomCss("");
      return;
    }

    // In de bewerkpanelen van de nieuwe UI blijft het rustig: geen achtergrond of eigen CSS
    const classic = settings.mode === "classic" && !isEmbed;
    const bg = isEmbed ? "plain" : settings.background === "image" && !local.bgImage ? "plain" : settings.background;
    Object.assign(root.dataset, {
      lq: "on",
      lqSurface: settings.surface,
      lqBg: bg,
      lqGlass: settings.glass ? "on" : "off",
      lqMotion: settings.motion ? "on" : "off",
      lqGrad: settings.gradient ? "on" : "off",
      lqCards: settings.cards,
      lqWidth: classic ? settings.width : "normal",
      lqIcon: settings.iconWeight,
      lqHideFooter: classic && settings.hideFooter ? "on" : "off"
    });

    root.style.setProperty("--lq-accent", settings.accent);
    root.style.setProperty("--lq-accent2", settings.accent2);
    root.style.setProperty("--lq-radius", settings.radius + "px");
    root.style.setProperty("--lq-font", LQ_FONTS[settings.font] || LQ_FONTS.modern);
    root.style.setProperty("--lq-scale", settings.scale / 100);
    root.style.setProperty("--lq-bg-blur", settings.bgBlur + "px");
    root.style.setProperty("--lq-bg-dim", settings.bgDim + "%");
    const img = local.bgImage ? `url("${local.bgImage}")` : "none";
    if (root.style.getPropertyValue("--lq-bg-img") !== img) root.style.setProperty("--lq-bg-img", img);
    setCustomCss(classic ? local.classicCss : "");

    enforceTheme();
  }

  function setCustomCss(css) {
    if (!css && !customEl) return;
    if (!customEl) {
      customEl = document.createElement("style");
      customEl.id = "lq-classic-css";
    }
    if (customEl.textContent !== css) customEl.textContent = css;
    // Als laatste in het document, zodat eigen regels voorgaan
    if (!customEl.isConnected) (document.head || root).appendChild(customEl);
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
    chrome.storage.local.get({ lqBgImage: "", lqClassicCss: "" }, l => {
      local.bgImage = l.lqBgImage || "";
      local.classicCss = l.lqClassicCss || "";
      apply();
    });
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local") {
      if (changes.lqBgImage) local.bgImage = changes.lqBgImage.newValue || "";
      if (changes.lqClassicCss) local.classicCss = changes.lqClassicCss.newValue || "";
      if (changes.lqBgImage || changes.lqClassicCss) apply();
      return;
    }
    if (area !== "sync") return;
    for (const [key, { newValue }] of Object.entries(changes)) settings[key] = newValue;
    try { localStorage.setItem("lq-mode", settings.mode); } catch (e) {}
    apply();
  });
})();
