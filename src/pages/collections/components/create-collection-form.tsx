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
import { useEffect } from "react";

interface CreateCollectionFormProps {
	onSubmit: (data: CreateCollectionFormData) => void;
	onCancel: () => void;
	isLoading?: boolean;
	editMode?: boolean;
	initialCollection?: Collection;
	storeName?: string; // Display the store name for context
}

export function CreateCollectionForm({
	onSubmit,
	onCancel,
	isLoading,
	editMode = false,
	initialCollection,
	storeName,
}: CreateCollectionFormProps) {

	const getDefaultValues = () => {
		if (editMode && initialCollection) {
			return {
				name: initialCollection.name,
				status: initialCollection.status,
			};
		}

		return {
			name: "",
			status: BasicStatus.ENABLE,
		};
	};

	const form = useForm({
		resolver: zodResolver(createCollectionSchema),
		defaultValues: getDefaultValues(),
	});

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
					{/* Store Context Display */}
					{storeName && (
						<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
							<div className="flex items-center gap-3">
								<Icon icon="solar:shop-bold" size={20} className="text-blue-600" />
								<div>
									<p className="text-sm font-medium text-blue-900 dark:text-blue-100">Creating collection for</p>
									<p className="text-lg font-semibold text-blue-900 dark:text-blue-100">{storeName}</p>
								</div>
							</div>
						</div>
					)}

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
									<FormDescription className="text-xs text-muted-foreground">
										Choose a descriptive name for this collection
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
