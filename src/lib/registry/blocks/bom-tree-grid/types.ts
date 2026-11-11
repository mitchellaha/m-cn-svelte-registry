export type Supply = 'stocked' | 'single-source' | 'long-lead' | 'shortage';

export type BomIcon =
	| 'settings'
	| 'rocket'
	| 'target'
	| 'layers'
	| 'cable'
	| 'flame'
	| 'spin'
	| 'box'
	| 'activity'
	| 'repeat'
	| 'battery'
	| 'frame'
	| 'grid'
	| 'truck'
	| 'gauge';

/** Authored input: only leaves carry cost, lead time and supply. */
export interface BomNode {
	id: string;
	name: string;
	number: string;
	icon: BomIcon;
	qty: number;
	unitCost?: number;
	leadTimeDays?: number;
	supply?: Supply;
	children?: BomNode[];
}

/** Derived row: every level has a rolled-up cost, lead time and supply. */
export interface BomRow {
	id: string;
	name: string;
	number: string;
	icon: BomIcon;
	qty: number;
	unitCost?: number;
	extendedCost: number;
	leadTimeDays: number;
	supply: Supply;
	share: number;
	children?: BomRow[];
}

export type FlatBomRow = BomRow & { depth: number };
