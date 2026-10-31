# Privacybeleid MyLearnQ+

Laatst bijgewerkt: 31 oktober 2026 (versie 1.1.0)

MyLearnQ+ is een onofficiële browserextensie voor app.mylearnq.com. Dit beleid legt uit welke gegevens de extensie gebruikt.

## Wat de extensie leest

Op app.mylearnq.com leest de extensie dezelfde gegevens die de site zelf al laadt voor jouw account: je naam, check-ins, challenges, ideeën en groeigegevens. Dat gebeurt met de sessie waarmee je al bent ingelogd. De extensie ziet je wachtwoord niet en slaat je inloggegevens niet op.

Deze gegevens worden alleen in je browser getoond. Ze worden niet naar de maker van de extensie of naar een andere partij gestuurd.

## Wat de extensie opslaat

In de opslag van je browser:

- Je instellingen (kleuren, lay-out en dergelijke), via de synchronisatie van je browser.
- Als je die kiest: je eigen achtergrondfoto en eigen CSS, alleen op deze computer. Ze worden nergens heen gestuurd.
- Voor de chat: de codes van je groepen, een sleutelpaar dat op dit apparaat is aangemaakt, en je berichtgeschiedenis in versleutelde vorm.

## Wat de extensie verstuurt

**Naar MyLearnQ:** als je in de extensie een check-in, geplande taken of een check-out opslaat, stuurt de extensie die naar MyLearnQ, op dezelfde manier als het formulier van de site zelf. Dat gebeurt alleen als jij op opslaan klikt.

**Chatberichten** die je zelf verstuurt. Ze worden in je browser versleuteld (AES-256-GCM, twee lagen) en via de openbare dienst ntfy.sh doorgestuurd naar de mensen in dezelfde groep. Een bericht bevat je weergavenaam (voornaam en eerste letter van je achternaam) en je publieke sleutel, maar die zijn alleen leesbaar voor wie de uitnodiging (met de groepscode) heeft. ntfy.sh bewaart versleutelde berichten maximaal 12 uur en kan, zoals elke server, je IP-adres zien. Zie het [privacybeleid van ntfy.sh](https://ntfy.sh/docs/privacy/).

## Wat de extensie niet doet

- Geen analytics, tracking of advertenties.
- Geen eigen server.
- Geen gegevens verkopen of delen.
- Niets in MyLearnQ wijzigen zonder dat jij op opslaan klikt.

## Verwijderen

Verlaat een chatgroep om de geschiedenis van die groep op deze computer te wissen. Als je de extensie verwijdert, wist je browser alle opgeslagen gegevens van de extensie.

## Contact

Vragen of problemen? Open een issue op [github.com/JustMrKoala/mylearnq-plus](https://github.com/JustMrKoala/mylearnq-plus/issues).
