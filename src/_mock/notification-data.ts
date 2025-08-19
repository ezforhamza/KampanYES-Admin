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
		// scheduledFor: new Date("2024-08-15T08:00:00Z"),
		sentAt: new Date("2024-08-15T08:00:00Z"),
		createdAt: new Date("2024-08-14T10:30:00Z"),
		updatedAt: new Date("2024-08-15T08:00:00Z"),
		createdBy: "admin-1",
		totalTargetUsers: 1247,
		deliveredCount: 1198,
		readCount: 892,
	},


	// Recent admin message - sent
	{
		id: "notif-3",
		type: NotificationType.ADMIN_MESSAGE,
		title: "Weekend Special Offers",
		message: "Don't miss out on exclusive weekend deals from your favorite stores! Open the app to explore.",
		target: {
			type: NotificationTargetType.ALL_USERS,
		},
		status: NotificationStatus.SENT,
		sentAt: new Date("2024-08-17T09:00:00Z"),
		createdAt: new Date("2024-08-14T16:45:00Z"),
		updatedAt: new Date("2024-08-17T09:00:00Z"),
		createdBy: "admin-1",
		totalTargetUsers: 1247,
		deliveredCount: 1203,
		readCount: 856,
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

	// Recent admin message - sent
	{
		id: "notif-6",
		type: NotificationType.ADMIN_MESSAGE,
		title: "Summer Sale Ending Soon",
		message: "Last chance to grab amazing summer deals! Sale ends this Friday.",
		target: {
			type: NotificationTargetType.ALL_USERS,
		},
		status: NotificationStatus.SENT,
		sentAt: new Date("2024-08-14T17:30:00Z"),
		createdAt: new Date("2024-08-14T15:00:00Z"),
		updatedAt: new Date("2024-08-14T17:30:00Z"),
		createdBy: "admin-1",
		totalTargetUsers: 1247,
		deliveredCount: 1189,
		readCount: 934,
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

		default:
			return 0;
	}
};
