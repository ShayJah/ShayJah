# ShayJah profile repo

This is the special `ShayJah/ShayJah` repo: its root `README.md` is rendered on the GitHub profile page. It also contains the backend for the live Spotify card shown in that README.

## Layout

- `README.md` – the profile page. Uses third-party image services (capsule-render, typing-svg, github-readme-stats, skillicons, streak-stats). Spotify card URLs contain a `YOUR-APP` placeholder that must be replaced with the real Vercel domain.
- `.github/workflows/snake.yml` – builds the contribution snake (Platane/snk) every 12h and on push to `main`, publishing SVGs to the `output` branch. The README reads them from `raw.githubusercontent.com/ShayJah/ShayJah/output/`.
- `spotify-now-playing/` – standalone Vercel project (Node >= 20, ESM, no dependencies).
  - `api/now-playing.js` – serverless handler. `GET /api/now-playing` returns the animated SVG card; `?open` 302-redirects to the current song.
  - `lib/spotify.js` – refresh-token auth, currently-playing, fallback to recently-played, art as data URI.
  - `lib/card.js` – `renderCard()` builds the SVG (states: playing / paused / recent / idle).
  - `scripts/get-refresh-token.mjs` – one-time OAuth helper (`npm run token`).
  - `scripts/preview.mjs` – renders fake-data SVGs into `preview/` (`npm run preview`), no credentials needed.

## Commands (run inside `spotify-now-playing/`)

- `npm run preview` – render card states offline; open `preview/*.svg` in a browser.
- `npm run token` – get a Spotify refresh token (needs `.env`).
- `vercel dev` – run the real endpoint locally (needs `.env`).

## Conventions and gotchas

- No build step and no dependencies; keep it that way (plain `fetch`, Node built-ins).
- Never commit `.env`, tokens, or the client secret. Secrets live in `.env` locally and in Vercel env vars in production. `.env.example` lists the variable names only.
- The endpoint must send `Cache-Control: no-cache, no-store` and the card must be a self-contained SVG: GitHub proxies images through camo and blocks scripts and external resources, so album art is inlined as a base64 data URI and animation is CSS only.
- The Spotify redirect URI is exactly `http://127.0.0.1:8888/callback`; it must match the Spotify dashboard character for character.
- Required scopes: `user-read-currently-playing user-read-recently-played`.
- Vercel project must use `spotify-now-playing` as its Root Directory (the repo root is the profile, not the app).
- Do not rename `spotify-now-playing/` or the `output` branch without updating the README and the workflow.
