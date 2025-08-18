import { faker } from "@faker-js/faker";
import type { User } from "@/types/user";
import { UserStatus, UserLanguage } from "@/types/user";

// Generate realistic Dutch cities and addresses
const DUTCH_CITIES = [
	"Amsterdam",
	"Rotterdam",
	"The Hague",
	"Utrecht",
	"Eindhoven",
	"Tilburg",
	"Groningen",
	"Almere",
	"Breda",
	"Nijmegen",
	"Apeldoorn",
	"Haarlem",
	"Arnhem",
	"Zaanstad",
	"Amersfoort",
];

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

// Helper function to generate Dutch coordinates
const generateDutchCoordinates = () => ({
	lat: faker.number.float({ min: 51.0, max: 53.5, fractionDigits: 6 }),
	lng: faker.number.float({ min: 3.0, max: 7.5, fractionDigits: 6 }),
});

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
		const city = faker.helpers.arrayElement(DUTCH_CITIES);
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
			name: faker.person.fullName(),
			profileImage: faker.helpers.arrayElement(AVATAR_IMAGES),
			location: {
				address: faker.location.streetAddress(),
				city,
				coordinates: generateDutchCoordinates(),
			},
			language: faker.helpers.arrayElement(Object.values(UserLanguage)),
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

	// Calculate language distribution
	const languageCount: Record<UserLanguage, number> = {
		[UserLanguage.ENGLISH]: 0,
		[UserLanguage.DUTCH]: 0,
		[UserLanguage.FRENCH]: 0,
		[UserLanguage.GERMAN]: 0,
	};

	MOCK_USERS.forEach((user) => {
		languageCount[user.language]++;
	});

	const topLanguages = Object.entries(languageCount)
		.map(([language, count]) => ({
			language: language as UserLanguage,
			count,
			percentage: (count / totalUsers) * 100,
		}))
		.sort((a, b) => b.count - a.count);

	return {
		totalUsers,
		activeUsers,
		suspendedUsers,
		newUsersThisMonth,
		topLanguages,
	};
};
