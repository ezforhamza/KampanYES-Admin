import { http, HttpResponse } from "msw";
import { faker } from "@faker-js/faker";
import { MOCK_COLLECTIONS, getActiveFlyers, isFlyerActive } from "../collection-data";
import { MOCK_STORES } from "../store-data";
import { getPaginationParams, paginateArray } from "../utils";
import {
	getSharedFlyers,
	addSharedFlyer,
	updateSharedFlyer,
	removeSharedFlyer,
	removeSharedFlyersByCollection,
} from "../shared-data";
import type { Collection } from "@/types/collection";
import type { Flyer } from "@/types/flyer";
import { BasicStatus } from "@/types/enum";
import { generateNewCollectionNotification, generateDiscountNotification } from "./_notification";

// Collection and Flyer API endpoints
export const CollectionApi = {
	LIST: "/api/collections",
	CREATE: "/api/collections",
	UPDATE: "/api/collections/:id",
	DELETE: "/api/collections/:id",
	GET_BY_ID: "/api/collections/:id",
	GET_FLYERS: "/api/collections/:id/flyers",
	CREATE_FLYER: "/api/collections/:id/flyers",
	UPDATE_FLYER: "/api/collections/:collectionId/flyers/:flyerId",
	DELETE_FLYER: "/api/collections/:collectionId/flyers/:flyerId",
};

// In-memory storage for new collections
let mockCollections: Collection[] = [...MOCK_COLLECTIONS];

// Helper function to get store name by ID
const getStoreName = (storeId: string): string => {
	const store = MOCK_STORES.find((s) => s.id === storeId);
	return store ? store.name : "Unknown Store";
};

// Get all collections with store information and pagination
export const getCollections = http.get(CollectionApi.LIST, ({ request }) => {
	const url = new URL(request.url);
	const search = url.searchParams.get("search")?.toLowerCase();
	const storeId = url.searchParams.get("storeId");
	const activeOnly = url.searchParams.get("activeOnly") === "true";

	// Get pagination parameters
	const paginationParams = getPaginationParams(request);

	let filteredCollections = [...mockCollections];

	// Apply filters
	if (search) {
		filteredCollections = filteredCollections.filter((collection) => collection.name.toLowerCase().includes(search));
	}

	if (storeId) {
		filteredCollections = filteredCollections.filter((collection) => collection.storeId === storeId);
	}

	// For activeOnly, we filter collections that have at least one active flyer
	if (activeOnly) {
		filteredCollections = filteredCollections.filter((collection) => {
			const activeFlyers = getActiveFlyers(collection.id);
			return activeFlyers.length > 0;
		});
	}

	// Sort by creation date (newest first)
	const sortedCollections = filteredCollections.sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	);

	// Add store information and flyer counts
	const enrichedCollections = sortedCollections.map((collection) => {
		return {
			...collection,
			storeName: getStoreName(collection.storeId),
			activeFlyers: getActiveFlyers(collection.id).length,
		};
	});

	// Apply pagination
	const paginatedData = paginateArray(enrichedCollections, paginationParams);

	return HttpResponse.json({
		status: 0,
		message: "Success",
		data: paginatedData,
	});
});

