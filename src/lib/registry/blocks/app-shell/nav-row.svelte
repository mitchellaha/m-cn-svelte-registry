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
		onActivate,
		...restProps
	}: HTMLAttributes<HTMLElement> & {
		module: AppShellModule;
		/** Highlighted. */
		active: boolean;
		/** The user is on this module's own page. */
		isPage: boolean;
		ref?: HTMLElement | null;
		onNavigate: (target: AppShellScreen, module: AppShellModule) => void;
		/** A heading row's click action, such as opening its flyout. Without it the heading is plain text. */
		onActivate?: () => void;
	} = $props();
</script>

<Sidebar.MenuButton isActive={active} {...restProps}>
	{#snippet child({ props })}
		{#if module.heading && !onActivate}
			<!-- A heading labels its screens and is not a page of its own. -->
			<div bind:this={ref} {...props} class={[props.class, 'pointer-events-none']}>
				{#if module.icon}<module.icon />{/if}
				<span>{module.label}</span>
			</div>
		{:else}
			<!-- The row is the module's own page. -->
			<NavLink
				{...props}
				target={module.heading ? { id: module.id, label: module.label } : module}
				{isPage}
				bind:ref
				onselect={() => (module.heading ? onActivate?.() : onNavigate(module, module))}
			>
				{#if module.icon}<module.icon />{/if}
				<span>{module.label}</span>
			</NavLink>
		{/if}
	{/snippet}
</Sidebar.MenuButton>
