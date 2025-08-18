import { useState, useEffect, useCallback } from "react";
import { useRouter } from "@/routes/hooks";
import { Button } from "@/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { Badge } from "@/ui/badge";
import { Icon } from "@/components/icon";
import { toast } from "sonner";
import { m } from "motion/react";
import { varFade } from "@/components/animate/variants/fade";
import type { Notification, NotificationFilters } from "@/types/notification";
import {
	NotificationStatus,
	NOTIFICATION_TYPE_LABELS,
	NOTIFICATION_STATUS_LABELS,
	NOTIFICATION_TARGET_TYPE_LABELS,
} from "@/types/notification";
import { NotificationFiltersComponent } from "./components/notification-filters";
import { DeleteNotificationDialog } from "./components/delete-notification-dialog";

export default function Notifications() {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [filters, setFilters] = useState<NotificationFilters>({});
	const [isLoading, setIsLoading] = useState(true);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalNotifications, setTotalNotifications] = useState(0);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
	const [isDeletingNotification, setIsDeletingNotification] = useState(false);
	// Hide filters by default on mobile, show on desktop
	const [showFilters, setShowFilters] = useState(() => {
		if (typeof window !== "undefined") {
			return window.innerWidth >= 768; // md breakpoint
		}
		return false; // Default for SSR
	});
	const { push } = useRouter();

	// Fetch notifications with pagination
	const fetchNotifications = useCallback(
		async (page: number = 1, append: boolean = false) => {
			try {
				if (page === 1) {
					setIsLoading(true);
				} else {
					setIsLoadingMore(true);
				}

				const params = new URLSearchParams();
				params.set("page", page.toString());
				params.set("limit", "20");

				if (filters.search) params.set("search", filters.search);
				if (filters.type) params.set("type", filters.type);
				if (filters.status) params.set("status", filters.status);
				if (filters.targetType) params.set("targetType", filters.targetType);
				if (filters.dateFrom) params.set("dateFrom", filters.dateFrom.toISOString());
				if (filters.dateTo) params.set("dateTo", filters.dateTo.toISOString());

				const response = await fetch(`/api/notifications?${params.toString()}`);
				const data = await response.json();

				if (data.status === 0) {
					const { list, total, totalPages } = data.data;

					if (append) {
						setNotifications((prev) => [...prev, ...list]);
					} else {
						setNotifications(list);
					}

					setTotalNotifications(total);
					setHasMore(page < totalPages);
					setCurrentPage(page);
				}
			} catch (error) {
				console.error("Error fetching notifications:", error);
				toast.error("Failed to load notifications");
			} finally {
				setIsLoading(false);
				setIsLoadingMore(false);
			}
		},
		[filters],
	);

	// Handle notification actions
	const handleCancelNotification = async (notification: Notification) => {
		try {
			const response = await fetch(`/api/notifications/${notification.id}/cancel`, {
				method: "POST",
			});
			const data = await response.json();

			if (data.status === 0) {
				setNotifications((prev) =>
					prev.map((n) => (n.id === notification.id ? { ...n, status: NotificationStatus.CANCELLED } : n)),
				);
				toast.success("Notification cancelled successfully");
			} else {
				toast.error(data.message || "Failed to cancel notification");
			}
		} catch (error) {
			console.error("Error cancelling notification:", error);
			toast.error("Failed to cancel notification");
		}
	};

	const handleSendNow = async (notification: Notification) => {
		try {
			const response = await fetch(`/api/notifications/${notification.id}/send`, {
				method: "POST",
			});
			const data = await response.json();

			if (data.status === 0) {
				setNotifications((prev) => prev.map((n) => (n.id === notification.id ? data.data : n)));
				toast.success("Notification sent successfully");
			} else {
				toast.error(data.message || "Failed to send notification");
			}
		} catch (error) {
			console.error("Error sending notification:", error);
			toast.error("Failed to send notification");
		}
	};

	const handleDeleteNotification = (notification: Notification) => {
		setSelectedNotification(notification);
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!selectedNotification) return;

		setIsDeletingNotification(true);

		try {
			const response = await fetch(`/api/notifications/${selectedNotification.id}`, {
				method: "DELETE",
			});
			const data = await response.json();

			if (data.status === 0) {
				setNotifications((prev) => prev.filter((n) => n.id !== selectedNotification.id));
				toast.success("Notification deleted successfully");
				setDeleteDialogOpen(false);
				setSelectedNotification(null);
			} else {
				toast.error(data.message || "Failed to delete notification");
			}
		} catch (error) {
			console.error("Error deleting notification:", error);
			toast.error("Failed to delete notification");
		} finally {
			setIsDeletingNotification(false);
		}
	};

	const handleCancelDelete = () => {
		setDeleteDialogOpen(false);
		setSelectedNotification(null);
	};

	// Get status badge variant
	const getStatusBadgeVariant = (status: NotificationStatus) => {
		switch (status) {
			case NotificationStatus.SENT:
				return "default";
			case NotificationStatus.SCHEDULED:
				return "secondary";
			case NotificationStatus.DRAFT:
				return "outline";
			case NotificationStatus.CANCELLED:
				return "destructive";
			default:
				return "outline";
		}
	};

	// Format date for display
	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	// Handle navigate to edit page
	const handleEditNotification = (notification: Notification) => {
		push(`/notifications/${notification.id}/edit`);
	};

	// Handle navigate to create page
	const handleCreateNotification = () => {
		push("/notifications/create");
	};

	// Reset filters
	const handleResetFilters = () => {
		setFilters({});
	};

	// Fetch notifications when filters change
	useEffect(() => {
		setCurrentPage(1);
		setHasMore(true);
		fetchNotifications(1, false);
	}, [fetchNotifications]);

	return (
		<div className="h-screen flex flex-col">
			{/* Header */}
			<div className="flex-shrink-0 p-6 pb-0">
				<div className="flex items-center justify-between mb-4">
					<div className="flex-1 min-w-0">
						<h1 className="text-2xl font-bold text-foreground">Notifications</h1>
						<p className="text-muted-foreground">Manage push notifications and messaging</p>
					</div>
					<div className="flex items-center gap-2 ml-4">
						{/* Filter Toggle Button (Mobile) */}
						<Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="md:hidden">
							<Icon
								icon={showFilters ? "solar:eye-closed-outline" : "solar:filter-outline"}
								size={16}
								className="mr-2"
							/>
							{showFilters ? "Hide" : "Filters"}
						</Button>
						<Button onClick={handleCreateNotification}>
							<Icon icon="solar:add-circle-bold" size={18} className="mr-2" />
							<span className="hidden sm:inline">Create Notification</span>
							<span className="sm:hidden">Create</span>
						</Button>
					</div>
				</div>
			</div>

			{/* Filters */}
			{showFilters && (
				<div className="flex-shrink-0 px-6 pb-4">
					<NotificationFiltersComponent filters={filters} onFiltersChange={setFilters} onReset={handleResetFilters} />
				</div>
			)}

			{/* Notifications List */}
			<div className="flex-1 overflow-y-auto px-6 pb-6 min-h-0">
				{isLoading ? (
					<div className="flex items-center justify-center py-12">
						<Icon icon="solar:refresh-bold" className="mr-2 h-5 w-5 animate-spin text-primary" />
						<span className="text-muted-foreground">Loading notifications...</span>
					</div>
				) : notifications.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-12">
						<Icon icon="solar:bell-outline" size={48} className="text-muted-foreground mb-4" />
						<h3 className="text-lg font-semibold text-foreground mb-2">No notifications found</h3>
						<p className="text-muted-foreground text-center mb-4">
							{Object.keys(filters).length > 0
								? "No notifications match your current filters."
								: "No notifications have been created yet."}
						</p>
						<Button onClick={handleCreateNotification}>
							<Icon icon="solar:add-circle-bold" size={16} className="mr-2" />
							Create First Notification
						</Button>
					</div>
				) : (
					<div className="rounded-md border">
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Type</TableHead>
										<TableHead>Title</TableHead>
										<TableHead>Target</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Scheduled</TableHead>
										<TableHead>Created</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{notifications.map((notification) => (
										<m.tr
											key={notification.id}
											initial="initial"
											whileInView="animate"
											viewport={{ once: true, amount: 0.2 }}
											variants={varFade({ distance: 30 }).inUp}
											className="cursor-pointer hover:bg-muted/50 relative"
										>
											<TableCell>
												<div className="flex items-center gap-2">
													<Icon
														icon={notification.type === "admin_message" ? "solar:megaphone-bold" : "solar:bell-bold"}
														size={16}
														className="text-muted-foreground"
													/>
													<span className="text-sm">{NOTIFICATION_TYPE_LABELS[notification.type]}</span>
												</div>
											</TableCell>
											<TableCell>
												<div className="max-w-xs">
													<div className="font-medium truncate">{notification.title}</div>
													<div className="text-sm text-muted-foreground truncate">{notification.message}</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="text-sm">
													<div>{NOTIFICATION_TARGET_TYPE_LABELS[notification.target.type]}</div>
													<div className="text-muted-foreground">{notification.totalTargetUsers} users</div>
												</div>
											</TableCell>
											<TableCell>
												<Badge variant={getStatusBadgeVariant(notification.status)}>
													{NOTIFICATION_STATUS_LABELS[notification.status]}
												</Badge>
											</TableCell>
											<TableCell>
												<div className="text-sm text-muted-foreground">
													{notification.scheduledFor ? formatDate(notification.scheduledFor) : "—"}
												</div>
											</TableCell>
											<TableCell>
												<div className="text-sm text-muted-foreground">{formatDate(notification.createdAt)}</div>
											</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end gap-2">
													{/* Edit button for draft/scheduled */}
													{(notification.status === NotificationStatus.DRAFT ||
														notification.status === NotificationStatus.SCHEDULED) && (
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleEditNotification(notification)}
															title="Edit notification"
														>
															<Icon icon="solar:pen-bold" size={16} />
														</Button>
													)}

													{/* Send now button for scheduled */}
													{notification.status === NotificationStatus.SCHEDULED && (
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleSendNow(notification)}
															title="Send now"
															className="text-green-600 hover:text-green-700"
														>
															<Icon icon="solar:play-bold" size={16} />
														</Button>
													)}

													{/* Cancel button for scheduled */}
													{notification.status === NotificationStatus.SCHEDULED && (
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleCancelNotification(notification)}
															title="Cancel notification"
															className="text-orange-600 hover:text-orange-700"
														>
															<Icon icon="solar:close-circle-bold" size={16} />
														</Button>
													)}

													{/* Delete button for draft/scheduled */}
													{(notification.status === NotificationStatus.DRAFT ||
														notification.status === NotificationStatus.SCHEDULED) && (
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleDeleteNotification(notification)}
															title="Delete notification"
															className="text-red-600 hover:text-red-700"
														>
															<Icon icon="solar:trash-bin-trash-bold" size={16} />
														</Button>
													)}
												</div>
											</TableCell>
										</m.tr>
									))}
								</TableBody>
							</Table>
						</div>

						{/* Load More */}
						{hasMore && (
							<div className="flex items-center justify-center py-8">
								{isLoadingMore ? (
									<div className="flex items-center gap-2">
										<Icon icon="solar:refresh-bold" className="h-5 w-5 animate-spin text-primary" />
										<span className="text-muted-foreground">Loading more notifications...</span>
									</div>
								) : (
									<Button variant="outline" onClick={() => fetchNotifications(currentPage + 1, true)}>
										Load More
									</Button>
								)}
							</div>
						)}

						{/* End of List Indicator */}
						{!hasMore && notifications.length > 0 && (
							<div className="flex items-center justify-center py-8">
								<div className="text-center">
									<Icon icon="solar:check-circle-outline" className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
									<p className="text-sm text-muted-foreground">You've reached the end of the list</p>
									<p className="text-xs text-muted-foreground mt-1">Showing all {totalNotifications} notifications</p>
								</div>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Delete Notification Dialog */}
			<DeleteNotificationDialog
				notification={selectedNotification}
				isOpen={deleteDialogOpen}
				onClose={handleCancelDelete}
				onConfirm={handleConfirmDelete}
				isLoading={isDeletingNotification}
			/>
		</div>
	);
}
