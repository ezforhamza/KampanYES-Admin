import { http, HttpResponse } from "msw";
import { faker } from "@faker-js/faker";
import { MOCK_NOTIFICATIONS, getNotificationStats, calculateTargetUserCount } from "../notification-data";
import { getPaginationParams, paginateArray } from "../utils";
import type {
	Notification,
	CreateNotificationRequest,
	UpdateNotificationRequest,
} from "@/types/notification";
import { NotificationStatus, NotificationType, NotificationTargetType } from "@/types/notification";

// Notification API endpoints
export const NotificationApi = {
	LIST: "/api/notifications",
	CREATE: "/api/notifications",
	UPDATE: "/api/notifications/:id",
	DELETE: "/api/notifications/:id",
	GET_BY_ID: "/api/notifications/:id",
	STATS: "/api/notifications/stats",
	CANCEL: "/api/notifications/:id/cancel",
	SEND_NOW: "/api/notifications/:id/send",
};

// In-memory storage for notifications
let mockNotifications: Notification[] = [...MOCK_NOTIFICATIONS];

// Auto-notification generation utilities
export const createAutoNotification = (
	type: NotificationType,
	title: string,
	message: string,
	targetType: NotificationTargetType = NotificationTargetType.ALL_USERS,
	entityId?: string,
): Notification => {
	const newNotification: Notification = {
		id: faker.string.uuid(),
		type,
		title,
		message,
		target: {
			type: targetType,
			...(targetType === NotificationTargetType.STORE_FOLLOWERS &&
				entityId && {
					storeId: entityId,
				}),
		},
		status: NotificationStatus.SENT,
		createdAt: new Date(),
		updatedAt: new Date(),
		sentAt: new Date(),
		createdBy: "system", // Auto-generated
		totalTargetUsers: calculateTargetUserCount({
			type: targetType,
			...(targetType === NotificationTargetType.STORE_FOLLOWERS &&
				entityId && {
					storeId: entityId,
				}),
		}),
		deliveredCount: 0,
		readCount: 0,
	};

	// Simulate delivery metrics
	newNotification.deliveredCount = newNotification.totalTargetUsers;
	newNotification.readCount = Math.floor((newNotification.totalTargetUsers || 0) * 0.6); // 60% read rate

	return newNotification;
};

// Auto-notification generators for different events
export const generateNewStoreNotification = (storeName: string, storeId: string) => {
	const notification = createAutoNotification(
		NotificationType.NEW_STORE,
		`New Store: ${storeName}`,
		`A new store "${storeName}" has joined our platform! Check out their collections and exclusive offers.`,
		NotificationTargetType.ALL_USERS,
		storeId,
	);

	mockNotifications.unshift(notification);
	return notification;
};

export const generateNewCollectionNotification = (collectionName: string, storeName: string, storeId: string) => {
	const notification = createAutoNotification(
		NotificationType.NEW_COLLECTION,
		`New Collection: ${collectionName}`,
		`${storeName} just launched a new collection "${collectionName}". Discover the latest products now!`,
		NotificationTargetType.STORE_FOLLOWERS,
		storeId,
	);

	mockNotifications.unshift(notification);
	return notification;
};

export const generateDiscountNotification = (
	flyerTitle: string,
	discountPercent: number,
	storeName: string,
	storeId: string,
) => {
	const notification = createAutoNotification(
		NotificationType.DISCOUNT_ADDED,
		`🔥 ${discountPercent}% OFF - ${flyerTitle}`,
		`Don't miss out! ${storeName} is offering ${discountPercent}% discount on "${flyerTitle}". Limited time offer!`,
		NotificationTargetType.STORE_FOLLOWERS,
		storeId,
	);

	mockNotifications.unshift(notification);
	return notification;
};

