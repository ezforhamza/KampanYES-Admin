import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "@/ui/card";
import { Button } from "@/ui/button";
import { Icon } from "@/components/icon";
import { CategoryForm } from "./components/category-form";
import type { CreateCategoryRequest } from "@/types/category";
import { toast } from "sonner";
import categoryService from "@/api/services/categoryService";

export default function CreateCategory() {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);

	const handleCreateCategory = async (data: CreateCategoryRequest) => {
		try {
			setIsLoading(true);

			console.log("Creating category with payload:", JSON.stringify(data, null, 2));

			await categoryService.createCategory(data);

			toast.success("Category created successfully!");
			navigate("/categories");
		} catch (error: any) {
			console.error("Error creating category:", error);
			console.error("Server response:", error?.response?.data);

			const errorMessage = error?.response?.data?.message || error?.message || "Failed to create category";
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		navigate("/categories");
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
						<h1 className="text-2xl font-bold text-text-primary">Create New Category</h1>
						<p className="text-text-secondary mt-1">Add a new category to organize your stores</p>
					</div>
				</div>
			</div>

			{/* Create Category Form */}
			<Card>
				<CardContent className="pt-6">
					<CategoryForm onSubmit={handleCreateCategory} onCancel={handleCancel} isLoading={isLoading} />
				</CardContent>
			</Card>
		</div>
	);
}
