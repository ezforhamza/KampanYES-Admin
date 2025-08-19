import { z } from "zod";
import { BasicStatus } from "@/types/enum";

/**
 * Collection Creation Form Validation Schema
 * Note: storeId will be provided by context, not user input
 */
export const createCollectionSchema = z.object({
	// Basic Information
	name: z
		.string()
		.min(2, "Collection name must be at least 2 characters")
		.max(100, "Collection name must not exceed 100 characters"),

	// Collection Status
	status: z.nativeEnum(BasicStatus, {
		required_error: "Please select collection status",
	}),
});

/**
 * Schema for creating collection with store context
 */
export const createCollectionWithStoreSchema = z.object({
	// Basic Information
	name: z
		.string()
		.min(2, "Collection name must be at least 2 characters")
		.max(100, "Collection name must not exceed 100 characters"),

	storeId: z.string().min(1, "Store ID is required"),

	// Collection Status
	status: z.nativeEnum(BasicStatus, {
		required_error: "Please select collection status",
	}),
});

export type CreateCollectionFormData = z.infer<typeof createCollectionSchema>;
export type CreateCollectionWithStoreFormData = z.infer<typeof createCollectionWithStoreSchema>;
