import { http, HttpResponse } from "msw";
import { MOCK_USERS, getUserStats } from "../user-data";
import type { User, UpdateUserRequest } from "@/types/user";
import { UserStatus } from "@/types/user";

// App User API endpoints
export const AppUserApi = {
	LIST: "/api/app-users",
	UPDATE: "/api/app-users/:id",
	GET_BY_ID: "/api/app-users/:id",
	STATS: "/api/app-users/stats",
	SUSPEND: "/api/app-users/:id/suspend",
	ACTIVATE: "/api/app-users/:id/activate",
};

// In-memory storage for user updates
let mockUsers: User[] = [...MOCK_USERS];

// Get all users with filtering
export const getAppUsers = http.get(AppUserApi.LIST, ({ request }) => {
	const url = new URL(request.url);
	const search = url.searchParams.get("search")?.toLowerCase();
	const status = url.searchParams.get("status");
	const language = url.searchParams.get("language");
	const city = url.searchParams.get("city");
	const page = parseInt(url.searchParams.get("page") || "1");
	const limit = parseInt(url.searchParams.get("limit") || "20");

	let filteredUsers = [...mockUsers];

	// Apply search filter (name or email)
	if (search) {
		filteredUsers = filteredUsers.filter(
			(user) => user.name.toLowerCase().includes(search) || user.email.toLowerCase().includes(search),
		);
	}

	// Apply status filter
	if (status !== null && status !== undefined) {
		filteredUsers = filteredUsers.filter((user) => user.status === parseInt(status));
	}

	// Apply language filter
	if (language) {
		filteredUsers = filteredUsers.filter((user) => user.language === language);
	}

	// Apply city filter
	if (city) {
		filteredUsers = filteredUsers.filter((user) => user.location.city.toLowerCase().includes(city.toLowerCase()));
	}

	// Sort by creation date (newest first)
	const sortedUsers = filteredUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

	// Apply pagination
	const startIndex = (page - 1) * limit;
	const endIndex = startIndex + limit;
	const paginatedUsers = sortedUsers.slice(startIndex, endIndex);

	return HttpResponse.json({
		status: 0,
		message: "Success",
		data: {
			list: paginatedUsers,
			total: filteredUsers.length,
			page,
			limit,
			totalPages: Math.ceil(filteredUsers.length / limit),
		},
	});
});

// Get user by ID
export const getAppUserById = http.get(AppUserApi.GET_BY_ID, ({ params }) => {
	const id = params.id as string;
	const user = mockUsers.find((user) => user.id === id);

	if (!user) {
		return HttpResponse.json(
			{
				status: 1,
				message: "User not found",
			},
			{ status: 404 },
		);
	}

	return HttpResponse.json({
		status: 0,
		message: "Success",
		data: user,
	});
});

// Update user (mainly for status changes by admin)
export const updateAppUser = http.put(AppUserApi.UPDATE, async ({ request, params }) => {
	const id = params.id as string;
	const updateData = (await request.json()) as UpdateUserRequest;

	const userIndex = mockUsers.findIndex((user) => user.id === id);

	if (userIndex === -1) {
		return HttpResponse.json(
			{
				status: 1,
				message: "User not found",
			},
			{ status: 404 },
		);
	}

	mockUsers[userIndex] = {
		...mockUsers[userIndex],
		...updateData,
		updatedAt: new Date(),
	};

	return HttpResponse.json({
		status: 0,
		message: "User updated successfully",
		data: mockUsers[userIndex],
	});
});

// Suspend user
export const suspendAppUser = http.post(AppUserApi.SUSPEND, ({ params }) => {
	const id = params.id as string;
	const userIndex = mockUsers.findIndex((user) => user.id === id);

	if (userIndex === -1) {
		return HttpResponse.json(
			{
				status: 1,
				message: "User not found",
			},
			{ status: 404 },
		);
	}

	if (mockUsers[userIndex].status === UserStatus.SUSPENDED) {
		return HttpResponse.json(
			{
				status: 1,
				message: "User is already suspended",
			},
			{ status: 400 },
		);
	}

	mockUsers[userIndex] = {
		...mockUsers[userIndex],
		status: UserStatus.SUSPENDED,
		updatedAt: new Date(),
	};

	return HttpResponse.json({
		status: 0,
		message: "User suspended successfully",
		data: mockUsers[userIndex],
	});
});

// Activate user
export const activateAppUser = http.post(AppUserApi.ACTIVATE, ({ params }) => {
	const id = params.id as string;
	const userIndex = mockUsers.findIndex((user) => user.id === id);

	if (userIndex === -1) {
		return HttpResponse.json(
			{
				status: 1,
				message: "User not found",
			},
			{ status: 404 },
		);
	}

	if (mockUsers[userIndex].status === UserStatus.ACTIVE) {
		return HttpResponse.json(
			{
				status: 1,
				message: "User is already active",
			},
			{ status: 400 },
		);
	}

	mockUsers[userIndex] = {
		...mockUsers[userIndex],
		status: UserStatus.ACTIVE,
		updatedAt: new Date(),
	};

	return HttpResponse.json({
		status: 0,
		message: "User activated successfully",
		data: mockUsers[userIndex],
	});
});

// Get user statistics
export const getAppUserStats = http.get(AppUserApi.STATS, () => {
	const stats = getUserStats();

	return HttpResponse.json({
		status: 0,
		message: "Success",
		data: stats,
	});
});
