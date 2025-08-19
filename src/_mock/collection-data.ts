import type { Collection } from "@/types/collection";
import type { Flyer } from "@/types/flyer";
import { BasicStatus } from "@/types/enum";

// Mock Collections Data
export const MOCK_COLLECTIONS: Collection[] = [
	{
		id: "coll-1",
		name: "Weekly Fresh Deals",
		storeId: "1", // Albert Heijn
		thumbnailFlyerId: "flyer-1",
		flyersCount: 5,
		status: BasicStatus.ENABLE,
		createdAt: new Date("2024-08-10T09:00:00Z"),
		updatedAt: new Date("2024-08-13T14:30:00Z"),
	},
	{
		id: "coll-2",
		name: "Tech Sale Extravaganza",
		storeId: "2", // MediaMarkt
		thumbnailFlyerId: "flyer-6",
		flyersCount: 3,
		status: BasicStatus.ENABLE,
		createdAt: new Date("2024-08-08T10:15:00Z"),
		updatedAt: new Date("2024-08-12T16:45:00Z"),
	},
	{
		id: "coll-3",
		name: "Summer Fashion Collection",
		storeId: "3", // H&M
		thumbnailFlyerId: "flyer-9",
		flyersCount: 2,
		status: BasicStatus.ENABLE,
		createdAt: new Date("2024-08-05T11:20:00Z"),
		updatedAt: new Date("2024-08-11T09:15:00Z"),
	},
	{
		id: "coll-4",
		name: "Garden & DIY Essentials",
		storeId: "4", // REWE
		thumbnailFlyerId: "flyer-11",
		flyersCount: 2,
		status: BasicStatus.ENABLE,
		createdAt: new Date("2024-08-07T08:45:00Z"),
		updatedAt: new Date("2024-08-14T13:20:00Z"),
	},
	{
		id: "coll-5",
		name: "Beauty & Wellness",
		storeId: "5", // Etos
		thumbnailFlyerId: "flyer-13",
		flyersCount: 2,
		status: BasicStatus.ENABLE,
		createdAt: new Date("2024-08-06T15:30:00Z"),
		updatedAt: new Date("2024-08-13T11:40:00Z"),
	},
];

