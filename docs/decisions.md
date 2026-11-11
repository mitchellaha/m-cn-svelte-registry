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
- **2026-11-11 `registry.json` sets `aliases.components` to `$lib/registry/blocks`.** At build the CLI swaps each alias prefix for a placeholder that `add` rewrites to the consumer's alias. The default components prefix is `$lib/registry/components`, which we do not have, so `$lib/registry/blocks/x/y.svelte` shipped untouched and broke the consumer. With the alias it lands as `#lib/components/x/y.svelte`, which is where `"target": "x/y.svelte"` puts the file. Verified by install into a scratch app; the other items' built JSON was byte-identical before and after.
- **2026-11-11 A block may compose other blocks.** `app-header` imports `scope-switcher`, `feature-menu` and `command-palette` through `$lib/registry/blocks/<name>/<file>` and lists them as URL `registryDependencies`. The three it uses still install on their own and each keeps its own `types.ts`; their module/screen shapes are structurally compatible, so one `modules` array feeds the menu and the palette.
- **2026-11-11 Each block rebuilds its own grid parts.** ReUI's data-grid, badge and frame are React-only and may not be copied. The two blocks were ported in parallel, so each holds its own table, badge tones and frame markup. Extract a shared item when a third block needs them.

## Hosting

- **2026-11-11 GitHub Pages via Actions.** The CLI installs only from URLs (no GitHub addresses, no namespaces), so the JSON must be hosted. Pages also serves the preview site, and build output stays out of git. Cost: same-registry `registryDependencies` hard-code the Pages URL.
- **2026-11-11 `BASE_PATH` sets `paths.base`.** Pages serves under `/m-cn-svelte-registry`; locally it is empty.

## Ports

- **2026-11-11 Every `createTable` sets `autoResetAll: false`.** `@tanstack/svelte-table` 9.3 keeps options in a deep `$state`, so each option sync hands table-core a fresh proxy of `data`. The core row model memo sees new data and fires every auto reset: expand toggles were wiped straight after they landed, and the page index jumped back to 1. Blocks own their state, so they reset what they mean to reset explicitly (treasury: page index on search or group change). Found in browser review; both agent ports had passed typecheck and headless tests. Revisit if the adapter switches its options store to `$state.raw`.
- **2026-11-11 Search locks expand state in both grids.** While a query pins every row open, expand toggles are ignored and the depth / Expand All controls are disabled, so clearing the search restores the user's view.

- **2026-11-11 `copy-button`: a caller's `onclick` replaces the copy action.** Same as the React version. Typed `Omit<ButtonProps, 'href'>`.
- **2026-11-11 `icon-tile` uses `tv`, not `cva`.** Matches shadcn-svelte's own components.
- **2026-11-11 `status-badge` ships its tokens through `cssVars`.** `theme`, `light` and `dark` on a `registry:ui` item are written into the consumer's stylesheet by `add` (checked in a scratch app). The preview's `layout.css` carries the same values by hand; change both together. Tones repeat `dark:bg-*` to beat the outline badge's `dark:bg-input/30`.
- **2026-11-11 Shell blocks are prop-driven.** `scope-switcher`, `feature-menu`, `command-palette` and `app-header` hold no global state and import nothing from `$app/*`: selection and pins are `bind:` props, navigation is an `href` builder or `onNavigate`, and labels are overridable props. Ported from a private prototype; its product copy, data and theme values stay out of this repo.
- **2026-11-11 `app-header` has no theme toggle.** It would need `mode-watcher`. The `end` snippet takes one from the consumer.
- **2026-11-11 Demos navigate with `onNavigate`, not `#hash` links.** SvelteKit prerender fails the build on links to missing ids. The `app-header` demo uses Cmd+J because the `command-palette` demo on the same page owns Cmd+K.
- **2026-11-11 Screen links: plain click with `onNavigate` prevents default; modified clicks belong to the browser.** Cmd, Ctrl, Shift, Alt or middle click opens the link normally without closing the menu or calling `onNavigate`, so the app never navigates twice. `isModifiedClick` lives in `feature-menu` and `app-header` reuses it.
- **2026-11-11 Shell blocks have phone layouts, not just narrower desktop ones.** Below `sm` the scope switcher steps through one pane (groups, then items, with a back button); below `md` the feature menu shows modules as a scrolling chip row with Pinned under the cards, and the header keeps the screen menu while dropping the module crumb. Popovers use a max height on phones so short lists do not leave empty space. Pin buttons are always visible where the device cannot hover (`pointer-coarse`).
- **2026-11-11 The palette shortcut is Cmd on Apple platforms and Ctrl elsewhere, never both.** macOS uses Ctrl+K in text fields to delete to the end of the line.
- **2026-11-11 Mira command items end in their own `ml-auto` check icon.** A second `ml-auto` element in the row splits the free space, so trailing text uses `flex-1` on the label instead.

## Preview site

- **2026-11-11 Phone and Tablet previews are iframes of a standalone route.** Tailwind breakpoints follow the viewport, so a narrow div cannot show a component's phone layout; `/preview/[name]/` renders one demo alone and the main page frames it at 390 or 768px. Desktop stays inline. Iframes load only when picked.
