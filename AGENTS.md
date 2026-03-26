# AGENTS.md — `_app_moma-api`

This directory contains the **MoMA API Playground** web app (Astro + React islands), focused on interactive documentation for `https://api.moma.org`.

## App Summary

- Framework: **Astro 6**
- Interactivity: **React 19 islands**
- Styling: **Tailwind CSS 4**
- Language: **TypeScript**
- Syntax highlighting: **PrismJS**
- API mode: **client-side only** (no backend proxy)

## Local Development

```bash
pnpm install
pnpm dev
```

Build and preview:

```bash
pnpm build
pnpm preview
```

## Environment

`.env.example`:

```bash
PUBLIC_MOMA_API_BASE_URL=https://api.moma.org
```

This is a public client variable and is read in browser-side requests.

## Project Structure

```text
_app_moma-api/
├── src/
│   ├── components/
│   │   ├── ApiPlayground.tsx
│   │   ├── TokenManager.tsx
│   │   ├── ResponseViewer.tsx
│   │   ├── RequestHistoryDrawer.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Breadcrumbs.tsx
│   │   ├── RandomArtwork.tsx
│   │   └── ...
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── DocsLayout.astro
│   ├── lib/
│   │   ├── api.ts
│   │   ├── endpoints.ts
│   │   ├── storage.ts
│   │   ├── token-utils.ts
│   │   ├── image-utils.ts
│   │   └── types.ts
│   ├── pages/
│   │   ├── index.astro
│   │   └── docs/[...slug].astro
│   └── styles/global.css
├── public/
└── AGENTS.md
```

## Feature Expectations

- Token modal + token persistence in `localStorage`
- Endpoint docs for Artists, Objects, Exhibitions, Packages
- Live request builder + response viewer (status + timing)
- Request history (last 10 calls)
- Discover mode with random artwork
- Responsive sidebar navigation + breadcrumbs
- MoMA-inspired visual system (black/white base + red accents)

## Storage Contract

Current browser storage keys:

- `moma_api_token`
- `moma_request_history`
- `moma_theme`
- `moma_history_replay` (sessionStorage)
- `moma_discover_artwork`
- `moma_discover_artworks`

If changing keys, migrate old values to avoid breaking existing users.

## Engineering Notes

- Keep endpoint definitions centralized in `src/lib/endpoints.ts`.
- Keep API request logic centralized in `src/lib/api.ts`.
- Prefer reusable typed interfaces from `src/lib/types.ts`.
- Do not move token logic out of `storage.ts`/`token-utils.ts` unless required.
- Preserve accessibility: keyboard navigation, labels, and visible focus.

## Workflow

1. Make surgical changes relevant to the request.
2. Run `pnpm build` to validate before finishing.
3. Update README/AGENTS when behavior or architecture changes.
