import { useState } from "react";
import { useRouter } from "@/routes/hooks";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Icon } from "@/components/icon";
import { toast } from "sonner";
import { CreateStoreForm } from "./components/create-store-form";
import type { CreateStoreFormData } from "./schemas/store-schema";
import storeService from "@/api/services/storeService";

export default function CreateStore() {
	const [isLoading, setIsLoading] = useState(false);
	const { push } = useRouter();

	const handleCreateStore = async (data: CreateStoreFormData) => {
		setIsLoading(true);

		const loadingToast = toast.loading("Creating store...", {
			description: "Please wait while we add your new store.",
		});

		try {
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

			const availability: any[] = [];

			days.forEach(({ day, hours }) => {
				if (!hours) {
					// Default to closed if no hours provided
					availability.push({
						day,
						status: "closed",
					});
				} else if (typeof hours === "object" && "isOpen" in hours) {
					// Handle object format from form
					if (hours.isOpen) {
						availability.push({
							day,
							openingTime: hours.open,
							closingTime: hours.close,
						});
					} else {
						availability.push({
							day,
							status: "closed",
						});
					}
				} else if (typeof hours === "string") {
					// Handle string format
					if (hours.toLowerCase() === "closed") {
						availability.push({
							day,
							status: "closed",
						});
					} else if (hours.includes("-")) {
						// Parse "09:00-18:00" format
						const [openingTime, closingTime] = hours.split("-");
						availability.push({
							day,
							openingTime: openingTime.trim(),
							closingTime: closingTime.trim(),
						});
					} else {
						availability.push({
							day,
							status: "closed",
						});
					}
				}
			});

			// Create store payload according to backend format
			const storeData: any = {
				name: data.name,
				category: data.categoryId,
				description: data.description,
				website: data.website,
				location: {
					type: "Point",
					coordinates: [data.longitude || 0, data.latitude || 0],
					address: data.address,
				},
				availability,
			};

			// Add image if provided (uploaded image name)
			if (data.logo && typeof data.logo === "string") {
				storeData.image = data.logo;
			}

			console.log("Creating store with payload:", JSON.stringify(storeData, null, 2));

			await storeService.createStore(storeData as any);

			toast.success("Store created successfully!", {
				description: `${data.name} has been added to your store list.`,
				id: loadingToast,
			});

			push("/stores");
		} catch (error: any) {
			console.error("Failed to create store:", error);
			console.error("Server response:", error?.response?.data);

			const errorMessage = error?.response?.data?.message || error?.message || "Unknown error occurred";

			toast.error("Failed to create store", {
				description: `Error: ${errorMessage}`,
				id: loadingToast,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		push("/stores");
	};

	return (
		<div className="p-6 space-y-6">
			{/* Page Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="sm" onClick={handleCancel} className="h-8 w-8 p-0">
						<Icon icon="solar:arrow-left-bold" size={18} />
					</Button>
					<div>
						<h1 className="text-2xl font-bold text-text-primary">Create New Store</h1>
						<p className="text-text-secondary mt-1">Add a new store to the KampanYES platform</p>
					</div>
				</div>
			</div>

			{/* Create Store Form */}
			<Card>
				<CardContent className="pt-6">
					<CreateStoreForm onSubmit={handleCreateStore} onCancel={handleCancel} isLoading={isLoading} />
				</CardContent>
			</Card>
		</div>
	);
}
