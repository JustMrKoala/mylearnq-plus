# Publiceren in de Microsoft Edge Add-ons store

Alles wat je nodig hebt om MyLearnQ+ in te dienen via [Partner Center](https://partner.microsoft.com/dashboard/microsoftedge/overview).

## Stap voor stap

1. **Ontwikkelaarsaccount.** Meld je aan bij het [Microsoft Edge programma in Partner Center](https://partner.microsoft.com/dashboard/microsoftedge/public/login?ref=dd). Registreren voor Edge is gratis. Je hebt een Microsoft-account nodig. Ben je jonger dan 18, dan heb je mogelijk een ouder of voogd nodig om het account aan te maken.
2. **Pakket bouwen.** Voer `./scripts/build.ps1` uit. Je krijgt `dist/mylearnq-plus-<versie>.zip`.
3. **Nieuwe extensie.** Klik in Partner Center op **Create new extension** en upload de zip.
4. **Availability.** Kies **Public** en de markten waar je hem wilt aanbieden (bijvoorbeeld alleen Nederland en België).
5. **Properties.** Vul de velden in met de tekst uit [listing.md](listing.md): categorie, privacybeleid, website en support.
6. **Store listings.** Voeg Nederlands (en eventueel Engels) toe, plak de beschrijving en upload de afbeeldingen hieronder.
7. **Submit.** Plak de tekst voor de testers uit [listing.md](listing.md) in **Notes for certification** en dien in. De beoordeling duurt meestal enkele werkdagen.

## Afbeeldingen

| Bestand | Waarvoor | Formaat |
| --- | --- | --- |
| [`images/logo-300.png`](images/logo-300.png) | Extension logo (verplicht) | 300 × 300 |
| [`images/promo-440x280.png`](images/promo-440x280.png) | Small promotional tile | 440 × 280 |
| [`images/promo-1400x560.png`](images/promo-1400x560.png) | Large promotional tile | 1400 × 560 |
| [`screenshots/`](screenshots) | Screenshots (maximaal 10) | 1280 × 800 |

De screenshots tonen de echte extensiecode met **verzonnen** gegevens uit [`demo/`](demo), zodat er geen echte leerlingen in de store staan. Opnieuw maken: `./scripts/screenshots.ps1`.

## Aandachtspunten voor de beoordeling

- **Merknaam.** De naam bevat "MyLearnQ", een naam van een ander. Daarom staat overal duidelijk "onofficieel" en "niet verbonden aan MyLearnQ". Het extensie-icoon is eigen werk; het logo van MyLearnQ wordt niet meegeleverd, maar alleen op de site zelf uit de pagina overgenomen. Vraagt Microsoft toch om een andere naam, dan is iets als "LearnQ Plus" een optie.
- **Testers kunnen niet inloggen.** De extensie werkt alleen met een schoolaccount. In de notities staat daarom uitgelegd wat ze kunnen controleren zonder account.
- **Externe dienst.** De chat gebruikt ntfy.sh. Dat staat in de beschrijving, het privacybeleid en de rechtvaardiging van de machtigingen.
