<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { SortingState } from '@tanstack/svelte-table';
	import type { MatrixSchema, RowMode } from './types.js';

	export type MatrixGridProps<T> = {
		/** The input rows. Search and filters narrow them; grouping rolls them up. */
		data: T[];
		schema: MatrixSchema<T>;
		/** Dimension ids to group by, outermost first. Bindable, so a page can keep it in the URL. */
		grouping?: string[];
		/** Figure ids shown, in any order (schema order wins). Bindable. Default every figure. */
		columns?: string[];
		/** One sort at most: `[{ id, desc }]`, id a figure id or `LABEL_ID`. Bindable. */
		sorting?: SortingState;
		/** Column widths in px by column id (`LABEL_ID` for the label). Bindable; empty uses defaults. */
		widths?: Record<string, number>;
		/** Paged with a pager, or one virtual scrolling list. Default 'virtual'. */
		defaultRowMode?: RowMode;
		defaultDensity?: 'comfortable' | 'compact';
		/** Stretch the columns to fill the grid when they are narrower in total. Default true. */
		defaultFitWidth?: boolean;
		pageSizes?: number[];
		/** Max height of the scrolling table, in px. The header and total row stick inside it. */
		height?: number;
		searchPlaceholder?: string;
		/** First cell of the total row. */
		totalLabel?: string;
		/** CSV export file name. False hides the export button. */
		exportFileName?: string | false;
		/** Adds a pinned checkbox column at the far left. */
		selectable?: boolean;
		/** Selected row ids (`schema.rowId`). Bindable. Rows a filter hides stay selected. */
		selected?: string[];
		/** Bulk actions in the selection bar; receives the selected rows. */
		selectionActions?: Snippet<[T[]]>;
		/** Items for a row's menu (`DropdownMenu.Item` and friends). Adds a pinned menu column. */
		rowActions?: Snippet<[T]>;
		/** Items for a group row's menu; receives its label and the matching rows under it. */
		groupActions?: Snippet<[{ label: string; rows: T[] }]>;
		/** Edge the menu column pins to: after the figures, or beside the label. Default 'end'. */
		actionsSide?: 'start' | 'end';
		class?: string;
	};
</script>

