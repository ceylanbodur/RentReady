export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const path = req.query.path;
  if (!path) {
    return res.status(400).json({ error: 'Missing path parameter' });
  }

  const firecrawlUrl = `https://api.firecrawl.dev${path}`;

  const headers = { 'Content-Type': 'application/json' };
  const auth = req.headers['authorization'];
  if (auth) headers['Authorization'] = auth;

  const init = { method: req.method, headers };
  if (req.method === 'POST') {
    init.body = JSON.stringify(req.body);
  }

  try {
    const upstream = await fetch(firecrawlUrl, init);
    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
}
