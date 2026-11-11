import type { Component } from 'svelte';

export type CommandPaletteScreen = {
	id: string;
	label: string;
	description?: string;
	icon?: Component;
	href?: string;
	keywords?: string[];
};

export type CommandPaletteModule = {
	id: string;
	label: string;
	icon?: Component;
	screens: CommandPaletteScreen[];
};

export type CommandPaletteAction = {
	id: string;
	label: string;
	icon?: Component;
	/** Display-only hint shown at the end of the row, such as "N". */
	shortcut?: string;
	keywords?: string[];
};

export type CommandPaletteData = {
	modules: CommandPaletteModule[];
	actions?: CommandPaletteAction[];
};

export type CommandPaletteSelection =
	| { type: 'screen'; screen: CommandPaletteScreen; module: CommandPaletteModule }
	| { type: 'action'; action: CommandPaletteAction };

export type CommandPaletteLabels = {
	title: string;
	description: string;
	placeholder: string;
	empty: string;
	screens: string;
	actions: string;
};

export const defaultCommandPaletteLabels: CommandPaletteLabels = {
	title: 'Command palette',
	description: 'Jump to a screen or start an action.',
	placeholder: 'Type a screen or a command…',
	empty: 'No results.',
	screens: 'Screens',
	actions: 'Actions'
};