// Get all notifications with filtering and pagination
export const getNotifications = http.get(NotificationApi.LIST, ({ request }) => {
	const url = new URL(request.url);
	const search = url.searchParams.get("search")?.toLowerCase();
	const type = url.searchParams.get("type") as NotificationType;
	const status = url.searchParams.get("status") as NotificationStatus;
	const targetType = url.searchParams.get("targetType");
	const dateFrom = url.searchParams.get("dateFrom");
	const dateTo = url.searchParams.get("dateTo");

	// Get pagination parameters
	const paginationParams = getPaginationParams(request);

	let filteredNotifications = [...mockNotifications];

	// Apply search filter (title and message)
	if (search) {
		filteredNotifications = filteredNotifications.filter(
			(notification) =>
				notification.title.toLowerCase().includes(search) || notification.message.toLowerCase().includes(search),
		);
	}

	// Apply type filter
	if (type) {
		filteredNotifications = filteredNotifications.filter((notification) => notification.type === type);
	}

	// Apply status filter
	if (status) {
		filteredNotifications = filteredNotifications.filter((notification) => notification.status === status);
	}

	// Apply target type filter
	if (targetType) {
		filteredNotifications = filteredNotifications.filter((notification) => notification.target.type === targetType);
	}

	// Apply date range filters
	if (dateFrom) {
		const fromDate = new Date(dateFrom);
		filteredNotifications = filteredNotifications.filter(
			(notification) => new Date(notification.createdAt) >= fromDate,
		);
	}

	if (dateTo) {
		const toDate = new Date(dateTo);
		filteredNotifications = filteredNotifications.filter((notification) => new Date(notification.createdAt) <= toDate);
	}

	// Sort by creation date (newest first)
	const sortedNotifications = filteredNotifications.sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	);

	// Apply pagination
	const paginatedData = paginateArray(sortedNotifications, paginationParams);

	return HttpResponse.json({
		status: 0,
		message: "Success",
		data: paginatedData,
	});
});

// Create a new notification
export const createNotification = http.post(NotificationApi.CREATE, async ({ request }) => {
	const notificationData = (await request.json()) as CreateNotificationRequest;

	const newNotification: Notification = {
		id: faker.string.uuid(),
		...notificationData,
		status: notificationData.scheduledFor ? NotificationStatus.SCHEDULED : NotificationStatus.DRAFT,
		createdAt: new Date(),
		updatedAt: new Date(),
		createdBy: "admin-1", // In real app, this would come from auth context
		totalTargetUsers: calculateTargetUserCount(notificationData.target),
	};

	// If scheduled for immediate delivery, mark as sent
	if (!notificationData.scheduledFor) {
		newNotification.status = NotificationStatus.SENT;
		newNotification.sentAt = new Date();
		newNotification.deliveredCount = newNotification.totalTargetUsers;
		newNotification.readCount = Math.floor((newNotification.totalTargetUsers || 0) * 0.7); // 70% read rate
	}

	mockNotifications.unshift(newNotification);

	return HttpResponse.json({
		status: 0,
		message: "Notification created successfully",
		data: newNotification,
	});
});

// Update notification (only draft/scheduled can be updated)
export const updateNotification = http.put(NotificationApi.UPDATE, async ({ request, params }) => {
	const id = params.id as string;
	const updateData = (await request.json()) as UpdateNotificationRequest;

	const notificationIndex = mockNotifications.findIndex((notification) => notification.id === id);

	if (notificationIndex === -1) {
		return HttpResponse.json(
			{
				status: 1,
				message: "Notification not found",
			},
			{ status: 404 },
		);
	}

	const notification = mockNotifications[notificationIndex];

	// Only allow updates for draft and scheduled notifications
	if (notification.status !== NotificationStatus.DRAFT && notification.status !== NotificationStatus.SCHEDULED) {
		return HttpResponse.json(
			{
				status: 1,
				message: "Cannot update notification that has already been sent or cancelled",
			},
			{ status: 400 },
		);
	}

	// Update notification
	mockNotifications[notificationIndex] = {
		...notification,
		...updateData,
		updatedAt: new Date(),
		status: updateData.scheduledFor ? NotificationStatus.SCHEDULED : NotificationStatus.DRAFT,
		totalTargetUsers: updateData.target ? calculateTargetUserCount(updateData.target) : notification.totalTargetUsers,
	};

	return HttpResponse.json({
		status: 0,
		message: "Notification updated successfully",
		data: mockNotifications[notificationIndex],
	});
});

