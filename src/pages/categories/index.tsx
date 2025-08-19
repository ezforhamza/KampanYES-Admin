import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Card, CardContent } from "@/ui/card";
import { Icon } from "@/components/icon";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import type { Category, CategoryFilters } from "@/types/category";
import { toast } from "sonner";

export default function Categories() {
	const navigate = useNavigate();
	const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
	const [loading, setLoading] = useState(true);
	const [filters, setFilters] = useState<CategoryFilters>({});
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

	// Fetch categories
	const fetchCategories = async () => {
		try {
			setLoading(true);
			const queryParams = new URLSearchParams();
			if (filters.search) queryParams.set("search", filters.search);

			const response = await fetch(`/api/categories?${queryParams}`);
			const data = await response.json();

			if (data.status === 0) {
				setFilteredCategories(data.data.list);
				setFilteredCategories(data.data.list);
			} else {
				toast.error("Failed to fetch categories");
			}
		} catch (error) {
			console.error("Error fetching categories:", error);
			toast.error("Failed to fetch categories");
		} finally {
			setLoading(false);
		}
	};

	// Handle delete category
	const handleDeleteCategory = async () => {
		if (!selectedCategory) return;

		try {
			const response = await fetch(`/api/categories/${selectedCategory.id}`, {
				method: "DELETE",
			});

			const result = await response.json();

			if (result.status === 0) {
				toast.success("Category deleted successfully!");
				setIsDeleteDialogOpen(false);
				setSelectedCategory(null);
				fetchCategories();
			} else {
				toast.error(result.message || "Failed to delete category");
			}
		} catch (error) {
			console.error("Error deleting category:", error);
			toast.error("Failed to delete category");
		}
	};

	// Filter categories and refresh on page load
	// Fetch categories when component mounts or filters change
	useEffect(() => {
		fetchCategories();
	}, [filters]);

	// Refresh when page becomes visible again (e.g., navigating back from store creation)
	useEffect(() => {
		const handleVisibilityChange = () => {
			if (!document.hidden) {
				// Small delay to ensure any pending store operations are complete
				setTimeout(() => {
					fetchCategories();
				}, 100);
			}
		};

		const handleFocus = () => {
			// Refresh when window regains focus
			setTimeout(() => {
				fetchCategories();
			}, 100);
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);
		window.addEventListener("focus", handleFocus);

		return () => {
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			window.removeEventListener("focus", handleFocus);
		};
	}, []);

	const handleSearch = (search: string) => {
		setFilters((prev) => ({ ...prev, search }));
	};


	const handleCreateClick = () => {
		navigate("/categories/create");
	};

	const handleEditClick = (category: Category) => {
		navigate(`/categories/${category.id}/edit`);
	};

	const openDeleteDialog = (category: Category) => {
		setSelectedCategory(category);
		setIsDeleteDialogOpen(true);
	};

	return (
		<div className="p-6 space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold text-text-primary">Categories</h1>
					<p className="text-text-secondary mt-1">Manage categories to organize your stores and collections</p>
				</div>
				<Button onClick={handleCreateClick}>
					<Icon icon="solar:add-circle-bold" className="mr-2 h-4 w-4" />
					Add Category
				</Button>
			</div>

			{/* Filters */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
				<div className="flex-1">
					<Input
						placeholder="Search categories..."
						value={filters.search || ""}
						onChange={(e) => handleSearch(e.target.value)}
						className="max-w-sm"
					/>
				</div>
			</div>

			{/* Categories Grid */}
			{loading ? (
				<div className="flex items-center justify-center h-64">
					<Icon icon="solar:refresh-bold" className="h-8 w-8 animate-spin" />
				</div>
			) : filteredCategories.length === 0 ? (
				<div className="flex flex-col items-center justify-center h-64 text-center">
					<Icon icon="solar:folder-open-bold" className="h-16 w-16 text-muted-foreground mb-4" />
					<h3 className="text-lg font-semibold mb-2">No categories found</h3>
					<p className="text-text-secondary mb-4">Create your first category to get started</p>
					<Button onClick={handleCreateClick}>
						<Icon icon="solar:add-circle-bold" className="mr-2 h-4 w-4" />
						Add Category
					</Button>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{filteredCategories.map((category) => (
						<Card key={category.id} className="overflow-hidden hover:shadow-lg transition-shadow">
							<div className="aspect-video relative overflow-hidden">
								<img
									src={category.image}
									alt={category.name}
									className="w-full h-full object-cover"
									onError={(e) => {
										(e.target as HTMLImageElement).src =
											"https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop";
									}}
								/>
							</div>
							<CardContent className="p-4">
								<div className="space-y-2">
									<h3 className="font-semibold text-lg truncate">{category.name}</h3>
									<p className="text-sm text-text-secondary">
										{category.storesCount || 0} store{(category.storesCount || 0) !== 1 ? "s" : ""}
									</p>
									<div className="flex items-center justify-between pt-2">
										<div className="flex items-center gap-2">
											<Button variant="ghost" size="sm" onClick={() => handleEditClick(category)}>
												<Icon icon="solar:pen-bold" className="h-4 w-4" />
											</Button>
											<Button variant="ghost" size="sm" onClick={() => openDeleteDialog(category)}>
												<Icon icon="solar:trash-bin-trash-bold" className="h-4 w-4" />
											</Button>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Delete Category Dialog */}
			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-red-600">
							<Icon icon="solar:danger-circle-bold" size={24} />
							Delete Category
						</DialogTitle>
						<DialogDescription className="pt-2">
							Are you sure you want to delete <strong>{selectedCategory?.name}</strong>?
							{selectedCategory?.storesCount && selectedCategory.storesCount > 0 && (
								<> This category has {selectedCategory.storesCount} store(s) assigned to it.</>
							)}{" "}
							This action cannot be undone.
						</DialogDescription>
					</DialogHeader>

					<div className="py-4">
						<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
							<div className="flex items-start gap-3">
								<Icon icon="solar:info-circle-bold" size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
								<div className="text-sm text-red-800 dark:text-red-200">
									<p className="font-medium mb-1">This will delete:</p>
									<ul className="list-disc list-inside space-y-1 text-xs">
										<li>Category information and image</li>
										<li>Category from store selection options</li>
										{selectedCategory?.storesCount && selectedCategory.storesCount > 0 && (
											<li>Assignment from {selectedCategory.storesCount} store(s)</li>
										)}
									</ul>
								</div>
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setIsDeleteDialogOpen(false);
								setSelectedCategory(null);
							}}
						>
							Cancel
						</Button>
						<Button variant="destructive" onClick={handleDeleteCategory} className="min-w-[100px]">
							Delete Category
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
