# MyLearnQ+

Een onofficiële browserextensie die [MyLearnQ](https://app.mylearnq.com) een nieuwe, rustige en volledig aanpasbare interface geeft, met een end-to-end versleutelde chat. In deze repository staat ook een kleine open source API-client voor dezelfde gegevens.

![MyLearnQ+ overzicht](store/screenshots/1-overzicht.png)

> **Let op:** dit project is niet gemaakt, gesteund of goedgekeurd door MyLearnQ of door een school. Het leest alleen je eigen gegevens uit, met de sessie waarmee je al bent ingelogd.

## Wat zit erin

| Map | Inhoud |
| --- | --- |
| [`extension/`](extension) | De browserextensie (Manifest V3, werkt in Chrome en Edge) |
| [`api/`](api) | `mylearnq-api`: een JavaScript client om je MyLearnQ-gegevens op te halen |
| [`store/`](store) | Teksten en afbeeldingen voor de Microsoft Edge Add-ons store |
| [`scripts/`](scripts) | Buildscript dat een zip maakt om te uploaden |

## Functies van de extensie

- **Nieuwe interface** voor Overzicht, Check-in, Challenges, Ideeën en Groei in beeld, gebouwd op de gegevens die de site zelf ook laadt.
- **Bewerken blijft werken:** invullen en wijzigen gebeurt in het originele formulier, geopend in een zijpaneel. De extensie schrijft zelf nooit iets naar MyLearnQ.
- **Aanpasbaar:** accentkleur, licht of donker thema, oppervlak, achtergrond, zijbalk of bovenbalk, dichtheid, afronding, lettertype, tekstgrootte, en welke dashboardblokken je ziet en in welke volgorde.
- **Inspiratiesessies verbergen** voor scholen waar die niet van toepassing zijn.
- **Klassieke weergave:** liever de originele site? Dan krijgt die alleen een nieuwe stijl.
- **Versleutelde chat** met geheime kamercodes (zie hieronder).

## Installeren

### Uit de store

Binnenkort in de Microsoft Edge Add-ons store.

### Handmatig (Chrome of Edge)

1. Download of clone deze repository.
2. Ga naar `chrome://extensions` of `edge://extensions`.
3. Zet **Ontwikkelaarsmodus** aan.
4. Klik op **Uitgepakte extensie laden** en kies de map `extension`.
5. Open of herlaad [app.mylearnq.com](https://app.mylearnq.com).

## Chat en beveiliging

Berichten gaan via de openbare relay [ntfy.sh](https://ntfy.sh). Ze worden in je browser versleuteld voordat ze worden verstuurd.

1. **Handtekening:** elk bericht wordt ondertekend met een ECDSA P-256 sleutel die alleen op jouw apparaat staat. Ontvangers controleren de handtekening en zien een sleutelvingerafdruk. Gebruikt iemand dezelfde naam met een andere sleutel, dan krijg je een waarschuwing.
2. **Kamerlaag:** AES-256-GCM met een sleutel die met PBKDF2 (SHA-256, 250.000 rondes) wordt afgeleid van de geheime kamercode van 20 tekens (100 bits).
3. **Applaag:** nog een laag AES-256-GCM met een vaste appsleutel, zodat de relay geen herkenbare structuur ziet.

Elke laag gebruikt een eigen willekeurige IV en bindt context via additional data. Berichten hebben een uniek ID en een tijdstempel, zodat herhaalde of verplaatste berichten worden geweigerd.

**Eerlijk over de grenzen:**

- De appsleutel staat in de broncode en is voor iedereen gelijk. De echte bescherming is de kamercode: deel die alleen persoonlijk.
- ntfy.sh bewaart berichten maximaal 12 uur. Je eigen geschiedenis blijft versleuteld op je computer staan.
- De relay ziet wel wanneer er berichten zijn en vanaf welk IP-adres ze komen.
- Dit is een schoolproject en is niet door een expert gecontroleerd. Gebruik het niet voor echt gevoelige informatie.

## Bouwen

```powershell
./scripts/build.ps1
```

Dit maakt `dist/mylearnq-plus-<versie>.zip`, klaar om te uploaden naar de Edge Add-ons store.

## Privacy

Zie [PRIVACY.md](PRIVACY.md). Kort gezegd: geen tracking, geen eigen server, en alleen chatberichten verlaten je browser, versleuteld.

## Licentie

[MIT](LICENSE)
