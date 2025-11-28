import type { Comment } from '@/types/bottomSheet';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.API_BASE_URL ?? '';

type RequestOptions = RequestInit & {
  skipBaseUrl?: boolean;
};

const TREND_COLLECTION_KEYS = ['data', 'points', 'trend', 'series', 'items', 'timeline', 'values'];
const TIME_KEYS = ['label', 'time', 'timestamp', 'bucket', 'name'];
const VALUE_KEYS = ['value', 'amount', 'totalAmount', 'total', 'price', 'y'];
const CAPITAL_VALUE_KEYS = [
  'capital',
  'availableCapital',
  'availableCash',
  'cash',
  'balance',
  'amount',
  'value',
  'total',
];
const CAPITAL_COLLECTION_KEYS = ['data', 'result', 'payload', 'summary', 'details', 'content'];
const COMMENT_COLLECTION_KEYS = ['comments', 'data', 'result', 'payload', 'items', 'content'];
const COMMENT_TOTAL_KEYS = ['totalCount', 'count', 'total', 'commentsCount'];

function joinUrl(base: string, path: string): string {
  if (!base) return path;
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  if (!path) return normalizedBase;
  return `${normalizedBase}${path.startsWith('/') ? path : `/${path}`}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function extractCandidateArray(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value.filter(isRecord);
  }

  if (isRecord(value)) {
    for (const key of TREND_COLLECTION_KEYS) {
      if (!(key in value)) continue;
      const nested = extractCandidateArray(value[key]);
      if (nested.length) {
        return nested;
      }
    }
  }

  return [];
}

function formatAxisLabel(rawLabel: string): string {
  if (/^\d{1,2}:\d{2}$/.test(rawLabel)) {
    return rawLabel;
  }

  const parsedDate = new Date(rawLabel);
  if (!Number.isNaN(parsedDate.getTime())) {
    return new Intl.DateTimeFormat('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(parsedDate);
  }

  return rawLabel;
}

const DEFAULT_TREND_ENDPOINT =
  process.env.NEXT_PUBLIC_TREND_ENDPOINT ?? '/api/investments/timeline';
const DEFAULT_CAPITAL_ENDPOINT = process.env.NEXT_PUBLIC_CAPITAL_ENDPOINT ?? '/api/capital';
const DEFAULT_RECENT_COMMENTS_ENDPOINT =
  process.env.NEXT_PUBLIC_RECENT_COMMENTS_ENDPOINT ?? '/api/comments/recent';

export interface InvestmentTrendPoint {
  label: string;
  value: number;
}

export interface RecentCommentsResult {
  comments: Comment[];
  totalCount: number;
}

export const FALLBACK_CAPITAL_AMOUNT = 50_000;
export const FALLBACK_TREND_POINTS: InvestmentTrendPoint[] = [
  { label: '19:00', value: 78 },
  { label: '19:30', value: 72 },
  { label: '20:00', value: 55 },
  { label: '20:30', value: 63 },
  { label: '21:00', value: 88 },
  { label: '21:30', value: 119 },
];
export const FALLBACK_RECENT_COMMENTS: Comment[] = [
  {
    id: 501,
    nickname: '상도동 콩콩이',
    studentId: 20241822,
    content: '요호 좋은데 좋은데',
    createdAt: '2024-05-20T10:35:00+09:00',
  },
  {
    id: 502,
    nickname: '흑석동 판다',
    studentId: 20241855,
    content: '이거 투자각 아닌가요?',
    createdAt: '2024-05-20T10:33:00+09:00',
  },
  {
    id: 503,
    nickname: '노량진 물개',
    studentId: 20241877,
    content: '팀원들 멋지다!',
    createdAt: '2024-05-20T10:30:00+09:00',
  },
];
export const FALLBACK_RECENT_COMMENTS_RESULT: RecentCommentsResult = {
  comments: FALLBACK_RECENT_COMMENTS,
  totalCount: FALLBACK_RECENT_COMMENTS.length,
};

export async function apiRequest<T>(
  endpoint: string,
  { skipBaseUrl, headers, cache, ...init }: RequestOptions = {},
): Promise<T> {
  const base = API_BASE_URL?.trim();
  const shouldUseBase = Boolean(base) && !skipBaseUrl && !endpoint.startsWith('http');
  const resolvedUrl = shouldUseBase ? joinUrl(base!, endpoint) : endpoint;

  const response = await fetch(resolvedUrl, {
    cache: cache ?? 'no-store',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(message || `API 요청 실패 (status: ${response.status})`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function normalizeTrendPoints(raw: unknown): InvestmentTrendPoint[] {
  const candidates = extractCandidateArray(raw);

  return candidates
    .map((candidate, index) => normalizeTrendPoint(candidate, index))
    .filter((point): point is InvestmentTrendPoint => Boolean(point));
}

function normalizeTrendPoint(
  candidate: Record<string, unknown>,
  index: number,
): InvestmentTrendPoint | null {
  const labelKey = TIME_KEYS.find(key => key in candidate);
  const valueKey = VALUE_KEYS.find(key => key in candidate);

  if (!valueKey) {
    return null;
  }

  const rawValue = candidate[valueKey];
  const numericValue = typeof rawValue === 'number' ? rawValue : Number(rawValue);

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  const rawLabel = labelKey ? candidate[labelKey] : undefined;
  const label =
    typeof rawLabel === 'string' || typeof rawLabel === 'number'
      ? formatAxisLabel(String(rawLabel))
      : `T${index + 1}`;

  return {
    label,
    value: numericValue,
  };
}

export async function fetchInvestmentTrendPoints(options?: {
  endpoint?: string;
  signal?: AbortSignal;
}): Promise<InvestmentTrendPoint[]> {
  const endpoint = options?.endpoint ?? DEFAULT_TREND_ENDPOINT;
  const raw = await apiRequest<unknown>(endpoint, { signal: options?.signal });
  return normalizeTrendPoints(raw);
}

export async function fetchCapitalAmount(options?: {
  endpoint?: string;
  signal?: AbortSignal;
}): Promise<number> {
  const endpoint = options?.endpoint ?? DEFAULT_CAPITAL_ENDPOINT;
  if (!endpoint) {
    return FALLBACK_CAPITAL_AMOUNT;
  }

  const raw = await apiRequest<unknown>(endpoint, { signal: options?.signal });
  const normalized = normalizeCapitalAmount(raw);

  if (normalized === null) {
    throw new Error('유효한 보유 현금 값을 확인할 수 없습니다.');
  }

  return normalized;
}

function normalizeCapitalAmount(raw: unknown): number | null {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return raw;
  }

  if (typeof raw === 'string') {
    const sanitized = raw.replace(/[^\d.-]/g, '').trim();
    if (!sanitized) {
      return null;
    }
    const numericValue = Number(sanitized);
    return Number.isFinite(numericValue) ? numericValue : null;
  }

  if (Array.isArray(raw)) {
    for (const item of raw) {
      const value = normalizeCapitalAmount(item);
      if (value !== null) {
        return value;
      }
    }
    return null;
  }

  if (isRecord(raw)) {
    for (const key of CAPITAL_VALUE_KEYS) {
      if (!(key in raw)) continue;
      const value = normalizeCapitalAmount(raw[key]);
      if (value !== null) {
        return value;
      }
    }

    for (const key of CAPITAL_COLLECTION_KEYS) {
      if (!(key in raw)) continue;
      const nestedValue = normalizeCapitalAmount(raw[key]);
      if (nestedValue !== null) {
        return nestedValue;
      }
    }
  }

  return null;
}

export async function fetchRecentComments(options?: {
  endpoint?: string;
  signal?: AbortSignal;
}): Promise<RecentCommentsResult> {
  const endpoint = options?.endpoint ?? DEFAULT_RECENT_COMMENTS_ENDPOINT;
  if (!endpoint) {
    return FALLBACK_RECENT_COMMENTS_RESULT;
  }

  try {
    const raw = await apiRequest<unknown>(endpoint, { signal: options?.signal });
    const normalized = normalizeRecentCommentsResult(raw);
    if (normalized.comments.length) {
      return normalized;
    }
  } catch (error) {
    console.error('[api] 실시간 댓글 로딩 실패', error);
  }

  return FALLBACK_RECENT_COMMENTS_RESULT;
}

function normalizeRecentCommentsResult(raw: unknown): RecentCommentsResult {
  const comments = extractCommentArray(raw)
    .map((candidate, index) => normalizeComment(candidate, index + 1))
    .filter((comment): comment is Comment => Boolean(comment));

  const totalCount = resolveCommentsTotal(raw, comments.length);

  return {
    comments,
    totalCount,
  };
}

function extractCommentArray(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) {
    return raw.filter(isRecord);
  }

  if (isRecord(raw)) {
    for (const key of COMMENT_COLLECTION_KEYS) {
      if (!(key in raw)) continue;
      const nested = extractCommentArray(raw[key]);
      if (nested.length) {
        return nested;
      }
    }
  }

  return [];
}

function resolveCommentsTotal(raw: unknown, fallback: number): number {
  if (isRecord(raw)) {
    for (const key of COMMENT_TOTAL_KEYS) {
      if (!(key in raw)) continue;
      const numericValue =
        typeof raw[key] === 'number' ? raw[key] : Number(raw[key]);
      if (Number.isFinite(numericValue)) {
        return Number(numericValue);
      }
    }
  }
  return fallback;
}

function normalizeComment(
  candidate: Record<string, unknown>,
  fallbackId: number,
): Comment | null {
  const idSource = candidate.id ?? candidate.commentId ?? fallbackId;
  const numericId = typeof idSource === 'number' ? idSource : Number(idSource);
  if (!Number.isFinite(numericId)) {
    return null;
  }

  const nickname =
    typeof candidate.nickname === 'string'
      ? candidate.nickname
      : typeof candidate.name === 'string'
        ? candidate.name
        : '';
  const content =
    typeof candidate.content === 'string'
      ? candidate.content
      : typeof candidate.message === 'string'
        ? candidate.message
        : '';

  if (!nickname || !content) {
    return null;
  }

  const rawStudentId =
    candidate.studentId ??
    candidate.studentID ??
    candidate.student ??
    candidate.userId ??
    candidate.uid ??
    fallbackId;
  const numericStudentId =
    typeof rawStudentId === 'number' ? rawStudentId : Number(rawStudentId);

  const createdAt = parseCommentCreatedAt(candidate);

  return {
    id: numericId,
    nickname,
    studentId: Number.isFinite(numericStudentId)
      ? Math.trunc(Number(numericStudentId))
      : 200000 + fallbackId,
    content,
    ...(createdAt ? { createdAt } : {}),
  };
}

function parseCommentCreatedAt(
  candidate: Record<string, unknown>,
): string | Date | undefined {
  const rawValue =
    candidate.createdAt ??
    candidate.created_at ??
    candidate.timestamp ??
    candidate.time;

  if (rawValue instanceof Date) {
    return rawValue;
  }

  if (typeof rawValue === 'string') {
    return rawValue;
  }

  if (typeof rawValue === 'number' && Number.isFinite(rawValue)) {
    const millis = rawValue < 1e12 ? rawValue * 1000 : rawValue;
    return new Date(millis).toISOString();
  }

  return undefined;
}

