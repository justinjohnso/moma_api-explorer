# MoMA API Playground (Astro)

Polished, interactive API documentation playground for `https://api.moma.org`, built with Astro, TypeScript, Tailwind, and React islands.

## Features

- Token manager modal with localStorage persistence and connection test
- Discover mode on landing page using `/api/objects/random`
- Full endpoint docs across Artists, Objects, Exhibitions, and Packages
- Per-endpoint interactive “Try It” request builder
- Live response viewer with status/timing, collapsible JSON explorer, Prism syntax highlighting
- Inline artwork visualization when image URLs are returned
- Request history drawer (last 10 requests in localStorage)
- Endpoint sidebar with category collapse + endpoint search quick-jump
- Breadcrumbs and responsive layout
- Toast notifications and loading skeletons

## Routes

- `/`
- `/docs/artists`
- `/docs/artists/search`
- `/docs/artists/list`
- `/docs/artists/[id]`
- `/docs/objects`
- `/docs/objects/search`
- `/docs/objects/[id]`
- `/docs/objects/random`
- `/docs/exhibitions`
- `/docs/exhibitions/search`
- `/docs/exhibitions/list`
- `/docs/exhibitions/[id]`
- `/docs/exhibitions/list/[id]`
- `/docs/packages`
- `/docs/packages/list`
- `/docs/packages/[id]`

## Setup

```bash
pnpm install
pnpm dev
```

Then open the local URL from Astro (typically `http://localhost:4321`).

## Build

```bash
pnpm build
pnpm preview
```

## Notes

- API calls are client-side only.
- Token is required by MoMA API and saved to browser localStorage.
- This project is not affiliated with MoMA.
