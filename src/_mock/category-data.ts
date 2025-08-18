import type { Category } from "@/types/category";
import { BasicStatus } from "@/types/enum";

/**
 * Mock Categories Data for KampanYES admin panel
 * These categories are used to organize stores and collections
 */
export const MOCK_CATEGORIES: Category[] = [
	{
		id: "cat-1",
		name: "Supermarkets",
		image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
		status: BasicStatus.ENABLE,
		createdAt: new Date("2024-01-01T00:00:00Z"),
		updatedAt: new Date("2024-08-10T12:00:00Z"),
		storesCount: 2, // Albert Heijn + REWE
	},
	{
		id: "cat-2",
		name: "Electronics",
		image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop",
		status: BasicStatus.ENABLE,
		createdAt: new Date("2024-01-01T00:00:00Z"),
		updatedAt: new Date("2024-08-10T12:00:00Z"),
		storesCount: 1, // MediaMarkt
	},
	{
		id: "cat-3",
		name: "Fashion",
		image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
		status: BasicStatus.ENABLE,
		createdAt: new Date("2024-01-01T00:00:00Z"),
		updatedAt: new Date("2024-08-10T12:00:00Z"),
		storesCount: 1, // H&M
	},
	{
		id: "cat-4",
		name: "Garden & DIY",
		image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
		status: BasicStatus.ENABLE,
		createdAt: new Date("2024-01-01T00:00:00Z"),
		updatedAt: new Date("2024-08-10T12:00:00Z"),
		storesCount: 0, // No stores yet
	},
	{
		id: "cat-5",
		name: "Home & Interior",
		image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
		status: BasicStatus.ENABLE,
		createdAt: new Date("2024-01-01T00:00:00Z"),
		updatedAt: new Date("2024-08-10T12:00:00Z"),
		storesCount: 0, // No stores yet
	},
	{
		id: "cat-6",
		name: "Catering",
		image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
		status: BasicStatus.ENABLE,
		createdAt: new Date("2024-01-01T00:00:00Z"),
		updatedAt: new Date("2024-08-10T12:00:00Z"),
		storesCount: 0, // No stores yet
	},
	{
		id: "cat-7",
		name: "Beauty",
		image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=300&fit=crop",
		status: BasicStatus.ENABLE,
		createdAt: new Date("2024-01-01T00:00:00Z"),
		updatedAt: new Date("2024-08-10T12:00:00Z"),
		storesCount: 1, // Etos
	},
	{
		id: "cat-8",
		name: "Sports & Recreation",
		image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
		status: BasicStatus.DISABLE,
		createdAt: new Date("2024-02-15T00:00:00Z"),
		updatedAt: new Date("2024-08-05T15:30:00Z"),
		storesCount: 0, // No stores yet
	},
];
