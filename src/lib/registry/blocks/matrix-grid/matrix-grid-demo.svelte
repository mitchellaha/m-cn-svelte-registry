<script lang="ts">
	import MailIcon from '@lucide/svelte/icons/mail';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.js';
	import MatrixGrid from './matrix-grid.svelte';
	import { storeSchema, stores } from './matrix-grid-data.js';

	let grouping = $state(['region', 'district']);
	let columns = $state([
		'm-sales',
		'm-margin',
		'm-margin-pct',
		'm-orders',
		'y-sales',
		'y-margin-pct',
		'plan',
		'attainment',
		'variance'
	]);
	let selected = $state<string[]>([]);

	const copy = (text: string) => navigator.clipboard?.writeText(text).catch(() => {});
	const managers = (rows: { manager: string }[]) => new Set(rows.map((s) => s.manager)).size;
</script>

<!-- grouping, columns and selected are bound, so a page could store them in the URL or a preference. -->
<MatrixGrid
	data={stores}
	schema={storeSchema}
	bind:grouping
	bind:columns
	bind:selected
	selectable
	searchPlaceholder="Search stores, managers..."
	exportFileName="stores.csv"
	height={560}
>
	{#snippet rowActions(store)}
		<DropdownMenu.Group>
			<DropdownMenu.Label>{store.id}</DropdownMenu.Label>
			<DropdownMenu.Item onSelect={() => copy(store.id)}>Copy store ID</DropdownMenu.Item>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Item>View store</DropdownMenu.Item>
		<DropdownMenu.Item>Email {store.manager}</DropdownMenu.Item>
	{/snippet}
	{#snippet groupActions({ label, rows })}
		<DropdownMenu.Label>{label} · {rows.length} stores</DropdownMenu.Label>
		<DropdownMenu.Item onSelect={() => (selected = rows.map((s) => s.id))}>
			Select only these
		</DropdownMenu.Item>
	{/snippet}
	{#snippet selectionActions(rows)}
		<Button variant="outline" size="xs">
			<MailIcon data-icon="inline-start" />
			Email {managers(rows)} managers
		</Button>
	{/snippet}
</MatrixGrid>
