import { useQuery } from "@tanstack/react-query";
import categoryService from "@/api/services/categoryService";
import type { CategoryFilters } from "@/types/category";

export interface UseCategoriesOptions {
	filters?: CategoryFilters;
	enabled?: boolean;
}

/**
 * Hook for fetching categories with filtering
 */
export const useCategories = (options: UseCategoriesOptions = {}) => {
	const { filters, enabled = true } = options;

	return useQuery({
		queryKey: ["categories", filters],
		queryFn: () => categoryService.getCategories(filters),
		enabled,
		staleTime: 15 * 60 * 1000, // 15 minutes (categories don't change often)
		refetchOnWindowFocus: false,
		// Keep categories in cache for a long time
		gcTime: 30 * 60 * 1000, // 30 minutes
	});
};

/**
 * Hook for fetching a single category by ID
 */
export const useCategory = (id: string, enabled: boolean = true) => {
	return useQuery({
		queryKey: ["category", id],
		queryFn: () => categoryService.getCategoryById(id),
		enabled: enabled && !!id,
		staleTime: 15 * 60 * 1000, // 15 minutes
	});
};

/**
 * Hook to get categories data from cache (for immediate access)
 * This is useful when you need categories synchronously without triggering a request
 */
export const useCategoriesFromCache = () => {
	const { data: categoriesResponse } = useQuery({
		queryKey: ["categories"],
		queryFn: () => categoryService.getCategories(),
		staleTime: 15 * 60 * 1000,
		refetchOnWindowFocus: false,
		enabled: false, // Don't fetch automatically
	});

	// Handle both wrapped response and direct array
	const categories = Array.isArray(categoriesResponse) ? categoriesResponse : categoriesResponse?.data || [];

	return categories;
};
