// Chat engine voor MyLearnQ+: versleuteling, handtekeningen, opslag en de relay.
// Geen DOM hier; app.js tekent de interface.
//
// Opbouw van een bericht (van binnen naar buiten):
//  1. Inhoud {v, id, ts, name, pub, text} wordt ondertekend met de ECDSA P-256
//     sleutel van dit apparaat. Zo kan niemand berichten vervalsen of aanpassen.
//  2. Dat geheel wordt versleuteld met AES-256-GCM met de kamersleutel
//     (PBKDF2 uit de geheime kamercode). Alleen wie de code kent kan dit lezen.
//  3. Het resultaat wordt nog eens versleuteld met AES-256-GCM met de appsleutel
//     (PBKDF2 uit het gedeelde wachtwoord), zodat de relay niets herkent.
// Elke laag gebruikt een eigen willekeurige IV en bindt context via AAD.
const LQChat = (() => {
  const RELAY = "https://ntfy.sh";
  const APP_SECRET = "bredagora";
  const ITER = 250000;
  const MAX_TEXT = 1500;
  const MAX_LOG = 400;
  const MAX_SKEW = 10 * 60 * 1000;

  const te = new TextEncoder();
  const td = new TextDecoder();
  const subtle = crypto.subtle;

  const b64 = buf => { let s = ""; const b = new Uint8Array(buf); for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]); return btoa(s); };
  const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const hex = buf => [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2, "0")).join("");
  const sha256 = async s => subtle.digest("SHA-256", te.encode(s));

  const store = {
    get: keys => new Promise(r => chrome.storage.local.get(keys, r)),
    set: obj => new Promise(r => chrome.storage.local.set(obj, r)),
    del: keys => new Promise(r => chrome.storage.local.remove(keys, r))
  };

  /* ---------- Sleutels ---------- */

  async function deriveAes(secret, salt) {
    const base = await subtle.importKey("raw", te.encode(secret), "PBKDF2", false, ["deriveKey"]);
    return subtle.deriveKey(
      { name: "PBKDF2", hash: "SHA-256", salt: te.encode(salt), iterations: ITER },
      base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]
    );
  }

  let appKeyP = null;
  const appKey = () => (appKeyP ||= deriveAes(APP_SECRET, "mylearnq-plus|app|v1"));

  const normalizeCode = c => String(c || "").toUpperCase().replace(/[^A-Z2-7]/g, "");

  // Kamercode: 20 tekens base32 = 100 bits willekeur
  function newCode() {
    const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    const r = crypto.getRandomValues(new Uint8Array(20));
    return [...r].map(x => A[x & 31]).join("");
  }
  const prettyCode = c => normalizeCode(c).match(/.{1,4}/g)?.join(" ") || "";

  const roomCache = {};
  async function roomInfo(code) {
    code = normalizeCode(code);
    if (roomCache[code]) return roomCache[code];
    const id = hex(await sha256("lq-room-id|" + code)).slice(0, 24);
    const topic = "lqc_" + hex(await sha256("lq-topic|" + APP_SECRET + "|" + code)).slice(0, 40);
    const key = await deriveAes(code, "mylearnq-plus|room|" + id);
    return (roomCache[code] = { id, topic, key });
  }

  let identity = null;
  async function loadIdentity() {
    const { lqChatIdentity: saved } = await store.get("lqChatIdentity");
    if (saved) {
      const priv = await subtle.importKey("jwk", saved.priv, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
      identity = { priv, pub: saved.pub, fp: saved.fp };
      return identity;
    }
    const kp = await subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
    const pub = b64(await subtle.exportKey("spki", kp.publicKey));
    const fp = await fingerprint(pub);
    await store.set({ lqChatIdentity: { priv: await subtle.exportKey("jwk", kp.privateKey), pub, fp } });
    identity = { priv: kp.privateKey, pub, fp };
    return identity;
  }

  async function fingerprint(pub) {
    return hex(await subtle.digest("SHA-256", unb64(pub))).slice(0, 16).toUpperCase().match(/.{4}/g).join(" ");
  }

  const pubCache = {};
  const importPub = pub => (pubCache[pub] ||= subtle.importKey("spki", unb64(pub), { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]));
  const sigBytes = (m, roomId) => te.encode(JSON.stringify([m.v, m.id, m.ts, m.name, m.pub, m.text, roomId]));

  /* ---------- Versleutelen en openen ---------- */

  async function seal(room, name, text) {
    const m = { v: 1, id: crypto.randomUUID(), ts: Date.now(), name, pub: identity.pub, text };
    const sig = await subtle.sign({ name: "ECDSA", hash: "SHA-256" }, identity.priv, sigBytes(m, room.id));
    m.sig = b64(sig);

    const iv1 = crypto.getRandomValues(new Uint8Array(12));
    const ct1 = await subtle.encrypt({ name: "AES-GCM", iv: iv1, additionalData: te.encode("lq-msg|" + room.id) }, room.key, te.encode(JSON.stringify(m)));
    const mid = JSON.stringify({ iv: b64(iv1), ct: b64(ct1) });

    const iv2 = crypto.getRandomValues(new Uint8Array(12));
    const ct2 = await subtle.encrypt({ name: "AES-GCM", iv: iv2, additionalData: te.encode("lq-app|v1") }, await appKey(), te.encode(mid));
    return { raw: `LQ1:${b64(iv2)}:${b64(ct2)}`, msg: m };
  }

  // Geeft {msg} terug, of {error} als het bericht niet te vertrouwen is
  async function open(room, raw, relayTime) {
    try {
      const [tag, iv2, ct2] = String(raw).split(":");
      if (tag !== "LQ1") return { error: "onbekend formaat" };
      const mid = JSON.parse(td.decode(await subtle.decrypt({ name: "AES-GCM", iv: unb64(iv2), additionalData: te.encode("lq-app|v1") }, await appKey(), unb64(ct2))));
      const m = JSON.parse(td.decode(await subtle.decrypt({ name: "AES-GCM", iv: unb64(mid.iv), additionalData: te.encode("lq-msg|" + room.id) }, room.key, unb64(mid.ct))));
      if (m.v !== 1 || typeof m.text !== "string" || typeof m.name !== "string") return { error: "ongeldige inhoud" };
      const ok = await subtle.verify({ name: "ECDSA", hash: "SHA-256" }, await importPub(m.pub), unb64(m.sig), sigBytes(m, room.id));
      if (!ok) return { error: "handtekening klopt niet" };
      if (relayTime && Math.abs(m.ts - relayTime * 1000) > MAX_SKEW) return { error: "tijdstempel klopt niet (mogelijk opnieuw afgespeeld)" };
      m.fp = await fingerprint(m.pub);
      return { msg: m };
    } catch (e) {
      return { error: "kan niet ontsleutelen" };
    }
  }

  /* ---------- Staat ---------- */

  const S = { name: "Ik", rooms: [], msgs: {}, rejected: {}, known: {}, status: {}, onUpdate: () => {} };
  const subs = {};
  const emit = () => S.onUpdate();

  async function saveRooms() {
    await store.set({ lqChatRooms: S.rooms.map(({ code, label, joinedAt, lastRead, lastNid }) => ({ code, label, joinedAt, lastRead, lastNid })) });
  }

  // Ontvangen bericht verwerken: ontsleutelen, controleren, ontdubbelen
  async function ingest(r, nid, time, raw, persist) {
    const list = (S.msgs[r.id] ||= []);
    if (list.some(x => x.nid === nid)) return false;
    const res = await open(r, raw, time);
    if (res.error) {
      const rej = (S.rejected[r.id] ||= []);
      if (!rej.some(x => x.nid === nid)) rej.push({ nid, time, error: res.error });
      return false;
    }
    const m = res.msg;
    if (list.some(x => x.id === m.id)) return false; // zelfde bericht nogmaals: replay
    // Trust on first use: onthoud welke sleutel bij welke naam hoort
    const known = (S.known[r.id] ||= {});
    m.keyChanged = !!known[m.name] && known[m.name] !== m.fp;
    if (!known[m.name]) known[m.name] = m.fp;
    m.nid = nid;
    m.mine = m.fp === identity.fp;
    list.push(m);
    list.sort((a, b) => a.ts - b.ts);
    if (persist) {
      const key = "lqChatLog_" + r.id;
      const { [key]: log = [] } = await store.get(key);
      log.push({ nid, time, raw });
      await store.set({ [key]: log.slice(-MAX_LOG), ["lqChatKnown_" + r.id]: known });
    }
    return true;
  }

  function subscribe(r) {
    if (subs[r.id]) return;
    const since = r.lastNid || "12h";
    const es = new EventSource(`${RELAY}/${r.topic}/sse?since=${encodeURIComponent(since)}`);
    subs[r.id] = es;
    S.status[r.id] = "verbinden";
    es.onopen = () => { S.status[r.id] = "verbonden"; emit(); };
    es.onerror = () => { S.status[r.id] = "opnieuw verbinden"; emit(); };
    es.onmessage = async e => {
      let ev;
      try { ev = JSON.parse(e.data); } catch (err) { return; }
      if (ev.event !== "message" || !ev.message) return;
      await ingest(r, ev.id, ev.time, ev.message, true);
      if (r.lastNid !== ev.id) { r.lastNid = ev.id; saveRooms(); }
      emit(); // ook bij een geweigerd bericht, zodat de melding verschijnt
    };
  }

  async function loadRoom(saved) {
    const info = await roomInfo(saved.code);
    const r = { ...saved, ...info };
    const { ["lqChatLog_" + r.id]: log = [], ["lqChatKnown_" + r.id]: known = {} } = await store.get(["lqChatLog_" + r.id, "lqChatKnown_" + r.id]);
    S.known[r.id] = known;
    for (const e of log) await ingest(r, e.nid, e.time, e.raw, false);
    return r;
  }

  /* ---------- Publieke functies ---------- */

  async function init(name, onUpdate) {
    S.name = name;
    S.onUpdate = onUpdate;
    await loadIdentity();
    const { lqChatRooms = [] } = await store.get("lqChatRooms");
    for (const saved of lqChatRooms) {
      const r = await loadRoom(saved);
      S.rooms.push(r);
      subscribe(r);
    }
    emit();
  }

  async function joinRoom(code, label) {
    code = normalizeCode(code);
    if (code.length !== 20) throw new Error("Deze code klopt niet. Plak de hele uitnodiging, of een code van 20 tekens.");
    const info = await roomInfo(code);
    if (S.rooms.some(r => r.id === info.id)) return info.id;
    const r = await loadRoom({ code, label: label || "Groep " + code.slice(0, 4), joinedAt: Date.now(), lastRead: Date.now() });
    S.rooms.push(r);
    await saveRooms();
    subscribe(r);
    emit();
    return r.id;
  }

  async function createRoom(label) {
    const code = newCode();
    const id = await joinRoom(code, label);
    return { id, code };
  }

  async function leaveRoom(id) {
    subs[id]?.close();
    delete subs[id];
    S.rooms = S.rooms.filter(r => r.id !== id);
    delete S.msgs[id];
    await store.del(["lqChatLog_" + id, "lqChatKnown_" + id]);
    await saveRooms();
    emit();
  }

  async function renameRoom(id, label) {
    const r = S.rooms.find(x => x.id === id);
    if (!r) return;
    r.label = label;
    await saveRooms();
    emit();
  }

  async function send(id, text) {
    const r = S.rooms.find(x => x.id === id);
    text = String(text || "").trim();
    if (!r || !text) return;
    if (text.length > MAX_TEXT) throw new Error(`Bericht is te lang (maximaal ${MAX_TEXT} tekens).`);
    const { raw } = await seal(r, S.name, text);
    if (raw.length > 4000) throw new Error("Bericht is te lang voor de relay.");
    const res = await fetch(`${RELAY}/${r.topic}`, { method: "POST", body: raw });
    if (!res.ok) throw new Error(res.status === 429 ? "Even rustig aan: te veel berichten achter elkaar." : "Versturen mislukt (" + res.status + ").");
    const ev = await res.json();
    await ingest(r, ev.id, ev.time, raw, true);
    r.lastRead = Date.now();
    await saveRooms();
    emit();
  }

  async function markRead(id) {
    const r = S.rooms.find(x => x.id === id);
    if (!r) return;
    const last = (S.msgs[id] || []).at(-1);
    if (last && last.ts > (r.lastRead || 0)) { r.lastRead = last.ts; await saveRooms(); }
  }

  const unread = id => {
    const r = S.rooms.find(x => x.id === id);
    return r ? (S.msgs[id] || []).filter(m => !m.mine && m.ts > (r.lastRead || 0)).length : 0;
  };

  return {
    init, joinRoom, createRoom, leaveRoom, renameRoom, send, markRead, unread, prettyCode,
    get rooms() { return S.rooms; },
    messages: id => S.msgs[id] || [],
    rejected: id => S.rejected[id] || [],
    status: id => S.status[id] || "",
    get me() { return identity; },
    MAX_TEXT
  };
})();
