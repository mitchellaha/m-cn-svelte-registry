import type { MatrixSchema } from './types.js';

// Sample data for a fictional retail chain, generated from a fixed seed so it is the same on
// every load. Delete this file once you pass your own rows and schema.

export type Store = {
	id: string;
	name: string;
	manager: string;
	region: string;
	district: string;
	format: string;
	opened: number;
	monthSales: number;
	monthCost: number;
	monthOrders: number;
	ytdSales: number;
	ytdCost: number;
	ytdOrders: number;
	/** Blank for stores opened this year: they have no plan. */
	plan: number | null;
	headcount: number;
};

/** Small deterministic PRNG (mulberry32), so the demo never changes between loads. */
function rng(seed: number) {
	return () => {
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const REGIONS = ['North', 'South', 'East', 'West'];
const FORMATS = [
	{ name: 'Flagship', scale: 3.2, margin: 0.42 },
	{ name: 'Standard', scale: 1.4, margin: 0.38 },
	{ name: 'Express', scale: 0.6, margin: 0.33 },
	{ name: 'Outlet', scale: 0.9, margin: 0.24 }
];
const STREETS = ['Maple', 'Harbor', 'Cedar', 'Station', 'Market', 'River', 'Summit', 'Mill'];
const PLACES = ['Point', 'Square', 'Crossing', 'Park', 'Commons', 'Plaza', 'Landing', 'Row'];
const FIRST = ['Ava', 'Ben', 'Cleo', 'Dev', 'Eli', 'Fay', 'Gus', 'Hana', 'Ivo', 'Jo', 'Kai', 'Lea'];
const LAST = ['Park', 'Moss', 'Reyes', 'Novak', 'Iyer', 'Lund', 'Okafor', 'Brandt', 'Sato', 'Vale'];

function generate(count: number): Store[] {
	const r = rng(20261117);
	const pick = <V>(list: V[]) => list[Math.floor(r() * list.length)];
	const stores: Store[] = [];
	for (let i = 0; i < count; i++) {
		const region = REGIONS[i % REGIONS.length];
		const format = r() < 0.08 ? FORMATS[0] : pick(FORMATS.slice(1));
		const opened = 2008 + Math.floor(r() * 19);
		const base = 60_000 * format.scale * (0.6 + r() * 0.9);
		const margin = format.margin + (r() - 0.5) * 0.12;
		const ticket = 28 + r() * 40 * format.scale;
		const months = 10;
		const ytdSales = Math.round(base * months * (0.9 + r() * 0.2));
		stores.push({
			id: `S-${String(1001 + i)}`,
			name: `${pick(STREETS)} ${pick(PLACES)}`,
			manager: `${pick(FIRST)} ${pick(LAST)}`,
			region,
			district: `${region} ${1 + Math.floor(r() * 4)}`,
			format: format.name,
			opened,
			monthSales: Math.round(base),
			monthCost: Math.round(base * (1 - margin)),
			monthOrders: Math.round(base / ticket),
			ytdSales,
			ytdCost: Math.round(ytdSales * (1 - margin - (r() - 0.5) * 0.02)),
			ytdOrders: Math.round(ytdSales / ticket),
			plan: opened === 2026 ? null : Math.round(ytdSales * (0.85 + r() * 0.3)),
			headcount: Math.max(3, Math.round((base / 9_000) * (0.8 + r() * 0.4)))
		});
	}
	return stores;
}

export const stores: Store[] = generate(1200);

const opened = (s: Store) =>
	s.opened >= 2024 ? '2024 or later' : s.opened >= 2016 ? '2016 to 2023' : 'Before 2016';

export const storeSchema: MatrixSchema<Store> = {
	rowId: (s) => s.id,
	label: { header: 'Store', value: (s) => `${s.id} ${s.name}`, detail: (s) => s.manager },
	dimensions: [
		{ id: 'region', label: 'Region', value: (s) => s.region },
		{ id: 'district', label: 'District', value: (s) => s.district },
		{ id: 'format', label: 'Format', value: (s) => s.format },
		{ id: 'opened', label: 'Opened', value: opened },
		{ id: 'manager', label: 'Manager', value: (s) => s.manager }
	],
	figures: [
		{ id: 'm-sales', band: 'October', header: 'Sales', kind: 'money', value: (s) => s.monthSales },
		{
			id: 'm-margin',
			band: 'October',
			header: 'Gross margin',
			kind: 'money',
			value: (s) => s.monthSales - s.monthCost
		},
		{
			id: 'm-margin-pct',
			band: 'October',
			header: 'Margin %',
			kind: 'percent',
			ratio: { numerator: (s) => s.monthSales - s.monthCost, denominator: (s) => s.monthSales }
		},
		{
			id: 'm-orders',
			band: 'October',
			header: 'Orders',
			kind: 'count',
			value: (s) => s.monthOrders
		},
		{
			id: 'm-ticket',
			band: 'October',
			header: 'Avg order',
			kind: 'money',
			ratio: { numerator: (s) => s.monthSales, denominator: (s) => s.monthOrders },
			format: (v) => `$${v.toFixed(2)}`
		},
		{
			id: 'y-sales',
			band: 'Year to date',
			header: 'Sales',
			kind: 'money',
			value: (s) => s.ytdSales
		},
		{
			id: 'y-margin',
			band: 'Year to date',
			header: 'Gross margin',
			kind: 'money',
			value: (s) => s.ytdSales - s.ytdCost
		},
		{
			id: 'y-margin-pct',
			band: 'Year to date',
			header: 'Margin %',
			kind: 'percent',
			ratio: { numerator: (s) => s.ytdSales - s.ytdCost, denominator: (s) => s.ytdSales }
		},
		{
			id: 'y-orders',
			band: 'Year to date',
			header: 'Orders',
			kind: 'count',
			value: (s) => s.ytdOrders
		},
		{ id: 'plan', band: 'Plan', header: 'Plan sales', kind: 'money', value: (s) => s.plan },
		{
			id: 'attainment',
			band: 'Plan',
			header: 'Attainment',
			kind: 'percent',
			// Only stores with a plan count on both sides, so new stores do not inflate it.
			ratio: {
				numerator: (s) => (s.plan === null ? null : s.ytdSales),
				denominator: (s) => s.plan
			}
		},
		{
			id: 'variance',
			band: 'Plan',
			header: 'Variance',
			kind: 'money',
			value: (s) => (s.plan === null ? null : s.ytdSales - s.plan)
		},
		{
			id: 'headcount',
			band: 'Staffing',
			header: 'Headcount',
			kind: 'count',
			value: (s) => s.headcount
		},
		{
			id: 'per-head',
			band: 'Staffing',
			header: 'Sales per head',
			kind: 'money',
			ratio: { numerator: (s) => s.ytdSales, denominator: (s) => s.headcount }
		}
	]
};
