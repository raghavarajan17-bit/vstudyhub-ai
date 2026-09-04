import type { AiErrorCode, AiErrorDetail } from '../types/aiError.types';

/**
 * Standard safe user-facing error messages.
 * Never exposes model names, URLs, stack traces, quota metric names, or API keys.
 */
export const SAFE_USER_MESSAGES: Record<AiErrorCode, string> = {
  RATE_LIMITED:
    'AI analysis is temporarily unavailable because the AI service is busy or has reached its current limit. Please try again shortly.',
  QUOTA_EXHAUSTED:
    'AI analysis is temporarily unavailable because the AI service is busy or has reached its current limit. Please try again shortly.',
  TEMPORARY_ERROR:
    'AI analysis is temporarily unavailable. Your information is safe. Please try again shortly.',
  INVALID_INPUT:
    'Please check your inputs and try again.',
  CLIENT_ERROR:
    'Please check your inputs and try again.',
  CONFIGURATION_ERROR:
    'AI analysis is temporarily unavailable. Please try again later.',
  AI_RESPONSE_INVALID:
    "We couldn't complete the analysis this time. Your information has been preserved. Please try again.",
  UNKNOWN_ERROR:
    "We couldn't complete the analysis this time. Your information has been preserved.",
};

/**
 * Checks if the error message or object specifically points to a daily or project-level quota exhaustion.
 */
export function isDailyQuotaExhausted(err: unknown): boolean {
  if (!err) return false;
  const raw = typeof err === 'string' ? err : JSON.stringify(err);
  const lower = raw.toLowerCase();

  return (
    lower.includes('generaterequestsperday') ||
    lower.includes('requestsperday') ||
    lower.includes('per_day') ||
    lower.includes('per day') ||
    lower.includes('daily limit') ||
    lower.includes('daily quota') ||
    lower.includes('quota exceeded for metric') && (lower.includes('day') || lower.includes('project'))
  );
}

/**
 * Extracts retry delay in seconds from error object or headers, clamped between 1s and 30s.
 */
export function extractRetryAfterSeconds(err: any): number | undefined {
  if (!err) return undefined;

  // 1. Check HTTP response header (Retry-After)
  const headerVal =
    err?.response?.headers?.get?.('retry-after') ||
    err?.response?.headers?.['retry-after'] ||
    err?.headers?.['retry-after'];
  if (headerVal) {
    const parsed = parseFloat(headerVal);
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.min(Math.max(Math.round(parsed), 1), 30);
    }
  }

  // 2. Check Google RPC RetryInfo in error details / statusDetails
  const details = err?.statusDetails || err?.error?.details || err?.details;
  if (Array.isArray(details)) {
    for (const item of details) {
      if (item?.retryDelay) {
        if (typeof item.retryDelay === 'string') {
          const match = item.retryDelay.match(/^(\d+(?:\.\d+)?)s?$/i);
          if (match) {
            const sec = parseFloat(match[1]);
            if (Number.isFinite(sec) && sec > 0) {
              return Math.min(Math.max(Math.round(sec), 1), 30);
            }
          }
        } else if (typeof item.retryDelay?.seconds === 'number') {
          const sec = item.retryDelay.seconds;
          if (sec > 0) return Math.min(Math.max(Math.round(sec), 1), 30);
        }
      }
    }
  }

  // 3. Check error message regex (e.g. "retry after 4 seconds" or "retry in 3.5s")
  const rawMsg = typeof err === 'string' ? err : String(err?.message || err?.error?.message || '');
  const match = rawMsg.match(/retry\s+(?:in|after)\s+(\d+(?:\.\d+)?)\s*(s|sec|seconds|ms)?/i);
  if (match) {
    let val = parseFloat(match[1]);
    if (match[2]?.toLowerCase() === 'ms') {
      val = val / 1000;
    }
    if (Number.isFinite(val) && val > 0) {
      return Math.min(Math.max(Math.round(val), 1), 30);
    }
  }

  return undefined;
}

