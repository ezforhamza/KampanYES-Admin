import { useState, useEffect } from "react";
import { useRouter, useParams } from "@/routes/hooks";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Icon } from "@/components/icon";
import { toast } from "sonner";
import { CreateFlyerForm } from "../../../collections/components/create-flyer-form";
import type { Store } from "@/types/store";
import type { Collection } from "@/types/collection";

/**
 * Store-specific Flyer Creation Page
 * Creates flyers within the context of a specific store and collection
 */
export default function CreateStoreCollectionFlyer() {
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

	const handleSubmit = async (data: any) => {
		if (!store || !collection) return;

		setIsLoading(true);

		const loadingToast = toast.loading("Creating flyer...", {
			description: `Adding ${data.name} to ${collection.name}.`,
		});

		try {
			const response = await fetch(`/api/collections/${collection.id}/flyers`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					...data,
					collectionId: collection.id,
					storeId: store.id,
				}),
			});

			const result = await response.json();

			if (result.status === 0) {
				toast.success("Flyer created successfully!", {
					description: `${data.name} has been added to ${collection.name}.`,
					id: loadingToast,
				});

				// Navigate back to the collection details page
				push(`/stores/${store.id}/collections/${collection.id}`);
			} else {
				throw new Error(result.message || "Failed to create flyer");
			}
		} catch (error) {
			console.error("Failed to create flyer:", error);
			toast.error("Failed to create flyer", {
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
					<h1 className="text-2xl font-bold text-text-primary">Create Flyer</h1>
					<p className="text-text-secondary mt-1">
						Add a new flyer to <span className="font-semibold">{collection.name}</span>
					</p>
				</div>
			</div>

			{/* Context Display */}
			<Card>
				<CardContent className="p-4">
					<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
						<div className="flex items-center gap-3">
							<Icon icon="solar:info-circle-bold" size={20} className="text-blue-600" />
							<div>
								<p className="text-sm font-medium text-blue-900 dark:text-blue-100">Creating flyer for</p>
								<p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
									{collection.name} • {store.name}
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Form */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg flex items-center gap-2">
						<Icon icon="solar:file-text-bold" size={20} />
						Flyer Information
					</CardTitle>
				</CardHeader>
				<CardContent>
					<CreateFlyerForm
						onSubmit={handleSubmit}
						onCancel={handleCancel}
						isLoading={isLoading}
						collectionId={collection.id}
						storeId={store.id}
					/>
				</CardContent>
			</Card>
		</div>
	);
}