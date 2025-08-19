import { useState, useEffect } from "react";
import { useRouter, useParams } from "@/routes/hooks";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Icon } from "@/components/icon";
import { toast } from "sonner";
import { CreateCollectionForm } from "../../collections/components/create-collection-form";
import { createCollectionWithStoreSchema, type CreateCollectionFormData } from "../../collections/schemas/collection-schema";
import type { Store } from "@/types/store";

/**
 * Store-specific Collection Creation Page
 * Creates collections within the context of a specific store
 */
export default function CreateStoreCollection() {
	const [store, setStore] = useState<Store | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingStore, setIsLoadingStore] = useState(true);
	const { push, back } = useRouter();
	const { id: storeId } = useParams();

	// Load store information
	useEffect(() => {
		const loadStore = async () => {
			if (!storeId) return;

			setIsLoadingStore(true);
			try {
				const response = await fetch(`/api/stores/${storeId}`);
				const result = await response.json();

				if (result.status === 0) {
					setStore(result.data);
				} else {
					toast.error("Store not found", {
						description: "The store you're trying to create a collection for doesn't exist.",
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

		loadStore();
	}, [storeId, push]);

	const handleSubmit = async (data: CreateCollectionFormData) => {
		if (!store) return;

		setIsLoading(true);

		const loadingToast = toast.loading("Creating collection...", {
			description: `Adding ${data.name} to ${store.name}.`,
		});

		try {
			// Create collection data with store context
			const collectionData = {
				...data,
				storeId: store.id,
			};

			// Validate with store context schema
			const validatedData = createCollectionWithStoreSchema.parse(collectionData);

			const response = await fetch("/api/collections", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(validatedData),
			});

			const result = await response.json();

			if (result.status === 0) {
				toast.success("Collection created successfully!", {
					description: `${data.name} has been added to ${store.name}.`,
					id: loadingToast,
				});

				// Navigate to the store details page to see the new collection
				push(`/stores/${store.id}`);
			} else {
				throw new Error(result.message || "Failed to create collection");
			}
		} catch (error) {
			console.error("Failed to create collection:", error);
			toast.error("Failed to create collection", {
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
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="sm" onClick={() => back()} className="h-8 w-8 p-0">
					<Icon icon="solar:arrow-left-bold" size={18} />
				</Button>
				<div>
					<h1 className="text-2xl font-bold text-text-primary">Create Collection</h1>
					<p className="text-text-secondary mt-1">
						Add a new collection to <span className="font-semibold">{store.name}</span>
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
						storeName={store.name}
					/>
				</CardContent>
			</Card>
		</div>
	);
}