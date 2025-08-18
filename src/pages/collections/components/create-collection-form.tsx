import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Button } from "@/ui/button";
import { Icon } from "@/components/icon";
import { createCollectionSchema, type CreateCollectionFormData } from "../schemas/collection-schema";
import { BasicStatus } from "@/types/enum";
import type { Collection } from "@/types/collection";
import type { Category } from "@/types/category";
import type { Store } from "@/types/store";
import { useEffect, useState } from "react";

interface CreateCollectionFormProps {
	onSubmit: (data: CreateCollectionFormData) => void;
	onCancel: () => void;
	isLoading?: boolean;
	editMode?: boolean;
	initialCollection?: Collection;
}

export function CreateCollectionForm({
	onSubmit,
	onCancel,
	isLoading,
	editMode = false,
	initialCollection,
}: CreateCollectionFormProps) {
	const [categories, setCategories] = useState<Category[]>([]);
	const [categoriesLoading, setCategoriesLoading] = useState(true);
	const [stores, setStores] = useState<Store[]>([]);
	const [storesLoading, setStoresLoading] = useState(true);

	const getDefaultValues = () => {
		if (editMode && initialCollection) {
			return {
				name: initialCollection.name,
				categoryId: initialCollection.categoryId,
				storeId: initialCollection.storeId,
				status: initialCollection.status,
			};
		}

		return {
			name: "",
			categoryId: "",
			storeId: "",
			status: BasicStatus.ENABLE,
		};
	};

	const form = useForm({
		resolver: zodResolver(createCollectionSchema),
		defaultValues: getDefaultValues(),
	});

	// Fetch categories and stores
	useEffect(() => {
		const fetchData = async () => {
			try {
				// Fetch categories
				setCategoriesLoading(true);
				const categoriesResponse = await fetch("/api/categories");
				const categoriesData = await categoriesResponse.json();
				if (categoriesData.status === 0) {
					setCategories(categoriesData.data.list.filter((cat: Category) => cat.status === BasicStatus.ENABLE));
				}

				// Fetch stores
				setStoresLoading(true);
				const storesResponse = await fetch("/api/stores");
				const storesData = await storesResponse.json();
				if (storesData.status === 0) {
					setStores(storesData.data.list.filter((store: Store) => store.status === BasicStatus.ENABLE));
				}
			} catch (error) {
				console.error("Error fetching data:", error);
			} finally {
				setCategoriesLoading(false);
				setStoresLoading(false);
			}
		};

		fetchData();
	}, []);

	// Reset form when collection changes (for edit mode)
	useEffect(() => {
		if (editMode && initialCollection) {
			form.reset(getDefaultValues());
		}
	}, [editMode, initialCollection, form]);

	const handleSubmit = (data: any) => {
		onSubmit(data as CreateCollectionFormData);
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
				{/* Form Content */}
				<div className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Collection Name */}
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem className="space-y-2">
									<FormLabel className="text-sm font-medium text-text-primary">Collection Name *</FormLabel>
									<FormControl>
										<Input placeholder="e.g., Weekly Deals" className="h-10" {...field} />
									</FormControl>
									<div className="min-h-[1.25rem]">
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>

						{/* Store Selection */}
						<FormField
							control={form.control}
							name="storeId"
							render={({ field }) => (
								<FormItem className="space-y-2">
									<FormLabel className="text-sm font-medium text-text-primary">Store *</FormLabel>
									<Select onValueChange={field.onChange} value={field.value || ""}>
										<FormControl>
											<SelectTrigger className="h-10">
												<SelectValue placeholder="Select store" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{storesLoading ? (
												<div className="px-2 py-1.5 text-sm text-muted-foreground">
													<div className="flex items-center gap-2">
														<Icon icon="solar:refresh-bold" className="w-4 h-4 animate-spin" />
														Loading stores...
													</div>
												</div>
											) : stores.length === 0 ? (
												<div className="px-2 py-1.5 text-sm text-muted-foreground">No stores available</div>
											) : (
												stores.map((store) => (
													<SelectItem key={store.id} value={store.id}>
														<div className="flex items-center gap-2">
															{store.logo && (
																<img src={store.logo} alt={store.name} className="w-4 h-4 rounded object-cover" />
															)}
															{store.name}
														</div>
													</SelectItem>
												))
											)}
										</SelectContent>
									</Select>
									<div className="min-h-[1.25rem]">
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Category */}
						<FormField
							control={form.control}
							name="categoryId"
							render={({ field }) => (
								<FormItem className="space-y-2">
									<FormLabel className="text-sm font-medium text-text-primary">Category *</FormLabel>
									<Select onValueChange={field.onChange} value={field.value || ""}>
										<FormControl>
											<SelectTrigger className="h-10">
												<SelectValue placeholder="Select category" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{categoriesLoading ? (
												<div className="p-2 text-center text-sm text-gray-500">Loading categories...</div>
											) : categories.length === 0 ? (
												<div className="p-2 text-center text-sm text-gray-500">No categories available</div>
											) : (
												categories.map((category) => (
													<SelectItem key={category.id} value={category.id}>
														{category.name}
													</SelectItem>
												))
											)}
										</SelectContent>
									</Select>
									<FormDescription className="text-xs text-muted-foreground">
										Choose the main category that best represents this collection
									</FormDescription>
									<div className="min-h-[1.25rem]">
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>

						{/* Collection Status */}
						<FormField
							control={form.control}
							name="status"
							render={({ field }) => (
								<FormItem className="space-y-2">
									<FormLabel className="text-sm font-medium text-text-primary">Collection Status *</FormLabel>
									<Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
										<FormControl>
											<SelectTrigger className="h-10">
												<SelectValue placeholder="Select status" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value={BasicStatus.ENABLE.toString()}>
												<div className="flex items-center gap-2">
													<div className="w-2 h-2 rounded-full bg-green-500"></div>
													Active
												</div>
											</SelectItem>
											<SelectItem value={BasicStatus.DISABLE.toString()}>
												<div className="flex items-center gap-2">
													<div className="w-2 h-2 rounded-full bg-red-500"></div>
													Inactive
												</div>
											</SelectItem>
										</SelectContent>
									</Select>
									<FormDescription className="text-xs text-muted-foreground">
										Active collections are visible to customers, inactive collections are hidden
									</FormDescription>
									<div className="min-h-[1.25rem]">
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>
					</div>
				</div>

				{/* Footer */}
				<div className="flex items-center justify-end gap-2 pt-6 border-t">
					<Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} className="min-w-[100px]">
						Cancel
					</Button>
					<Button type="submit" disabled={isLoading} className="min-w-[120px]">
						{isLoading && <Icon icon="solar:refresh-bold" className="mr-2 h-4 w-4 animate-spin" />}
						{editMode ? "Update Collection" : "Create Collection"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
