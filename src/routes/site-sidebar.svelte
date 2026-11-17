<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { cn } from '#lib/utils.js';

	type Group = { label: string; items: { name: string; title: string }[] };

	let { groups, onnavigate }: { groups: Group[]; onnavigate?: () => void } = $props();
</script>

<nav aria-label="Registry items" class="flex flex-col gap-5 text-xs">
	{#each groups as group (group.label)}
		<div class="flex flex-col gap-1">
			<p class="px-2 pb-1 text-[0.65rem] font-semibold tracking-wider text-foreground uppercase">
				{group.label}
			</p>
			{#each group.items as item (item.name)}
				{@const active = page.params.name === item.name}
				<!-- Item pages set trailingSlash: 'always', so link straight to the folder index. -->
				<a
					href="{resolve('/(docs)/components/[name]', { name: item.name })}/"
					aria-current={active ? 'page' : undefined}
					onclick={onnavigate}
					class={cn(
						'rounded-md px-2 py-1 text-foreground/70 transition-colors hover:bg-muted hover:text-foreground',
						active && 'bg-muted font-medium text-foreground'
					)}
				>
					{item.title}
				</a>
			{/each}
		</div>
	{/each}
</nav>
