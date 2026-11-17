<script lang="ts">
	import Layers3Icon from '@lucide/svelte/icons/layers-3';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.js';

	/** Picks the grouping levels; the order they are ticked in is the nesting order. */
	let {
		dimensions,
		grouping,
		onChange
	}: {
		dimensions: { id: string; label: string }[];
		grouping: string[];
		onChange: (grouping: string[]) => void;
	} = $props();

	const toggle = (id: string, on: boolean) =>
		onChange(on ? [...grouping, id] : grouping.filter((g) => g !== id));
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline" size="sm">
				<Layers3Icon data-icon="inline-start" />
				Group
				{#if grouping.length}
					<Badge variant="secondary" class="h-4 px-1.5">{grouping.length}</Badge>
				{/if}
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="start" class="w-56">
		<DropdownMenu.Group>
			<DropdownMenu.Label>Group rows by</DropdownMenu.Label>
			{#each dimensions as d (d.id)}
				{@const level = grouping.indexOf(d.id)}
				<DropdownMenu.CheckboxItem
					checked={level >= 0}
					closeOnSelect={false}
					onCheckedChange={(on) => toggle(d.id, on)}
				>
					<span class="flex-1">{d.label}</span>
					{#if level >= 0}
						<span class="text-xs text-muted-foreground tabular-nums">Level {level + 1}</span>
					{/if}
				</DropdownMenu.CheckboxItem>
			{/each}
		</DropdownMenu.Group>
		{#if grouping.length}
			<DropdownMenu.Separator />
			<DropdownMenu.Item onSelect={() => onChange([])}>Ungroup</DropdownMenu.Item>
		{/if}
	</DropdownMenu.Content>
</DropdownMenu.Root>
