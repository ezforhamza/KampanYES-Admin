import type { Notification } from "@/types/notification";
import { NotificationType, NotificationStatus, NotificationTargetType } from "@/types/notification";
import { MOCK_USERS } from "./user-data";
import { MOCK_STORES } from "./store-data";
import { MOCK_COLLECTIONS } from "./collection-data";

// Mock Notifications Data
export const MOCK_NOTIFICATIONS: Notification[] = [
	// Recent admin message
	{
		id: "notif-1",
		type: NotificationType.ADMIN_MESSAGE,
		title: "Weekly App Maintenance",
		message:
			"The app will undergo scheduled maintenance this Sunday from 2-4 AM. Please expect brief service interruptions.",
		target: {
			type: NotificationTargetType.ALL_USERS,
		},
		status: NotificationStatus.SENT,
		scheduledFor: new Date("2024-08-15T08:00:00Z"),
		sentAt: new Date("2024-08-15T08:00:00Z"),
		createdAt: new Date("2024-08-14T10:30:00Z"),
		updatedAt: new Date("2024-08-15T08:00:00Z"),
		createdBy: "admin-1",
		totalTargetUsers: 1247,
		deliveredCount: 1198,
		readCount: 892,
	},

	// Auto-generated new store notification
	{
		id: "notif-2",
		type: NotificationType.NEW_STORE,
		title: "New Store Added: IKEA Amsterdam",
		message: "A new furniture store has joined KampanYES! Check out their latest collections and deals.",
		target: {
			type: NotificationTargetType.ALL_USERS,
		},
		status: NotificationStatus.SENT,
		relatedStoreId: "6", // Assume IKEA store ID
		sentAt: new Date("2024-08-13T14:20:00Z"),
		createdAt: new Date("2024-08-13T14:20:00Z"),
		updatedAt: new Date("2024-08-13T14:20:00Z"),
		createdBy: "system",
		totalTargetUsers: 1247,
		deliveredCount: 1201,
		readCount: 743,
	},

	// Scheduled admin message
	{
		id: "notif-3",
		type: NotificationType.ADMIN_MESSAGE,
		title: "Weekend Special Offers",
		message: "Don't miss out on exclusive weekend deals from your favorite stores! Open the app to explore.",
		target: {
			type: NotificationTargetType.ALL_USERS,
		},
		status: NotificationStatus.SCHEDULED,
		scheduledFor: new Date("2024-08-17T09:00:00Z"),
		createdAt: new Date("2024-08-14T16:45:00Z"),
		updatedAt: new Date("2024-08-14T16:45:00Z"),
		createdBy: "admin-1",
	},

	// Auto-generated new collection notification
	{
		id: "notif-4",
		type: NotificationType.NEW_COLLECTION,
		title: "New Collection: Back to School Essentials",
		message: "Albert Heijn just launched a new collection perfect for back-to-school shopping!",
		target: {
			type: NotificationTargetType.STORE_FOLLOWERS,
			storeId: "1", // Albert Heijn
		},
		status: NotificationStatus.SENT,
		relatedStoreId: "1",
		relatedCollectionId: "coll-6",
		sentAt: new Date("2024-08-12T11:15:00Z"),
		createdAt: new Date("2024-08-12T11:15:00Z"),
		updatedAt: new Date("2024-08-12T11:15:00Z"),
		createdBy: "system",
		totalTargetUsers: 342,
		deliveredCount: 331,
		readCount: 278,
	},

	// Custom user targeting
	{
		id: "notif-5",
		type: NotificationType.ADMIN_MESSAGE,
		title: "Premium User Benefits",
		message: "As a valued user, you now have access to exclusive early-bird deals! Check them out in the app.",
		target: {
			type: NotificationTargetType.CUSTOM_USERS,
			userIds: ["user-1", "user-3", "user-5", "user-8", "user-12"],
		},
		status: NotificationStatus.SENT,
		sentAt: new Date("2024-08-11T13:30:00Z"),
		createdAt: new Date("2024-08-10T09:20:00Z"),
		updatedAt: new Date("2024-08-11T13:30:00Z"),
		createdBy: "admin-2",
		totalTargetUsers: 5,
		deliveredCount: 5,
		readCount: 4,
	},

	// Draft notification
	{
		id: "notif-6",
		type: NotificationType.ADMIN_MESSAGE,
		title: "Summer Sale Ending Soon",
		message: "Last chance to grab amazing summer deals! Sale ends this Friday.",
		target: {
			type: NotificationTargetType.ALL_USERS,
		},
		status: NotificationStatus.DRAFT,
		createdAt: new Date("2024-08-14T15:00:00Z"),
		updatedAt: new Date("2024-08-14T17:30:00Z"),
		createdBy: "admin-1",
	},

	// Auto-generated discount notification
	{
		id: "notif-7",
		type: NotificationType.DISCOUNT_ADDED,
		title: "New 40% Discount at MediaMarkt!",
		message: "MediaMarkt just added a huge discount on gaming laptops. Don't miss out!",
		target: {
			type: NotificationTargetType.STORE_FOLLOWERS,
			storeId: "2", // MediaMarkt
		},
		status: NotificationStatus.SENT,
		relatedStoreId: "2",
		relatedCollectionId: "coll-2",
		relatedFlyerId: "flyer-7",
		sentAt: new Date("2024-08-10T16:45:00Z"),
		createdAt: new Date("2024-08-10T16:45:00Z"),
		updatedAt: new Date("2024-08-10T16:45:00Z"),
		createdBy: "system",
		totalTargetUsers: 156,
		deliveredCount: 149,
		readCount: 98,
	},

	// Cancelled notification
	{
		id: "notif-8",
		type: NotificationType.ADMIN_MESSAGE,
		title: "Flash Sale Alert",
		message: "24-hour flash sale starting now! Limited time offers across all categories.",
		target: {
			type: NotificationTargetType.ALL_USERS,
		},
		status: NotificationStatus.CANCELLED,
		scheduledFor: new Date("2024-08-09T12:00:00Z"),
		createdAt: new Date("2024-08-08T14:20:00Z"),
		updatedAt: new Date("2024-08-09T10:30:00Z"),
		createdBy: "admin-2",
	},
];

