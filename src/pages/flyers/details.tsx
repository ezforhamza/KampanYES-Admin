import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { useRouter } from "@/routes/hooks";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Icon } from "@/components/icon";
import { toast } from "sonner";
import { MOCK_FLYERS, MOCK_COLLECTIONS } from "@/_mock/collection-data";
import { MOCK_STORES } from "@/_mock/store-data";
import type { Flyer } from "@/types/flyer";
import type { Collection } from "@/types/collection";
import type { Store } from "@/types/store";

/**
 * Flyer Detail Page Component
 * Shows detailed information about a specific flyer
 */
export default function FlyerDetails() {
	const { id } = useParams();
	const { push, back } = useRouter();

	const [flyer, setFlyer] = useState<Flyer | null>(null);
	const [collection, setCollection] = useState<Collection | null>(null);
	const [store, setStore] = useState<Store | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Fetch flyer details
	const fetchFlyer = async () => {
		if (!id) return;

		try {
			setIsLoading(true);
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 300));

			const foundFlyer = MOCK_FLYERS.find((f) => f.id === id);
			if (!foundFlyer) {
				toast.error("Flyer not found");
				push("/collections");
				return;
			}

			const foundCollection = MOCK_COLLECTIONS.find((c) => c.id === foundFlyer.collectionId);
			const foundStore = foundCollection ? MOCK_STORES.find((s) => s.id === foundCollection.storeId) : null;

			setFlyer(foundFlyer);
			setCollection(foundCollection || null);
			setStore(foundStore || null);
		} catch (error) {
			console.error("Error fetching flyer:", error);
			toast.error("Failed to load flyer details");
			push("/collections");
		} finally {
			setIsLoading(false);
		}
	};

	// Format date helper
	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	// Format date and time helper
	const formatDateTime = (date: Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	// Get flyer status
	const getFlyerStatus = () => {
		if (!flyer) return { label: "Unknown", variant: "secondary" as const, color: "gray" };

		const now = new Date();
		const startDate = new Date(flyer.startDate);
		const endDate = new Date(flyer.endDate);

		if (now >= startDate && now <= endDate) {
			return { label: "Active", variant: "default" as const, color: "green" };
		} else if (now < startDate) {
			return { label: "Upcoming", variant: "secondary" as const, color: "blue" };
		} else {
			return { label: "Expired", variant: "destructive" as const, color: "red" };
		}
	};

	// Get discount badge variant
	const getDiscountBadgeVariant = (discount: number) => {
		if (discount >= 30) return "destructive"; // High discount - red
		if (discount >= 15) return "default"; // Medium discount - primary
		return "secondary"; // Low discount - secondary
	};

	useEffect(() => {
		fetchFlyer();
	}, [id]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Icon icon="svg-spinners:6-dots-scale-middle" size={32} className="text-primary" />
				<span className="ml-3 text-text-secondary">Loading flyer...</span>
			</div>
		);
	}

	if (!flyer) {
		return (
			<div className="flex flex-col items-center justify-center py-12">
				<Icon icon="solar:file-text-bold-duotone" size={48} className="text-gray-400 dark:text-gray-600 mb-4" />
				<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Flyer not found</h3>
				<p className="text-gray-500 dark:text-gray-400 text-center mb-4">
					The flyer you're looking for doesn't exist or has been removed.
				</p>
				<Button onClick={() => back()} variant="outline">
					<Icon icon="solar:arrow-left-outline" size={16} className="mr-2" />
					Go Back
				</Button>
			</div>
		);
	}

	const status = getFlyerStatus();

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => back()}
						className="h-8 w-8 p-0"
					>
						<Icon icon="solar:arrow-left-bold" size={18} />
					</Button>
					<div>
						<h1 className="text-2xl font-bold text-text-primary">{flyer.name}</h1>
						<p className="text-text-secondary">
							{store?.name} {collection && `• ${collection.name}`}
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Badge variant={status.variant} className="text-xs">
						<div className={`w-1.5 h-1.5 rounded-full bg-${status.color}-500 mr-1`}></div>
						{status.label}
					</Badge>
					{collection && (
						<Button variant="outline" onClick={() => push(`/collections/${collection.id}/flyers/${flyer.id}/edit`)}>
							<Icon icon="solar:pen-bold" size={16} className="mr-2" />
							Edit Flyer
						</Button>
					)}
				</div>
			</div>

			{/* Main Content */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Flyer Image & Basic Info */}
				<div className="lg:col-span-2">
					<Card>
						<CardContent className="p-0">
							{/* Large Flyer Image */}
							<div className="aspect-video bg-gray-100 dark:bg-gray-800 relative overflow-hidden rounded-t-lg">
								<img src={flyer.image} alt={flyer.name} className="w-full h-full object-cover" />

								{/* Discount Badge */}
								{flyer.discountPercentage > 0 && (
									<div className="absolute top-4 right-4">
										<Badge variant={getDiscountBadgeVariant(flyer.discountPercentage)} className="text-lg px-3 py-1">
											-{flyer.discountPercentage}%
										</Badge>
									</div>
								)}

								{/* Thumbnail Badge */}
								{collection?.thumbnailFlyerId === flyer.id && (
									<div className="absolute top-4 left-4">
										<Badge variant="secondary" className="text-xs">
											<Icon icon="solar:star-bold" size={12} className="mr-1" />
											Collection Thumbnail
										</Badge>
									</div>
								)}
							</div>

							{/* Flyer Info */}
							<div className="p-6">
								<div className="flex items-start justify-between mb-4">
									<div>
										<h2 className="text-xl font-bold text-text-primary mb-2">{flyer.name}</h2>
										<div className="flex items-center gap-4">
											<div>
												<p className="text-2xl font-bold text-primary">€{flyer.finalPrice.toFixed(2)}</p>
												{flyer.discountPercentage > 0 && (
													<p className="text-lg text-gray-500 dark:text-gray-400 line-through">
														€{flyer.price.toFixed(2)}
													</p>
												)}
											</div>
											{flyer.discountPercentage > 0 && (
												<div className="text-right">
													<p className="text-lg font-semibold text-green-600">
														Save €{(flyer.price - flyer.finalPrice).toFixed(2)}
													</p>
													<p className="text-sm text-gray-500 dark:text-gray-400">{flyer.discountPercentage}% off</p>
												</div>
											)}
										</div>
									</div>
								</div>

								{/* Validity Period */}
								<div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
									<h3 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
										<Icon icon="solar:calendar-bold" size={16} />
										Validity Period
									</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
										<div>
											<p className="text-text-secondary">Start Date</p>
											<p className="font-medium text-text-primary">{formatDate(flyer.startDate)}</p>
										</div>
										<div>
											<p className="text-text-secondary">End Date</p>
											<p className="font-medium text-text-primary">{formatDate(flyer.endDate)}</p>
										</div>
									</div>
									<div className="mt-3 flex items-center gap-2">
										<div className={`w-2 h-2 rounded-full bg-${status.color}-500`}></div>
										<span className={`text-sm font-medium text-${status.color}-600`}>
											{status.label}
											{status.label === "Active" && " - Valid for purchase"}
											{status.label === "Upcoming" && " - Not yet available"}
											{status.label === "Expired" && " - No longer valid"}
										</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Sidebar - Store & Collection Info */}
				<div className="space-y-6">
					{/* Store Information */}
					{store && (
						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<Icon icon="solar:shop-bold" size={20} />
									Store Information
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<h3 className="font-semibold text-text-primary text-lg">{store.name}</h3>
									<p className="text-text-secondary">{store.description}</p>
								</div>

								<div>
									<p className="text-sm font-medium text-text-secondary mb-1">Location</p>
									<p className="text-text-primary">{store.location.address}</p>
									<p className="text-text-primary">
										{store.location.city}, {store.location.postcode}
									</p>
								</div>

								<div>
									<p className="text-sm font-medium text-text-secondary mb-1">Category</p>
									<Badge variant="outline" className="text-xs">
										{store.category
											?.replace("_", " ")
											.toLowerCase()
											.replace(/\b\w/g, (l) => l.toUpperCase())}
									</Badge>
								</div>

								{store.website && (
									<div>
										<p className="text-sm font-medium text-text-secondary mb-1">Website</p>
										<Button
											variant="outline"
											size="sm"
											onClick={() => window.open(store.website, "_blank")}
											className="w-full justify-start"
										>
											<Icon icon="solar:global-outline" size={14} className="mr-2" />
											Visit Store
										</Button>
									</div>
								)}

								<Button
									variant="ghost"
									size="sm"
									onClick={() => push(`/stores/${store.id}`)}
									className="w-full justify-start"
								>
									<Icon icon="solar:eye-outline" size={14} className="mr-2" />
									View Store Details
								</Button>
							</CardContent>
						</Card>
					)}

					{/* Collection Information */}
					{collection && (
						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<Icon icon="solar:folder-bold" size={20} />
									Collection
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<h3 className="font-semibold text-text-primary">{collection.name}</h3>
									<p className="text-text-secondary text-sm">{collection.flyersCount} flyers in this collection</p>
								</div>

								<div>
									<p className="text-sm font-medium text-text-secondary mb-1">Category</p>
									<Badge variant="outline" className="text-xs">
										{collection.category
											?.replace("_", " ")
											.toLowerCase()
											.replace(/\b\w/g, (l) => l.toUpperCase())}
									</Badge>
								</div>

								<Button
									variant="ghost"
									size="sm"
									onClick={() => push(`/collections/${collection.id}`)}
									className="w-full justify-start"
								>
									<Icon icon="solar:eye-outline" size={14} className="mr-2" />
									View Collection
								</Button>
							</CardContent>
						</Card>
					)}

					{/* Technical Details */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg flex items-center gap-2">
								<Icon icon="solar:info-circle-bold" size={20} />
								Details
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 gap-3 text-sm">
								<div>
									<p className="text-text-secondary">Flyer ID</p>
									<p className="font-mono text-text-primary text-xs">{flyer.id}</p>
								</div>

								<div>
									<p className="text-text-secondary">Created</p>
									<p className="text-text-primary">{formatDateTime(flyer.createdAt)}</p>
								</div>

								<div>
									<p className="text-text-secondary">Last Updated</p>
									<p className="text-text-primary">{formatDateTime(flyer.updatedAt)}</p>
								</div>

								<div>
									<p className="text-text-secondary">Status</p>
									<div className="flex items-center gap-2">
										<div className={`w-2 h-2 rounded-full ${flyer.status === 0 ? "bg-green-500" : "bg-red-500"}`}></div>
										<span className="text-text-primary">{flyer.status === 0 ? "Enabled" : "Disabled"}</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
