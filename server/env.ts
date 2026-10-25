import fs from 'node:fs';
import path from 'node:path';

let envLoaded = false;

/**
 * Robust server-side environment loader.
 * Loads .env from the project root into process.env without introducing extra external dependencies.
 * Never exposes variables to client or browser bundles.
 */
export function loadServerEnv(): void {
  if (envLoaded) return;
  envLoaded = true;

  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    return;
  }

  // Attempt Node 20+ built-in process.loadEnvFile
  if (typeof (process as any).loadEnvFile === 'function') {
    try {
      (process as any).loadEnvFile(envPath);
      return;
    } catch {
      // Fall through to manual parser if syntax error or older engine
    }
  }

  // Manual fallback parser for .env lines
  try {
    const raw = fs.readFileSync(envPath, 'utf-8');
    const lines = raw.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (process.env[key] === undefined) {
          process.env[key] = val;
        }
      }
    }
  } catch (err: any) {
    console.warn('[ServerEnv] Failed to read .env file:', err.message);
  }
}

/**
 * Returns the configured Gemini model or the current stable default 'gemini-3.8-flash'.
 */
export function getGeminiModel(): string {
  loadServerEnv();
  return process.env.GEMINI_MODEL || process.env.AI_MODEL || 'gemini-3.8-flash';
}

/**
 * Returns the Gemini API key from process.env if configured.
 */
export function getGeminiApiKey(): string | undefined {
  loadServerEnv();
  const key = process.env.GEMINI_API_KEY;
  return (key && key.trim().length > 0) ? key.trim() : undefined;
}
