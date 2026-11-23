import { eventTypes, getContent, json, readJson, serviceIds, today } from './_shared.js';

export async function onRequestGet({ env }) {
  return json(env.DB ? (await getContent(env.DB)).content : {});
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return new Response(null, { status: 204 });
  if (request.headers.get('origin') !== new URL(request.url).origin) return json({}, 403);
  let event;
  try {
    event = await readJson(request);
  } catch {
    return json({}, 400);
  }
  const { kind, language, service = '' } = event ?? {};
  if (!eventTypes.includes(kind) || !['fr', 'ar'].includes(language)
      || (['service_open', 'quote_open'].includes(kind) ? !serviceIds.includes(service) : service !== '')) {
    return json({}, 400);
  }
  await env.DB.prepare(`
    INSERT INTO daily_events (day, kind, language, service, total) VALUES (?, ?, ?, ?, 1)
    ON CONFLICT (day, kind, language, service) DO UPDATE SET total = total + 1
  `).bind(today(), kind, language, service).run();
  return new Response(null, { status: 204 });
}
