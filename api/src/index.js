// mylearnq-api: een kleine, afhankelijkheidsvrije client voor MyLearnQ.
//
// MyLearnQ is gebouwd met SvelteKit. Elke pagina heeft een "__data.json"
// endpoint met precies de gegevens die de pagina toont, gecodeerd in het
// "devalue" formaat. Deze client haalt die endpoints op met jouw sessie,
// decodeert ze en geeft nette objecten terug.
//
// Alleen lezen: deze client verandert niets in MyLearnQ.

const DEFAULT_BASE = "https://app.mylearnq.com";

// Velden uit de rootlayout die geheimen of interne configuratie bevatten
const STRIPPED = ["session", "supabaseEnv", "user"];

export class MyLearnQError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "MyLearnQError";
    this.status = status;
  }
}

/** Gegooid als je niet (meer) bent ingelogd. */
export class MyLearnQAuthError extends MyLearnQError {
  constructor(location) {
    super("Niet ingelogd of sessie verlopen" + (location ? ` (doorgestuurd naar ${location})` : ""), 401);
    this.name = "MyLearnQAuthError";
    this.location = location;
  }
}

/**
 * Decodeert een "devalue" array (het formaat van SvelteKit) naar gewone waarden.
 * Ondersteunt objecten, arrays, Date, Set, Map, BigInt, RegExp, URL en speciale getallen.
 */
export function decodeDevalue(arr) {
  if (!Array.isArray(arr)) return arr;
  const memo = new Map();
  const hydrate = i => {
    if (i === -1) return undefined;
    if (i === -2) return undefined; // gat in een sparse array
    if (i === -3) return NaN;
    if (i === -4) return Infinity;
    if (i === -5) return -Infinity;
    if (i === -6) return -0;
    if (memo.has(i)) return memo.get(i);
    const v = arr[i];
    if (v === null || typeof v !== "object") { memo.set(i, v); return v; }
    if (Array.isArray(v)) {
      if (typeof v[0] === "string") {
        const [type, a, b] = v;
        let out;
        switch (type) {
          case "Date": out = new Date(a); break;
          case "Set": out = new Set(); memo.set(i, out); v.slice(1).forEach(x => out.add(hydrate(x))); return out;
          case "Map": out = new Map(); memo.set(i, out); for (let k = 1; k < v.length; k += 2) out.set(hydrate(v[k]), hydrate(v[k + 1])); return out;
          case "BigInt": out = BigInt(a); break;
          case "RegExp": out = new RegExp(a, b); break;
          case "URL": out = new URL(a); break;
          case "null": out = Object.create(null); memo.set(i, out); for (let k = 1; k < v.length; k += 2) out[v[k]] = hydrate(v[k + 1]); return out;
          default: out = v;
        }
        memo.set(i, out);
        return out;
      }
      const out = [];
      memo.set(i, out);
      for (const x of v) out.push(hydrate(x));
      return out;
    }
    const out = {};
    memo.set(i, out);
    for (const k of Object.keys(v)) out[k] = hydrate(v[k]);
    return out;
  };
  return hydrate(0);
}

/**
 * Bepaalt in welke fase een challenge zit.
 * @returns {{ key: "preparation"|"execution"|"evaluation"|"done", label: string, startedOn: string|null, progress: number }}
 */
export function challengePhase(c) {
  const has = v => v !== null && v !== undefined && v !== "";
  if (has(c.endChallengeDate)) return { key: "done", label: "Afgerond", startedOn: c.endChallengeDate, progress: 100 };
  if (has(c.startEvaluationDate)) return { key: "evaluation", label: "Evaluatie", startedOn: c.startEvaluationDate, progress: c.evaluationProgress || 0 };
  if (has(c.startExecutionDate)) return { key: "execution", label: "Uitvoering", startedOn: c.startExecutionDate, progress: c.executionProgress || 0 };
  return { key: "preparation", label: "Voorbereiding", startedOn: c.startPreparationDate || null, progress: c.preparationProgress || 0 };
}

export class MyLearnQ {
  /**
   * @param {object} [options]
   * @param {string} [options.baseUrl] Standaard https://app.mylearnq.com
   * @param {string} [options.cookie] Cookie header van een ingelogde sessie (nodig buiten de browser)
   * @param {typeof fetch} [options.fetch] Eigen fetch implementatie
   * @param {Record<string,string>} [options.headers] Extra headers
   */
  constructor(options = {}) {
    this.baseUrl = (options.baseUrl || DEFAULT_BASE).replace(/\/+$/, "");
    this.cookie = options.cookie;
    this.headers = options.headers || {};
    this._fetch = options.fetch || globalThis.fetch.bind(globalThis);
    this._me = null;
  }

