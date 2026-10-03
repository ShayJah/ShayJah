// Renders the card states with fake data so you can tweak the design offline.
// Run with: npm run preview  -> open preview/*.svg in a browser
import { mkdirSync, writeFileSync } from 'node:fs';
import { renderCard } from '../lib/card.js';

const fakeArt =
  'data:image/svg+xml;base64,' +
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff7a59"/><stop offset=".5" stop-color="#c2185b"/><stop offset="1" stop-color="#311b92"/></linearGradient></defs>
      <rect width="300" height="300" fill="url(#g)"/><circle cx="210" cy="90" r="50" fill="#ffd54f" opacity=".9"/>
      <path d="M0 230 Q75 170 150 220 T300 200 V300 H0Z" fill="#1a0033" opacity=".7"/></svg>`
  ).toString('base64');

const song = { title: 'Midnight City', artist: 'M83', album: "Hurry Up, We're Dreaming", art: fakeArt, durationMs: 243_000 };

mkdirSync('preview', { recursive: true });
writeFileSync('preview/playing.svg', renderCard({ ...song, state: 'playing', progressMs: 81_000 }));
writeFileSync('preview/recent.svg', renderCard({ ...song, state: 'recent' }));
writeFileSync('preview/idle.svg', renderCard({ state: 'idle' }));
console.log('Wrote preview/playing.svg, preview/recent.svg, preview/idle.svg');
