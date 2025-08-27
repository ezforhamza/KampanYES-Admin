import { BasicStatus } from "./enum";

/**
 * Collection interface for KampanYES (Backend calls them "folders")
 * Collections belong to stores and contain multiple flyers
 */
export interface Collection {
	_id: string;
	id: string; // Also provided by backend
	name: string;
	store: string; // Store ID (backend field name)
	category: string; // Category ID
	status: string; // "active" | "inactive"
	location?: {
		type: "Point";
		coordinates: [number, number];
		address: string;
	};
	createdAt: string;
	updatedAt: string;
	__v?: number;
	isFavorite: number; // 0 or 1
	// Legacy compatibility fields
	storeId?: string; // Map from store field
	thumbnailFlyerId?: string; // Calculate from flyers
	flyersCount?: number; // Calculate from flyers
}

/**
 * Collection creation/update request interface (Backend format)
 */
export interface CreateCollectionRequest {
	name: string;
	store: string; // Store ID
	category: string; // Category ID
	status?: string;
	location?: {
		type: "Point";
		coordinates: [number, number];
		address: string;
	};
}

/**
 * Collection filters for search and filtering
 */
export interface CollectionFilters {
	store?: string; // Store ID
	category?: string; // Category ID
	status?: string;
	search?: string;
	// Legacy compatibility
	storeId?: string;
}
