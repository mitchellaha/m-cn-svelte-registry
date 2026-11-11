import type { ScopeGroup, ScopeItem } from './types.js';

// Sample data for a fictional site-works contractor. Delete this file once you pass your own.
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
