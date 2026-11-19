<script lang="ts">
	import BellIcon from '@lucide/svelte/icons/bell';
	import MailIcon from '@lucide/svelte/icons/mail';
	import * as Avatar from '#lib/components/ui/avatar/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Indicator } from '$lib/registry/ui/indicator/index.js';
</script>

<div class="flex min-h-40 items-center justify-center gap-6 rounded-lg bg-muted/40 p-6">
	<Button variant="outline" size="icon-lg" aria-label="Notifications">
		<Indicator count={3} label="3 unread"><BellIcon class="size-4" /></Indicator>
	</Button>
	<Button variant="outline" size="icon-lg" aria-label="Messages">
		<Indicator count={128} max={20} label="More than 20 unread"
			><MailIcon class="size-4" /></Indicator
		>
	</Button>
	<Indicator dot label="New">
		<Avatar.Root class="size-8"><Avatar.Fallback>RP</Avatar.Fallback></Avatar.Root>
	</Indicator>
	<Indicator dot tone="primary">
		<Avatar.Root class="size-8"><Avatar.Fallback>JT</Avatar.Fallback></Avatar.Root>
	</Indicator>
</div>
