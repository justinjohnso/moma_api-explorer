import { useState } from 'react';
import type { MoMAObject } from '../lib/types';
import ArtworkCard from './ArtworkCard';
import { getArtworkImageFallbackChain } from '../lib/image-utils';

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

interface ResponseViewerProps {
  result: PlaygroundResult;
}

function statusClass(status: number): string {
  if (status >= 200 && status < 300) return 'border-[#00875A] text-[#00875A] bg-[#E6F7EE]';
  if (status >= 400 && status < 500) return 'border-[#A97300] text-[#A97300] bg-[#FFF8E1]';
  if (status >= 500) return 'border-[#E4002B] text-[#E4002B] bg-[#FFF1F4]';
  return 'border-[#E5E5E5] text-[#666666] bg-[#F5F5F5]';
}

export default function ResponseViewer({ result }: ResponseViewerProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  async function copyResponse() {
    await navigator.clipboard.writeText(JSON.stringify(result.data ?? { error: result.error }, null, 2));
    window.dispatchEvent(new CustomEvent('moma-toast', { detail: { message: 'Copied response JSON' } }));
  }

  function toggle(path: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }

  function renderValue(value: unknown, path: string): React.ReactNode {
    if (value === null) return <span className="text-purple-600">null</span>;
    if (typeof value === 'number') return <span className="text-blue-600">{String(value)}</span>;
    if (typeof value === 'boolean') return <span className="text-purple-600">{String(value)}</span>;
    if (typeof value === 'string') {
      return <span className="text-green-700">"{value}"</span>;
    }
    if (Array.isArray(value)) {
      const isCollapsed = collapsed.has(path);
      return (
        <span>
          [
          <button
            type="button"
            onClick={() => toggle(path)}
            className="ml-2 inline-flex h-5 w-5 items-center justify-center border border-[#E5E5E5] bg-white text-xs leading-none align-middle hover:bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1"
            aria-label={isCollapsed ? `Expand array with ${value.length} item(s)` : 'Collapse array'}
            title={isCollapsed ? `Expand array (${value.length})` : 'Collapse array'}
          >
            {isCollapsed ? '▸' : '▾'}
          </button>
          {isCollapsed && <span className="ml-1 text-[11px] text-[#666666]">{value.length}</span>}
          {!isCollapsed && (
            <div className="ml-4">
              {value.map((entry, index) => (
                <div key={`${path}-${index}`}>
                  {renderValue(entry, `${path}.${index}`)}
                  {index < value.length - 1 ? ',' : ''}
                </div>
              ))}
            </div>
          )}
          ]
        </span>
      );
    }
    if (typeof value === 'object') {
      const record = value as Record<string, unknown>;
      const keys = Object.keys(record);
      const isCollapsed = collapsed.has(path);
      return (
        <span>
          {'{'}
          <button
            type="button"
            onClick={() => toggle(path)}
            className="ml-2 inline-flex h-5 w-5 items-center justify-center border border-[#E5E5E5] bg-white text-xs leading-none align-middle hover:bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1"
            aria-label={isCollapsed ? `Expand object with ${keys.length} key(s)` : 'Collapse object'}
            title={isCollapsed ? `Expand object (${keys.length})` : 'Collapse object'}
          >
            {isCollapsed ? '▸' : '▾'}
          </button>
          {isCollapsed && <span className="ml-1 text-[11px] text-[#666666]">{keys.length}</span>}
          {!isCollapsed && (
            <div className="ml-4">
              {keys.map((key, index) => (
                <div key={`${path}-${key}`}>
                  <span className="text-[#E4002B]">"{key}"</span>: {renderValue(record[key], `${path}.${key}`)}
                  {index < keys.length - 1 ? ',' : ''}
                </div>
              ))}
            </div>
          )}
          {'}'}
        </span>
      );
    }
    return <span>{String(value)}</span>;
  }

  const payload = result.data as { objects?: MoMAObject[] } | undefined;
  const objects = payload?.objects ?? [];
  const visualObjects = objects.filter((item) => getArtworkImageFallbackChain(item).length > 0);

  return (
    <section className="border border-black">
      <header className="px-4 py-3 border-b border-black bg-[#F5F5F5] flex flex-wrap items-center gap-2 justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">Response</span>
          <span className={`text-xs border px-2 py-1 ${statusClass(result.status)}`}>
            {result.status} {result.statusText}
          </span>
          <span className="text-xs text-[#666666]">{result.duration}ms</span>
          {result.attempts && result.attempts > 1 && (
            <span className="text-xs text-[#666666]">retried {result.attempts - 1}x</span>
          )}
        </div>
        <button
          type="button"
          onClick={copyResponse}
          className="text-xs border border-black px-2 py-1 hover:bg-black hover:text-white transition-colors"
        >
          Copy Response
        </button>
      </header>

      <div className="p-4">
        {result.truncated && (
          <p className="mb-3 text-xs text-[#666666] bg-[#F5F5F5] border border-[#E5E5E5] px-3 py-2">
            Response was trimmed for performance.
          </p>
        )}
        {result.ok ? (
          <div className="space-y-4">
            <details open>
              <summary className="cursor-pointer text-xs font-medium">Collapsible explorer</summary>
              <pre className="font-mono text-xs overflow-x-auto whitespace-pre-wrap break-words mt-2">
                {renderValue(result.data, 'root')}
              </pre>
            </details>
          </div>
        ) : (
          <div className="text-sm">
            <p className="text-[#E4002B] font-medium">Request failed</p>
            <p className="mt-1 text-[#666666]">
              {result.status === 401 && 'Your token is invalid or expired. Tokens last 24 hours.'}
              {result.status === 429 && 'Rate limit exceeded. Please wait before retrying.'}
              {result.status === 0 && 'Network error. Check connectivity and CORS behavior.'}
              {result.status !== 401 && result.status !== 429 && result.status !== 0 && result.error}
            </p>
            <details className="mt-3">
              <summary className="cursor-pointer text-xs underline">Show details</summary>
              <pre className="text-xs mt-2 bg-[#F5F5F5] border border-[#E5E5E5] p-3 overflow-x-auto">
                {JSON.stringify({ status: result.status, statusText: result.statusText, error: result.error }, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>

      {visualObjects.length > 0 && (
        <div className="border-t border-[#E5E5E5] p-4">
          <h4 className="text-xs uppercase tracking-[0.08em] font-semibold mb-3">Artwork Images</h4>
          <p className="text-[11px] text-[#666666] mb-3">
            Workaround enabled: if full-size fails, we automatically try alternate API image candidates and thumbnail fallback.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visualObjects.map((item, index) => (
              <ArtworkCard key={`${item.objectID ?? index}`} artwork={item} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
