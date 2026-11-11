import type { Cell, Series, TreasuryData, TreasuryRow, TreasuryTab } from './types.js';

export const ALL_LINES = 'all';

/** A monthly miss at or beyond this share of plan earns the red warning badge. */
export const SEVERE_MISS_PCT = 15;

/** Attainment at or above this share of plan reads green. */
export const ATTAINMENT_GOOD = 0.8;

export const TABS: Array<[TreasuryTab, string]> = [
	['actuals', 'Actuals'],
	['plan', 'Plan'],
	['variance', 'Variance']
];

export const SUMMARY_LABEL: Record<TreasuryTab, string> = {
	actuals: 'End Of Month',
	plan: 'Planned Close',
	variance: 'Actual Vs Plan'
};

/** Every line's full-length plan and actual series, plus the two summaries. */
export function deriveSeries(data: TreasuryData) {
	const n = data.months.length;
	const authored = data.lines.filter((l) => l.kind === 'authored');

	const total = (key: keyof Series, keep: (flow: 'operating' | 'financing') => boolean) =>
		Array.from({ length: n }, (_, m) =>
			authored.reduce((s, l) => (keep(l.flow) ? s + (l[key][m] ?? 0) : s), 0)
		);

	const movement: Series = {
		plan: total('plan', (f) => f === 'operating'),
		actual: total('actual', (f) => f === 'operating')
	};
	const netChange: Series = {
		plan: total('plan', () => true),
		actual: total('actual', () => true)
	};

	const openingLine = data.lines.find((l) => l.kind === 'opening');
	const openingActual: number[] = [];
	const closingActual: number[] = [];
	for (let m = 0; m < n; m++) {
		openingActual[m] = m === 0 ? (openingLine?.actualSeed ?? 0) : closingActual[m - 1];
		closingActual[m] = openingActual[m] + netChange.actual[m];
	}
	const openingPlan = openingLine?.plan ?? Array.from({ length: n }, () => 0);

	const byId = new Map<string, Series>();
	for (const line of data.lines) {
		if (line.kind === 'authored') byId.set(line.id, { plan: line.plan, actual: line.actual });
		else if (line.kind === 'opening')
			byId.set(line.id, { plan: openingPlan, actual: openingActual });
		else byId.set(line.id, movement);
	}

	return {
		byId,
		closing: {
			plan: openingPlan.map((o, m) => o + netChange.plan[m]),
			actual: closingActual
		} satisfies Series,
		netBurn: movement
	};
}

/** Plan attainment: the share of planned magnitude that was not missed. */
export function attainment(cells: Cell[]) {
	const planned = cells.reduce((s, c) => s + Math.abs(c.plan), 0);
	if (planned === 0) return 1;
	const missed = cells.reduce((s, c) => s + Math.abs(c.actual - c.plan), 0);
	return Math.min(1, Math.max(0, 1 - missed / planned));
}

/** The month that moved furthest from plan, signed. Months with no plan skip. */
export function worstDelta(cells: Cell[]) {
	let worst = 0;
	for (const c of cells) {
		if (c.plan === 0) continue;
		const pct = Math.round(((c.actual - c.plan) / Math.abs(c.plan)) * 100);
		if (Math.abs(pct) > Math.abs(worst)) worst = pct;
	}
	return worst;
}

export function variancePct(cell: Cell) {
	if (cell.plan === 0) return undefined;
	return Math.round((Math.abs(cell.actual - cell.plan) / Math.abs(cell.plan)) * 100);
}

export function buildTreasury(
	data: TreasuryData,
	{ byId, closing, netBurn }: ReturnType<typeof deriveSeries>,
	start: number,
	size: number,
	group: string
) {
	const months = Array.from({ length: size }, (_, i) => start + i).filter(
		(m) => m < data.months.length
	);
	const window = (s: Series): Cell[] =>
		months.map((m) => ({ plan: s.plan[m] ?? 0, actual: s.actual[m] ?? 0 }));

	const lineById = new Map(data.lines.map((l) => [l.id, l]));
	const rows: TreasuryRow[] = data.groups
		.filter((g) => group === ALL_LINES || g.id === group)
		.map((g) => {
			const children = g.lines.flatMap<TreasuryRow>((id) => {
				const line = lineById.get(id);
				const series = byId.get(id);
				if (!line || !series) return [];
				const cells = window(series);
				return [
					{
						// Lines repeat across groups, so the group must qualify the id.
						id: `${g.id}:${id}`,
						name: line.name,
						icon: line.icon,
						isGroup: false,
						cells,
						delta: worstDelta(cells)
					}
				];
			});
			const cells = months.map((_, i) => ({
				plan: children.reduce((s, c) => s + c.cells[i].plan, 0),
				actual: children.reduce((s, c) => s + c.cells[i].actual, 0)
			}));
			return {
				id: g.id,
				name: g.name,
				icon: g.icon,
				isGroup: true,
				cells,
				attainment: attainment(cells),
				children
			};
		});

	return {
		rows,
		labels: months.map((m) => data.months[m]),
		closing: window(closing),
		netBurn: window(netBurn)
	};
}

export const visibleLines = (n: number) => `${n} Visible Line${n === 1 ? '' : 's'}`;

const moneyFormat = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	currencySign: 'accounting',
	maximumFractionDigits: 0
});

export const money = (n: number) => moneyFormat.format(n);

/** Search predicate shared by the table's global filter. */
export function matchesQuery(name: string, query: string) {
	const q = query.toLowerCase();
	return !q || name.toLowerCase().includes(q);
}
