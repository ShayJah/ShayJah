# ShayJah profile repo

This is the special `ShayJah/ShayJah` repo: its root `README.md` is rendered on the GitHub profile page. It also contains the backend for the live Spotify card shown in that README.

## Layout

- `README.md` – the profile page. Uses third-party image services (github-readme-stats, skillicons, streak-stats). The Spotify card is served from `shayjah.vercel.app`.
- `assets/` – `hero.svg` (the banner; shares base colour `#0d1117` and the centre "seam" glow with the top of the Spotify card so they read as one surface) and line-icon SVGs for the README "Connect" dropdown. GitHub strips inline SVG, so these must be image files.
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

## Design rules (Cobuu-style)

- No emojis anywhere (README, card, comments in user-facing text).
- Monochrome palette on base `#0d1117`: text `#f2f2f2` / `#b1b8c0` / `#6e7681`, accent `#e7e7e7`, hairlines white at low opacity. Colour comes only from the album art.
- Type: serif italic (Cormorant Garamond, falling back to Georgia) for names/titles; mono (DM Mono, falling back to Menlo) for small caps labels. Fonts can't be loaded inside GitHub-proxied SVGs, so always give system fallbacks.
- The Spotify SVG is 1000x250 (card centred inside a stage) and the hero is 1000x300; keep widths equal so both scale identically at 100%.
