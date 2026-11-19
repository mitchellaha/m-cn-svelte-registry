<script lang="ts">
	import { tick } from 'svelte';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.js';
	import { cn } from '#lib/utils.js';
	import NavRow from './nav-row.svelte';
	import type { AppShellModule, AppShellScreen } from './types.js';

	let {
		module,
		active,
		isPage,
		current,
		iconMode,
		open,
		onOpenChange,
		onNavigate
	}: {
		module: AppShellModule;
		active: boolean;
		isPage: boolean;
		current?: string;
		/** The sidebar shows icons only: the menu carries the module's name. */
		iconMode: boolean;
		/** Controlled by the nav, so only one flyout is open at a time. */
		open: boolean;
		onOpenChange: (open: boolean) => void;
		onNavigate: (target: AppShellScreen, module: AppShellModule) => void;
	} = $props();

	// The row is a link to the module's page; the menu of its screens hangs off it.
	// Hover opens the menu without moving focus. ArrowRight opens it with focus in it.
	let row = $state<HTMLElement | null>(null);
	let menu = $state<HTMLElement | null>(null);
	let byHover = false;
	let timer: ReturnType<typeof setTimeout> | undefined;
	$effect(() => () => clearTimeout(timer));

	function hoverOpen(event: PointerEvent) {
		if (event.pointerType !== 'mouse') return;
		clearTimeout(timer);
		if (open) return;
		byHover = true;
		onOpenChange(true);
	}

	// A short grace period lets the pointer cross from the row into the menu.
	function hoverClose() {
		clearTimeout(timer);
		if (byHover) timer = setTimeout(() => onOpenChange(false), 100);
	}

	// Focus moves to the first screen here rather than through Bits' auto-focus, which does not
	// run for a menu opened from code; this also covers a menu that hover already opened.
	function onkeydown(event: KeyboardEvent) {
		if (event.key !== 'ArrowRight') return;
		event.preventDefault();
		openByKeyboard();
	}

	// A heading row (bookmarks) has no page, so a click or Enter opens its menu the same way.
	async function openByKeyboard() {
		clearTimeout(timer);
		byHover = false;
		onOpenChange(true);
		await tick();
		requestAnimationFrame(() => menu?.querySelector<HTMLElement>('[role=menuitem]')?.focus());
	}

	// After a keyboard pick the row may unmount (its module now shows inline), which would drop
	// focus to the page, so move it to the new current entry. Mouse picks leave focus alone.
	async function pick(screen: AppShellScreen) {
		const nav = row?.closest('[data-sidebar=menu]');
		onNavigate(screen, module);
		if (byHover) return;
		await tick();
		nav?.querySelector<HTMLElement>('[aria-current=page]')?.focus();
	}
</script>

<NavRow
	{module}
	{active}
	{isPage}
	bind:ref={row}
	{onNavigate}
	onActivate={openByKeyboard}
	aria-haspopup="menu"
	aria-expanded={open}
	onpointerenter={hoverOpen}
	onpointerleave={hoverClose}
	{onkeydown}
/>
<DropdownMenu.Root bind:open={() => open, onOpenChange}>
	<DropdownMenu.Content
		customAnchor={row}
		side="right"
		align="start"
		sideOffset={iconMode ? 8 : 4}
		alignOffset={-4}
		preventScroll={false}
		bind:ref={menu}
		onOpenAutoFocus={(e) => e.preventDefault()}
		onCloseAutoFocus={(e) => {
			e.preventDefault();
			if (!byHover) row?.focus();
		}}
		onpointerenter={() => clearTimeout(timer)}
		onpointerleave={hoverClose}
		class="w-52 animate-none! transition-none outline-none data-closed:hidden"
	>
		{#if iconMode}<DropdownMenu.Label>{module.label}</DropdownMenu.Label>{/if}
		{#each module.screens as screen (screen.id)}
			<DropdownMenu.Item
				class={cn(
					// Mira highlights items on :focus only, which does not match until the page has
					// focus, so a hover-opened menu on a page not yet clicked showed no highlight.
					'transition-none hover:bg-accent hover:text-accent-foreground',
					screen.id === current && 'font-medium'
				)}
				onSelect={() => pick(screen)}
			>
				{screen.label}
			</DropdownMenu.Item>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
