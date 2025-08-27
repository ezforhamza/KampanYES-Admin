import { useMemo } from "react";
import { useCategories } from "./useCategories";

/**
 * Hook for getting categories formatted for select dropdowns
 */
export const useCategoriesSelect = () => {
	const { data: categoriesResponse, isLoading, error } = useCategories();

	// Handle both wrapped response and direct array
	const categories = Array.isArray(categoriesResponse) ? categoriesResponse : categoriesResponse?.data || [];

	// Format categories for select components
	const categoryOptions = useMemo(
		() =>
			categories.map((category) => ({
				label: category.title,
				value: category._id,
				data: category,
			})),
		[categories],
	);

	// Create a lookup map for quick category access by ID
	const categoryMap = useMemo(() => {
		const map = new Map();
		categories.forEach((category) => {
			map.set(category._id, category);
		});
		return map;
	}, [categories]);

	// Helper function to get category by ID
	const getCategoryById = (id: string) => {
		return categoryMap.get(id);
	};

	// Helper function to get category name by ID
	const getCategoryName = (id: string) => {
		const category = categoryMap.get(id);
		return category?.title || "Unknown Category";
	};

	return {
		categories,
		categoryOptions,
		categoryMap,
		getCategoryById,
		getCategoryName,
		isLoading,
		error,
	};
};
