import { useState, useEffect } from "react";
import { useRouter, useParams } from "@/routes/hooks";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { Icon } from "@/components/icon";
import { toast } from "sonner";
import { MOCK_FLYERS, isFlyerActive } from "@/_mock/collection-data";
import type { Collection } from "@/types/collection";
import type { Flyer } from "@/types/flyer";

/**
 * Collection Details Page Component
 * Shows collection information and all flyers within the collection
 */
export default function CollectionDetails() {
	const [collection, setCollection] = useState<Collection | null>(null);
	const [flyers, setFlyers] = useState<Flyer[]>([]);
	const [isLoadingCollection, setIsLoadingCollection] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [showActiveOnly, setShowActiveOnly] = useState(false);
	const { push, back } = useRouter();
	const { id } = useParams();

	useEffect(() => {
		const loadCollection = async () => {
			setIsLoadingCollection(true);
			try {
				// Use MSW API to fetch collection
				const response = await fetch(`/api/collections/${id}`);
				const result = await response.json();

				if (result.status === 0) {
					setCollection(result.data);

					// Get flyers for this collection
					const collectionFlyers = MOCK_FLYERS.filter((f) => f.collectionId === result.data.id);
					setFlyers(collectionFlyers);
				} else {
					toast.error("Collection not found", {
						description: "The collection you're looking for doesn't exist.",
					});
					push("/collections");
					return;
				}
			} catch (error) {
				console.error("Failed to load collection:", error);
				toast.error("Failed to load collection", {
					description: "Please try again or contact support if the problem persists.",
				});
				push("/collections");
			} finally {
				setIsLoadingCollection(false);
			}
		};

		if (id) {
			loadCollection();
		}
	}, [id, push]);

	// Get store information - can be retrieved from collection data or API call if needed
	const store = collection ? { id: collection.storeId, name: (collection as any).storeName || "Unknown Store" } : null;

	// Filter flyers based on active status
	const displayFlyers = showActiveOnly ? flyers.filter((f) => isFlyerActive(f)) : flyers;

	const handleDeleteFlyer = async (flyer: Flyer) => {
		setIsLoading(true);

		const loadingToast = toast.loading("Deleting flyer...", {
			description: `Removing ${flyer.name} from the collection.`,
		});

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Remove flyer from state
			setFlyers((prev) => prev.filter((f) => f.id !== flyer.id));

			// Update collection flyer count
			if (collection) {
				setCollection((prev) => (prev ? { ...prev, flyersCount: prev.flyersCount - 1 } : null));
			}

			toast.success("Flyer deleted successfully!", {
				description: `${flyer.name} has been removed from the collection.`,
				id: loadingToast,
			});
		} catch (error) {
			console.error("Failed to delete flyer:", error);
			toast.error("Failed to delete flyer", {
				description: "Please try again or contact support if the problem persists.",
				id: loadingToast,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleFlyerAction = {
		edit: (flyer: Flyer) => {
			// Navigate to flyer edit page within collection context
			push(`/collections/${collection?.id}/flyers/${flyer.id}/edit`);
		},
		delete: (flyer: Flyer) => {
			handleDeleteFlyer(flyer);
		},
		setThumbnail: async (flyer: Flyer) => {
			if (!collection) return;

			setIsLoading(true);
			const loadingToast = toast.loading("Setting thumbnail...", {
				description: `Setting ${flyer.name} as collection thumbnail.`,
			});

			try {
				// Make API call to update collection thumbnail
				const response = await fetch(`/api/collections/${collection.id}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						thumbnailFlyerId: flyer.id,
					}),
				});

				const result = await response.json();

				if (result.status === 0) {
					// Update collection thumbnail
					setCollection((prev) => (prev ? { ...prev, thumbnailFlyerId: flyer.id } : null));

					toast.success("Thumbnail updated!", {
						description: `${flyer.name} is now the collection thumbnail.`,
						id: loadingToast,
					});
				} else {
					throw new Error(result.message || 'Failed to update thumbnail');
				}
			} catch (error) {
				console.error("Failed to set thumbnail:", error);
				toast.error("Failed to set thumbnail", {
					description: "Please try again or contact support if the problem persists.",
					id: loadingToast,
				});
			} finally {
				setIsLoading(false);
			}
		},
	};

	if (isLoadingCollection) {
		return (
			<div className="p-6 space-y-6">
				<div className="flex items-center justify-center min-h-[400px]">
					<div className="flex flex-col items-center gap-4">
						<Icon icon="svg-spinners:6-dots-scale-middle" size={32} className="text-primary" />
						<p className="text-text-secondary">Loading collection...</p>
					</div>
				</div>
			</div>
		);
	}

	if (!collection) {
		return null;
	}

	return (
		<div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
			{/* Page Header */}
			<div className="space-y-4">
				{/* Back Button and Title */}
				<div className="flex items-center gap-3 sm:gap-4">
					<Button variant="ghost" size="sm" onClick={() => back()} className="h-8 w-8 p-0 shrink-0">
						<Icon icon="solar:arrow-left-bold" size={18} />
					</Button>
					<div className="min-w-0 flex-1">
						<h1 className="text-xl sm:text-2xl font-bold text-text-primary line-clamp-2">{collection.name}</h1>
						<p className="text-text-secondary mt-1 text-sm sm:text-base line-clamp-1">
							{store?.name} • {flyers.length} flyers
						</p>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
					<Button 
						variant="outline" 
						onClick={() => push(`/collections/${collection.id}/edit`)}
						className="w-full sm:w-auto"
						size="lg"
					>
						<Icon icon="solar:pen-bold" size={16} className="mr-2" />
						Edit Collection
					</Button>
					<Button 
						onClick={() => push(`/collections/${collection.id}/flyers/create`)}
						className="w-full sm:w-auto"
						size="lg"
					>
						<Icon icon="solar:add-circle-bold" size={16} className="mr-2" />
						Add Flyer
					</Button>
				</div>
			</div>


			{/* Flyers Grid */}
			<Card>
				<CardHeader className="pb-3">
					<div className="flex items-center justify-end">
						<div className="flex items-center gap-2">
							<Button
								variant={showActiveOnly ? "default" : "outline"}
								size="sm"
								onClick={() => setShowActiveOnly(!showActiveOnly)}
								className="h-8"
							>
								<Icon icon="solar:eye-bold" size={14} className="mr-1" />
								{showActiveOnly ? "Show All" : "Active Only"}
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{displayFlyers.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12">
							<Icon icon="solar:file-text-bold-duotone" size={48} className="text-gray-400 mb-4" />
							{flyers.length === 0 ? (
								<>
									<h3 className="text-lg font-semibold text-text-primary mb-2">No Flyers Yet</h3>
									<p className="text-text-secondary text-center mb-6">
										Start adding flyers to this collection to showcase your promotional content.
									</p>
									<Button onClick={() => push(`/collections/${collection.id}/flyers/create`)}>
										<Icon icon="solar:add-circle-bold" size={18} className="mr-2" />
										Add First Flyer
									</Button>
								</>
							) : (
								<>
									<h3 className="text-lg font-semibold text-text-primary mb-2">No Active Flyers</h3>
									<p className="text-text-secondary text-center mb-6">
										No flyers are currently active. All flyers may have expired or be scheduled for future dates.
									</p>
									<Button onClick={() => setShowActiveOnly(false)} variant="outline">
										<Icon icon="solar:eye-bold" size={18} className="mr-2" />
										Show All Flyers
									</Button>
								</>
							)}
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
							{displayFlyers.map((flyer) => (
								<div
									key={flyer.id}
									onClick={() => push(`/flyers/${flyer.id}`)}
									className="group border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer"
								>
									{/* Flyer Image */}
									<div className="aspect-video bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
										<img
											src={flyer.image}
											alt={flyer.name}
											className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
										/>

										{/* Thumbnail Badge */}
										{collection.thumbnailFlyerId === flyer.id && (
											<div className="absolute top-2 left-2">
												<span className="bg-blue-500 text-white px-2 py-1 text-xs rounded-full flex items-center gap-1">
													<Icon icon="solar:star-bold" size={12} />
													Thumbnail
												</span>
											</div>
										)}

										{/* Discount Badge */}
										{flyer.discountPercentage > 0 && (
											<div className="absolute top-2 right-2">
												<span className="bg-red-500 text-white px-2 py-1 text-xs rounded-full">
													-{flyer.discountPercentage}%
												</span>
											</div>
										)}
									</div>

									{/* Flyer Info */}
									<div className="p-4">
										<h3 className="font-semibold text-text-primary mb-2">{flyer.name}</h3>

										<div className="flex items-center justify-between mb-3">
											<div>
												<p className="text-lg font-bold text-green-600">€{flyer.finalPrice.toFixed(2)}</p>
												{flyer.discountPercentage > 0 && (
													<p className="text-sm text-gray-500 line-through">€{flyer.price.toFixed(2)}</p>
												)}
											</div>
										</div>

										{/* Flyer Date Range */}
										<div className="text-xs text-text-secondary mb-3">
											<div className="flex items-center gap-1 mb-1">
												<Icon icon="solar:calendar-bold" size={12} />
												<span>
													Valid: {new Date(flyer.startDate).toLocaleDateString()} -{" "}
													{new Date(flyer.endDate).toLocaleDateString()}
												</span>
											</div>
											{/* Active Status */}
											{new Date() >= new Date(flyer.startDate) && new Date() <= new Date(flyer.endDate) ? (
												<span className="inline-flex items-center gap-1 text-green-600">
													<div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
													Active
												</span>
											) : new Date() < new Date(flyer.startDate) ? (
												<span className="inline-flex items-center gap-1 text-blue-600">
													<div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
													Upcoming
												</span>
											) : (
												<span className="inline-flex items-center gap-1 text-red-600">
													<div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
													Expired
												</span>
											)}
										</div>

										{/* Action Buttons */}
										<div
											className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
											onClick={(e) => e.stopPropagation()}
										>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => push(`/flyers/${flyer.id}`)}
												className="h-8 flex-1 text-xs"
											>
												<Icon icon="solar:eye-bold" size={12} className="mr-1" />
												View Details
											</Button>
											{collection.thumbnailFlyerId !== flyer.id && (
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleFlyerAction.setThumbnail(flyer)}
													className="h-8 w-8 p-0"
													disabled={isLoading}
													title="Set as Thumbnail"
												>
													<Icon icon="solar:star-bold" size={14} />
												</Button>
											)}
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleFlyerAction.edit(flyer)}
												className="h-8 w-8 p-0"
												title="Edit Flyer"
											>
												<Icon icon="solar:pen-bold" size={14} />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleFlyerAction.delete(flyer)}
												className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
												disabled={isLoading}
												title="Delete Flyer"
											>
												<Icon icon="solar:trash-bin-trash-bold" size={14} />
											</Button>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
