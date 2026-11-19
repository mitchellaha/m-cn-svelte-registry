<script lang="ts">
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import * as Collapsible from '#lib/components/ui/collapsible/index.js';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import NavFlyout from './nav-flyout.svelte';
	import type { AppShellModule, AppShellScreen } from './types.js';

	let {
		modules,
		label,
		current,
		/** Modules open even when the user is elsewhere, such as bookmarks. */
		alwaysOpen = [],
		onNavigate
	}: {
		modules: AppShellModule[];
		label?: string;
		current?: string;
		alwaysOpen?: string[];
		onNavigate: (screen: AppShellScreen, module: AppShellModule) => void;
	} = $props();

	const sidebar = Sidebar.useSidebar();

	// A module opens inline while you are in it (or it is always open); otherwise its screens
	// open in a flyout beside the row. Icons only, every module uses the flyout. The phone sheet
	// has no room beside it, so there every module opens inline.
	function flyout(id: string, active: boolean) {
		if (sidebar.isMobile) return false;
		return sidebar.state === 'collapsed' || !(active || alwaysOpen.includes(id));
	}

	// One flyout at a time across the whole menu.
	let openId = $state<string | null>(null);

	// A screen with an href is a link the browser can open in a new tab; a plain click navigates in-app.
	function go(event: MouseEvent, screen: AppShellScreen, module: AppShellModule) {
		const modified = event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey;
		if (screen.href && modified) return;
		event.preventDefault();
		onNavigate(screen, module);
		sidebar.setOpenMobile(false);
	}
</script>

<Sidebar.Group>
	{#if label}<Sidebar.GroupLabel>{label}</Sidebar.GroupLabel>{/if}
	<Sidebar.Menu>
		{#each modules as module (module.id)}
			{@const active = module.screens.some((s) => s.id === current)}
			{#if flyout(module.id, active)}
				<Sidebar.MenuItem>
					<NavFlyout
						{module}
						{active}
						{current}
						open={openId === module.id}
						onOpenChange={(open) => {
							if (open) openId = module.id;
							else if (openId === module.id) openId = null;
						}}
						{onNavigate}
					/>
				</Sidebar.MenuItem>
			{:else}
				<Collapsible.Root open={active || alwaysOpen.includes(module.id)} class="group/collapsible">
					{#snippet child({ props })}
						<Sidebar.MenuItem {...props}>
							<Collapsible.Trigger>
								{#snippet child({ props })}
									<Sidebar.MenuButton {...props} isActive={active}>
										{#if module.icon}<module.icon />{/if}
										<span>{module.label}</span>
										<ChevronRightIcon
											class="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
										/>
									</Sidebar.MenuButton>
								{/snippet}
							</Collapsible.Trigger>
							<Collapsible.Content>
								<Sidebar.MenuSub>
									{#each module.screens as screen (screen.id)}
										<Sidebar.MenuSubItem>
											<Sidebar.MenuSubButton
												isActive={screen.id === current}
												class="text-sidebar-foreground/65 data-active:bg-transparent data-active:font-medium data-active:text-sidebar-foreground"
											>
												{#snippet child({ props })}
													<!-- Without an href it is a button, so it still takes focus. -->
													<svelte:element
														this={screen.href ? 'a' : 'button'}
														{...props}
														href={screen.href}
														type={screen.href ? undefined : 'button'}
														aria-current={screen.id === current ? 'page' : undefined}
														onclick={(e: MouseEvent) => go(e, screen, module)}
													>
														<span>{screen.label}</span>
													</svelte:element>
												{/snippet}
											</Sidebar.MenuSubButton>
										</Sidebar.MenuSubItem>
									{/each}
								</Sidebar.MenuSub>
							</Collapsible.Content>
						</Sidebar.MenuItem>
					{/snippet}
				</Collapsible.Root>
			{/if}
		{/each}
	</Sidebar.Menu>
</Sidebar.Group>
