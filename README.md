# m-cn-svelte-registry

A [shadcn-svelte](https://www.shadcn-svelte.com) component registry. Bits UI, style mira, lucide icons.

Preview: https://mitchellaha.github.io/m-cn-svelte-registry

## Install a component

Your project needs shadcn-svelte set up (`pnpm dlx shadcn-svelte@latest init`). Then:

```bash
pnpm dlx shadcn-svelte@latest add https://mitchellaha.github.io/m-cn-svelte-registry/r/copy-button.json
```

| Item                      | What it is                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------- |
| `copy-button`             | Copies text to the clipboard and shows a check for a moment.                          |
| `icon-tile`               | A small bordered square that frames an icon, for row labels.                          |
| `bom-tree-grid`           | Bill-of-materials tree grid with cost, lead time and supply roll-ups.                 |
| `treasury-waterfall-grid` | Monthly cash waterfall grid with Actuals, Plan and Variance tabs.                     |
| `status-badge`            | Badge with ok, warn, crit and idle tones; adds its colour tokens.                     |
| `star-rating`             | Star rating input with half stars and readonly mode, from shadcn-svelte-extras (MIT). |
| `scope-switcher`          | Header chip and two-pane popover that sets the project scope.                         |
| `feature-menu`            | Breadcrumb mega-menu with modules, screen cards and pins.                             |
| `command-palette`         | Cmd/Ctrl+K dialog over screens and actions.                                           |
| `app-header`              | Top bar composing the scope switcher, feature menu and palette.                       |

## Develop

```bash
pnpm install
pnpm dev
```

```bash
pnpm check && pnpm lint && pnpm build
```

`pnpm build` runs `registry:build` first, which writes the item JSON to `static/r/`. Pushing to `main` deploys to GitHub Pages.
