import { useState, useEffect, useCallback } from "react";
import { useRouter } from "@/routes/hooks";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Icon } from "@/components/icon";
import { toast } from "sonner";
import type { Collection, CollectionFilters } from "@/types/collection";
import { loadCollectionThumbnails } from "@/utils/thumbnail-helpers";
import { MOCK_STORES } from "@/_mock/store-data";

/**
 * Collections Management Page Component
 * Shows all collections in a grid layout with thumbnail images
 */
export default function Collections() {
	const [collections, setCollections] = useState<Collection[]>([]);
	const [filters, setFilters] = useState<CollectionFilters>({});
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingCollections, setIsLoadingCollections] = useState(true);
	const [thumbnailImages, setThumbnailImages] = useState<Record<string, string>>({});
	const { push } = useRouter();

	// Load thumbnail images for collections
	const loadThumbnails = useCallback(async (collectionsData: Collection[]) => {
		try {
			const thumbnails = await loadCollectionThumbnails(collectionsData);
			setThumbnailImages(thumbnails);
		} catch (error) {
			console.error("Failed to load collection thumbnails:", error);
			toast.error("Failed to load collection thumbnails");
		}
	}, []);

	// Fetch collections from API
	const fetchCollections = useCallback(async () => {
		try {
			setIsLoadingCollections(true);

			const params = new URLSearchParams();
			params.set("page", "1");
			params.set("limit", "100"); // Get all collections for now

			if (filters.search) params.set("search", filters.search);
			if (filters.categoryId) params.set("category", filters.categoryId);
			if (filters.status !== undefined) params.set("status", filters.status.toString());
			if (filters.storeId) params.set("storeId", filters.storeId);

			const response = await fetch(`/api/collections?${params.toString()}`);
			const data = await response.json();

			if (data.status === 0) {
				setCollections(data.data.list);
				// Load thumbnails after collections are set
				loadThumbnails(data.data.list);
			} else {
				toast.error("Failed to load collections");
			}
		} catch (error) {
			console.error("Error fetching collections:", error);
			toast.error("Failed to load collections");
		} finally {
			setIsLoadingCollections(false);
		}
	}, [filters, loadThumbnails]);

	// Load collections when component mounts or filters change
	useEffect(() => {
		fetchCollections();
	}, [fetchCollections]);

	// Handle store filter change
	const handleStoreFilterChange = (storeId: string) => {
		setFilters(prev => ({
			...prev,
			storeId: storeId === "all" ? undefined : storeId
		}));
	};

	// Filter collections based on current filters
	const filteredCollections = collections.filter((collection) => {
		if (filters.search && !collection.name.toLowerCase().includes(filters.search.toLowerCase())) {
			return false;
		}
		if (filters.categoryId && collection.categoryId !== filters.categoryId) {
			return false;
		}
		if (filters.status !== undefined && collection.status !== filters.status) {
			return false;
		}
		if (filters.storeId && collection.storeId !== filters.storeId) {
			return false;
		}
		return true;
	});

	const handleDeleteCollection = async (collection: Collection) => {
		setIsLoading(true);

		const loadingToast = toast.loading("Deleting collection...", {
			description: `Removing ${collection.name} and all its flyers.`,
		});

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Remove collection from state
			setCollections((prev) => prev.filter((c) => c.id !== collection.id));

			toast.success("Collection deleted successfully!", {
				description: `${collection.name} has been removed.`,
				id: loadingToast,
			});
		} catch (error) {
			console.error("Failed to delete collection:", error);
			toast.error("Failed to delete collection", {
				description: "Please try again or contact support if the problem persists.",
				id: loadingToast,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleCollectionAction = {
		view: (collection: Collection) => {
			push(`/collections/${collection.id}`);
		},
		edit: (collection: Collection) => {
			push(`/collections/${collection.id}/edit`);
		},
		delete: (collection: Collection) => {
			handleDeleteCollection(collection);
		},
	};

	return (
		<div className="p-6 space-y-6">
			{/* Page Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-text-primary">Collections</h1>
					<p className="text-text-secondary mt-1">Manage your promotional collections and flyers</p>
				</div>
				<div className="flex items-center gap-3">
					{/* Store Filter */}
					<div className="flex items-center gap-2">
						<span className="text-sm text-text-secondary">Store:</span>
						<Select 
							value={filters.storeId || "all"} 
							onValueChange={handleStoreFilterChange}
						>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="All stores" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Stores</SelectItem>
								{MOCK_STORES.map((store) => (
									<SelectItem key={store.id} value={store.id}>
										{store.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<Button onClick={() => push("/collections/create")}>
						<Icon icon="solar:add-circle-bold" size={18} className="mr-2" />
						Create Collection
					</Button>
				</div>
			</div>

			{/* Collections Grid */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Collections ({filteredCollections.length})</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoadingCollections ? (
						<div className="flex items-center justify-center py-12">
							<Icon icon="solar:refresh-bold" className="mr-2 h-5 w-5 animate-spin text-primary" />
							<span className="text-muted-foreground">Loading collections...</span>
						</div>
					) : filteredCollections.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12">
							<Icon icon="solar:folder-bold-duotone" size={48} className="text-gray-400 mb-4" />
							<h3 className="text-lg font-semibold text-text-primary mb-2">No Collections Found</h3>
							<p className="text-text-secondary text-center mb-6">
								Create your first collection to start organizing your flyers.
							</p>
							<Button onClick={() => push("/collections/create")}>
								<Icon icon="solar:add-circle-bold" size={18} className="mr-2" />
								Create Collection
							</Button>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
							{filteredCollections.map((collection) => {
								const thumbnailImage = thumbnailImages[collection.id] || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=250&fit=crop&crop=center";

								return (
									<div
										key={collection.id}
										className="group border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer"
										onClick={() => handleCollectionAction.view(collection)}
									>
										{/* Thumbnail Image */}
										<div className="aspect-video bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
											{thumbnailImage ? (
												<img
													src={thumbnailImage}
													alt={collection.name}
													className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
												/>
											) : (
												<div className="w-full h-full flex items-center justify-center">
													<Icon icon="solar:folder-bold-duotone" size={40} className="text-gray-400" />
												</div>
											)}

											{/* Status Badge */}
											<div className="absolute top-2 left-2">
												{collection.status === 1 ? (
													<span className="bg-green-500 text-white px-2 py-1 text-xs rounded-full">Active</span>
												) : (
													<span className="bg-red-500 text-white px-2 py-1 text-xs rounded-full">Inactive</span>
												)}
											</div>

											{/* Flyer Count Badge */}
											<div className="absolute top-2 right-2">
												<span className="bg-black/70 text-white px-2 py-1 text-xs rounded-full">
													{collection.flyersCount} flyers
												</span>
											</div>
										</div>

										{/* Collection Info */}
										<div className="p-4">
											<h3 className="font-semibold text-text-primary mb-1 group-hover:text-blue-600 transition-colors">
												{collection.name}
											</h3>
											<p className="text-sm text-text-secondary mb-2">
												{(collection as any).storeName || "Unknown Store"}
											</p>

											{/* Action Buttons */}
											<div className="flex items-center justify-between">
												<span className="text-xs text-text-secondary">
													Updated {new Date(collection.updatedAt).toLocaleDateString()}
												</span>
												<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
													<Button
														variant="ghost"
														size="sm"
														onClick={(e) => {
															e.stopPropagation();
															handleCollectionAction.edit(collection);
														}}
														className="h-8 w-8 p-0"
													>
														<Icon icon="solar:pen-bold" size={14} />
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={(e) => {
															e.stopPropagation();
															handleCollectionAction.delete(collection);
														}}
														className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
														disabled={isLoading}
													>
														<Icon icon="solar:trash-bin-trash-bold" size={14} />
													</Button>
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