export interface ClassifiedAiError {
  code: AiErrorCode;
  httpStatus: number;
  retryable: boolean;
  retryAfterSeconds?: number;
  userMessage: string;
  isDailyQuota: boolean;
  detail: AiErrorDetail;
}

/**
 * Classifies an incoming Gemini SDK error, HTTP error, or network failure into canonical categories.
 */
export function classifyGeminiError(err: any, requestId?: string): ClassifiedAiError {
  const reqId = requestId || (err?.requestId as string) || undefined;

  // Extract status code if available
  const status =
    Number(err?.status) ||
    Number(err?.statusCode) ||
    Number(err?.response?.status) ||
    Number(err?.error?.code);

  const rawMsg = typeof err === 'string' ? err : String(err?.message || err?.error?.message || '');
  const lowerMsg = rawMsg.toLowerCase();

  // Check 1: Daily Quota Exhaustion -> QUOTA_EXHAUSTED
  if (isDailyQuotaExhausted(err) || (lowerMsg.includes('quota') && lowerMsg.includes('day'))) {
    const detail: AiErrorDetail = {
      code: 'QUOTA_EXHAUSTED',
      message: SAFE_USER_MESSAGES.QUOTA_EXHAUSTED,
      retryable: false,
      requestId: reqId,
    };
    return {
      code: 'QUOTA_EXHAUSTED',
      httpStatus: 429,
      retryable: false,
      userMessage: SAFE_USER_MESSAGES.QUOTA_EXHAUSTED,
      isDailyQuota: true,
      detail,
    };
  }

  // Check 2: 429 / Rate Limit / Resource Exhausted -> RATE_LIMITED
  const isRateLimit =
    status === 429 ||
    lowerMsg.includes('429') ||
    lowerMsg.includes('resource_exhausted') ||
    lowerMsg.includes('rate limit') ||
    lowerMsg.includes('quota exceeded') ||
    lowerMsg.includes('too many requests');

  if (isRateLimit) {
    const retryAfter = extractRetryAfterSeconds(err) || 5;
    const detail: AiErrorDetail = {
      code: 'RATE_LIMITED',
      message: SAFE_USER_MESSAGES.RATE_LIMITED,
      retryable: true,
      retryAfterSeconds: retryAfter,
      requestId: reqId,
    };
    return {
      code: 'RATE_LIMITED',
      httpStatus: 429,
      retryable: true,
      retryAfterSeconds: retryAfter,
      userMessage: SAFE_USER_MESSAGES.RATE_LIMITED,
      isDailyQuota: false,
      detail,
    };
  }

  // Check 3: Authentication / Configuration -> CONFIGURATION_ERROR
  const isConfigError =
    status === 401 ||
    status === 403 ||
    lowerMsg.includes('api_key') ||
    lowerMsg.includes('api key') ||
    lowerMsg.includes('unauthorized') ||
    lowerMsg.includes('forbidden') ||
    lowerMsg.includes('permission_denied');

  if (isConfigError) {
    const detail: AiErrorDetail = {
      code: 'CONFIGURATION_ERROR',
      message: SAFE_USER_MESSAGES.CONFIGURATION_ERROR,
      retryable: false,
      requestId: reqId,
    };
    return {
      code: 'CONFIGURATION_ERROR',
      httpStatus: status === 401 || status === 403 ? status : 500,
      retryable: false,
      userMessage: SAFE_USER_MESSAGES.CONFIGURATION_ERROR,
      isDailyQuota: false,
      detail,
    };
  }

  // Check 4: Client validation / bad input -> CLIENT_ERROR
  const isClientError =
    status === 400 ||
    lowerMsg.includes('invalid_argument') ||
    lowerMsg.includes('bad request') ||
    lowerMsg.includes('is required') ||
    lowerMsg.includes('exceeds maximum length') ||
    lowerMsg.includes('malformed');

  if (isClientError) {
    // If the error has a clean validation message that does not leak secrets, allow it, else default
    const safeClientMsg =
      rawMsg && !rawMsg.includes('{') && !rawMsg.includes('AIza') && rawMsg.length < 150
        ? rawMsg
        : SAFE_USER_MESSAGES.CLIENT_ERROR;

    const detail: AiErrorDetail = {
      code: 'CLIENT_ERROR',
      message: safeClientMsg,
      retryable: false,
      requestId: reqId,
    };
    return {
      code: 'CLIENT_ERROR',
      httpStatus: 400,
      retryable: false,
      userMessage: safeClientMsg,
      isDailyQuota: false,
      detail,
    };
  }

  // Check 5: Temporary server / network / timeout errors -> TEMPORARY_ERROR
  const isTemporary =
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    lowerMsg.includes('econnreset') ||
    lowerMsg.includes('etimedout') ||
    lowerMsg.includes('fetch failed') ||
    lowerMsg.includes('network') ||
    lowerMsg.includes('abort') ||
    lowerMsg.includes('timeout') ||
    lowerMsg.includes('unavailable') ||
    lowerMsg.includes('overloaded');

  if (isTemporary) {
    const detail: AiErrorDetail = {
      code: 'TEMPORARY_ERROR',
      message: SAFE_USER_MESSAGES.TEMPORARY_ERROR,
      retryable: true,
      retryAfterSeconds: 3,
      requestId: reqId,
    };
    return {
      code: 'TEMPORARY_ERROR',
      httpStatus: status && status >= 500 && status <= 504 ? status : 503,
      retryable: true,
      retryAfterSeconds: 3,
      userMessage: SAFE_USER_MESSAGES.TEMPORARY_ERROR,
      isDailyQuota: false,
      detail,
    };
  }

  // Check 6: Unknown error -> UNKNOWN_ERROR
  const detail: AiErrorDetail = {
    code: 'UNKNOWN_ERROR',
    message: SAFE_USER_MESSAGES.UNKNOWN_ERROR,
    retryable: false,
    requestId: reqId,
  };
  return {
    code: 'UNKNOWN_ERROR',
    httpStatus: 500,
    retryable: false,
    userMessage: SAFE_USER_MESSAGES.UNKNOWN_ERROR,
    isDailyQuota: false,
    detail,
  };
}

