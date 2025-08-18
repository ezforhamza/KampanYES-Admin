import { BasicStatus } from "./enum";

/**
 * Flyer interface for KampanYES
 * Flyers belong to collections and contain promotional content
 */
export interface Flyer {
	id: string;
	name: string;
	image: string; // Single image URL
	price: number; // Original price
	discountPercentage: number; // Discount percentage (0-100)
	finalPrice: number; // Calculated final price after discount
	collectionId: string; // Parent collection
	storeId: string; // For easy querying and access control
	startDate: Date; // When flyer becomes active
	endDate: Date; // When flyer expires
	status: BasicStatus;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Flyer creation/update request interface
 */
export interface CreateFlyerRequest {
	name: string;
	image: File | string;
	price: number;
	discountPercentage: number;
	collectionId: string;
	storeId: string;
	startDate: Date;
	endDate: Date;
	status: BasicStatus;
}

/**
 * Flyer filters for search and filtering
 */
export interface FlyerFilters {
	collectionId?: string;
	storeId?: string;
	status?: BasicStatus;
	search?: string;
	minPrice?: number;
	maxPrice?: number;
	minDiscount?: number;
	startDate?: Date;
	endDate?: Date;
	activeOnly?: boolean; // Show only currently active flyers
}
