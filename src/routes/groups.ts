import registry from '../../registry.json';

// Every page and the sidebar share this order, so the sidebar highlight moves down as you scroll.
export const groups = [
	{ label: 'Components', items: registry.items.filter((i) => i.type === 'registry:ui') },
	{ label: 'Blocks', items: registry.items.filter((i) => i.type === 'registry:block') }
].filter((g) => g.items.length);

export type Group = (typeof groups)[number];
