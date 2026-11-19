<script lang="ts" module>
	import type { Snippet } from 'svelte';

	export type SidePanelProps = {
		open?: boolean;
		title: string;
		description?: string;
		/** Buttons in the header, before the close button. */
		actions?: Snippet;
		children?: Snippet;
		/** Panel width when docked. */
		width?: string;
		/** Docks beside the page at this width and up; below it the panel is a sheet. */
		dockQuery?: string;
		closeLabel?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import XIcon from '@lucide/svelte/icons/x';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Sheet from '#lib/components/ui/sheet/index.js';
	import { cn } from '#lib/utils.js';

	let {
		open = $bindable(false),
		title,
		description,
		actions,
		children,
		width = '22rem',
		dockQuery = 'min-width: 1024px',
		closeLabel = 'Close',
		class: className
	}: SidePanelProps = $props();

	// False during prerender, so the server renders the closed sheet and nothing else.
	const docked = $derived(new MediaQuery(dockQuery, false));
</script>

{#snippet body(sheet: boolean)}
	<div class="flex h-12 shrink-0 items-center gap-1 border-b ps-4 pe-2">
		<div class="min-w-0 flex-1">
			{#if sheet}
				<Sheet.Title class="truncate text-sm font-semibold">{title}</Sheet.Title>
			{:else}
				<h2 class="truncate text-sm font-semibold">{title}</h2>
			{/if}
		</div>
		{@render actions?.()}
		<Button variant="ghost" size="icon-sm" aria-label={closeLabel} onclick={() => (open = false)}>
			<XIcon />
		</Button>
	</div>
	{#if description && !sheet}<p class="sr-only">{description}</p>{/if}
	<div class="flex min-h-0 flex-1 flex-col overflow-y-auto">
		{@render children?.()}
	</div>
{/snippet}

{#if docked.current}
	{#if open}
		<aside
			data-slot="side-panel"
			aria-label={title}
			class={cn('flex shrink-0 flex-col overflow-hidden bg-background', className)}
			style:width
		>
			{@render body(false)}
		</aside>
	{/if}
{:else}
	<Sheet.Root bind:open>
		<Sheet.Content
			data-slot="side-panel"
			side="right"
			showCloseButton={false}
			class="w-full gap-0 p-0 sm:max-w-(--side-panel-width)"
			style="--side-panel-width: {width}"
		>
			{#if description}
				<Sheet.Description class="sr-only">{description}</Sheet.Description>
			{/if}
			{@render body(true)}
		</Sheet.Content>
	</Sheet.Root>
{/if}
