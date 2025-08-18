import { http, HttpResponse } from "msw";
import { faker } from "@faker-js/faker";
import { MOCK_STORES } from "../store-data";
import { MOCK_CATEGORIES } from "../category-data";
import { getPaginationParams, paginateArray } from "../utils";
import type { Store } from "@/types/store";
import { BasicStatus } from "@/types/enum";
import { generateNewStoreNotification } from "./_notification";

// Store endpoints
export const StoreApi = {
	LIST: "/api/stores",
	CREATE: "/api/stores",
	UPDATE: "/api/stores/:id",
	DELETE: "/api/stores/:id",
	GET_BY_ID: "/api/stores/:id",
};

let mockStores: Store[] = [...MOCK_STORES];

// Get all stores with filtering and pagination
export const getStores = http.get(StoreApi.LIST, ({ request }) => {
	const url = new URL(request.url);
	const search = url.searchParams.get("search")?.toLowerCase();
	const category = url.searchParams.get("category");
	const status = url.searchParams.get("status");
	const city = url.searchParams.get("city");

	// Get pagination parameters
	const paginationParams = getPaginationParams(request);

	let filteredStores = [...mockStores];

	// Apply filters
	if (search) {
		filteredStores = filteredStores.filter((store) => store.name.toLowerCase().includes(search));
	}

	if (category) {
		filteredStores = filteredStores.filter((store) => store.categoryId === category || store.category === category);
	}

	if (status !== null && status !== undefined) {
		filteredStores = filteredStores.filter((store) => store.status === parseInt(status));
	}

	if (city) {
		filteredStores = filteredStores.filter((store) => store.location.city === city);
	}

	// Sort by creation date (newest first)
	const sortedStores = filteredStores.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

	// Add category information to stores
	const enrichedStores = sortedStores.map((store) => {
		const category = MOCK_CATEGORIES.find((cat) => cat.id === store.categoryId);
		return {
			...store,
			categoryName: category?.name || "Unknown Category",
		};
	});

	// Apply pagination
	const paginatedData = paginateArray(enrichedStores, paginationParams);

	return HttpResponse.json({
		status: 0,
		message: "Success",
		data: paginatedData,
	});
});

// Create a new store
export const createStore = http.post(StoreApi.CREATE, async ({ request }) => {
	const storeData = (await request.json()) as Omit<Store, "id" | "createdAt" | "updatedAt">;

	const newStore: Store = {
		...storeData,
		id: faker.string.uuid(),
		status: BasicStatus.ENABLE,
		activeFlyersCount: 0,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	mockStores.unshift(newStore);

	// Auto-generate new store notification
	try {
		generateNewStoreNotification(newStore.name, newStore.id);
	} catch (error) {
		console.error("Failed to generate new store notification:", error);
		// Continue with store creation even if notification fails
	}

	return HttpResponse.json({
		status: 0,
		message: "Store created successfully",
		data: newStore,
	});
});

// Update store
export const updateStore = http.put(StoreApi.UPDATE, async ({ request, params }) => {
	const id = params.id as string;
	const updateData = (await request.json()) as Partial<Store>;

	const storeIndex = mockStores.findIndex((store) => store.id === id);

	if (storeIndex === -1) {
		return HttpResponse.json(
			{
				status: 1,
				message: "Store not found",
			},
			{ status: 404 },
		);
	}

	mockStores[storeIndex] = {
		...mockStores[storeIndex],
		...updateData,
		updatedAt: new Date(),
	};

	return HttpResponse.json({
		status: 0,
		message: "Store updated successfully",
		data: mockStores[storeIndex],
	});
});

// Delete store
export const deleteStore = http.delete(StoreApi.DELETE, ({ params }) => {
	const id = params.id as string;

	const storeIndex = mockStores.findIndex((store) => store.id === id);

	if (storeIndex === -1) {
		return HttpResponse.json(
			{
				status: 1,
				message: "Store not found",
			},
			{ status: 404 },
		);
	}

	mockStores.splice(storeIndex, 1);

	return HttpResponse.json({
		status: 0,
		message: "Store deleted successfully",
	});
});

// Get store by ID
export const getStoreById = http.get(StoreApi.GET_BY_ID, ({ params }) => {
	const id = params.id as string;
	const store = mockStores.find((store) => store.id === id);

	if (!store) {
		return HttpResponse.json(
			{
				status: 1,
				message: "Store not found",
			},
			{ status: 404 },
		);
	}

	return HttpResponse.json({
		status: 0,
		message: "Success",
		data: store,
	});
});
