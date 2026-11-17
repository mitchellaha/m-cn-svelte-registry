import type { CommandPaletteAction } from '$lib/registry/blocks/command-palette/types.js';
import type { FeatureModule } from '$lib/registry/blocks/feature-menu/types.js';
import type { MetricLedgerData } from '$lib/registry/blocks/metric-ledger/types.js';
import type { ScopeGroup, ScopeItem } from '$lib/registry/blocks/scope-switcher/types.js';
import type { TreasuryData } from '$lib/registry/blocks/treasury-waterfall-grid/types.js';
import type { AppHeaderUser } from '$lib/registry/blocks/app-header/app-header.svelte';

export type DashboardData = {
	/** Page heading under the app header. */
	title: string;
	description?: string;
	header: {
		scopeItems: ScopeItem[];
		scopeGroups?: ScopeGroup[];
		modules: FeatureModule[];
		actions?: CommandPaletteAction[];
		user: AppHeaderUser;
	};
	ledger: { title: string; heading: string; data: MetricLedgerData };
	treasury: { heading: string; data: TreasuryData; defaultMonthIndex?: number };
};