// Get notification by ID
export const getNotificationById = http.get(NotificationApi.GET_BY_ID, ({ params }) => {
	const id = params.id as string;
	const notification = mockNotifications.find((notification) => notification.id === id);

	if (!notification) {
		return HttpResponse.json(
			{
				status: 1,
				message: "Notification not found",
			},
			{ status: 404 },
		);
	}

	return HttpResponse.json({
		status: 0,
		message: "Success",
		data: notification,
	});
});

// Delete notification (only draft/scheduled can be deleted)
export const deleteNotification = http.delete(NotificationApi.DELETE, ({ params }) => {
	const id = params.id as string;

	const notificationIndex = mockNotifications.findIndex((notification) => notification.id === id);

	if (notificationIndex === -1) {
		return HttpResponse.json(
			{
				status: 1,
				message: "Notification not found",
			},
			{ status: 404 },
		);
	}

	const notification = mockNotifications[notificationIndex];

	// Only allow deletion for draft and scheduled notifications
	if (notification.status !== NotificationStatus.DRAFT && notification.status !== NotificationStatus.SCHEDULED) {
		return HttpResponse.json(
			{
				status: 1,
				message: "Cannot delete notification that has already been sent or cancelled",
			},
			{ status: 400 },
		);
	}

	mockNotifications.splice(notificationIndex, 1);

	return HttpResponse.json({
		status: 0,
		message: "Notification deleted successfully",
	});
});

// Cancel scheduled notification
export const cancelNotification = http.post(NotificationApi.CANCEL, ({ params }) => {
	const id = params.id as string;

	const notificationIndex = mockNotifications.findIndex((notification) => notification.id === id);

	if (notificationIndex === -1) {
		return HttpResponse.json(
			{
				status: 1,
				message: "Notification not found",
			},
			{ status: 404 },
		);
	}

	const notification = mockNotifications[notificationIndex];

	// Only allow cancellation for scheduled notifications
	if (notification.status !== NotificationStatus.SCHEDULED) {
		return HttpResponse.json(
			{
				status: 1,
				message: "Can only cancel scheduled notifications",
			},
			{ status: 400 },
		);
	}

	mockNotifications[notificationIndex] = {
		...notification,
		status: NotificationStatus.CANCELLED,
		updatedAt: new Date(),
	};

	return HttpResponse.json({
		status: 0,
		message: "Notification cancelled successfully",
		data: mockNotifications[notificationIndex],
	});
});

// Send notification immediately (convert scheduled to sent)
export const sendNotificationNow = http.post(NotificationApi.SEND_NOW, ({ params }) => {
	const id = params.id as string;

	const notificationIndex = mockNotifications.findIndex((notification) => notification.id === id);

	if (notificationIndex === -1) {
		return HttpResponse.json(
			{
				status: 1,
				message: "Notification not found",
			},
			{ status: 404 },
		);
	}

	const notification = mockNotifications[notificationIndex];

	// Only allow sending for scheduled notifications
	if (notification.status !== NotificationStatus.SCHEDULED) {
		return HttpResponse.json(
			{
				status: 1,
				message: "Can only send scheduled notifications",
			},
			{ status: 400 },
		);
	}

	const now = new Date();
	mockNotifications[notificationIndex] = {
		...notification,
		status: NotificationStatus.SENT,
		sentAt: now,
		updatedAt: now,
		deliveredCount: notification.totalTargetUsers,
		readCount: Math.floor((notification.totalTargetUsers || 0) * 0.7), // 70% read rate
	};

	return HttpResponse.json({
		status: 0,
		message: "Notification sent successfully",
		data: mockNotifications[notificationIndex],
	});
});

// Get notification statistics
export const getNotificationStatsHandler = http.get(NotificationApi.STATS, () => {
	const stats = getNotificationStats();

	return HttpResponse.json({
		status: 0,
		message: "Success",
		data: stats,
	});
});
