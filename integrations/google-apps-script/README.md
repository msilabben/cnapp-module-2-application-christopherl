# Google Sheets-oppsett

RSVP-svar blir lagret i minnet under lokal utvikling. Følg disse trinnene for å lagre svar i Google Sheets:

1. Opprett et Google-regneark.
2. Åpne **Utvidelser → Apps Script** i regnearket.
3. Lim inn innholdet fra `Code.gs`.
4. Legg til skriptegenskapene `SPREADSHEET_ID` og `RSVP_SHARED_SECRET` under prosjektinnstillingene.
5. Publiser skriptet som en nettapp. Kjør skriptet som deg. Tillat tilgang for alle.
6. Sett `GOOGLE_SHEETS_WEB_APP_URL`, `GOOGLE_SHEETS_SHARED_SECRET` og `RSVP_SESSION_SECRET` i backend-miljøet.

Bruk en lang, tilfeldig verdi for begge hemmelighetene. Ikke legg verdiene i Git.
