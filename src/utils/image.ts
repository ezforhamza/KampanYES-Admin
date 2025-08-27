/**
 * Utility functions for handling image URLs
 */

/**
 * Constructs a full image URL from a filename
 * @param filename - The image filename returned by the API (e.g., "123-abc.jpg")
 * @returns Full image URL or undefined if filename is falsy
 */
export const getImageUrl = (filename?: string): string | undefined => {
	if (!filename) return undefined;

	const imageBaseUrl = import.meta.env.VITE_IMAGE_URL;

	if (!imageBaseUrl) {
		console.warn("VITE_IMAGE_URL is not defined in environment variables");
		return undefined;
	}

	// Ensure proper URL formatting (remove trailing slash if exists, add single slash)
	const baseUrl = imageBaseUrl.replace(/\/$/, "");
	const fileName = filename.startsWith("/") ? filename.substring(1) : filename;

	return `${baseUrl}/${fileName}`;
};

/**
 * Gets a fallback image URL for when the main image fails to load
 * @param type - Type of image (category, store, user)
 * @returns Fallback image URL
 */
export const getFallbackImageUrl = (type: "category" | "store" | "user" = "store"): string => {
	const fallbackImages = {
		category: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
		store: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
		user: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
	};

	return fallbackImages[type];
};

/**
 * Creates an image URL with fallback handling
 * @param filename - The image filename from API
 * @param type - Type of image for fallback selection
 * @returns Object with src and fallback URLs, or null if no image should be shown
 */
export const getImageWithFallback = (filename?: string, type: "category" | "store" | "user" = "store") => {
	const imageUrl = getImageUrl(filename);

	// If no filename provided, return null to indicate no image should be shown
	if (!filename) return null;

	return {
		src: imageUrl,
		fallback: getFallbackImageUrl(type),
	};
};
