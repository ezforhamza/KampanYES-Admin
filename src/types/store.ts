import type { BasicStatus } from "./enum";

/**
 * Store Category enum for KampanYES - DEPRECATED
 * Use categoryId field with actual Category entities instead
 * @deprecated Use categoryId field to reference Category entities
 */
export enum StoreCategory {
	SUPERMARKETS = "supermarkets",
	ELECTRONICS = "electronics",
	FASHION = "fashion",
	GARDEN_DIY = "garden_diy",
	HOME_INTERIOR = "home_interior",
	CATERING = "catering",
	BEAUTY = "beauty",
}

/**
 * Opening Hours interface
 */
export interface OpeningHours {
	monday: string;
	tuesday: string;
	wednesday: string;
	thursday: string;
	friday: string;
	saturday: string;
	sunday: string;
}

/**
 * Store Location interface
 */
export interface StoreLocation {
	address: string;
	city: string;
	postcode: string;
	country: string;
	coordinates?: {
		lat: number;
		lng: number;
	};
}

/**
 * Main Store interface for KampanYES
 */
export interface Store {
	id: string;
	name: string;
	categoryId: string; // Reference to Category entity
	/** @deprecated Use categoryId instead */
	category?: StoreCategory;
	logo?: string;
	location: StoreLocation;
	openingHours: OpeningHours;
	website?: string;
	description?: string;
	status: BasicStatus;
	createdAt: Date;
	updatedAt: Date;
	// Additional KampanYES specific fields
	activeFlyersCount?: number;
}

/**
 * Store creation/update request interface
 */
export interface CreateStoreRequest {
	name: string;
	categoryId: string; // Reference to Category entity
	/** @deprecated Use categoryId instead */
	category?: StoreCategory;
	logo?: File | string;
	location: StoreLocation;
	openingHours: OpeningHours;
	website?: string;
	description?: string;
}

/**
 * Store filters for search and filtering
 */
export interface StoreFilters {
	categoryId?: string; // Reference to Category entity
	/** @deprecated Use categoryId instead */
	category?: StoreCategory;
	city?: string;
	status?: BasicStatus;
	search?: string;
}
