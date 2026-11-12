# m-cn-svelte-registry

A shadcn-svelte component registry on Bits UI, style `mira`, icons lucide, font Inter. Svelte sibling of `mitchellaha/m-cn-registry` (React, Base UI). Same look: both use mira, neutral, default radius, Inter.

Why things are the way they are: `docs/decisions.md`. Read it before changing layout, aliases, lint config, or hosting.

## Stack

SvelteKit 3, Svelte 5 (runes), Tailwind v4, shadcn-svelte 1.8, Bits UI 2, `@sveltejs/adapter-static`, hosted on GitHub Pages.

SvelteKit 3 differs from training data: `$lib` is gone (use `#lib`, Node subpath imports in `package.json`), there is no `svelte.config.js` (kit options are passed to `sveltekit()` in `vite.config.ts`), and `tsconfig.json` extends `$app/tsconfig`. Read `node_modules/@sveltejs/kit` docs or https://svelte.dev/docs/kit/migrating-to-sveltekit-3 before guessing.

## Layout

- `registry.json`: every item. All of `dependencies`, `devDependencies`, `registryDependencies` must be present (empty arrays are fine) or `registry build` fails.
- `src/lib/registry/ui/<name>/<name>.svelte` + `index.ts`: `registry:ui` items.
- `src/lib/registry/blocks/<name>/<name>.svelte` + `<name>-demo.svelte` + helpers: `registry:block` items. Component takes `data` as a required prop; the demo holds sample data. Files import each other relatively, and each `files` entry in `registry.json` sets `"target": "<name>/<file>"`.
- `src/lib/components/ui/`: shadcn-svelte components installed by the CLI, for the preview app and as dependencies. Never published, never hand-edited, excluded from Prettier and ESLint.
- `src/routes/+page.svelte`: preview page. Lists `registry.json` items with the install command; each demo sits in `preview-frame.svelte` with a Phone / Tablet / Desktop toggle.
- `src/routes/demos/index.ts`: one entry per item (demo component, iframe height). Add an entry for every new item. ui-item demos live in `src/routes/demos/`; block demos are the published `*-demo.svelte` files.
- `src/routes/preview/[name]/`: standalone, prerendered page per item. Phone and Tablet load it in an iframe at 390 / 768px so Tailwind breakpoints respond to that width.
- `src/lib/site.ts`: `REGISTRY_URL`, the GitHub Pages address of the built JSON.
- `static/r/`: build output of `pnpm registry:build`, gitignored. CI builds it.

## Rules

- Imports in registry sources: shadcn-svelte components and utils via `#lib/components/ui/x/index.js` and `#lib/utils.js`; our own ui items via `$lib/registry/ui/x/index.js`, other blocks via `$lib/registry/blocks/<block>/<file>`. The CLI rewrites `$lib/registry/ui/...` by default and `$lib/registry/blocks/...` because `registry.json` sets `aliases.components`; nothing else under `$lib/registry`, and never `#lib/registry/...`.
- `$lib/registry` is defined by us in two places that must match: `resolve.alias` in `vite.config.ts` and `paths` in `tsconfig.json`.
- `registryDependencies`: bare name = official shadcn-svelte item; our own items = full URL `https://mitchellaha.github.io/m-cn-svelte-registry/r/<name>.json` (resolves only after deploy).
- `dependencies` lists every npm package the item imports (`@lucide/svelte`, `tailwind-variants`, `bits-ui` when imported directly).
- Component shape follows shadcn-svelte: module script exports variants and a `XProps` type; instance script destructures `ref = $bindable(null)`, `class: className`, `...restProps`; `index.ts` exports `Root`, `Props`, and the named component.
- Icons: `import XIcon from '@lucide/svelte/icons/x'` (per-icon path).
- Verify before calling anything done: `pnpm check && pnpm lint && pnpm build`, then click through the preview.
- Commit only when asked.

## Dev server

`pnpm dev --port 5173 --strictPort`. `.claude/launch.json` has a `dev` entry; when this repo is not the session's primary project, start it with Bash in the background and open `http://localhost:5173` with `preview_start { url }`.

## Docs lookup

- Svelte and SvelteKit 3: use the Svelte MCP (official `svelte` plugin, enabled in `.claude/settings.json` via `sv add ai-tools`). It serves current svelte.dev docs; run its autofixer on new or edited `.svelte` files. Context7 is not reliable for SvelteKit 3.
- shadcn-svelte: Context7 `/websites/shadcn-svelte`.
