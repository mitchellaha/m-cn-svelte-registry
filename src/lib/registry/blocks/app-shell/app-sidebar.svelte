<script lang="ts">
	import type { Snippet } from 'svelte';
	import BookmarkIcon from '@lucide/svelte/icons/bookmark';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import NavFooter from './nav-footer.svelte';
	import NavMain from './nav-main.svelte';
	import type {
		AppShellData,
		AppShellLabels,
		AppShellMenuItem,
		AppShellModule,
		AppShellScreen
	} from './types.js';

	let {
		data,
		labels,
		current,
		logo,
		onNavigate,
		onHelp,
		onSettings,
		onFeedback
	}: {
		data: AppShellData;
		labels: AppShellLabels;
		current?: string;
		logo?: Snippet;
		onNavigate: (screen: AppShellScreen, module: AppShellModule) => void;
		onHelp?: (item: AppShellMenuItem) => void;
		onSettings?: () => void;
		onFeedback?: () => void;
	} = $props();

	// Bookmarks lead the same menu, so they share its one-flyout-at-a-time state.
	const modules = $derived<AppShellModule[]>(
		data.bookmarks.length
			? [
					{ id: 'bookmarks', label: labels.bookmarks, icon: BookmarkIcon, screens: data.bookmarks },
					...data.modules
				]
			: data.modules
	);
</script>

<!-- Variant "sidebar" without its edge border: the page card beside it supplies the edge. -->
<Sidebar.Root collapsible="icon" class="group-data-[side=left]:border-e-0">
	<Sidebar.Header>
		<div
			class="flex h-8 items-center gap-2 overflow-hidden px-2 text-sm font-semibold whitespace-nowrap [&_svg]:size-4 [&_svg]:shrink-0"
		>
			{@render logo?.()}
			<span class="truncate">{data.product}</span>
		</div>
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain {modules} alwaysOpen={['bookmarks']} {current} {onNavigate} />
	</Sidebar.Content>
	<NavFooter help={data.help} {labels} {onHelp} {onSettings} {onFeedback} />
</Sidebar.Root>
