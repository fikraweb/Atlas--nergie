export const serviceIds = ['solar', 'cctv', 'industrial', 'residential', 'smart', 'motors', 'doors', 'pools'];
export const eventTypes = ['page_view', 'service_open', 'quote_open', 'whatsapp_open'];

export function json(data, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}

export async function readJson(request, maxSize = 65536) {
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new Error('JSON required');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Missing body');
  let size = 0;
  let text = '';
  const decoder = new TextDecoder();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxSize) {
      await reader.cancel();
      throw new Error('Payload too large');
    }
    text += decoder.decode(value, { stream: true });
  }
  return JSON.parse(text + decoder.decode());
}

export async function getContent(db) {
  const row = await db.prepare('SELECT payload, revision, updated_at FROM site_content WHERE id = 1').first();
  return { content: row ? JSON.parse(row.payload) : {}, revision: row?.revision ?? 0, updatedAt: row?.updated_at ?? null };
}

export function today() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Africa/Casablanca' }).format(new Date());
}

export async function authorized(request, token) {
  const authorization = request.headers.get('authorization') || '';
  if (!authorization.startsWith('Bearer ') || authorization.length > 512) return false;
  const encoder = new TextEncoder();
  const [provided, expected] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(authorization.slice(7))),
    crypto.subtle.digest('SHA-256', encoder.encode(token)),
  ]);
  return crypto.subtle.timingSafeEqual(provided, expected);
}

export async function adminError(request, env) {
  if (!env.ADMIN_TOKEN || env.ADMIN_TOKEN.length < 32 || !env.DB) {
    return json({ error: 'Configuration Cloudflare requise : liaison DB et secret ADMIN_TOKEN.' }, 503);
  }
  if (!await authorized(request, env.ADMIN_TOKEN)) return json({ error: 'Accès refusé.' }, 401);
}

export function sameOrigin(request) {
  return request.headers.get('origin') === new URL(request.url).origin;
}

export const mediaId = /^[a-f0-9-]{36}$/;
