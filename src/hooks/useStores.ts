import { useQuery } from "@tanstack/react-query";
import storeService from "@/api/services/storeService";
import type { StoreFilters } from "@/types/store";

export interface UseStoresOptions {
	page?: number;
	limit?: number;
	filters?: StoreFilters;
	enabled?: boolean;
}

/**
 * Hook for fetching stores with pagination and filtering
 */
export const useStores = (options: UseStoresOptions = {}) => {
	const { page = 1, limit = 15, filters, enabled = true } = options;

	return useQuery({
		queryKey: ["stores", page, limit, filters],
		queryFn: () => storeService.getStores(page, limit, filters),
		enabled,
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchOnWindowFocus: false,
	});
};

/**
 * Hook for fetching a single store by ID
 */
export const useStore = (id: string, enabled: boolean = true) => {
	return useQuery({
		queryKey: ["store", id],
		queryFn: () => storeService.getStoreById(id),
		enabled: enabled && !!id,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};