<script lang="ts" generics="T">
	import { tick, untrack } from 'svelte';
	import {
		type ColumnDef,
		type ExpandedState,
		createExpandedRowModel,
		createSortedRowModel,
		createTable,
		functionalUpdate,
		rowExpandingFeature,
		rowSortingFeature,
		sortFn_alphanumeric,
		sortFn_basic,
		tableFeatures
	} from '@tanstack/svelte-table';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import SlidersHorizontalIcon from '@lucide/svelte/icons/sliders-horizontal';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Checkbox } from '#lib/components/ui/checkbox/index.js';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import * as Popover from '#lib/components/ui/popover/index.js';
	import { Switch } from '#lib/components/ui/switch/index.js';
	import * as ToggleGroup from '#lib/components/ui/toggle-group/index.js';
	import { cn } from '#lib/utils.js';
	import * as DataGrid from '$lib/registry/ui/data-grid/index.js';
	import ColumnMenu from './column-menu.svelte';
	import FilterPanel, { type FilterField } from './filter-panel.svelte';
	import GroupMenu from './group-menu.svelte';
	import HeaderMenu from './header-menu.svelte';
	import {
		ALT_BAND_HEADER,
		ALT_BAND_BODY,
		FIGURE_WIDTH,
		ROW_HEIGHT,
		bands,
		buildTree,
		download,
		filterRows,
		formatFigure,
		isActiveRule,
		toCsv,
		totalValues,
		virtualWindow,
		type RangeFilters
	} from './matrix.js';
	import { LABEL_ID, type FilterGroup, type MatrixNode } from './types.js';

	let {
		data,
		schema,
		grouping = $bindable([]),
		columns: columnsProp = $bindable(),
		sorting = $bindable([]),
		widths = $bindable({}),
		defaultRowMode = 'virtual',
		defaultDensity = 'compact',
		defaultFitWidth = true,
		pageSizes = [25, 50, 100],
		height = 600,
		searchPlaceholder = 'Search...',
		totalLabel = 'Total',
		exportFileName = 'matrix.csv',
		selectable = false,
		selected = $bindable([]),
		selectionActions,
		rowActions,
		groupActions,
		actionsSide = 'end',
		class: className
	}: MatrixGridProps<T> = $props();

	type Node = MatrixNode<T>;

	const LABEL_WIDTH = 280;
	const SELECT_WIDTH = 36;
	const ACTIONS_WIDTH = 40;
	const SELECT_ID = '__select';
	const ACTIONS_ID = '__actions';

	// The default* props only seed state; the toolbar owns it after load.
	let search = $state('');
	const query = $derived(search.trim().toLowerCase());
	const shown = $derived(columnsProp ?? schema.figures.map((f) => f.id));
	const setShown = (ids: string[]) => (columnsProp = ids);
	let ranges = $state.raw<RangeFilters>({});
	let advanced = $state.raw<FilterGroup>({ logic: 'and', rules: [] });
	let density = $state<DataGrid.Density>(untrack(() => defaultDensity));
	let fitWidth = $state(untrack(() => defaultFitWidth));
	let rowMode = $state<RowMode>(untrack(() => defaultRowMode));
	let pageSize = $state(untrack(() => pageSizes[0] ?? 25));
	let viewportWidth = $state(0);
	// On a phone the label column's default gives way so figures show beside it; a width the
	// user dragged to always wins.
	const labelCol = $derived(
		widths[LABEL_ID] ??
			(viewportWidth
				? Math.min(LABEL_WIDTH, Math.max(140, Math.round(viewportWidth * 0.45)))
				: LABEL_WIDTH)
	);
	let hoverCol = $state<string | null>(null);

	const figures = $derived(schema.figures.filter((f) => shown.includes(f.id)));
	/** Band row (32px) plus the figure header row (40px, two lines); just the band row with no figures. */
	const headHeight = $derived(figures.length ? 32 + 40 : 32);
	const headRows = $derived(figures.length ? 2 : 1);
	const headerBands = $derived(bands(figures));
	// Sorts and ranges on columns that are switched off stop applying.
	const shownRanges = $derived(
		Object.fromEntries(Object.entries(ranges).filter(([id]) => shown.includes(id)))
	);
	const shownSorting = $derived(sorting.filter((s) => s.id === LABEL_ID || shown.includes(s.id)));

	const filtered = $derived(filterRows(data, schema, { query, ranges: shownRanges, advanced }));

	// ── Selection and the menu column ────────────────────────────────────────

	const hasActions = $derived(!!rowActions || !!groupActions);
	const selectW = $derived(selectable ? SELECT_WIDTH : 0);
	const actionsW = $derived(hasActions ? ACTIONS_WIDTH : 0);
	const selectedSet = $derived(new Set(selected));
	const selectedRows = $derived(data.filter((r) => selectedSet.has(schema.rowId(r))));
	const hiddenSelected = $derived(
		selectedRows.length - filtered.filter((r) => selectedSet.has(schema.rowId(r))).length
	);

	/** Whether all, some or none of `rows` are selected. */
	function selection(rows: readonly T[]): boolean | 'some' {
		let n = 0;
		for (const r of rows) if (selectedSet.has(schema.rowId(r))) n++;
		return n === 0 ? false : n === rows.length ? true : 'some';
	}

	function selectRows(rows: readonly T[], on: boolean) {
		const ids = rows.map((r) => schema.rowId(r));
		if (on) {
			const have = new Set(selected);
			selected = [...selected, ...ids.filter((id) => !have.has(id))];
		} else {
			const drop = new Set(ids);
			selected = selected.filter((id) => !drop.has(id));
		}
	}
	const tree = $derived(buildTree(filtered, schema, grouping));
	/** The matching rows under each group id, for its checkbox and its menu. */
	const leavesOf = $derived.by(() => {
		const out: Record<string, T[]> = {};
		const walk = (nodes: Node[]): T[] => {
			const rows: T[] = [];
			for (const n of nodes) {
				if (n.kind === 'leaf') rows.push(n.row);
				else rows.push(...(out[n.id] = walk(n.children)));
			}
			return rows;
		};
		walk(tree);
		return out;
	});
	const total = $derived(totalValues(filtered, schema));
	const isFiltered = $derived(
		!!query ||
			Object.values(shownRanges).some((r) => r[0] !== null || r[1] !== null) ||
			advanced.rules.some(isActiveRule)
	);

	const levelCount = $derived(grouping.length + 1);

	/** Group ids per depth: depth d opens when the level is above d + 1. */
	const groupIdsByDepth = $derived.by(() => {
		const out: string[][] = [];
		const walk = (nodes: Node[], depth: number) => {
			for (const n of nodes) {
				if (n.kind !== 'group') continue;
				(out[depth] ??= []).push(n.id);
				walk(n.children, depth + 1);
			}
		};
		walk(tree, 0);
		return out;
	});

	const openToLevel = (level: number) =>
		Object.fromEntries(
			groupIdsByDepth.slice(0, level - 1).flatMap((ids) => ids.map((id) => [id, true]))
		);

	// Changing the grouping resets the open groups to the top level; otherwise the user's toggles are kept.
	const view = $derived(grouping.join('/'));
	let toggled = $state.raw<{ view: string; expanded: ExpandedState } | null>(null);
	const expanded = $derived<ExpandedState>(
		toggled?.view === view ? toggled.expanded : openToLevel(2)
	);

	const features = tableFeatures({
		rowExpandingFeature,
		rowSortingFeature,
		expandedRowModel: createExpandedRowModel(),
		sortedRowModel: createSortedRowModel(),
		sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic }
	});

	const nodeLabel = (n: Node) => (n.kind === 'group' ? n.label : schema.label.value(n.row));

	// Cells render from the template, so the defs only feed sorting.
	const columns = $derived<ColumnDef<typeof features, Node>[]>([
		{ id: LABEL_ID, accessorFn: nodeLabel, sortFn: 'alphanumeric' },
		...schema.figures.map((f): ColumnDef<typeof features, Node> => ({
			id: f.id,
			accessorFn: (n) => n.values[f.id] ?? undefined,
			sortFn: 'basic',
			sortUndefined: 'last',
			sortDescFirst: true
		}))
	]);

	const table = createTable({
		...DataGrid.GRID_TABLE_DEFAULTS,
		features,
		get columns() {
			return columns;
		},
		get data() {
			return tree;
		},
		getRowId: (n) => n.id,
		getSubRows: (n) => (n.kind === 'group' ? n.children : undefined),
		state: {
			get sorting() {
				return shownSorting;
			},
			// A search must reveal every match, so it opens every group.
			get expanded() {
				return DataGrid.pinnedExpanded(query, expanded);
			}
		},
		onSortingChange: (updater) => (sorting = functionalUpdate(updater, shownSorting)),
		onExpandedChange: (updater) => {
			if (!query) toggled = { view, expanded: functionalUpdate(updater, expanded) };
		}
	});

	/** Every visible row in order, across all pages. */
	const allRows = $derived(table.getRowModel().rows);

	// A new search, filter, grouping or row mode starts again at page 1; within one, the page
	// holds. Clamped on read, so collapsing groups never strands the view past the last page.
	const pageKey = $derived(
		JSON.stringify([query, grouping, shownRanges, advanced.logic, advanced.rules, rowMode])
	);
	let page = $state.raw({ key: '', index: 0 });
	const pageCount = $derived(Math.max(1, Math.ceil(allRows.length / pageSize)));
	const pageIndex = $derived(page.key === pageKey ? Math.min(page.index, pageCount - 1) : 0);
	const setPage = (index: number) => (page = { key: pageKey, index });
	const pageRows = $derived(
		rowMode === 'paged' ? allRows.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize) : allRows
	);

	// ── Depth control ────────────────────────────────────────────────────────

	/**
	 * The level the open groups match, read from the groups on screen now, so ids a filter hid
	 * do not count: every depth above the level fully open, none below. 0 for a hand-made mix.
	 */
	const currentLevel = $derived.by(() => {
		if (expanded === true) return levelCount;
		const map = expanded;
		let level = 1;
		for (const [d, ids] of groupIdsByDepth.entries()) {
			const open = ids.filter((id) => map[id]).length;
			if (open === ids.length && level === d + 1) level = d + 2;
			else if (open > 0) return 0;
		}
		return Math.min(level, levelCount);
	});

	function setLevel(level: number) {
		toggled = { view, expanded: level >= levelCount ? true : openToLevel(level) };
	}

	// ── Virtual window ───────────────────────────────────────────────────────

	let scroller = $state<HTMLDivElement | null>(null);
	let scrollTop = $state(0);
	let viewportHeight = $state(0);
	let scrollerHeight = $state(0);
	/** Height of the horizontal scrollbar under the total row, when there is one. */
	const scrollbarHeight = $derived(Math.max(0, scrollerHeight - viewportHeight));
	const rowHeight = $derived(ROW_HEIGHT[density]);
	const win = $derived(
		rowMode === 'virtual'
			? virtualWindow(
					allRows.length,
					rowHeight,
					Math.max(0, scrollTop - headHeight),
					viewportHeight || height
				)
			: { start: 0, end: pageRows.length, before: 0, after: 0 }
	);
	const rendered = $derived(pageRows.slice(win.start, win.end));

	// ── Keyboard: a roving cell, arrows to move, Enter or Space to open a group ──

	let active = $state<{ row: string; col: number } | null>(null);
	/** Every cell column in screen order; a cell's index here is its keyboard column. */
	const colKeys = $derived([
		...(selectable ? [SELECT_ID] : []),
		LABEL_ID,
		...(hasActions && actionsSide === 'start' ? [ACTIONS_ID] : []),
		...figures.map((f) => f.id),
		...(hasActions && actionsSide === 'end' ? [ACTIONS_ID] : [])
	]);
	const colCount = $derived(colKeys.length);
	const colOf = (key: string) => colKeys.indexOf(key);

	async function focusCell(index: number, col: number) {
		const rows = pageRows;
		if (!rows.length) return;
		const i = Math.max(0, Math.min(rows.length - 1, index));
		const c = Math.max(0, Math.min(colCount - 1, col));
		active = { row: rows[i].id, col: c };
		if (rowMode === 'virtual' && scroller) {
			const top = headHeight + i * rowHeight;
			const bottom = top + rowHeight;
			const visibleBottom = scroller.scrollTop + scroller.clientHeight - rowHeight;
			if (top - headHeight < scroller.scrollTop) scroller.scrollTop = top - headHeight;
			else if (bottom > visibleBottom)
				scroller.scrollTop = bottom - scroller.clientHeight + rowHeight;
			// The scroll event lands a frame later; render the target row now so it can take focus.
			scrollTop = scroller.scrollTop;
		}
		await tick();
		scroller
			?.querySelector<HTMLElement>(`[data-cell="${CSS.escape(`${rows[i].id}|${c}`)}"]`)
			?.focus({ preventScroll: rowMode === 'paged' ? false : true });
	}

	function onKeydown(e: KeyboardEvent) {
		if (!active) return;
		// A focused button inside a cell handles its own Enter and Space.
		const onButton = (e.target as HTMLElement).closest('button') !== null;
		if (onButton && (e.key === 'Enter' || e.key === ' ')) return;
		const index = pageRows.findIndex((r) => r.id === active!.row);
		if (index < 0) return;
		const row = pageRows[index];
		const step: Record<string, [number, number]> = {
			ArrowDown: [1, 0],
			ArrowUp: [-1, 0],
			PageDown: [10, 0],
			PageUp: [-10, 0]
		};
		const key = colKeys[active.col];
		if ((e.key === 'Enter' || e.key === ' ') && key === SELECT_ID) {
			e.preventDefault();
			const n = row.original;
			const rows = n.kind === 'leaf' ? [n.row] : (leavesOf[n.id] ?? []);
			selectRows(rows, selection(rows) !== true);
			return;
		}
		if ((e.key === 'Enter' || e.key === ' ') && key === ACTIONS_ID) {
			e.preventDefault();
			// The menu opens from its trigger's own key handling.
			const trigger = (e.target as HTMLElement).closest('td')?.querySelector('button');
			trigger?.focus();
			trigger?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
			return;
		}
		if (e.key in step) {
			e.preventDefault();
			focusCell(index + step[e.key][0], active.col);
		} else if (e.key === 'ArrowRight') {
			e.preventDefault();
			if (key === LABEL_ID && row.getCanExpand() && !row.getIsExpanded()) row.toggleExpanded(true);
			else focusCell(index, active.col + 1);
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			if (key === LABEL_ID && row.getIsExpanded()) row.toggleExpanded(false);
			else focusCell(index, active.col - 1);
		} else if (e.key === 'Home') {
			e.preventDefault();
			focusCell(e.ctrlKey || e.metaKey ? 0 : index, 0);
		} else if (e.key === 'End') {
			e.preventDefault();
			focusCell(e.ctrlKey || e.metaKey ? pageRows.length - 1 : index, colCount - 1);
		} else if ((e.key === 'Enter' || e.key === ' ') && row.getCanExpand()) {
			e.preventDefault();
			row.toggleExpanded();
		}
	}

	// The active cell stays the tab stop only while it is on screen. If it scrolls out of the
	// window, or is filtered or collapsed away, the first rendered row takes over so Tab still
	// lands in the table.
	const tabStop = $derived(
		active && rendered.some((r) => r.id === active!.row)
			? active
			: { row: rendered[0]?.id ?? '', col: 0 }
	);
	const isTabStop = (rowId: string, col: number) => tabStop.row === rowId && tabStop.col === col;

	/** Tracks focus from inside a cell too, such as a group's expand button. */
	function onCellFocus(e: FocusEvent) {
		const cell = (e.target as HTMLElement).closest<HTMLElement>('[data-cell]')?.dataset.cell;
		if (!cell) return;
		const at = cell.lastIndexOf('|');
		active = { row: cell.slice(0, at), col: Number(cell.slice(at + 1)) };
	}

	// ── Column resize ────────────────────────────────────────────────────────

	const widthOf = (id: string, fallback: number) => widths[id] ?? fallback;
	const figureWidth = (f: (typeof figures)[number]) => widthOf(f.id, FIGURE_WIDTH[f.kind]);
	const baseOf = (id: string) => {
		if (id === LABEL_ID) return labelCol;
		const f = figures.find((x) => x.id === id);
		return f ? figureWidth(f) : 0;
	};
	/** Every column at its own width, before any stretch. */
	const baseTotal = $derived(figures.reduce((sum, f) => sum + figureWidth(f), labelCol));
	/** With Fit width on and room to spare, every column grows by this factor to fill the grid. */
	/** Width the stretchable columns share: the grid less the fixed checkbox and menu columns. */
	const room = $derived(viewportWidth - selectW - actionsW);
	const stretch = $derived(fitWidth && room > baseTotal ? room / baseTotal : 1);
	/** An explicit width keeps table-fixed in force, so a column can shrink below its content. */
	const tableWidth = $derived(baseTotal * stretch + selectW + actionsW);

	/** Drag a header's right edge. Starts from the width on screen, so the edge follows the pointer. */
	function startResize(id: string, e: PointerEvent) {
		const handle = e.currentTarget as HTMLElement;
		const startWidth = handle.parentElement?.getBoundingClientRect().width ?? 0;
		const min = id === LABEL_ID ? 120 : 48;
		const startX = e.clientX;
		handle.setPointerCapture(e.pointerId);
		const move = (ev: PointerEvent) => {
			const target = Math.min(800, Math.max(min, startWidth + ev.clientX - startX));
			// While fitted, solve for the share whose stretched width is `target`, so the edge stays
			// under the pointer and the other columns give way. Past the grid's width, no stretch.
			const others = baseTotal - baseOf(id);
			const base =
				fitWidth && target + others < room ? (target * others) / (room - target) : target;
			widths = { ...widths, [id]: Math.round(base * 10) / 10 };
		};
		// Fires after pointerup and pointercancel alike, so a cancelled touch drag cleans up too.
		const done = () => {
			handle.removeEventListener('pointermove', move);
			handle.removeEventListener('lostpointercapture', done);
		};
		handle.addEventListener('pointermove', move);
		handle.addEventListener('lostpointercapture', done);
	}

	function resetWidth(id: string) {
		const rest = { ...widths };
		delete rest[id];
		widths = rest;
	}

	// ── Toolbar helpers ──────────────────────────────────────────────────────

	const sortOf = (id: string): false | 'asc' | 'desc' => {
		const s = shownSorting.find((x) => x.id === id);
		return s ? (s.desc ? 'desc' : 'asc') : false;
	};
	const setSort = (id: string, dir: false | 'asc' | 'desc') =>
		(sorting = dir ? [{ id, desc: dir === 'desc' }] : []);
	const setRange = (id: string, range: [number | null, number | null]) =>
		(ranges = { ...ranges, [id]: range });

	const filterFields = $derived<FilterField[]>([
		{ id: LABEL_ID, label: schema.label.header, type: 'text' },
		...schema.dimensions.map((d) => ({ id: d.id, label: d.label, type: 'text' as const })),
		...schema.figures.map((f) => ({ id: f.id, label: `${f.band}: ${f.header}`, type: f.kind }))
	]);

	/** Writes the matching rows in grid order, or only the selected ones (matching or not). */
	function exportCsv(onlySelected = false) {
		if (!exportFileName) return;
		const leaves = table
			.getSortedRowModel()
			.flatRows.map((r) => r.original)
			.filter((n): n is Extract<Node, { kind: 'leaf' }> => n.kind === 'leaf')
			.map((n) => n.row);
		if (!onlySelected) return download(exportFileName, toCsv(leaves, schema, figures));
		const inGrid = leaves.filter((r) => selectedSet.has(schema.rowId(r)));
		const shownIds = new Set(inGrid.map((r) => schema.rowId(r)));
		const rest = selectedRows.filter((r) => !shownIds.has(schema.rowId(r)));
		download(exportFileName, toCsv([...inGrid, ...rest], schema, figures));
	}

	// ── Cell styling ─────────────────────────────────────────────────────────

	const HOVER_SHADE = 'bg-[color-mix(in_oklab,var(--color-foreground)_7%,var(--color-background))]';
	const ROW_HOVER =
		'group-hover/row:bg-[color-mix(in_oklab,var(--color-foreground)_5%,var(--color-background))]';
	const SELECTED_SHADE = 'bg-[color-mix(in_oklab,var(--color-primary)_8%,var(--color-background))]';
	/** Background for the label, checkbox and menu cells of a row. */
	const rowBg = (isSelected: boolean) =>
		isSelected ? SELECTED_SHADE : `bg-background ${ROW_HOVER}`;
	const bandStart = $derived(new Set(headerBands.map((b) => b.figures[0].id)));
	const shadedBand = $derived(
		new Set(headerBands.flatMap((b, i) => (i % 2 ? b.figures.map((f) => f.id) : [])))
	);
	const FOCUS_RING =
		'outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset';

	/**
	 * Class strings per figure column, built once per column set rather than merged per cell.
	 * Each part has a plain and a hovered form, never both tints at once.
	 */
	const colClass = $derived(
		Object.fromEntries(
			figures.map((f) => {
				const edge = bandStart.has(f.id) ? ' border-l' : '';
				const alt = shadedBand.has(f.id);
				const body = `relative overflow-hidden border-b px-2 text-end text-ellipsis whitespace-nowrap tabular-nums ${FOCUS_RING}${edge}`;
				const head = `sticky top-8 z-20 border-b px-2 text-end align-bottom font-medium${edge}`;
				const foot = `sticky bottom-0 z-20 overflow-hidden border-t px-2 text-end font-semibold text-ellipsis whitespace-nowrap tabular-nums${edge}`;
				return [
					f.id,
					{
						body: `${body} ${alt ? ALT_BAND_BODY : 'bg-background'} ${ROW_HOVER}`,
						bodySelected: `${body} ${SELECTED_SHADE}`,
						bodyHover: `${body} ${HOVER_SHADE}`,
						head: `${head} ${alt ? ALT_BAND_HEADER : 'bg-muted'}`,
						headHover: `${head} ${HOVER_SHADE}`,
						foot: `${foot} bg-muted`,
						footHover: `${foot} ${HOVER_SHADE}`
					}
				];
			})
		)
	);

	/** Text colour for a figure cell: red when negative, stronger on a group row. */
	const tone = (v: number | null, group: boolean) =>
		v !== null && v < 0 ? ' text-destructive' : group ? ' font-medium text-foreground' : '';

	const ariaSort = { asc: 'ascending', desc: 'descending' } as const;
