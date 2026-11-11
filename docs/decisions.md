# Decisions

One ruling per line, with the reason. Change the ruling here before changing the code it governs.

## Platform

- **2026-11-11 Separate repo from `m-cn-registry`.** React apps still install from it. Components are ported one at a time.
- **2026-11-11 Style mira, neutral, Inter, default radius, lucide.** Matches `m-cn-registry`. Set by `shadcn-svelte init --preset b1D0dv72`. Base color is fixed after init.
- **2026-11-11 SvelteKit 3.** `#lib` replaces `$lib`, kit config lives in `vite.config.ts`, `tsconfig` extends `$app/tsconfig`. `shadcn-svelte init` needs `#lib/...` aliases passed explicitly; `$lib/...` fails validation.
- **2026-11-11 `registry.json` is hand-written.** The `@shadcn-svelte/registry` sv add-on (v0.1.1) targets sv 0.16 and predates `#lib`.
- **2026-11-11 CLI-installed files skip Prettier and ESLint.** They use double quotes and `button` fails `svelte/no-navigation-without-resolve`. Left as installed, `add --overwrite` never shows a diff.

## Registry layout

- **2026-11-11 Items import each other via `$lib/registry/...`.** At install the CLI rewrites `$lib/registry/ui/x` to the consumer's `#lib/components/ui/x`; it leaves `#lib/registry/...` alone, which breaks the consumer. We define only `$lib/registry` (Vite `resolve.alias` + tsconfig `paths`); Kit's `alias` option also works but is deprecated. Revisit if the CLI learns `#lib/registry`.
- **2026-11-11 One folder per item with `index.ts`** (`src/lib/registry/ui/<name>/`). Same shape as shadcn-svelte's own components.
- **2026-11-11 Block files carry `"target": "<block>/<file>"`.** Without it the CLI flattens every `registry:component` file into `components/`, so two blocks' `types.ts` would collide. With it they land in `#lib/components/<block>/` and relative imports between them still work.
- **2026-11-11 Each block rebuilds its own grid parts.** ReUI's data-grid, badge and frame are React-only and may not be copied. The two blocks were ported in parallel, so each holds its own table, badge tones and frame markup. Extract a shared item when a third block needs them.

## Hosting

- **2026-11-11 GitHub Pages via Actions.** The CLI installs only from URLs (no GitHub addresses, no namespaces), so the JSON must be hosted. Pages also serves the preview site, and build output stays out of git. Cost: same-registry `registryDependencies` hard-code the Pages URL.
- **2026-11-11 `BASE_PATH` sets `paths.base`.** Pages serves under `/m-cn-svelte-registry`; locally it is empty.

## Ports

- **2026-11-11 Tables that own expand state set `autoResetExpanded: false`.** The Svelte adapter re-syncs options on every state change, which fires TanStack's expanded auto reset and wipes each toggle straight after it lands (Expand All and the depth buttons did nothing). Found in browser review; both agent ports had passed typecheck and headless table tests.

- **2026-11-11 `copy-button`: a caller's `onclick` replaces the copy action.** Same as the React version. Typed `Omit<ButtonProps, 'href'>`.
- **2026-11-11 `icon-tile` uses `tv`, not `cva`.** Matches shadcn-svelte's own components.
