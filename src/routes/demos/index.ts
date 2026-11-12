import type { Component } from 'svelte';
import AppHeaderDemo from '$lib/registry/blocks/app-header/app-header-demo.svelte';
import BomTreeGridDemo from '$lib/registry/blocks/bom-tree-grid/bom-tree-grid-demo.svelte';
import CommandPaletteDemo from '$lib/registry/blocks/command-palette/command-palette-demo.svelte';
import FeatureMenuDemo from '$lib/registry/blocks/feature-menu/feature-menu-demo.svelte';
import MetricLedgerDemo from '$lib/registry/blocks/metric-ledger/metric-ledger-demo.svelte';
import ScopeSwitcherDemo from '$lib/registry/blocks/scope-switcher/scope-switcher-demo.svelte';
import TreasuryWaterfallGridDemo from '$lib/registry/blocks/treasury-waterfall-grid/treasury-waterfall-grid-demo.svelte';
import CopyButtonDemo from './copy-button-demo.svelte';
import DataGridDemo from './data-grid-demo.svelte';
import DeltaPillDemo from './delta-pill-demo.svelte';
import IconTileDemo from './icon-tile-demo.svelte';
import CompoundTagDemo from './compound-tag-demo.svelte';
import StarRatingDemo from './star-rating-demo.svelte';
import StatusBadgeDemo from './status-badge-demo.svelte';

export type Demo = {
	component: Component;
	/** Iframe height in Phone and Tablet modes. Popovers and dialogs must fit inside it open. */
	height: number;
	/** Pads the standalone route. Demos that center themselves in a muted box sit flush. */
	padded: boolean;
};

// One entry per registry.json item, shared by the main page and /preview/[name].
export const demos: Record<string, Demo> = {
	'copy-button': { component: CopyButtonDemo, height: 240, padded: false },
	'icon-tile': { component: IconTileDemo, height: 240, padded: false },
	'status-badge': { component: StatusBadgeDemo, height: 160, padded: false },
	'star-rating': { component: StarRatingDemo, height: 200, padded: false },
	'compound-tag': { component: CompoundTagDemo, height: 260, padded: false },
	'delta-pill': { component: DeltaPillDemo, height: 240, padded: false },
	'data-grid': { component: DataGridDemo, height: 480, padded: true },
	'bom-tree-grid': { component: BomTreeGridDemo, height: 760, padded: true },
	'treasury-waterfall-grid': { component: TreasuryWaterfallGridDemo, height: 760, padded: true },
	'scope-switcher': { component: ScopeSwitcherDemo, height: 600, padded: true },
	'feature-menu': { component: FeatureMenuDemo, height: 640, padded: true },
	'command-palette': { component: CommandPaletteDemo, height: 540, padded: true },
	'app-header': { component: AppHeaderDemo, height: 640, padded: true },
	'metric-ledger': { component: MetricLedgerDemo, height: 520, padded: true }
};

export type Viewport = 'phone' | 'tablet' | 'desktop';

export const viewports: { value: Viewport; label: string; width?: number }[] = [
	{ value: 'phone', label: 'Phone', width: 390 },
	{ value: 'tablet', label: 'Tablet', width: 768 },
	{ value: 'desktop', label: 'Desktop' }
];
