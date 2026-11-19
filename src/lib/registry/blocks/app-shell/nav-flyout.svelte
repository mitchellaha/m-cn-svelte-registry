<script lang="ts">
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import { mergeProps } from 'bits-ui';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.js';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import { cn } from '#lib/utils.js';
	import type { AppShellModule, AppShellScreen } from './types.js';

	let {
		module,
		active,
		current,
		open,
		onOpenChange,
		onNavigate
	}: {
		module: AppShellModule;
		active: boolean;
		current?: string;
		/** Controlled by the nav, so only one flyout is open at a time. */
		open: boolean;
		onOpenChange: (open: boolean) => void;
		onNavigate: (screen: AppShellScreen, module: AppShellModule) => void;
	} = $props();

	const sidebar = Sidebar.useSidebar();
	const iconMode = $derived(sidebar.state === 'collapsed');

	// Hover opens the menu without moving focus; click and keyboard open it as a normal menu.
	let byHover = false;
	let overTrigger = false;
	let timer: ReturnType<typeof setTimeout> | undefined;

	function hoverOpen(event: PointerEvent) {
		overTrigger = true;
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

	// Changes the menu itself asks for: a click, a key, Escape, or a click outside.
	function setOpen(next: boolean) {
		// Clicking a row that hover already opened keeps the menu open.
		if (!next && byHover && overTrigger) {
			byHover = false;
			return;
		}
		if (next) byHover = false;
		onOpenChange(next);
	}
</script>

<DropdownMenu.Root bind:open={() => open, setOpen}>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Sidebar.MenuButton
				{...mergeProps(props, {
					onpointerenter: hoverOpen,
					onpointerleave: () => {
						overTrigger = false;
						hoverClose();
					}
				})}
				isActive={active}
				aria-label={module.label}
			>
				{#if module.icon}<module.icon />{/if}
				<span>{module.label}</span>
				<ChevronRightIcon class="ms-auto opacity-50" />
			</Sidebar.MenuButton>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content
		side="right"
		align="start"
		sideOffset={iconMode ? 8 : 4}
		alignOffset={-4}
		preventScroll={false}
		onOpenAutoFocus={(e) => byHover && e.preventDefault()}
		onCloseAutoFocus={(e) => byHover && e.preventDefault()}
		onpointerenter={() => clearTimeout(timer)}
		onpointerleave={hoverClose}
		class="w-52 animate-none! transition-none data-closed:hidden"
	>
		{#if iconMode}<DropdownMenu.Label>{module.label}</DropdownMenu.Label>{/if}
		{#each module.screens as screen (screen.id)}
			<DropdownMenu.Item
				class={cn('transition-none', screen.id === current && 'font-medium')}
				onSelect={() => onNavigate(screen, module)}
			>
				{screen.label}
			</DropdownMenu.Item>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
