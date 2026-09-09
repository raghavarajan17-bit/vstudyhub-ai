export type AiErrorCode =
  | 'RATE_LIMITED'
  | 'QUOTA_EXHAUSTED'
  | 'TEMPORARY_ERROR'
  | 'INVALID_INPUT'
  | 'CLIENT_ERROR'
  | 'CONFIGURATION_ERROR'
  | 'AI_RESPONSE_INVALID'
  | 'UNKNOWN_ERROR';

export interface AiErrorDetail {
  code: AiErrorCode;
  message: string;
  retryable: boolean;
  retryAfterSeconds?: number;
  requestId?: string;
}
