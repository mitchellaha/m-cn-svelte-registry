<script lang="ts">
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import { Indicator } from '$lib/registry/ui/indicator/index.js';
	import * as Avatar from '#lib/components/ui/avatar/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.js';
	import { Switch } from '#lib/components/ui/switch/index.js';
	import type { AppShellLabels, AppShellMenuItem, AppShellUser } from './types.js';

	let {
		user,
		groups,
		labels,
		dark = $bindable(false),
		onSelect,
		onSignOut
	}: {
		user: AppShellUser;
		groups: AppShellMenuItem[][];
		labels: AppShellLabels;
		dark?: boolean;
		onSelect?: (item: AppShellMenuItem) => void;
		onSignOut?: () => void;
	} = $props();

	const initials = $derived(
		user.initials ??
			user.name
				.split(/\s+/)
				.map((part) => part[0])
				.join('')
				.slice(0, 2)
				.toUpperCase()
	);
	// A dot on the avatar while any item carries a badge, such as unread release notes.
	const badged = $derived(groups.flat().some((item) => item.badge));
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class="ms-1 rounded-full outline-hidden focus-visible:ring-2 focus-visible:ring-ring/50"
		aria-label={labels.account}
	>
		<Indicator dot={badged}>
			<Avatar.Root class="size-8">
				{#if user.avatar}<Avatar.Image src={user.avatar} alt={user.name} />{/if}
				<Avatar.Fallback>{initials}</Avatar.Fallback>
			</Avatar.Root>
		</Indicator>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end" class="w-64">
		<DropdownMenu.Label class="flex flex-col gap-0.5 py-2">
			{#if user.org}
				<span class="truncate text-[11px] tracking-wide uppercase">{user.org}</span>
			{/if}
			<span class="truncate text-sm font-semibold text-foreground">{user.name}</span>
			{#if user.email}<span class="truncate">{user.email}</span>{/if}
		</DropdownMenu.Label>
		{#each groups as group, g (g)}
			<DropdownMenu.Separator />
			<DropdownMenu.Group>
				{#each group as item (item.id)}
					<DropdownMenu.Item onSelect={() => onSelect?.(item)}>
						{#if item.icon}<item.icon />{/if}
						{item.label}
						{#if item.badge}<Badge variant="destructive" class="ms-auto">{item.badge}</Badge>{/if}
					</DropdownMenu.Item>
				{/each}
			</DropdownMenu.Group>
		{/each}
		<DropdownMenu.Separator />
		<DropdownMenu.Item closeOnSelect={false} onSelect={() => (dark = !dark)}>
			<MoonIcon />
			{labels.darkMode}
			<Switch checked={dark} tabindex={-1} aria-hidden="true" class="pointer-events-none ms-auto" />
		</DropdownMenu.Item>
		{#if onSignOut}
			<DropdownMenu.Item onSelect={onSignOut}>
				<LogOutIcon />
				{labels.signOut}
			</DropdownMenu.Item>
		{/if}
	</DropdownMenu.Content>
</DropdownMenu.Root>
