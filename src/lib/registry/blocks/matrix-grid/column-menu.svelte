<script lang="ts">
	import Columns3Icon from '@lucide/svelte/icons/columns-3';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.js';

	type Figure = { id: string; header: string; band: string };

	/** Picks the figure columns, listed under their bands. A band's label toggles the whole band. */
	let {
		figures,
		shown,
		onChange
	}: { figures: Figure[]; shown: string[]; onChange: (shown: string[]) => void } = $props();

	const groups = $derived.by(() => {
		const out: { band: string; figures: Figure[] }[] = [];
		for (const f of figures) {
			const g = out.find((x) => x.band === f.band);
			if (g) g.figures.push(f);
			else out.push({ band: f.band, figures: [f] });
		}
		return out;
	});

	// Keep catalog order whatever order the boxes are ticked in.
	const set = (ids: string[]) =>
		onChange(figures.map((f) => f.id).filter((id) => ids.includes(id)));

	const toggle = (id: string, on: boolean) =>
		set(on ? [...shown, id] : shown.filter((x) => x !== id));

	function toggleBand(band: Figure[]) {
		const ids = band.map((f) => f.id);
		const allOn = ids.every((id) => shown.includes(id));
		set(allOn ? shown.filter((id) => !ids.includes(id)) : [...shown, ...ids]);
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline" size="sm">
				<Columns3Icon data-icon="inline-start" />
				Columns
				<Badge variant="secondary" class="h-4 px-1.5 tabular-nums">{shown.length}</Badge>
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="start" class="max-h-96 w-60">
		{#each groups as g, i (g.band)}
			{#if i > 0}<DropdownMenu.Separator />{/if}
			<DropdownMenu.Group>
				<DropdownMenu.Item
					closeOnSelect={false}
					class="text-xs font-medium text-muted-foreground"
					onSelect={() => toggleBand(g.figures)}
				>
					{g.band}
					<span class="ml-auto text-[0.65rem] font-normal">
						{g.figures.every((f) => shown.includes(f.id)) ? 'Hide all' : 'Show all'}
					</span>
				</DropdownMenu.Item>
				{#each g.figures as f (f.id)}
					<DropdownMenu.CheckboxItem
						checked={shown.includes(f.id)}
						closeOnSelect={false}
						onCheckedChange={(on) => toggle(f.id, on)}
					>
						{f.header}
					</DropdownMenu.CheckboxItem>
				{/each}
			</DropdownMenu.Group>
		{/each}
		{#if shown.length}
			<DropdownMenu.Separator />
			<DropdownMenu.Item onSelect={() => onChange([])}>Hide all columns</DropdownMenu.Item>
		{/if}
	</DropdownMenu.Content>
</DropdownMenu.Root>
