// Verzonnen demogegevens voor de storescreenshots. Draait de echte app.js,
// maar met een nagebootste chrome API, fetch en chat. Geen echte personen.
(() => {
  // Vaste datum (een woensdag) zodat de screenshots er altijd hetzelfde uitzien
  const RealDate = Date;
  const FIXED = new RealDate(2026, 9, 28, 10, 30).getTime();
  window.Date = class extends RealDate {
    constructor(...a) { super(...(a.length ? a : [FIXED])); }
    static now() { return FIXED; }
  };

  const pad = n => String(n).padStart(2, "0");
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const day = n => { const d = new Date(); d.setDate(d.getDate() + n); return d; };
  const monday = (() => { const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d; })();
  const wk = n => iso(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + n));
  const params = new URLSearchParams(location.search);

  // devalue encoder: elke waarde wordt een index in een platte array
  function enc(value) {
    const arr = [];
    const put = v => {
      if (v === undefined) return -1;
      const i = arr.length;
      arr.push(null);
      if (v === null || typeof v !== "object") { arr[i] = v; return i; }
      if (Array.isArray(v)) { arr[i] = v.map(put); return i; }
      const o = {};
      for (const k in v) o[k] = put(v[k]);
      arr[i] = o;
      return i;
    };
    put(value);
    return arr;
  }

  const user = { userId: 1, name: "Jansen, Noor", email: "noor@example.com", role: "student", avatarUrl: null };
  const worlds = [
    { id: 1, shortName: "Wetenschappelijk", name: "Wetenschappelijke wereld", perspectives: [{ id: 11, title: "Natuurvenster", color: "#22c55e" }, { id: 12, title: "Techniekvenster", color: "#64748b" }] },
    { id: 2, shortName: "Maatschappelijk", name: "Maatschappelijke wereld", perspectives: [{ id: 21, title: "Tijdvenster", color: "#d97706" }] },
    { id: 3, shortName: "Kunstzinnig", name: "Kunstzinnige wereld", perspectives: [{ id: 31, title: "Cultuurvenster", color: "#8b5cf6" }] },
    { id: 4, shortName: "Sociaal-ethisch", name: "Sociaal-ethische wereld", perspectives: [{ id: 41, title: "Gezondheidsvenster", color: "#14b8a6" }] },
    { id: 5, shortName: "Spiritueel", name: "Spirituele wereld", perspectives: [{ id: 51, title: "Betekenisvenster", color: "#9333ea" }] }
  ];
  const ch = (id, title, lq, start, exec, evalD, end, prog, w, collab, pres) => ({
    challengeId: id, ownerId: 1, title, learningQuestion: lq, pitch: "", collaborators: collab || [],
    creationDate: start + "T08:00:00Z", editDate: start + "T08:00:00Z",
    startPreparationDate: start, preparationProgress: exec ? 100 : prog,
    startExecutionDate: exec || "", executionProgress: evalD ? 100 : exec ? prog : 0,
    startEvaluationDate: evalD || "", evaluationProgress: evalD ? prog : 0,
    endChallengeDate: end || "", schoolYear: "2026-2027", timeBudgetHours: null,
    perspectives: [], subQuestions: [], worlds: w, scheduledPresentationDate: pres || ""
  });
  const challenges = [
    ch(1, "Een moestuin op het schoolplein", "Hoe ontwerp ik een moestuin die het hele jaar oogst geeft?", iso(day(-40)), iso(day(-25)), "", "", 62, [1, 4], [2], iso(day(12))),
    ch(2, "Podcast over lokale geschiedenis", "Wat vertellen oudere buurtbewoners over hoe de wijk veranderd is?", iso(day(-30)), iso(day(-14)), iso(day(-3)), "", 35, [2, 3], [3, 4], iso(day(5))),
    ch(3, "Leren programmeren in Python", "Kan ik in zes weken een eigen spel bouwen?", iso(day(-18)), "", "", "", 70, [1]),
    ch(4, "Spaans op A2 niveau", "Hoe leer ik genoeg Spaans voor een gesprek op vakantie?", iso(day(-9)), "", "", "", 25, [3]),
    ch(5, "Fotografietentoonstelling", "Hoe vertel ik een verhaal met tien foto's?", iso(day(-70)), iso(day(-55)), iso(day(-40)), iso(day(-32)), 100, [3])
  ];
  const item = (b, d, m, c) => ({ itemId: b, checkInId: 1, challengeId: c, description: d, estimatedDuration: m, blockNumber: b });
  const checkIns = [
    { date: wk(0), status: "published", yesterdayReflection: "Interviewvragen afgemaakt en een afspraak gemaakt met mevrouw De Vries.", learningsOrResults: "Open vragen leveren veel betere verhalen op.", helpOrObstacles: "Ik heb een goede microfoon nodig.", successCriteria: "Als het eerste interview is opgenomen.", items: [item(1, "Interview opnemen", 90, 2), item(2, "Plantschema maken", 60, 1), item(3, "Python: lussen oefenen", 45, 3)] },
    { date: wk(1), status: "published", yesterdayReflection: "Interview opgenomen.", learningsOrResults: "Montage kost meer tijd dan ik dacht.", helpOrObstacles: "Niks", successCriteria: "Ruwe montage klaar.", items: [item(1, "Podcast monteren", 90, 2), item(2, "Grond testen met de klas", 60, 1)] },
    { date: wk(2), status: "published", yesterdayReflection: "Ruwe montage klaar.", learningsOrResults: "", helpOrObstacles: "", successCriteria: "Spel heeft een werkend menu.", items: [item(1, "Spelmenu bouwen", 90, 3), item(2, "Spaanse woordjes", 30, 4)] },
    { date: wk(3), status: "draft", yesterdayReflection: "", learningsOrResults: "", helpOrObstacles: "", successCriteria: "", items: [item(1, "Presentatie voorbereiden", 60, 2)] },
    ...[-7, -10, -11, -12, -13].map(n => ({ date: wk(n), status: "published", yesterdayReflection: "Verder gewerkt aan mijn challenges.", learningsOrResults: "", helpOrObstacles: "", successCriteria: "", items: [item(1, "Werken aan challenge", 90, 1)] }))
  ].filter(c => c.date <= iso(new Date()));
  const checkInSettings = [
    ["yesterday_reflection", "Wat heb je de laatste schooldag gedaan?"],
    ["learnings_or_results", "Wat heb je geleerd of welk resultaat heb je behaald?"],
    ["today_items", "Wat ga je vandaag doen?"],
    ["help_or_obstacles", "Heb je hulp nodig of verwacht je obstakels?"],
    ["success_criteria", "Wanneer is je dag geslaagd?"]
  ].map(([fieldKey, fieldName], i) => ({ fieldKey, fieldName, fieldOrder: i + 1, isRequired: true }));
  const people = [{ userId: 1, name: user.name }, { userId: 2, name: "Bakker, Daan" }, { userId: 3, name: "Visser, Lotte" }, { userId: 4, name: "Smit, Yara" }];

  const routes = {
    "/student": { dbUser: user },
    "/checkin/1": { checkIns, challenges, checkInSettings, challengeOwners: people, plannedMinutesByChallenge: { 1: 360, 2: 480, 3: 270, 4: 90 }, worlds, registeredSessions: [{ sessionId: 1, title: "Politieke partijen", sessionDate: wk(2), sessionTime: "11:00:00" }] },
    "/challenges/1": { challenges, openChallengesCount: 4, maxOpenChallenges: 5, collaboratorUsers: people, worlds },
    "/growth/1": {
      intro: { title: "Mijn jaar in beeld", description: "Wat waren mijn leermomenten van het afgelopen jaar en wat zeggen die over mijn groei?" },
      challengeCount: 5, latestEntry: null, coachNotes: [],
      coreValueScores: [
        { title: "Autonomie", subtitle: "Leerlingen maken eigen keuzes.", studentScore: 4.1, skillKeys: ["Planning/Prioritering", "Taakinitiatie"] },
        { title: "Verbondenheid", subtitle: "Leren samen, zorg voor elkaar.", studentScore: 3.8, skillKeys: ["Emotieregulatie"] },
        { title: "Competentie", subtitle: "Zinvol en haalbaar leren.", studentScore: 3.2, skillKeys: ["Organisatie", "Timemanagement"] },
        { title: "Bewustwording", subtitle: "Ik begrijp mezelf en mijn omgeving.", studentScore: 3.5, skillKeys: ["Metacognitie"] },
        { title: "Toekomst", subtitle: "Leren in en voor de samenleving.", studentScore: 4.4, skillKeys: ["Flexibiliteit"] }
      ],
      worldDistribution: {
        total: 9,
        worlds: [[1, 3], [2, 2], [3, 3], [4, 1], [5, 0]].map(([id, c]) => ({ worldId: id, name: worlds[id - 1].name, shortName: worlds[id - 1].shortName, count: c, fraction: c / 9 })),
        favorite: { worldId: 1, shortName: "Wetenschappelijk", name: "Wetenschappelijke wereld" }
      }
    },
    "/notion/1": { notes: [] },
    "/sessions/1": {
      sessions: [
        { sessionId: 1, title: "Politieke partijen", description: "Nederland heeft veel politieke partijen. Waar staan ze voor en hoe kies je?", imageUrl: null, sessionDate: wk(2), sessionTime: "11:00:00", organizers: [{ name: "Mevrouw De Vries" }], maxParticipants: 15, bringItems: "Pen, schrift en laptop", registrationCount: 14, isRegistered: true, canRegister: false, canUnregister: false, isPast: false, canReflect: false, reflectionAnswers: null },
        { sessionId: 2, title: "Bijen houden", description: "Een imker vertelt over het leven in een bijenkast. Je mag zelf honing proeven.", imageUrl: null, sessionDate: wk(8), sessionTime: "13:30:00", organizers: [{ name: "Imkersvereniging" }], maxParticipants: 20, bringItems: "", registrationCount: 6, isRegistered: false, canRegister: true, canUnregister: false, isPast: false, canReflect: false, reflectionAnswers: null },
        { sessionId: 3, title: "Stop-motion film", description: "Maak in twee uur je eigen korte film met klei en een telefoon.", imageUrl: null, sessionDate: wk(-6), sessionTime: "10:00:00", organizers: [{ name: "Meneer Bakker" }], maxParticipants: 12, bringItems: "Telefoon", registrationCount: 12, isRegistered: true, canRegister: false, canUnregister: false, isPast: true, canReflect: true, reflectionAnswers: null }
      ],
      reflectionQuestions: []
    }
  };

  window.fetch = async url => {
    // Bij file:// staat de stationsletter in het pad (/C:/student/...), dus zoek op het einde
    const path = new URL(url, location.href).pathname;
    const key = Object.keys(routes).find(r => path.endsWith(r + "/__data.json"));
    const data = routes[key];
    if (!data) return new Response("{}", { status: 404 });
    return new Response(JSON.stringify({ type: "data", nodes: [{ type: "data", data: enc({ dbUser: user }) }, { type: "data", data: enc(data) }] }));
  };

  // Instellingen uit de URL, bijvoorbeeld ?view=challenges&theme=light
  const settings = { theme: params.get("theme") || "dark", accent: params.get("accent") || "#3f7f6e" };
  if (params.get("layout")) settings.layout = params.get("layout");
  try { sessionStorage.setItem("lq-view", params.get("view") || "dashboard"); } catch (e) {}

  const area = obj => ({
    get: (keys, cb) => setTimeout(() => cb(typeof keys === "object" && !Array.isArray(keys) ? { ...keys, ...obj } : obj), 0),
    set: (p, cb) => { Object.assign(obj, p); cb && cb(); },
    remove: (k, cb) => cb && cb()
  });
  window.chrome = { runtime: { getURL: p => "../../extension/" + p }, storage: { sync: area(settings), local: area({}), onChanged: { addListener() {} } } };

  // Nagebootste chat met een paar berichten
  const now = Date.now();
  const room = { id: "demo", code: "K7QM2XPAH4TC9WJRB6NE", label: "Project Podcast" };
  const msgs = [
    { id: "a", ts: now - 3600e3 * 2, name: "Lotte V.", fp: "4F2A 9C1D 77B0 E3A5", text: "Zullen we morgen het tweede interview opnemen?", mine: false },
    { id: "b", ts: now - 3600e3 * 2 + 9e4, name: "Noor J.", fp: "B28F FFD7 0C31 A9E2", text: "Goed idee! Ik neem de microfoon van school mee.", mine: true },
    { id: "c", ts: now - 3600e3 * 1.5, name: "Yara S.", fp: "61DE 0A4B 92C7 5F18", text: "Ik kan om 10 uur. Zal ik de vragenlijst nog aanpassen?", mine: false },
    { id: "d", ts: now - 3600e3 * 1.4, name: "Noor J.", fp: "B28F FFD7 0C31 A9E2", text: "Graag, vooral de vragen over de oude markt.", mine: true },
    { id: "e", ts: now - 6e5, name: "Lotte V.", fp: "4F2A 9C1D 77B0 E3A5", text: "Top, dan zie ik jullie om 10 uur in het mediahok.", mine: false }
  ];
  window.LQChat = {
    init: async () => {}, joinRoom: async () => "demo", createRoom: async () => ({ id: "demo", code: room.code }),
    leaveRoom: async () => {}, renameRoom: async () => {}, send: async () => {}, markRead: async () => {},
    unread: () => 0, prettyCode: c => c.match(/.{1,4}/g).join(" "),
    rooms: [room, { id: "x", code: "", label: "Moestuin team" }, { id: "y", code: "", label: "Klas 2B" }],
    messages: id => id === "demo" ? msgs : id === "x" ? [{ id: "z", ts: now - 864e5, name: "Daan B.", fp: "", text: "Zaterdag zaaien?", mine: false }] : [],
    rejected: () => [], status: () => "verbonden", me: { fp: "B28F FFD7 0C31 A9E2" }, MAX_TEXT: 1500
  };
})();
