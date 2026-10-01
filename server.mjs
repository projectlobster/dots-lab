import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';

const ROOT = resolve(process.cwd());
const portArg = process.argv.indexOf('--port');
const PORT = Number(process.env.PORT || (portArg > -1 ? process.argv[portArg + 1] : 0)) || 4173;
const HOST = process.env.HOST || '127.0.0.1';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

function resolveTarget(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  let target = resolve(ROOT, '.' + normalize(decoded));
  if (target !== ROOT && !target.startsWith(ROOT + sep)) return null;
  try {
    if (statSync(target).isDirectory()) target = join(target, 'index.html');
  } catch {
    return null;
  }
  return target;
}

createServer((req, res) => {
  const target = resolveTarget(req.url || '/');
  if (!target) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
    return;
  }
  const type = TYPES[extname(target).toLowerCase()] || 'application/octet-stream';
  res.writeHead(200, { 'content-type': type, 'cache-control': 'no-cache' });
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  createReadStream(target).on('error', () => res.destroy()).pipe(res);
}).listen(PORT, HOST, () => {
  console.log(`Dots Lab → http://${HOST}:${PORT}/`);
});
