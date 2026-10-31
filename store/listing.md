# Storetekst MyLearnQ+

Kopieer deze velden naar Partner Center.

## Properties

| Veld | Waarde |
| --- | --- |
| Category | Productivity |
| Privacy policy | Yes, `https://github.com/JustMrKoala/mylearnq-plus/blob/main/PRIVACY.md` |
| Website URL | `https://github.com/JustMrKoala/mylearnq-plus` |
| Support contact | `https://github.com/JustMrKoala/mylearnq-plus/issues` |
| Mature content | No |

## Nederlands (nl)

**Naam:** MyLearnQ+ (onofficieel)

**Korte beschrijving** (maximaal 132 tekens):

> Een rustige, aanpasbare interface voor MyLearnQ, met een versleutelde chat. Onofficieel en niet verbonden aan MyLearnQ.

**Beschrijving:**

```
MyLearnQ+ geeft MyLearnQ (app.mylearnq.com) een nieuwe, rustige interface die je helemaal zelf kunt instellen.

WAT JE KRIJGT
• Een overzicht van je dag: je check-in van vandaag, je check-in ritme, je actieve challenges en je kernwaarden.
• Check-ins per week, met per dag je planning en antwoorden.
• Challenges met hun fase, voortgang, presentatiedatum, deelnemers, leervraag en deelvragen.
• Groei in beeld: je kernwaarden en hoe je challenges verdeeld zijn over de werelden.
• Bewerken werkt zoals je gewend bent: invullen en wijzigen gebeurt in het originele formulier van MyLearnQ, geopend in een zijpaneel.

HELEMAAL AANPASBAAR
• Accentkleur, licht of donker thema, oppervlak en achtergrond
• Zijbalk of bovenbalk, ruim of compact
• Afronding, lettertype en tekstgrootte
• Kies welke blokken je op je dashboard ziet en in welke volgorde
• Inspiratiesessies verbergen als je school die niet gebruikt
• Liever de originele site? Kies de klassieke weergave met alleen een nieuwe stijl

VERSLEUTELDE CHAT
Maak een kamer en deel de geheime code met klasgenoten. Berichten worden in je browser versleuteld met AES-256-GCM (twee lagen) en elk bericht wordt ondertekend, zodat niemand berichten kan vervalsen. Ze worden doorgestuurd via de openbare dienst ntfy.sh, die alleen onleesbare tekst ziet.

PRIVACY
Geen tracking, geen advertenties en geen eigen server. Je MyLearnQ-gegevens blijven in je browser. De extensie verandert zelf niets in MyLearnQ.

OPEN SOURCE
De broncode staat op GitHub: github.com/JustMrKoala/mylearnq-plus

Let op: MyLearnQ+ is een onofficieel project en is niet gemaakt, gesteund of goedgekeurd door MyLearnQ of door een school. Je hebt een eigen MyLearnQ-account nodig.
```

**Zoektermen** (maximaal 7): `MyLearnQ`, `school`, `check-in`, `challenges`, `leerling`, `dashboard`, `chat`

## English (en)

**Name:** MyLearnQ+ (unofficial)

**Short description:**

> A calm, customizable interface for MyLearnQ with an encrypted chat. Unofficial and not affiliated with MyLearnQ.

**Description:**

```
MyLearnQ+ gives MyLearnQ (app.mylearnq.com) a new, calm interface that you can fully customize.

FEATURES
• A daily overview: today's check-in, your check-in rhythm, active challenges and core values.
• Weekly check-ins with your plan and answers per day.
• Challenges with phase, progress, presentation date, collaborators and learning questions.
• Growth overview: core values and how your challenges spread across the worlds.
• Editing works as before: forms open from MyLearnQ itself in a side panel.

CUSTOMIZABLE
Accent color, light or dark theme, surfaces, sidebar or top bar, density, corner radius, font, text size and dashboard widgets. Hide inspiration sessions, or switch to a classic view that only restyles the original site.

ENCRYPTED CHAT
Create a room and share its secret code with classmates. Messages are encrypted in your browser with AES-256-GCM (two layers) and every message is signed. They are relayed through the public service ntfy.sh, which only sees ciphertext.

PRIVACY
No tracking, no ads, no own server. Your MyLearnQ data stays in your browser and the extension never changes anything in MyLearnQ.

Open source: github.com/JustMrKoala/mylearnq-plus

MyLearnQ+ is an unofficial project, not made, endorsed or approved by MyLearnQ or any school. You need your own MyLearnQ account.
```

## Rechtvaardiging van machtigingen

Partner Center vraagt soms waarom een extensie bepaalde rechten nodig heeft.

| Machtiging | Waarom |
| --- | --- |
| `storage` | Instellingen opslaan, en voor de chat de kamercodes, het sleutelpaar van dit apparaat en de versleutelde berichtgeschiedenis. |
| `https://app.mylearnq.com/*` | De nieuwe interface tonen op MyLearnQ en de gegevens lezen die de site zelf al laadt voor de ingelogde gebruiker. |
| `https://ntfy.sh/*` | Versleutelde chatberichten versturen en ontvangen via de openbare relay ntfy.sh. |

De extensie gebruikt geen externe of op afstand geladen code; alle scripts zitten in het pakket.

## Notes for certification

```
MyLearnQ+ is an unofficial interface for app.mylearnq.com, a learning platform used by Dutch schools. It only runs on that site.

Logging in requires a school Microsoft account, so testers will most likely not be able to sign in. Without an account you can check:
1. Open https://app.mylearnq.com: the login page gets a restyled look (the extension does not touch the login itself).
2. Click the extension icon: the popup with display mode, colors and theme opens and settings are saved.
3. The full interface with fictional demo data is shown in the screenshots. The demo used to make them is in the repository: store/demo/demo.html.

How it works: after login, the extension hides the original page and renders its own interface in a shadow root, using the same SvelteKit "__data.json" endpoints the site loads itself. It never writes data to MyLearnQ; edits open the site's own forms in an iframe side panel.

The optional chat sends end-to-end encrypted messages (AES-256-GCM, ECDSA signatures) through the public relay ntfy.sh. No analytics or remote code.

Source code: https://github.com/JustMrKoala/mylearnq-plus
```
