// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

const [repoOwner, repoName] = (process.env.GITHUB_REPOSITORY || '').split('/');
const isPagesBuild = process.env.GITHUB_ACTIONS === 'true';

// Optional explicit overrides for custom domains or advanced setups.
const explicitSiteRaw = process.env.PUBLIC_SITE_URL?.trim();
const explicitBaseRaw = process.env.PUBLIC_BASE_PATH?.trim();

const pagesFallbackSite = repoOwner ? `https://${repoOwner}.github.io` : undefined;
const pagesFallbackBase = repoName ? `/${repoName}` : '/';

function normalizeSite(siteValue) {
  if (!siteValue) return undefined;
  try {
    return new URL(siteValue).toString().replace(/\/$/, '');
  } catch {
    return undefined;
  }
}

function normalizeBase(baseValue) {
  if (!baseValue) return undefined;
  if (baseValue === '/') return '/';
  const withLeadingSlash = baseValue.startsWith('/') ? baseValue : `/${baseValue}`;
  return withLeadingSlash.replace(/\/+$/, '');
}

const explicitSite = normalizeSite(explicitSiteRaw);
const explicitBase = normalizeBase(explicitBaseRaw);

// Domain-agnostic defaults:
// - In GitHub Actions: auto-use GitHub Pages shape unless explicitly overridden.
// - Locally: use root unless explicitly overridden.
const site = explicitSite ?? (isPagesBuild ? pagesFallbackSite : undefined);
const base = explicitBase ?? (isPagesBuild ? pagesFallbackBase : '/');

// https://astro.build/config
export default defineConfig({
  site,
  base,
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()]
  }
});
