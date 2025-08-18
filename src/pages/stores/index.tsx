import { useState, useEffect, useCallback } from "react";
import { useRouter } from "@/routes/hooks";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { Icon } from "@/components/icon";
import { m } from "motion/react";
import { varFade } from "@/components/animate/variants/fade";
import { type Store, type StoreFilters } from "@/types/store";
import { toast } from "sonner";
import { StoreFiltersComponent } from "./components/store-filters";
import { StatusBadge } from "./components/store-badges";
import { DeleteStoreDialog } from "./components/delete-store-dialog";

/**
 * Store Management Page Component
 */
export default function Stores() {
	const [stores, setStores] = useState<Store[]>([]);
	const [filters, setFilters] = useState<StoreFilters>({});
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingStores, setIsLoadingStores] = useState(true);
	const [selectedStore, setSelectedStore] = useState<Store | null>(null);
	const { push } = useRouter();

	// Fetch stores from API
	const fetchStores = useCallback(async () => {
		try {
			setIsLoadingStores(true);

			const params = new URLSearchParams();
			params.set("page", "1");
			params.set("limit", "100"); // Get all stores for now

			if (filters.search) params.set("search", filters.search);
			if (filters.category) params.set("category", filters.category);
			if (filters.status !== undefined) params.set("status", filters.status.toString());
			if (filters.city) params.set("city", filters.city);

			const response = await fetch(`/api/stores?${params.toString()}`);
			const data = await response.json();

			if (data.status === 0) {
				setStores(data.data.list);
			} else {
				toast.error("Failed to load stores");
			}
		} catch (error) {
			console.error("Error fetching stores:", error);
			toast.error("Failed to load stores");
		} finally {
			setIsLoadingStores(false);
		}
	}, [filters]);

	// Load stores when component mounts or filters change
	useEffect(() => {
		fetchStores();
	}, [fetchStores]);

	// Filter stores based on current filters (API filtering handles most, but we keep this for client-side backup)
	const filteredStores = stores.filter((store) => {
		if (filters.search && !store.name.toLowerCase().includes(filters.search.toLowerCase())) {
			return false;
		}
		if (filters.category && store.category !== filters.category) {
			return false;
		}
		if (filters.status !== undefined && store.status !== filters.status) {
			return false;
		}
		if (filters.city && store.location.city !== filters.city) {
			return false;
		}
		return true;
	});

	const handleDeleteStore = async () => {
		if (!selectedStore) return;

		setIsLoading(true);

		const loadingToast = toast.loading("Deleting store...", {
			description: `Removing ${selectedStore.name} from your store list.`,
		});

		try {
			const response = await fetch(`/api/stores/${selectedStore.id}`, {
				method: "DELETE",
			});

			const result = await response.json();

			if (result.status === 0) {
				const storeName = selectedStore.name;
				// Refresh the stores list
				await fetchStores();
				setIsDeleteDialogOpen(false);
				setSelectedStore(null);

				toast.success("Store deleted successfully!", {
					description: `${storeName} has been removed from your store list.`,
					id: loadingToast,
				});
			} else {
				throw new Error(result.message || "Failed to delete store");
			}
		} catch (error) {
			console.error("Failed to delete store:", error);
			toast.error("Failed to delete store", {
				description: "Please try again or contact support if the problem persists.",
				id: loadingToast,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleStoreAction = {
		view: (store: Store) => {
			push(`/stores/${store.id}`);
		},
		edit: (store: Store) => {
			push(`/stores/${store.id}/edit`);
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

			{/* Stores Table */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Stores ({filteredStores.length})</CardTitle>
				</CardHeader>
				<CardContent>
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
										filteredStores.map((store) => (
											<m.tr
												key={store.id}
												initial="initial"
												whileInView="animate"
												            viewport={{ once: true, amount: 0.2 }}
												variants={varFade({ distance: 30 }).inUp}
												className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b border-border"
											>
												<TableCell onClick={() => handleStoreAction.view(store)}>
													<div className="flex items-center gap-3">
														{store.logo ? (
															<img src={store.logo} alt={store.name} className="w-8 h-8 rounded object-cover" />
														) : (
															<div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
																<Icon icon="solar:shop-bold" size={16} className="text-gray-400" />
															</div>
														)}
														<div>
															<div className="font-medium flex items-center gap-2">{store.name}</div>
															{store.website && (
																<div className="text-sm text-gray-500 truncate max-w-48">{store.website}</div>
															)}
														</div>
													</div>
												</TableCell>
												<TableCell onClick={() => handleStoreAction.view(store)}>
													<Badge variant="outline">{(store as any).categoryName || "Unknown"}</Badge>
												</TableCell>
												<TableCell onClick={() => handleStoreAction.view(store)}>
													<div className="text-sm">
														<div>
															{store.location.city}
															{store.location.country ? `, ${store.location.country}` : ""}
														</div>
														<div className="text-muted-foreground text-xs">{store.location.address}</div>
													</div>
												</TableCell>
												<TableCell onClick={() => handleStoreAction.view(store)}>
													<StatusBadge status={store.status} />
												</TableCell>
												<TableCell onClick={() => handleStoreAction.view(store)}>
													<div className="text-center">
														<span className="font-medium">{store.activeFlyersCount || 0}</span>
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

						{!isLoadingStores && filteredStores.length === 0 && (
							<div className="text-center py-12">
								<Icon icon="solar:shop-bold-duotone" size={48} className="text-gray-300 mx-auto mb-4" />
								<h3 className="text-lg font-medium text-gray-900 mb-2">No stores found</h3>
								<p className="text-gray-500 mb-4">No stores match your current filters.</p>
								<Button variant="outline" onClick={() => setFilters({})}>
									Clear filters
								</Button>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

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
