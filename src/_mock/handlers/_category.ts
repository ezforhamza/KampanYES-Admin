import { http, HttpResponse } from "msw";
import { faker } from "@faker-js/faker";
import { MOCK_CATEGORIES } from "../category-data";
import { MOCK_STORES } from "../store-data";
import { getPaginationParams, paginateArray } from "../utils";
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from "@/types/category";
import { BasicStatus } from "@/types/enum";

// Category API endpoints
export const CategoryApi = {
	LIST: "/api/categories",
	CREATE: "/api/categories",
	UPDATE: "/api/categories/:id",
	DELETE: "/api/categories/:id",
	GET_BY_ID: "/api/categories/:id",
};

// In-memory storage for new categories
let mockCategories: Category[] = [...MOCK_CATEGORIES];

// Helper function to calculate store count for a category
const calculateStoreCount = (categoryId: string): number => {
	return MOCK_STORES.filter((store) => store.categoryId === categoryId).length;
};

// Get all categories with filtering and pagination
export const getCategories = http.get(CategoryApi.LIST, ({ request }) => {
	const url = new URL(request.url);
	const search = url.searchParams.get("search")?.toLowerCase();
	const status = url.searchParams.get("status");

	// Get pagination parameters
	const paginationParams = getPaginationParams(request);

	let filteredCategories = [...mockCategories];

	// Apply search filter
	if (search) {
		filteredCategories = filteredCategories.filter((category) => category.name.toLowerCase().includes(search));
	}

	// Apply status filter
	if (status !== null && status !== undefined) {
		filteredCategories = filteredCategories.filter((category) => category.status === parseInt(status));
	}

	// Sort by creation date (newest first) and update store counts
	const enrichedCategories = filteredCategories
		.map((category) => ({
			...category,
			storesCount: calculateStoreCount(category.id),
		}))
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

	// Apply pagination
	const paginatedData = paginateArray(enrichedCategories, paginationParams);

	return HttpResponse.json({
		status: 0,
		message: "Success",
		data: paginatedData,
	});
});

// Create a new category
export const createCategory = http.post(CategoryApi.CREATE, async ({ request }) => {
	const categoryData = (await request.json()) as CreateCategoryRequest;

	// Check if category name already exists
	const existingCategory = mockCategories.find((cat) => cat.name.toLowerCase() === categoryData.name.toLowerCase());

	if (existingCategory) {
		return HttpResponse.json(
			{
				status: 1,
				message: "Category name already exists",
			},
			{ status: 400 },
		);
	}

	// Handle image upload - in a real app, this would upload to cloud storage
	// For mock purposes, we'll create a blob URL for file objects
	let imageUrl = "";
	if (typeof categoryData.image === "string") {
		imageUrl = categoryData.image;
	} else if (categoryData.image instanceof File) {
		// In mock environment, create a blob URL for the uploaded file
		imageUrl = URL.createObjectURL(categoryData.image);
	}

	const newCategory: Category = {
		id: faker.string.uuid(),
		name: categoryData.name,
		image: imageUrl,
		status: BasicStatus.ENABLE,
		createdAt: new Date(),
		updatedAt: new Date(),
		storesCount: 0,
	};

	mockCategories.unshift(newCategory);

	return HttpResponse.json({
		status: 0,
		message: "Category created successfully",
		data: newCategory,
	});
});

// Update category
export const updateCategory = http.put(CategoryApi.UPDATE, async ({ request, params }) => {
	const id = params.id as string;
	const updateData = (await request.json()) as UpdateCategoryRequest;

	const categoryIndex = mockCategories.findIndex((category) => category.id === id);

	if (categoryIndex === -1) {
		return HttpResponse.json(
			{
				status: 1,
				message: "Category not found",
			},
			{ status: 404 },
		);
	}

	// Check if new name conflicts with existing categories (excluding current one)
	if (updateData.name) {
		const existingCategory = mockCategories.find(
			(cat) => cat.id !== id && cat.name.toLowerCase() === updateData.name!.toLowerCase(),
		);

		if (existingCategory) {
			return HttpResponse.json(
				{
					status: 1,
					message: "Category name already exists",
				},
				{ status: 400 },
			);
		}
	}

	// Handle image update
	let imageUpdate: string | undefined = undefined;
	if (updateData.image) {
		if (typeof updateData.image === "string") {
			imageUpdate = updateData.image;
		} else if (updateData.image instanceof File) {
			// In mock environment, create a blob URL for the uploaded file
			imageUpdate = URL.createObjectURL(updateData.image);
		}
	}

	mockCategories[categoryIndex] = {
		...mockCategories[categoryIndex],
		name: updateData.name || mockCategories[categoryIndex].name,
		image: imageUpdate !== undefined ? imageUpdate : mockCategories[categoryIndex].image,
		status: updateData.status !== undefined ? updateData.status : mockCategories[categoryIndex].status,
		updatedAt: new Date(),
	};

	return HttpResponse.json({
		status: 0,
		message: "Category updated successfully",
		data: mockCategories[categoryIndex],
	});
});

// Delete category
export const deleteCategory = http.delete(CategoryApi.DELETE, ({ params }) => {
	const id = params.id as string;

	const categoryIndex = mockCategories.findIndex((category) => category.id === id);

	if (categoryIndex === -1) {
		return HttpResponse.json(
			{
				status: 1,
				message: "Category not found",
			},
			{ status: 404 },
		);
	}

	// Check if category has stores assigned to it
	const category = mockCategories[categoryIndex];
	if (category.storesCount && category.storesCount > 0) {
		return HttpResponse.json(
			{
				status: 1,
				message: `Cannot delete category. ${category.storesCount} store(s) are using this category.`,
			},
			{ status: 400 },
		);
	}

	mockCategories.splice(categoryIndex, 1);

	return HttpResponse.json({
		status: 0,
		message: "Category deleted successfully",
	});
});

// Get category by ID
export const getCategoryById = http.get(CategoryApi.GET_BY_ID, ({ params }) => {
	const id = params.id as string;
	const category = mockCategories.find((category) => category.id === id);

	if (!category) {
		return HttpResponse.json(
			{
				status: 1,
				message: "Category not found",
			},
			{ status: 404 },
		);
	}

	return HttpResponse.json({
		status: 0,
		message: "Success",
		data: category,
	});
});
