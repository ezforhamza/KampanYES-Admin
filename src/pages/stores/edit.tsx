import { useState, useEffect } from "react";
import { useRouter, useParams } from "@/routes/hooks";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Icon } from "@/components/icon";
import { toast } from "sonner";
import { CreateStoreForm } from "./components/create-store-form";
import type { CreateStoreFormData } from "./schemas/store-schema";
import type { Store } from "@/types/store";

export default function EditStore() {
	const [isLoading, setIsLoading] = useState(false);
	const [store, setStore] = useState<Store | null>(null);
	const [isLoadingStore, setIsLoadingStore] = useState(true);
	const { push } = useRouter();
	const { id } = useParams();

	useEffect(() => {
		const loadStore = async () => {
			setIsLoadingStore(true);
			try {
				// Use MSW API to fetch store
				const response = await fetch(`/api/stores/${id}`);
				const result = await response.json();

				if (result.status === 0) {
					setStore(result.data);
				} else {
					toast.error("Store not found", {
						description: "The store you're trying to edit doesn't exist.",
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
				setIsLoadingStore(false);
			}
		};

		if (id) {
			loadStore();
		}
	}, [id, push]);

	const handleEditStore = async (data: CreateStoreFormData) => {
		if (!store) return;

		setIsLoading(true);

		const loadingToast = toast.loading("Updating store...", {
			description: `Saving changes to ${store.name}.`,
		});

		try {
			// Handle logo - convert File to data URL if needed
			let logoUrl = undefined;
			if (data.logo) {
				if (typeof data.logo === "string") {
					logoUrl = data.logo;
				} else if (data.logo instanceof File) {
					// Convert File to data URL
					logoUrl = URL.createObjectURL(data.logo);
				}
			}

			// Create update payload
			const updatePayload = {
				name: data.name,
				categoryId: data.categoryId, // Use categoryId, not category
				logo: logoUrl,
				description: data.description,
				website: data.website,
				location: {
					address: data.address,
					city: (data as any).locationDetails?.city || store.location.city,
					postcode: (data as any).locationDetails?.postcode || store.location.postcode,
					country: (data as any).locationDetails?.country || store.location.country,
					coordinates:
						data.latitude && data.longitude
							? {
									lat: data.latitude,
									lng: data.longitude,
								}
							: store.location.coordinates,
				},
				openingHours: {
					monday: data.mondayHours,
					tuesday: data.tuesdayHours,
					wednesday: data.wednesdayHours,
					thursday: data.thursdayHours,
					friday: data.fridayHours,
					saturday: data.saturdayHours,
					sunday: data.sundayHours,
				},
				status: data.status,
			};

			// Use MSW API endpoint
			const response = await fetch(`/api/stores/${store.id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(updatePayload),
			});

			const result = await response.json();

			if (result.status !== 0) {
				throw new Error(result.message || "Failed to update store");
			}

			toast.success("Store updated successfully!", {
				description: `${data.name} information has been updated.`,
				id: loadingToast,
			});

			// Navigate back to stores list or to store details
			push("/stores");
		} catch (error) {
			console.error("Failed to update store:", error);
			toast.error("Failed to update store", {
				description: "Please try again or contact support if the problem persists.",
				id: loadingToast,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		push("/stores");
	};

	if (isLoadingStore) {
		return (
			<div className="p-6 space-y-6">
				<div className="flex items-center justify-center min-h-[400px]">
					<div className="flex flex-col items-center gap-4">
						<Icon icon="svg-spinners:6-dots-scale-middle" size={32} className="text-primary" />
						<p className="text-text-secondary">Loading store information...</p>
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
					<Button variant="ghost" size="sm" onClick={handleCancel} className="h-8 w-8 p-0">
						<Icon icon="solar:arrow-left-bold" size={18} />
					</Button>
					<div>
						<h1 className="text-2xl font-bold text-text-primary">Edit Store</h1>
						<p className="text-text-secondary mt-1">Update {store.name} information</p>
					</div>
				</div>

				{/* Quick Actions */}
				<div className="flex items-center gap-2">
					<Button variant="outline" onClick={() => push(`/stores/${store.id}`)}>
						<Icon icon="solar:eye-bold" size={16} className="mr-2" />
						View Details
					</Button>
				</div>
			</div>

			{/* Edit Store Form */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg flex items-center gap-2">
						<Icon icon="solar:pen-bold" size={20} />
						Store Information
					</CardTitle>
				</CardHeader>
				<CardContent>
					<CreateStoreForm
						editMode={true}
						initialStore={store}
						onSubmit={handleEditStore}
						onCancel={handleCancel}
						isLoading={isLoading}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
