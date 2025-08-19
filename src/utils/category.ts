/**
 * Centralized category utilities for the KampanYES Admin Panel
 *
 * This file provides utility functions for working with categories throughout the application.
 * All category-related operations should use these utilities to maintain consistency.
 */

import type { Category } from "@/types/category";

/**
 * Get a human-readable category name from a category ID
 * @param categoryId - The category ID to look up
 * @param categories - Array of available categories
 * @returns The category name or "Unknown Category" if not found
 */
export function getCategoryName(categoryId: string, categories: Category[]): string {
	const category = categories.find((cat) => cat.id === categoryId);
	return category?.name || "Unknown Category";
}

/**
 * Get a category by ID
 * @param categoryId - The category ID to look up
 * @param categories - Array of available categories
 * @returns The category object or undefined if not found
 */
export function getCategory(categoryId: string, categories: Category[]): Category | undefined {
	return categories.find((cat) => cat.id === categoryId);
}


/**
 * Sort categories by name alphabetically
 * @param categories - Array of categories to sort
 * @returns Sorted array of categories
 */
export function sortCategoriesByName(categories: Category[]): Category[] {
	return [...categories].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Search categories by name
 * @param categories - Array of categories to search
 * @param searchTerm - Search term to match against category names
 * @returns Filtered array of categories matching the search term
 */
export function searchCategories(categories: Category[], searchTerm: string): Category[] {
	if (!searchTerm.trim()) return categories;

	const lowercaseSearch = searchTerm.toLowerCase();
	return categories.filter((category) => category.name.toLowerCase().includes(lowercaseSearch));
}

/**
 * Get categories formatted for select/dropdown options
 * @param categories - Array of categories to format
 * @returns Array of options with value (id) and label (name)
 */
export function getCategoryOptions(categories: Category[]): Array<{ value: string; label: string }> {
	return sortCategoriesByName(categories).map((category) => ({
		value: category.id,
		label: category.name,
	}));
}

/**
 * Validate if a category ID exists
 * @param categoryId - The category ID to validate
 * @param categories - Array of available categories
 * @returns True if the category exists
 */
export function isValidCategoryId(categoryId: string, categories: Category[]): boolean {
	return !!getCategory(categoryId, categories);
}
