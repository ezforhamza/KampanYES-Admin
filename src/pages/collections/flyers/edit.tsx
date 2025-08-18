import { useState, useEffect } from "react";
import { useRouter, useParams } from "@/routes/hooks";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Icon } from "@/components/icon";
import { toast } from "sonner";
import { CreateFlyerForm } from "../components/create-flyer-form";
import type { CreateFlyerFormData } from "../schemas/flyer-schema";
import type { Flyer } from "@/types/flyer";
import type { Collection } from "@/types/collection";
import { MOCK_COLLECTIONS, MOCK_FLYERS } from "@/_mock/collection-data";
import { MOCK_STORES } from "@/_mock/store-data";

export default function EditFlyer() {
	const [isLoading, setIsLoading] = useState(false);
	const [collection, setCollection] = useState<Collection | null>(null);
	const [flyer, setFlyer] = useState<Flyer | null>(null);
	const [isLoadingData, setIsLoadingData] = useState(true);
	const { push } = useRouter();
	const { id, flyerId } = useParams(); // collection ID and flyer ID

	useEffect(() => {
		const loadData = async () => {
			setIsLoadingData(true);
			try {
				// Simulate API call to fetch collection and flyer
				await new Promise((resolve) => setTimeout(resolve, 500));

				const foundCollection = MOCK_COLLECTIONS.find((c) => c.id === id);
				if (!foundCollection) {
					toast.error("Collection not found", {
						description: "The collection doesn't exist.",
					});
					push("/collections");
					return;
				}

				const foundFlyer = MOCK_FLYERS.find((f) => f.id === flyerId && f.collectionId === id);
				if (!foundFlyer) {
					toast.error("Flyer not found", {
						description: "The flyer you're trying to edit doesn't exist.",
					});
					push(`/collections/${id}`);
					return;
				}

				setCollection(foundCollection);
				setFlyer(foundFlyer);
			} catch (error) {
				console.error("Failed to load data:", error);
				toast.error("Failed to load data", {
					description: "Please try again or contact support if the problem persists.",
				});
				push("/collections");
			} finally {
				setIsLoadingData(false);
			}
		};

		if (id && flyerId) {
			loadData();
		}
	}, [id, flyerId, push]);

	const handleEditFlyer = async (data: CreateFlyerFormData) => {
		if (!collection || !flyer) return;

		setIsLoading(true);

		const loadingToast = toast.loading("Updating flyer...", {
			description: `Saving changes to ${flyer.name}.`,
		});

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Calculate final price
			const finalPrice = data.price - data.price * (data.discountPercentage / 100);

			// Update the flyer in mock data
			const flyerIndex = MOCK_FLYERS.findIndex((f) => f.id === flyer.id);
			if (flyerIndex !== -1) {
				MOCK_FLYERS[flyerIndex] = {
					...MOCK_FLYERS[flyerIndex],
					name: data.name,
					image: typeof data.image === "string" ? data.image : URL.createObjectURL(data.image),
					price: data.price,
					discountPercentage: data.discountPercentage,
					finalPrice,
					startDate: data.startDate,
					endDate: data.endDate,
					status: data.status,
					updatedAt: new Date(),
				};
			}

			// Update collection updated date
			const collectionIndex = MOCK_COLLECTIONS.findIndex((c) => c.id === collection.id);
			if (collectionIndex !== -1) {
				MOCK_COLLECTIONS[collectionIndex] = {
					...MOCK_COLLECTIONS[collectionIndex],
					updatedAt: new Date(),
				};
			}

			toast.success("Flyer updated successfully!", {
				description: `${data.name} information has been updated.`,
				id: loadingToast,
			});

			// Navigate back to collection details
			push(`/collections/${collection.id}`);
		} catch (error) {
			console.error("Failed to update flyer:", error);
			toast.error("Failed to update flyer", {
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

	if (isLoadingData) {
		return (
			<div className="p-6 space-y-6">
				<div className="flex items-center justify-center min-h-[400px]">
					<div className="flex flex-col items-center gap-4">
						<Icon icon="svg-spinners:6-dots-scale-middle" size={32} className="text-primary" />
						<p className="text-text-secondary">Loading flyer information...</p>
					</div>
				</div>
			</div>
		);
	}

	if (!collection || !flyer) {
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
						<h1 className="text-2xl font-bold text-text-primary">Edit Flyer</h1>
						<p className="text-text-secondary mt-1">
							Update <span className="font-medium">{flyer.name}</span> in{" "}
							<span className="font-medium">{collection.name}</span>
							{store && <span className="text-muted-foreground"> • {store.name}</span>}
						</p>
					</div>
				</div>
			</div>

			{/* Collection Context Card */}
			<Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
				<CardContent className="pt-4">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
							<Icon icon="solar:folder-bold-duotone" size={20} className="text-blue-600 dark:text-blue-400" />
						</div>
						<div>
							<h3 className="font-semibold text-blue-900 dark:text-blue-100">{collection.name}</h3>
							<p className="text-sm text-blue-700 dark:text-blue-300">
								{store?.name} • {collection.category?.replace("_", " ").toUpperCase()} • {collection.flyersCount} flyers
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Edit Flyer Form */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg flex items-center gap-2">
						<Icon icon="solar:pen-bold" size={20} />
						Flyer Information
					</CardTitle>
				</CardHeader>
				<CardContent>
					<CreateFlyerForm
						editMode={true}
						initialFlyer={flyer}
						collectionId={collection.id}
						storeId={collection.storeId}
						onSubmit={handleEditFlyer}
						onCancel={handleCancel}
						isLoading={isLoading}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
