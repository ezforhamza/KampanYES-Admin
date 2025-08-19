import { faker } from "@faker-js/faker";
import type { User } from "@/types/user";
import { UserStatus } from "@/types/user";


// Import actual store and flyer data to use real IDs
import { MOCK_STORES } from "./store-data";
import { MOCK_FLYERS } from "./collection-data";

// Extract actual IDs from existing mock data
const SAMPLE_FLYER_IDS = MOCK_FLYERS.map((flyer) => flyer.id);
const SAMPLE_STORE_IDS = MOCK_STORES.map((store) => store.id);

// Helper function to generate random liked items
const generateLikedItems = (items: string[], maxCount: number = 5): string[] => {
	const count = faker.number.int({ min: 0, max: Math.min(maxCount, items.length) });
	return faker.helpers.arrayElements(items, count);
};


// Local avatar images
const AVATAR_IMAGES = [
	"/src/assets/images/avatars/avatar-1.png",
	"/src/assets/images/avatars/avatar-2.png",
	"/src/assets/images/avatars/avatar-3.png",
	"/src/assets/images/avatars/avatar-4.png",
	"/src/assets/images/avatars/avatar-5.png",
	"/src/assets/images/avatars/avatar-6.png",
	"/src/assets/images/avatars/avatar-7.png",
	"/src/assets/images/avatars/avatar-8.png",
];

// Generate mock users
const generateUsers = (count: number): User[] => {
	return Array.from({ length: count }, () => {
		const likedFlyers = generateLikedItems(SAMPLE_FLYER_IDS);
		const likedStores = generateLikedItems(SAMPLE_STORE_IDS);
		const createdAt = faker.date.between({
			from: new Date("2023-01-01"),
			to: new Date(),
		});
		const lastLoginAt = faker.datatype.boolean({ probability: 0.8 })
			? faker.date.between({ from: createdAt, to: new Date() })
			: undefined;

		// Generate status with realistic distribution
		let status: UserStatus;
		const statusRand = Math.random();
		if (statusRand < 0.9) {
			status = UserStatus.ACTIVE;
		} else {
			status = UserStatus.SUSPENDED;
		}

		return {
			id: faker.string.uuid(),
			email: faker.internet.email(),
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			profileImage: faker.helpers.arrayElement(AVATAR_IMAGES),
			status,
			likedFlyers,
			likedStores,
			createdAt,
			updatedAt: faker.date.between({ from: createdAt, to: new Date() }),
			lastLoginAt,
			totalLikedFlyers: likedFlyers.length,
			totalLikedStores: likedStores.length,
		};
	});
};

// Export mock data
export const MOCK_USERS: User[] = generateUsers(50);

// Helper functions to get store and flyer details by ID
export const getStoreById = (storeId: string) => {
	return MOCK_STORES.find((store) => store.id === storeId);
};

export const getFlyerById = (flyerId: string) => {
	return MOCK_FLYERS.find((flyer) => flyer.id === flyerId);
};

export const getStoresByIds = (storeIds: string[]) => {
	return storeIds.map((id) => getStoreById(id)).filter(Boolean);
};

export const getFlyersByIds = (flyerIds: string[]) => {
	return flyerIds.map((id) => getFlyerById(id)).filter(Boolean);
};

// Helper functions for statistics
export const getUserStats = () => {
	const totalUsers = MOCK_USERS.length;
	const activeUsers = MOCK_USERS.filter((user) => user.status === UserStatus.ACTIVE).length;
	const suspendedUsers = MOCK_USERS.filter((user) => user.status === UserStatus.SUSPENDED).length;

	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
	const newUsersThisMonth = MOCK_USERS.filter((user) => user.createdAt >= thirtyDaysAgo).length;

	return {
		totalUsers,
		activeUsers,
		suspendedUsers,
		newUsersThisMonth,
	};
};
