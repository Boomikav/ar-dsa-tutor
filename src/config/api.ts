/**
 * Production and Development API Configuration.
 * 
 * Invariants:
 * - Zero API keys or secrets in client code.
 * - In production, never relies on localhost:3001 or USB debugging port forwarding.
 * - Defaults to relative '/api' on web/PWA or configured HTTPS backend.
 * - If backend is unreachable, client falls back smoothly to deterministic AI responses.
 */

const getApiBaseUrl = (): string => {
  // If an explicit environment base URL is provided, use it
  if (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env as any).VITE_API_BASE_URL) {
    return String((import.meta.env as any).VITE_API_BASE_URL).replace(/\/+$/, '');
  }

  // In production browser/hybrid context, default to relative endpoint without localhost
  return '';
};

export const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  aiTutor: `${API_BASE_URL}/api/ai/tutor`,
  health: `${API_BASE_URL}/api/health`
};
