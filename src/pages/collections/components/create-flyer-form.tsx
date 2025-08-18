import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Button } from "@/ui/button";
import { Icon } from "@/components/icon";
import { createFlyerSchema, type CreateFlyerFormData } from "../schemas/flyer-schema";
import { BasicStatus } from "@/types/enum";
import type { Flyer } from "@/types/flyer";
import { useEffect, useMemo } from "react";
import { Upload } from "@/components/upload/upload";
import { DatePicker, InputNumber } from "antd";
import dayjs from "dayjs";

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
			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
					<div className="space-y-8">
						<div className="space-y-6">

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

						<div className="space-y-6">
							<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
								{/* Original Price */}
								<div className="lg:col-span-1">
									<FormField
										control={form.control}
										name="price"
										render={({ field }) => (
											<FormItem className="space-y-2">
												<FormLabel className="text-sm font-medium text-text-primary">Original Price (€) *</FormLabel>
												<FormControl>
													<InputNumber
														{...field}
														min={0.01}
														step={0.01}
														precision={2}
														placeholder="0.00"
														className="w-full"
														style={{ height: "40px", width: "100%" }}
														prefix="€"
														formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
														parser={(value) => parseFloat(value!.replace(/€\s?|(,*)/g, '')) || 0}
													/>
												</FormControl>
												<div className="min-h-[1.25rem]">
													<FormMessage />
												</div>
											</FormItem>
										)}
									/>
								</div>

								{/* Discount Percentage */}
								<div className="lg:col-span-1">
									<FormField
										control={form.control}
										name="discountPercentage"
										render={({ field }) => (
											<FormItem className="space-y-2">
												<FormLabel className="text-sm font-medium text-text-primary">Discount (%)</FormLabel>
												<FormControl>
													<InputNumber
														{...field}
														min={0}
														max={100}
														step={1}
														precision={0}
														placeholder="0"
														className="w-full"
														style={{ height: "40px", width: "100%" }}
														suffix="%"
													/>
												</FormControl>
												<div className="min-h-[1.25rem]">
													<FormMessage />
												</div>
											</FormItem>
										)}
									/>
								</div>

								{/* Final Price (Calculated) */}
								<div className="lg:col-span-1">
									<FormItem className="space-y-2">
										<FormLabel className="text-sm font-medium text-text-primary">Final Price (€)</FormLabel>
										<div className="h-10 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-input rounded-md flex items-center">
											<span className="text-lg font-semibold text-green-600">€{finalPrice.toFixed(2)}</span>
										</div>
										<div className="min-h-[1.25rem]">
											{/* Empty space to match FormMessage height */}
										</div>
									</FormItem>
								</div>
							</div>
						</div>

						<div className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Start Date */}
								<FormField
									control={form.control}
									name="startDate"
									render={({ field }) => (
										<FormItem className="space-y-2">
											<FormLabel className="text-sm font-medium text-text-primary">Start Date *</FormLabel>
											<FormControl>
												<DatePicker
													{...field}
													value={field.value ? dayjs(field.value) : null}
													onChange={(date) => field.onChange(date?.toDate())}
													placeholder="Select start date"
													className="w-full"
													style={{ height: "40px" }}
													disabledDate={(current) => current && current < dayjs().startOf('day')}
													suffixIcon={<Icon icon="solar:calendar-bold" size={16} />}
												/>
											</FormControl>
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
											<FormControl>
												<DatePicker
													{...field}
													value={field.value ? dayjs(field.value) : null}
													onChange={(date) => field.onChange(date?.toDate())}
													placeholder="Select end date"
													className="w-full"
													style={{ height: "40px" }}
													disabledDate={(current) => {
														const startDate = form.getValues("startDate");
														return current && (
															startDate 
																? current <= dayjs(startDate)
																: current < dayjs().startOf('day')
														);
													}}
													suffixIcon={<Icon icon="solar:calendar-bold" size={16} />}
												/>
											</FormControl>
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

						<div className="space-y-6">
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
