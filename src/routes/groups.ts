import registry from '../../registry.json';

// Every page and the sidebar share this order, so the sidebar highlight moves down as you scroll.
export const groups = [
	{ label: 'Components', items: registry.items.filter((i) => i.type === 'registry:ui') },
	{
		label: 'Composites',
		// Page-level blocks (categories: ["page"]) live on /blocks instead.
		items: registry.items.filter(
			(i) =>
				i.type === 'registry:block' &&
				!(i as { categories?: string[] }).categories?.includes('page')
		)
	}
].filter((g) => g.items.length);

export type Group = (typeof groups)[number];
