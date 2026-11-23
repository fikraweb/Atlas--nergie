import { adminError, json, mediaId, sameOrigin } from './_shared.js';

const maxBytes = 600 * 1024;
const unavailable = () => json({ error: 'Module photos indisponible. Vérifiez la migration D1.' }, 503);

export async function onRequestPost({ request, env }) {
  const denial = await adminError(request, env);
  if (denial) return denial;
  if (!sameOrigin(request)) return json({}, 403);
  if (request.headers.get('content-type') !== 'image/webp' || !request.body) return json({ error: 'Image WebP attendue.' }, 400);
  const reader = request.body.getReader();
  const bytes = new Uint8Array(maxBytes);
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (size + value.length > maxBytes) {
      await reader.cancel();
      return json({ error: 'Photo trop volumineuse.' }, 413);
    }
    bytes.set(value, size);
    size += value.length;
  }
  const signature = new TextDecoder().decode(bytes.subarray(0, 16));
  if (size < 20 || signature.slice(0, 4) !== 'RIFF' || signature.slice(8, 12) !== 'WEBP'
      || !['VP8 ', 'VP8L', 'VP8X'].includes(signature.slice(12))) return json({ error: 'Photo WebP invalide.' }, 400);
  const id = crypto.randomUUID();
  try {
    await env.DB.prepare('INSERT INTO site_media (id, data) VALUES (?, ?)').bind(id, bytes.slice(0, size).buffer).run();
    return json({ id }, 201);
  } catch {
    return unavailable();
  }
}

export async function onRequestGet({ request, env }) {
  const id = new URL(request.url).searchParams.get('id') || '';
  if (!env.DB || !mediaId.test(id)) return json({}, 404);
  const row = await env.DB.prepare('SELECT data FROM site_media WHERE id = ?').bind(id).first();
  if (!row) return json({}, 404);
  return new Response(new Uint8Array(row.data), { headers: {
    'Content-Type': 'image/webp',
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
  } });
}
