<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import type { AppShellModule, AppShellScreen } from './types.js';

	let {
		module,
		active,
		current,
		ref = $bindable(null),
		onNavigate,
		...restProps
	}: HTMLAttributes<HTMLElement> & {
		module: AppShellModule;
		/** The user is on this module's page or one of its screens. */
		active: boolean;
		current?: string;
		ref?: HTMLElement | null;
		onNavigate: (target: AppShellScreen, module: AppShellModule) => void;
	} = $props();

	// The row is the module's own page. With an href the browser can open it in a new tab.
	function onclick(event: MouseEvent) {
		const modified = event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey;
		if (module.href && modified) return;
		event.preventDefault();
		onNavigate(module, module);
	}
</script>

<Sidebar.MenuButton isActive={active} {...restProps}>
	{#snippet child({ props })}
		<!-- Without an href it is a button, so it still takes focus. -->
		<svelte:element
			this={module.href ? 'a' : 'button'}
			bind:this={ref}
			{...props}
			href={module.href}
			type={module.href ? undefined : 'button'}
			aria-current={current === module.id ? 'page' : undefined}
			{onclick}
		>
			{#if module.icon}<module.icon />{/if}
			<span>{module.label}</span>
		</svelte:element>
	{/snippet}
</Sidebar.MenuButton>
