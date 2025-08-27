import { z } from "zod";
import { BasicStatus } from "@/types/enum";

/**
 * Opening hours validation - now supports both string and object formats
 */
const openingHoursValidation = z.union([
	// String format: "09:00-18:00" or "Closed"
	z
		.string()
		.min(1, "Opening hours required")
		.refine(
			(val) => {
				const trimmed = val.trim();

				// Check if it's "Closed" (case insensitive)
				if (trimmed.toLowerCase() === "closed") {
					return true;
				}

				// Check time range pattern: HH:MM-HH:MM
				const timeRangePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]-([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
				if (!timeRangePattern.test(trimmed)) {
					return false;
				}

				// Validate that start time is before end time
				const [startTime, endTime] = trimmed.split("-");
				const [startHour, startMin] = startTime.split(":").map(Number);
				const [endHour, endMin] = endTime.split(":").map(Number);

				const startMinutes = startHour * 60 + startMin;
				const endMinutes = endHour * 60 + endMin;

				return startMinutes < endMinutes;
			},
			{
				message: "Enter 'Closed' or time range (e.g., '09:00-18:00'). Start time must be before end time.",
			},
		),
	// Object format: { isOpen: boolean, open: string, close: string }
	z.object({
		isOpen: z.boolean(),
		open: z.string(),
		close: z.string(),
	}),
]);

/**
 * Store Creation Form Validation Schema
 */
export const createStoreSchema = z.object({
	// Basic Information
	name: z
		.string()
		.min(2, "Store name must be at least 2 characters")
		.max(100, "Store name must not exceed 100 characters"),

	categoryId: z.string().min(1, "Please select a store category"),

	logo: z.union([z.instanceof(File), z.string()]).optional(),

	description: z.string().max(500, "Description must not exceed 500 characters").optional(),

	website: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),

	// Location Information (address will be populated from map selection)
	address: z
		.string()
		.min(5, "Address must be at least 5 characters")
		.max(200, "Address must not exceed 200 characters"),

	// Coordinates from map selection
	latitude: z.number().min(-90).max(90).optional(),
	longitude: z.number().min(-180).max(180).optional(),

	// Opening Hours
	mondayHours: openingHoursValidation,
	tuesdayHours: openingHoursValidation,
	wednesdayHours: openingHoursValidation,
	thursdayHours: openingHoursValidation,
	fridayHours: openingHoursValidation,
	saturdayHours: openingHoursValidation,
	sundayHours: openingHoursValidation,

	// Store Status - support both enum and string format (optional for create mode)
	status: z.union([z.nativeEnum(BasicStatus), z.enum(["active", "inactive"])]).optional(),
});

export type CreateStoreFormData = z.infer<typeof createStoreSchema>;
