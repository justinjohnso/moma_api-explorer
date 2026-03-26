import { useEffect, useMemo, useState } from 'react';
import type { Endpoint, HistoryReplayPayload, Parameter } from '../lib/types';
import { api } from '../lib/api';
import { addToHistory, clearPendingHistoryReplay, getPendingHistoryReplay } from '../lib/storage';
import ResponseViewer from './ResponseViewer';
import ParamInput from './ParamInput';
import { maskToken, maskTokenInUrl } from '../lib/token-utils';

interface PlaygroundResult {
  ok: boolean;
  status: number;
  statusText: string;
  duration: number;
  url: string;
  data?: unknown;
  error?: string;
  truncated?: boolean;
  attempts?: number;
}

interface ApiPlaygroundProps {
  endpoint: Endpoint;
}

function normalizeValue(parameter: Parameter, raw: string): string | number | undefined {
  if (raw === '') return undefined;
  if (parameter.type === 'integer') return Number(raw);
  if (parameter.type === 'boolean') {
    const low = raw.toLowerCase();
    if (low === 'true' || low === '1') return 1;
    if (low === 'false' || low === '0') return 0;
  }
  return raw;
}

function buildInitialParams(endpoint: Endpoint): Record<string, string> {
  const initial: Record<string, string> = {};
  endpoint.parameters.forEach((parameter) => {
    if (parameter.name === 'token') return;
    initial[parameter.name] = parameter.example !== undefined ? String(parameter.example) : '';
  });
  return initial;
}

function hydrateParamsFromReplay(endpoint: Endpoint, rawUrl: string): Record<string, string> {
  const next = buildInitialParams(endpoint);

  let parsed: URL;
  try {
    parsed = new URL(rawUrl, window.location.origin);
  } catch {
    return next;
  }

  const templateSegments = endpoint.pathTemplate.split('/').filter(Boolean);
  const pathSegments = parsed.pathname.split('/').filter(Boolean);
  templateSegments.forEach((segment, index) => {
    const match = segment.match(/^\{(.+)\}$/);
    if (!match) return;
    const value = pathSegments[index];
    if (!value) return;
    next[match[1]] = decodeURIComponent(value);
  });

  endpoint.parameters.forEach((parameter) => {
    if (parameter.location !== 'query' || parameter.name === 'token') return;
    const value = parsed.searchParams.get(parameter.name);
    if (value !== null) next[parameter.name] = value;
  });

  return next;
}

function sanitizeUrlForHistory(url: string): string {
  return maskTokenInUrl(url);
}

type ShapeState = {
  nodes: number;
  truncated: boolean;
};

const SHAPE_LIMITS = {
  maxDepth: 5,
  maxArrayItems: 20,
  maxObjectKeys: 40,
  maxStringLength: 800,
  maxNodes: 2500,
};

