// Função serverless do Vercel: guarda e devolve o estado da escala num Redis (Upstash).
// Variáveis de ambiente (injetadas pela integração Upstash Redis do Vercel):
//   UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN  (ou KV_REST_API_URL e KV_REST_API_TOKEN)
// Opcional: EDIT_PASSWORD – se definida, só quem a souber consegue gravar alterações.
const crypto = require('crypto');
const URL_ = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const KEY = 'escala-turnos:estado';

async function redis(cmd) {
  const r = await fetch(URL_, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
  });
  if (!r.ok) throw new Error('Redis respondeu ' + r.status);
  return (await r.json()).result;
}
function same(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!URL_ || !TOKEN) return res.status(503).json({ erro: 'Armazenamento não configurado' });
  try {
    if (req.method === 'GET') {
      const v = await redis(['GET', KEY]);
      if (!v) return res.status(204).end();
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).send(v);
    }
    if (req.method === 'PUT') {
      const pw = process.env.EDIT_PASSWORD;
      if (pw && !same(req.headers['x-edit-password'] || '', pw)) return res.status(401).json({ erro: 'Palavra-passe inválida' });
      const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      if (!body || body.length > 900000 || !req.body || !req.body.cells) return res.status(400).json({ erro: 'Dados inválidos' });
      await redis(['SET', KEY, body]);
      return res.status(204).end();
    }
    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).end();
  } catch (e) {
    return res.status(502).json({ erro: 'Falha no armazenamento' });
  }
};
