import { useEffect, useMemo, useState } from 'react';
import type { HistoryReplayPayload, RequestHistory } from '../lib/types';
import { clearHistory, getRequestHistory, setPendingHistoryReplay } from '../lib/storage';
import { endpointHref, getEndpointById } from '../lib/endpoints';
import { maskTokenInUrl } from '../lib/token-utils';

export default function RequestHistoryDrawer() {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<RequestHistory[]>([]);

  useEffect(() => {
    function refresh() {
      setHistory(getRequestHistory());
    }
    refresh();
    window.addEventListener('moma-history-updated', refresh);
    return () => window.removeEventListener('moma-history-updated', refresh);
  }, []);

  const sorted = useMemo(() => [...history].sort((a, b) => b.timestamp - a.timestamp), [history]);

  function handleClear() {
    clearHistory();
    setHistory([]);
  }

  function handleReplay(item: RequestHistory) {
    const endpoint = getEndpointById(item.endpointId);
    if (!endpoint) {
      window.dispatchEvent(new CustomEvent('moma-toast', { detail: { message: 'Saved endpoint is no longer available.' } }));
      return;
    }

    const detail: HistoryReplayPayload = {
      endpointId: item.endpointId,
      url: item.url,
    };
    setPendingHistoryReplay(detail);
    const targetPath = endpointHref(endpoint);
    if (window.location.pathname === targetPath) {
      window.dispatchEvent(new CustomEvent<HistoryReplayPayload>('moma-history-replay', { detail }));
    } else {
      window.location.href = targetPath;
    }
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 text-sm border border-black hover:bg-black hover:text-white transition-colors"
      >
        HISTORY
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setOpen(false)}>
          <aside
            className="absolute right-0 top-0 h-full w-full max-w-[420px] bg-white border-l border-black p-5 overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
            aria-label="Request history"
          >
            <header className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Request History</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-sm border border-black px-2 py-1">
                Close
              </button>
            </header>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-[#666666]">Last 10 requests in localStorage</p>
              <button
                type="button"
                onClick={handleClear}
                className="text-xs border border-[#E4002B] text-[#E4002B] px-2 py-1 hover:bg-[#FFF1F4]"
              >
                Clear
              </button>
            </div>

            <ul className="mt-4 space-y-2">
              {sorted.length === 0 && <li className="text-sm text-[#666666]">No requests yet.</li>}
              {sorted.map((item) => {
                const endpoint = getEndpointById(item.endpointId);
                const statusClass =
                  item.status >= 200 && item.status < 300
                    ? 'text-[#00875A]'
                    : item.status >= 400 && item.status < 500
                    ? 'text-[#A97300]'
                    : 'text-[#E4002B]';

                return (
                  <li key={item.id} className="border border-[#E5E5E5] p-3">
                    <p className="text-xs text-[#666666]">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                    <p className="text-sm font-medium mt-1">{endpoint?.title ?? item.endpointTitle}</p>
                    <p className="font-mono text-[11px] mt-1 break-all">{maskTokenInUrl(item.url)}</p>
                    <p className="text-xs mt-2">
                      <span className={statusClass}>Status {item.status}</span> · {item.duration}ms
                    </p>
                    <button
                      type="button"
                      onClick={() => handleReplay(item)}
                      className="mt-3 text-xs border border-black px-2 py-1 hover:bg-black hover:text-white transition-colors"
                    >
                      Load into tester
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>
      )}
    </>
  );
}
