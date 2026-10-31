# mylearnq-api

Een kleine, onofficiële JavaScript client om je eigen gegevens uit [MyLearnQ](https://app.mylearnq.com) op te halen: check-ins, challenges, groei, ideeën en inspiratiesessies. Geen afhankelijkheden, werkt in de browser en in Node.js 18 of nieuwer.

> Niet gemaakt of gesteund door MyLearnQ. De client is **alleen lezend** en gebruikt dezelfde gegevens die de website zelf laadt. Gebruik hem alleen voor je eigen account.

## Hoe het werkt

MyLearnQ is gebouwd met SvelteKit. Elke pagina heeft een verborgen endpoint `<pagina>/__data.json` met precies de gegevens die op die pagina staan, gecodeerd in het [devalue](https://github.com/Rich-Harris/devalue) formaat. Deze client:

1. haalt die endpoints op met jouw sessie;
2. decodeert devalue naar gewone objecten;
3. voegt de datanodes van de pagina samen;
4. verwijdert geheimen zoals sessietokens (`session`, `supabaseEnv`, `user`);
5. geeft nette resultaten terug, zoals challenges met hun huidige fase.

## Installeren

De client is één bestand zonder afhankelijkheden: kopieer [`src/index.js`](src/index.js) (en eventueel [`src/index.d.ts`](src/index.d.ts)) naar je project. Met pnpm kan het ook direct uit deze repository:

```bash
pnpm add "github:JustMrKoala/mylearnq-plus#path:api"
```

## Gebruik

### In de browser (op app.mylearnq.com)

Op de site zelf, bijvoorbeeld in een extensie of userscript, gaat je sessie automatisch mee:

```js
import { MyLearnQ } from "mylearnq-api";

const lq = new MyLearnQ();
const me = await lq.me();
const { active } = await lq.challenges();

for (const c of active) {
  console.log(c.title, c.phase.label, Math.round(c.phase.progress) + "%");
}
```

### In Node.js

Buiten de browser heb je je sessiecookie nodig:

```js
import { MyLearnQ } from "mylearnq-api";

const lq = new MyLearnQ({ cookie: process.env.MYLEARNQ_COOKIE });
const { checkIns, questions } = await lq.checkIns();
console.log(checkIns[0].date, checkIns[0].items);
```

**Je cookie vinden:** log in op app.mylearnq.com, open de ontwikkelaarstools (F12), ga naar **Application** (Chrome/Edge) of **Opslag** (Firefox), dan **Cookies** › `https://app.mylearnq.com`. Kopieer de cookies die met `sb-` beginnen als `naam=waarde; naam2=waarde2`.

> **Behandel deze cookie als je wachtwoord.** Wie hem heeft, kan als jou inloggen. Zet hem nooit in code die je deelt of op GitHub zet, en gebruik een omgevingsvariabele. Cookies verlopen na een tijd; dan moet je een nieuwe kopiëren.

### Commandoregel

Vanuit de map `api`:

```bash
export MYLEARNQ_COOKIE="sb-...=...; sb-...=..."
node bin/cli.js challenges
node bin/cli.js checkins --json
```

Commando's: `me`, `challenges`, `checkins`, `growth`, `notes`, `sessions`. Voeg `--json` toe voor ruwe JSON.

## API

### `new MyLearnQ(options?)`

| Optie | Standaard | Uitleg |
| --- | --- | --- |
| `baseUrl` | `https://app.mylearnq.com` | Andere omgeving van MyLearnQ |
| `cookie` | | Cookie header, nodig buiten de browser |
| `fetch` | `globalThis.fetch` | Eigen fetch, bijvoorbeeld voor tests |
| `headers` | `{}` | Extra headers |

### Methodes

Alle methodes zijn `async`. Laat je `userId` weg, dan wordt je eigen account gebruikt.

| Methode | Geeft terug |
| --- | --- |
| `me()` | Je account: `userId`, `name`, `email`, `role`, ... |
| `checkIns(userId?)` | `checkIns`, `questions` (de vragen van je school), `plannedMinutesByChallenge`, `challenges`, `worlds` |
| `challenges(userId?)` | `challenges` (met `phase`), `active`, `completed`, `openCount`, `maxOpen`, `collaborators`, `worlds` |
| `growth(userId?)` | `coreValues`, `worldDistribution`, `challengeCount`, `sessionAttendance`, `coachNotes` |
| `notes(userId?)` | `notes` |
| `sessions(userId?)` | `sessions`, `reflectionQuestions` |
| `route(path)` | Ruwe, gedecodeerde gegevens van elke pagina, bijvoorbeeld `route("/challenges/123")` |

Elk resultaat heeft ook `raw` met alle gegevens van de pagina, voor velden die hier nog niet netjes zijn uitgewerkt.

### Hulpfuncties

- `decodeDevalue(array)`: decodeert het devalue formaat.
- `challengePhase(challenge)`: geeft `{ key, label, startedOn, progress }`.

### Fouten

- `MyLearnQAuthError`: niet ingelogd of sessie verlopen.
- `MyLearnQError`: andere fout, met `status`.

TypeScript types staan in [`src/index.d.ts`](src/index.d.ts).

## Stabiliteit

Dit is geen officiële API. Als MyLearnQ de website aanpast, kunnen velden veranderen of verdwijnen. Gebruik `raw` en controleer of een veld bestaat.

## Testen

```bash
npm test
```

## Licentie

MIT
