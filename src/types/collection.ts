import { BasicStatus } from "./enum";

/**
 * Collection interface for KampanYES
 * Collections belong to stores and contain multiple flyers
 * Collections inherit category from their parent store
 */
export interface Collection {
	id: string;
	name: string;
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
	storeId: string;
	status: BasicStatus;
}

/**
 * Collection filters for search and filtering
 */
export interface CollectionFilters {
	storeId?: string;
	status?: BasicStatus;
	search?: string;
}
