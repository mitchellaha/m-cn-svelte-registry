<script lang="ts" module>
	// Data types live in ./types.js; import them from there.
	import type { TreasuryData } from './types.js';

	export interface TreasuryWaterfallGridProps {
		/** Months shown at once. The stepper slides this window over `data.months`. */
		windowSize?: number;
		/** Index of the first month shown. */
		defaultMonthIndex?: number;
		data: TreasuryData;
	}
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import {
		createTable,
		FlexRender,
		type ColumnDef,
		type ExpandedState
	} from '@tanstack/svelte-table';
	import ActivityIcon from '@lucide/svelte/icons/activity';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import CreditCardIcon from '@lucide/svelte/icons/credit-card';
	import FlameIcon from '@lucide/svelte/icons/flame';
	import HandCoinsIcon from '@lucide/svelte/icons/hand-coins';
	import LandmarkIcon from '@lucide/svelte/icons/landmark';
	import PiggyBankIcon from '@lucide/svelte/icons/piggy-bank';
	import ReceiptIcon from '@lucide/svelte/icons/receipt';
	import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
	import UnfoldVerticalIcon from '@lucide/svelte/icons/unfold-vertical';
	import WalletIcon from '@lucide/svelte/icons/wallet';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import * as Tabs from '#lib/components/ui/tabs/index.js';
	import { cn } from '#lib/utils.js';
	import * as DataGrid from '$lib/registry/ui/data-grid/index.js';
	import { IconTile } from '$lib/registry/ui/icon-tile/index.js';
	import AttainmentRing from './attainment-ring.svelte';
	import DeltaBadge from './delta-badge.svelte';
	import GridPagination from './grid-pagination.svelte';
	import VarianceCell from './variance-cell.svelte';
	import {
		ALL_LINES,
		SUMMARY_LABEL,
		TABS,
		buildTreasury,
		deriveSeries,
		matchesQuery,
		money,
		visibleLines
	} from './derive.js';
	import { treasuryFeatures, type TreasuryFeatures } from './table.js';
	import type { Cell, TreasuryIcon, TreasuryRow, TreasuryTab } from './types.js';

	const ICONS: Record<TreasuryIcon, typeof WalletIcon> = {
		wallet: WalletIcon,
		burn: FlameIcon,
		income: TrendingUpIcon,
		expenses: ReceiptIcon,
		funding: LandmarkIcon,
		opening: PiggyBankIcon,
		movement: ActivityIcon,
		collections: HandCoinsIcon,
		outflow: CreditCardIcon
	};

	let { windowSize = 5, defaultMonthIndex = 0, data }: TreasuryWaterfallGridProps = $props();

	let tab = $state<TreasuryTab>('actuals');
	let density = $state<DataGrid.Density>('comfortable');
	const cellPad = $derived(DataGrid.densityCellClass(density));
	let search = $state('');
	const query = $derived(search.trim());
	let group = $state(ALL_LINES);
	let start = $state(
		untrack(() => Math.max(0, Math.min(defaultMonthIndex, data.months.length - windowSize)))
	);
	let expanded = $state.raw<ExpandedState>(
		untrack(() => Object.fromEntries(data.groups.slice(0, 2).map((g) => [g.id, true])))
	);

	// Full-length series depend only on the data; the window and group slice them.
	const series = $derived(deriveSeries(data));
	const treasury = $derived(buildTreasury(data, series, start, windowSize, group));

	const columns = $derived<ColumnDef<TreasuryFeatures, TreasuryRow>[]>([
		{
			accessorKey: 'name',
			id: 'name',
			header: 'Line Item'
		},
		// Display columns: cells render from row.original by month position, and
		// the position-based id keeps column state stable as the window slides.
		...treasury.labels.map<ColumnDef<TreasuryFeatures, TreasuryRow>>((label, i) => ({
			id: `m${i}`,
			header: label
		}))
	]);

	const table = createTable({
		...DataGrid.GRID_TABLE_DEFAULTS,
		features: treasuryFeatures,
		get columns() {
			return columns;
		},
		get data() {
			return treasury.rows;
		},
		getRowId: (row) => row.id,
		getSubRows: (row) => row.children,
		// Pages count groups; a group's lines always render on its page.
		paginateExpandedRows: false,
		filterFromLeafRows: true,
		globalFilterFn: (row, _id, value: string) => matchesQuery(row.original.name, value),
		initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
		state: {
			get globalFilter() {
				return query;
			},
			// A match deep in a group has to be visible, so search wins over expand.
			get expanded() {
				return DataGrid.pinnedExpanded(query, expanded);
			}
		},
		// Ignore toggles while search pins every row open, so clearing the search
		// restores the expand state the user left.
		onExpandedChange: (updater) => {
			if (query) return;
			expanded = typeof updater === 'function' ? updater(expanded) : updater;
		}
	});

	// A new search or group filter starts from the first page.
	$effect(() => {
		void query;
		void group;
		untrack(() => table.setPageIndex(0));
	});

	const lineCount = $derived(
		table.getFilteredRowModel().rows.reduce((n, g) => n + g.subRows.length, 0)
	);

	const allExpanded = $derived(
		expanded === true ||
			(treasury.rows.length > 0 &&
				treasury.rows.every((r) => (expanded as Record<string, boolean>)[r.id]))
	);

	const groupLabel = $derived(
		group === ALL_LINES ? 'All Lines' : (data.groups.find((g) => g.id === group)?.name ?? group)
	);

	const monthWidth = $derived(tab === 'variance' ? 170 : 130);

	const monthOf = (columnId: string) => Number(columnId.slice(1));
