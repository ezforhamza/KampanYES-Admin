import apiClient from "../apiClient";
import type { Store, StoreFilters } from "@/types/store";
import type { CreateStoreFormData } from "@/pages/stores/schemas/store-schema";

export enum StoreApi {
	LIST = "/api/stores",
	CREATE = "/api/stores",
	UPDATE = "/api/stores/:id",
	DELETE = "/api/stores/:id",
	GET_BY_ID = "/api/stores/:id",
}

// Get all stores with optional filters
const getStores = (filters?: StoreFilters) => {
	const params = new URLSearchParams();

	if (filters?.search) {
		params.append("search", filters.search);
	}
	if (filters?.category) {
		params.append("category", filters.category);
	}
	if (filters?.status !== undefined) {
		params.append("status", filters.status.toString());
	}
	if (filters?.city) {
		params.append("city", filters.city);
	}

	const url = `${StoreApi.LIST}${params.toString() ? `?${params.toString()}` : ""}`;

	return apiClient.get<{ list: Store[]; total: number }>({ url });
};

// Create a new store
const createStore = (data: CreateStoreFormData) => {
	return apiClient.post<Store>({
		url: StoreApi.CREATE,
		data,
	});
};

// Update an existing store
const updateStore = (id: string, data: Partial<Store>) => {
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
