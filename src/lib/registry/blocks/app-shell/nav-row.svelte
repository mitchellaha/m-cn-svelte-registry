<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import NavLink from './nav-link.svelte';
	import type { AppShellModule, AppShellScreen } from './types.js';

	let {
		module,
		active,
		isPage,
		ref = $bindable(null),
		onNavigate,
		...restProps
	}: HTMLAttributes<HTMLElement> & {
		module: AppShellModule;
		/** Highlighted. */
		active: boolean;
		/** The user is on this module's own page. */
		isPage: boolean;
		ref?: HTMLElement | null;
		onNavigate: (target: AppShellScreen, module: AppShellModule) => void;
	} = $props();
</script>

<!-- The row is the module's own page. -->
<Sidebar.MenuButton isActive={active} {...restProps}>
	{#snippet child({ props })}
		<NavLink
			{...props}
			target={module}
			{isPage}
			bind:ref
			onselect={() => onNavigate(module, module)}
		>
			{#if module.icon}<module.icon />{/if}
			<span>{module.label}</span>
		</NavLink>
	{/snippet}
</Sidebar.MenuButton>
