const allowedOrigins = new Set(['https://en-sf.ru', 'https://www.en-sf.ru', 'http://127.0.0.1:8765']);
const value = (input, max = 1800) => typeof input === 'string' ? input.trim().slice(0, max) : '';
const response = (body, status, origin) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': origin, vary: 'Origin' } });

export default {
  async fetch(request, env) {
    const origin = request.headers.get('origin') || '';
    if (new URL(request.url).pathname !== '/api/application') return new Response('Not found', { status: 404 });
    if (!allowedOrigins.has(origin)) return new Response('Forbidden', { status: 403 });
    if (request.method === 'OPTIONS') return new Response(null, { headers: { 'access-control-allow-origin': origin, 'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-headers': 'content-type', vary: 'Origin' } });
    if (request.method !== 'POST') return response({ ok: false }, 405, origin);
    let data, files = [];
    try {
      if ((request.headers.get('content-type') || '').startsWith('multipart/form-data')) {
        const form = await request.formData();
        data = Object.fromEntries([...form.entries()].filter(([, entry]) => !(entry instanceof File)));
        files = form.getAll('attachments').filter(file => file instanceof File && file.size > 0);
      } else data = await request.json();
    } catch { return response({ ok: false }, 400, origin); }
    if (files.length > 5 || files.some(file => file.size > 20 * 1024 * 1024)) return response({ ok: false, error: 'attachments' }, 413, origin);
    const name = value(data.name, 120), phone = value(data.phone, 80), email = value(data.email, 160), message = value(data.message), vacancy = value(data.vacancy, 220), kind = value(data.kind, 100) || 'Заявка с сайта';
    if (data.website || !data.consent || !name || !phone || (kind === 'Заявка с сайта' && !message)) return response({ ok: false }, 400, origin);
    const text = [`Новая заявка — ${kind}`, `Имя: ${name}`, `Телефон: ${phone}`, email && `Email: ${email}`, vacancy && `Вакансия: ${vacancy}`, message && `Сообщение: ${message}`].filter(Boolean).join('\n');
    const telegram = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text }) });
    if (!telegram.ok) return response({ ok: false }, 502, origin);
    for (const file of files) {
      const attachment = new FormData();
      attachment.append('chat_id', env.TELEGRAM_CHAT_ID);
      attachment.append('document', file, file.name || 'attachment');
      const uploaded = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendDocument`, { method: 'POST', body: attachment });
      if (!uploaded.ok) return response({ ok: false }, 502, origin);
    }
    return response({ ok: true }, 200, origin);
  },
};
