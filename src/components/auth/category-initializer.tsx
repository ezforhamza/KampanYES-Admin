import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUserToken } from "@/store/userStore";
import categoryService from "@/api/services/categoryService";

/**
 * Component that automatically fetches and caches categories when user is authenticated
 * This ensures categories are available throughout the app without manual fetching
 */
export function CategoryInitializer() {
	const queryClient = useQueryClient();
	const userToken = useUserToken();
	const isAuthenticated = !!userToken.accessToken;

	useEffect(() => {
		if (isAuthenticated) {
			// Prefetch categories and store in cache
			queryClient.prefetchQuery({
				queryKey: ["categories"],
				queryFn: () => categoryService.getCategories(),
				staleTime: 15 * 60 * 1000, // 15 minutes
			});
		}
	}, [isAuthenticated, queryClient]);

	// This component doesn't render anything - it just manages data
	return null;
}
