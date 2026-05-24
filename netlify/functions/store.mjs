export const config = { path: '/.netlify/functions/store' };

export default async function handler(req) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

  try {
    const ctx = process.env.NETLIFY_BLOBS_CONTEXT;
    if (!ctx) throw new Error('NETLIFY_BLOBS_CONTEXT not set');
    const { siteID, token, edgeURL } = JSON.parse(Buffer.from(ctx, 'base64').toString('utf8'));
    const blobUrl = `${edgeURL}/${siteID}/site:dashboard/state`;
    const authHeaders = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    if (req.method === 'GET') {
      const r = await fetch(blobUrl, { headers: authHeaders });
      if (r.status === 404) return new Response('{}', { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
      if (!r.ok) throw new Error(`Blob GET ${r.status}`);
      const data = await r.text();
      return new Response(data, { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      let body;
      try { body = await req.json(); } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
      }
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return new Response(JSON.stringify({ error: 'Body must be a JSON object' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
      }
      let existing = {};
      const gr = await fetch(blobUrl, { headers: authHeaders });
      if (gr.ok) try { existing = await gr.json(); } catch {}
      const merged = { ...existing, ...body };
      const pr = await fetch(blobUrl, { method: 'PUT', headers: authHeaders, body: JSON.stringify(merged) });
      if (!pr.ok) throw new Error(`Blob PUT ${pr.status}`);
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...cors, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
}
