import ActivityIcon from '@lucide/svelte/icons/activity';
import BatteryChargingIcon from '@lucide/svelte/icons/battery-charging';
import BoxIcon from '@lucide/svelte/icons/box';
import CableIcon from '@lucide/svelte/icons/cable';
import CircleDotIcon from '@lucide/svelte/icons/circle-dot';
import FlameIcon from '@lucide/svelte/icons/flame';
import GaugeIcon from '@lucide/svelte/icons/gauge';
import LayersIcon from '@lucide/svelte/icons/layers';
import LayoutGridIcon from '@lucide/svelte/icons/layout-grid';
import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';
import Maximize2Icon from '@lucide/svelte/icons/maximize-2';
import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';
import RocketIcon from '@lucide/svelte/icons/rocket';
import SettingsIcon from '@lucide/svelte/icons/settings';
import TruckIcon from '@lucide/svelte/icons/truck';
import type { BomIcon } from './types.js';

export const ICONS: Record<BomIcon, typeof SettingsIcon> = {
	settings: SettingsIcon,
	rocket: RocketIcon,
	target: CircleDotIcon,
	layers: LayersIcon,
	cable: CableIcon,
	flame: FlameIcon,
	spin: LoaderCircleIcon,
	box: BoxIcon,
	activity: ActivityIcon,
	repeat: RefreshCwIcon,
	battery: BatteryChargingIcon,
	frame: Maximize2Icon,
	grid: LayoutGridIcon,
	truck: TruckIcon,
	gauge: GaugeIcon
};
