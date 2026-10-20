// Servidor sem dependências: serve a página e guarda o estado da escala em storage/state.json.
// Uso: node server.js   (PORT=8080 node server.js para mudar a porta)
const http = require('http'), fs = require('fs'), path = require('path');
const PORT = process.env.PORT || 3000;
const STORE = path.join(__dirname, 'storage', 'state.json');
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/state') {
    if (req.method === 'GET') {
      return fs.readFile(STORE, (err, data) => {
        if (err) { res.writeHead(204); return res.end(); }
        res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(data);
      });
    }
    if (req.method === 'PUT') {
      let body = '';
      req.on('data', c => { body += c; if (body.length > 5e6) req.destroy(); });
      return req.on('end', () => {
        try { JSON.parse(body); } catch { res.writeHead(400); return res.end(); }
        fs.mkdirSync(path.dirname(STORE), { recursive: true });
        fs.writeFile(STORE + '.tmp', body, () => fs.rename(STORE + '.tmp', STORE, () => { res.writeHead(204); res.end(); }));
      });
    }
    res.writeHead(405); return res.end();
  }
  const rel = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  if (rel !== 'index.html' && !/^(css|js)\/[\w.-]+$/.test(rel)) { res.writeHead(404); return res.end('Não encontrado'); }
  fs.readFile(path.join(__dirname, rel), (err, data) => {
    if (err) { res.writeHead(404); return res.end('Não encontrado'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(rel)] || 'text/plain' }); res.end(data);
  });
}).listen(PORT, () => console.log('Escala de Turnos em http://localhost:' + PORT));