  /**
   * Haalt de gegevens van een willekeurige pagina op, bijvoorbeeld "/challenges/133".
   * Alle datanodes van de pagina worden samengevoegd; geheimen worden verwijderd.
   */
  async route(path) {
    const url = this.baseUrl + "/" + String(path).replace(/^\/+|\/+$/g, "") + "/__data.json";
    const headers = { accept: "application/json", ...this.headers };
    if (this.cookie) headers.cookie = this.cookie;
    const res = await this._fetch(url, { headers, credentials: "include", redirect: "manual" });
    if (res.type === "opaqueredirect" || res.status === 301 || res.status === 302 || res.status === 303 || res.status === 307) {
      throw new MyLearnQAuthError(res.headers?.get?.("location"));
    }
    if (res.status === 401 || res.status === 403) throw new MyLearnQAuthError();
    if (!res.ok) throw new MyLearnQError(`HTTP ${res.status} voor ${path}`, res.status);
    // De response kan uit meerdere regels bestaan (gestreamde data); de eerste regel is de pagina
    const text = await res.text();
    const json = JSON.parse(text.split("\n")[0]);
    if (json.type === "redirect") throw new MyLearnQAuthError(json.location);
    if (json.type === "error") throw new MyLearnQError(json.error?.message || "Serverfout", json.status || 500);
    const out = {};
    for (const node of json.nodes || []) {
      if (node && node.type === "data") Object.assign(out, decodeDevalue(node.data));
    }
    for (const k of STRIPPED) delete out[k];
    return out;
  }

  /** Het ingelogde account. */
  async me() {
    if (this._me) return this._me;
    const d = await this.route("/student");
    if (!d.dbUser) throw new MyLearnQAuthError();
    this._me = d.dbUser;
    return this._me;
  }

  async _uid(userId) {
    return userId ?? (await this.me()).userId;
  }

  /** Check-ins, de planning per blok en de bijbehorende instellingen. */
  async checkIns(userId) {
    const d = await this.route(`/checkin/${await this._uid(userId)}`);
    return {
      checkIns: d.checkIns || [],
      challenges: d.challenges || [],
      questions: dedupeSettings(d.checkInSettings || []),
      plannedMinutesByChallenge: d.plannedMinutesByChallenge || {},
      workBlocksPerDay: d.workBlocksPerDay,
      worlds: d.worlds || [],
      metadata: d.metadata || {},
      raw: d
    };
  }

  /** Alle challenges, met de fase al uitgerekend. */
  async challenges(userId) {
    const d = await this.route(`/challenges/${await this._uid(userId)}`);
    const challenges = (d.challenges || []).map(c => ({ ...c, phase: challengePhase(c) }));
    return {
      challenges,
      active: challenges.filter(c => c.phase.key !== "done"),
      completed: challenges.filter(c => c.phase.key === "done"),
      openCount: d.openChallengesCount,
      maxOpen: d.maxOpenChallenges,
      collaborators: d.collaboratorUsers || [],
      worlds: d.worlds || [],
      raw: d
    };
  }

  /** Kernwaarden, verdeling over werelden en notities van de coach. */
  async growth(userId) {
    const d = await this.route(`/growth/${await this._uid(userId)}`);
    return {
      coreValues: d.coreValueScores || [],
      worldDistribution: d.worldDistribution || null,
      challengeCount: d.challengeCount ?? null,
      sessionAttendance: d.sessionAttendance || null,
      latestEntry: d.latestEntry ?? null,
      coachNotes: d.coachNotes || [],
      intro: d.intro || null,
      raw: d
    };
  }

  /** Ideeën (notities). */
  async notes(userId) {
    const d = await this.route(`/notion/${await this._uid(userId)}`);
    return { notes: d.notes || [], raw: d };
  }

  /** Inspiratiesessies en of je ingeschreven bent. */
  async sessions(userId) {
    const d = await this.route(`/sessions/${await this._uid(userId)}`);
    return { sessions: d.sessions || [], reflectionQuestions: d.reflectionQuestions || [], raw: d };
  }
}

function dedupeSettings(list) {
  const seen = new Map();
  for (const s of list) if (!seen.has(s.fieldKey)) seen.set(s.fieldKey, { key: s.fieldKey, label: s.customLabel || s.fieldName, required: !!s.isRequired, order: s.fieldOrder });
  return [...seen.values()].sort((a, b) => a.order - b.order);
}

export default MyLearnQ;
