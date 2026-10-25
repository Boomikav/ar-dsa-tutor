import { createServer } from 'node:http';
import { existsSync, createReadStream, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { handleAiApiRequest } from './apiRouter';
import { loadServerEnv } from './env';

// Load server-side .env for standalone production runtime
loadServerEnv();

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';
const DIST_DIR = join(process.cwd(), 'dist');

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = createServer(async (req, res) => {
  try {
    const rawUrl = req.url || '/';
    const parsedPath = rawUrl.split('?')[0];

    // General server health check endpoint (/api/health)
    if (parsedPath === '/api/health') {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({
        status: 'ok',
        service: 'AR-DSA Tutor Standalone Server',
        host: HOST,
        port: PORT,
        timestamp: new Date().toISOString()
      }));
      return;
    }

    // 1. API Route Delegation (/api/*)
    if (parsedPath.startsWith('/api/')) {
      const handled = await handleAiApiRequest(req, res);
      if (!handled) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'API Endpoint Not Found' }));
      }
      return;
    }

    // 2. Static File Serving from dist/ (Production Web App)
    if (existsSync(DIST_DIR)) {
      let filePath = join(DIST_DIR, parsedPath === '/' ? 'index.html' : parsedPath);

      // SPA Fallback: If static asset doesn't exist, serve index.html
      if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
        filePath = join(DIST_DIR, 'index.html');
      }

      if (existsSync(filePath)) {
        const ext = extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable'
        });

        const stream = createReadStream(filePath);
        stream.pipe(res);
        return;
      }
    }

    // Fallback if dist/ is not yet built
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('AR-DSA Tutor: dist/ not found. Please run "npm run build" first.');
  } catch (err: any) {
    console.error('[Standalone Server Error]:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal Server Error', message: err.message }));
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[AR-DSA Tutor Production Server] Running on http://${HOST}:${PORT}`);
  console.log(`[AR-DSA Tutor Production Server] Serving static files from: ${DIST_DIR}`);
  console.log(`[AR-DSA Tutor Production Server] Health check: http://${HOST}:${PORT}/api/health`);
  console.log(`[AR-DSA Tutor Production Server] AI Health check: http://${HOST}:${PORT}/api/ai/health`);
});
