# Project roadmap

## In progress / done
- [x] Vervang bliksem-emoji in AI-badge door Euria-logo; fix blauwe kader styling.
- [x] Vervang alle "Ferme du Parc Maximilien"/"La Ferme du Parc Maximilien" door "Maxilien" over hele codebase (components, pages, meta, SEO, vertalingen, footer).
- [x] Update footer copyright naar "© 2026 Maxilien. Alle rechten voorbehouden." (+ FR/EN) en behoud "Architectuur & Platform door Delplanche".

## Chat & UI optimalisaties — afgewerkt
- [ ] 1. AI-chat antwoordt altijd in de taal van de gebruiker (geen Engelse tussenzinnen bij NL).
- [ ] 2. Adres overal exact "Schipperijkaai 2, 1000 Brussel" (AI-prompt, kaarten, locatiecomponenten).
- [ ] 3. Geen blauwe tekstselectie/focus meer; huisstijl groen/aardetinten overal.
- [ ] 4. Foto's in de chat klikbaar (fullscreen lightbox); kaarten/planningen groot te openen.
- [ ] 5. Planning-generatie koppelen aan echte databank (reservaties, openingstijden) i.p.v. gokken.
- [ ] 6. QR-code alleen op desktop; op mobiel enkel actieknop/scanner (6-teken code intern, geen extern secret).
- [ ] 7. AI kan overzichten/codes/bevestigingen mailen via Brevo.
- [x] Databankmigratie 0034 (afhaalcodes) uitgevoerd op live databank (ook 0036 certificaatcodes).

### Status (deze ronde)
- [x] Taalslot in de chat (antwoord volledig in de taal van de bezoeker)
- [x] Adres hard vastgezet op Schipperijkaai 2, 1000 Brussel in de chatprompt
- [x] Geen blauwe tekstselectie/focus meer: overal terracotta huisstijl
- [x] Foto's in de chat en op de fotokaarten openen schermvullend
- [x] Kaart/route kan in het groot geopend worden
- [x] Planning gebruikt de echte agenda uit de databank (openingsuren, uitzonderingen, activiteiten)
- [x] QR-code enkel op desktop, niet op mobiel
- [x] E-mailknop bij overzichten: Maxim mailt de planning via Brevo
- [x] Databankaanpassing 0034 (afhaalcodes) uitgevoerd
- [x] Brevo-sleutel ingesteld

## Nieuwe taken (import-sessie)
- [ ] Werkende passkeys (WebAuthn) op profiel + login
- [ ] "Verbonden Accounts" met live status per provider (Google, GitHub, Mastodon, Bluesky) + koppelen/ontkoppelen
- [ ] Veilige e-mailwijziging met bevestigingslink via Brevo
- [x] Ontbrekende API-sleutels/secrets opgevraagd en opgeslagen
- [ ] Architectuur: intern UUID als enige sleutel, koppeltabel user_identities met subject-id per provider (incl. passkeys), e-mail als gewoon profielveld

## Mobiele polish + audit (deze sessie)
- [x] Statuswidget mobiel: korte tekst "Weekrooster →", geen tekstafbreking, hele widget klikbaar
- [x] Zwevende Maxim-knop: meer ruimte onderaan/rechts + veilige zone, ligt boven paginablokken
- [x] Code-audit beheerportaal: CRUD (diensten, prijzen, producten, slots, zalen), orderstatussen, rechtencontrole per beheerfunctie, mobiele tabellen/kaarten — geen blauwe stijlen gevonden
- [ ] Live functionele test van het beheerportaal (echt opslaan in de databank) — wacht op DATABASE_URL in deze omgeving

## Beheerportaal — toegang & media (deze sessie)
- [x] Rechtencontrole centraal: eigenaar / Eigenaar / super_admin krijgen overal volle toegang (permission-core.server.ts)
- [x] API-routes geven 401 bij niet-aangemeld, 403 enkel bij echt geweigerd, 500 bij fout — geen valse "Je hebt geen rechten" meer
- [x] Kaart "Mijn toegang" op de instellingenpagina (e-mail, rollen, rechten, opslag, databank, e-maildienst)
- [x] Opslagknop toont nu meteen of de uploadrechten al goed staan
- [x] Tabblad "Opslag" in de mediakiezer: bestaande Scaleway-bestanden tonen + registreren
- [x] "Verwijder afbeelding" bij de webshop-banner
- [x] Sweep beeldvelden (team, sociale posts, pagina's, academie, producten): voorbeeld + vervangen + verwijderen aanwezig
- [x] Typecheck en tests groen
- [ ] Live test met eigenaarsaccount — wacht op DATABASE_URL en Scaleway-sleutels in deze omgeving

## Drie omgevingen (afgerond)
- [x] Derde modus "field" in app-mode + hostname maximilien.app + `?mode=field`
- [x] Veld-app op /veld: Vandaag, Aanvragen, Scanner, Diensten, Meer + onderbalk
- [x] PWA: eigen manifest, iconen, offline-caching via bewaakte service worker
- [x] Aparte builds via VITE_APP_MODE (public | admin | field), gedocumenteerd in README
- [ ] Passkeys + Google/GitHub/Mastodon/Bluesky (aparte ronde)
- [ ] Live test met eigenaarsaccount zodra databank- en opslagsleutels beschikbaar zijn
