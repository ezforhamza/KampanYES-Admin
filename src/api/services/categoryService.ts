import apiClient from "../apiClient";
import type { Category, CategoryFilters, CreateCategoryRequest, UpdateCategoryRequest } from "@/types/category";

export enum CategoryApi {
	LIST = "/category/",
	CREATE = "/category/",
	UPDATE = "/category/:id",
	DELETE = "/category/:id",
	GET_BY_ID = "/category/:id",
}

// Get all categories
const getCategories = (filters?: CategoryFilters) => {
	const params = new URLSearchParams();

	// Add filter params
	if (filters?.search) {
		params.append("search", filters.search);
	}

	const url = `${CategoryApi.LIST}${params.toString() ? `?${params.toString()}` : ""}`;

	return apiClient.get<Category[]>({ url });
};

// Create a new category
const createCategory = (data: CreateCategoryRequest) => {
	return apiClient.post<Category>({
		url: CategoryApi.CREATE,
		data,
	});
};

// Update an existing category
const updateCategory = (id: string, data: UpdateCategoryRequest) => {
	return apiClient.put<Category>({
		url: CategoryApi.UPDATE.replace(":id", id),
		data,
	});
};

// Delete a category
const deleteCategory = (id: string) => {
	return apiClient.delete({
		url: CategoryApi.DELETE.replace(":id", id),
	});
};

// Get category by ID
const getCategoryById = (id: string) => {
	return apiClient.get<Category>({
		url: CategoryApi.GET_BY_ID.replace(":id", id),
	});
};

export default {
	getCategories,
	createCategory,
	updateCategory,
	deleteCategory,
	getCategoryById,
};
