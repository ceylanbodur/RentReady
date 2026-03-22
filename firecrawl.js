export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  const { searchParams } = new URL(req.url);
  const path = searchParams.get('path');

  if (!path) {
    return new Response(JSON.stringify({ error: 'Missing path parameter' }), {
      status: 400,
      headers: corsHeaders('application/json'),
    });
  }

  const firecrawlUrl = `https://api.firecrawl.dev${path}`;

  const headers = {
    'Content-Type': 'application/json',
  };

  const auth = req.headers.get('Authorization');
  if (auth) headers['Authorization'] = auth;

  const init = { method: req.method, headers };
  if (req.method === 'POST') {
    init.body = await req.text();
  }

  try {
    const upstream = await fetch(firecrawlUrl, init);
    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: corsHeaders('application/json'),
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 502,
      headers: corsHeaders('application/json'),
    });
  }
}

function corsHeaders(contentType) {
  return {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}
