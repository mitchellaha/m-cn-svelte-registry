import Root, { type DeltaPillProps } from './delta-pill.svelte';
import {
	type DeltaFormat,
	type DeltaFormatOptions,
	type Pill,
	deltaOf,
	formatValue,
	pillOf
} from './delta.js';

export {
	Root,
	type DeltaPillProps as Props,
	//
	Root as DeltaPill,
	deltaOf,
	formatValue,
	pillOf,
	type DeltaFormat,
	type DeltaFormatOptions,
	type DeltaPillProps,
	type Pill
};
