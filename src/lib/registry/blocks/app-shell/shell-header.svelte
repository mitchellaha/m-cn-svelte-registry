<script lang="ts">
	import { onMount } from 'svelte';
	import BellIcon from '@lucide/svelte/icons/bell';
	import SearchIcon from '@lucide/svelte/icons/search';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import { isApplePlatform } from '$lib/registry/blocks/command-palette/command-palette.svelte';
	import { Indicator } from '$lib/registry/ui/indicator/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Kbd } from '#lib/components/ui/kbd/index.js';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import AccountMenu from './account-menu.svelte';
	import type { AppShellData, AppShellLabels, AppShellMenuItem, AppShellPanel } from './types.js';

	let {
		data,
		labels,
		unread,
		panel = $bindable(null),
		dark = $bindable(false),
		onSearch,
		onAccount,
		onSignOut
	}: {
		data: AppShellData;
		labels: AppShellLabels;
		unread: number;
		panel?: AppShellPanel | null;
		dark?: boolean;
		onSearch: () => void;
		onAccount?: (item: AppShellMenuItem) => void;
		onSignOut?: () => void;
	} = $props();

	// Unknown until mount, so the prerendered page shows no shortcut rather than the wrong one.
	let apple = $state<boolean | null>(null);
	onMount(() => {
		apple = isApplePlatform();
	});

	const toggle = (which: AppShellPanel) => (panel = panel === which ? null : which);
</script>

<header class="flex h-12 shrink-0 items-center gap-2 bg-sidebar ps-2 pe-3">
	<Sidebar.Trigger class="md:hidden" aria-label={labels.toggleSidebar} />
	<button
		type="button"
		class="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-md border bg-background px-2.5 text-xs text-muted-foreground shadow-xs outline-hidden hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 sm:max-w-sm [&_svg]:size-3.5 [&_svg]:shrink-0"
		onclick={onSearch}
	>
		<SearchIcon />
		<span class="truncate">{labels.search}</span>
		{#if apple !== null}
			<Kbd class="ms-auto max-sm:hidden">{apple ? '⌘K' : 'Ctrl K'}</Kbd>
		{/if}
	</button>
	<div class="ms-auto flex items-center gap-1">
		<Button
			variant={panel === 'assistant' ? 'secondary' : 'ghost'}
			size="icon-lg"
			aria-label={labels.assistant}
			aria-pressed={panel === 'assistant'}
			onclick={() => toggle('assistant')}
		>
			<SparklesIcon />
		</Button>
		<Button
			variant={panel === 'notifications' ? 'secondary' : 'ghost'}
			size="icon-lg"
			aria-label={labels.notifications}
			aria-pressed={panel === 'notifications'}
			onclick={() => toggle('notifications')}
		>
			<Indicator count={unread} max={20} label="{unread} {labels.unread}">
				<BellIcon class="size-4" />
			</Indicator>
		</Button>
		<AccountMenu
			user={data.user}
			groups={data.account}
			{labels}
			bind:dark
			onSelect={onAccount}
			{onSignOut}
		/>
	</div>
</header>