// Mock Flyers Data
export const MOCK_FLYERS: Flyer[] = [
	// Albert Heijn - Weekly Fresh Deals Collection
	{
		id: "flyer-1",
		name: "Fresh Organic Vegetables",
		image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop",
		price: 15.99,
		discountPercentage: 25,
		finalPrice: 11.99,
		collectionId: "coll-1",
		storeId: "1",
		startDate: new Date("2024-08-10T00:00:00Z"),
		endDate: new Date("2024-08-24T23:59:59Z"),
		status: BasicStatus.ENABLE,
		createdAt: new Date("2024-08-10T09:00:00Z"),
		updatedAt: new Date("2024-08-13T14:30:00Z"),
	},
	{
		id: "flyer-2",
		name: "Premium Meat Selection",
		image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop",
		price: 24.99,
		discountPercentage: 20,
		finalPrice: 19.99,
		collectionId: "coll-1",
		storeId: "1",
		startDate: new Date("2024-08-12T00:00:00Z"),
		endDate: new Date("2024-08-26T23:59:59Z"),
		status: BasicStatus.ENABLE,
		createdAt: new Date("2024-08-10T09:15:00Z"),
		updatedAt: new Date("2024-08-13T14:30:00Z"),
	},
	{
		id: "flyer-3",
		name: "Dairy & Breakfast Bundle",
		image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop",
		price: 12.5,
		discountPercentage: 15,
		finalPrice: 10.63,
		collectionId: "coll-1",
		storeId: "1",
		startDate: new Date("2024-08-08T00:00:00Z"),
		endDate: new Date("2024-08-22T23:59:59Z"),
		status: BasicStatus.ENABLE,
		createdAt: new Date("2024-08-10T09:30:00Z"),
		updatedAt: new Date("2024-08-13T14:30:00Z"),
	},
	{
		id: "flyer-4",
		name: "Artisan Bread Collection",
		image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop",
		price: 8.99,
		discountPercentage: 30,
		finalPrice: 6.29,
		collectionId: "coll-1",
		storeId: "1",
		startDate: new Date("2024-08-15T00:00:00Z"),
		endDate: new Date("2024-08-29T23:59:59Z"),
		status: BasicStatus.ENABLE,
		createdAt: new Date("2024-08-10T09:45:00Z"),
		updatedAt: new Date("2024-08-13T14:30:00Z"),
	},
	{
		id: "flyer-5",
		name: "Seasonal Fruit Box",
		image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=300&fit=crop",
		price: 18.75,
		discountPercentage: 22,
		finalPrice: 14.63,
		collectionId: "coll-1",
		storeId: "1",
		startDate: new Date("2024-08-05T00:00:00Z"),
		endDate: new Date("2024-08-19T23:59:59Z"),
		status: BasicStatus.ENABLE,
		createdAt: new Date("2024-08-10T10:00:00Z"),
		updatedAt: new Date("2024-08-13T14:30:00Z"),
	},

	// MediaMarkt - Tech Sale Extravaganza Collection
	{
		id: "flyer-6",
		name: "Latest Smartphones",
		image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop",
		price: 899.99,
		discountPercentage: 15,
		finalPrice: 764.99,
		collectionId: "coll-2",
		storeId: "2",
		startDate: new Date("2024-08-14T00:00:00Z"),
		endDate: new Date("2024-08-28T23:59:59Z"),
		status: BasicStatus.ENABLE,
		createdAt: new Date("2024-08-08T10:15:00Z"),
		updatedAt: new Date("2024-08-12T16:45:00Z"),
	},
	{
		id: "flyer-7",
		name: "Gaming Laptops",
		image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=300&fit=crop",
		price: 1299.99,
		discountPercentage: 20,
		finalPrice: 1039.99,
		collectionId: "coll-2",
		storeId: "2",
		startDate: new Date("2024-08-16T00:00:00Z"),
		endDate: new Date("2024-08-30T23:59:59Z"),
		status: BasicStatus.ENABLE,
		createdAt: new Date("2024-08-08T10:30:00Z"),
		updatedAt: new Date("2024-08-12T16:45:00Z"),
	},
	{
		id: "flyer-8",
		name: "Smart Home Devices",
		image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop",
		price: 249.99,
		discountPercentage: 25,
		finalPrice: 187.49,
		collectionId: "coll-2",
		storeId: "2",
		startDate: new Date("2024-08-12T00:00:00Z"),
		endDate: new Date("2024-08-26T23:59:59Z"),
		status: BasicStatus.ENABLE,
		createdAt: new Date("2024-08-08T10:45:00Z"),
		updatedAt: new Date("2024-08-12T16:45:00Z"),
	},

	// H&M - Summer Fashion Collection
	{
		id: "flyer-9",
		name: "Summer Dresses",
		image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=300&fit=crop",
		price: 49.99,
		discountPercentage: 30,
		finalPrice: 34.99,
		collectionId: "coll-3",
		storeId: "3",
		startDate: new Date("2024-08-13T00:00:00Z"),
		endDate: new Date("2024-08-27T23:59:59Z"),
		status: BasicStatus.ENABLE,
		createdAt: new Date("2024-08-05T11:20:00Z"),
		updatedAt: new Date("2024-08-11T09:15:00Z"),
	},
	{
		id: "flyer-10",
		name: "Casual T-Shirts",
		image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop",
		price: 19.99,
		discountPercentage: 25,
		finalPrice: 14.99,
		collectionId: "coll-3",
		storeId: "3",
		startDate: new Date("2024-08-11T00:00:00Z"),
		endDate: new Date("2024-08-25T23:59:59Z"),
		status: BasicStatus.ENABLE,
		createdAt: new Date("2024-08-05T11:35:00Z"),
		updatedAt: new Date("2024-08-11T09:15:00Z"),
	},

	// Gamma - Garden & DIY Essentials
	{
		id: "flyer-11",
		name: "Power Tools Set",
		image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=300&fit=crop",
		price: 199.99,
		discountPercentage: 18,
		finalPrice: 163.99,
		collectionId: "coll-4",
		storeId: "4",
		startDate: new Date("2024-08-09T00:00:00Z"),
		endDate: new Date("2024-08-23T23:59:59Z"),
		status: BasicStatus.ENABLE,
		createdAt: new Date("2024-08-07T08:45:00Z"),
		updatedAt: new Date("2024-08-14T13:20:00Z"),
	},
	{
		id: "flyer-12",
		name: "Garden Plants & Seeds",
		image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
		price: 35.5,
		discountPercentage: 20,
		finalPrice: 28.4,
		collectionId: "coll-4",
		storeId: "4",
		startDate: new Date("2024-08-07T00:00:00Z"),
		endDate: new Date("2024-08-21T23:59:59Z"),
		status: BasicStatus.ENABLE,
		createdAt: new Date("2024-08-07T09:00:00Z"),
		updatedAt: new Date("2024-08-14T13:20:00Z"),
	},

	// Etos - Beauty & Wellness
	{
		id: "flyer-13",
		name: "Skincare Essentials",
		image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=300&fit=crop",
		price: 89.99,
		discountPercentage: 35,
		finalPrice: 58.49,
		collectionId: "coll-5",
		storeId: "5",
		startDate: new Date("2024-08-06T00:00:00Z"),
		endDate: new Date("2024-08-20T23:59:59Z"),
		status: BasicStatus.ENABLE,
		createdAt: new Date("2024-08-06T15:30:00Z"),
		updatedAt: new Date("2024-08-13T11:40:00Z"),
	},
	{
		id: "flyer-14",
		name: "Makeup Palette Set",
		image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=300&fit=crop",
		price: 65.0,
		discountPercentage: 28,
		finalPrice: 46.8,
		collectionId: "coll-5",
		storeId: "5",
		startDate: new Date("2024-08-10T00:00:00Z"),
		endDate: new Date("2024-08-24T23:59:59Z"),
		status: BasicStatus.ENABLE,
		createdAt: new Date("2024-08-06T15:45:00Z"),
		updatedAt: new Date("2024-08-13T11:40:00Z"),
	},
];

// Helper function to check if flyer is currently active
export const isFlyerActive = (flyer: Flyer, checkDate: Date = new Date()): boolean => {
	return checkDate >= flyer.startDate && checkDate <= flyer.endDate && flyer.status === BasicStatus.ENABLE;
};

// Helper function to get active flyers only
export const getActiveFlyers = (collectionId?: string, checkDate: Date = new Date()): Flyer[] => {
	let flyers = MOCK_FLYERS;

	if (collectionId) {
		flyers = flyers.filter((f) => f.collectionId === collectionId);
	}

	return flyers.filter((f) => isFlyerActive(f, checkDate));
};
