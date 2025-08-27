import apiClient from "../apiClient";
import type { Store, StoreFilters } from "@/types/store";
import type { CreateStoreFormData } from "@/pages/stores/schemas/store-schema";

export interface UpdateStoreRequest {
	image?: string;
	name?: string;
	category?: string;
	description?: string;
	website?: string;
	status?: string; // "active" | "inactive"
	location?: {
		type: "Point";
		coordinates: [number, number]; // [lng, lat]
		address: string;
	};
	availability?: Array<{
		day: string;
		openingTime?: string;
		closingTime?: string;
		status?: "open" | "closed";
	}>;
}

export enum StoreApi {
	LIST = "/store/",
	CREATE = "/store/",
	UPDATE = "/store/:id",
	DELETE = "/store/:id",
	GET_BY_ID = "/store/:id",
}

// Get all stores with pagination and optional filters
const getStores = (page: number = 1, limit: number = 15, filters?: StoreFilters) => {
	const params = new URLSearchParams();

	// Add pagination params
	params.append("page", page.toString());
	params.append("limit", limit.toString());

	// Add filter params
	if (filters?.search) {
		params.append("search", filters.search);
	}
	if (filters?.category) {
		params.append("category", filters.category);
	}
	if (filters?.status) {
		params.append("status", filters.status);
	}

	const url = `${StoreApi.LIST}?${params.toString()}`;

	return apiClient.get<Store[]>({ url });
};

// Create a new store
const createStore = (data: CreateStoreFormData) => {
	return apiClient.post<Store>({
		url: StoreApi.CREATE,
		data,
	});
};

// Update an existing store
const updateStore = (id: string, data: UpdateStoreRequest) => {
	return apiClient.put<Store>({
		url: StoreApi.UPDATE.replace(":id", id),
		data,
	});
};

// Delete a store
const deleteStore = (id: string) => {
	return apiClient.delete({
		url: StoreApi.DELETE.replace(":id", id),
	});
};

// Get store by ID
const getStoreById = (id: string) => {
	return apiClient.get<Store>({
		url: StoreApi.GET_BY_ID.replace(":id", id),
	});
};

export default {
	getStores,
	createStore,
	updateStore,
	deleteStore,
	getStoreById,
};
