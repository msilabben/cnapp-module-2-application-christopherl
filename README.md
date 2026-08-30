# Christopher og Rikke

En mobilvennlig informasjonsside for bryllupet på Øvre Sem Gård 24. juli 2027.

## Endre innhold

- Endre navn, dato, program, sted, antrekk og lenker i `frontend/src/config.ts`.
- Endre farger og skrifttyper i variablene øverst i `frontend/src/styles.css`.
- Den lokale bildefilen ligger i `frontend/public/images`.
- Hver side ligger som en egen komponent i `frontend/src/pages.tsx`.

## RSVP og Google Sheets

Backend bruker en signert `HttpOnly`-informasjonskapsel. Under lokal utvikling blir svar lagret i minnet. Se `integrations/google-apps-script/README.md` for oppsett av varig lagring i Google Sheets.

## Lokal utvikling

```bash
docker compose up --build
```

Frontend er tilgjengelig på `http://localhost:3000`. Backend er tilgjengelig på `http://localhost:8000`.

## Kontroller

```bash
cd frontend && mise exec -- npm ci && mise exec -- npm run build
cd backend && mise exec -- uv sync --dev && mise exec -- uv run pytest -q
```
