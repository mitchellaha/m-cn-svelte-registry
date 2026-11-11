import type { Component } from 'svelte';

export type FeatureScreen = {
	id: string;
	label: string;
	description?: string;
	icon?: Component;
	href?: string;
};

export type FeatureModule = {
	id: string;
	label: string;
	icon?: Component;
	screens: FeatureScreen[];
};

export type FeatureMenuLabels = {
	trigger: string;
	search: string;
	modules: string;
	pinned: string;
	pinnedEmpty: string;
	empty: string;
	pin: (screen: string) => string;
	unpin: (screen: string) => string;
};

export const defaultFeatureMenuLabels: FeatureMenuLabels = {
	trigger: 'Menu',
	search: 'Find a screen…',
	modules: 'Modules',
	pinned: 'Pinned',
	pinnedEmpty: 'Screens you pin show up here.',
	empty: 'No screen matches.',
	pin: (screen) => `Pin ${screen}`,
	unpin: (screen) => `Unpin ${screen}`
};
