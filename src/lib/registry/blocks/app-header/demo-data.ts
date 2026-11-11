import ActivityIcon from '@lucide/svelte/icons/activity';
import BellIcon from '@lucide/svelte/icons/bell';
import CalendarClockIcon from '@lucide/svelte/icons/calendar-clock';
import ChartColumnIcon from '@lucide/svelte/icons/chart-column';
import ClipboardCheckIcon from '@lucide/svelte/icons/clipboard-check';
import ClockIcon from '@lucide/svelte/icons/clock';
import HardHatIcon from '@lucide/svelte/icons/hard-hat';
import IdCardIcon from '@lucide/svelte/icons/id-card';
import LayoutDashboardIcon from '@lucide/svelte/icons/layout-dashboard';
import ListTodoIcon from '@lucide/svelte/icons/list-todo';
import NotebookPenIcon from '@lucide/svelte/icons/notebook-pen';
import TruckIcon from '@lucide/svelte/icons/truck';
import UsersIcon from '@lucide/svelte/icons/users';
import WalletIcon from '@lucide/svelte/icons/wallet';
import WrenchIcon from '@lucide/svelte/icons/wrench';
import FilePlusIcon from '@lucide/svelte/icons/file-plus';
import PackagePlusIcon from '@lucide/svelte/icons/package-plus';
import UserPlusIcon from '@lucide/svelte/icons/user-plus';
import type { CommandPaletteAction } from '$lib/registry/blocks/command-palette/types.js';
import type { FeatureModule } from '$lib/registry/blocks/feature-menu/types.js';
import type { ScopeGroup, ScopeItem } from '$lib/registry/blocks/scope-switcher/types.js';
import type { AppHeaderUser } from './app-header.svelte';

// Sample data for a fictional site-works contractor. Delete this file once you pass your own.
export const demoModules: FeatureModule[] = [
	{
		id: 'overview',
		label: 'Overview',
		icon: LayoutDashboardIcon,
		screens: [
			{
				id: 'today',
				label: 'Today board',
				description: 'Crews, deliveries and open issues for the day.',
				icon: LayoutDashboardIcon
			},
			{
				id: 'alerts',
				label: 'Alerts',
				description: 'Items that need a decision from you.',
				icon: BellIcon
			}
		]
	},
	{
		id: 'field',
		label: 'Field',
		icon: HardHatIcon,
		screens: [
			{
				id: 'daily-logs',
				label: 'Daily logs',
				description: 'Weather, headcount and notes from each site.',
				icon: NotebookPenIcon
			},
			{
				id: 'inspections',
				label: 'Inspections',
				description: 'Checklists and sign-offs, grouped by site.',
				icon: ClipboardCheckIcon
			},
			{
				id: 'punch-list',
				label: 'Punch list',
				description: 'Open defects waiting on a crew.',
				icon: ListTodoIcon
			}
		]
	},
	{
		id: 'machines',
		label: 'Machines',
		icon: TruckIcon,
		screens: [
			{
				id: 'fleet',
				label: 'Fleet',
				description: 'Every machine, where it is and who has it.',
				icon: TruckIcon
			},
			{
				id: 'service',
				label: 'Service schedule',
				description: 'Upcoming maintenance by hour meter.',
				icon: WrenchIcon
			},
			{
				id: 'rentals',
				label: 'Rentals',
				description: 'Hired machines and their return dates.',
				icon: CalendarClockIcon
			}
		]
	},
	{
		id: 'workforce',
		label: 'Workforce',
		icon: UsersIcon,
		screens: [
			{
				id: 'crews',
				label: 'Crews',
				description: 'Who works together, and on which site.',
				icon: UsersIcon
			},
			{
				id: 'timesheets',
				label: 'Timesheets',
				description: 'Hours to review before payroll closes.',
				icon: ClockIcon
			},
			{
				id: 'tickets',
				label: 'Tickets and licences',
				description: 'Qualifications that expire in the next 90 days.',
				icon: IdCardIcon
			}
		]
	},
	{
		id: 'insights',
		label: 'Insights',
		icon: ChartColumnIcon,
		screens: [
			{
				id: 'cost',
				label: 'Cost to date',
				description: 'Spend against budget for each project.',
				icon: WalletIcon
			},
			{
				id: 'productivity',
				label: 'Productivity',
				description: 'Units installed per crew hour.',
				icon: ActivityIcon
			}
		]
	}
];

export const demoProjects: ScopeItem[] = [
	{ id: 'p-101', code: '101', label: 'Yard and fleet overhead' },
	{ id: 'p-214', code: '214', label: 'Harbor Street storm drain' },
	{ id: 'p-227', code: '227', label: 'Northgate library annex' },
	{ id: 'p-231', code: '231', label: 'Riverside trail bridge' },
	{ id: 'p-238', code: '238', label: 'Elm Court water main' },
	{ id: 'p-302', code: '302', label: 'County Road 9 widening' },
	{ id: 'p-315', code: '315', label: 'Pine Hill pump station' },
	{ id: 'p-319', code: '319', label: 'Market Square paving' },
	{ id: 'p-326', code: '326', label: 'Lakeview school parking' }
];

export const demoGroups: ScopeGroup[] = [
	{ id: 'g-utilities', label: 'Utilities crew', itemIds: ['p-214', 'p-238', 'p-315'] },
	{ id: 'g-roads', label: 'Roads and paving', itemIds: ['p-302', 'p-319', 'p-326'] }
];

export const demoActions: CommandPaletteAction[] = [
	{ id: 'new-log', label: 'Start a daily log', icon: FilePlusIcon },
	{ id: 'check-out', label: 'Check out a machine', icon: PackagePlusIcon },
	{ id: 'add-worker', label: 'Add a crew member', icon: UserPlusIcon }
];

export const demoUser: AppHeaderUser = {
	name: 'Sam Rivera',
	email: 'sam@example.com'
};
