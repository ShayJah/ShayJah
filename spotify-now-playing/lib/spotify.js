const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const PLAYER = 'https://api.spotify.com/v1/me/player';

async function getAccessToken() {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: SPOTIFY_REFRESH_TOKEN }),
  });
  if (!res.ok) throw new Error(`Spotify token refresh failed: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

function fromItem(item, extra) {
  const episode = item.type === 'episode';
  const images = episode ? item.images : item.album?.images;
  return {
    ...extra,
    title: item.name,
    artist: episode ? item.show?.name : item.artists?.map((a) => a.name).join(', '),
    album: episode ? item.show?.publisher : item.album?.name,
    imageUrl: images?.[1]?.url ?? images?.[0]?.url, // [1] is the 300px version
    url: item.external_urls?.spotify,
    durationMs: item.duration_ms,
  };
}

// Returns what's playing now, falling back to the last played track.
export async function getTrack() {
  const headers = { Authorization: `Bearer ${await getAccessToken()}` };

  const now = await fetch(`${PLAYER}/currently-playing?additional_types=track,episode`, { headers });
  if (now.status === 200) {
    const data = await now.json();
    if (data.item) {
      return fromItem(data.item, { state: data.is_playing ? 'playing' : 'paused', progressMs: data.progress_ms ?? 0 });
    }
  }

  const recent = await fetch(`${PLAYER}/recently-played?limit=1`, { headers });
  if (recent.ok) {
    const { items } = await recent.json();
    if (items?.length) return fromItem(items[0].track, { state: 'recent' });
  }

  return { state: 'idle' };
}

export async function toDataUri(url) {
  if (!url) return null;
  const res = await fetch(url);
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  return `data:${res.headers.get('content-type') ?? 'image/jpeg'};base64,${buf.toString('base64')}`;
}
