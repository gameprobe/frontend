import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const contentTypes = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif',
  '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.ttf': 'font/ttf', '.txt': 'text/plain; charset=utf-8',
};

// Serve only the built public directory; application source and env stay outside it.
export function createStaticServer(root = fileURLToPath(new URL('../dist/', import.meta.url))) {
  const base = resolve(root);
  const inside = (path) => path.startsWith(base + sep);
  return createServer(async (req, res) => {
    const fail = (code) => { res.writeHead(code); res.end(); };
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.setHeader('Allow', 'GET, HEAD');
      return fail(405);
    }
    let pathname;
    try { pathname = decodeURIComponent(req.url.split('?')[0]); }
    catch { return fail(400); }
    if (!pathname.startsWith('/') || pathname.includes('\\') || pathname.includes('\0') ||
        pathname.split('/').some((part) => part.startsWith('.'))) return fail(404);
    let file = resolve(base, pathname === '/' ? 'index.html' : '.' + pathname);
    if (file !== base && !inside(file)) return fail(404);
    try {
      let info;
      try { info = await stat(file); }
      catch (error) { if (error.code !== 'ENOENT' && error.code !== 'ENOTDIR') throw error; }
      if (!info?.isFile()) {
        // SPA routes support direct navigation; missing assets and API requests stay 404.
        if (!req.headers.accept?.includes('text/html') ||
            /^\/(assets|img|images|api)(\/|$)/.test(pathname) || contentTypes[extname(pathname)]) return fail(404);
        file = resolve(base, 'index.html');
        info = await stat(file);
      }
      file = await realpath(file);
      if (!inside(file)) return fail(404);
      res.writeHead(200, {
        'Content-Type': contentTypes[extname(file)] || 'application/octet-stream',
        'Content-Length': info.size,
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      });
      if (req.method === 'HEAD') return res.end();
      const stream = createReadStream(file);
      stream.on('error', () => res.destroy());
      res.on('close', () => stream.destroy());
      stream.pipe(res);
    } catch { fail(500); }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = createStaticServer();
  server.listen(Number(process.env.PORT || 3000), '0.0.0.0', () => console.log('GameProbe static server ready'));
  for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => server.close());
}
