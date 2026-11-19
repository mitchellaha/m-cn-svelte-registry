<script lang="ts">
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import NavFlyout from './nav-flyout.svelte';
	import NavLink from './nav-link.svelte';
	import NavRow from './nav-row.svelte';
	import type { AppShellModule, AppShellScreen } from './types.js';

	let {
		modules,
		current,
		onNavigate
	}: {
		modules: AppShellModule[];
		current?: string;
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
</script>

<Sidebar.Group>
	<Sidebar.Menu>
		{#each modules as module (module.id)}
			{@const isPage = module.id === current}
			{@const inside = isPage || module.screens.some((s) => s.id === current)}
			{@const inline = inside || module.alwaysOpen}
			<!-- The row lights up on its own page. On one of its screens the screen lights up
			     instead, unless the screens are hidden (icons only). -->
			{@const active = iconMode ? inside : isPage}
			<Sidebar.MenuItem>
				<!-- Screens show under the module while you are in it; otherwise they open in a
				     flyout beside the row, as they do for every module when icons only. The phone
				     sheet has no room beside it, so iconMode is false there. -->
				{#if iconMode || (!inline && module.screens.length && !sidebar.isMobile)}
					<NavFlyout
						{module}
						{active}
						{isPage}
						{current}
						{iconMode}
						open={openId === module.id}
						onOpenChange={(open) => {
							if (open) openId = module.id;
							else if (openId === module.id) openId = null;
						}}
						onNavigate={navigate}
					/>
				{:else}
					<NavRow {module} {active} {isPage} onNavigate={navigate} />
					{#if inline && module.screens.length}
						<Sidebar.MenuSub class="me-0 border-l-0 pe-0">
							{#each module.screens as screen (screen.id)}
								<Sidebar.MenuSubItem>
									<Sidebar.MenuSubButton
										isActive={screen.id === current}
										class="w-full text-sidebar-foreground/65 data-active:font-medium"
									>
										{#snippet child({ props })}
											<NavLink
												{...props}
												target={screen}
												isPage={screen.id === current}
												onselect={() => navigate(screen, module)}
											>
												<span>{screen.label}</span>
											</NavLink>
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
