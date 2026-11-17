<script lang="ts">
	import { cn } from '#lib/utils.js';

	type Group = { label: string; items: { name: string; title: string }[] };

	let { groups, onnavigate }: { groups: Group[]; onnavigate?: () => void } = $props();

	const names = $derived(groups.flatMap((g) => g.items.map((i) => i.name)));
	let active = $state('');

	// Active = the last section whose top has passed under the header; the last one once scrolled to the bottom.
	function update() {
		const atBottom =
			window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
		if (atBottom) {
			active = names[names.length - 1] ?? '';
			return;
		}
		let current = names[0] ?? '';
		for (const name of names) {
			const el = document.getElementById(name);
			if (el && el.getBoundingClientRect().top <= 80) current = name;
		}
		active = current;
	}

	$effect(() => {
		update();
	});
</script>

<svelte:window onscroll={update} onresize={update} />

<nav aria-label="Registry items" class="flex flex-col gap-5 text-xs">
	{#each groups as group (group.label)}
		<div class="flex flex-col gap-1">
			<p class="px-2 pb-1 text-[0.65rem] font-semibold tracking-wider text-foreground uppercase">
				{group.label}
			</p>
			{#each group.items as item (item.name)}
				<a
					href="#{item.name}"
					aria-current={active === item.name ? 'location' : undefined}
					onclick={onnavigate}
					class={cn(
						'rounded-md px-2 py-1 text-foreground/70 transition-colors hover:bg-muted hover:text-foreground',
						active === item.name && 'bg-muted font-medium text-foreground'
					)}
				>
					{item.title}
				</a>
			{/each}
		</div>
	{/each}
</nav>
