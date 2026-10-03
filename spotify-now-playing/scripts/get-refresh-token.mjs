// One-time helper: logs you into Spotify and prints the refresh token
// the widget needs. Run with: npm run token
import http from 'node:http';

const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret } = process.env;
if (!id || !secret) {
  console.error('Put SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env first (see .env.example).');
  process.exit(1);
}

const REDIRECT_URI = 'http://127.0.0.1:8888/callback';
const authUrl =
  'https://accounts.spotify.com/authorize?' +
  new URLSearchParams({
    client_id: id,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: 'user-read-currently-playing user-read-recently-played',
  });

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI);
  if (url.pathname !== '/callback') return res.writeHead(404).end();

  const code = url.searchParams.get('code');
  if (!code) return res.end(`Spotify returned an error: ${url.searchParams.get('error')}`);

  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: REDIRECT_URI }),
  });
  const data = await tokenRes.json();

  if (!data.refresh_token) {
    console.error('Token exchange failed:', data);
    res.end('Token exchange failed, check your terminal.');
  } else {
    console.log(`\nAdd this to Vercel as an environment variable:\n\nSPOTIFY_REFRESH_TOKEN=${data.refresh_token}\n`);
    res.end('Done! Your refresh token is in the terminal. You can close this tab.');
  }
  server.close();
});

server.listen(8888, '127.0.0.1', () => {
  console.log(`Open this link in your browser and approve access:\n\n${authUrl}\n`);
});
