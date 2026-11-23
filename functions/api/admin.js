import { getContent, json, readJson, serviceIds, today } from './_shared.js';

async function authorized(request, token) {
  const authorization = request.headers.get('authorization') || '';
  if (!authorization.startsWith('Bearer ') || authorization.length > 512) return false;
  const encoder = new TextEncoder();
  const [provided, expected] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(authorization.slice(7))),
    crypto.subtle.digest('SHA-256', encoder.encode(token)),
  ]);
  return crypto.subtle.timingSafeEqual(provided, expected);
}

function validatedContent(data) {
  if (!data || typeof data.whatsappNumber !== 'string' || !/^[1-9]\d{7,14}$/.test(data.whatsappNumber)) {
    throw new Error('Saisissez un numéro WhatsApp international valide.');
  }
  const services = {};
  for (const lang of ['fr', 'ar']) {
    services[lang] = {};
    for (const id of serviceIds) {
      const entry = data.services?.[lang]?.[id];
      if (!entry) continue;
      services[lang][id] = {};
      for (const [field, limit] of [['title', 100], ['summary', 300], ['description', 1500]]) {
        if (typeof entry[field] !== 'string' || !entry[field].trim() || entry[field].length > limit) {
          throw new Error('Vérifiez les champs du service ' + id + ' (' + lang + ').');
        }
        services[lang][id][field] = entry[field].trim();
      }
    }
  }
  return { whatsappNumber: data.whatsappNumber, services };
}

export async function onRequest({ request, env }) {
  if (!env.ADMIN_TOKEN || env.ADMIN_TOKEN.length < 32 || !env.DB) {
    return json({ error: 'Configuration Cloudflare requise : liaison DB et secret ADMIN_TOKEN.' }, 503);
  }
  if (!await authorized(request, env.ADMIN_TOKEN)) return json({ error: 'Accès refusé.' }, 401);

  if (request.method === 'GET') {
    const days = Number(new URL(request.url).searchParams.get('days') || 30);
    if (![7, 30, 90].includes(days)) return json({ error: 'Période invalide.' }, 400);
    const end = today();
    const date = new Date(end + 'T00:00:00Z');
    date.setUTCDate(date.getUTCDate() - days + 1);
    const start = date.toISOString().slice(0, 10);
    const [saved, stats] = await Promise.all([
      getContent(env.DB),
      env.DB.prepare('SELECT day, kind, language, service, total FROM daily_events WHERE day BETWEEN ? AND ? ORDER BY day')
        .bind(start, end).all(),
    ]);
    return json({ ...saved, stats: stats.results, start, end });
  }

  if (request.method === 'PUT') {
    if (request.headers.get('origin') !== new URL(request.url).origin) return json({}, 403);
    let content;
    let revision;
    try {
      const data = await readJson(request);
      content = validatedContent(data);
      revision = data.revision;
      if (!Number.isSafeInteger(revision) || revision < 0) throw new Error('Version du contenu invalide.');
    } catch (error) {
      return json({ error: error.message }, 400);
    }
    const payload = JSON.stringify(content);
    const result = revision === 0
      ? await env.DB.prepare('INSERT OR IGNORE INTO site_content (id, payload) VALUES (1, ?)').bind(payload).run()
      : await env.DB.prepare(`
        UPDATE site_content SET payload = ?, revision = revision + 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = 1 AND revision = ?
      `).bind(payload, revision).run();
    if (!result.meta.changes) return json({ error: 'Le contenu a changé. Reconnectez-vous pour obtenir la dernière version.' }, 409);
    return json(await getContent(env.DB));
  }

  return json({ error: 'Méthode indisponible.' }, 405);
}
