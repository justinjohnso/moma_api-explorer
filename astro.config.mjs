// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

const [repoOwner, repoName] = (process.env.GITHUB_REPOSITORY || '').split('/');
const base = repoName ? `/${repoName}` : '/';
const site = repoOwner ? `https://${repoOwner}.github.io` : undefined;

// https://astro.build/config
export default defineConfig({
  site,
  base,
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()]
  }
});
