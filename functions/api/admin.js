import { adminError, getContent, json, mediaId, readJson, sameOrigin, serviceIds, today } from './_shared.js';

function validList(list, maxCount, maxLength) {
  return Array.isArray(list) && list.length > 0 && list.length <= maxCount
    && list.every(value => typeof value === 'string' && value.trim() && value.length <= maxLength);
}

const validMedia = value => typeof value === 'string' && mediaId.test(value);

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
      for (const field of ['benefits', 'solutions']) {
        if (entry[field] === undefined) continue;
        if (!validList(entry[field], 8, 180)) throw new Error('Vérifiez la liste : ' + field + '.');
        services[lang][id][field] = entry[field].map(value => value.trim());
      }
    }
  }
  const media = {};
  for (const id of serviceIds) {
    const entry = data.media?.[id];
    if (!entry) continue;
    if (entry.cover && !validMedia(entry.cover)) throw new Error('Photo de couverture invalide.');
    if (!Array.isArray(entry.gallery) || entry.gallery.length > 20
        || entry.gallery.some(photo => photo !== null && (
          !validMedia(photo.image) || !validList([photo.fr, photo.ar], 2, 120)
        ))) throw new Error('Galerie invalide.');
    media[id] = { cover: entry.cover || '', gallery: entry.gallery.map(photo =>
      photo && { image: photo.image, fr: photo.fr.trim(), ar: photo.ar.trim() }) };
  }
  return { whatsappNumber: data.whatsappNumber, services, media };
}

export async function onRequest({ request, env }) {
  const denial = await adminError(request, env);
  if (denial) return denial;

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
    if (!sameOrigin(request)) return json({}, 403);
    let content;
    let revision;
    try {
      const data = await readJson(request, 512 * 1024);
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
