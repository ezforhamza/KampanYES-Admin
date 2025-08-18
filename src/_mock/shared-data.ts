// Shared data storage for MSW handlers to ensure consistency across endpoints
import { MOCK_FLYERS } from "./collection-data";
import type { Flyer } from "@/types/flyer";

// Shared flyer data
export let sharedMockFlyers: Flyer[] = [...MOCK_FLYERS];

// Utility functions to manage shared flyer data
export const getSharedFlyers = (): Flyer[] => sharedMockFlyers;

export const setSharedFlyers = (flyers: Flyer[]): void => {
	sharedMockFlyers = flyers;
};

export const addSharedFlyer = (flyer: Flyer): void => {
	sharedMockFlyers.unshift(flyer);
};

export const updateSharedFlyer = (flyerId: string, updatedFlyer: Flyer): void => {
	const index = sharedMockFlyers.findIndex((f) => f.id === flyerId);
	if (index !== -1) {
		sharedMockFlyers[index] = updatedFlyer;
	}
};

export const removeSharedFlyer = (flyerId: string): void => {
	const index = sharedMockFlyers.findIndex((f) => f.id === flyerId);
	if (index !== -1) {
		sharedMockFlyers.splice(index, 1);
	}
};

export const removeSharedFlyersByCollection = (collectionId: string): void => {
	sharedMockFlyers = sharedMockFlyers.filter((f) => f.collectionId !== collectionId);
};
