import { useState, useEffect } from "react";
import { useRouter, useParams } from "@/routes/hooks";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Icon } from "@/components/icon";
import { toast } from "sonner";
import type { Store } from "@/types/store";
import { Badge } from "@/ui/badge";
import { StatusBadge } from "./components/store-badges";
import { DeleteStoreDialog } from "./components/delete-store-dialog";
import { StoreMapDisplay } from "./components/store-map-display";

export default function StoreDetails() {
	const [store, setStore] = useState<Store | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const { push, back } = useRouter();
	const { id } = useParams();

	useEffect(() => {
		const loadStore = async () => {
			setIsLoading(true);
			try {
				// Use MSW API to fetch store
				const response = await fetch(`/api/stores/${id}`);
				const result = await response.json();

				if (result.status === 0) {
					setStore(result.data);
				} else {
					toast.error("Store not found", {
						description: "The store you're looking for doesn't exist.",
					});
					push("/stores");
					return;
				}
			} catch (error) {
				console.error("Failed to load store:", error);
				toast.error("Failed to load store", {
					description: "Please try again or contact support if the problem persists.",
				});
				push("/stores");
			} finally {
				setIsLoading(false);
			}
		};

		if (id) {
			loadStore();
		}
	}, [id, push]);

	const handleDeleteStore = async () => {
		if (!store) return;

		setIsDeleting(true);

		const loadingToast = toast.loading("Deleting store...", {
			description: `Removing ${store.name} from your store list.`,
		});

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 800));

			const storeName = store.name;

			toast.success("Store deleted successfully!", {
				description: `${storeName} has been removed from your store list.`,
				id: loadingToast,
			});

			// Navigate back to stores list
			push("/stores");
		} catch (error) {
			console.error("Failed to delete store:", error);
			toast.error("Failed to delete store", {
				description: "Please try again or contact support if the problem persists.",
				id: loadingToast,
			});
		} finally {
			setIsDeleting(false);
			setIsDeleteDialogOpen(false);
		}
	};

	const handleBack = () => {
		back();
	};

	if (isLoading) {
		return (
			<div className="p-6 space-y-6">
				<div className="flex items-center justify-center min-h-[400px]">
					<div className="flex flex-col items-center gap-4">
						<Icon icon="svg-spinners:6-dots-scale-middle" size={32} className="text-primary" />
						<p className="text-text-secondary">Loading store details...</p>
					</div>
				</div>
			</div>
		);
	}

	if (!store) {
		return null;
	}

	return (
		<div className="p-6 space-y-6">
			{/* Page Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="sm" onClick={handleBack} className="h-8 w-8 p-0">
						<Icon icon="solar:arrow-left-bold" size={18} />
					</Button>
					<div className="flex items-center gap-4">
						{store.logo ? (
							<img src={store.logo} alt={store.name} className="w-12 h-12 rounded-lg object-cover border" />
						) : (
							<div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border">
								<Icon icon="solar:shop-bold" size={20} className="text-gray-400" />
							</div>
						)}
						<div>
							<div className="flex items-center gap-3 mb-1">
								<h1 className="text-2xl font-bold text-text-primary">{store.name}</h1>
							</div>
							<div className="flex items-center gap-2">
								<Badge variant="outline">{(store as any).categoryName || "Unknown"}</Badge>
								<StatusBadge status={store.status} />
							</div>
						</div>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex items-center gap-2">
					<Button variant="outline" onClick={() => push(`/stores/${store.id}/edit`)}>
						<Icon icon="solar:pen-bold" size={16} className="mr-2" />
						Edit Store
					</Button>
					<Button
						variant="outline"
						className="text-red-600 hover:text-red-700 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/10"
						onClick={() => setIsDeleteDialogOpen(true)}
					>
						<Icon icon="solar:trash-bin-trash-bold" size={16} className="mr-2" />
						Delete
					</Button>
				</div>
			</div>

			{/* Store Information Cards */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Basic Information */}
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle className="text-lg flex items-center gap-2">
							<Icon icon="solar:info-circle-bold" size={20} />
							Store Information
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Description */}
						{store.description && (
							<div>
								<h3 className="text-sm font-semibold text-text-primary mb-2">Description</h3>
								<p className="text-text-secondary text-sm leading-relaxed">{store.description}</p>
							</div>
						)}

						{/* Location Information */}
						<div>
							<h3 className="text-sm font-semibold text-text-primary mb-3">Location</h3>
							<div className="bg-muted/50 rounded-lg p-4">
								<div className="flex items-start gap-3">
									<Icon icon="solar:map-point-bold" size={20} className="text-muted-foreground mt-0.5 flex-shrink-0" />
									<div className="text-sm text-muted-foreground">
										<div className="font-medium text-foreground">{store.location.address}</div>
										<div className="font-medium text-foreground">
											{store.location.city}
											{store.location.country ? `, ${store.location.country}` : ""}
										</div>
										{store.location.postcode && (
											<div className="text-xs text-muted-foreground mt-1">Postal Code: {store.location.postcode}</div>
										)}
									</div>
								</div>
							</div>
						</div>

						{/* Contact Information */}
						{store.website && (
							<div>
								<h3 className="text-sm font-semibold text-text-primary mb-3">Contact Information</h3>
								<div className="space-y-3">
									<div className="flex items-center gap-3">
										<Icon icon="solar:global-bold" size={16} className="text-gray-500 flex-shrink-0" />
										<a
											href={store.website}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm text-primary hover:underline"
										>
											{store.website}
										</a>
									</div>
								</div>
							</div>
						)}

						{/* Store Location Map */}
						{store.location.coordinates && (
							<StoreMapDisplay
								latitude={store.location.coordinates.lat}
								longitude={store.location.coordinates.lng}
								storeName={store.name}
								address={store.location.address}
								height={350}
							/>
						)}
					</CardContent>
				</Card>

				{/* Sidebar Information */}
				<div className="space-y-6">
					{/* Opening Hours */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg flex items-center gap-2">
								<Icon icon="solar:clock-circle-bold" size={20} />
								Opening Hours
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								{[
									{ day: "Monday", hours: store.openingHours.monday },
									{ day: "Tuesday", hours: store.openingHours.tuesday },
									{ day: "Wednesday", hours: store.openingHours.wednesday },
									{ day: "Thursday", hours: store.openingHours.thursday },
									{ day: "Friday", hours: store.openingHours.friday },
									{ day: "Saturday", hours: store.openingHours.saturday },
									{ day: "Sunday", hours: store.openingHours.sunday },
								].map(({ day, hours }) => {
									const isClosed = hours.toLowerCase() === "closed";
									return (
										<div
											key={day}
											className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
										>
											<span className="text-sm text-text-secondary font-medium">{day}</span>
											<span className={`text-sm font-medium ${isClosed ? "text-red-600" : "text-text-primary"}`}>
												{hours}
											</span>
										</div>
									);
								})}
							</div>
						</CardContent>
					</Card>

					{/* Store Statistics */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg flex items-center gap-2">
								<Icon icon="solar:chart-square-bold" size={20} />
								Statistics
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
								<div className="flex items-center gap-3">
									<Icon icon="solar:document-add-bold" size={24} className="text-blue-600 flex-shrink-0" />
									<div>
										<div className="text-2xl font-semibold text-blue-600">{store.activeFlyersCount || 0}</div>
										<div className="text-sm text-blue-600/70">Active Flyers</div>
									</div>
								</div>
							</div>

							<div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
								<div className="flex items-center gap-3">
									<Icon icon="solar:calendar-bold" size={24} className="text-green-600 flex-shrink-0" />
									<div>
										<div className="text-sm font-medium text-green-600">
											{new Date(store.createdAt).toLocaleDateString()}
										</div>
										<div className="text-sm text-green-600/70">Join Date</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Metadata */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg flex items-center gap-2">
								<Icon icon="solar:info-square-bold" size={20} />
								Details
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-xs text-text-secondary space-y-2">
								<div>
									<span className="font-medium">Store ID:</span> {store.id}
								</div>
								<div>
									<span className="font-medium">Created:</span> {new Date(store.createdAt).toLocaleString()}
								</div>
								<div>
									<span className="font-medium">Updated:</span> {new Date(store.updatedAt).toLocaleString()}
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Delete Store Dialog */}
			<DeleteStoreDialog
				store={store}
				open={isDeleteDialogOpen}
				onClose={() => setIsDeleteDialogOpen(false)}
				onConfirm={handleDeleteStore}
				isLoading={isDeleting}
			/>
		</div>
	);
}
