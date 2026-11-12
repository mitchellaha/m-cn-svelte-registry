import type { MetricLedgerData } from './types.js';

// Sample data for the demo. Delete this file once you pass your own.
export const ledgerData: MetricLedgerData = {
	columns: [
		{ id: 'north', label: 'North' },
		{ id: 'south', label: 'South' }
	],
	windows: ['Oct 2026', 'Sep 2026'],
	sections: [
		{
			title: 'Staffing',
			metrics: [
				{
					id: 'headcount',
					label: 'Headcount',
					info: 'Active employees at the latest month end in the window.',
					cells: {
						north: {
							value: 214,
							prior: 209,
							note: 'as of Oct 2026',
							trend: [188, 190, 195, 199, 198, 203, 207, 206, 209, 214]
						},
						south: {
							value: 97,
							prior: 99,
							note: 'as of Oct 2026',
							trend: [104, 103, 103, 101, 102, 100, 98, 99, 99, 97]
						}
					}
				},
				{
					id: 'avg-tenure',
					label: 'Avg tenure',
					formatOptions: { decimals: 1 },
					cells: {
						north: {
							value: 4.2,
							prior: 4.1,
							note: 'years',
							trend: [3.8, 3.8, 3.9, 3.9, 4.0, 4.0, 4.1, 4.1, 4.1, 4.2]
						},
						south: {
							value: 5.6,
							prior: 5.6,
							note: 'years',
							trend: [5.3, 5.4, 5.4, 5.5, 5.5, 5.5, 5.6, 5.6, 5.6, 5.6]
						}
					}
				}
			]
		},
		{
			title: 'Movement',
			metrics: [
				{
					id: 'hires',
					label: 'Hires',
					cells: {
						north: { value: 41, trend: [3, 4, 7, 5, 2, 6, 5, 1, 4, 6] },
						south: { value: 12, trend: [2, 1, 1, 0, 2, 1, 0, 2, 2, 1] }
					}
				},
				{
					id: 'terminations',
					label: 'Terminations',
					lowerIsBetter: true,
					cells: {
						north: { value: 15, note: '9 voluntary', trend: [1, 2, 2, 1, 3, 1, 1, 2, 1, 1] },
						south: { value: 19, note: '14 voluntary', trend: [1, 2, 1, 2, 1, 3, 2, 1, 2, 3] }
					}
				},
				{
					id: 'turnover',
					label: 'Turnover rate',
					info: 'Terminations over average monthly headcount. Lower is better.',
					format: 'percent',
					lowerIsBetter: true,
					cells: {
						north: { value: 0.074, prior: 0.091 },
						south: { value: 0.188, prior: 0.162 }
					}
				},
				{
					id: 'agency-spend',
					label: 'Agency spend',
					format: 'currency',
					formatOptions: { compact: true, decimals: 1 },
					lowerIsBetter: true,
					cells: {
						// South does not use agencies: no cell, so it reads as a dash.
						north: { value: 184_000, prior: 161_000 }
					}
				}
			]
		}
	]
};
