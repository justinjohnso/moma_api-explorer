import type { Endpoint } from '../lib/types';
import { endpointHref } from '../lib/endpoints';

interface EndpointCardProps {
  endpoint: Endpoint;
}

export default function EndpointCard({ endpoint }: EndpointCardProps) {
  return (
    <article className="border border-[#E5E5E5] p-4 bg-white hover:border-black transition-colors">
      <header className="flex items-center justify-between gap-2">
        <h3 className="font-medium">{endpoint.title}</h3>
        <span className="text-[11px] px-2 py-1 border border-[#00875A] bg-[#E6F7EE] text-[#00875A] font-mono">
          GET
        </span>
      </header>
      <p className="text-sm text-[#666666] mt-2">{endpoint.description}</p>
      <p className="mt-3 text-xs font-mono bg-[#F5F5F5] border border-[#E5E5E5] p-2 break-all">
        {endpoint.pathTemplate}
      </p>
      <a
        href={endpointHref(endpoint)}
        className="inline-block mt-4 text-sm font-medium border border-black px-3 py-2 hover:bg-black hover:text-white transition-colors"
      >
        Open Playground
      </a>
    </article>
  );
}
