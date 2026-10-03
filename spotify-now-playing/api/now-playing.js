import { getTrack, toDataUri } from '../lib/spotify.js';
import { renderCard } from '../lib/card.js';

// GET /api/now-playing        -> animated SVG card
// GET /api/now-playing?open   -> redirects to the song on Spotify (used as the README link)
export default async function handler(req, res) {
  let track;
  try {
    track = await getTrack();
  } catch (err) {
    console.error(err);
    track = { state: 'idle' };
  }

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');

  if ('open' in req.query) {
    return res.redirect(302, track.url ?? 'https://open.spotify.com');
  }

  const art = await toDataUri(track.imageUrl).catch(() => null);
  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  res.status(200).send(renderCard({ ...track, art }));
}
