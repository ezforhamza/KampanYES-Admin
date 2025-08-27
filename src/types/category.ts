/**
 * Category interface for KampanYES admin panel (Backend format)
 * Categories are used to organize stores and collections
 */
export interface Category {
	_id: string;
	title: string;
	image: string;
	createdAt: string;
	updatedAt: string;
	__v?: number;
	// Legacy compatibility
	id?: string;
	name?: string;
	// Statistics
	storesCount?: number;
}

/**
 * Category creation/update request interface (Backend format)
 */
export interface CreateCategoryRequest {
	title: string;
	image: string; // Uploaded image filename
}

/**
 * Category update request interface (Backend format)
 */
export interface UpdateCategoryRequest {
	title?: string;
	image?: string; // Uploaded image filename
}

/**
 * Category filters for search and filtering
 */
export interface CategoryFilters {
	search?: string;
}