function shapeForDisplay(value: unknown, state: ShapeState, depth = 0): unknown {
  state.nodes += 1;
  if (state.nodes > SHAPE_LIMITS.maxNodes) {
    state.truncated = true;
    return '[Truncated: node limit reached]';
  }

  if (value === null || value === undefined) return value;
  if (typeof value === 'string') {
    if (value.length > SHAPE_LIMITS.maxStringLength) {
      state.truncated = true;
      return `${value.slice(0, SHAPE_LIMITS.maxStringLength)}… [truncated ${value.length - SHAPE_LIMITS.maxStringLength} chars]`;
    }
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return value;

  if (depth >= SHAPE_LIMITS.maxDepth) {
    state.truncated = true;
    if (Array.isArray(value)) return `[Truncated array depth=${depth}]`;
    return `[Truncated object depth=${depth}]`;
  }

  if (Array.isArray(value)) {
    const trimmed = value.slice(0, SHAPE_LIMITS.maxArrayItems).map((item) => shapeForDisplay(item, state, depth + 1));
    if (value.length > SHAPE_LIMITS.maxArrayItems) {
      state.truncated = true;
      trimmed.push(`… ${value.length - SHAPE_LIMITS.maxArrayItems} more item(s)`);
    }
    return trimmed;
  }

  if (typeof value === 'object') {
    const input = value as Record<string, unknown>;
    const entries = Object.entries(input);
    const out: Record<string, unknown> = {};
    for (const [index, [key, child]] of entries.entries()) {
      if (index >= SHAPE_LIMITS.maxObjectKeys) {
        state.truncated = true;
        out.__truncatedKeys = `… ${entries.length - SHAPE_LIMITS.maxObjectKeys} more key(s)`;
        break;
      }
      out[key] = shapeForDisplay(child, state, depth + 1);
    }
    return out;
  }

  return String(value);
}

export default function ApiPlayground({ endpoint }: ApiPlaygroundProps) {
  const [params, setParams] = useState<Record<string, string>>(() => buildInitialParams(endpoint));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlaygroundResult | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Sending request to MoMA API…');
  const [token, setTokenState] = useState<string | null>(() => api.getToken());

  const liveUrl = useMemo(() => {
    let path = endpoint.pathTemplate;
    const query = new URLSearchParams();
    for (const parameter of endpoint.parameters) {
      const value = parameter.name === 'token' ? token ?? '' : params[parameter.name] ?? '';
      if (!value) continue;
      if (parameter.location === 'path') {
        path = path.replace(`{${parameter.name}}`, value);
      } else {
        query.set(parameter.name, String(normalizeValue(parameter, value)));
      }
    }
    const suffix = query.toString();
    return `https://api.moma.org${path}${suffix ? `?${suffix}` : ''}`;
  }, [endpoint, params, token]);
  const displayUrl = useMemo(() => maskTokenInUrl(liveUrl), [liveUrl]);

  useEffect(() => {
    setParams(buildInitialParams(endpoint));
    setResult(null);
  }, [endpoint]);

  useEffect(() => {
    function syncTokenFromApi() {
      setTokenState(api.getToken());
    }

    function onTokenUpdated() {
      syncTokenFromApi();
    }

    syncTokenFromApi();
    window.addEventListener('moma-token-updated', onTokenUpdated);
    return () => {
      window.removeEventListener('moma-token-updated', onTokenUpdated);
    };
  }, []);

  useEffect(() => {
    function replay(detail: HistoryReplayPayload) {
      if (detail.endpointId !== endpoint.id) return;
      setParams(hydrateParamsFromReplay(endpoint, detail.safeUrl));
      setResult(null);
      clearPendingHistoryReplay();
      window.dispatchEvent(new CustomEvent('moma-toast', { detail: { message: 'Loaded request into tester' } }));
    }

    function onReplay(event: Event) {
      const customEvent = event as CustomEvent<HistoryReplayPayload>;
      if (!customEvent.detail) return;
      replay(customEvent.detail);
    }

    const pending = getPendingHistoryReplay();
    if (pending) replay(pending);

    window.addEventListener('moma-history-replay', onReplay);
    return () => window.removeEventListener('moma-history-replay', onReplay);
  }, [endpoint]);

  async function copyText(text: string, message: string) {
    await navigator.clipboard.writeText(text);
    window.dispatchEvent(new CustomEvent('moma-toast', { detail: { message } }));
  }

  function buildCurl() {
    return `curl "${liveUrl}"`;
  }

  function buildJsFetch() {
    return [
      `fetch("${liveUrl}")`,
      '  .then((response) => response.json())',
      '  .then((data) => {/* handle data */});',
    ].join('\n');
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      window.dispatchEvent(new CustomEvent('moma-toast', { detail: { message: 'Set your API token first.' } }));
      return;
    }

    for (const parameter of endpoint.parameters) {
      if (parameter.required && parameter.name !== 'token' && !params[parameter.name]) {
        window.dispatchEvent(
          new CustomEvent('moma-toast', { detail: { message: `Missing required parameter: ${parameter.name}` } }),
        );
        return;
      }
      if (parameter.type === 'integer' && params[parameter.name] && Number.isNaN(Number(params[parameter.name]))) {
        window.dispatchEvent(
          new CustomEvent('moma-toast', { detail: { message: `${parameter.name} must be a number` } }),
        );
        return;
      }
    }

    let path = endpoint.pathTemplate;
    const query: Record<string, string | number> = {};
    for (const parameter of endpoint.parameters) {
      if (parameter.name === 'token') continue;
      const raw = params[parameter.name] ?? '';
      const value = normalizeValue(parameter, raw);
      if (value === undefined) continue;
      if (parameter.location === 'path') {
        path = path.replace(`{${parameter.name}}`, String(value));
      } else {
        query[parameter.name] = value;
      }
    }

    setLoading(true);
    setLoadingMessage('Sending request to MoMA API…');
    setResult(null);
    const response = await api.request<unknown>(path, query);
    setLoading(false);
    const state: ShapeState = { nodes: 0, truncated: false };
    const shapedData = shapeForDisplay(response.data ?? null, state);
    let nextResult: PlaygroundResult = { ...response, data: shapedData, truncated: state.truncated, attempts: response.attempts };
    if (state.truncated) {
      window.dispatchEvent(
        new CustomEvent('moma-toast', {
          detail: { message: 'Large response bounded for performance (safe preview).' },
        }),
      );
    }
    setResult(nextResult);

    addToHistory({
      endpointId: endpoint.id,
      endpointTitle: endpoint.title,
      method: endpoint.method,
      status: nextResult.status,
      duration: nextResult.duration,
      safeUrl: sanitizeUrlForHistory(nextResult.url),
    });
    window.dispatchEvent(new Event('moma-history-updated'));
  }

  return (
    <section className="space-y-6">
      <div className="border border-black">
        <header className="bg-black text-white px-4 py-3 flex items-center justify-between">
          <h3 className="text-sm uppercase tracking-[0.08em] font-semibold">Try It</h3>
          <p className="text-xs text-white/80">Client-side request execution</p>
        </header>

        <div className="p-4 border-b border-[#E5E5E5] bg-[#F5F5F5]">
          <p className="text-xs text-[#666666] mb-1">Live URL</p>
          <code className="block text-xs md:text-sm font-mono break-all">{displayUrl}</code>
        </div>

        <form onSubmit={onSubmit} className="p-4 space-y-4">
          {endpoint.parameters.map((parameter) => {
            if (parameter.name === 'token') {
              return (
                <div key={parameter.name} className="grid md:grid-cols-[160px_1fr] gap-3 items-start">
                  <p className="text-sm">
                    token {parameter.required ? <span className="text-[#E4002B]">*</span> : null}
                  </p>
                  <div className="border border-[#E5E5E5] bg-[#F5F5F5] px-3 py-2 font-mono text-sm">
                    {token ? maskToken(token) : 'Not set'}
                  </div>
                </div>
              );
            }

            return (
              <ParamInput
                key={parameter.name}
                parameter={parameter}
                value={params[parameter.name] ?? ''}
                onChange={(next) => setParams((prev) => ({ ...prev, [parameter.name]: next }))}
              />
            );
          })}

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60"
            >
              {loading ? 'Sending…' : 'Try It'}
            </button>
            <button
              type="button"
              onClick={() => copyText(buildCurl(), 'Copied cURL command')}
              className="border border-black px-4 py-2 text-sm hover:bg-black hover:text-white transition-colors"
            >
              Copy cURL
            </button>
            <button
              type="button"
              onClick={() => copyText(buildJsFetch(), 'Copied JavaScript fetch')}
              className="border border-black px-4 py-2 text-sm hover:bg-black hover:text-white transition-colors"
            >
              Copy JS
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <div className="border border-[#E5E5E5]">
          <h4 className="px-4 py-2 border-b border-[#E5E5E5] text-xs uppercase tracking-[0.08em] font-semibold bg-[#F5F5F5]">
            Example Request
          </h4>
          <pre className="px-4 py-3 text-xs overflow-x-auto font-mono whitespace-pre-wrap break-all">
            {endpoint.exampleRequest}
          </pre>
        </div>
        <div className="border border-[#E5E5E5]">
          <h4 className="px-4 py-2 border-b border-[#E5E5E5] text-xs uppercase tracking-[0.08em] font-semibold bg-[#F5F5F5]">
            Example Response
          </h4>
          <pre className="p-4 text-xs overflow-auto font-mono max-h-[420px]">
            {JSON.stringify(endpoint.exampleResponse, null, 2)}
          </pre>
        </div>
      </div>

      {loading && (
        <div className="border border-[#E5E5E5] bg-[#F5F5F5] p-5" role="status" aria-live="polite" aria-label="Loading response">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">{loadingMessage}</p>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="h-2 bg-white border border-[#E5E5E5] animate-pulse" />
            <div className="h-2 bg-white border border-[#E5E5E5] animate-pulse" />
            <div className="h-2 bg-white border border-[#E5E5E5] animate-pulse" />
          </div>
        </div>
      )}
      {result && <ResponseViewer result={result} />}
    </section>
  );
}
