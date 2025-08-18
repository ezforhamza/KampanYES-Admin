import { faker } from "@faker-js/faker";

export const fakeAvatars = (count: number) => {
	const result: string[] = [];
	for (let index = 0; index < count; index += 1) {
		result.push(faker.image.avatarGitHub());
	}
	return result;
};

// Pagination utility for MSW handlers
export interface PaginationParams {
	page: number;
	limit: number;
}

export interface PaginatedResponse<T> {
	list: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export const getPaginationParams = (request: Request): PaginationParams => {
	const url = new URL(request.url);
	const page = parseInt(url.searchParams.get("page") || "1");
	const limit = parseInt(url.searchParams.get("limit") || "10");

	return { page: Math.max(1, page), limit: Math.max(1, Math.min(100, limit)) };
};

export const paginateArray = <T>(items: T[], { page, limit }: PaginationParams): PaginatedResponse<T> => {
	const startIndex = (page - 1) * limit;
	const endIndex = startIndex + limit;
	const paginatedItems = items.slice(startIndex, endIndex);
	const totalPages = Math.ceil(items.length / limit);

	return {
		list: paginatedItems,
		total: items.length,
		page,
		limit,
		totalPages,
	};
};
