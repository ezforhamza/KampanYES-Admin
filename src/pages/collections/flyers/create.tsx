import { useState, useEffect } from "react";
import { useRouter, useParams } from "@/routes/hooks";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Icon } from "@/components/icon";
import { toast } from "sonner";
import { CreateFlyerForm } from "../components/create-flyer-form";
import type { CreateFlyerFormData } from "../schemas/flyer-schema";
import type { Flyer } from "@/types/flyer";
import type { Collection } from "@/types/collection";
import { MOCK_COLLECTIONS } from "@/_mock/collection-data";
import { getSharedFlyers } from "@/_mock/shared-data";
import { MOCK_STORES } from "@/_mock/store-data";

export default function CreateFlyer() {
	const [isLoading, setIsLoading] = useState(false);
	const [collection, setCollection] = useState<Collection | null>(null);
	const [isLoadingCollection, setIsLoadingCollection] = useState(true);
	const { push } = useRouter();
	const { id } = useParams(); // collection ID

	useEffect(() => {
		const loadCollection = async () => {
			setIsLoadingCollection(true);
			try {
				// Simulate API call to fetch collection
				await new Promise((resolve) => setTimeout(resolve, 300));

				const foundCollection = MOCK_COLLECTIONS.find((c) => c.id === id);
				if (!foundCollection) {
					toast.error("Collection not found", {
						description: "The collection you're trying to add a flyer to doesn't exist.",
					});
					push("/collections");
					return;
				}

				setCollection(foundCollection);
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

	const handleCreateFlyer = async (data: CreateFlyerFormData) => {
		if (!collection) return;

		setIsLoading(true);

		const loadingToast = toast.loading("Creating flyer...", {
			description: "Please wait while we add your new flyer.",
		});

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Calculate final price
			const finalPrice = data.price - data.price * (data.discountPercentage / 100);

			// Create new flyer object
			const newFlyer: Flyer = {
				id: Date.now().toString(),
				name: data.name,
				image: typeof data.image === "string" ? data.image : URL.createObjectURL(data.image),
				price: data.price,
				discountPercentage: data.discountPercentage,
				finalPrice,
				collectionId: data.collectionId,
				storeId: data.storeId,
				startDate: data.startDate,
				endDate: data.endDate,
				status: data.status,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			// Add the new flyer to shared data
			getSharedFlyers().push(newFlyer);

			// Update collection flyer count
			const collectionIndex = MOCK_COLLECTIONS.findIndex((c) => c.id === collection.id);
			if (collectionIndex !== -1) {
				MOCK_COLLECTIONS[collectionIndex] = {
					...MOCK_COLLECTIONS[collectionIndex],
					flyersCount: MOCK_COLLECTIONS[collectionIndex].flyersCount + 1,
					// Set as thumbnail if it's the first flyer
					thumbnailFlyerId:
						MOCK_COLLECTIONS[collectionIndex].flyersCount === 0
							? newFlyer.id
							: MOCK_COLLECTIONS[collectionIndex].thumbnailFlyerId,
					updatedAt: new Date(),
				};
			}

			toast.success("Flyer created successfully!", {
				description: `${newFlyer.name} has been added to ${collection.name}.`,
				id: loadingToast,
			});

			// Navigate back to collection details
			push(`/collections/${collection.id}`);
		} catch (error) {
			console.error("Failed to create flyer:", error);
			toast.error("Failed to create flyer", {
				description: "Please try again or contact support if the problem persists.",
				id: loadingToast,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		if (collection) {
			push(`/collections/${collection.id}`);
		} else {
			push("/collections");
		}
	};

	// Get store information
	const store = collection ? MOCK_STORES.find((s) => s.id === collection.storeId) : null;

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
						<h1 className="text-2xl font-bold text-text-primary">Create New Flyer</h1>
						<p className="text-text-secondary mt-1">
							Add a promotional flyer to <span className="font-medium">{collection.name}</span>
							{store && <span className="text-muted-foreground"> • {store.name}</span>}
						</p>
					</div>
				</div>
			</div>

			{/* Create Flyer Form */}
			<Card>
				<CardContent className="pt-6">
					<CreateFlyerForm
						collectionId={collection.id}
						storeId={collection.storeId}
						onSubmit={handleCreateFlyer}
						onCancel={handleCancel}
						isLoading={isLoading}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
