/**
 * Helper functions for managing collection thumbnails
 */

/**
 * Gets the thumbnail image URL for a collection
 * @param collection Collection object with thumbnailFlyerId
 * @param flyers Array of all flyers to look up the thumbnail from
 * @returns Thumbnail URL or default placeholder
 */
export const getCollectionThumbnailUrl = async (
	collectionId: string,
	thumbnailFlyerId?: string
): Promise<string> => {
	const defaultThumbnail = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=250&fit=crop&crop=center";

	if (!thumbnailFlyerId) {
		return defaultThumbnail;
	}

	try {
		// Fetch flyers for the collection to find the thumbnail flyer
		const response = await fetch(`/api/collections/${collectionId}/flyers`);
		const data = await response.json();

		if (data.status === 0) {
			const flyer = data.data.list.find((f: any) => f.id === thumbnailFlyerId);
			return flyer?.image || defaultThumbnail;
		}

		return defaultThumbnail;
	} catch (error) {
		console.error(`Failed to fetch thumbnail for collection ${collectionId}:`, error);
		return defaultThumbnail;
	}
};

/**
 * Loads thumbnail images for multiple collections in batch
 * @param collections Array of collections
 * @returns Promise that resolves to a record mapping collection IDs to thumbnail URLs
 */
export const loadCollectionThumbnails = async (
	collections: Array<{ id: string; thumbnailFlyerId?: string }>
): Promise<Record<string, string>> => {
	const thumbnails: Record<string, string> = {};
	const promises = collections.map(async (collection) => {
		const thumbnailUrl = await getCollectionThumbnailUrl(collection.id, collection.thumbnailFlyerId);
		thumbnails[collection.id] = thumbnailUrl;
	});

	await Promise.all(promises);
	return thumbnails;
};