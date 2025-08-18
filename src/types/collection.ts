import { BasicStatus } from "./enum";
import { StoreCategory } from "./store";

/**
 * Collection interface for KampanYES
 * Collections belong to stores and contain multiple flyers
 */
export interface Collection {
	id: string;
	name: string;
	categoryId: string; // Reference to Category entity
	/** @deprecated Use categoryId instead */
	category?: StoreCategory;
	storeId: string;
	thumbnailFlyerId?: string; // First flyer or user-selected thumbnail
	flyersCount: number;
	status: BasicStatus;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Collection creation/update request interface
 */
export interface CreateCollectionRequest {
	name: string;
	categoryId: string; // Reference to Category entity
	/** @deprecated Use categoryId instead */
	category?: StoreCategory;
	storeId: string;
	status: BasicStatus;
}

/**
 * Collection filters for search and filtering
 */
export interface CollectionFilters {
	categoryId?: string; // Reference to Category entity
	/** @deprecated Use categoryId instead */
	category?: StoreCategory;
	storeId?: string;
	status?: BasicStatus;
	search?: string;
}
