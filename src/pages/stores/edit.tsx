import { useState, useEffect } from "react";
import { useRouter, useParams } from "@/routes/hooks";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Icon } from "@/components/icon";
import { toast } from "sonner";
import { CreateStoreForm } from "./components/create-store-form";
import type { CreateStoreFormData } from "./schemas/store-schema";
import type { Store } from "@/types/store";
import storeService, { type UpdateStoreRequest } from "@/api/services/storeService";

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
				const data = await storeService.getStoreById(id!);
				setStore(data);
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

		let loadingToast = toast.loading("Updating store...", {
			description: `Saving changes to ${store.name}.`,
		});

		try {
			// Create update payload according to backend format
			const updatePayload: UpdateStoreRequest = {
				name: data.name,
				category: data.categoryId,
				description: data.description,
				website: data.website,
				status: data.status === 1 || data.status === "active" ? "active" : "inactive",
				location: {
					type: "Point",
					coordinates: [
						data.longitude || store.location.coordinates[0],
						data.latitude || store.location.coordinates[1],
					],
					address: data.address,
				},
			};

			// Add image if provided (uploaded image name from upload service)
			if (data.logo && typeof data.logo === "string") {
				updatePayload.image = data.logo;
			}

			// Convert opening hours to availability format
			const days = [
				{ day: "monday", hours: data.mondayHours },
				{ day: "tuesday", hours: data.tuesdayHours },
				{ day: "wednesday", hours: data.wednesdayHours },
				{ day: "thursday", hours: data.thursdayHours },
				{ day: "friday", hours: data.fridayHours },
				{ day: "saturday", hours: data.saturdayHours },
				{ day: "sunday", hours: data.sundayHours },
			];

			updatePayload.availability = [];

			days.forEach(({ day, hours }) => {
				if (!hours) {
					// Default to closed if no hours provided
					updatePayload.availability!.push({
						day,
						status: "closed",
					});
				} else if (typeof hours === "object" && "isOpen" in hours) {
					// Handle object format from form
					if (hours.isOpen) {
						updatePayload.availability!.push({
							day,
							openingTime: hours.open,
							closingTime: hours.close,
						});
					} else {
						updatePayload.availability!.push({
							day,
							status: "closed",
						});
					}
				} else if (typeof hours === "string") {
					// Handle string format
					if (hours.toLowerCase() === "closed") {
						updatePayload.availability!.push({
							day,
							status: "closed",
						});
					} else if (hours.includes("-")) {
						// Parse "09:00-18:00" format
						const [openingTime, closingTime] = hours.split("-");
						updatePayload.availability!.push({
							day,
							openingTime: openingTime.trim(),
							closingTime: closingTime.trim(),
						});
					} else {
						updatePayload.availability!.push({
							day,
							status: "closed",
						});
					}
				}
			});

			// Show final loading state
			toast.loading("Finalizing store update...", {
				description: "Almost done! Saving your changes.",
				id: loadingToast,
			});

			await storeService.updateStore(store._id, updatePayload);

			toast.success("Store updated successfully!", {
				description: `${data.name} has been updated and is now live.`,
				id: loadingToast,
			});

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
					<Button variant="outline" onClick={() => push(`/stores/${store._id}`)}>
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
