import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { MoMAObject, ObjectsResponse } from '../lib/types';
import ArtworkCard from './ArtworkCard';
import {
  getDiscoverArtwork,
  getDiscoverArtworks,
  setDiscoverArtwork,
  setDiscoverArtworks,
} from '../lib/storage';

function dedupeByObjectId(items: MoMAObject[]): MoMAObject[] {
  const seen = new Set<number | string>();
  const out: MoMAObject[] = [];
  for (const item of items) {
    const key = item.objectID ?? item.objectNumber ?? Math.random();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

export default function RandomArtwork() {
  const [loading, setLoading] = useState(true);
  const [artworks, setArtworks] = useState<MoMAObject[]>([]);
  const [onViewOnly, setOnViewOnly] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Loading on-view artworks…');

  async function fetchOne(onView: boolean | undefined): Promise<MoMAObject | null> {
    const response = await api.getRandomObject(onView, { timeoutMs: 7000, retries: 1 });
    if (!response.ok) return null;
    const payload = (response.data ?? {}) as ObjectsResponse;
    return payload.objects?.[0] ?? null;
  }

  async function fetchRandom() {
    if (!api.getToken()) {
      window.dispatchEvent(new CustomEvent('moma-toast', { detail: { message: 'Set your token to discover artworks.' } }));
      setStatusMessage('Token missing');
      setLoading(false);
      return;
    }

    setLoading(true);
    setStatusMessage('Loading 3 on-view artworks…');

    const picks: MoMAObject[] = [];
    for (let i = 0; i < 4 && picks.length < 3; i += 1) {
      const next = await fetchOne(onViewOnly);
      if (next) picks.push(next);
    }

    let unique = dedupeByObjectId(picks);
    if (unique.length < 3) {
      setStatusMessage('Filling with fallback artworks…');
      for (let i = 0; i < 4 && unique.length < 3; i += 1) {
        const next = await fetchOne(undefined);
        if (next) unique = dedupeByObjectId([...unique, next]);
      }
    }

    setLoading(false);

    if (unique.length === 0) {
      window.dispatchEvent(new CustomEvent('moma-toast', { detail: { message: 'Unable to load artworks right now.' } }));
      setStatusMessage('Unable to load artworks right now.');
      return;
    }

    setArtworks(unique.slice(0, 3));
    setDiscoverArtwork(unique[0]);
    setDiscoverArtworks(unique.slice(0, 3));
    setStatusMessage('Loaded');
  }

  useEffect(() => {
    const cachedGrid = getDiscoverArtworks();
    const cachedSingle = getDiscoverArtwork();
    if (cachedGrid.length > 0) {
      setArtworks(cachedGrid.slice(0, 3));
      setStatusMessage('Loaded');
      setLoading(false);
    } else if (cachedSingle) {
      setArtworks([cachedSingle]);
      setStatusMessage('Loaded');
      setLoading(false);
    }
    void fetchRandom();
  }, []);

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-semibold">Discover</h3>
          <p className="text-sm text-[#666666] mt-1">Get random artworks from `/api/objects/random`.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm flex items-center gap-2">
            <input
              type="checkbox"
              checked={onViewOnly}
              onChange={(event) => setOnViewOnly(event.target.checked)}
              className="accent-black"
            />
            On view only
          </label>
          <button
            onClick={fetchRandom}
            disabled={loading}
            className="bg-black text-white px-4 py-2 text-sm hover:opacity-90 disabled:opacity-60"
          >
            {loading ? 'Loading…' : 'Get Random Artwork'}
          </button>
        </div>
      </div>

      <div className="mt-5 border border-[#E5E5E5] p-4 min-h-44">
        {loading && artworks.length === 0 && (
          <div className="h-44 bg-[#F5F5F5] border border-[#E5E5E5] flex items-center justify-center">
            <div className="flex items-center gap-3 text-sm">
              <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>{statusMessage}</span>
            </div>
          </div>
        )}

        {artworks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {artworks.slice(0, 3).map((artwork, index) => (
              <ArtworkCard
                key={`${artwork.objectID ?? artwork.objectNumber ?? index}`}
                artwork={artwork}
                compact
                preserveComposition
                className="max-w-none"
              />
            ))}
          </div>
        )}

        {!loading && artworks.length === 0 && (
          <p className="text-sm text-[#666666]">{statusMessage === 'Ready' ? 'No artwork loaded yet.' : statusMessage}</p>
        )}
      </div>
    </section>
  );
}
