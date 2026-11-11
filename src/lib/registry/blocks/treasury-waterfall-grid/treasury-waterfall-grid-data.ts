/**
 * Sample data for TreasuryWaterfallGrid. Delete this file and the demo once
 * real data is wired: the component takes `data` as a required prop.
 *
 * Every figure below is an input. Opening actual is seeded once (Feb) and
 * chains from each month's closing; operating movement, closing cash, net
 * burn, every group total, the attainment rings and the delta badges are all
 * derived. The Apr 2026 to Aug 2026 window is the regression check: on that
 * window closing cash reads 243,000 / 181,000 / 121,000 / 62,000 / 245,000,
 * net burn reads (47,000) / (62,000) / (60,000) / (93,000) / (15,000), the
 * Cash / Burn / Funding rings read 85% / 77% / 62%, and the five line badges
 * read -16% / +56% / +89% / -18% / -11%.
 *
 * The Feb seed of 352,000 is what lands the Apr opening balance on 290,000.
 */
import type { TreasuryData } from './types.js';

export const treasuryData: TreasuryData = {
	months: [
		'Feb 2026',
		'Mar 2026',
		'Apr 2026',
		'May 2026',
		'Jun 2026',
		'Jul 2026',
		'Aug 2026',
		'Sep 2026'
	],
	lines: [
		{
			kind: 'opening',
			id: 'opening',
			name: 'Opening Cash Balance Carryover',
			icon: 'opening',
			actualSeed: 352_000,
			// Authored, not chained: the plan is re-based at each re-forecast.
			plan: [355_000, 313_000, 295_000, 248_000, 197_000, 144_000, 72_000, 190_000]
		},
		{
			kind: 'movement',
			id: 'movement',
			name: 'Operating Cash Movement Impact',
			icon: 'movement'
		},
		{
			kind: 'authored',
			id: 'collections',
			name: 'Customer Cash Collection Pace',
			icon: 'collections',
			flow: 'operating',
			actual: [68_000, 70_000, 72_000, 64_000, 82_000, 91_000, 118_000, 112_000],
			plan: [70_000, 72_000, 75_000, 78_000, 85_000, 96_000, 110_000, 115_000]
		},
		{
			kind: 'authored',
			id: 'outflow',
			name: 'Operating Cash Outflow Load',
			icon: 'outflow',
			flow: 'operating',
			actual: [-110_000, -115_000, -119_000, -126_000, -142_000, -184_000, -133_000, -140_000],
			plan: [-112_000, -118_000, -122_000, -130_000, -138_000, -166_000, -144_000, -138_000]
		},
		{
			kind: 'authored',
			id: 'capital',
			name: 'Capital Inflow Event Timing',
			icon: 'funding',
			flow: 'financing',
			actual: [0, 25_000, 0, 0, 0, 34_000, 198_000, 0],
			plan: [0, 20_000, 0, 0, 0, 18_000, 150_000, 0]
		}
	],
	groups: [
		{ id: 'cash', name: 'Cash', icon: 'wallet', lines: ['opening', 'movement', 'capital'] },
		{ id: 'burn', name: 'Burn', icon: 'burn', lines: ['collections', 'outflow'] },
		{ id: 'income', name: 'Income', icon: 'income', lines: ['collections'] },
		{ id: 'expenses', name: 'Expenses', icon: 'expenses', lines: ['outflow'] },
		{ id: 'funding', name: 'Funding', icon: 'funding', lines: ['capital'] }
	]
};
