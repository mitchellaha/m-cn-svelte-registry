<script lang="ts">
	import { groups } from '../groups.js';
	import SiteHeader from '../site-header.svelte';
	import SiteSidebar from '../site-sidebar.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<div class="min-h-svh bg-background">
	<SiteHeader />
	<div class="mx-auto flex max-w-screen-2xl gap-8 px-4 sm:px-6">
		<aside
			class="sticky top-12 hidden h-[calc(100svh-3rem)] w-52 shrink-0 overflow-y-auto border-r py-6 pr-4 lg:block"
		>
			<SiteSidebar {groups} />
		</aside>
		<main class="flex min-w-0 flex-1 flex-col gap-6 py-6">
			{@render children()}
		</main>
	</div>
</div>
