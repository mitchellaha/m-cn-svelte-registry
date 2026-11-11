<script lang="ts" module>
	import type { BomNode } from './types.js';

	export type BomTreeGridProps = {
		title?: string;
		product?: string;
		revision?: string;
		date?: string;
		data: BomNode[];
	};
</script>

<script lang="ts">
	import {
		type ColumnDef,
		type ColumnFiltersState,
		type ColumnVisibilityState,
		type ExpandedState,
		type SortingState,
		columnFilteringFeature,
		columnSizingFeature,
		columnVisibilityFeature,
		createExpandedRowModel,
		createFilteredRowModel,
		createSortedRowModel,
		createTable,
		functionalUpdate,
		globalFilteringFeature,
		rowExpandingFeature,
		rowSortingFeature,
		sortFn_alphanumeric,
		sortFn_basic,
		sortFn_text,
		tableFeatures
	} from '@tanstack/svelte-table';
	import ArrowDownIcon from '@lucide/svelte/icons/arrow-down';
	import ArrowUpIcon from '@lucide/svelte/icons/arrow-up';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import SearchIcon from '@lucide/svelte/icons/search';
	import SlidersHorizontalIcon from '@lucide/svelte/icons/sliders-horizontal';
	import TruckIcon from '@lucide/svelte/icons/truck';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as ButtonGroup from '#lib/components/ui/button-group/index.js';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import * as InputGroup from '#lib/components/ui/input-group/index.js';
	import * as Popover from '#lib/components/ui/popover/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import { Switch } from '#lib/components/ui/switch/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import * as ToggleGroup from '#lib/components/ui/toggle-group/index.js';
	import { cn } from '#lib/utils.js';
	import { IconTile } from '$lib/registry/ui/icon-tile/index.js';
	import {
		ALL_SUPPLY,
		SUPPLY_LABEL,
		SUPPLY_TONE,
		TONE_CLASS,
		buildBom,
		expandedToDepth,
		money,
		toCsv
	} from './bom.js';
	import { ICONS } from './icons.js';
	import type { BomRow, Supply } from './types.js';

	let {
		title = 'Bill Of Materials',
		product = 'Meridian C2 Cargo',
		revision = 'Rev C',
		date = '24 Jul 2026',
		data
	}: BomTreeGridProps = $props();

	const DEPTH_OPTIONS = [
		['collapse', 'Collapse'],
		['1', '1'],
		['2', '2'],
		['all', 'All']
	] as const;

	const DENSITY_ITEMS = [
		{ value: 'comfortable', label: 'Comfortable' },
		{ value: 'compact', label: 'Compact' }
	];

	/** Columns the Display popover can hide. Part, cost and actions always show. */
	const OPTIONAL_COLUMNS = [
		['number', 'Number'],
		['unitCost', 'Unit Cost'],
		['leadTimeDays', 'Lead Time'],
		['supply', 'Supply']
	] as const;

	const END_ALIGNED = new Set(['qty', 'unitCost', 'extendedCost']);

	const bom = $derived(buildBom(data));

	let search = $state('');
	let sorting = $state.raw<SortingState>([]);
	let expanded = $state.raw<ExpandedState>(true);
	let supplyFilter = $state.raw<Supply[]>([]);
	let density = $state<'comfortable' | 'compact'>('comfortable');
	let partDetail = $state(false);
	let columnVisibility = $state.raw<ColumnVisibilityState>({});

	const columnFilters = $derived<ColumnFiltersState>(
		supplyFilter.length ? [{ id: 'supply', value: supplyFilter }] : []
	);

	const features = tableFeatures({
		columnFilteringFeature,
		columnSizingFeature,
		columnVisibilityFeature,
		globalFilteringFeature,
		rowExpandingFeature,
		rowSortingFeature,
		expandedRowModel: createExpandedRowModel(),
		filteredRowModel: createFilteredRowModel(),
		sortedRowModel: createSortedRowModel(),
		sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic, text: sortFn_text }
	});

	// Cells render from the template by column id, so the defs stay static.
	const columns: ColumnDef<typeof features, BomRow>[] = [
		{ accessorKey: 'name', id: 'name', header: 'Part', minSize: 300, enableHiding: false },
		{ accessorKey: 'number', id: 'number', header: 'Number', size: 120 },
		{ accessorKey: 'qty', id: 'qty', header: 'Qty', size: 70 },
		{ accessorKey: 'unitCost', id: 'unitCost', header: 'Unit Cost', size: 110 },
		{
			accessorKey: 'extendedCost',
			id: 'extendedCost',
			header: 'Extended Cost',
			size: 170
		},
		{ accessorKey: 'leadTimeDays', id: 'leadTimeDays', header: 'Lead Time', size: 120 },
		{
			accessorKey: 'supply',
			id: 'supply',
			header: 'Supply',
			size: 140,
			filterFn: (row, id, value: Supply[]) =>
				value.length === 0 || value.includes(row.getValue<Supply>(id))
		},
		{ id: 'actions', header: '', size: 48, enableSorting: false, enableHiding: false }
	];

	const table = createTable({
		features,
		columns,
		get data() {
			return bom.rows;
		},
		getRowId: (row) => row.id,
		getSubRows: (row) => row.children,
		filterFromLeafRows: true,
		// Expand state is owned here. Left on, the Svelte adapter's option sync
		// triggers TanStack's auto reset and wipes every toggle.
		autoResetExpanded: false,
		globalFilterFn: (row, _id, value: string) => {
			const q = value.trim().toLowerCase();
			return (
				!q ||
				row.original.name.toLowerCase().includes(q) ||
				row.original.number.toLowerCase().includes(q)
			);
		},
		state: {
			get sorting() {
				return sorting;
			},
			get columnFilters() {
				return columnFilters;
			},
			get columnVisibility() {
				return columnVisibility;
			},
			get globalFilter() {
				return search;
			},
			// A search must reveal every match, so it overrides the depth toggle.
			get expanded() {
				return search ? true : expanded;
			}
		},
		onSortingChange: (updater) => (sorting = functionalUpdate(updater, sorting)),
		onExpandedChange: (updater) => (expanded = functionalUpdate(updater, expanded)),
		onColumnVisibilityChange: (updater) =>
			(columnVisibility = functionalUpdate(updater, columnVisibility))
	});

	const depthValue = $derived.by(() => {
		if (expanded === true) return 'all';
		const map = expanded;
		const keys = Object.keys(map).filter((k) => map[k]);
		if (keys.length === 0) return 'collapse';
		for (const d of [1, 2]) {
			const want = Object.keys(expandedToDepth(bom.flat, d));
			if (want.length === keys.length && want.every((k) => keys.includes(k))) return String(d);
		}
		return '';
	});

	const shownOptional = $derived(
		OPTIONAL_COLUMNS.map(([id]) => id as string).filter((id) => columnVisibility[id] !== false)
	);

	const cellPad = $derived(density === 'compact' ? 'px-3 py-1' : 'px-3 py-2');

	function setDepth(value: (typeof DEPTH_OPTIONS)[number][0]) {
		if (value === 'collapse') expanded = {};
		else if (value === 'all') expanded = true;
		else expanded = expandedToDepth(bom.flat, Number(value));
	}

	function toggleSupply(s: Supply, on: boolean) {
		supplyFilter = on ? [...supplyFilter, s] : supplyFilter.filter((x) => x !== s);
	}

	function exportCsv() {
		const blob = new Blob([toCsv(bom.flat)], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${product.replaceAll(' ', '-').toLowerCase()}-bom.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}

	const RING_R = 7;
	const RING_C = 2 * Math.PI * RING_R;
</script>

{#snippet shareRing(share: number)}
	<span class="inline-flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
		<svg viewBox="0 0 18 18" class="size-4 -rotate-90" aria-hidden="true">
			<circle cx="9" cy="9" r={RING_R} fill="none" stroke-width="2" class="stroke-muted" />
			<circle
				cx="9"
				cy="9"
				r={RING_R}
				fill="none"
				stroke-width="2"
				stroke-linecap="round"
				stroke-dasharray="{RING_C * share} {RING_C}"
				class="stroke-foreground"
			/>
		</svg>
		{(share * 100).toFixed(share < 0.1 ? 1 : 0)}%
	</span>
{/snippet}

{#snippet supplyBadge(s: Supply)}
	<Badge variant="outline" class={TONE_CLASS[SUPPLY_TONE[s]]}>{SUPPLY_LABEL[s]}</Badge>
{/snippet}

<div data-slot="frame" class="flex w-full flex-col rounded-xl border bg-muted/40 p-1">
	<div
		data-slot="frame-header"
		class="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5"
	>
		<div class="flex flex-col gap-0.5">
			<h3 class="text-sm font-semibold text-foreground">{title}</h3>
			<p class="text-xs text-muted-foreground">{product} · {revision} · {date}</p>
		</div>
		<div class="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
			<span class="inline-flex items-center gap-1.5">
				Build cost <Badge variant="outline">{money(bom.buildCost)}</Badge>
			</span>
			<span class="inline-flex items-center gap-1.5">
				Critical path <Badge variant="outline">{bom.criticalPathDays}d</Badge>
			</span>
			<span class="inline-flex items-center gap-1.5">
				At risk <Badge variant="outline" class={TONE_CLASS.warning}>{bom.atRisk}</Badge>
			</span>
			<Button variant="outline" size="sm" onclick={exportCsv}>
				<DownloadIcon data-icon="inline-start" />
				Export
			</Button>
		</div>
	</div>

	<div
		data-slot="frame-panel"
		class="flex flex-col gap-3 rounded-lg border bg-background p-3 shadow-xs"
	>
		<div class="flex flex-wrap items-center justify-between gap-2">
			<InputGroup.Root class="w-full max-w-sm">
				<InputGroup.Addon>
					<SearchIcon />
				</InputGroup.Addon>
				<InputGroup.Input placeholder="Search parts..." bind:value={search} />
			</InputGroup.Root>

			<div class="flex flex-wrap items-center gap-2">
				<ButtonGroup.Root aria-label="Tree depth">
					<ButtonGroup.Text>Depth</ButtonGroup.Text>
					{#each DEPTH_OPTIONS as [value, label] (value)}
						<Button
							variant="outline"
							size="sm"
							aria-pressed={depthValue === value}
							class="aria-pressed:bg-muted aria-pressed:text-foreground"
							onclick={() => setDepth(value)}
						>
							{label}
						</Button>
					{/each}
				</ButtonGroup.Root>

				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="outline" size="sm">
								<TruckIcon data-icon="inline-start" />
								Supply
								{#if supplyFilter.length}
									<Badge variant="secondary" class="h-4 px-1.5">{supplyFilter.length}</Badge>
								{/if}
							</Button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end" class="w-auto">
						<DropdownMenu.Group>
							<DropdownMenu.Label>Supply status</DropdownMenu.Label>
							{#each ALL_SUPPLY as s (s)}
								<DropdownMenu.CheckboxItem
									checked={supplyFilter.includes(s)}
									onCheckedChange={(on) => toggleSupply(s, on)}
								>
									{@render supplyBadge(s)}
								</DropdownMenu.CheckboxItem>
							{/each}
						</DropdownMenu.Group>
					</DropdownMenu.Content>
				</DropdownMenu.Root>

				<Popover.Root>
					<Popover.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="outline" size="sm">
								<SlidersHorizontalIcon data-icon="inline-start" />
								Display
							</Button>
						{/snippet}
					</Popover.Trigger>
					<Popover.Content align="end" class="flex w-72 flex-col gap-3 p-3">
						<div class="flex flex-col gap-3">
							<span class="text-xs font-medium text-muted-foreground">Table</span>
							<Field.Field orientation="horizontal">
								<Field.Label for="bom-density">Density</Field.Label>
								<Select.Root
									type="single"
									items={DENSITY_ITEMS}
									value={density}
									onValueChange={(v) => (density = v as 'comfortable' | 'compact')}
								>
									<Select.Trigger id="bom-density" size="sm" class="w-36">
										<Select.Value />
									</Select.Trigger>
									<Select.Content align="end">
										{#each DENSITY_ITEMS as item (item.value)}
											<Select.Item value={item.value} label={item.label}>{item.label}</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							</Field.Field>
							<Field.Field orientation="horizontal">
								<Field.Label for="bom-part-detail">Part detail</Field.Label>
								<Switch id="bom-part-detail" bind:checked={partDetail} />
							</Field.Field>
						</div>
						<div class="-mx-3 border-t"></div>
						<div class="flex flex-col gap-2">
							<span class="text-xs font-medium text-muted-foreground">Display properties</span>
							<ToggleGroup.Root
								type="multiple"
								variant="outline"
								size="sm"
								spacing={1}
								class="flex-wrap"
								value={shownOptional}
								onValueChange={(shown: string[]) =>
									(columnVisibility = Object.fromEntries(
										OPTIONAL_COLUMNS.map(([id]) => [id, shown.includes(id)])
									))}
							>
								{#each OPTIONAL_COLUMNS as [id, label] (id)}
									<ToggleGroup.Item value={id} class="rounded-full">
										{#if columnVisibility[id] !== false}
											<CheckIcon />
										{/if}
										{label}
									</ToggleGroup.Item>
								{/each}
							</ToggleGroup.Root>
						</div>
					</Popover.Content>
				</Popover.Root>
			</div>
		</div>

		<div class="overflow-hidden rounded-lg border">
			<Table.Root>
				<Table.Header class="bg-muted/40">
					{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
						<Table.Row class="hover:bg-transparent">
							{#each headerGroup.headers as header (header.id)}
								{@const column = header.column}
								{@const sorted = column.getIsSorted()}
								<Table.Head
									colspan={header.colSpan}
									aria-sort={sorted === 'asc'
										? 'ascending'
										: sorted === 'desc'
											? 'descending'
											: undefined}
									class={cn(
										'h-9 px-3 text-muted-foreground',
										END_ALIGNED.has(column.id) && 'text-end'
									)}
									style={column.id === 'name'
										? `min-width: ${column.columnDef.minSize}px`
										: `width: ${header.getSize()}px`}
								>
									{#if column.id === 'actions'}
										<span class="sr-only">Actions</span>
									{:else if column.getCanSort()}
										<button
											type="button"
											class={cn(
												'-mx-1 inline-flex items-center gap-1 rounded-sm px-1 py-0.5 font-medium outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/30 [&_svg]:size-3',
												sorted && 'text-foreground',
												END_ALIGNED.has(column.id) && 'flex-row-reverse'
											)}
											onclick={column.getToggleSortingHandler()}
										>
											{column.columnDef.header}
											{#if sorted === 'asc'}
												<ArrowUpIcon />
											{:else if sorted === 'desc'}
												<ArrowDownIcon />
											{:else}
												<ChevronsUpDownIcon class="opacity-50" />
											{/if}
										</button>
									{:else}
										{column.columnDef.header}
									{/if}
								</Table.Head>
							{/each}
						</Table.Row>
					{/each}
				</Table.Header>

				<Table.Body>
					{#each table.getRowModel().rows as row (row.id)}
						{@const r = row.original}
						<Table.Row class="has-aria-expanded:bg-transparent has-aria-expanded:hover:bg-muted/50">
							{#each row.getVisibleCells() as cell (cell.id)}
								<Table.Cell class={cn(cellPad, END_ALIGNED.has(cell.column.id) && 'text-end')}>
									{#if cell.column.id === 'name'}
										{@const Icon = ICONS[r.icon]}
										<div
											class="flex items-center gap-2"
											style="padding-inline-start: {row.depth * 1.25}rem"
										>
											{#if row.getCanExpand()}
												<Button
													variant="ghost"
													size="icon-xs"
													class="-ms-1.5"
													aria-label={row.getIsExpanded()
														? `Collapse ${r.name}`
														: `Expand ${r.name}`}
													aria-expanded={row.getIsExpanded()}
													onclick={row.getToggleExpandedHandler()}
												>
													<ChevronRightIcon
														class={cn('transition-transform', row.getIsExpanded() && 'rotate-90')}
													/>
												</Button>
											{:else}
												<span class="-ms-1.5 size-5 shrink-0" aria-hidden="true"></span>
											{/if}
											<IconTile size="sm">
												<Icon />
											</IconTile>
											<span class="flex min-w-0 flex-col leading-tight">
												<span class="truncate font-medium text-foreground">{r.name}</span>
												{#if partDetail}
													<span class="truncate font-mono text-[11px] text-muted-foreground">
														{r.number} · {r.qty} × {SUPPLY_LABEL[r.supply]}
													</span>
												{/if}
											</span>
										</div>
									{:else if cell.column.id === 'number'}
										<span class="font-mono text-xs text-muted-foreground">{r.number}</span>
									{:else if cell.column.id === 'qty'}
										<span class="tabular-nums">{r.qty}</span>
									{:else if cell.column.id === 'unitCost'}
										{#if r.unitCost === undefined}
											<span class="text-muted-foreground">--</span>
										{:else}
											<span class="tabular-nums">{money(r.unitCost)}</span>
										{/if}
									{:else if cell.column.id === 'extendedCost'}
										<span class="inline-flex items-center justify-end gap-2 tabular-nums">
											{#if r.children}
												{@render shareRing(r.share)}
											{/if}
											<span class="font-medium text-foreground">{money(r.extendedCost)}</span>
										</span>
									{:else if cell.column.id === 'leadTimeDays'}
										<Badge
											variant="outline"
											class={r.leadTimeDays === bom.criticalPathDays ? TONE_CLASS.warning : ''}
										>
											<ClockIcon />
											{r.leadTimeDays}d
										</Badge>
									{:else if cell.column.id === 'supply'}
										{@render supplyBadge(r.supply)}
									{:else if cell.column.id === 'actions'}
										<DropdownMenu.Root>
											<DropdownMenu.Trigger>
												{#snippet child({ props })}
													<Button
														{...props}
														size="icon-xs"
														variant="ghost"
														aria-label="Actions for {r.name}"
													>
														<EllipsisIcon />
													</Button>
												{/snippet}
											</DropdownMenu.Trigger>
											<DropdownMenu.Content align="end">
												<DropdownMenu.Item>View part</DropdownMenu.Item>
												<DropdownMenu.Item onSelect={() => navigator.clipboard.writeText(r.number)}>
													Copy number
												</DropdownMenu.Item>
												<DropdownMenu.Separator />
												<DropdownMenu.Item variant="destructive">Flag as at risk</DropdownMenu.Item>
											</DropdownMenu.Content>
										</DropdownMenu.Root>
									{/if}
								</Table.Cell>
							{/each}
						</Table.Row>
					{:else}
						<Table.Row class="hover:bg-transparent">
							<Table.Cell
								colspan={table.getVisibleLeafColumns().length}
								class="h-24 text-center text-muted-foreground"
							>
								No parts match.
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>

				<Table.Footer>
					<Table.Row class="hover:bg-transparent">
						{#each table.getVisibleLeafColumns() as column (column.id)}
							{#if column.id === 'name'}
								<Table.Cell class={cellPad}>
									<span class="inline-flex items-center gap-2 font-medium text-foreground">
										{product}
										<Badge variant="outline">{bom.lineCount} lines</Badge>
									</span>
								</Table.Cell>
							{:else if column.id === 'extendedCost'}
								<Table.Cell class={cn(cellPad, 'text-end font-semibold tabular-nums')}>
									{money(bom.buildCost)}
								</Table.Cell>
							{:else if column.id === 'leadTimeDays'}
								<Table.Cell class={cn(cellPad, 'font-semibold tabular-nums')}>
									{bom.criticalPathDays}d
								</Table.Cell>
							{:else}
								<Table.Cell class={cellPad}></Table.Cell>
							{/if}
						{/each}
					</Table.Row>
				</Table.Footer>
			</Table.Root>
		</div>
	</div>
</div>
