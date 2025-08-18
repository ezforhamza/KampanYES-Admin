import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Button } from "@/ui/button";
import { Icon } from "@/components/icon";
import { CategoryForm } from "./components/category-form";
import type { CreateCategoryRequest } from "@/types/category";
import { toast } from "sonner";

export default function CreateCategory() {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);

	const handleCreateCategory = async (data: CreateCategoryRequest) => {
		try {
			setIsLoading(true);
			const response = await fetch("/api/categories", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			const result = await response.json();

			if (result.status === 0) {
				toast.success("Category created successfully!");
				navigate("/categories");
			} else {
				toast.error(result.message || "Failed to create category");
			}
		} catch (error) {
			console.error("Error creating category:", error);
			toast.error("Failed to create category");
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
				<CardHeader>
					<CardTitle className="text-lg flex items-center gap-2">
						<Icon icon="solar:folder-plus-bold" size={20} />
						Category Information
					</CardTitle>
				</CardHeader>
				<CardContent>
					<CategoryForm onSubmit={handleCreateCategory} onCancel={handleCancel} isLoading={isLoading} />
				</CardContent>
			</Card>
		</div>
	);
}
