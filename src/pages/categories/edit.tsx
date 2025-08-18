import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Button } from "@/ui/button";
import { Icon } from "@/components/icon";
import { CategoryForm } from "./components/category-form";
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from "@/types/category";
import { toast } from "sonner";

export default function EditCategory() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const [category, setCategory] = useState<Category | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [fetchLoading, setFetchLoading] = useState(true);

	// Fetch category data
	useEffect(() => {
		const fetchCategory = async () => {
			if (!id) {
				toast.error("Category ID is required");
				navigate("/categories");
				return;
			}

			try {
				setFetchLoading(true);
				const response = await fetch(`/api/categories/${id}`);
				const result = await response.json();

				if (result.status === 0) {
					setCategory(result.data);
				} else {
					toast.error(result.message || "Failed to fetch category");
					navigate("/categories");
				}
			} catch (error) {
				console.error("Error fetching category:", error);
				toast.error("Failed to fetch category");
				navigate("/categories");
			} finally {
				setFetchLoading(false);
			}
		};

		fetchCategory();
	}, [id, navigate]);

	const handleUpdateCategory = async (data: CreateCategoryRequest | UpdateCategoryRequest) => {
		if (!id) return;

		try {
			setIsLoading(true);
			const response = await fetch(`/api/categories/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			const result = await response.json();

			if (result.status === 0) {
				toast.success("Category updated successfully!");
				navigate("/categories");
			} else {
				toast.error(result.message || "Failed to update category");
			}
		} catch (error) {
			console.error("Error updating category:", error);
			toast.error("Failed to update category");
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		navigate("/categories");
	};

	if (fetchLoading) {
		return (
			<div className="p-6">
				<div className="flex items-center justify-center h-64">
					<Icon icon="solar:refresh-bold" className="h-8 w-8 animate-spin" />
				</div>
			</div>
		);
	}

	if (!category) {
		return (
			<div className="p-6">
				<div className="flex flex-col items-center justify-center h-64 text-center">
					<Icon icon="solar:folder-error-bold" className="h-16 w-16 text-muted-foreground mb-4" />
					<h3 className="text-lg font-semibold mb-2">Category not found</h3>
					<p className="text-text-secondary mb-4">The requested category could not be found</p>
					<Button onClick={() => navigate("/categories")}>Back to Categories</Button>
				</div>
			</div>
		);
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
						<h1 className="text-2xl font-bold text-text-primary">Edit Category</h1>
						<p className="text-text-secondary mt-1">Update information for {category.name}</p>
					</div>
				</div>
			</div>

			{/* Edit Category Form */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg flex items-center gap-2">
						<Icon icon="solar:folder-bold" size={20} />
						Category Information
					</CardTitle>
				</CardHeader>
				<CardContent>
					<CategoryForm
						onSubmit={handleUpdateCategory}
						onCancel={handleCancel}
						isLoading={isLoading}
						editMode
						initialCategory={category}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
