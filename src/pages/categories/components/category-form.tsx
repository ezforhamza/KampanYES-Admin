import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import { Upload } from "@/components/upload/upload";
import { Icon } from "@/components/icon";
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from "@/types/category";

// Schema for category form validation
const categorySchema = z.object({
	name: z.string().min(1, "Category name is required").max(50, "Name must be less than 50 characters"),
	image: z.union([z.instanceof(File), z.string().url("Please provide a valid image URL")], {
		errorMap: () => ({ message: "Category image is required" }),
	}),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
	onSubmit: (data: any) => void;
	onCancel: () => void;
	isLoading?: boolean;
	editMode?: boolean;
	initialCategory?: Category;
}

export function CategoryForm({ onSubmit, onCancel, isLoading, editMode = false, initialCategory }: CategoryFormProps) {
	const getDefaultValues = (): CategoryFormData => {
		if (editMode && initialCategory) {
			return {
				name: initialCategory.name,
				image: initialCategory.image,
			};
		}

		return {
			name: "",
			image: undefined as any,
		};
	};

	const form = useForm<CategoryFormData>({
		resolver: zodResolver(categorySchema),
		defaultValues: getDefaultValues(),
	});

	const handleSubmit = (data: CategoryFormData) => {
		if (editMode) {
			const submitData: UpdateCategoryRequest = {
				name: data.name,
				image: data.image,
			};
			onSubmit(submitData);
		} else {
			const submitData: CreateCategoryRequest = {
				name: data.name,
				image: data.image,
			};
			onSubmit(submitData);
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
				{/* Form Content */}
				<div className="space-y-6">
					{/* Category Image Upload */}
					<FormField
						control={form.control}
						name="image"
						render={({ field }) => (
							<FormItem className="space-y-2">
								<FormLabel className="text-sm font-medium text-text-primary">Category Image *</FormLabel>
								<FormControl>
									<div onClick={(e) => e.stopPropagation()}>
										<Upload
											accept="image/*"
											maxCount={1}
											beforeUpload={() => false}
											onChange={(info) => {
												const file = info.fileList[0]?.originFileObj;
												if (file) {
													field.onChange(file);
												} else if (info.fileList.length === 0) {
													field.onChange(undefined);
												}
											}}
											fileList={
												field.value
													? [
															{
																uid: "1",
																name: typeof field.value === "string" ? "category-image.jpg" : field.value.name,
																status: "done" as const,
																originFileObj: typeof field.value !== "string" ? field.value as any : undefined,
																url: typeof field.value === "string" ? field.value : URL.createObjectURL(field.value),
															},
														]
													: []
											}
											showUploadList={{
												showPreviewIcon: false,
												showRemoveIcon: true,
												showDownloadIcon: false,
											}}
										/>
									</div>
								</FormControl>
								<FormDescription className="text-xs text-muted-foreground">
									Upload PNG, JPG up to 5MB • Recommended: 400x300px
								</FormDescription>
								<div className="min-h-[1.25rem]">
									<FormMessage />
								</div>
							</FormItem>
						)}
					/>

					{/* Category Name */}
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem className="space-y-2">
								<FormLabel className="text-sm font-medium text-text-primary">Category Name *</FormLabel>
								<FormControl>
									<Input placeholder="e.g., Electronics, Fashion, Supermarkets" className="h-10" {...field} />
								</FormControl>
								<FormDescription className="text-xs text-muted-foreground">
									Choose a clear, descriptive name for your category
								</FormDescription>
								<div className="min-h-[1.25rem]">
									<FormMessage />
								</div>
							</FormItem>
						)}
					/>

				</div>

				{/* Footer */}
				<div className="flex items-center justify-end gap-2 pt-6 border-t">
					<Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} className="min-w-[100px]">
						Cancel
					</Button>
					<Button type="submit" disabled={isLoading} className="min-w-[120px]">
						{isLoading && <Icon icon="solar:refresh-bold" className="mr-2 h-4 w-4 animate-spin" />}
						{editMode ? "Update Category" : "Create Category"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
