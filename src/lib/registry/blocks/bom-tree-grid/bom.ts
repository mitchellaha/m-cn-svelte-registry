import type { BomNode, BomRow, FlatBomRow, Supply } from './types.js';

export const SUPPLY_RANK: Record<Supply, number> = {
	stocked: 0,
	'single-source': 1,
	'long-lead': 2,
	shortage: 3
};

export const SUPPLY_LABEL: Record<Supply, string> = {
	stocked: 'Stocked',
	'single-source': 'Single source',
	'long-lead': 'Long lead',
	shortage: 'Shortage'
};

export const ALL_SUPPLY = Object.keys(SUPPLY_LABEL) as Supply[];

/** Semantic badge tones, layered on the shadcn-svelte badge. */
export type Tone = 'outline' | 'info' | 'warning' | 'destructive';

export const TONE_CLASS: Record<Tone, string> = {
	outline: '',
	info: 'border-transparent bg-blue-500/10 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
	warning:
		'border-transparent bg-amber-500/15 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
	destructive: 'border-transparent bg-destructive/10 text-destructive dark:bg-destructive/20'
};

export const SUPPLY_TONE: Record<Supply, Tone> = {
	stocked: 'outline',
	'single-source': 'info',
	'long-lead': 'warning',
	shortage: 'destructive'
};

const round2 = (n: number) => Math.round(n * 100) / 100;

function rollUp(node: BomNode): BomRow {
	if (!node.children?.length) {
		return {
			...node,
			children: undefined,
			extendedCost: round2(node.qty * (node.unitCost ?? 0)),
			leadTimeDays: node.leadTimeDays ?? 0,
			supply: node.supply ?? 'stocked',
			share: 0
		};
	}
	const children = node.children.map(rollUp);
	return {
		...node,
		unitCost: undefined,
		share: 0,
		extendedCost: round2(node.qty * children.reduce((s, c) => s + c.extendedCost, 0)),
		leadTimeDays: Math.max(...children.map((c) => c.leadTimeDays)),
		supply: children.reduce<Supply>(
			(worst, c) => (SUPPLY_RANK[c.supply] > SUPPLY_RANK[worst] ? c.supply : worst),
			'stocked'
		),
		children
	};
}

function withShare(rows: BomRow[], total: number): BomRow[] {
	return rows.map((r) => ({
		...r,
		share: total ? r.extendedCost / total : 0,
		children: r.children ? withShare(r.children, total) : undefined
	}));
}

function flatten(rows: BomRow[], depth = 0): FlatBomRow[] {
	return rows.flatMap((r) => [{ ...r, depth }, ...flatten(r.children ?? [], depth + 1)]);
}

export function buildBom(nodes: BomNode[]) {
	const rolled = nodes.map(rollUp);
	const buildCost = round2(rolled.reduce((s, r) => s + r.extendedCost, 0));
	const rows = withShare(rolled, buildCost);
	const flat = flatten(rows);
	return {
		rows,
		flat,
		buildCost,
		criticalPathDays: Math.max(...flat.map((r) => r.leadTimeDays)),
		atRisk: flat.filter((r) => !r.children && r.supply !== 'stocked').length,
		lineCount: flat.length
	};
}

/** Expanded map for every assembly shallower than `depth`. */
export function expandedToDepth(flat: FlatBomRow[], depth: number): Record<string, boolean> {
	return Object.fromEntries(
		flat.filter((r) => r.children && r.depth < depth).map((r) => [r.id, true])
	);
}

export const money = (n: number) =>
	n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export function toCsv(flat: FlatBomRow[]) {
	const head = [
		'Level',
		'Part',
		'Number',
		'Qty',
		'Unit Cost',
		'Extended Cost',
		'Lead Time (d)',
		'Supply'
	];
	const body = flat.map((r) => [
		r.depth,
		r.name,
		r.number,
		r.qty,
		r.unitCost ?? '',
		r.extendedCost,
		r.leadTimeDays,
		SUPPLY_LABEL[r.supply]
	]);
	return [head, ...body]
		.map((cols) => cols.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(','))
		.join('\n');
}
