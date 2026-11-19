<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { AppShellScreen } from './types.js';

	let {
		target,
		isPage,
		onselect,
		ref = $bindable(null),
		children,
		...restProps
	}: Record<string, unknown> & {
		target: AppShellScreen;
		/** The user is on this page. */
		isPage: boolean;
		onselect: () => void;
		ref?: HTMLElement | null;
		children: Snippet;
	} = $props();

	// With an href the browser can open the page in a new tab; a plain click navigates in-app.
	function onclick(event: MouseEvent) {
		const modified =
			event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
		if (target.href && modified) return;
		event.preventDefault();
		onselect();
	}
</script>

<!-- Without an href it is a button, so it still takes focus. -->
<svelte:element
	this={target.href ? 'a' : 'button'}
	bind:this={ref}
	{...restProps}
	href={target.href}
	type={target.href ? undefined : 'button'}
	aria-current={isPage ? 'page' : undefined}
	{onclick}
>
	{@render children()}
</svelte:element>
