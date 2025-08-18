import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Button } from "@/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { Calendar } from "@/ui/calendar";
import { Icon } from "@/components/icon";
import { cn } from "@/utils/index";
import { format } from "date-fns";
import { createFlyerSchema, type CreateFlyerFormData } from "../schemas/flyer-schema";
import { BasicStatus } from "@/types/enum";
import type { Flyer } from "@/types/flyer";
import { useEffect, useMemo } from "react";
import { Upload } from "@/components/upload/upload";

interface CreateFlyerFormProps {
	onSubmit: (data: CreateFlyerFormData) => void;
	onCancel: () => void;
	isLoading?: boolean;
	editMode?: boolean;
	initialFlyer?: Flyer;
	collectionId: string;
	storeId: string;
}

export function CreateFlyerForm({
	onSubmit,
	onCancel,
	isLoading,
	editMode = false,
	initialFlyer,
	collectionId,
	storeId,
}: CreateFlyerFormProps) {
	const getDefaultValues = () => {
		if (editMode && initialFlyer) {
			return {
				name: initialFlyer.name,
				image: initialFlyer.image,
				price: initialFlyer.price,
				discountPercentage: initialFlyer.discountPercentage,
				startDate: new Date(initialFlyer.startDate),
				endDate: new Date(initialFlyer.endDate),
				collectionId: initialFlyer.collectionId,
				storeId: initialFlyer.storeId,
				status: initialFlyer.status,
			};
		}

		return {
			name: "",
			image: undefined,
			price: 0,
			discountPercentage: 0,
			startDate: new Date(),
			endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
			collectionId,
			storeId,
			status: BasicStatus.ENABLE,
		};
	};

	const form = useForm({
		resolver: zodResolver(createFlyerSchema),
		defaultValues: getDefaultValues(),
	});

	// Calculate final price based on price and discount
	const watchedPrice = form.watch("price");
	const watchedDiscount = form.watch("discountPercentage");

	const finalPrice = useMemo(() => {
		if (!watchedPrice || watchedPrice <= 0) return 0;
		if (!watchedDiscount || watchedDiscount <= 0) return watchedPrice;
		return watchedPrice - watchedPrice * (watchedDiscount / 100);
	}, [watchedPrice, watchedDiscount]);

	// Reset form when flyer changes (for edit mode)
	useEffect(() => {
		if (editMode && initialFlyer) {
			form.reset(getDefaultValues());
		}
	}, [editMode, initialFlyer, form]);

	const handleSubmit = (data: any) => {
		onSubmit(data as CreateFlyerFormData);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h2 className="text-lg font-semibold">{editMode ? "Edit Flyer" : "Create New Flyer"}</h2>
				<p className="text-sm text-text-secondary mt-1">
					{editMode
						? `Update flyer information for ${initialFlyer?.name}`
						: "Create a new promotional flyer for this collection."}
				</p>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
					{/* Form Content */}
					<div className="space-y-8">
						{/* Basic Information Section */}
						<div className="space-y-6">
							<div className="border-b pb-2">
								<h3 className="text-lg font-semibold text-text-primary">Basic Information</h3>
								<p className="text-sm text-text-secondary">Essential details about your flyer</p>
							</div>

							{/* Flyer Image Upload */}
							<FormField
								control={form.control}
								name="image"
								render={({ field }) => (
									<FormItem className="space-y-2">
										<FormLabel className="text-sm font-medium text-text-primary">Flyer Image *</FormLabel>
										<FormControl>
											<div onClick={(e) => e.stopPropagation()}>
												<Upload
													accept="image/*"
													maxCount={1}
													beforeUpload={() => false} // Prevent auto upload
													onChange={(info) => {
														const file = info.fileList[0]?.originFileObj;
														if (file) {
															field.onChange(file);
														} else if (info.fileList.length === 0) {
															// Handle file removal
															field.onChange(undefined);
														}
													}}
													onRemove={() => {
														// Prevent form submission and handle file removal
														field.onChange(undefined);
														return false; // Prevent default removal behavior
													}}
													fileList={
														field.value
															? [
																	{
																		uid: "1",
																		name: typeof field.value === "string" ? "flyer-image.jpg" : field.value.name,
																		status: "done" as const,
																		originFileObj: typeof field.value !== "string" ? field.value as any : undefined,
																		url: typeof field.value === "string" ? field.value : undefined,
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

							{/* Flyer Name */}
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem className="space-y-2">
										<FormLabel className="text-sm font-medium text-text-primary">Flyer Name *</FormLabel>
										<FormControl>
											<Input placeholder="e.g., Fresh Organic Vegetables" className="h-10" {...field} />
										</FormControl>
										<FormDescription className="text-xs text-muted-foreground">
											Choose a descriptive name for your promotional item
										</FormDescription>
										<div className="min-h-[1.25rem]">
											<FormMessage />
										</div>
									</FormItem>
								)}
							/>
						</div>

						{/* Pricing Information Section */}
						<div className="space-y-6">
							<div className="border-b pb-2">
								<h3 className="text-lg font-semibold text-text-primary">Pricing Information</h3>
								<p className="text-sm text-text-secondary">Set the original price and discount</p>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								{/* Original Price */}
								<FormField
									control={form.control}
									name="price"
									render={({ field }) => (
										<FormItem className="space-y-2">
											<FormLabel className="text-sm font-medium text-text-primary">Original Price (€) *</FormLabel>
											<FormControl>
												<Input
													type="number"
													step="0.01"
													min="0.01"
													placeholder="0.00"
													className="h-10"
													onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
													value={field.value || ""}
												/>
											</FormControl>
											<div className="min-h-[1.25rem]">
												<FormMessage />
											</div>
										</FormItem>
									)}
								/>

								{/* Discount Percentage */}
								<FormField
									control={form.control}
									name="discountPercentage"
									render={({ field }) => (
										<FormItem className="space-y-2">
											<FormLabel className="text-sm font-medium text-text-primary">Discount (%)</FormLabel>
											<FormControl>
												<Input
													type="number"
													step="1"
													min="0"
													max="100"
													placeholder="0"
													className="h-10"
													onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
													value={field.value || ""}
												/>
											</FormControl>
											<div className="min-h-[1.25rem]">
												<FormMessage />
											</div>
										</FormItem>
									)}
								/>

								{/* Final Price (Calculated) */}
								<div className="space-y-2">
									<label className="text-sm font-medium text-text-primary">Final Price (€)</label>
									<div className="h-10 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-input rounded-md flex items-center">
										<span className="text-lg font-semibold text-green-600">€{finalPrice.toFixed(2)}</span>
									</div>
									<p className="text-xs text-muted-foreground">Automatically calculated based on price and discount</p>
								</div>
							</div>
						</div>

						{/* Date Range Section */}
						<div className="space-y-6">
							<div className="border-b pb-2">
								<h3 className="text-lg font-semibold text-text-primary">Validity Period</h3>
								<p className="text-sm text-text-secondary">Set when this flyer will be active</p>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Start Date */}
								<FormField
									control={form.control}
									name="startDate"
									render={({ field }) => (
										<FormItem className="space-y-2">
											<FormLabel className="text-sm font-medium text-text-primary">Start Date *</FormLabel>
											<Popover>
												<PopoverTrigger asChild>
													<FormControl>
														<Button
															variant="outline"
															className={cn(
																"h-10 w-full pl-3 text-left font-normal",
																!field.value && "text-muted-foreground",
															)}
														>
															{field.value ? format(field.value, "PPP") : <span>Pick a start date</span>}
															<Icon icon="solar:calendar-bold" className="ml-auto h-4 w-4 opacity-50" />
														</Button>
													</FormControl>
												</PopoverTrigger>
												<PopoverContent className="w-auto p-0" align="start">
													<Calendar
														mode="single"
														selected={field.value}
														onSelect={field.onChange}
														disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
														initialFocus
													/>
												</PopoverContent>
											</Popover>
											<FormDescription className="text-xs text-muted-foreground">
												When this flyer becomes active and visible to customers
											</FormDescription>
											<div className="min-h-[1.25rem]">
												<FormMessage />
											</div>
										</FormItem>
									)}
								/>

								{/* End Date */}
								<FormField
									control={form.control}
									name="endDate"
									render={({ field }) => (
										<FormItem className="space-y-2">
											<FormLabel className="text-sm font-medium text-text-primary">End Date *</FormLabel>
											<Popover>
												<PopoverTrigger asChild>
													<FormControl>
														<Button
															variant="outline"
															className={cn(
																"h-10 w-full pl-3 text-left font-normal",
																!field.value && "text-muted-foreground",
															)}
														>
															{field.value ? format(field.value, "PPP") : <span>Pick an end date</span>}
															<Icon icon="solar:calendar-bold" className="ml-auto h-4 w-4 opacity-50" />
														</Button>
													</FormControl>
												</PopoverTrigger>
												<PopoverContent className="w-auto p-0" align="start">
													<Calendar
														mode="single"
														selected={field.value}
														onSelect={field.onChange}
														disabled={(date) => {
															const startDate = form.getValues("startDate");
															return startDate ? date <= startDate : date < new Date(new Date().setHours(0, 0, 0, 0));
														}}
														initialFocus
													/>
												</PopoverContent>
											</Popover>
											<FormDescription className="text-xs text-muted-foreground">
												When this flyer expires and is no longer visible
											</FormDescription>
											<div className="min-h-[1.25rem]">
												<FormMessage />
											</div>
										</FormItem>
									)}
								/>
							</div>
						</div>

						{/* Status Section */}
						<div className="space-y-6">
							<div className="border-b pb-2">
								<h3 className="text-lg font-semibold text-text-primary">Status</h3>
								<p className="text-sm text-text-secondary">Control flyer visibility</p>
							</div>

							<FormField
								control={form.control}
								name="status"
								render={({ field }) => (
									<FormItem className="space-y-2 max-w-sm">
										<FormLabel className="text-sm font-medium text-text-primary">Flyer Status *</FormLabel>
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
											Inactive flyers are hidden regardless of date range
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
							{editMode ? "Update Flyer" : "Create Flyer"}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
