import type { Component } from 'svelte';
import type { CommandPaletteAction } from '$lib/registry/blocks/command-palette/types.js';

/** A page inside a module. Same shape as a command-palette screen, so one array feeds both. */
export type AppShellScreen = {
	id: string;
	label: string;
	href?: string;
	icon?: Component;
	keywords?: string[];
};

/** A top-level page, such as a module's overview, with its own screens under it. */
export type AppShellModule = AppShellScreen & {
	screens: AppShellScreen[];
	/** Show its screens even when the user is elsewhere, as bookmarks do. */
	alwaysOpen?: boolean;
};

export type AppShellMenuItem = {
	id: string;
	label: string;
	icon?: Component;
	/** Short tag at the end of the row, such as "New" or "9+". */
	badge?: string;
};

export type AppShellUser = {
	name: string;
	email?: string;
	avatar?: string;
	/** Avatar fallback. Defaults to the first letters of the name. */
	initials?: string;
	/** Organization name shown above the user in the account menu. */
	org?: string;
};

export type AppShellNotificationLink = { id: string; label: string };

export type AppShellNotification = {
	id: string;
	title: string;
	body?: string;
	icon?: Component;
	/** Number of events the notification rolls up. */
	count?: number;
	/** Display text, such as "2 days ago". */
	time: string;
	unread: boolean;
	links?: AppShellNotificationLink[];
};

export type AppShellData = {
	/** Product name beside the logo. */
	product: string;
	/** Screens pinned above the modules. */
	bookmarks: AppShellScreen[];
	modules: AppShellModule[];
	/** Extra commands for the search palette. */
	actions?: CommandPaletteAction[];
	/** Help menu in the sidebar footer. */
	help: AppShellMenuItem[];
	/** Account menu groups, separated by a rule. */
	account: AppShellMenuItem[][];
	user: AppShellUser;
	/** Prompts offered in an empty assistant panel. */
	suggestions: string[];
};

export type AppShellPanel = 'notifications' | 'assistant';

export type AppShellLabels = {
	search: string;
	close: string;
	bookmarks: string;
	assistant: string;
	notifications: string;
	account: string;
	help: string;
	settings: string;
	feedback: string;
	toggleSidebar: string;
	darkMode: string;
	signOut: string;
	unread: string;
	all: string;
	markAllRead: string;
	noNotifications: string;
	greeting: string;
	askPlaceholder: string;
	send: string;
};

export const defaultAppShellLabels: AppShellLabels = {
	search: 'Search or ask a question',
	close: 'Close',
	bookmarks: 'Bookmarks',
	assistant: 'Assistant',
	notifications: 'Notifications',
	account: 'Account menu',
	help: 'Help',
	settings: 'Settings',
	feedback: 'Feedback',
	toggleSidebar: 'Toggle sidebar',
	darkMode: 'Dark mode',
	signOut: 'Sign out',
	unread: 'Unread',
	all: 'All',
	markAllRead: 'Mark all as read',
	noNotifications: 'You are all caught up.',
	greeting: 'What can I help with?',
	askPlaceholder: 'Ask, search or build…',
	send: 'Send'
};