</script>

{#snippet resizer(id: string, label: string)}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<span
		class="absolute inset-y-0 right-0 z-10 w-1.5 cursor-col-resize touch-none hover:bg-ring/40"
		title="Resize {label}. Double-click to reset."
		onpointerdown={(e) => startResize(id, e)}
		ondblclick={() => resetWidth(id)}
	></span>
{/snippet}

{#snippet checkbox(rows: T[], label: string)}
	{@const state = selection(rows)}
	<Checkbox
		tabindex={-1}
		checked={state === true}
		indeterminate={state === 'some'}
		disabled={rows.length === 0}
		aria-label="Select {label}"
		onCheckedChange={(on) => selectRows(rows, on)}
	/>
{/snippet}

{#snippet menu(n: Node)}
	{#if n.kind === 'leaf' ? rowActions : groupActions}
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button
						{...props}
						variant="ghost"
						size="icon-xs"
						tabindex={-1}
						aria-label="Actions for {nodeLabel(n)}"
					>
						<EllipsisIcon />
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align={actionsSide === 'end' ? 'end' : 'start'} class="min-w-48">
				{#if n.kind === 'leaf'}
					{@render rowActions?.(n.row)}
				{:else}
					{@render groupActions?.({ label: n.label, rows: leavesOf[n.id] ?? [] })}
				{/if}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	{/if}
{/snippet}

<DataGrid.Panel class={cn('flex min-w-0 flex-col gap-3', className)}>
	<div class="flex flex-wrap items-center justify-between gap-2">
		<DataGrid.Search placeholder={searchPlaceholder} bind:value={search} class="sm:max-w-xs" />
		<div class="flex flex-wrap items-center gap-2">
			{#if grouping.length}
				<DataGrid.DepthMenu
					{levelCount}
					level={currentLevel}
					onLevelChange={setLevel}
					disabled={Boolean(query)}
				/>
			{/if}
			<GroupMenu dimensions={schema.dimensions} {grouping} onChange={(g) => (grouping = g)} />
			<ColumnMenu figures={schema.figures} {shown} onChange={setShown} />
			<FilterPanel fields={filterFields} value={advanced} onChange={(v) => (advanced = v)} />
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
					<Field.Field orientation="horizontal">
						<Field.Label for="matrix-density">Density</Field.Label>
						<DataGrid.DensitySelect id="matrix-density" align="end" bind:value={density} />
					</Field.Field>
					<Field.Field orientation="horizontal">
						<Field.Label>Rows</Field.Label>
						<ToggleGroup.Root
							type="single"
							variant="outline"
							size="sm"
							value={rowMode}
							onValueChange={(v) => v && (rowMode = v as typeof rowMode)}
							aria-label="Rows"
						>
							<ToggleGroup.Item value="virtual">Scroll</ToggleGroup.Item>
							<ToggleGroup.Item value="paged">Pages</ToggleGroup.Item>
						</ToggleGroup.Root>
					</Field.Field>
					<Field.Field orientation="horizontal">
						<Field.Label for="matrix-fit">Fit width</Field.Label>
						<Switch id="matrix-fit" bind:checked={fitWidth} />
					</Field.Field>
				</Popover.Content>
			</Popover.Root>
			{#if exportFileName && selected.length}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="outline" size="sm">
								<DownloadIcon data-icon="inline-start" />
								Export
							</Button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end">
						<DropdownMenu.Item onSelect={() => exportCsv(false)}>Matching rows</DropdownMenu.Item>
						<DropdownMenu.Item onSelect={() => exportCsv(true)}>
							Selected rows ({selected.length})
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{:else if exportFileName}
				<Button variant="outline" size="sm" onclick={() => exportCsv()}>
					<DownloadIcon data-icon="inline-start" />
					Export
				</Button>
			{/if}
		</div>
	</div>

	{#if isFiltered}
		<p class="-mt-1 text-xs text-muted-foreground">
			{filtered.length} of {data.length} rows match. Totals cover only these rows.
		</p>
	{/if}

	<DataGrid.Viewport class="relative">
		<div
			bind:this={scroller}
			bind:clientHeight={viewportHeight}
			bind:offsetHeight={scrollerHeight}
			bind:clientWidth={viewportWidth}
			class="relative overflow-auto overscroll-contain"
			style:max-height="{height}px"
			onscroll={(e) => (scrollTop = e.currentTarget.scrollTop)}
		>
			<table
				class="min-w-full table-fixed border-separate border-spacing-0 text-xs"
				style:width="{tableWidth}px"
				role={grouping.length ? 'treegrid' : undefined}
				aria-rowcount={allRows.length + headRows + 1}
				onpointerover={(e) =>
					(hoverCol =
						(e.target as HTMLElement).closest<HTMLElement>('[data-col]')?.dataset.col ?? null)}
				onpointerleave={() => (hoverCol = null)}
			>
				<colgroup>
					{#if selectable}<col style:width="{SELECT_WIDTH}px" />{/if}
					<col style:width="{labelCol * stretch}px" />
					{#if hasActions && actionsSide === 'start'}<col style:width="{ACTIONS_WIDTH}px" />{/if}
					{#each figures as f (f.id)}
						<col style:width="{figureWidth(f) * stretch}px" />
					{/each}
					<!-- Takes the spare width, so table-fixed never stretches a sized column. -->
					<col />
					{#if hasActions && actionsSide === 'end'}<col style:width="{ACTIONS_WIDTH}px" />{/if}
				</colgroup>

				<thead class="text-muted-foreground">
					<tr class="h-8">
						{#if selectable}
							<th
								rowspan={headRows}
								scope="col"
								class="sticky top-0 left-0 z-30 border-b bg-muted px-2.5 align-bottom"
								style:padding-bottom="0.625rem"
							>
								{@render checkbox(filtered, 'all matching rows')}
							</th>
						{/if}
						<th
							rowspan={headRows}
							scope="col"
							class="sticky top-0 z-30 border-r border-b bg-muted px-3 text-start align-bottom font-medium"
							style:left="{selectW}px"
							style:padding-bottom="0.5rem"
						>
							<HeaderMenu
								label={schema.label.header}
								align="start"
								sorted={sortOf(LABEL_ID)}
								onSort={(dir) => setSort(LABEL_ID, dir)}
							/>
							{@render resizer(LABEL_ID, schema.label.header)}
						</th>
						{#if hasActions && actionsSide === 'start'}
							<th
								rowspan={headRows}
								scope="col"
								class="sticky top-0 z-30 border-r border-b bg-muted"
								style:left="{selectW + labelCol * stretch}px"
							>
								<span class="sr-only">Actions</span>
							</th>
						{/if}
						{#each headerBands as b, i (b.band + i)}
							<th
								colspan={b.figures.length}
								scope="colgroup"
								class={cn(
									'sticky top-0 z-20 truncate border-b border-l px-2 text-center font-medium text-foreground',
									i % 2 ? ALT_BAND_HEADER : 'bg-muted'
								)}
							>
								{b.band}
							</th>
						{/each}
						<th rowspan={headRows} aria-hidden="true" class="sticky top-0 z-20 border-b bg-muted"
						></th>
						{#if hasActions && actionsSide === 'end'}
							<th
								rowspan={headRows}
								scope="col"
								class="sticky top-0 right-0 z-30 border-b border-l bg-muted"
							>
								<span class="sr-only">Actions</span>
							</th>
						{/if}
					</tr>
					{#if figures.length}
						<tr class="h-10">
							{#each figures as f (f.id)}
								<th
									scope="col"
									data-col={f.id}
									aria-sort={sortOf(f.id) ? ariaSort[sortOf(f.id) || 'asc'] : undefined}
									class={hoverCol === f.id ? colClass[f.id].headHover : colClass[f.id].head}
									style:padding-bottom="0.375rem"
								>
									<HeaderMenu
										label={f.header}
										sorted={sortOf(f.id)}
										range={ranges[f.id] ?? [null, null]}
										percent={f.kind === 'percent'}
										onSort={(dir) => setSort(f.id, dir)}
										onRange={(r) => setRange(f.id, r)}
										onHide={() => setShown(shown.filter((id) => id !== f.id))}
									/>
									{@render resizer(f.id, f.header)}
								</th>
							{/each}
						</tr>
					{/if}
				</thead>

				<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
				<tbody onkeydown={onKeydown}>
					{#if win.before}
						<tr aria-hidden="true" style:height="{win.before}px"
							><td colspan={colCount + 1}></td></tr
						>
					{/if}
					{#each rendered as row, i (row.id)}
						{@const n = row.original}
						{@const isSelected = n.kind === 'leaf' && selectedSet.has(n.id)}
						<tr
							class="group/row"
							aria-selected={selectable && n.kind === 'leaf' ? isSelected : undefined}
							style:height="{rowHeight}px"
							aria-rowindex={(rowMode === 'paged' ? pageIndex * pageSize : win.start) +
								i +
								headRows +
								1}
							aria-level={row.depth + 1}
							aria-expanded={n.kind === 'group' ? row.getIsExpanded() : undefined}
						>
							{#if selectable}
								<td
									data-cell="{row.id}|{colOf(SELECT_ID)}"
									tabindex={isTabStop(row.id, colOf(SELECT_ID)) ? 0 : -1}
									onfocusin={onCellFocus}
									class="sticky left-0 z-10 border-b px-2.5 {FOCUS_RING} {rowBg(isSelected)}"
								>
									{@render checkbox(
										n.kind === 'leaf' ? [n.row] : (leavesOf[n.id] ?? []),
										nodeLabel(n)
									)}
								</td>
							{/if}
							<td
								data-cell="{row.id}|{colOf(LABEL_ID)}"
								tabindex={isTabStop(row.id, colOf(LABEL_ID)) ? 0 : -1}
								onfocusin={onCellFocus}
								class="sticky z-10 overflow-hidden border-r border-b px-3 whitespace-nowrap {FOCUS_RING} {rowBg(
									isSelected
								)}"
								style:left="{selectW}px"
							>
								<div
									class="flex min-w-0 items-center gap-1.5"
									style:padding-inline-start="{row.depth * 1.125}rem"
								>
									{#if n.kind === 'group'}
										<DataGrid.RowToggle
											expanded={row.getIsExpanded()}
											label={row.getIsExpanded() ? `Collapse ${n.label}` : `Expand ${n.label}`}
											tabindex={-1}
											onclick={row.getToggleExpandedHandler()}
										/>
										<span class="truncate font-medium text-foreground">{n.label}</span>
										<span class="shrink-0 text-muted-foreground tabular-nums">{n.count}</span>
									{:else}
										{#if grouping.length}
											<span class="-ms-1.5 size-5 shrink-0" aria-hidden="true"></span>
										{/if}
										<span class="truncate text-foreground">{schema.label.value(n.row)}</span>
										{#if schema.label.detail}
											<span class="truncate text-muted-foreground"
												>{schema.label.detail(n.row)}</span
											>
										{/if}
									{/if}
								</div>
							</td>
							{#if hasActions && actionsSide === 'start'}
								<td
									data-cell="{row.id}|{colOf(ACTIONS_ID)}"
									tabindex={isTabStop(row.id, colOf(ACTIONS_ID)) ? 0 : -1}
									onfocusin={onCellFocus}
									class="sticky z-10 border-r border-b text-center {FOCUS_RING} {rowBg(isSelected)}"
									style:left="{selectW + labelCol * stretch}px"
								>
									{@render menu(n)}
								</td>
							{/if}
							{#each figures as f (f.id)}
								{@const v = n.values[f.id] ?? null}
								{@const cls = colClass[f.id]}
								<td
									data-col={f.id}
									data-cell="{row.id}|{colOf(f.id)}"
									tabindex={isTabStop(row.id, colOf(f.id)) ? 0 : -1}
									onfocusin={onCellFocus}
									class={(hoverCol === f.id
										? cls.bodyHover
										: isSelected
											? cls.bodySelected
											: cls.body) + tone(v, n.kind === 'group')}
								>
									{formatFigure(f, v)}
								</td>
							{/each}
							<td aria-hidden="true" class="border-b {rowBg(isSelected)}"></td>
							{#if hasActions && actionsSide === 'end'}
								<td
									data-cell="{row.id}|{colOf(ACTIONS_ID)}"
									tabindex={isTabStop(row.id, colOf(ACTIONS_ID)) ? 0 : -1}
									onfocusin={onCellFocus}
									class="sticky right-0 z-10 border-b border-l text-center {FOCUS_RING} {rowBg(
										isSelected
									)}"
								>
									{@render menu(n)}
								</td>
							{/if}
						</tr>
					{:else}
						<tr>
							<td colspan={colCount + 1} class="h-24 text-center text-muted-foreground">
								No rows match.
							</td>
						</tr>
					{/each}
					{#if win.after}
						<tr aria-hidden="true" style:height="{win.after}px"><td colspan={colCount + 1}></td></tr
						>
					{/if}
				</tbody>

				<tfoot>
					<tr style:height="{rowHeight}px">
						{#if selectable}
							<td class="sticky bottom-0 left-0 z-30 border-t bg-muted"></td>
						{/if}
						<td
							class="sticky bottom-0 z-30 border-t border-r bg-muted px-3 font-semibold whitespace-nowrap"
							style:left="{selectW}px"
						>
							{totalLabel}
							<span class="ml-1 font-normal text-muted-foreground tabular-nums">
								{filtered.length} rows
							</span>
						</td>
						{#if hasActions && actionsSide === 'start'}
							<td
								class="sticky bottom-0 z-30 border-t border-r bg-muted"
								style:left="{selectW + labelCol * stretch}px"
							></td>
						{/if}
						{#each figures as f (f.id)}
							<td
								data-col={f.id}
								class={(hoverCol === f.id ? colClass[f.id].footHover : colClass[f.id].foot) +
									tone(total[f.id] ?? null, false)}
							>
								{formatFigure(f, total[f.id] ?? null)}
							</td>
						{/each}
						<td aria-hidden="true" class="sticky bottom-0 z-20 border-t bg-muted"></td>
						{#if hasActions && actionsSide === 'end'}
							<td class="sticky right-0 bottom-0 z-30 border-t border-l bg-muted"></td>
						{/if}
					</tr>
				</tfoot>
			</table>
		</div>
		<!-- Floats above the total row, so selecting never moves the table. -->
		{#if selectable && selected.length}
			<div
				role="status"
				class="absolute left-1/2 z-40 flex max-w-[calc(100%-1rem)] -translate-x-1/2 flex-wrap items-center gap-2 rounded-lg border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md"
				style:bottom="{rowHeight + scrollbarHeight + 8}px"
			>
				<span class="font-medium tabular-nums">{selected.length} selected</span>
				{#if hiddenSelected}
					<span class="text-muted-foreground">({hiddenSelected} hidden by filters)</span>
				{/if}
				<Button variant="ghost" size="xs" onclick={() => (selected = [])}>Clear</Button>
				{#if selectionActions}
					{@render selectionActions(selectedRows)}
				{/if}
			</div>
		{/if}
	</DataGrid.Viewport>

	{#if rowMode === 'paged'}
		<DataGrid.Pagination
			{pageIndex}
			{pageSize}
			rowCount={allRows.length}
			{pageSizes}
			onPageChange={setPage}
			onPageSizeChange={(size) => {
				pageSize = size;
				setPage(0);
			}}
		/>
	{/if}
</DataGrid.Panel>
