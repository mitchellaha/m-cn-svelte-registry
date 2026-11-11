export type ScopeItem = {
	id: string;
	label: string;
	/** Short code shown before the label, such as a job number. */
	code?: string;
};

export type ScopeGroup = {
	id: string;
	label: string;
	itemIds: string[];
};

export type ScopeSwitcherLabels = {
	/** Trigger and list title when nothing is selected. */
	all: string;
	itemsHeading: string;
	groupsHeading: string;
	noGroups: string;
	createGroup: string;
	searchGroups: string;
	searchItems: string;
	empty: string;
	showAll: string;
	selectGroup: string;
	/** Back button that returns to the group list on phones. */
	back: string;
	/** Trigger label when more than one item is selected. */
	selected: (count: number) => string;
};

export const defaultScopeSwitcherLabels: ScopeSwitcherLabels = {
	all: 'All projects',
	itemsHeading: 'Projects',
	groupsHeading: 'Groups',
	noGroups: 'No groups yet.',
	createGroup: 'Create new group',
	searchGroups: 'Filter groups…',
	searchItems: 'Filter projects…',
	empty: 'No project matches.',
	showAll: 'Show all',
	selectGroup: 'Select the whole group',
	back: 'Back to groups',
	selected: (count) => `${count} selected`
};
