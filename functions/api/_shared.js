export const serviceIds = ['solar', 'cctv', 'industrial', 'residential', 'smart', 'motors', 'doors', 'pools'];
export const eventTypes = ['page_view', 'service_open', 'quote_open', 'whatsapp_open'];

export function json(data, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}

export async function readJson(request) {
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
    if (size > 65536) {
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
