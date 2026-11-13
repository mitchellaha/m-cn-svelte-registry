<script lang="ts">
	import MenuIcon from '@lucide/svelte/icons/menu';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunIcon from '@lucide/svelte/icons/sun';
	import { toggleMode } from 'mode-watcher';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import * as Sheet from '#lib/components/ui/sheet/index.js';
	import { cn } from '#lib/utils.js';
	import { groups } from './groups.js';
	import SiteSidebar from './site-sidebar.svelte';

	let menuOpen = $state(false);

	const linkClass = (route: string) =>
		cn(
			'rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground',
			page.route.id === route && 'font-medium text-foreground'
		);
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
		<a href={resolve('/')} class="flex items-center gap-2">
			<span
				class="flex size-6 items-center justify-center rounded-md bg-primary font-mono text-[0.625rem] font-semibold text-primary-foreground"
			>
				m
			</span>
			<span class="hidden text-sm font-medium sm:inline">m-cn-svelte</span>
		</a>
		<Separator orientation="vertical" class="hidden h-4! sm:block" />
		<nav class="flex items-center gap-0.5" aria-label="Pages">
			<a
				href={resolve('/')}
				aria-current={page.route.id === '/' ? 'page' : undefined}
				class={linkClass('/')}>Components</a
			>
			<!-- /sink sets trailingSlash: 'always', so link straight to the folder index. -->
			<a
				href="{resolve('/sink')}/"
				aria-current={page.route.id === '/sink' ? 'page' : undefined}
				class={linkClass('/sink')}>Kitchen sink</a
			>
		</nav>
		<div class="ml-auto flex items-center gap-1">
			<Button
				variant="ghost"
				size="sm"
				class="hidden sm:inline-flex"
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
