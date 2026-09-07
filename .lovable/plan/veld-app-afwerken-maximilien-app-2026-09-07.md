# Veld-app afwerken (maximilien.app)

De veld-app staat er in basisvorm: vijf tabbladen, een scanner en een offline-melding.
Bij het doorlichten kwamen elf zaken naar boven die nog niet werken zoals afgesproken.
Hieronder wat ik oplos, in volgorde van belang voor iemand die op de boerderij staat.

## 1. Acties die stil mislukken

Bij "Aanmelden" en "Bevestigen" gebeurt er nu niets zichtbaars terwijl het opslaan bezig is,
en bij een fout verschijnt alleen een korte melding.

- Knop toont "Bezig…" en is uitgeschakeld tijdens het opslaan (geen dubbele taps meer).
- Zonder verbinding meteen een duidelijke melding "Je bent offline — deze wijziging is niet bewaard",
  in plaats van een technische fout na een lange wachttijd.
- Mislukte wijziging draait zichtbaar terug met een "Opnieuw proberen"-knop op de kaart zelf.

## 2. Vernieuwen zonder de app te herladen

Nu is "Gegevens vernieuwen" een volledige herlaad van de app (traag, en offline een leeg scherm).
Dit wordt een echte verversing van de gegevens, plus naar beneden trekken om te verversen
op Vandaag en Aanvragen, met een korte draaiende indicator.

## 3. Laad- en lege staten

Aanvragen en Diensten tonen bij traag internet meteen "Geen aanvragen" alsof er niets is.
Beide krijgen dezelfde behandeling als Vandaag: eerst grijze plaatshouders, dan pas de lege melding.
Ook een eigen foutscherm voor de veldschermen met één grote "Opnieuw"-knop.

## 4. Scanner op telefoons met een inkeping

De sluit- en zaklampknop kunnen bovenaan onder de statusbalk/notch vallen, en zijn met ~36 px
kleiner dan de vuistregel voor duimbediening.

- Bovenmarge volgt de veilige zone van het toestel.
- Knoppen naar minstens 48 px.
- Handmatige code: het veld werkt naar 6 tekens toe (teller "3/6", automatisch hoofdletters,
  bevestigen kan vanaf 6), maar langere certificaatcodes blijven mogelijk zodat bestaande
  codes niet stukgaan.

## 5. Installeren op het startscherm

De installatiehint bestaat al, maar wordt in de veld-app niet getoond.
Die komt in de veld-app, met een aparte tekst voor iPhone ("Deel → Zet op beginscherm")
en een knop in Meer om hem opnieuw op te roepen.
Ook screenshots in het app-omslagbestand zodat Android een mooiere installatiekaart toont.

## 6. Veld-app testen vóór publicatie

Nu kiest de app enkel het veld-omslagbestand als de bouw met veldinstelling gemaakt is;
met `?mode=field` in de voorvertoning zie je nog het publieke omslag.
Dit wordt gelijkgetrokken zodat de veldmodus in de voorvertoning ook het juiste omslag,
de juiste titel en het juiste icoon toont.

## 7. Taal

Diensten tonen al de gekozen taal, maar alle knoppen en titels in de veld-app zijn vast Nederlands.
Ik laat de veld-app de taal van de gebruiker volgen (NL/FR/EN) via het bestaande vertaalsysteem
en zet een eenvoudige taalkeuze in Meer die binnen de veld-app blijft.

## 8. Rollen

Iedereen met portaaltoegang ziet nu dezelfde knoppen. Ik verberg "Bevestigen" voor medewerkers
zonder beheerrol (de server weigert het toch), zodat niemand tegen een foutmelding loopt.

## Technische details

- `src/lib/portal-store.tsx`: `isPending`-vlaggen en `isOnline`-controle uit de mutaties naar buiten
  brengen; `refresh()` op basis van `queryClient.invalidateQueries` in plaats van page reload.
- `src/routes/veld.index.tsx`, `veld.aanvragen.tsx`, `veld.diensten.tsx`: skeletons, pending-knoppen,
  inline foutbanner, nieuwe `PullToRefresh`-wrapper (`src/components/field/PullToRefresh.tsx`).
- `src/routes/veld.tsx`: `errorComponent` + `pendingComponent` voor de veldsubroutes; rol uit
  `beforeLoad` doorgeven aan de schermen.
- `src/components/portal/PickupScanner.tsx`: safe-area-top in de header, knoppen naar `size-12`,
  teller en normalisatie op het handmatige veld. Scanlogica en printpad blijven ongewijzigd
  (`@media print`-blok in `src/styles.css:633` wordt hergebruikt).
- `src/components/shells/FieldAppShell.tsx`: `PwaInstallPrompt` mounten (iOS-variant meegeteld).
- `src/routes/__root.tsx`: manifest/apple-icon/titel kiezen op basis van de opgeloste modus,
  niet enkel `getEnvAppMode()`.
- `public/manifest.field.json`: `screenshots` toevoegen (2 mobiele afbeeldingen onder `public/icons/`).
- Vertalingen: veldsleutels toevoegen aan het bestaande `translate()`-woordenboek.

## Controle achteraf

Typecheck, tests, en een browsertest op 390×844: check-in met trage/uitgevallen verbinding,
pull-to-refresh, scannerknoppen binnen de veilige zone, en geen zijwaarts geschuif.
Aanmelden met een echt eigenaarsaccount blijft geblokkeerd zolang de databanksleutels ontbreken;
ik test dan met de bestaande voorbeeldgegevens en meld wat pas live te controleren is.
