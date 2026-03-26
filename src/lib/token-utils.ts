const TOKEN_MASK = 'YOUR_TOKEN';

export function maskToken(token: string | null | undefined): string {
  if (!token) return '';
  return TOKEN_MASK;
}

export function maskTokenInUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const params = new URLSearchParams(parsed.search);
    if (!params.has('token')) return parsed.toString();

    const displayPairs: string[] = [];
    for (const [key, value] of params.entries()) {
      if (key === 'token') {
        displayPairs.push(`${key}=${maskToken(value)}`);
      } else {
        displayPairs.push(`${key}=${value}`);
      }
    }

    const base = `${parsed.origin}${parsed.pathname}`;
    return `${base}?${displayPairs.join('&')}`;
  } catch {
    return url;
  }
}
