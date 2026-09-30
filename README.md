# pagina-entrenaments
Pagina personal de entrenamientos

## Training Hub · Toni

Static GitHub Pages app. Open index.html; no build or third-party frontend dependencies.

- data.js: historical records, independent from the interface.
- app.js: filtering, individual session details, summaries and historical tables.
- index.html: responsive layout.

Migration 2026-09-30: all 134 sessions, 59 monthly summaries, 21 weight records, 7 InBody records and 31 races from fitness-tracker-actualitzat.jsx. Four more recent sessions from the previous Hub bring the total to 138. Existing Hub summaries and notes for matching sessions are preserved in hub_* fields. Every original source field is retained. Monthly aggregates are independent from individual sessions and must never be added to session totals.

Missing values are displayed as unknown. InBody scores of zero remain stored unchanged and are shown as unknown. Dates and potential anomalies in the historical source are retained for later review. New sessions require a source and a unique ID; check date and activity for duplicates before adding. Keep existing IDs and records intact. Update session data, not hard-coded dashboard numbers.

Current goal supplied by Toni: Bombers 10K, 2026-11-08, sub 45:00. Planning and nutrition remain pending; no new training prescription has been added in this migration.