</script>

{#snippet amount(cell: Cell, isGroup: boolean)}
	{#if tab === 'variance'}
		<VarianceCell {cell} />
	{:else}
		<span
			class={isGroup
				? 'font-semibold text-foreground tabular-nums'
				: 'text-muted-foreground tabular-nums'}
		>
			{money(tab === 'plan' ? cell.plan : cell.actual)}
		</span>
	{/if}
{/snippet}

{#snippet summaryValue(cell: Cell | undefined, label: string)}
	{#if cell}
		<span class="flex flex-col items-end leading-tight">
			<span class="text-[11px] font-normal whitespace-nowrap text-muted-foreground">{label}</span>
			{@render amount(cell, true)}
		</span>
	{/if}
{/snippet}

{#snippet summaryRow(caption: string, rowTitle: string, cells: Cell[], label: string)}
	<Table.Row class="hover:bg-transparent">
		{#each table.getVisibleLeafColumns() as col (col.id)}
			{#if col.id === 'name'}
				<Table.Cell class={cellPad}>
					<span class="flex flex-col leading-tight">
						<span class="text-[11px] font-normal text-muted-foreground">{caption}</span>
						<span class="font-semibold text-foreground">{rowTitle}</span>
					</span>
				</Table.Cell>
			{:else}
				<Table.Cell class={cn(cellPad, 'text-end')}>
					<!-- Month columns are m{i}: read the month from the id, not the
					     position, so hidden or reordered columns cannot misalign it. -->
					{@render summaryValue(cells[monthOf(col.id)], label)}
				</Table.Cell>
			{/if}
		{/each}
	</Table.Row>
{/snippet}

<DataGrid.Panel>
	<Tabs.Root value={tab} onValueChange={(value) => (tab = value as TreasuryTab)}>
		<div class="flex flex-wrap items-center justify-between gap-2 border-b">
			<Tabs.List variant="line">
				{#each TABS as [value, label] (value)}
					<Tabs.Trigger {value} class="px-2 py-1 text-sm">{label}</Tabs.Trigger>
				{/each}
			</Tabs.List>
			<Button
				variant="ghost"
				size="sm"
				class="mb-1"
				disabled={Boolean(query)}
				onclick={() => (expanded = allExpanded ? {} : true)}
			>
				<UnfoldVerticalIcon data-icon="inline-start" />
				{allExpanded ? 'Collapse All' : 'Expand All'}
			</Button>
		</div>

		<Tabs.Content value={tab} class="flex flex-col gap-3 pt-3">
			<div class="flex flex-wrap items-center justify-between gap-2">
				<div class="flex flex-wrap items-center gap-2">
					<DataGrid.Search class="max-w-64" placeholder="Search Line Items" bind:value={search} />
					<Select.Root type="single" value={group} onValueChange={(value) => (group = value)}>
						<Select.Trigger size="sm" class="w-36" aria-label="Line group">
							{groupLabel}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value={ALL_LINES} label="All Lines" />
							{#each data.groups as g (g.id)}
								<Select.Item value={g.id} label={g.name} />
							{/each}
						</Select.Content>
					</Select.Root>
					<DataGrid.DensitySelect bind:value={density} />
				</div>

				<div class="flex items-center gap-1">
					<Button
						variant="outline"
						size="icon-sm"
						aria-label="Earlier months"
						disabled={start === 0}
						onclick={() => (start = Math.max(0, start - 1))}
					>
						<ChevronLeftIcon />
					</Button>
					<span class="inline-flex items-center gap-1.5 px-2 text-sm text-muted-foreground">
						<CalendarIcon class="size-3.5" />
						{treasury.labels[0]} - {treasury.labels[treasury.labels.length - 1]}
					</span>
					<Button
						variant="outline"
						size="icon-sm"
						aria-label="Later months"
						disabled={start + windowSize >= data.months.length}
						onclick={() => (start = Math.min(data.months.length - windowSize, start + 1))}
					>
						<ChevronRightIcon />
					</Button>
				</div>
			</div>

			<DataGrid.Viewport>
				<Table.Root>
					<Table.Header class="bg-muted/50">
						{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
							<Table.Row class="hover:bg-transparent">
								{#each headerGroup.headers as header (header.id)}
									{@const isName = header.column.id === 'name'}
									<Table.Head
										class={cn(
											'h-9 px-3 text-xs font-medium text-muted-foreground',
											isName ? 'w-full' : 'text-end'
										)}
										style={isName ? 'min-width: 320px' : `min-width: ${monthWidth}px`}
									>
										{#if !header.isPlaceholder}
											<FlexRender {header} />
										{/if}
									</Table.Head>
								{/each}
							</Table.Row>
						{/each}
					</Table.Header>
					<Table.Body>
						{#each table.getRowModel().rows as row (row.id)}
							{@const original = row.original}
							<Table.Row class={DataGrid.GRID_ROW_CLASS}>
								{#each row.getVisibleCells() as cell (cell.id)}
									{#if cell.column.id === 'name'}
										{@const Icon = ICONS[original.icon]}
										<Table.Cell class={cellPad}>
											<div class="flex items-center gap-2">
												{#if row.getCanExpand()}
													<DataGrid.RowToggle
														expanded={row.getIsExpanded()}
														label={row.getIsExpanded() ? 'Collapse group' : 'Expand group'}
														onclick={row.getToggleExpandedHandler()}
													/>
												{:else if row.depth > 0}
													<!-- Lines indent past the group's toggle and tile. -->
													<span class="w-11 shrink-0" aria-hidden="true"></span>
												{/if}
												{#if original.isGroup}
													<IconTile size="sm"><Icon /></IconTile>
												{/if}
												<span
													class={original.isGroup
														? 'truncate font-semibold text-foreground'
														: 'truncate text-muted-foreground'}
												>
													{original.name}
												</span>
												<span class="ms-auto ps-2">
													{#if original.isGroup && original.attainment !== undefined}
														<AttainmentRing value={original.attainment} />
													{:else if !original.isGroup && original.delta !== undefined}
														<DeltaBadge delta={original.delta} />
													{/if}
												</span>
											</div>
										</Table.Cell>
									{:else}
										{@const monthCell = original.cells[monthOf(cell.column.id)]}
										<Table.Cell class={cn(cellPad, 'text-end')}>
											{#if monthCell}
												{@render amount(monthCell, original.isGroup)}
											{/if}
										</Table.Cell>
									{/if}
								{/each}
							</Table.Row>
						{/each}
					</Table.Body>
					<Table.Footer class="bg-muted/30">
						{@render summaryRow(
							'Treasury Summary',
							'Closing Cash',
							treasury.closing,
							SUMMARY_LABEL[tab]
						)}
						{@render summaryRow(
							visibleLines(lineCount),
							'Net Burn',
							treasury.netBurn,
							'Operating Movement'
						)}
					</Table.Footer>
				</Table.Root>
			</DataGrid.Viewport>

			<GridPagination {table} recordCount={table.getRowCount()} />
		</Tabs.Content>
	</Tabs.Root>
</DataGrid.Panel>
