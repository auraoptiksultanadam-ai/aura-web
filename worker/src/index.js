const OWNER = 'auraoptiksultanadam-ai';
const REPO = 'aura-web';
const CONTENT_PATH = 'content/site.json';
const COOKIE = 'aura_admin_session';
const corsHeaders = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, ...headers } });
}
async function hmac(value, secret) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
}
async function sessionValid(request, env) {
  const raw = request.headers.get('Cookie') || '';
  const match = raw.split(';').map(v => v.trim()).find(v => v.startsWith(COOKIE + '='));
  if (!match) return false;
  const token = decodeURIComponent(match.slice(COOKIE.length + 1));
  const [expires, signature] = token.split('.');
  if (!expires || Number(expires) < Date.now()) return false;
  return signature === await hmac(expires, env.SESSION_SECRET);
}
function cookie(value, maxAge) {
  return `${COOKIE}=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`;
}
async function github(path, options, env) {
  const response = await fetch('https://api.github.com' + path, {
    ...options,
    headers: { Authorization: 'Bearer ' + env.GITHUB_TOKEN, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json', ...(options?.headers || {}) }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || 'GitHub API error ' + response.status);
  return body;
}
async function readContent(env) {
  try {
    const result = await github(`/repos/${OWNER}/${REPO}/contents/${CONTENT_PATH}?ref=main`, {}, env);
    return { content: JSON.parse(atob(result.content.replace(/\n/g, ''))), sha: result.sha };
  } catch (error) {
    if (String(error.message).includes('Not Found')) return { content: null, sha: null };
    throw error;
  }
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { headers: { 'Access-Control-Allow-Origin': url.origin, 'Access-Control-Allow-Credentials': 'true', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS' } });
    try {
      if (url.pathname === '/api/login' && request.method === 'POST') {
        const body = await request.json();
        if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET || body.password !== env.ADMIN_PASSWORD) return json({ error: 'Kata sandi tidak sesuai' }, 401);
        const expires = String(Date.now() + 8 * 60 * 60 * 1000);
        const token = expires + '.' + await hmac(expires, env.SESSION_SECRET);
        return json({ ok: true }, 200, { 'Set-Cookie': cookie(token, 28800) });
      }
      if (url.pathname === '/api/session' && request.method === 'GET') return await sessionValid(request, env) ? json({ ok: true }) : json({ error: 'Belum login' }, 401);
      if (url.pathname === '/api/logout' && request.method === 'POST') return json({ ok: true }, 200, { 'Set-Cookie': cookie('', 0) });
      if (!await sessionValid(request, env)) return json({ error: 'Sesi admin tidak valid. Silakan login kembali.' }, 401);
      if (url.pathname === '/api/content' && request.method === 'GET') {
        const result = await readContent(env);
        return json({ content: result.content, sha: result.sha });
      }
      if (url.pathname === '/api/content' && request.method === 'POST') {
        const body = await request.json();
        if (!body.content || typeof body.content !== 'object') return json({ error: 'Format konten tidak valid' }, 400);
        return json({ ok: true, content: body.content, note: 'Perubahan siap dipublikasikan. Gunakan tombol Publikasikan.' });
      }
      if (url.pathname === '/api/publish' && request.method === 'POST') {
        const body = await request.json();
        if (!body.content || typeof body.content !== 'object') return json({ error: 'Format konten tidak valid' }, 400);
        const existing = await readContent(env);
        const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(body.content, null, 2) + '\n')));
        const result = await github(`/repos/${OWNER}/${REPO}/contents/${CONTENT_PATH}`, {
          method: 'PUT',
          body: JSON.stringify({ message: 'Update Aura website content from Control Center', content: encoded, branch: 'main', ...(existing.sha ? { sha: existing.sha } : {}) })
        }, env);
        return json({ ok: true, commit: result.commit?.sha, message: 'Konten berhasil dikirim ke GitHub. Jika Cloudflare Pages terhubung ke branch main, deployment akan berjalan otomatis.' });
      }
      return json({ error: 'Endpoint tidak ditemukan' }, 404);
    } catch (error) {
      return json({ error: error.message || 'Terjadi kesalahan server' }, 500);
    }
  }
};