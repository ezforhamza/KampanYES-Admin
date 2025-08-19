/**
 * User Status enum for KampanYES
 */
export enum UserStatus {
	ACTIVE = 1,
	SUSPENDED = 0,
	PENDING_VERIFICATION = 2,
}



/**
 * User interface for KampanYES app users
 */
export interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	profileImage: string;
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
	search?: string; // Search by first name, last name or email
	status?: UserStatus;
}

/**
 * User statistics for dashboard
 */
export interface UserStats {
	totalUsers: number;
	activeUsers: number;
	suspendedUsers: number;
	newUsersThisMonth: number;
}


/**
 * User status labels for UI display
 */
export const USER_STATUS_LABELS: Record<UserStatus, string> = {
	[UserStatus.ACTIVE]: "Active",
	[UserStatus.SUSPENDED]: "Suspended",
	[UserStatus.PENDING_VERIFICATION]: "Pending Verification",
};
