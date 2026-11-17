<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import { resolve } from '$app/paths';
	import { groups } from '../groups.js';
</script>

<svelte:head>
	<title>m-cn-svelte registry</title>
</svelte:head>

<div class="flex flex-col gap-1">
	<h1 class="text-lg font-semibold tracking-tight">m-cn-svelte registry</h1>
	<p class="text-xs text-muted-foreground">
		shadcn-svelte components on Bits UI, style mira, icons lucide.
	</p>
</div>

{#each groups as group (group.label)}
	<section class="flex flex-col gap-3">
		<h2 class="pt-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">
			{group.label}
		</h2>
		<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
			{#each group.items as item (item.name)}
				<!-- Item pages set trailingSlash: 'always', so link straight to the folder index. -->
				<a
					href="{resolve('/(docs)/components/[name]', { name: item.name })}/"
					class="group flex flex-col gap-1 rounded-lg border p-4 transition-colors hover:bg-muted/50"
				>
					<span class="flex items-center justify-between gap-2 text-sm font-medium">
						{item.title}
						<ArrowRightIcon
							class="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5"
						/>
					</span>
					<span class="line-clamp-2 text-xs text-muted-foreground">{item.description}</span>
				</a>
			{/each}
		</div>
	</section>
{/each}
