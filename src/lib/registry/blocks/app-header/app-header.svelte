<script lang="ts" module>
	import type { Component, Snippet } from 'svelte';
	import type {
		CommandPaletteAction,
		CommandPaletteLabels
	} from '$lib/registry/blocks/command-palette/types.js';
	import type {
		FeatureMenuLabels,
		FeatureModule,
		FeatureScreen
	} from '$lib/registry/blocks/feature-menu/types.js';
	import type {
		ScopeGroup,
		ScopeItem,
		ScopeSwitcherLabels
	} from '$lib/registry/blocks/scope-switcher/types.js';

	export type AppHeaderUser = {
		name: string;
		email?: string;
		avatar?: string;
		/** Avatar fallback. Defaults to the first letters of the name. */
		initials?: string;
	};

	export type AppHeaderLabels = {
		/** Text on the wide search button (lg and up). */
		search: string;
		/** Accessible name of the icon-only search button (below lg). */
		openSearch: string;
		accountMenu: string;
		profile: string;
		signOut: string;
	};

	export const defaultAppHeaderLabels: AppHeaderLabels = {
		search: 'Search…',
		openSearch: 'Search',
		accountMenu: 'Account menu',
		profile: 'Profile',
		signOut: 'Sign out'
	};

	export type AppHeaderProps = {
		/** Projects (or any scope) for the scope switcher. */
		scopeItems: ScopeItem[];
		scopeGroups?: ScopeGroup[];
		/** Selected scope ids. Empty means everything. */
		scope?: string[];
		/** Scope count shown when nothing is selected. Defaults to scopeItems.length. */
		scopeTotal?: number;
		/** Icon in the scope switcher trigger. */
		scopeIcon?: Component;
		/** Modules and screens for the feature menu and the command palette. */
		modules: FeatureModule[];
		pinned?: string[];
		/** Id of the screen the user is on. */
		current?: string;
		/** Extra commands for the palette. */
		actions?: CommandPaletteAction[];
		user: AppHeaderUser;
		/** Builds a link for a screen. Falls back to screen.href. */
		href?: (screen: FeatureScreen, module: FeatureModule) => string | undefined;
		/** Called when a screen is picked anywhere in the header. Without it, the palette sets location. */
		onNavigate?: (screen: FeatureScreen, module: FeatureModule) => void;
		onAction?: (action: CommandPaletteAction) => void;
		onCreateGroup?: () => void;
		onProfile?: () => void;
		onSignOut?: () => void;
		/** Command palette key, used with Cmd or Ctrl. false turns it off. */
		shortcut?: string | false;
		paletteOpen?: boolean;
		/** Logo or product name at the far left. */
		brand?: Snippet;
		/** Extra buttons placed before the user menu, such as a theme toggle. */
		end?: Snippet;
		/** Extra items in the user menu, between the profile and sign out items. */
		userMenu?: Snippet;
		scopeLabels?: Partial<ScopeSwitcherLabels>;
		featureMenuLabels?: Partial<FeatureMenuLabels>;
		commandPaletteLabels?: Partial<CommandPaletteLabels>;
		labels?: Partial<AppHeaderLabels>;
		class?: string;
	};
</script>

<script lang="ts">
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import SearchIcon from '@lucide/svelte/icons/search';
	import UserIcon from '@lucide/svelte/icons/user';
	import * as Avatar from '#lib/components/ui/avatar/index.js';
	import * as Breadcrumb from '#lib/components/ui/breadcrumb/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.js';
	import { Kbd } from '#lib/components/ui/kbd/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import { cn } from '#lib/utils.js';
	import CommandPalette, {
		isApplePlatform
	} from '$lib/registry/blocks/command-palette/command-palette.svelte';
	import type { CommandPaletteSelection } from '$lib/registry/blocks/command-palette/types.js';
	import FeatureMenu, {
		isModifiedClick
	} from '$lib/registry/blocks/feature-menu/feature-menu.svelte';
	import ScopeSwitcher from '$lib/registry/blocks/scope-switcher/scope-switcher.svelte';

	let {
		scopeItems,
		scopeGroups = [],
		scope = $bindable([]),
		scopeTotal,
		scopeIcon,
		modules,
		pinned = $bindable([]),
		current,
		actions = [],
		user,
		href,
		onNavigate,
		onAction,
		onCreateGroup,
		onProfile,
		onSignOut,
		shortcut = 'k',
		paletteOpen = $bindable(false),
		brand,
		end,
		userMenu,
		scopeLabels,
		featureMenuLabels,
		commandPaletteLabels,
		labels: labelOverrides,
		class: className
	}: AppHeaderProps = $props();

	const labels = $derived({ ...defaultAppHeaderLabels, ...labelOverrides });

	const currentModule = $derived(modules.find((m) => m.screens.some((s) => s.id === current)));
	const moduleHome = $derived(currentModule?.screens[0]);
	const moduleHomeUrl = $derived(
		currentModule && moduleHome ? urlFor(moduleHome, currentModule) : undefined
	);
	const initials = $derived(
		user.initials ??
			user.name
				.split(/\s+/)
				.map((part) => part[0])
				.join('')
				.slice(0, 2)
				.toUpperCase()
	);

	// Show Ctrl+ instead of the Command glyph off Apple platforms.
	let modKey = $state('⌘');
	$effect(() => {
		if (!isApplePlatform()) modKey = 'Ctrl+';
	});

	function urlFor(screen: FeatureScreen, module: FeatureModule) {
		return href ? href(screen, module) : screen.href;
	}

	// Same rules as the feature menu: modified clicks open the link and skip onNavigate.
	function onModuleHomeClick(event: MouseEvent) {
		if (!currentModule || !moduleHome || !onNavigate) return;
		if (event.defaultPrevented || isModifiedClick(event)) return;
		event.preventDefault();
		onNavigate(moduleHome, currentModule);
	}

	function onPaletteSelect(selection: CommandPaletteSelection) {
		if (selection.type === 'action') {
			onAction?.(selection.action);
			return;
		}
		// Hand back the caller's own objects, not the palette's view of them.
		const module = modules.find((m) => m.id === selection.module.id);
		const screen = module?.screens.find((s) => s.id === selection.screen.id);
		if (!module || !screen) return;
		if (onNavigate) onNavigate(screen, module);
		else {
			const url = urlFor(screen, module);
			if (url) window.location.assign(url);
		}
	}
