<script lang="ts" module>
	import type { AppShellLabels, AppShellNotification, AppShellNotificationLink } from './types.js';

	export type NotificationListProps = {
		notifications?: AppShellNotification[];
		labels: AppShellLabels;
		/** Called after a notification is opened and marked read. */
		onOpen?: (notification: AppShellNotification) => void;
		onLink?: (link: AppShellNotificationLink, notification: AppShellNotification) => void;
	};
</script>

<script lang="ts">
	import BellIcon from '@lucide/svelte/icons/bell';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as ToggleGroup from '#lib/components/ui/toggle-group/index.js';

	let { notifications = $bindable([]), labels, onOpen, onLink }: NotificationListProps = $props();

	let view = $state<'unread' | 'all'>('unread');

	const unread = $derived(notifications.filter((n) => n.unread).length);
	const shown = $derived(view === 'unread' ? notifications.filter((n) => n.unread) : notifications);

	function markRead(id?: string) {
		notifications = notifications.map((n) =>
			id === undefined || n.id === id ? { ...n, unread: false } : n
		);
	}
</script>

<div class="flex items-center gap-2 border-b px-3 py-2">
	<ToggleGroup.Root
		type="single"
		size="sm"
		value={view}
		onValueChange={(v) => v && (view = v as 'unread' | 'all')}
	>
		<ToggleGroup.Item value="unread" class="gap-1.5">
			{labels.unread}
			<Badge variant="secondary" class="h-4 px-1.5 tabular-nums">{unread}</Badge>
		</ToggleGroup.Item>
		<ToggleGroup.Item value="all">{labels.all}</ToggleGroup.Item>
	</ToggleGroup.Root>
	<Button variant="ghost" size="sm" class="ms-auto" disabled={!unread} onclick={() => markRead()}>
		{labels.markAllRead}
	</Button>
</div>

{#if shown.length}
	<ul class="flex flex-col divide-y">
		{#each shown as n (n.id)}
			<li class="relative flex gap-3 px-4 py-3 hover:bg-muted/50">
				{#if n.unread}
					<span
						class="absolute top-4.5 left-1.5 size-1.5 rounded-full bg-blue-500"
						aria-hidden="true"
					></span>
				{/if}
				<span class="mt-0.5 text-muted-foreground [&_svg]:size-4">
					{#if n.icon}<n.icon />{:else}<BellIcon />{/if}
				</span>
				<div class="flex min-w-0 flex-1 flex-col gap-1">
					<div class="flex items-start gap-2">
						<button
							type="button"
							class="min-w-0 flex-1 text-left text-xs font-medium outline-hidden after:absolute after:inset-0 focus-visible:underline"
							onclick={() => {
								markRead(n.id);
								onOpen?.(n);
							}}
						>
							{n.title}
							{#if n.unread}<span class="sr-only">({labels.unread})</span>{/if}
						</button>
						{#if n.count}
							<Badge variant="secondary" class="tabular-nums">{n.count}</Badge>
						{/if}
					</div>
					{#if n.body}<p class="text-xs text-muted-foreground">{n.body}</p>{/if}
					{#if n.links?.length}
						<div class="relative z-10 flex flex-wrap gap-3">
							{#each n.links as link (link.id)}
								<button
									type="button"
									class="text-xs text-blue-600 hover:underline dark:text-blue-400"
									onclick={() => {
										markRead(n.id);
										onLink?.(link, n);
									}}
								>
									{link.label}
								</button>
							{/each}
						</div>
					{/if}
					<p class="text-[11px] text-muted-foreground">{n.time}</p>
				</div>
			</li>
		{/each}
	</ul>
{:else}
	<p class="px-4 py-10 text-center text-xs text-muted-foreground">{labels.noNotifications}</p>
{/if}