// Create a new collection
export const createCollection = http.post(CollectionApi.CREATE, async ({ request }) => {
	const collectionData = (await request.json()) as Omit<Collection, "id" | "createdAt" | "updatedAt" | "flyersCount">;

	const newCollection: Collection = {
		...collectionData,
		id: faker.string.uuid(),
		flyersCount: 0,
		status: BasicStatus.ENABLE,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	mockCollections.unshift(newCollection);

	// Auto-generate new collection notification
	try {
		const storeName = getStoreName(newCollection.storeId);
		generateNewCollectionNotification(newCollection.name, storeName, newCollection.storeId);
	} catch (error) {
		console.error("Failed to generate new collection notification:", error);
		// Continue with collection creation even if notification fails
	}

	return HttpResponse.json({
		status: 0,
		message: "Collection created successfully",
		data: {
			...newCollection,
			storeName: getStoreName(newCollection.storeId),
			activeFlyers: 0,
		},
	});
});

// Update collection
export const updateCollection = http.put(CollectionApi.UPDATE, async ({ request, params }) => {
	const id = params.id as string;
	const updateData = (await request.json()) as Partial<Collection>;

	const collectionIndex = mockCollections.findIndex((collection) => collection.id === id);

	if (collectionIndex === -1) {
		return HttpResponse.json(
			{
				status: 1,
				message: "Collection not found",
			},
			{ status: 404 },
		);
	}

	mockCollections[collectionIndex] = {
		...mockCollections[collectionIndex],
		...updateData,
		updatedAt: new Date(),
	};

	return HttpResponse.json({
		status: 0,
		message: "Collection updated successfully",
		data: {
			...mockCollections[collectionIndex],
			storeName: getStoreName(mockCollections[collectionIndex].storeId),
			activeFlyers: getActiveFlyers(mockCollections[collectionIndex].id).length,
		},
	});
});

// Delete collection
export const deleteCollection = http.delete(CollectionApi.DELETE, ({ params }) => {
	const id = params.id as string;

	const collectionIndex = mockCollections.findIndex((collection) => collection.id === id);

	if (collectionIndex === -1) {
		return HttpResponse.json(
			{
				status: 1,
				message: "Collection not found",
			},
			{ status: 404 },
		);
	}

	// Remove all flyers in this collection
	removeSharedFlyersByCollection(id);

	// Remove the collection
	mockCollections.splice(collectionIndex, 1);

	return HttpResponse.json({
		status: 0,
		message: "Collection deleted successfully",
	});
});

// Get collection by ID
export const getCollectionById = http.get(CollectionApi.GET_BY_ID, ({ params }) => {
	const id = params.id as string;
	const collection = mockCollections.find((collection) => collection.id === id);

	if (!collection) {
		return HttpResponse.json(
			{
				status: 1,
				message: "Collection not found",
			},
			{ status: 404 },
		);
	}

	return HttpResponse.json({
		status: 0,
		message: "Success",
		data: {
			...collection,
			storeName: getStoreName(collection.storeId),
			activeFlyers: getActiveFlyers(collection.id).length,
		},
	});
});

// Get flyers in a collection with pagination
export const getCollectionFlyers = http.get(CollectionApi.GET_FLYERS, ({ params, request }) => {
	const collectionId = params.id as string;
	const url = new URL(request.url);
	const activeOnly = url.searchParams.get("activeOnly") === "true";

	// Get pagination parameters
	const paginationParams = getPaginationParams(request);

	let flyers = getSharedFlyers().filter((flyer) => flyer.collectionId === collectionId);

	if (activeOnly) {
		flyers = flyers.filter((flyer) => isFlyerActive(flyer));
	}

	// Sort by creation date (newest first)
	const sortedFlyers = flyers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

	// Apply pagination
	const paginatedData = paginateArray(sortedFlyers, paginationParams);

	return HttpResponse.json({
		status: 0,
		message: "Success",
		data: paginatedData,
	});
});

// Create flyer in collection
export const createFlyer = http.post(CollectionApi.CREATE_FLYER, async ({ request, params }) => {
	const collectionId = params.id as string;
	const flyerData = (await request.json()) as Omit<Flyer, "id" | "createdAt" | "updatedAt" | "finalPrice">;

	// Check if collection exists
	const collection = mockCollections.find((c) => c.id === collectionId);
	if (!collection) {
		return HttpResponse.json(
			{
				status: 1,
				message: "Collection not found",
			},
			{ status: 404 },
		);
	}

	// Calculate final price
	const finalPrice =
		flyerData.discountPercentage > 0
			? flyerData.price - flyerData.price * (flyerData.discountPercentage / 100)
			: flyerData.price;

	const newFlyer: Flyer = {
		...flyerData,
		id: faker.string.uuid(),
		finalPrice,
		status: BasicStatus.ENABLE,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	addSharedFlyer(newFlyer);

	// Update collection flyersCount and set thumbnail if first flyer
	const collectionIndex = mockCollections.findIndex((c) => c.id === collectionId);
	mockCollections[collectionIndex] = {
		...mockCollections[collectionIndex],
		flyersCount: mockCollections[collectionIndex].flyersCount + 1,
		thumbnailFlyerId: mockCollections[collectionIndex].thumbnailFlyerId || newFlyer.id,
		updatedAt: new Date(),
	};

	// Auto-generate discount notification if there's a discount
	if (newFlyer.discountPercentage > 0) {
		try {
			const storeName = getStoreName(collection.storeId);
			generateDiscountNotification(newFlyer.name, newFlyer.discountPercentage, storeName, collection.storeId);
		} catch (error) {
			console.error("Failed to generate discount notification:", error);
			// Continue with flyer creation even if notification fails
		}
	}

	return HttpResponse.json({
		status: 0,
		message: "Flyer created successfully",
		data: newFlyer,
	});
});

// Update flyer
export const updateFlyer = http.put(CollectionApi.UPDATE_FLYER, async ({ request, params }) => {
	const collectionId = params.collectionId as string;
	const flyerId = params.flyerId as string;
	const updateData = (await request.json()) as Partial<Flyer>;

	const flyerIndex = getSharedFlyers().findIndex((f) => f.id === flyerId && f.collectionId === collectionId);

	if (flyerIndex === -1) {
		return HttpResponse.json(
			{
				status: 1,
				message: "Flyer not found",
			},
			{ status: 404 },
		);
	}

	// Recalculate final price if price or discount changed
	const currentFlyers = getSharedFlyers();
	const updatedFlyer = { ...currentFlyers[flyerIndex], ...updateData };
	if (updateData.price !== undefined || updateData.discountPercentage !== undefined) {
		updatedFlyer.finalPrice =
			updatedFlyer.discountPercentage > 0
				? updatedFlyer.price - updatedFlyer.price * (updatedFlyer.discountPercentage / 100)
				: updatedFlyer.price;
	}

	const finalUpdatedFlyer = {
		...updatedFlyer,
		updatedAt: new Date(),
	};

	updateSharedFlyer(flyerId, finalUpdatedFlyer);

	// Auto-generate discount notification if discount was added or increased
	const originalFlyer = currentFlyers[flyerIndex];
	const oldDiscount = originalFlyer.discountPercentage || 0;
	const newDiscount = updatedFlyer.discountPercentage || 0;

	if (newDiscount > oldDiscount && newDiscount > 0) {
		try {
			const collection = mockCollections.find((c) => c.id === collectionId);
			if (collection) {
				const storeName = getStoreName(collection.storeId);
				generateDiscountNotification(updatedFlyer.name, newDiscount, storeName, collection.storeId);
			}
		} catch (error) {
			console.error("Failed to generate discount notification on update:", error);
			// Continue with flyer update even if notification fails
		}
	}

	return HttpResponse.json({
		status: 0,
		message: "Flyer updated successfully",
		data: finalUpdatedFlyer,
	});
});

// Delete flyer
export const deleteFlyer = http.delete(CollectionApi.DELETE_FLYER, ({ params }) => {
	const collectionId = params.collectionId as string;
	const flyerId = params.flyerId as string;

	const flyerIndex = getSharedFlyers().findIndex((f) => f.id === flyerId && f.collectionId === collectionId);

	if (flyerIndex === -1) {
		return HttpResponse.json(
			{
				status: 1,
				message: "Flyer not found",
			},
			{ status: 404 },
		);
	}

	// Remove the flyer
	removeSharedFlyer(flyerId);

	// Update collection flyersCount
	const collectionIndex = mockCollections.findIndex((c) => c.id === collectionId);
	if (collectionIndex !== -1) {
		const collection = mockCollections[collectionIndex];
		const remainingFlyers = getSharedFlyers().filter((f) => f.collectionId === collectionId);

		mockCollections[collectionIndex] = {
			...collection,
			flyersCount: remainingFlyers.length,
			// Update thumbnail if deleted flyer was the thumbnail
			thumbnailFlyerId:
				collection.thumbnailFlyerId === flyerId ? remainingFlyers[0]?.id || undefined : collection.thumbnailFlyerId,
			updatedAt: new Date(),
		};
	}

	return HttpResponse.json({
		status: 0,
		message: "Flyer deleted successfully",
	});
});
