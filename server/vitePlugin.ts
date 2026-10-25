import type { Plugin } from 'vite';
import { handleAiApiRequest } from './apiRouter';
import { loadServerEnv } from './env';

/**
 * Vite plugin that mounts the secure server-side AI API directly into the Vite development server.
 * Ensures the frontend can call /api/ai/tutor seamlessly during local development
 * without exposing API keys or requiring a separate process.
 */
export function aiBackendVitePlugin(): Plugin {
  // Load server-side .env for development runtime
  loadServerEnv();

  return {
    name: 'ai-backend-vite-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/ai/')) {
          try {
            const handled = await handleAiApiRequest(req, res);
            if (handled) return;
          } catch (err) {
            console.error('[Vite AI Middleware Error]:', err);
          }
        }
        next();
      });
    }
  };
}
