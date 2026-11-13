<script lang="ts">
	import MonitorIcon from '@lucide/svelte/icons/monitor';
	import SmartphoneIcon from '@lucide/svelte/icons/smartphone';
	import TabletIcon from '@lucide/svelte/icons/tablet';
	import registry from '../../registry.json';
	import * as ToggleGroup from '#lib/components/ui/toggle-group/index.js';
	import { installCommand } from '#lib/site.js';
	import { CopyButton } from '$lib/registry/ui/copy-button/index.js';
	import { viewports, type Viewport } from './demos/index.js';
	import PreviewFrame from './preview-frame.svelte';
	import SiteHeader from './site-header.svelte';
	import SiteSidebar from './site-sidebar.svelte';

	// Desktop renders inline; Phone and Tablet load the item's /preview route in an iframe.
	let modes = $state<Record<string, Viewport>>(
		Object.fromEntries(registry.items.map((item) => [item.name, 'desktop' as Viewport]))
	);

	// Empty when sections disagree, so no page-level button shows as pressed.
	const allMode = $derived.by(() => {
		const values = new Set(Object.values(modes));
		return values.size === 1 ? [...values][0] : '';
	});

	const icons = { phone: SmartphoneIcon, tablet: TabletIcon, desktop: MonitorIcon };

	// The page and the sidebar share this order, so the sidebar highlight moves down as you scroll.
	const groups = [
		{ label: 'Components', items: registry.items.filter((i) => i.type === 'registry:ui') },
		{ label: 'Blocks', items: registry.items.filter((i) => i.type === 'registry:block') }
	].filter((g) => g.items.length);
</script>

<svelte:head>
	<title>m-cn-svelte registry</title>
</svelte:head>

<div id="top" class="min-h-svh bg-background">
	<SiteHeader {groups} />
	<div class="mx-auto flex max-w-screen-2xl gap-8 px-4 sm:px-6">
		<aside
			class="sticky top-12 hidden h-[calc(100svh-3rem)] w-52 shrink-0 overflow-y-auto border-r py-6 pr-4 lg:block"
		>
			<SiteSidebar {groups} />
		</aside>
		<main class="flex min-w-0 flex-1 flex-col gap-6 py-6">
			<div class="flex flex-wrap items-end justify-between gap-3">
				<div class="flex flex-col gap-1">
					<h1 class="text-lg font-semibold tracking-tight">m-cn-svelte registry</h1>
					<p class="text-xs text-muted-foreground">
						shadcn-svelte components on Bits UI, style mira, icons lucide.
					</p>
				</div>
				<div class="flex items-center gap-2">
					<span class="text-xs text-muted-foreground">All sections</span>
					<ToggleGroup.Root
						type="single"
						variant="outline"
						size="sm"
						aria-label="Preview width for all sections"
						bind:value={
							() => allMode,
							(v) => {
								if (!v) return;
								for (const name of Object.keys(modes)) modes[name] = v as Viewport;
							}
						}
					>
						{#each viewports as option (option.value)}
							{@const Icon = icons[option.value]}
							<ToggleGroup.Item value={option.value} aria-label={option.label}>
								<Icon />
								<span class="hidden sm:inline">{option.label}</span>
							</ToggleGroup.Item>
						{/each}
					</ToggleGroup.Root>
				</div>
			</div>

			{#each groups as group (group.label)}
				<h2 class="pt-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">
					{group.label}
				</h2>
				{#each group.items as item (item.name)}
					<section id={item.name} class="flex scroll-mt-16 flex-col gap-3 rounded-lg border p-4">
						<div class="flex flex-col gap-0.5">
							<h3 class="text-sm font-medium">{item.title}</h3>
							<p class="text-xs text-muted-foreground">{item.description}</p>
						</div>
						<PreviewFrame name={item.name} title={item.title} bind:viewport={modes[item.name]} />
						<div class="flex items-center gap-2">
							<code class="min-w-0 flex-1 truncate font-mono text-xs"
								>{installCommand(item.name)}</code
							>
							<CopyButton value={installCommand(item.name)} />
						</div>
					</section>
				{/each}
			{/each}
		</main>
	</div>
</div>
