import ArrowLeftRightIcon from '@lucide/svelte/icons/arrow-left-right';
import BotIcon from '@lucide/svelte/icons/bot';
import ChartColumnIcon from '@lucide/svelte/icons/chart-column';
import CircleDotIcon from '@lucide/svelte/icons/circle-dot';
import CircleUserIcon from '@lucide/svelte/icons/circle-user';
import ClipboardCheckIcon from '@lucide/svelte/icons/clipboard-check';
import FileTextIcon from '@lucide/svelte/icons/file-text';
import FuelIcon from '@lucide/svelte/icons/fuel';
import GraduationCapIcon from '@lucide/svelte/icons/graduation-cap';
import LayersIcon from '@lucide/svelte/icons/layers';
import MapPinnedIcon from '@lucide/svelte/icons/map-pinned';
import PackageIcon from '@lucide/svelte/icons/package';
import PlusIcon from '@lucide/svelte/icons/plus';
import ReceiptIcon from '@lucide/svelte/icons/receipt';
import RouteIcon from '@lucide/svelte/icons/route';
import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
import SirenIcon from '@lucide/svelte/icons/siren';
import StarIcon from '@lucide/svelte/icons/star';
import StoreIcon from '@lucide/svelte/icons/store';
import TruckIcon from '@lucide/svelte/icons/truck';
import UsersIcon from '@lucide/svelte/icons/users';
import WorkflowIcon from '@lucide/svelte/icons/workflow';
import WrenchIcon from '@lucide/svelte/icons/wrench';
import type { AppShellData, AppShellModule, AppShellNotification } from './types.js';

// Invented data for the demo. A module's id is its own page (its overview); screen ids are unique
// across modules and bookmarks.
function module(
	id: string,
	label: string,
	icon: AppShellModule['icon'],
	screens: string[]
): AppShellModule {
	return {
		id,
		label,
		icon,
		screens: screens.map((s) => ({ id: `${id}/${slug(s)}`, label: s }))
	};
}

function slug(text: string) {
	return text
		.toLowerCase()
		.replace(/&/g, 'and')
		.replace(/[^a-z0-9]+/g, '-');
}

export const appShellData: AppShellData = {
	product: 'Roadline',
	bookmarks: [
		{ id: 'bookmark/drivers', label: 'Drivers' },
		{ id: 'bookmark/vehicles', label: 'Vehicles' },
		{ id: 'bookmark/users-and-roles', label: 'Users & Roles' },
		{ id: 'bookmark/tags', label: 'Tags & Attributes' }
	],
	modules: [
		module('fleet', 'Fleet', MapPinnedIcon, [
			'Vehicles',
			'Trailers',
			'Drivers',
			'Places',
			'Coverage Map',
			'Proximity'
		]),
		module('automations', 'Automations', BotIcon, ['Agents', 'Runs', 'Templates']),
		module('spaces', 'Spaces', LayersIcon, ['All Spaces', 'Shared with Me']),
		module('workforce', 'Workforce', UsersIcon, ['Crew', 'Timecards', 'Certifications']),
		module('safety', 'Safety', ShieldCheckIcon, ['Inbox', 'Events', 'Coaching', 'Scores']),
		module('compliance', 'Compliance', ClipboardCheckIcon, [
			'Hours of Service',
			'Violations',
			'Unassigned Hours',
			'Log Edits',
			'Audits',
			'Duty Status Summary',
			'Qualifications'
		]),
		module('maintenance', 'Maintenance', WrenchIcon, ['Work Orders', 'Inspections', 'Fault Codes']),
		module('dispatch', 'Dispatch', RouteIcon, ['Routes', 'Jobs', 'Planner']),
		module('incidents', 'Incidents', SirenIcon, ['Open', 'Resolved']),
		module('fuel', 'Fuel & Energy', FuelIcon, ['Fuel Usage', 'Charging', 'Idling']),
		module('documents', 'Documents', FileTextIcon, ['Submitted', 'Templates']),
		module('training', 'Training', GraduationCapIcon, ['Courses', 'Assignments']),
		module('reports', 'Reports', ChartColumnIcon, ['Library', 'Scheduled', 'Custom']),
		module('workflows', 'Workflows', WorkflowIcon, ['Active', 'Drafts']),
		module('issues', 'Issues', CircleDotIcon, ['Open', 'Assigned to Me'])
	],
	actions: [{ id: 'new-route', label: 'New route', icon: PlusIcon, shortcut: 'N' }],
	help: [
		{ id: 'help', label: 'Get help' },
		{ id: 'tickets', label: 'My open tickets' },
		{ id: 'community', label: 'Community', badge: 'New' },
		{ id: 'academy', label: 'Academy' },
		{ id: 'changelog', label: "What's new" },
		{ id: 'send-feedback', label: 'Send feedback' }
	],
	account: [
		[
			{ id: 'profile', label: 'Profile', icon: CircleUserIcon },
			{ id: 'whats-new', label: "What's new", icon: StarIcon, badge: '9+' }
		],
		[
			{ id: 'billing', label: 'Billing', icon: ReceiptIcon },
			{ id: 'store', label: 'Store', icon: StoreIcon },
			{ id: 'orders', label: 'Orders', icon: PackageIcon },
			{ id: 'exchange', label: 'Exchange a device', icon: ArrowLeftRightIcon }
		],
		[
			{ id: 'activate', label: 'Activate devices', icon: PlusIcon },
			{ id: 'org-settings', label: 'Organization settings', icon: TruckIcon }
		]
	],
	user: { name: 'Riley Park', email: 'riley@example.com', org: 'Northwind Haulage' },
	suggestions: [
		'Which vehicles are on a trip right now?',
		'List drivers with an expiring certification this month.',
		'Summarize last week’s safety events.'
	]
};

export const appShellNotifications: AppShellNotification[] = [
	{
		id: 'n1',
		title: 'Harsh-braking events to review',
		icon: ShieldCheckIcon,
		count: 7,
		time: '40 minutes ago',
		unread: true,
		links: [
			{ id: 'review', label: 'Review' },
			{ id: 'inbox', label: 'Open safety inbox' }
		]
	},
	{
		id: 'n2',
		title: 'Speeding events to review',
		icon: ShieldCheckIcon,
		count: 14,
		time: '18 hours ago',
		unread: true,
		links: [{ id: 'inbox', label: 'Open safety inbox' }]
	},
	{
		id: 'n3',
		title: 'Work order 4471 is overdue',
		body: 'Brake inspection for unit V-201 was due yesterday.',
		icon: WrenchIcon,
		time: '1 day ago',
		unread: true
	},
	{
		id: 'n4',
		title: 'Driver app 4.2 is available',
		body: 'Drivers get the update the next time they sign in.',
		icon: TruckIcon,
		time: 'Nov 9',
		unread: false
	}
];
