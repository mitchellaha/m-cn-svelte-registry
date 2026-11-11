<script lang="ts">
	import type { Snippet } from 'svelte';
	import BoxIcon from '@lucide/svelte/icons/box';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import registry from '../../registry.json';
	import { installCommand } from '#lib/site.js';
	import { CopyButton } from '$lib/registry/ui/copy-button/index.js';
	import { IconTile } from '$lib/registry/ui/icon-tile/index.js';
	import BomTreeGridDemo from '$lib/registry/blocks/bom-tree-grid/bom-tree-grid-demo.svelte';
	import TreasuryWaterfallGridDemo from '$lib/registry/blocks/treasury-waterfall-grid/treasury-waterfall-grid-demo.svelte';

	const demos: Record<string, Snippet> = {
		'copy-button': copyButtonDemo,
		'icon-tile': iconTileDemo,
		'bom-tree-grid': bomTreeGridDemo,
		'treasury-waterfall-grid': treasuryWaterfallGridDemo
	};
</script>

{#snippet copyButtonDemo()}
	<CopyButton value="Copied from m-cn-svelte" />
{/snippet}

{#snippet bomTreeGridDemo()}
	<BomTreeGridDemo />
{/snippet}

{#snippet treasuryWaterfallGridDemo()}
	<TreasuryWaterfallGridDemo />
{/snippet}

{#snippet iconTileDemo()}
	<div class="flex items-center gap-2">
		<IconTile size="sm"><BoxIcon /></IconTile>
		<IconTile><BoxIcon /></IconTile>
		<IconTile size="lg"><CopyIcon /></IconTile>
	</div>
{/snippet}

<svelte:head>
	<title>m-cn-svelte registry</title>
</svelte:head>

<main class="mx-auto flex min-h-svh max-w-7xl flex-col gap-6 p-6">
	<header class="flex flex-col gap-1">
		<h1 class="text-sm font-medium">m-cn-svelte registry</h1>
		<p class="text-xs text-muted-foreground">
			shadcn-svelte components on Bits UI, style mira, icons lucide.
		</p>
	</header>

	{#each registry.items as item (item.name)}
		<section class="flex flex-col gap-3 rounded-lg border p-4">
			<div class="flex flex-col gap-0.5">
				<h2 class="text-sm font-medium">{item.title}</h2>
				<p class="text-xs text-muted-foreground">{item.description}</p>
			</div>
			<div
				class={item.type === 'registry:block'
					? 'overflow-x-auto'
					: 'flex min-h-24 items-center justify-center rounded-md bg-muted/40 p-6'}
			>
				{@render demos[item.name]?.()}
			</div>
			<div class="flex items-center gap-2">
				<code class="min-w-0 flex-1 truncate font-mono text-xs">{installCommand(item.name)}</code>
				<CopyButton value={installCommand(item.name)} />
			</div>
		</section>
	{/each}
</main>
