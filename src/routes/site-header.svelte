<script lang="ts">
	import MenuIcon from '@lucide/svelte/icons/menu';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunIcon from '@lucide/svelte/icons/sun';
	import { toggleMode } from 'mode-watcher';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import * as Sheet from '#lib/components/ui/sheet/index.js';
	import SiteSidebar from './site-sidebar.svelte';

	type Group = { label: string; items: { name: string; title: string }[] };

	let { groups }: { groups: Group[] } = $props();

	const count = $derived(groups.reduce((n, g) => n + g.items.length, 0));
	let menuOpen = $state(false);
</script>

<header
	class="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
	<div class="mx-auto flex h-12 max-w-screen-2xl items-center gap-3 px-4 sm:px-6">
		<Sheet.Root bind:open={menuOpen}>
			<Sheet.Trigger>
				{#snippet child({ props })}
					<Button
						{...props}
						variant="ghost"
						size="icon"
						class="-ml-1 lg:hidden"
						aria-label="Open menu"
					>
						<MenuIcon />
					</Button>
				{/snippet}
			</Sheet.Trigger>
			<Sheet.Content side="left" class="w-64 gap-0">
				<Sheet.Header class="border-b">
					<Sheet.Title>m-cn-svelte</Sheet.Title>
				</Sheet.Header>
				<div class="overflow-y-auto p-4">
					<SiteSidebar {groups} onnavigate={() => (menuOpen = false)} />
				</div>
			</Sheet.Content>
		</Sheet.Root>
		<a href="#top" class="flex items-center gap-2">
			<span
				class="flex size-6 items-center justify-center rounded-md bg-primary font-mono text-[0.625rem] font-semibold text-primary-foreground"
			>
				m
			</span>
			<span class="text-sm font-medium">m-cn-svelte</span>
		</a>
		<Separator orientation="vertical" class="hidden h-4! sm:block" />
		<span class="hidden text-xs text-muted-foreground sm:inline">{count} items</span>
		<div class="ml-auto flex items-center gap-1">
			<Button
				variant="ghost"
				size="sm"
				href="https://github.com/mitchellaha/m-cn-svelte-registry"
				target="_blank"
				rel="noopener"
			>
				GitHub
			</Button>
			<Button variant="ghost" size="icon" onclick={toggleMode} aria-label="Toggle dark mode">
				<SunIcon class="scale-100 rotate-0 transition-transform dark:scale-0 dark:-rotate-90" />
				<MoonIcon
					class="absolute scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0"
				/>
			</Button>
		</div>
	</div>
</header>
