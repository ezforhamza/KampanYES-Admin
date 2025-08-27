import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Button } from "@/ui/button";
import { Icon } from "@/components/icon";
import { createStoreSchema, type CreateStoreFormData } from "../schemas/store-schema";
import { DEFAULT_OPENING_HOURS } from "../constants";
import { BasicStatus } from "@/types/enum";
import { LocationPicker } from "./location-picker";
import type { Store } from "@/types/store";
import type { Category } from "@/types/category";
import { useEffect, useState } from "react";
import { TimePicker, Switch } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useCategoriesSelect } from "@/hooks/useCategoriesSelect";
import { useImageUpload } from "@/hooks/useImageUpload";
import { getImageUrl } from "@/utils/image";
import { toast } from "sonner";

// Helper functions for time parsing
const parseTimeRange = (
	timeStr: string | { isOpen: boolean; open: string; close: string },
): [Dayjs | null, Dayjs | null] | null => {
	// Handle object format from backend data
	if (typeof timeStr === "object" && timeStr !== null) {
		if (!timeStr.isOpen) return null;
		const startTime = dayjs(timeStr.open, "HH:mm");
		const endTime = dayjs(timeStr.close, "HH:mm");
		return startTime.isValid() && endTime.isValid() ? [startTime, endTime] : null;
	}

	// Handle string format
	if (!timeStr || (typeof timeStr === "string" && timeStr.toLowerCase() === "closed")) return null;

	const parts = timeStr.split("-");
	if (parts.length !== 2) return null;

	const startTime = dayjs(parts[0].trim(), "HH:mm");
	const endTime = dayjs(parts[1].trim(), "HH:mm");

	return startTime.isValid() && endTime.isValid() ? [startTime, endTime] : null;
};

const formatTimeRange = (times: [Dayjs | null, Dayjs | null] | null): string => {
	if (!times || !times[0] || !times[1]) return "Closed";
	return `${times[0].format("HH:mm")}-${times[1].format("HH:mm")}`;
};

interface CreateStoreFormProps {
	onSubmit: (data: CreateStoreFormData) => void;
	onCancel: () => void;
	isLoading?: boolean;
	editMode?: boolean;
	initialStore?: Store;
}

