<script lang="ts">
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
	import { resolve } from '$app/paths';
	import { cn } from '#lib/utils.js';
	import { demos } from '../demos/index.js';
	import { groups } from '../groups.js';
	import SiteHeader from '../site-header.svelte';

	// CSS columns pack tiles of mixed heights without gaps. Composites get fewer, wider columns.
	const columns: Record<string, string> = {
		Components: 'sm:columns-2 xl:columns-3',
		Composites: 'xl:columns-2'
	};
</script>

<svelte:head>
	<title>Kitchen sink · m-cn-svelte registry</title>
</svelte:head>

<div class="min-h-svh bg-muted/40">
	<SiteHeader />
	<main class="mx-auto flex max-w-screen-2xl flex-col gap-6 px-4 py-6 sm:px-6">
		{#each groups as group (group.label)}
			<div class={cn('columns-1 gap-4', columns[group.label])}>
				{#each group.items as item (item.name)}
					{@const demo = demos[item.name]}
					<section
						id={item.name}
						class="mb-4 flex min-w-0 scroll-mt-16 break-inside-avoid flex-col overflow-hidden rounded-lg border bg-background"
					>
						<a
							href="{resolve('/')}#{item.name}"
							class="group flex items-center justify-between gap-2 border-b px-3 py-2 text-xs"
						>
							<span class="font-medium">{item.title}</span>
							<ArrowUpRightIcon
								class="size-3.5 text-muted-foreground transition-colors group-hover:text-foreground"
							/>
						</a>
						{#if demo}
							<div class={cn('overflow-x-auto', demo.padded && 'p-4')}>
								<demo.component />
							</div>
						{/if}
					</section>
				{/each}
			</div>
		{/each}
	</main>
</div>
