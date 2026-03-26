import { useMemo, useState } from 'react';
import type { MoMAObject } from '../lib/types';
import { getArtworkImageFallbackChain } from '../lib/image-utils';

interface ArtworkCardProps {
  artwork: MoMAObject;
  compact?: boolean;
  preserveComposition?: boolean;
  className?: string;
}

export default function ArtworkCard({
  artwork,
  compact = false,
  preserveComposition = false,
  className = '',
}: ArtworkCardProps) {
  const candidates = useMemo(() => getArtworkImageFallbackChain(artwork), [artwork]);
  const [imageIndex, setImageIndex] = useState(0);
  const active = candidates[imageIndex];
  const hasImage = Boolean(active);
  const sourceLabel =
    imageIndex === 0 ? 'primary source' : imageIndex === candidates.length - 1 ? 'thumbnail fallback' : 'fallback source';

  return (
    <article className={`${compact ? 'max-w-[320px]' : 'max-w-full'} border border-[#E5E5E5] bg-white ${className}`}>
      {hasImage ? (
        <img
          src={active}
          alt={artwork.title ?? 'Artwork'}
          className={
            compact
              ? preserveComposition
                ? 'w-full h-24 object-contain bg-[#F5F5F5]'
                : 'w-full h-32 object-cover'
              : 'w-full h-44 object-cover'
          }
          loading="lazy"
          onError={() => {
            if (imageIndex < candidates.length - 1) {
              setImageIndex((current) => current + 1);
            }
          }}
        />
      ) : (
        <div className={compact ? 'w-full h-24 bg-[#F5F5F5] flex items-center justify-center text-xs text-[#666666]' : 'w-full h-44 bg-[#F5F5F5] flex items-center justify-center text-xs text-[#666666]'}>
          Image unavailable from API
        </div>
      )}
      <div className="p-3">
        <h4 className="font-medium text-sm">{artwork.title ?? 'Untitled'}</h4>
        <p className="text-xs text-[#666666] mt-1">{artwork.displayName ?? 'Unknown artist'}</p>
        <p className="text-xs text-[#666666]">{artwork.dated ?? ''}</p>
        {hasImage && candidates.length > 1 && (
          <p className="text-[10px] text-[#666666] mt-2 uppercase tracking-[0.06em]">Using {sourceLabel}</p>
        )}
      </div>
    </article>
  );
}
