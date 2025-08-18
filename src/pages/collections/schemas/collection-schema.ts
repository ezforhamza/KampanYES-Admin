import { z } from "zod";
import { BasicStatus } from "@/types/enum";

/**
 * Collection Creation Form Validation Schema
 */
export const createCollectionSchema = z.object({
	// Basic Information
	name: z
		.string()
		.min(2, "Collection name must be at least 2 characters")
		.max(100, "Collection name must not exceed 100 characters"),

	categoryId: z.string().min(1, "Please select a collection category"),

	storeId: z.string().min(1, "Please select a store"),

	// Collection Status
	status: z.nativeEnum(BasicStatus, {
		required_error: "Please select collection status",
	}),
});

export type CreateCollectionFormData = z.infer<typeof createCollectionSchema>;
