# Alle ontbrekende sleutels opvragen

De code gebruikt sleutels voor databank, e-mail, betalingen, AI, kaarten, opslag en inloggen. Zodra je dit goedkeurt, vraag ik ze in beveiligde invoervensters op — in groepjes, zodat je ze rustig kan opzoeken. Je hoeft niets in de chat te plakken.

## Groep 1 — Databank (nodig om überhaupt te werken)
- DATABASE_URL (of NEON_DATABASE_URL)
- NEON_AUTH_URL, NEON_DATA_API_URL

## Groep 2 — Beveiliging (ik genereer deze zelf, geen actie van jou)
- AUTH_SECRET / AUTH_JWT_SECRET / JWT_SECRET
- INTERNAL_API_SECRET, CONFIG_CHECK_TOKEN, LOVABLE_CRON_SECRET
- PICKUP_QR_SECRET, TOKEN_ENCRYPTION_KEY

## Groep 3 — E-mail
- BREVO_API_KEY, BREVO_SENDER_EMAIL
- Eventueel SMTP: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM

## Groep 4 — AI-assistent Maxim
- INFOMANIAK_AI_API_KEY, INFOMANIAK_AI_PRODUCT_ID
- (modelnamen INFOMANIAK_AI_FAST_MODEL / _DEEP_MODEL / _FALLBACK_MODELS vul ik met standaardwaarden in)

## Groep 5 — Betalingen (Stripe)
- STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
- STRIPE_PUBLISHABLE_KEY (publiek, mag in de code)

## Groep 6 — Inloggen via externe accounts
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
- GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
- MASTODON_INSTANCE_URL, BSKY_IDENTIFIER, BSKY_APP_PASSWORD

## Groep 7 — Kaarten & mobiliteit
- OPENROUTESERVICE_API_KEY (of ORS_API_KEY)
- BELGIAN_MOBILITY_API_KEY

## Groep 8 — Bestandsopslag (foto's, documenten)
- S3_ENDPOINT, S3_REGION, S3_BUCKET_NAME, S3_ACCESS_KEY, S3_SECRET_KEY
- S3_PUBLIC_URL_PREFIX, S3_CORS_ORIGINS, S3_UPLOAD_ACL

## Groep 9 — Google Wallet (digitale tickets)
- GOOGLE_WALLET_ISSUER_ID, GOOGLE_WALLET_CLIENT_EMAIL, GOOGLE_WALLET_PRIVATE_KEY

## Groep 10 — Website-adressen (geen geheimen, ik vul ze in)
- PUBLIC_SITE_URL / PUBLIC_SITE_ORIGIN / SITE_URL / SITE_ORIGIN, OAUTH_ALLOWED_ORIGINS

## Werkwijze
1. Ik genereer eerst automatisch alle interne sleutels uit groep 2.
2. Daarna open ik per groep een beveiligd invoerformulier. Wat je niet hebt, sla je gewoon over — die functie blijft dan tijdelijk uit.
3. Na de databanksleutel voer ik de openstaande databankaanpassing (afhaalcodes) uit en test ik e-mail, AI-chat en inloggen.
