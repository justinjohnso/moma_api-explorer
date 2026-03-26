import type { MoMAObject } from './types';

function isHttpUrl(value: unknown): value is string {
  return typeof value === 'string' && /^https?:\/\//i.test(value);
}

function normalizeCandidates(values: unknown[]): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const value of values) {
    if (!isHttpUrl(value)) continue;
    if (seen.has(value)) continue;
    seen.add(value);
    urls.push(value);
  }
  return urls;
}

function imageCandidatesFromImagesField(images: unknown): string[] {
  if (!images || typeof images !== 'object') return [];
  const values = Object.values(images as Record<string, unknown>);
  const nested: unknown[] = [];
  for (const value of values) {
    if (isHttpUrl(value)) nested.push(value);
    if (value && typeof value === 'object') {
      nested.push(...Object.values(value as Record<string, unknown>));
    }
  }
  return normalizeCandidates(nested);
}

function conservativeVariantGuesses(url: string): string[] {
  const guesses: string[] = [];
  if (/\/full\//i.test(url)) guesses.push(url.replace(/\/full\//i, '/large/'));
  if (/\/large\//i.test(url)) guesses.push(url.replace(/\/large\//i, '/full/'));
  if (/\/original\//i.test(url)) guesses.push(url.replace(/\/original\//i, '/large/'));
  if (!/\/thumb/i.test(url)) guesses.push(url.replace(/(\.\w+)$/, '_thumb$1'));
  return guesses;
}

export function getArtworkImageFallbackChain(artwork: MoMAObject): string[] {
  const direct = [artwork.fullImage, artwork.thumbnail];
  const fromImages = imageCandidatesFromImagesField((artwork as Record<string, unknown>).images);
  const guessed = direct.flatMap((url) => (isHttpUrl(url) ? conservativeVariantGuesses(url) : []));
  return normalizeCandidates([...direct, ...fromImages, ...guessed]);
}