export function CreateStoreForm({
	onSubmit,
	onCancel,
	isLoading,
	editMode = false,
	initialStore,
}: CreateStoreFormProps) {
	const { categories, isLoading: categoriesLoading } = useCategoriesSelect();
	const getDefaultValues = () => {
		if (editMode && initialStore) {
			// Convert availability array to opening hours format
			const convertAvailabilityToHours = (day: string) => {
				if (!initialStore.availability) return { isOpen: false, open: "09:00", close: "17:00" };

				const dayAvailability = initialStore.availability.find((a) => a.day.toLowerCase() === day.toLowerCase());
				if (!dayAvailability || dayAvailability.status === "closed") {
					return { isOpen: false, open: "09:00", close: "17:00" };
				}

				return {
					isOpen: true,
					open: dayAvailability.openingTime || "09:00",
					close: dayAvailability.closingTime || "17:00",
				};
			};

			return {
				name: initialStore.name || "",
				categoryId: initialStore.category?._id || initialStore.category || "",
				logo: initialStore.image || undefined,
				description: initialStore.description || "",
				website: initialStore.website || "",
				address: initialStore.location?.address || "",
				latitude: initialStore.location?.coordinates ? initialStore.location.coordinates[1] : undefined,
				longitude: initialStore.location?.coordinates ? initialStore.location.coordinates[0] : undefined,
				mondayHours: convertAvailabilityToHours("monday"),
				tuesdayHours: convertAvailabilityToHours("tuesday"),
				wednesdayHours: convertAvailabilityToHours("wednesday"),
				thursdayHours: convertAvailabilityToHours("thursday"),
				fridayHours: convertAvailabilityToHours("friday"),
				saturdayHours: convertAvailabilityToHours("saturday"),
				sundayHours: convertAvailabilityToHours("sunday"),
				status:
					initialStore.status === "active" ? "active" : initialStore.status === "inactive" ? "inactive" : "active",
			};
		}

		return {
			name: "",
			categoryId: "",
			logo: undefined,
			description: "",
			website: "",
			address: "",
			latitude: undefined,
			longitude: undefined,
			mondayHours: DEFAULT_OPENING_HOURS.monday,
			tuesdayHours: DEFAULT_OPENING_HOURS.tuesday,
			wednesdayHours: DEFAULT_OPENING_HOURS.wednesday,
			thursdayHours: DEFAULT_OPENING_HOURS.thursday,
			fridayHours: DEFAULT_OPENING_HOURS.friday,
			saturdayHours: DEFAULT_OPENING_HOURS.saturday,
			sundayHours: DEFAULT_OPENING_HOURS.sunday,
			// Status not needed for create mode - defaults to active
		};
	};

	const form = useForm({
		resolver: zodResolver(createStoreSchema),
		defaultValues: getDefaultValues(),
	});

	// Image upload hook (only used during form submission)
	const { uploadImage, isUploading } = useImageUpload({
		showToast: false, // We'll handle toast in the form submission
	});

	// Reset form when store changes (for edit mode)
	useEffect(() => {
		if (editMode && initialStore) {
			form.reset(getDefaultValues());
		}
	}, [editMode, initialStore, form]);

	const handleSubmit = async (data: any) => {
		// Include location details from the location picker
		const locationDetails = (form as any).locationDetails || {
			city: "",
			postcode: "",
			country: "",
		};

		let formDataWithLocation = {
			...data,
			locationDetails,
		};

		// If there's a new image file to upload, upload it first
		if (data.logo && data.logo instanceof File) {
			const uploadToast = toast.loading("Uploading image...", {
				description: "Please wait while we upload your store logo.",
			});

			try {
				const uploadResponse = await uploadImage(data.logo);
				// Use the uploaded filename in the form data
				formDataWithLocation.logo = uploadResponse.image;

				toast.success("Image uploaded successfully!", {
					description: "Now updating store information...",
					id: uploadToast,
				});
			} catch (error) {
				console.error("Failed to upload image:", error);
				toast.error("Failed to upload image", {
					description: "Please try again or contact support if the problem persists.",
					id: uploadToast,
				});
				return;
			}
		}

		onSubmit(formDataWithLocation as CreateStoreFormData);
	};

	// Remove the immediate upload handler - we'll upload during form submission

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
				{/* Form Content */}
				<div className="space-y-8">
					<div className="space-y-6">
						{/* Logo Upload */}
						<FormField
							control={form.control}
							name="logo"
							render={({ field }) => (
								<FormItem className="space-y-2">
									<FormLabel className="text-sm font-medium text-text-primary">Store Logo</FormLabel>
									<FormControl>
										<div className="flex items-start gap-6">
											<div className="flex-shrink-0">
												<div className="flex flex-col items-center space-y-2">
													<div className="relative">
														<div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
															{field.value ? (
																field.value instanceof File ? (
																	<img
																		src={URL.createObjectURL(field.value)}
																		alt="Preview"
																		className="w-full h-full object-cover rounded-full"
																	/>
																) : (
																	<img
																		src={getImageUrl(field.value) || ""}
																		alt="Current logo"
																		className="w-full h-full object-cover rounded-full"
																	/>
																)
															) : (
																<Icon icon="solar:camera-add-bold" size={32} className="text-gray-400" />
															)}
														</div>
														<input
															type="file"
															accept="image/*"
															onChange={(e) => {
																const file = e.target.files?.[0];
																if (file) {
																	field.onChange(file);
																}
															}}
															className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
														/>
													</div>
													<div className="text-xs text-text-secondary text-center">
														PNG, JPG up to 5MB
														<br />
														Recommended: 200x200px
													</div>
												</div>
											</div>
										</div>
									</FormControl>
									<div className="min-h-[1.25rem]">
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Store Name */}
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem className="space-y-2">
										<FormLabel className="text-sm font-medium text-text-primary">Store Name *</FormLabel>
										<FormControl>
											<Input placeholder="e.g., Albert Heijn" className="h-10" {...field} />
										</FormControl>
										<div className="min-h-[1.25rem]">
											<FormMessage />
										</div>
									</FormItem>
								)}
							/>

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
														<SelectItem key={category._id} value={category._id}>
															<div className="flex items-center gap-2">
																{category.image && (
																	<img
																		src={getImageUrl(category.image)}
																		alt={category.title}
																		className="w-4 h-4 rounded object-cover"
																	/>
																)}
																{category.title}
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

						{/* Description */}
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem className="space-y-2">
									<FormLabel className="text-sm font-medium text-text-primary">Description</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Brief description of the store..."
											className="resize-none min-h-[80px]"
											{...field}
										/>
									</FormControl>
									<FormDescription className="text-xs text-muted-foreground">
										Optional description (max 500 characters)
									</FormDescription>
									<div className="min-h-[1.25rem]">
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>

						{/* Website */}
						<FormField
							control={form.control}
							name="website"
							render={({ field }) => (
								<FormItem className="space-y-2">
									<FormLabel className="text-sm font-medium text-text-primary">Website</FormLabel>
									<FormControl>
										<Input placeholder="https://www.store.com" className="h-10" {...field} />
									</FormControl>
									<div className="min-h-[1.25rem]">
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>

						{/* Store Status - Only show in edit mode */}
						{editMode && (
							<FormField
								control={form.control}
								name="status"
								render={({ field }) => (
									<FormItem className="space-y-2">
										<FormLabel className="text-sm font-medium text-text-primary">Store Status *</FormLabel>
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
											Active stores are visible to customers, inactive stores are hidden
										</FormDescription>
										<div className="min-h-[1.25rem]">
											<FormMessage />
										</div>
									</FormItem>
								)}
							/>
						)}
					</div>

					<div className="space-y-6">
						{/* Google Maps Location Picker */}
						<LocationPicker
							onLocationSelect={(location) => {
								form.setValue("address", location.address);
								form.setValue("latitude", location.latitude);
								form.setValue("longitude", location.longitude);
								// Store additional location details in form
								(form as any).locationDetails = {
									city: location.city,
									postcode: location.postcode,
									country: location.country,
								};
							}}
							initialLocation={{
								address: form.getValues("address"),
								latitude: form.getValues("latitude"),
								longitude: form.getValues("longitude"),
							}}
						/>

						{/* Address Field (populated from map) */}
						<FormField
							control={form.control}
							name="address"
							render={({ field }) => (
								<FormItem className="space-y-2">
									<FormLabel className="text-sm font-medium text-text-primary">Selected Address *</FormLabel>
									<FormControl>
										<Input
											placeholder="Address will be populated from map selection"
											className="h-10"
											readOnly
											{...field}
										/>
									</FormControl>
									<FormDescription className="text-xs text-muted-foreground">
										This field is automatically populated when you select a location on the map
									</FormDescription>
									<div className="min-h-[1.25rem]">
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>
					</div>

					<div className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{[
								{ name: "mondayHours" as const, label: "Monday" },
								{ name: "tuesdayHours" as const, label: "Tuesday" },
								{ name: "wednesdayHours" as const, label: "Wednesday" },
								{ name: "thursdayHours" as const, label: "Thursday" },
								{ name: "fridayHours" as const, label: "Friday" },
								{ name: "saturdayHours" as const, label: "Saturday" },
								{ name: "sundayHours" as const, label: "Sunday" },
							].map(({ name, label }) => (
								<FormField
									key={name}
									control={form.control}
									name={name}
									render={({ field }) => {
										const currentValue = parseTimeRange(field.value || "Closed");
										const isClosed = !currentValue;

										return (
											<FormItem className="space-y-2">
												<div className="flex items-center justify-between">
													<FormLabel className="text-sm font-medium text-text-primary">{label} *</FormLabel>
													<Switch
														checked={!isClosed}
														onChange={(checked) => {
															if (checked) {
																field.onChange("09:00-17:00");
															} else {
																field.onChange("Closed");
															}
														}}
														size="small"
													/>
												</div>
												<FormControl>
													{isClosed ? (
														<div className="h-10 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-input rounded-md flex items-center text-text-secondary text-sm">
															Closed
														</div>
													) : (
														<TimePicker.RangePicker
															value={currentValue}
															onChange={(times) => {
																const formattedTime = formatTimeRange(times);
																field.onChange(formattedTime);
															}}
															use12Hours
															format="h:mm A"
															placeholder={["Open", "Close"]}
															className="w-full"
															style={{ height: "40px" }}
														/>
													)}
												</FormControl>
												<div className="min-h-[1.25rem]">
													<FormMessage />
												</div>
											</FormItem>
										);
									}}
								/>
							))}
						</div>
						{/* Simple help text */}
						<div className="text-xs text-text-secondary">
							Toggle the switch to open/close each day, then select times in 12-hour format.
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="flex items-center justify-end gap-2 pt-6 border-t">
					<Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} className="min-w-[100px]">
						Cancel
					</Button>
					<Button type="submit" disabled={isLoading} className="min-w-[120px]">
						{isLoading && <Icon icon="solar:refresh-bold" className="mr-2 h-4 w-4 animate-spin" />}
						{editMode ? "Update Store" : "Create Store"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