// Helper functions for notification management
export const getNotificationStats = () => {
	const totalNotifications = MOCK_NOTIFICATIONS.length;
	const sentNotifications = MOCK_NOTIFICATIONS.filter((n) => n.status === NotificationStatus.SENT).length;
	const scheduledNotifications = MOCK_NOTIFICATIONS.filter((n) => n.status === NotificationStatus.SCHEDULED).length;
	const draftNotifications = MOCK_NOTIFICATIONS.filter((n) => n.status === NotificationStatus.DRAFT).length;

	const totalDelivered = MOCK_NOTIFICATIONS.filter((n) => n.deliveredCount).reduce(
		(sum, n) => sum + (n.deliveredCount || 0),
		0,
	);

	const totalRead = MOCK_NOTIFICATIONS.filter((n) => n.readCount).reduce((sum, n) => sum + (n.readCount || 0), 0);

	return {
		total: totalNotifications,
		sent: sentNotifications,
		scheduled: scheduledNotifications,
		drafts: draftNotifications,
		delivered: totalDelivered,
		read: totalRead,
		readRate: totalDelivered > 0 ? Math.round((totalRead / totalDelivered) * 100) : 0,
	};
};

// Helper to get related entity names
export const getRelatedEntityName = (notification: Notification): string | null => {
	if (notification.relatedStoreId) {
		const store = MOCK_STORES.find((s) => s.id === notification.relatedStoreId);
		return store?.name || null;
	}

	if (notification.relatedCollectionId) {
		const collection = MOCK_COLLECTIONS.find((c) => c.id === notification.relatedCollectionId);
		return collection?.name || null;
	}

	return null;
};

// Helper to calculate target user count
export const calculateTargetUserCount = (target: Notification["target"]): number => {
	switch (target.type) {
		case NotificationTargetType.ALL_USERS:
			return MOCK_USERS.length;

		case NotificationTargetType.CUSTOM_USERS:
			return target.userIds?.length || 0;

		case NotificationTargetType.STORE_FOLLOWERS:
			// In a real app, this would query users who liked the specific store
			// For mock data, we'll estimate based on store popularity
			return Math.floor(Math.random() * 500) + 50; // 50-550 users

		default:
			return 0;
	}
};
