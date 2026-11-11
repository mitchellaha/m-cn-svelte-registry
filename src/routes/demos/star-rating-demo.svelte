<script lang="ts">
	import * as StarRating from '$lib/registry/ui/star-rating/index.js';

	let value = $state(3);
	let half = $state(3.5);
</script>

{#snippet stars(items: { index: number; state: 'active' | 'partial' | 'inactive' }[], cls = '')}
	{#each items as item (item.index)}
		<StarRating.Star {...item} class={cls} />
	{/each}
{/snippet}

<div class="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 p-4">
	<StarRating.Root bind:value>
		{#snippet children({ items })}{@render stars(items)}{/snippet}
	</StarRating.Root>
	<StarRating.Root bind:value={half} allowHalf>
		{#snippet children({ items })}{@render stars(items)}{/snippet}
	</StarRating.Root>
	<StarRating.Root value={4} readonly>
		{#snippet children({ items })}{@render stars(items, 'text-amber-500')}{/snippet}
	</StarRating.Root>
	<StarRating.Root value={2} max={3}>
		{#snippet children({ items })}{@render stars(items, 'size-7')}{/snippet}
	</StarRating.Root>
</div>
