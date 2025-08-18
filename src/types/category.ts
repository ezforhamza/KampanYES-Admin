import type { BasicStatus } from "./enum";

/**
 * Category interface for KampanYES admin panel
 * Categories are used to organize stores and collections
 */
export interface Category {
	id: string;
	name: string;
	image: string;
	status: BasicStatus;
	createdAt: Date;
	updatedAt: Date;
	// Statistics
	storesCount?: number;
}

/**
 * Category creation/update request interface
 */
export interface CreateCategoryRequest {
	name: string;
	image: File | string;
}

/**
 * Category update request interface
 */
export interface UpdateCategoryRequest {
	name?: string;
	image?: File | string;
	status?: BasicStatus;
}

/**
 * Category filters for search and filtering
 */
export interface CategoryFilters {
	search?: string;
	status?: BasicStatus;
}
