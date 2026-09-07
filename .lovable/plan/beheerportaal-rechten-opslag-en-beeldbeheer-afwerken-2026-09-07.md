# Beheerportaal: rechten, opslag en beeldbeheer afwerken

## Wat er nu al klopt (gecontroleerd)

- De centrale rechtencontrole geeft eigenaars volledige toegang: beide eigenaarsaccounts (desk@… en jon…@maximilien.site) komen uit de controle als **volledige toegang**; ook het extra account via `portal_admins` wordt herkend. Een 403 kan enkel nog ontstaan bij een echte weigering; databank- of configuratiefouten geven nu een 500 met de echte oorzaak.
- De Scaleway-sleutels werken: de bucket `maximilien-media` is bereikbaar en bevat de mappen `Uploads. /`, `bibliotheek/`, `media/`, `site/`, `__lovable-test/`. De CORS-regels staan er **nog niet** op (bucket meldt "geen CORS-configuratie") — de knop is dus nog nooit succesvol doorgelopen.
- De mediabibliotheek-tabel bevat 3 beelden (1 in de prullenbak); "Nog geen beelden" verschijnt enkel wanneer de tabel leeg is, niet bij een rechtenfout.
- Uploadvelden met `ImageUploader` (pagina-inhoud, academie, producten) hebben al voorbeeld + "Vervangen" + "Verwijderen"; sociale posts, bewoners en team hebben al een wisknop.

## Wat er nog gebouwd wordt

### 1. "Mijn toegang"-kaart op de instellingenpagina
Nieuwe kaart naast "Opslagrechten" die toont wat de server over jouw sessie ziet:
- e-mailadres, gebruikers-ID, rollen, vaste eigenaar ja/nee, portaalbeheerder ja/nee, volledige toegang ja/nee, lijst toegekende rechten;
- opslagstatus: sleutels aanwezig (enkel ja/nee, nooit de waarde), bucket en endpoint, CORS al ingesteld of niet;
- e-mailstatus: Brevo-sleutel aanwezig ja/nee.
Met een knop "Opnieuw controleren".

### 2. Knop "Initialiseer Scaleway S3 Rechten" robuust maken
- Foutmeldingen uitsplitsen: 401 → "Log opnieuw in", 403 → "Geen rechten (rol X gezien)", 500 → de echte opslagfout.
- Na succes meteen de CORS-status in de "Mijn toegang"-kaart verversen.
- Live test met een eigenaarssessie: knop klikken, groene bevestiging, bucket-CORS daarna aanwezig.

### 3. Rechten consistent maken (één bron van waarheid)
- `rights.functions.ts` (voedt de knoppen in de interface) laten steunen op dezelfde `resolveAccess` als de server, zodat eigenaars nooit een verborgen knop of een valse "Je hebt geen rechten" krijgen.
- Rechtenmatrix in de databank bijwerken (migratie 0037): `owner`, `super_admin` en `admin` krijgen alle rechten, incl. de ontbrekende `manage_settings`, `manage_content`, `view_audit`.
- Uploadroutes voor beelden (`presigned-upload`, `upload-s3`, `/api/storage/*`, `/api/media/scaleway/*`) vragen voortaan het recht `manage_media` in plaats van `manage_settings` of enkel "ingelogd" — personeel met mediarechten kan uploaden, klanten niet.
- De losse rolcontrole in `config-check` (cookie + eigen rollenlijst) vervangen door dezelfde centrale controle.

### 4. "Opslag"-tab in de beeldkiezer
De beeldkiezer krijgt twee tabs: **Bibliotheek** (huidige lijst) en **Opslag (Scaleway)**.
- De Opslag-tab bladert door de bucket met de bestaande lijstfunctie: mappen, miniaturen, "meer laden".
- Klik op een bestand = registreren in de bibliotheek (nieuwe serverfunctie `registerStorageObject`: bestandsgrootte/type ophalen, rij in `media_assets` aanmaken, dubbele registratie op dezelfde sleutel voorkomen) en meteen selecteren.
- Knop "Alle beelden in deze map toevoegen" voor bulkregistratie.
- Dezelfde tab ook in de Mediapagina van het portaal.

### 5. Webshop-hero: verwijderen en vervangen
- Kaart toont voorbeeld (al aanwezig) + knoppen **"Vervang / kies nieuw"** en **"Verwijder afbeelding"**.
- Nieuwe serverfunctie `clearShopHero` zet de hero leeg; de webshop valt dan terug op het standaardbeeld (moestuinfoto). De kaart toont "Standaardbeeld actief".
- Opslaan gebeurt direct, met bevestiging; werkt ook op mobiel (knoppen onder elkaar).

### 6. Sweep van alle beeldvelden
Controle dat elk beeldveld in het portaal voorbeeld + vervangen + verwijderen heeft: producten, academie, pagina-inhoud (hero, blokken, galerij, events), sociale posts, bewoners, team, albums, e-mailsjablonen. Ontbrekende wisknoppen worden toegevoegd met hetzelfde patroon.

### 7. Controle
- Typecheck en bestaande tests.
- Browsertest met een eigenaarssessie: instellingen → "Mijn toegang" en S3-knop; webshopbeheer → hero verwijderen en opnieuw kiezen; beeldkiezer → Opslag-tab toont de bucketmappen en registreert een beeld.
- Roadmap bijwerken.

## Technische details

- Nieuwe serverfuncties (`createServerFn` + `requireAuth`): `getMyAccess` (in `access-diagnostics.functions.ts`, leest `resolveAccess`, S3-config-booleans en `GetBucketCors`), `registerStorageObject` / `registerStorageFolder` (in `media.functions.ts`, recht `manage_media`, `HeadObject` + insert met `storage_key`-dedupe), `clearShopHero` (in `shop-admin.functions.ts`, recht `manage_products`).
- Migratie `neon/migrations/0037_full_access_matrix.sql`: upsert van alle rechten voor `owner`, `super_admin`, `admin` in `role_permissions`; wordt na goedkeuring meteen op de databank uitgevoerd.
- `rights.functions.ts` → `loadMyRights` gebruikt `resolveAccess` uit `permission-core.server.ts`; de aparte `FULL_ACCESS_ROLES`-kopie verdwijnt.
- `route-permission.server.ts` krijgt een variant `guardApiRouteAny(request, [...rechten])` voor uploadroutes.
- `ImagePickerModal` krijgt een `Tabs`-wrapper; de Opslag-tab hergebruikt `listScalewayMedia` uit `src/lib/api/scaleway.ts`.
- Sessie voor de browsertest wordt server-side aangemaakt met `signSession` voor een eigenaarsaccount en in `localStorage` gezet; geen wachtwoorden nodig.
- Er zijn geen nieuwe sleutels nodig: alle S3-, Brevo- en auth-secrets zijn aanwezig en werken.
