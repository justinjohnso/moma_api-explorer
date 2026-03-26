// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

const [repoOwner, repoName] = (process.env.GITHUB_REPOSITORY || '').split('/');
const isPagesBuild = process.env.GITHUB_ACTIONS === 'true';

// Optional explicit overrides for custom domains or advanced setups.
const explicitSite = process.env.PUBLIC_SITE_URL;
const explicitBase = process.env.PUBLIC_BASE_PATH;

const pagesFallbackSite = repoOwner ? `https://${repoOwner}.github.io` : undefined;
const pagesFallbackBase = repoName ? `/${repoName}` : '/';

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
