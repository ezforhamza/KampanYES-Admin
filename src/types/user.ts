/**
 * User Status enum for KampanYES
 */
export enum UserStatus {
	ACTIVE = 1,
	SUSPENDED = 0,
	PENDING_VERIFICATION = 2,
}

/**
 * Supported languages for the app
 */
export enum UserLanguage {
	ENGLISH = "en",
	DUTCH = "nl",
	FRENCH = "fr",
	GERMAN = "de",
}

/**
 * User location information (similar to store location)
 */
export interface UserLocation {
	address: string;
	city: string;
	coordinates?: {
		lat: number;
		lng: number;
	};
}

/**
 * User interface for KampanYES app users
 */
export interface User {
	id: string;
	email: string;
	name: string;
	profileImage: string;
	location: UserLocation;
	language: UserLanguage;
	status: UserStatus;
	likedFlyers: string[]; // Array of flyer IDs
	likedStores: string[]; // Array of store IDs
	createdAt: Date;
	updatedAt: Date;
	lastLoginAt?: Date;
	// Statistics
	totalLikedFlyers: number;
	totalLikedStores: number;
}

/**
 * User update request interface (for admin actions)
 */
export interface UpdateUserRequest {
	status?: UserStatus;
	// Note: Other fields like name, email, etc. are updated by user themselves
}

/**
 * User filters for search and filtering in admin panel
 */
export interface UserFilters {
	search?: string; // Search by name or email
	status?: UserStatus;
	language?: UserLanguage;
	city?: string;
}

/**
 * User statistics for dashboard
 */
export interface UserStats {
	totalUsers: number;
	activeUsers: number;
	suspendedUsers: number;
	newUsersThisMonth: number;
	topLanguages: Array<{
		language: UserLanguage;
		count: number;
		percentage: number;
	}>;
}

/**
 * Language labels for UI display
 */
export const USER_LANGUAGE_LABELS: Record<UserLanguage, string> = {
	[UserLanguage.ENGLISH]: "English",
	[UserLanguage.DUTCH]: "Nederlands",
	[UserLanguage.FRENCH]: "Français",
	[UserLanguage.GERMAN]: "Deutsch",
};

/**
 * User status labels for UI display
 */
export const USER_STATUS_LABELS: Record<UserStatus, string> = {
	[UserStatus.ACTIVE]: "Active",
	[UserStatus.SUSPENDED]: "Suspended",
	[UserStatus.PENDING_VERIFICATION]: "Pending Verification",
};
