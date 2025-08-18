import { z } from "zod";
import { BasicStatus } from "@/types/enum";

/**
 * Flyer Creation Form Validation Schema
 */
export const createFlyerSchema = z
	.object({
		// Basic Information
		name: z
			.string()
			.min(2, "Flyer name must be at least 2 characters")
			.max(100, "Flyer name must not exceed 100 characters"),

		image: z.union([z.instanceof(File), z.string()]).refine((file) => {
			if (typeof file === "string") return file.length > 0;
			return file instanceof File;
		}, "Please upload an image for the flyer"),

		// Pricing Information
		price: z.number().min(0.01, "Price must be greater than 0").max(999999.99, "Price is too high"),

		discountPercentage: z.number().min(0, "Discount cannot be negative").max(100, "Discount cannot exceed 100%"),

		// Date Range
		startDate: z.date({
			required_error: "Start date is required",
		}),

		endDate: z.date({
			required_error: "End date is required",
		}),

		// Collection and Store IDs (will be set automatically)
		collectionId: z.string().min(1, "Collection ID is required"),
		storeId: z.string().min(1, "Store ID is required"),

		// Flyer Status
		status: z.nativeEnum(BasicStatus, {
			required_error: "Please select flyer status",
		}),
	})
	.refine(
		(data) => {
			// Ensure end date is after start date
			return data.endDate > data.startDate;
		},
		{
			message: "End date must be after start date",
			path: ["endDate"],
		},
	);

export type CreateFlyerFormData = z.infer<typeof createFlyerSchema>;
