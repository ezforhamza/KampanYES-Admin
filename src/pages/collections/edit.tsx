import { useState, useEffect } from "react";
import { useRouter, useParams } from "@/routes/hooks";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Icon } from "@/components/icon";
import { toast } from "sonner";
import { CreateCollectionForm } from "./components/create-collection-form";
import type { CreateCollectionFormData } from "./schemas/collection-schema";
import type { Collection } from "@/types/collection";

export default function EditCollection() {
	const [isLoading, setIsLoading] = useState(false);
	const [collection, setCollection] = useState<Collection | null>(null);
	const [isLoadingCollection, setIsLoadingCollection] = useState(true);
	const { push } = useRouter();
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
				} else {
					toast.error("Collection not found", {
						description: "The collection you're trying to edit doesn't exist.",
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

	const handleEditCollection = async (data: CreateCollectionFormData) => {
		if (!collection) return;

		setIsLoading(true);

		const loadingToast = toast.loading("Updating collection...", {
			description: `Saving changes to ${collection.name}.`,
		});

		try {
			// Create update payload
			const updatePayload = {
				name: data.name,
				categoryId: data.categoryId, // Use categoryId, not category
				storeId: data.storeId,
				status: data.status,
			};

			// Use MSW API endpoint
			const response = await fetch(`/api/collections/${collection.id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(updatePayload),
			});

			const result = await response.json();

			if (result.status !== 0) {
				throw new Error(result.message || "Failed to update collection");
			}

			toast.success("Collection updated successfully!", {
				description: `${data.name} information has been updated.`,
				id: loadingToast,
			});

			// Navigate back to collections list
			push("/collections");
		} catch (error) {
			console.error("Failed to update collection:", error);
			toast.error("Failed to update collection", {
				description: "Please try again or contact support if the problem persists.",
				id: loadingToast,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		push("/collections");
	};

	if (isLoadingCollection) {
		return (
			<div className="p-6 space-y-6">
				<div className="flex items-center justify-center min-h-[400px]">
					<div className="flex flex-col items-center gap-4">
						<Icon icon="svg-spinners:6-dots-scale-middle" size={32} className="text-primary" />
						<p className="text-text-secondary">Loading collection information...</p>
					</div>
				</div>
			</div>
		);
	}

	if (!collection) {
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
						<h1 className="text-2xl font-bold text-text-primary">Edit Collection</h1>
						<p className="text-text-secondary mt-1">Update {collection.name} information</p>
					</div>
				</div>

				{/* Quick Actions */}
				<div className="flex items-center gap-2">
					<Button variant="outline" onClick={() => push(`/collections/${collection.id}`)}>
						<Icon icon="solar:eye-bold" size={16} className="mr-2" />
						View Details
					</Button>
				</div>
			</div>

			{/* Edit Collection Form */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg flex items-center gap-2">
						<Icon icon="solar:pen-bold" size={20} />
						Collection Information
					</CardTitle>
				</CardHeader>
				<CardContent>
					<CreateCollectionForm
						editMode={true}
						initialCollection={collection}
						onSubmit={handleEditCollection}
						onCancel={handleCancel}
						isLoading={isLoading}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
