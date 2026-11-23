import { adminError, json, mediaId, readJson, sameOrigin, serviceIds } from './_shared.js';

const statuses = ['new', 'contacted', 'closed'];
const unavailable = () => json({ error: 'Module demandes indisponible. Vérifiez la migration D1.' }, 503);

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return json({}, 403);
  if (!env.DB) return unavailable();
  let data;
  try {
    data = await readJson(request);
  } catch {
    return json({}, 400);
  }
  const { key, service, language } = data ?? {};
  if (typeof key !== 'string' || !mediaId.test(key)
      || !serviceIds.includes(service) || !['fr', 'ar'].includes(language)) return json({}, 400);
  const values = [];
  for (const [field, max] of [['name', 100], ['phone', 25], ['city', 100], ['description', 1500]]) {
    const value = typeof data[field] === 'string' ? data[field].trim() : '';
    if (!value || value.length > max) return json({}, 400);
    values.push(value);
  }
  if (!/^[+0-9 ().-]{7,25}$/.test(values[1]) || values[1].replace(/\D/g, '').length < 7) return json({}, 400);
  try {
    await env.DB.prepare(`
      INSERT INTO quote_requests (submission_key, name, phone, city, service, description, language)
      VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT (submission_key) DO NOTHING
    `).bind(key, ...values.slice(0, 3), service, values[3], language).run();
    return json({ received: true }, 201);
  } catch {
    return unavailable();
  }
}

export async function onRequestGet({ request, env }) {
  const denial = await adminError(request, env);
  if (denial) return denial;
  const params = new URL(request.url).searchParams;
  const status = params.get('status') || 'all';
  const before = Number(params.get('before') || Number.MAX_SAFE_INTEGER);
  if ((status !== 'all' && !statuses.includes(status)) || !Number.isSafeInteger(before) || before <= 0) return json({}, 400);
  try {
    const { results } = await env.DB.prepare(`
      SELECT id, name, phone, city, service, description, language, status, created_at
      FROM quote_requests WHERE id < ? AND (? = 'all' OR status = ?) ORDER BY id DESC LIMIT 31
    `).bind(before, status, status).all();
    const quotes = results.slice(0, 30);
    return json({ quotes, next: results.length > 30 ? quotes.at(-1).id : null });
  } catch {
    return unavailable();
  }
}

export async function onRequestPatch({ request, env }) {
  const denial = await adminError(request, env);
  if (denial) return denial;
  if (!sameOrigin(request)) return json({}, 403);
  let data;
  try {
    data = await readJson(request);
  } catch {
    return json({}, 400);
  }
  if (!Number.isSafeInteger(data?.id) || data.id <= 0 || !statuses.includes(data.status)) return json({}, 400);
  try {
    const result = await env.DB.prepare('UPDATE quote_requests SET status = ? WHERE id = ?').bind(data.status, data.id).run();
    return result.meta.changes ? json({ updated: true }) : json({}, 404);
  } catch {
    return unavailable();
  }
}
