import { useMemo, useState } from 'react';
import type { CategoryKey } from '../lib/types';
import {
  categories,
  categoryDescriptions,
  categoryHref,
  categoryLabels,
  homeHref,
  endpointHref,
  endpoints,
  getEndpointsByCategory,
} from '../lib/endpoints';

interface SidebarProps {
  currentPath: string;
}

export default function Sidebar({ currentPath }: SidebarProps) {
  const [expanded, setExpanded] = useState<Set<CategoryKey>>(new Set(categories));
  const [query, setQuery] = useState('');
  const [openMobile, setOpenMobile] = useState(false);

  const filteredEndpoints = useMemo(() => {
    if (!query.trim()) return endpoints;
    const q = query.toLowerCase();
    return endpoints.filter((endpoint) => {
      return (
        endpoint.title.toLowerCase().includes(q) ||
        endpoint.description.toLowerCase().includes(q) ||
        endpoint.pathTemplate.toLowerCase().includes(q)
      );
    });
  }, [query]);

  function toggleCategory(category: CategoryKey) {
    const next = new Set(expanded);
    if (next.has(category)) {
      next.delete(category);
    } else {
      next.add(category);
    }
    setExpanded(next);
  }

  const navInner = (
    <div className="bg-white border-r border-[#E5E5E5]">
      <div className="p-5 border-b border-[#E5E5E5]">
        <h2 className="text-sm tracking-[0.08em] uppercase font-semibold">Endpoints</h2>
        <p className="text-xs text-[#666666] mt-1">Explore and test MoMA API endpoints</p>
        <label htmlFor="endpoint-search" className="sr-only">
          Search endpoints
        </label>
        <input
          id="endpoint-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search endpoints..."
          className="mt-3 w-full border border-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          aria-label="Search and jump to endpoint"
        />
      </div>

      <div className="p-4 space-y-4">
        <a
          href={homeHref()}
          className={`block border border-[#E5E5E5] px-3 py-2 text-sm ${
            currentPath === homeHref() ? 'bg-[#F5F5F5] border-black' : 'hover:bg-[#F5F5F5]'
          }`}
        >
          Landing / Discover
        </a>
        {categories.map((category) => {
          const isExpanded = expanded.has(category);
          const categoryEndpoints = getEndpointsByCategory(category);
          const visible = categoryEndpoints.filter((endpoint) =>
            filteredEndpoints.some((candidate) => candidate.id === endpoint.id),
          );

          if (visible.length === 0) return null;

          return (
            <section key={category} className="border border-[#E5E5E5]">
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                className="w-full px-3 py-2 text-left border-b border-[#E5E5E5] hover:bg-[#F5F5F5] flex items-center justify-between"
                aria-expanded={isExpanded}
              >
                <span>
                  <span className="font-medium text-sm">{categoryLabels[category]}</span>
                  <span className="block text-xs text-[#666666]">{categoryDescriptions[category]}</span>
                </span>
                <span className="text-xs">{isExpanded ? '▾' : '▸'}</span>
              </button>

              {isExpanded && (
                <div className="p-2 space-y-1">
                  <a
                    href={categoryHref(category)}
                    className={`block px-2 py-2 text-xs border-l-2 ${
                      currentPath === categoryHref(category)
                        ? 'border-black bg-[#F5F5F5]'
                        : 'border-transparent hover:border-[#E5E5E5] hover:bg-[#F5F5F5]'
                    }`}
                  >
                    Overview
                  </a>
                  {visible.map((endpoint) => {
                    const href = endpointHref(endpoint);
                    const active = currentPath === href;
                    return (
                      <a
                        key={endpoint.id}
                        href={href}
                        className={`block px-2 py-2 text-xs border-l-2 ${
                          active
                            ? 'border-black bg-[#F5F5F5]'
                            : 'border-transparent hover:border-[#E5E5E5] hover:bg-[#F5F5F5]'
                        }`}
                      >
                        <span className="inline-flex items-center gap-2">
                          <span className="text-[10px] px-1.5 py-0.5 rounded-none border border-[#00875A] bg-[#E6F7EE] text-[#00875A] font-mono">
                            GET
                          </span>
                          <span className="font-medium">{endpoint.title}</span>
                        </span>
                        <span className="block font-mono text-[10px] text-[#666666] mt-1 break-all">
                          {endpoint.pathTemplate}
                        </span>
                      </a>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <button
        className="lg:hidden fixed bottom-4 right-4 z-50 bg-black text-white px-4 py-3 text-sm"
        onClick={() => setOpenMobile((value) => !value)}
        aria-expanded={openMobile}
        aria-controls="mobile-sidebar"
        aria-label="Toggle endpoint navigation"
      >
        {openMobile ? 'Close' : 'Menu'}
      </button>

      <aside className="hidden lg:block w-[340px]">{navInner}</aside>

      {openMobile && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setOpenMobile(false)}>
          <aside
            id="mobile-sidebar"
            className="w-[86vw] max-w-[360px] h-full bg-white"
            onClick={(event) => event.stopPropagation()}
          >
            {navInner}
          </aside>
        </div>
      )}
    </>
  );
}
