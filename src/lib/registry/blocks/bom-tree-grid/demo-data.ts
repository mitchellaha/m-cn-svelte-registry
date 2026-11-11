import type { BomIcon, BomNode, Supply } from './types.js';

/**
 * Sample bill of materials for previewing the grid. Delete this file once the
 * grid is wired to real data.
 */
const leaf = (
	id: string,
	name: string,
	number: string,
	icon: BomIcon,
	qty: number,
	unitCost: number,
	leadTimeDays: number,
	supply: Supply
): BomNode => ({ id, name, number, icon, qty, unitCost, leadTimeDays, supply });

export const demoBom: BomNode[] = [
	{
		id: 'sys-100',
		name: 'Drive System',
		number: 'SYS-100',
		icon: 'settings',
		qty: 1,
		children: [
			{
				id: 'asm-110',
				name: 'Mid-Drive Motor',
				number: 'ASM-110',
				icon: 'rocket',
				qty: 1,
				children: [
					{
						id: 'sub-111',
						name: 'Stator Assembly',
						number: 'SUB-111',
						icon: 'target',
						qty: 1,
						children: [
							leaf(
								'prt-1111',
								'Stator Lamination',
								'PRT-1111',
								'layers',
								52,
								0.74,
								45,
								'single-source'
							),
							leaf('prt-1112', 'Copper Winding', 'PRT-1112', 'cable', 3, 7.4, 28, 'stocked'),
							leaf('prt-1113', 'Thermal Sensor', 'PRT-1113', 'flame', 2, 3.85, 21, 'stocked')
						]
					},
					{
						id: 'sub-112',
						name: 'Rotor Assembly',
						number: 'SUB-112',
						icon: 'spin',
						qty: 1,
						children: [
							leaf('prt-1121', 'Rotor Magnet', 'PRT-1121', 'layers', 14, 2.1, 62, 'shortage'),
							leaf('prt-1122', 'Rotor Core', 'PRT-1122', 'target', 1, 19.6, 35, 'single-source'),
							leaf('prt-1123', 'Output Shaft', 'PRT-1123', 'cable', 1, 9.5, 28, 'stocked')
						]
					},
					leaf('prt-113', 'Motor Housing', 'PRT-113', 'box', 2, 13.9, 30, 'stocked'),
					leaf(
						'prt-114',
						'Torque Sensor Ring',
						'PRT-114',
						'activity',
						1,
						34.75,
						40,
						'single-source'
					)
				]
			},
			{
				id: 'asm-120',
				name: 'Drivetrain',
				number: 'ASM-120',
				icon: 'repeat',
				qty: 1,
				children: [
					leaf('prt-121', 'Chainring', 'PRT-121', 'target', 1, 24.5, 30, 'stocked'),
					leaf('prt-122', 'Chain', 'PRT-122', 'cable', 1, 18.95, 54, 'long-lead'),
					leaf('prt-123', 'Cassette', 'PRT-123', 'layers', 1, 34.5, 40, 'stocked')
				]
			}
		]
	},
	{
		id: 'sys-200',
		name: 'Energy Pack',
		number: 'SYS-200',
		icon: 'battery',
		qty: 1,
		children: [
			leaf('prt-201', '21700 Cell', 'PRT-201', 'battery', 52, 4.25, 56, 'long-lead'),
			leaf('prt-202', 'BMS Board', 'PRT-202', 'activity', 1, 48.75, 42, 'single-source'),
			leaf('prt-203', 'Pack Enclosure', 'PRT-203', 'box', 1, 56.22, 30, 'stocked')
		]
	},
	{
		id: 'sys-300',
		name: 'Frame Set',
		number: 'SYS-300',
		icon: 'frame',
		qty: 1,
		children: [
			leaf('prt-301', 'Main Frame', 'PRT-301', 'frame', 1, 168, 42, 'shortage'),
			leaf('prt-302', 'Rear Rack', 'PRT-302', 'layers', 1, 42.3, 28, 'stocked'),
			leaf('prt-303', 'Kickstand', 'PRT-303', 'cable', 1, 23.5, 21, 'stocked')
		]
	},
	{
		id: 'sys-400',
		name: 'Cockpit',
		number: 'SYS-400',
		icon: 'grid',
		qty: 1,
		children: [
			leaf('prt-401', 'Display Unit', 'PRT-401', 'gauge', 1, 62, 38, 'single-source'),
			leaf('prt-402', 'Handlebar', 'PRT-402', 'cable', 1, 43, 25, 'stocked')
		]
	},
	{
		id: 'sys-500',
		name: 'Rolling Gear',
		number: 'SYS-500',
		icon: 'truck',
		qty: 1,
		children: [
			leaf('prt-501', 'Wheelset', 'PRT-501', 'spin', 1, 158.4, 51, 'long-lead'),
			leaf('prt-502', 'Tire', 'PRT-502', 'target', 2, 32.18, 30, 'stocked'),
			leaf('prt-503', 'Brake Set', 'PRT-503', 'activity', 1, 24.4, 35, 'stocked')
		]
	}
];
