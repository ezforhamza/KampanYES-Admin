export enum NotificationType {
	ADMIN_MESSAGE = "admin_message",
	NEW_STORE = "new_store",
	NEW_COLLECTION = "new_collection",
	DISCOUNT_ADDED = "discount_added",
}

export enum NotificationStatus {
	DRAFT = "draft",
	SCHEDULED = "scheduled",
	SENT = "sent",
	CANCELLED = "cancelled",
}

export enum NotificationTargetType {
	ALL_USERS = "all_users",
	CUSTOM_USERS = "custom_users",
}

export interface NotificationTarget {
	type: NotificationTargetType;
	userIds?: string[]; // For custom user selection
}

export interface Notification {
	id: string;
	type: NotificationType;
	title: string;
	message: string;
	target: NotificationTarget;
	status: NotificationStatus;

	// Related entities (for auto-generated notifications)
	relatedStoreId?: string;
	relatedCollectionId?: string;
	relatedFlyerId?: string;

	// Scheduling (removed - always send immediately)
	sentAt?: Date;

	// Metadata
	createdAt: Date;
	updatedAt: Date;
	createdBy: string; // Admin user ID

	// Stats (for sent notifications)
	totalTargetUsers?: number;
	deliveredCount?: number;
	readCount?: number;
}

// For creating notifications
export interface CreateNotificationRequest {
	type: NotificationType;
	title: string;
	message: string;
	target: NotificationTarget;
}

// For updating notifications (only draft can be updated)
export interface UpdateNotificationRequest {
	title?: string;
	message?: string;
	target?: NotificationTarget;
}

// For filtering notifications
export interface NotificationFilters {
	search?: string;
	type?: NotificationType;
	status?: NotificationStatus;
	targetType?: NotificationTargetType;
	dateFrom?: Date;
	dateTo?: Date;
}

// Labels for UI
export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
	[NotificationType.ADMIN_MESSAGE]: "Admin Message",
	[NotificationType.NEW_STORE]: "New Store Added",
	[NotificationType.NEW_COLLECTION]: "New Collection Added",
	[NotificationType.DISCOUNT_ADDED]: "Discount Added",
};

export const NOTIFICATION_STATUS_LABELS: Record<NotificationStatus, string> = {
	[NotificationStatus.DRAFT]: "Draft",
	[NotificationStatus.SCHEDULED]: "Scheduled",
	[NotificationStatus.SENT]: "Sent",
	[NotificationStatus.CANCELLED]: "Cancelled",
};

export const NOTIFICATION_TARGET_TYPE_LABELS: Record<NotificationTargetType, string> = {
	[NotificationTargetType.ALL_USERS]: "All Users",
	[NotificationTargetType.CUSTOM_USERS]: "Selected Users",
};
