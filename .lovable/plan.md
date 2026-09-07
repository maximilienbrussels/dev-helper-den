# Drie omgevingen: publieke site, beheer op desktop, veld-app op de gsm

Eén codebasis, drie bouwen. Welke versie iemand ziet, hangt af van het adres waarop ze binnenkomen.

| Adres | Wat het is | Wie |
| --- | --- | --- |
| maximilien.brussels | De publieke site: info, boekingen, webshop, Maxim-gids, kalender | Bezoekers, scholen, buurt |
| maximilien.site (of manager.maximilien.brussels) | Het beheer op desktop/tablet: diensten, prijzen, mediabibliotheek, e-mail, team, instellingen | Eigenaars en beheerders |
| maximilien.app | De veld-app op de gsm, installeerbaar op het startscherm | Personeel op het terrein |

Alle drie praten met dezelfde databank en dezelfde aanmelding, zodat je nooit opnieuw moet inloggen of gegevens uit de pas lopen.

## 1. Derde modus toevoegen

Vandaag kent de app twee modi ("public" en "admin"). Daar komt "field" bij:

- Het adres `maximilien.app` schakelt automatisch naar de veld-app; `maximilien.site` blijft het beheer; al de rest is publiek.
- In de voorvertoning kan je via `?mode=field` de veld-app bekijken zonder eigen adres.
- In veld-modus zijn enkel de veldpagina's en de aanmeldpagina bereikbaar; wie een beheerlink opent, wordt netjes doorgestuurd.

## 2. De veld-app zelf

Nieuwe, lichte schermen — geen brede tabellen, alles duimvriendelijk, geen zijwaarts schuiven:

- **Vandaag** — de agenda van de dag: activiteiten, groepen, uren, in één kolom.
- **Aanvragen** — openstaande bestellingen, schoolbezoeken en aanvragen, als kaartjes met één actie per kaartje.
- **Scanner** (grote knop in het midden) — camera start meteen, zaklamp aan/uit, invoerveld voor de code van 6 tekens, groen scherm bij succes dat na 2 seconden vanzelf terugspringt, en één knop om een certificaat af te drukken. De bestaande scanner wordt hiervoor hergebruikt en schermvullend gemaakt.
- **Diensten** — korte lijst van actieve diensten met prijs.
- **Meer** — profiel, taal, afmelden en secundaire acties.

Onderaan een vaste balk met deze vijf. Bovenaan enkel een dunne titelbalk, met respect voor de inkeping en de veilige zone van de telefoon.

## 3. Installeerbaar en offline

- Eigen app-omslag voor de veld-app (eigen naam, icoon, kleur, volledig scherm) zodat "Toevoegen aan startscherm" op Samsung een echte app oplevert.
- Iconen in de nodige formaten, inclusief een variant die Android netjes bijsnijdt.
- Offline: de laatst geladen schermen blijven zichtbaar bij slechte ontvangst. Scannen, afboeken en opslaan hebben nog altijd verbinding nodig — dat wordt duidelijk getoond met een "geen verbinding"-balkje.
- De offline-laag staat uit in de Lovable-voorvertoning en tijdens ontwikkeling, zodat je nooit een verouderd scherm te zien krijgt.

## 4. Publiceren: drie bouwen

Elke bouw krijgt zijn vaste modus mee, plus een korte handleiding in het project:

- publiek → `VITE_APP_MODE=public`
- beheer → `VITE_APP_MODE=admin`
- veld → `VITE_APP_MODE=field`

De drie wijzen naar dezelfde databank en dezelfde aanmeldsleutels; de toegelaten adressen voor aanmelding en opslag worden uitgebreid met de drie domeinen zodat er geen sessies wegvallen.

## 5. Aanmelden

De bestaande aanmelding blijft. Passkeys en aanmelden via Google, GitHub, Mastodon of Bluesky doen we in een aparte ronde, zoals afgesproken.

## Technische uitvoering

- `src/lib/app-mode.ts`: `AppMode` wordt `"public" | "admin" | "field"`, met `FIELD_HOSTNAME = "maximilien.app"`, `isFieldPath()` en padlijst `/veld/*`; `detectAppMode` en de routepoort in `__root.tsx` / `PortalRoot` krijgen de derde tak.
- Nieuwe routes onder `src/routes/_authenticated/`: `veld.tsx` (schil met onderbalk), `veld.index.tsx` (Vandaag), `veld.aanvragen.tsx`, `veld.scanner.tsx`, `veld.diensten.tsx`, `veld.meer.tsx`. Ze hergebruiken de bestaande serverfuncties voor agenda, aanvragen en diensten — geen nieuwe databanklogica.
- Schermvullende variant van `PickupScanner` (bestaande torch/fallback/auto-reset blijft); printstijl in een `@media print`-blok.
- PWA volgens de PWA-skill: `vite-plugin-pwa` met `generateSW`, `injectRegister: null`, `devOptions.enabled: false`, registratie enkel via één bewaakte wrapper (niet in iframe, niet in preview, `?sw=off` als noodrem), `NetworkFirst` voor pagina's, `CacheFirst` enkel voor gebouwde bestanden, `/~oauth` uitgesloten. Alleen actief wanneer de modus "field" is.
- `public/manifest.field.json` + iconen in `public/icons/field/`; `__root.tsx` kiest per modus de juiste `manifest`-verwijzing, themakleur en `apple-touch-icon`.
- `.env.example` en `README`/`roadmap.md` bijgewerkt met de drie bouwcommando's en de domeinen; `OAUTH_ALLOWED_ORIGINS`, `PUBLIC_SITE_ORIGIN` en `S3_CORS_ORIGINS` krijgen de drie domeinen.
- Afsluiten met typecheck, tests en een controle van de veld-app in een mobiel venster.

## Wat hier niet in zit

- Passkeys en sociale aanmeldingen (aparte ronde).
- Nieuwe beheerfuncties: het bestaande beheer verhuist niet en verandert niet van inhoud.
- De echte live test met eigenaarsaccount blijft wachten op de databank- en opslagsleutels in deze omgeving.
