export type SearchType = "last-before" | "first-after";

export type BinarySearchQuery<KEY extends string | symbol | number> = {
	type: SearchType;
	strict?: boolean;
	value: number;
	property: KEY;
};

export function binarySearch<
	KEY extends string | symbol | number,
	ITEM extends { [K in KEY]: number },
>(array: ITEM[], query: BinarySearchQuery<KEY>): number;
