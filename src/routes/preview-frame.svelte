<script lang="ts">
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import MonitorIcon from '@lucide/svelte/icons/monitor';
	import SmartphoneIcon from '@lucide/svelte/icons/smartphone';
	import TabletIcon from '@lucide/svelte/icons/tablet';
	import { resolve } from '$app/paths';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as ToggleGroup from '#lib/components/ui/toggle-group/index.js';
	import { cn } from '#lib/utils.js';
	import { demos, viewports, type Viewport } from './demos/index.js';

	let {
		name,
		title,
		viewport = $bindable('desktop')
	}: { name: string; title: string; viewport?: Viewport } = $props();

	const demo = $derived(demos[name]);
	const width = $derived(viewports.find((v) => v.value === viewport)?.width);
	// The route sets trailingSlash: 'always', so link straight to the folder index.
	const src = $derived(`${resolve('/preview/[name]', { name })}/`);
	const icons = { phone: SmartphoneIcon, tablet: TabletIcon, desktop: MonitorIcon };
</script>

<div class="flex flex-col gap-2">
	<div class="flex items-center justify-between gap-2">
		<ToggleGroup.Root
			type="single"
			variant="outline"
			size="sm"
			aria-label="Preview width"
			bind:value={
				() => viewport,
				(v) => {
					// A single toggle group clears on a second click; keep a width selected.
					if (v) viewport = v as Viewport;
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
		<Button variant="ghost" size="sm" href={src} target="_blank" rel="noopener">
			Open
			<ExternalLinkIcon />
		</Button>
	</div>

	{#if width}
		<div class="flex overflow-x-auto rounded-lg border bg-muted/40 p-4 sm:p-6">
			<div
				class={cn(
					'mx-auto shrink-0 overflow-hidden border-foreground/80 bg-background shadow-sm',
					viewport === 'phone' ? 'rounded-[2rem] border-[10px]' : 'rounded-2xl border-8'
				)}
			>
				<iframe
					{src}
					title="{title} at {width}px"
					loading="lazy"
					class="block shrink-0 bg-background"
					style:width="{width}px"
					style:height="{demo?.height ?? 480}px"
				></iframe>
			</div>
		</div>
	{:else if demo}
		<div class={cn('overflow-x-auto rounded-lg border bg-background', demo.padded && 'p-4')}>
			<demo.component />
		</div>
	{/if}
</div>
