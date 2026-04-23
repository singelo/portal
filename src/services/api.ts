import type { ApiResult, Cliente, DashboardSummary, SessionPayload } from '../types/api';

const API_URL = 'https://red-bush-f22b.mauriciosingelo.workers.dev';
const DEBUG_STORAGE_KEY = 'rm_debug_api';
const METRICS_STORAGE_KEY = 'rm_api_metrics';
const MAX_METRICS = 100;

type ActionMap = {
  'auth.login': SessionPayload;
  'auth.me': SessionPayload;
  'auth.logout': { success?: boolean };
  'dashboard.summary': DashboardSummary;
  'clientes.list': Cliente[];
};

type ApiMetric<TAction extends keyof ActionMap = keyof ActionMap> = {
  id: string;
  action: TAction;
  startedAt: string;
  durationMs: number;
  networkMs: number;
  parseMs: number;
  ok: boolean;
  status: number;
  responseSize: number;
  hasToken: boolean;
  payloadKeys: string[];
  errorMessage?: string;
};

declare global {
  interface Window {
    __RM_API_METRICS__?: ApiMetric[];
  }
}

export async function apiRequest<TAction extends keyof ActionMap>(
  action: TAction,
  payload: Record<string, unknown> = {},
): Promise<ApiResult<ActionMap[TAction]>> {
  const token = localStorage.getItem('rm_token') || '';
  const requestId = createMetricId(action);
  const startedAtIso = new Date().toISOString();
  const startedAt = performance.now();
  const hasToken = Boolean(token);
  const payloadKeys = Object.keys(payload);
  const debugEnabled = isApiDebugEnabled();

  let response: Response | null = null;
  let text = '';

  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action,
        token,
        ...payload,
      }),
    });

    const afterNetwork = performance.now();
    text = await response.text();
    const afterText = performance.now();

    try {
      const parsed = JSON.parse(text) as ApiResult<ActionMap[TAction]>;
      const finishedAt = performance.now();

      registerMetric({
        id: requestId,
        action,
        startedAt: startedAtIso,
        durationMs: finishedAt - startedAt,
        networkMs: afterNetwork - startedAt,
        parseMs: finishedAt - afterText,
        ok: parsed.ok,
        status: response.status,
        responseSize: text.length,
        hasToken,
        payloadKeys,
        errorMessage: parsed.ok ? undefined : parsed.error?.message,
      });

      if (debugEnabled) {
        logMetric(window.__RM_API_METRICS__?.[0]);
      }

      return parsed;
    } catch (error) {
      const finishedAt = performance.now();
      const metric: ApiMetric<TAction> = {
        id: requestId,
        action,
        startedAt: startedAtIso,
        durationMs: finishedAt - startedAt,
        networkMs: afterNetwork - startedAt,
        parseMs: finishedAt - afterText,
        ok: false,
        status: response.status,
        responseSize: text.length,
        hasToken,
        payloadKeys,
        errorMessage: 'Resposta nao JSON',
      };

      registerMetric(metric);

      if (debugEnabled) {
        logMetric(metric);
        console.error('Resposta nao JSON da API:', text);
      }

      throw new Error(`A API respondeu um formato invalido em ${action}.`);
    }
  } catch (error) {
    const finishedAt = performance.now();
    const metric: ApiMetric<TAction> = {
      id: requestId,
      action,
      startedAt: startedAtIso,
      durationMs: finishedAt - startedAt,
      networkMs: response ? finishedAt - startedAt : 0,
      parseMs: 0,
      ok: false,
      status: response?.status ?? 0,
      responseSize: text.length,
      hasToken,
      payloadKeys,
      errorMessage: String(error instanceof Error ? error.message : error),
    };

    registerMetric(metric);

    if (debugEnabled) {
      logMetric(metric);
    }

    throw error;
  }
}

function createMetricId(action: string) {
  return `${action}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isApiDebugEnabled() {
  if (typeof window === 'undefined') return false;

  const fromStorage = window.localStorage.getItem(DEBUG_STORAGE_KEY) === '1';
  const fromQuery = new URLSearchParams(window.location.search).get('debugApi') === '1';

  return fromStorage || fromQuery;
}

function registerMetric(metric: ApiMetric) {
  if (typeof window === 'undefined') return;

  const nextMetrics = [metric, ...(window.__RM_API_METRICS__ ?? [])].slice(0, MAX_METRICS);
  window.__RM_API_METRICS__ = nextMetrics;

  try {
    window.localStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(nextMetrics));
  } catch {
    // Ignore storage quota issues for diagnostics.
  }
}

function logMetric(metric: ApiMetric | undefined) {
  if (!metric) return;

  const summary = [
    `[RM API] ${metric.action}`,
    `${Math.round(metric.durationMs)}ms total`,
    `${Math.round(metric.networkMs)}ms rede`,
    `${Math.round(metric.parseMs)}ms parse`,
    `status ${metric.status}`,
    metric.ok ? 'ok' : `erro: ${metric.errorMessage || 'desconhecido'}`,
  ].join(' | ');

  if (metric.ok) {
    console.info(summary, metric);
  } else {
    console.warn(summary, metric);
  }
}
