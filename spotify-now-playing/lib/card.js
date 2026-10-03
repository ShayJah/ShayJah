// Renders the "now playing" card as an animated SVG.
// Everything (album art included) is inlined, because GitHub's image proxy
// won't load external resources referenced from inside an SVG.

const W = 560;
const H = 170;
const GREEN = '#1DB954';

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);

const clip = (s = '', n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);

const fmt = (ms = 0) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

const LABELS = {
  playing: 'NOW PLAYING ON SPOTIFY',
  paused: 'PAUSED ON SPOTIFY',
  recent: 'LAST PLAYED ON SPOTIFY',
  idle: 'SPOTIFY',
};

export function renderCard({ state = 'idle', title, artist, album, art, progressMs = 0, durationMs = 0 }) {
  const playing = state === 'playing';
  const idle = state === 'idle' || !title;

  const songTitle = idle ? 'Nothing playing right now' : clip(title, 25);
  const subtitle = idle ? 'Probably coding in silence…' : clip(artist, 34);
  const albumLine = idle ? '' : clip(album, 42);

  const progress = durationMs ? Math.min(progressMs / durationMs, 1) : 0;
  const remainingSec = Math.max((durationMs - progressMs) / 1000, 0.1);

  // Equalizer bars next to the label
  const bars = [0, 1, 2, 3]
    .map((i) => `<rect class="bar" x="${236 + i * 5}" y="36" width="3" height="12" rx="1" style="animation-delay:-${(i * 0.27).toFixed(2)}s"/>`)
    .join('');

  const artBlock = art
    ? `<image href="${art}" x="24" y="30" width="110" height="110" clip-path="url(#artClip)" preserveAspectRatio="xMidYMid slice"/>`
    : `<rect x="24" y="30" width="110" height="110" rx="12" fill="url(#fallback)"/>
       <text x="79" y="96" font-size="40" text-anchor="middle" fill="#fff" opacity=".85">♫</text>`;

  const vinylLabel = art
    ? `<image href="${art}" x="141" y="67" width="36" height="36" clip-path="url(#labelClip)" preserveAspectRatio="xMidYMid slice"/>`
    : `<circle cx="159" cy="85" r="18" fill="${GREEN}"/>`;

  const grooves = [50, 44, 38, 32, 26]
    .map((r) => `<circle cx="159" cy="85" r="${r}" fill="none" stroke="#2a2a2a" stroke-width="1"/>`)
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(LABELS[state])}: ${esc(songTitle)} by ${esc(subtitle)}">
  <defs>
    <clipPath id="card"><rect width="${W}" height="${H}" rx="18"/></clipPath>
    <clipPath id="artClip"><rect x="24" y="30" width="110" height="110" rx="12"/></clipPath>
    <clipPath id="labelClip"><circle cx="159" cy="85" r="18"/></clipPath>
    <filter id="blur"><feGaussianBlur stdDeviation="28"/></filter>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity=".55"/></filter>
    <linearGradient id="shade" x1="0" x2="1">
      <stop offset="0" stop-color="#0d1117" stop-opacity=".55"/>
      <stop offset="1" stop-color="#0d1117" stop-opacity=".92"/>
    </linearGradient>
    <linearGradient id="fallback" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${GREEN}"/>
      <stop offset="1" stop-color="#191414"/>
    </linearGradient>
    <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/>
      <stop offset=".5" stop-color="#fff" stop-opacity=".12"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <style>
    text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; }
    .label { font-size: 11px; font-weight: 700; letter-spacing: 1.6px; fill: ${playing ? GREEN : '#8b949e'}; }
    .title { font-size: 22px; font-weight: 800; fill: #fff; }
    .artist { font-size: 15px; font-weight: 500; fill: #c9d1d9; }
    .album { font-size: 12px; fill: #8b949e; }
    .time { font-size: 11px; fill: #8b949e; font-variant-numeric: tabular-nums; }
    .fade { animation: fadeIn .6s ease-out backwards; }
    .d1 { animation-delay: .1s } .d2 { animation-delay: .25s } .d3 { animation-delay: .4s }
    .bar { fill: ${playing ? GREEN : '#484f58'}; transform-box: fill-box; transform-origin: bottom; ${playing ? 'animation: eq .9s ease-in-out infinite alternate;' : 'transform: scaleY(.35);'} }
    .vinyl { transform-origin: 159px 85px; ${playing ? 'animation: spin 3.2s linear infinite;' : ''} }
    .progress { transform-box: fill-box; transform-origin: left center; transform: scaleX(${progress.toFixed(4)});
      ${playing ? `animation: progress ${remainingSec.toFixed(1)}s linear forwards;` : ''} }
    @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
    @keyframes eq { 0% { transform: scaleY(.25) } 50% { transform: scaleY(1) } 100% { transform: scaleY(.5) } }
    @keyframes spin { to { transform: rotate(360deg) } }
    @keyframes progress { from { transform: scaleX(${progress.toFixed(4)}) } to { transform: scaleX(1) } }
  </style>

  <g clip-path="url(#card)">
    <rect width="${W}" height="${H}" fill="#0d1117"/>
    ${art ? `<image href="${art}" x="-60" y="-200" width="${W + 120}" height="${W + 120}" filter="url(#blur)" opacity=".55" preserveAspectRatio="xMidYMid slice"/>` : `<rect width="${W}" height="${H}" fill="url(#fallback)" opacity=".18"/>`}
    <rect width="${W}" height="${H}" fill="url(#shade)"/>
  </g>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="18" fill="none" stroke="#30363d"/>

  <!-- vinyl peeking out from behind the cover -->
  <g class="vinyl" filter="url(#shadow)">
    <circle cx="159" cy="85" r="56" fill="#0a0a0a"/>
    ${grooves}
    <path d="M159 29 A56 56 0 0 1 215 85 L159 85 Z" fill="url(#sheen)"/>
    ${vinylLabel}
    <circle cx="159" cy="85" r="3" fill="#0d1117"/>
  </g>

  <g filter="url(#shadow)">${artBlock}</g>

  <!-- Spotify mark -->
  <g transform="translate(518 22)">
    <circle r="11" fill="${GREEN}"/>
    <path d="M-6 -3 Q0 -5.5 6.5 -1.5 M-5 1 Q0 -1 5 2 M-4 4.5 Q0 3 4 5.5" stroke="#000" stroke-width="1.7" fill="none" stroke-linecap="round"/>
  </g>

  ${bars}
  <text class="label fade" x="262" y="47">${LABELS[state]}</text>
  <text class="title fade d1" x="236" y="80">${esc(songTitle)}</text>
  <text class="artist fade d2" x="236" y="103">${esc(subtitle)}</text>
  ${albumLine ? `<text class="album fade d3" x="236" y="121">${esc(albumLine)}</text>` : ''}

  ${idle ? '' : `
  <rect x="236" y="136" width="250" height="4" rx="2" fill="#ffffff22"/>
  <rect class="progress" x="236" y="136" width="250" height="4" rx="2" fill="${playing ? GREEN : '#8b949e'}"/>
  <text class="time" x="496" y="141" text-anchor="start">${fmt(durationMs)}</text>`}
</svg>`;
}
