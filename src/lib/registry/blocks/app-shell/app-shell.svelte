<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { CommandPaletteAction } from '$lib/registry/blocks/command-palette/types.js';
	import type {
		AppShellData,
		AppShellLabels,
		AppShellMenuItem,
		AppShellModule,
		AppShellNotification,
		AppShellNotificationLink,
		AppShellPanel,
		AppShellScreen
	} from './types.js';

	export type AppShellProps = {
		data: AppShellData;
		/** Id of the screen the user is on. */
		current?: string;
		/** Right-hand panel that is open, if any. */
		panel?: AppShellPanel | null;
		notifications?: AppShellNotification[];
		/** Desktop sidebar expanded (true) or icons only (false). Cmd/Ctrl+B toggles it. */
		sidebarOpen?: boolean;
		/** State of the dark mode switch in the account menu. The consumer applies it. */
		dark?: boolean;
		labels?: Partial<AppShellLabels>;
		/** Logo, shown at 16px. */
		logo?: Snippet;
		/** The page. */
		children?: Snippet;
		/** Conversation in the assistant panel. Without it the greeting and suggestions show. */
		conversation?: Snippet;
		onNavigate?: (screen: AppShellScreen, module: AppShellModule) => void;
		onAction?: (action: CommandPaletteAction) => void;
		onAsk?: (prompt: string) => void;
		onAccount?: (item: AppShellMenuItem) => void;
		onHelp?: (item: AppShellMenuItem) => void;
		onSettings?: () => void;
		onFeedback?: () => void;
		onSignOut?: () => void;
		onNotification?: (notification: AppShellNotification) => void;
		onNotificationLink?: (
			link: AppShellNotificationLink,
			notification: AppShellNotification
		) => void;
		class?: string;
	};
</script>

<script lang="ts">
	import CommandPalette from '$lib/registry/blocks/command-palette/command-palette.svelte';
	import { SidePanel } from '$lib/registry/ui/side-panel/index.js';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import { cn } from '#lib/utils.js';
	import AppSidebar from './app-sidebar.svelte';
	import AssistantPanel from './assistant-panel.svelte';
	import NotificationList from './notification-list.svelte';
	import ShellHeader from './shell-header.svelte';
	import { defaultAppShellLabels } from './types.js';

	let {
		data,
		current = $bindable(),
		panel = $bindable(null),
		notifications = $bindable([]),
		sidebarOpen = $bindable(true),
		dark = $bindable(false),
		labels: labelOverrides,
		logo,
		children,
		conversation,
		onNavigate,
		onAction,
		onAsk,
		onAccount,
		onHelp,
		onSettings,
		onFeedback,
		onSignOut,
		onNotification,
		onNotificationLink,
		class: className
	}: AppShellProps = $props();

	const labels = $derived({ ...defaultAppShellLabels, ...labelOverrides });
	const unread = $derived(notifications.filter((n) => n.unread).length);

	let searchOpen = $state(false);

	function navigate(screen: AppShellScreen, module: AppShellModule) {
		current = screen.id;
		onNavigate?.(screen, module);
	}
</script>

<Sidebar.Provider
	bind:open={sidebarOpen}
	class={cn('bg-sidebar', className)}
	style="--sidebar-width: 15rem;"
>
	<AppSidebar
		{data}
		{labels}
		{current}
		{logo}
		onNavigate={navigate}
		{onHelp}
		{onSettings}
		{onFeedback}
	/>
	<Sidebar.Inset class="min-w-0 bg-sidebar">
		<ShellHeader
			{data}
			{labels}
			{unread}
			bind:panel
			bind:dark
			onSearch={() => (searchOpen = true)}
			{onAccount}
			{onSignOut}
		/>
		<div class="flex flex-1 gap-2 px-2 pb-2 md:ps-0">
			<div class="min-w-0 flex-1 rounded-xl bg-background shadow-sm ring-1 ring-foreground/5">
				{@render children?.()}
			</div>
			<SidePanel
				bind:open={() => panel !== null, (open) => !open && (panel = null)}
				title={panel === 'assistant' ? labels.assistant : labels.notifications}
				class="sticky top-12 h-[calc(100svh-3.5rem)] rounded-xl shadow-sm ring-1 ring-foreground/10"
			>
				{#if panel === 'assistant'}
					<AssistantPanel suggestions={data.suggestions} {labels} {onAsk} children={conversation} />
				{:else}
					<NotificationList
						bind:notifications
						{labels}
						onOpen={onNotification}
						onLink={onNotificationLink}
					/>
				{/if}
			</SidePanel>
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>

<CommandPalette
	bind:open={searchOpen}
	data={{ modules: data.modules, actions: data.actions }}
	onSelect={(selection) =>
		selection.type === 'action'
			? onAction?.(selection.action)
			: navigate(selection.screen, selection.module)}
/>
