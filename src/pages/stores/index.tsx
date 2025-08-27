import { useState } from "react";
import { useRouter } from "@/routes/hooks";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { Icon } from "@/components/icon";
import { m } from "motion/react";
import { varFade } from "@/components/animate/variants/fade";
import { type Store, type StoreFilters } from "@/types/store";
import { toast } from "sonner";
import { useStores } from "@/hooks/useStores";
import { StoreFiltersComponent } from "./components/store-filters";
import { StatusBadge } from "./components/store-badges";
import { DeleteStoreDialog } from "./components/delete-store-dialog";
import { getImageWithFallback } from "@/utils/image";
import storeService from "@/api/services/storeService";

/**
 * Store Management Page Component
 */
export default function Stores() {
	const [filters, setFilters] = useState<StoreFilters>({});
	const [page, setPage] = useState(1);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedStore, setSelectedStore] = useState<Store | null>(null);
	const { push } = useRouter();

	// Fetch stores using our custom hook
	const {
		data: storesData,
		isLoading: isLoadingStores,
		error,
		refetch,
	} = useStores({
		page,
		limit: 15,
		filters,
	});

	// Extract stores and pagination info
	// Backend returns stores array directly, not wrapped in { data, meta }
	const stores = Array.isArray(storesData) ? storesData : storesData?.data || [];
	const meta = storesData?.meta;

	const handleDeleteStore = async () => {
		if (!selectedStore) return;

		setIsLoading(true);

		const loadingToast = toast.loading("Deleting store...", {
			description: `Removing ${selectedStore.name} from your store list.`,
		});

		try {
			await storeService.deleteStore(selectedStore._id);

			const storeName = selectedStore.name;
			// Refresh the stores list
			refetch();
			setIsDeleteDialogOpen(false);
			setSelectedStore(null);

			toast.success("Store deleted successfully!", {
				description: `${storeName} has been removed from your store list.`,
				id: loadingToast,
			});
		} catch (error: any) {
			console.error("Failed to delete store:", error);
			console.error("Server response:", error?.response?.data);

			const errorMessage = error?.response?.data?.message || error?.message || "Unknown error occurred";

			toast.error("Failed to delete store", {
				description: `Error: ${errorMessage}`,
				id: loadingToast,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleStoreAction = {
		view: (store: Store) => {
			push(`/stores/${store._id}`);
		},
		edit: (store: Store) => {
			push(`/stores/${store._id}/edit`);
		},
		delete: (store: Store) => {
			setSelectedStore(store);
			setIsDeleteDialogOpen(true);
		},
	};

	return (
		<div className="p-6 space-y-6">
			{/* Page Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-text-primary">Store Management</h1>
					<p className="text-text-secondary mt-1">Manage stores for KampanYES flyers platform</p>
				</div>
				<Button onClick={() => push("/stores/create")}>
					<Icon icon="solar:add-circle-bold" size={18} className="mr-2" />
					Add Store
				</Button>
			</div>

			{/* Filters */}
			<StoreFiltersComponent filters={filters} onFiltersChange={setFilters} onReset={() => setFilters({})} />

			{/* Error State */}
			{error && (
				<div className="text-center py-12">
					<Icon icon="solar:danger-bold-duotone" size={48} className="text-red-300 mx-auto mb-4" />
					<h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load stores</h3>
					<p className="text-gray-500 mb-4">There was an error loading the stores. Please try again.</p>
					<Button onClick={() => refetch()}>
						<Icon icon="solar:refresh-bold" size={16} className="mr-2" />
						Retry
					</Button>
				</div>
			)}

			{/* Stores Table */}
			{!error && (
				<div className="rounded-md border">
					<div className="max-h-[600px] overflow-y-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Store</TableHead>
									<TableHead>Category</TableHead>
									<TableHead>Location</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Flyers</TableHead>
									<TableHead>Updated</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoadingStores ? (
									<TableRow>
										<TableCell colSpan={7} className="text-center py-12">
											<div className="flex items-center justify-center">
												<Icon icon="solar:refresh-bold" className="mr-2 h-5 w-5 animate-spin text-primary" />
												<span className="text-muted-foreground">Loading stores...</span>
											</div>
										</TableCell>
									</TableRow>
								) : (
									stores.map((store) => (
										<m.tr
											key={store._id}
											initial="initial"
											whileInView="animate"
											viewport={{ once: true, amount: 0.2 }}
											variants={varFade({ distance: 30 }).inUp}
											className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b border-border"
										>
											<TableCell onClick={() => handleStoreAction.view(store)}>
												<div className="flex items-center gap-3">
													{(() => {
														const imageData = getImageWithFallback(store.image, "store");
														return imageData ? (
															<img
																src={imageData.src}
																alt={store.name}
																className="w-8 h-8 rounded object-cover"
																onError={(e) => {
																	(e.target as HTMLImageElement).style.display = "none";
																	(e.target as HTMLImageElement).parentElement
																		?.querySelector(".placeholder")
																		?.classList.remove("hidden");
																}}
															/>
														) : null;
													})()}
													<div
														className={`w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center placeholder ${store.image ? "hidden" : ""}`}
													>
														<Icon icon="solar:shop-bold" size={16} className="text-gray-400" />
													</div>
													<div>
														<div className="font-medium flex items-center gap-2">{store.name}</div>
														{store.website && (
															<div className="text-sm text-gray-500 truncate max-w-48">{store.website}</div>
														)}
													</div>
												</div>
											</TableCell>
											<TableCell onClick={() => handleStoreAction.view(store)}>
												<Badge variant="outline">{store.category?.title || "Unknown"}</Badge>
											</TableCell>
											<TableCell onClick={() => handleStoreAction.view(store)}>
												<div className="text-sm">
													<div className="text-muted-foreground text-xs">{store.location.address}</div>
												</div>
											</TableCell>
											<TableCell onClick={() => handleStoreAction.view(store)}>
												<StatusBadge status={store.status} />
											</TableCell>
											<TableCell onClick={() => handleStoreAction.view(store)}>
												<div className="text-center">
													<span className="font-medium">{store.folders?.length || 0}</span>
												</div>
											</TableCell>
											<TableCell onClick={() => handleStoreAction.view(store)}>
												<div className="text-sm text-gray-500">{new Date(store.updatedAt).toLocaleDateString()}</div>
											</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleStoreAction.view(store)}
														title="View store details"
													>
														<Icon icon="solar:eye-bold" size={16} />
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleStoreAction.edit(store)}
														title="Edit store"
													>
														<Icon icon="solar:pen-bold" size={16} />
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleStoreAction.delete(store)}
														title="View store details (delete available)"
														className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
													>
														<Icon icon="solar:trash-bin-trash-bold" size={16} />
													</Button>
												</div>
											</TableCell>
										</m.tr>
									))
								)}
							</TableBody>
						</Table>
					</div>

					{!isLoadingStores && stores.length === 0 && (
						<div className="text-center py-12">
							<Icon icon="solar:shop-bold-duotone" size={48} className="text-gray-300 mx-auto mb-4" />
							<h3 className="text-lg font-medium text-gray-900 mb-2">No stores found</h3>
							<p className="text-gray-500 mb-4">No stores match your current filters.</p>
							<Button variant="outline" onClick={() => setFilters({})}>
								Clear filters
							</Button>
						</div>
					)}

					{/* Pagination - temporarily hidden until we get meta from backend */}
					{meta && meta.totalPages > 1 && false && (
						<div className="flex items-center justify-between px-4 py-3 border-t">
							<div className="flex items-center gap-2">
								<span className="text-sm text-muted-foreground">
									Showing {(meta.currentPage - 1) * meta.limit + 1} to{" "}
									{Math.min(meta.currentPage * meta.limit, meta.total)} of {meta.total} stores
								</span>
							</div>
							<div className="flex items-center gap-2">
								<Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
									<Icon icon="solar:arrow-left-bold" size={16} />
									Previous
								</Button>
								<span className="text-sm">
									Page {meta.currentPage} of {meta.totalPages}
								</span>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage(page + 1)}
									disabled={page === meta.totalPages}
								>
									Next
									<Icon icon="solar:arrow-right-bold" size={16} />
								</Button>
							</div>
						</div>
					)}
				</div>
			)}

			{/* Delete Store Dialog */}
			<DeleteStoreDialog
				store={selectedStore}
				open={isDeleteDialogOpen}
				onClose={() => setIsDeleteDialogOpen(false)}
				onConfirm={handleDeleteStore}
				isLoading={isLoading}
			/>
		</div>
	);
}