/**
 * Strips secret tokens, API keys, Bearer headers, and URL query params from strings before logging.
 */
export function sanitizeLogString(str: string): string {
  if (!str) return '';
  return str
    .replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_API_KEY]')
    .replace(/Bearer\s+[A-Za-z0-9-_.]+/gi, 'Bearer [REDACTED_TOKEN]')
    .replace(/key=[^&\s]+/gi, 'key=[REDACTED]');
}

/**
 * Formats a clean, structured diagnostic log message without exposing candidate answers or secrets.
 * Example: [AI-Interview] RATE_LIMITED attempt=1 retryAfter=5s requestId=req_123 status=429 duration=450ms
 */
export function formatAiLog(
  endpoint: string,
  classification: AiErrorCode,
  meta: {
    status?: number;
    attempt?: number;
    retryAfter?: number;
    requestId?: string;
    durationMs?: number;
    reason?: string;
  }
): string {
  const parts: string[] = [
    `[${endpoint}]`,
    classification,
  ];

  if (meta.status !== undefined) parts.push(`status=${meta.status}`);
  if (meta.attempt !== undefined) parts.push(`attempt=${meta.attempt}`);
  if (meta.retryAfter !== undefined) parts.push(`retryAfter=${meta.retryAfter}s`);
  if (meta.requestId) parts.push(`requestId=${meta.requestId}`);
  if (meta.durationMs !== undefined) parts.push(`duration=${meta.durationMs}ms`);
  if (meta.reason) parts.push(`reason="${sanitizeLogString(meta.reason).slice(0, 80)}"`);

  return parts.join(' ');
}
