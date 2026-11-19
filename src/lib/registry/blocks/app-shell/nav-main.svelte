<script lang="ts">
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import NavFlyout from './nav-flyout.svelte';
	import NavRow from './nav-row.svelte';
	import type { AppShellModule, AppShellScreen } from './types.js';

	let {
		modules,
		label,
		current,
		/** Modules whose screens always show, such as bookmarks. */
		alwaysOpen = [],
		onNavigate
	}: {
		modules: AppShellModule[];
		label?: string;
		current?: string;
		alwaysOpen?: string[];
		onNavigate: (target: AppShellScreen, module: AppShellModule) => void;
	} = $props();

	const sidebar = Sidebar.useSidebar();
	const iconMode = $derived(sidebar.state === 'collapsed' && !sidebar.isMobile);

	// One flyout at a time across the whole menu.
	let openId = $state<string | null>(null);

	function navigate(target: AppShellScreen, module: AppShellModule) {
		onNavigate(target, module);
		openId = null;
		sidebar.setOpenMobile(false);
	}

	// A module's screens show under it while you are on its page or one of them (or it is always
	// open); otherwise they open in a flyout beside the row. Icons only, every module uses the
	// flyout. The phone sheet has no room beside it, so there every module opens inline.
	function flyout(module: AppShellModule, inline: boolean) {
		if (sidebar.isMobile) return false;
		return iconMode || (!inline && module.screens.length > 0);
	}
</script>

<Sidebar.Group>
	{#if label}<Sidebar.GroupLabel>{label}</Sidebar.GroupLabel>{/if}
	<Sidebar.Menu>
		{#each modules as module (module.id)}
			{@const inside = module.id === current || module.screens.some((s) => s.id === current)}
			{@const inline = inside || alwaysOpen.includes(module.id)}
			<!-- The row lights up on its own page. On one of its screens the screen lights up
			     instead, unless the screens are hidden (icons only). -->
			{@const highlight = iconMode ? inside : module.id === current}
			<Sidebar.MenuItem>
				{#if flyout(module, inline)}
					<NavFlyout
						{module}
						active={highlight}
						{current}
						open={openId === module.id}
						onOpenChange={(open) => {
							if (open) openId = module.id;
							else if (openId === module.id) openId = null;
						}}
						onNavigate={navigate}
					/>
				{:else}
					<NavRow {module} active={highlight} {current} onNavigate={navigate} />
					{#if inline && module.screens.length}
						<Sidebar.MenuSub class="border-l-0">
							{#each module.screens as screen (screen.id)}
								<Sidebar.MenuSubItem>
									<Sidebar.MenuSubButton
										isActive={screen.id === current}
										class="text-sidebar-foreground/65 data-active:font-medium"
									>
										{#snippet child({ props })}
											<!-- Without an href it is a button, so it still takes focus. -->
											<svelte:element
												this={screen.href ? 'a' : 'button'}
												{...props}
												href={screen.href}
												type={screen.href ? undefined : 'button'}
												aria-current={screen.id === current ? 'page' : undefined}
												onclick={(e: MouseEvent) => {
													const modified = e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey;
													if (screen.href && modified) return;
													e.preventDefault();
													navigate(screen, module);
												}}
											>
												<span>{screen.label}</span>
											</svelte:element>
										{/snippet}
									</Sidebar.MenuSubButton>
								</Sidebar.MenuSubItem>
							{/each}
						</Sidebar.MenuSub>
					{/if}
				{/if}
			</Sidebar.MenuItem>
		{/each}
	</Sidebar.Menu>
</Sidebar.Group>
