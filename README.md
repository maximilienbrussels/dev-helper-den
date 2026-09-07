# Blueprint Buddy

importeer: https://github.com/maximilienbrussels/blueprint-buddy.git

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/151e0ead-2b4e-46da-803c-d64f3631adbc).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Drie omgevingen, één codebasis

| Bouw | Commando | Domein |
| --- | --- | --- |
| Publieke site | `VITE_APP_MODE=public bun run build` | maximilien.brussels |
| Beheer (desktop) | `VITE_APP_MODE=admin bun run build` | maximilien.site |
| Veld-app (PWA) | `VITE_APP_MODE=field bun run build` | maximilien.app |

Alle drie gebruiken dezelfde Neon-databank en dezelfde aanmeldsleutels. Neem de
drie domeinen op in `OAUTH_ALLOWED_ORIGINS`, `PUBLIC_SITE_ORIGIN` en de
CORS-oorsprongen van de S3-bucket, anders vallen sessies of uploads weg.

Zonder `VITE_APP_MODE` (lokaal/preview) beslist de hostname, met `?mode=public`,
`?mode=admin` of `?mode=field` als handmatige schakelaar.

De veld-app draait op `/veld` (Vandaag, Aanvragen, Scanner, Diensten, Meer),
is installeerbaar via `public/manifest.field.json` en heeft offline-caching.
De service worker registreert enkel in een echte productiebouw — nooit in dev,
in een iframe of in de Lovable-voorvertoning; `?sw=off` schakelt hem uit.
