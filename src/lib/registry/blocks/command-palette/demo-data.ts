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
import type { CommandPaletteData, CommandPaletteModule } from './types.js';

// Sample navigation for a fictional site-works contractor. Delete this file once you pass your own.
const demoModules: CommandPaletteModule[] = [
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

export const demoCommandData: CommandPaletteData = {
	modules: demoModules,
	actions: [
		{ id: 'new-log', label: 'Start a daily log', icon: FilePlusIcon },
		{ id: 'check-out', label: 'Check out a machine', icon: PackagePlusIcon },
		{ id: 'add-worker', label: 'Add a crew member', icon: UserPlusIcon }
	]
};
