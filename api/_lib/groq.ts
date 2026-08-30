import type Groq from 'groq-sdk';
import { APIError } from 'groq-sdk/error.js';
import type { ChatCompletion } from 'groq-sdk/resources/chat/completions.js';

/**
 * Groq retired llama-3.1-8b-instant / llama-3.3-70b-versatile for free/dev tiers
 * (shutdown 2026-08-16). Prefer their recommended replacements.
 * Override primary with GROQ_MODEL.
 */
export const GROQ_MODEL_FALLBACKS = [
  'openai/gpt-oss-20b',
  'openai/gpt-oss-120b',
  'qwen/qwen3.6-27b',
] as const;

type NonStreamingChatParams = Omit<
  Parameters<Groq['chat']['completions']['create']>[0],
  'model' | 'stream'
> & {
  model?: string;
  stream?: false;
};

function modelChain(preferred?: string): string[] {
  const envModel = process.env.GROQ_MODEL?.trim();
  const ordered = [preferred, envModel, ...GROQ_MODEL_FALLBACKS].filter(
    (m): m is string => Boolean(m && m.trim())
  );
  return [...new Set(ordered)];
}

/** Retry only when the model itself is unavailable — never on auth or rate limits. */
export function isModelUnavailableError(error: unknown): boolean {
  if (error instanceof APIError) {
    if (error.status === 401 || error.status === 429) return false;
    if (error.status !== 400 && error.status !== 404) return false;
    const haystack = `${error.message} ${JSON.stringify(error.error ?? {})}`;
    return /model_not_found|does not exist|decommissioned/i.test(haystack);
  }

  const message = error instanceof Error ? error.message : String(error ?? '');
  // SDK often stringifies as: `404 {"error":{"code":"model_not_found",...}}`
  if (/\b401\b/.test(message) || /\b429\b/.test(message)) return false;
  if (!/\b400\b/.test(message) && !/\b404\b/.test(message)) return false;
  return /model_not_found|does not exist|decommissioned/i.test(message);
}

export async function createChatCompletionWithFallback(
  groq: Groq,
  params: NonStreamingChatParams
): Promise<ChatCompletion> {
  const { model: preferred, ...rest } = params;
  const models = modelChain(preferred);
  let lastError: unknown;

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    try {
      return (await groq.chat.completions.create({
        ...rest,
        model,
        stream: false,
      })) as ChatCompletion;
    } catch (error) {
      lastError = error;
      const canFallback = isModelUnavailableError(error) && i < models.length - 1;
      if (!canFallback) throw error;
    }
  }

  throw lastError;
}
