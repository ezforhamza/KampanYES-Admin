import { useState } from "react";
import { useRouter } from "@/routes/hooks";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Icon } from "@/components/icon";
import { toast } from "sonner";
import { CreateCollectionForm } from "./components/create-collection-form";
import type { CreateCollectionFormData } from "./schemas/collection-schema";

export default function CreateCollection() {
	const [isLoading, setIsLoading] = useState(false);
	const { push } = useRouter();

	const handleCreateCollection = async (data: CreateCollectionFormData) => {
		setIsLoading(true);

		const loadingToast = toast.loading("Creating collection...", {
			description: "Please wait while we add your new collection.",
		});

		try {
			// Create collection payload
			const collectionPayload = {
				name: data.name,
				categoryId: data.categoryId, // Use categoryId, not category
				storeId: data.storeId,
				status: data.status,
			};

			// Use MSW API endpoint
			const response = await fetch("/api/collections", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(collectionPayload),
			});

			const result = await response.json();

			if (result.status === 0) {
				toast.success("Collection created successfully!", {
					description: `${result.data.name} has been added to your collections.`,
					id: loadingToast,
				});

				// Navigate back to collections list
				push("/collections");
			} else {
				throw new Error(result.message || "Failed to create collection");
			}
		} catch (error) {
			console.error("Failed to create collection:", error);
			toast.error("Failed to create collection", {
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

	return (
		<div className="p-6 space-y-6">
			{/* Page Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="sm" onClick={handleCancel} className="h-8 w-8 p-0">
						<Icon icon="solar:arrow-left-bold" size={18} />
					</Button>
					<div>
						<h1 className="text-2xl font-bold text-text-primary">Create New Collection</h1>
						<p className="text-text-secondary mt-1">Add a new collection to organize your flyers</p>
					</div>
				</div>
			</div>

			{/* Create Collection Form */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg flex items-center gap-2">
						<Icon icon="solar:folder-plus-bold" size={20} />
						Collection Information
					</CardTitle>
				</CardHeader>
				<CardContent>
					<CreateCollectionForm onSubmit={handleCreateCollection} onCancel={handleCancel} isLoading={isLoading} />
				</CardContent>
			</Card>
		</div>
	);
}
