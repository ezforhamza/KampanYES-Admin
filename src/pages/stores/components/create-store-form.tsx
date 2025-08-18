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
import { UploadAvatar } from "@/components/upload/upload-avatar";

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
	const [categories, setCategories] = useState<Category[]>([]);
	const [categoriesLoading, setCategoriesLoading] = useState(true);
	const getDefaultValues = () => {
		if (editMode && initialStore) {
			return {
				name: initialStore.name,
				categoryId: initialStore.categoryId,
				logo: initialStore.logo,
				description: initialStore.description || "",
				website: initialStore.website || "",
				address: initialStore.location.address,
				latitude: initialStore.location.coordinates?.lat,
				longitude: initialStore.location.coordinates?.lng,
				mondayHours: initialStore.openingHours.monday,
				tuesdayHours: initialStore.openingHours.tuesday,
				wednesdayHours: initialStore.openingHours.wednesday,
				thursdayHours: initialStore.openingHours.thursday,
				fridayHours: initialStore.openingHours.friday,
				saturdayHours: initialStore.openingHours.saturday,
				sundayHours: initialStore.openingHours.sunday,
				status: initialStore.status,
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
			status: BasicStatus.ENABLE,
		};
	};

	const form = useForm({
		resolver: zodResolver(createStoreSchema),
		defaultValues: getDefaultValues(),
	});

	// Fetch categories
	useEffect(() => {
		const fetchCategories = async () => {
			try {
				setCategoriesLoading(true);
				const response = await fetch("/api/categories");
				const data = await response.json();
				if (data.status === 0) {
					setCategories(data.data.list.filter((cat: Category) => cat.status === BasicStatus.ENABLE));
				}
			} catch (error) {
				console.error("Error fetching categories:", error);
			} finally {
				setCategoriesLoading(false);
			}
		};

		fetchCategories();
	}, []);

	// Reset form when store changes (for edit mode)
	useEffect(() => {
		if (editMode && initialStore) {
			form.reset(getDefaultValues());
		}
	}, [editMode, initialStore, form]);

	const handleSubmit = (data: any) => {
		// Include location details from the location picker
		const locationDetails = (form as any).locationDetails || {
			city: "",
			postcode: "",
			country: "",
		};

		const formDataWithLocation = {
			...data,
			locationDetails,
		};

		onSubmit(formDataWithLocation as CreateStoreFormData);
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
				{/* Form Content */}
				<div className="space-y-8">
					{/* Basic Information Section */}
					<div className="space-y-6">
						<div className="border-b pb-2">
							<h3 className="text-lg font-semibold text-text-primary">Basic Information</h3>
							<p className="text-sm text-text-secondary">Essential details about your store</p>
						</div>

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
												<UploadAvatar
													defaultAvatar={
														field.value
															? typeof field.value === "string"
																? field.value
																: URL.createObjectURL(field.value)
															: ""
													}
													onChange={(info) => {
														if (info.file.status === "done" || info.file.status === "error") {
															if (info.file.originFileObj) {
																field.onChange(info.file.originFileObj);
															}
														}
													}}
													helperText={
														<div className="text-xs text-text-secondary">
															PNG, JPG up to 5MB
															<br />
															Recommended: 200x200px
														</div>
													}
												/>
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
														<SelectItem key={category.id} value={category.id}>
															{category.name}
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

						{/* Store Status */}
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
					</div>

					{/* Location Section */}
					<div className="space-y-6">
						<div className="border-b pb-2">
							<h3 className="text-lg font-semibold text-text-primary">Location Information</h3>
							<p className="text-sm text-text-secondary">Select store location on the map</p>
						</div>

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

					{/* Opening Hours */}
					<div className="space-y-6">
						<div className="border-b pb-2">
							<h3 className="text-lg font-semibold text-text-primary">Opening Hours</h3>
							<p className="text-sm text-text-secondary">Set operating hours for each day</p>
							<p className="text-xs text-gray-500 mt-1">
								Format: <span className="font-mono">09:00-18:00</span> or <span className="font-mono">Closed</span>
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
									render={({ field }) => (
										<FormItem className="space-y-2">
											<FormLabel className="text-sm font-medium text-text-primary">{label} *</FormLabel>
											<FormControl>
												<Input placeholder="09:00-18:00 or Closed" className="h-10" {...field} />
											</FormControl>
											<div className="min-h-[1.25rem]">
												<FormMessage />
											</div>
										</FormItem>
									)}
								/>
							))}
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
