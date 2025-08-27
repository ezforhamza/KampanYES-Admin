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
 * Store availability schedule (backend format)
 */
export interface DayAvailability {
	day: string;
	openingTime: string;
	closingTime: string;
	status: "open" | "closed";
	_id: string;
	id: string;
}

/**
 * Store Location interface (backend GeoJSON format)
 */
export interface StoreLocation {
	type: "Point";
	coordinates: [number, number]; // [longitude, latitude]
	address: string;
}

/**
 * Category interface (populated from backend)
 */
export interface StoreCategory {
	_id: string;
	image: string;
	title: string;
	createdAt: string;
	updatedAt: string;
	__v?: number;
}

/**
 * Folder/Collection interface (nested in store response)
 */
export interface StoreFolder {
	_id: string;
	store: string; // storeId
	name: string;
	category: string; // categoryId
	status: string;
	location: StoreLocation;
	createdAt: string;
	updatedAt: string;
	__v?: number;
	isFavorite: number;
	id: string;
}

/**
 * Opening Hours interface (legacy - for compatibility)
 * @deprecated Use availability array instead
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
 * Main Store interface for KampanYES (Backend format)
 */
export interface Store {
	_id: string;
	id: string; // Also provided by backend
	name: string;
	category: StoreCategory; // Populated category object
	image: string; // Store logo/image filename
	location: StoreLocation; // GeoJSON Point format
	availability: DayAvailability[]; // Weekly schedule
	website?: string;
	description?: string;
	status: string; // "active" | "inactive"
	createdAt: string;
	updatedAt: string;
	__v?: number;
	folders: StoreFolder[]; // Nested collections/folders
	isFavorite: number; // 0 or 1
	// Legacy compatibility fields
	categoryId?: string; // For backward compatibility
	logo?: string; // Map to image field
	openingHours?: OpeningHours; // Convert from availability
	activeFlyersCount?: number; // Calculate from folders
}

/**
 * Store creation/update request interface (Backend format)
 */
export interface CreateStoreRequest {
	name: string;
	category: string; // Category ID
	image?: string; // Uploaded image filename
	location: {
		type: "Point";
		coordinates: [number, number]; // [lng, lat]
		address: string;
	};
	availability: DayAvailability[];
	website?: string;
	description?: string;
	status?: string;
}

/**
 * Store filters for search and filtering
 */
export interface StoreFilters {
	category?: string; // Category ID
	search?: string;
	status?: string;
	// Legacy compatibility
	categoryId?: string;
	city?: string;
}
