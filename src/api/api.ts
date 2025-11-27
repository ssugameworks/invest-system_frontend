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

export interface InvestmentTrendPoint {
  label: string;
  value: number;
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

