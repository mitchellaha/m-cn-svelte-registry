import {
	demoActions,
	demoGroups,
	demoModules,
	demoProjects,
	demoUser
} from '$lib/registry/blocks/app-header/demo-data.js';
import { ledgerData } from '$lib/registry/blocks/metric-ledger/metric-ledger-data.js';
import { treasuryData } from '$lib/registry/blocks/treasury-waterfall-grid/treasury-waterfall-grid-data.js';
import type { DashboardData } from './types.js';

// Sample data, borrowed from the demos of the blocks this page composes. Delete this file once you pass your own.
export const dashboardData: DashboardData = {
	title: 'Overview',
	description: 'Staffing and cash across every project.',
	header: {
		scopeItems: demoProjects,
		scopeGroups: demoGroups,
		modules: demoModules,
		actions: demoActions,
		user: demoUser
	},
	ledger: { heading: 'Key metrics', title: 'Staffing and movement', data: ledgerData },
	treasury: { heading: 'Cash waterfall', data: treasuryData, defaultMonthIndex: 2 }
};
