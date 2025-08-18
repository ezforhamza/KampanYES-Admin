import { useState } from "react";
import { useRouter } from "@/routes/hooks";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Icon } from "@/components/icon";
import { toast } from "sonner";
import { CreateStoreForm } from "./components/create-store-form";
import type { CreateStoreFormData } from "./schemas/store-schema";

export default function CreateStore() {
	const [isLoading, setIsLoading] = useState(false);
	const { push } = useRouter();

	const handleCreateStore = async (data: CreateStoreFormData) => {
		setIsLoading(true);

		const loadingToast = toast.loading("Creating store...", {
			description: "Please wait while we add your new store.",
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

			// Create store payload
			const storePayload = {
				name: data.name,
				categoryId: data.categoryId, // Use categoryId, not category
				logo: logoUrl,
				description: data.description,
				website: data.website,
				location: {
					address: data.address,
					city: (data as any).locationDetails?.city || "",
					postcode: (data as any).locationDetails?.postcode || "",
					country: (data as any).locationDetails?.country || "",
					coordinates:
						data.latitude && data.longitude
							? {
									lat: data.latitude,
									lng: data.longitude,
								}
							: undefined,
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
			const response = await fetch("/api/stores", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(storePayload),
			});

			const result = await response.json();

			if (result.status === 0) {
				toast.success("Store created successfully!", {
					description: `${result.data.name} has been added to your store list.`,
					id: loadingToast,
				});

				// Navigate back to stores list
				push("/stores");
			} else {
				throw new Error(result.message || "Failed to create store");
			}
		} catch (error) {
			console.error("Failed to create store:", error);
			toast.error("Failed to create store", {
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
				<CardHeader>
					<CardTitle className="text-lg flex items-center gap-2">
						<Icon icon="solar:shop-bold" size={20} />
						Store Information
					</CardTitle>
				</CardHeader>
				<CardContent>
					<CreateStoreForm onSubmit={handleCreateStore} onCancel={handleCancel} isLoading={isLoading} />
				</CardContent>
			</Card>
		</div>
	);
}
