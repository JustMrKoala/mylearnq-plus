#!/usr/bin/env node
// Kleine commandoregeltool bovenop mylearnq-api.
// Gebruik: MYLEARNQ_COOKIE="..." npx mylearnq <commando> [--json]

import { MyLearnQ, MyLearnQAuthError } from "../src/index.js";

const HELP = `mylearnq <commando> [--json]

Commando's:
  me           Je account
  challenges   Je challenges met fase en voortgang
  checkins     Je recente check-ins
  growth       Kernwaarden en werelden
  notes        Je ideeën
  sessions     Inspiratiesessies

Zet je sessiecookie in de omgevingsvariabele MYLEARNQ_COOKIE.
Zie de README voor hoe je die vindt. Behandel hem als een wachtwoord.`;

const [cmd, ...rest] = process.argv.slice(2);
const asJson = rest.includes("--json");

if (!cmd || cmd === "help" || cmd === "--help") {
  console.log(HELP);
  process.exit(0);
}

const cookie = process.env.MYLEARNQ_COOKIE;
if (!cookie) {
  console.error("MYLEARNQ_COOKIE is niet ingesteld. Typ 'mylearnq help' voor uitleg.");
  process.exit(1);
}

const client = new MyLearnQ({ cookie, baseUrl: process.env.MYLEARNQ_URL });
const out = data => console.log(asJson ? JSON.stringify(data, null, 2) : data);

try {
  switch (cmd) {
    case "me": {
      const u = await client.me();
      out(asJson ? u : `${u.name} (${u.role}), id ${u.userId}`);
      break;
    }
    case "challenges": {
      const { challenges } = await client.challenges();
      if (asJson) out(challenges);
      else for (const c of challenges) console.log(`${c.phase.label.padEnd(14)} ${String(Math.round(c.phase.progress)).padStart(3)}%  ${c.title}`);
      break;
    }
    case "checkins": {
      const { checkIns } = await client.checkIns();
      if (asJson) out(checkIns);
      else for (const c of checkIns.slice(0, 10)) console.log(`${c.date}  ${c.status.padEnd(10)} ${c.items.length} blok(ken)`);
      break;
    }
    case "growth": {
      const g = await client.growth();
      if (asJson) out(g.coreValues);
      else for (const v of g.coreValues) console.log(`${v.title.padEnd(16)} ${(v.studentScore ?? 0).toFixed(1)}`);
      break;
    }
    case "notes": out((await client.notes()).notes); break;
    case "sessions": {
      const { sessions } = await client.sessions();
      if (asJson) out(sessions);
      else for (const s of sessions) console.log(`${s.sessionDate}  ${s.isRegistered ? "ingeschreven" : "            "}  ${s.title}`);
      break;
    }
    default:
      console.error(`Onbekend commando: ${cmd}\n\n${HELP}`);
      process.exit(1);
  }
} catch (e) {
  console.error(e instanceof MyLearnQAuthError ? "Niet ingelogd: je cookie is ongeldig of verlopen." : e.message);
  process.exit(1);
}