</script>

<header
	data-slot="app-header"
	class={cn(
		'flex h-14 shrink-0 items-center gap-1 border-b bg-card px-3 md:gap-2 md:px-4',
		className
	)}
>
	{#if brand}
		<div class="hidden shrink-0 items-center sm:flex">{@render brand()}</div>
		<Separator orientation="vertical" class="mx-1 hidden h-6! sm:block" />
	{/if}

	<ScopeSwitcher
		items={scopeItems}
		groups={scopeGroups}
		bind:selected={scope}
		total={scopeTotal}
		icon={scopeIcon}
		labels={scopeLabels}
		{onCreateGroup}
		compactOnMobile
	/>

	<Separator orientation="vertical" class="mx-1 hidden h-6! md:block" />

	<!-- Below md only the screen menu shows; the module crumb and its chevron come back at md. -->
	<Breadcrumb.Root class="min-w-0 flex-1 md:flex-initial">
		<Breadcrumb.List class="flex-nowrap">
			{#if currentModule && moduleHome}
				<Breadcrumb.Item class="hidden md:inline-flex">
					{#if moduleHomeUrl}
						<Breadcrumb.Link href={moduleHomeUrl} class="text-sm" onclick={onModuleHomeClick}>
							{currentModule.label}
						</Breadcrumb.Link>
					{:else}
						<button
							type="button"
							class="text-sm transition-colors hover:text-foreground"
							onclick={() => onNavigate?.(moduleHome, currentModule)}
						>
							{currentModule.label}
						</button>
					{/if}
				</Breadcrumb.Item>
				<Breadcrumb.Separator class="hidden md:block" />
			{/if}
			<Breadcrumb.Item class="min-w-0">
				<FeatureMenu
					{modules}
					bind:pinned
					{current}
					{href}
					{onNavigate}
					labels={featureMenuLabels}
				/>
			</Breadcrumb.Item>
		</Breadcrumb.List>
	</Breadcrumb.Root>

	<div class="ml-auto flex shrink-0 items-center gap-1">
		<Button
			variant="outline"
			class="hidden w-48 justify-start font-normal text-muted-foreground lg:flex"
			onclick={() => (paletteOpen = true)}
		>
			<SearchIcon />
			{labels.search}
			{#if shortcut}<Kbd class="ml-auto">{modKey}{shortcut.toUpperCase()}</Kbd>{/if}
		</Button>
		<Button
			variant="ghost"
			size="icon"
			class="lg:hidden"
			aria-label={labels.openSearch}
			onclick={() => (paletteOpen = true)}
		>
			<SearchIcon />
		</Button>

		{@render end?.()}

		<DropdownMenu.Root>
			<DropdownMenu.Trigger
				class="ml-1 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
				aria-label={labels.accountMenu}
			>
				<Avatar.Root>
					{#if user.avatar}<Avatar.Image src={user.avatar} alt={user.name} />{/if}
					<Avatar.Fallback>{initials}</Avatar.Fallback>
				</Avatar.Root>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end" class="w-56">
				<DropdownMenu.Group>
					<DropdownMenu.Label class="flex flex-col gap-0.5">
						<span class="truncate font-medium text-foreground">{user.name}</span>
						{#if user.email}<span class="truncate">{user.email}</span>{/if}
					</DropdownMenu.Label>
				</DropdownMenu.Group>
				{#if onProfile || userMenu}
					<DropdownMenu.Separator />
					<DropdownMenu.Group>
						{#if onProfile}
							<DropdownMenu.Item onSelect={onProfile}>
								<UserIcon />
								{labels.profile}
							</DropdownMenu.Item>
						{/if}
						{@render userMenu?.()}
					</DropdownMenu.Group>
				{/if}
				{#if onSignOut}
					<DropdownMenu.Separator />
					<DropdownMenu.Item variant="destructive" onSelect={onSignOut}>
						<LogOutIcon />
						{labels.signOut}
					</DropdownMenu.Item>
				{/if}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
</header>

<CommandPalette
	data={{ modules, actions }}
	bind:open={paletteOpen}
	onSelect={onPaletteSelect}
	{shortcut}
	labels={commandPaletteLabels}
/>
