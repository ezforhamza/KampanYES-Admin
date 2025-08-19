import { useState, useEffect } from "react";
import { useRouter, useParams } from "@/routes/hooks";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Icon } from "@/components/icon";
import { toast } from "sonner";
import { CreateCollectionForm } from "../../collections/components/create-collection-form";
import { createCollectionWithStoreSchema, type CreateCollectionFormData } from "../../collections/schemas/collection-schema";
import type { Store } from "@/types/store";
import type { Collection } from "@/types/collection";

/**
 * Store-specific Collection Edit Page
 * Edits collections within the context of a specific store
 */
export default function EditStoreCollection() {
	const [store, setStore] = useState<Store | null>(null);
	const [collection, setCollection] = useState<Collection | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingData, setIsLoadingData] = useState(true);
	const { push, back } = useRouter();
	const { id: storeId, collectionId } = useParams();

	// Load store and collection information
	useEffect(() => {
		const loadData = async () => {
			if (!storeId || !collectionId) return;

			setIsLoadingData(true);
			try {
				// Load store first
				const storeResponse = await fetch(`/api/stores/${storeId}`);
				const storeResult = await storeResponse.json();

				if (storeResult.status !== 0) {
					toast.error("Store not found");
					push("/stores");
					return;
				}

				setStore(storeResult.data);

				// Load collection
				const collectionResponse = await fetch(`/api/collections/${collectionId}`);
				const collectionResult = await collectionResponse.json();

				if (collectionResult.status !== 0) {
					toast.error("Collection not found");
					push(`/stores/${storeId}`);
					return;
				}

				// Verify collection belongs to this store
				if (collectionResult.data.storeId !== storeId) {
					toast.error("Collection not found in this store");
					push(`/stores/${storeId}`);
					return;
				}

				setCollection(collectionResult.data);
			} catch (error) {
				console.error("Failed to load data:", error);
				toast.error("Failed to load data", {
					description: "Please try again or contact support if the problem persists.",
				});
				push(`/stores/${storeId}`);
			} finally {
				setIsLoadingData(false);
			}
		};

		loadData();
	}, [storeId, collectionId, push]);

	const handleSubmit = async (data: CreateCollectionFormData) => {
		if (!store || !collection) return;

		setIsLoading(true);

		const loadingToast = toast.loading("Updating collection...", {
			description: `Saving changes to ${data.name}.`,
		});

		try {
			// Create collection data with store context
			const collectionData = {
				...data,
				storeId: store.id,
			};

			// Validate with store context schema
			const validatedData = createCollectionWithStoreSchema.parse(collectionData);

			const response = await fetch(`/api/collections/${collection.id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(validatedData),
			});

			const result = await response.json();

			if (result.status === 0) {
				toast.success("Collection updated successfully!", {
					description: `${data.name} has been updated.`,
					id: loadingToast,
				});

				// Navigate back to the collection details page
				push(`/stores/${store.id}/collections/${collection.id}`);
			} else {
				throw new Error(result.message || "Failed to update collection");
			}
		} catch (error) {
			console.error("Failed to update collection:", error);
			toast.error("Failed to update collection", {
				description: error instanceof Error ? error.message : "Please try again or contact support if the problem persists.",
				id: loadingToast,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		back();
	};

	if (isLoadingData) {
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

	if (!store || !collection) {
		return null;
	}

	return (
		<div className="p-6 space-y-6">
			{/* Page Header */}
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="sm" onClick={() => back()} className="h-8 w-8 p-0">
					<Icon icon="solar:arrow-left-bold" size={18} />
				</Button>
				<div>
					<div className="text-sm text-text-secondary mb-1">
						<Button 
							variant="link" 
							onClick={() => push(`/stores/${storeId}`)}
							className="p-0 h-auto text-sm text-text-secondary hover:text-primary"
						>
							{store.name}
						</Button>
						<span className="mx-1">→</span>
						<Button 
							variant="link" 
							onClick={() => push(`/stores/${storeId}/collections/${collectionId}`)}
							className="p-0 h-auto text-sm text-text-secondary hover:text-primary"
						>
							{collection.name}
						</Button>
					</div>
					<h1 className="text-2xl font-bold text-text-primary">Edit Collection</h1>
					<p className="text-text-secondary mt-1">
						Update collection information for <span className="font-semibold">{store.name}</span>
					</p>
				</div>
			</div>

			{/* Form */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg flex items-center gap-2">
						<Icon icon="solar:folder-bold" size={20} />
						Collection Information
					</CardTitle>
				</CardHeader>
				<CardContent>
					<CreateCollectionForm
						onSubmit={handleSubmit}
						onCancel={handleCancel}
						isLoading={isLoading}
						editMode={true}
						initialCollection={collection}
						storeName={store.name}
					/>
				</CardContent>
			</Card>
		</div>
	);
}