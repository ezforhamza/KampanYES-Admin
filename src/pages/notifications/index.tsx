import { useState, useEffect, useCallback } from "react";
import { useRouter } from "@/routes/hooks";
import { Button } from "@/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { Badge } from "@/ui/badge";
import { Icon } from "@/components/icon";
import { toast } from "sonner";
import { m } from "motion/react";
import { varFade } from "@/components/animate/variants/fade";
import type { Notification } from "@/types/notification";
import {
	NotificationStatus,
	NOTIFICATION_TYPE_LABELS,
	NOTIFICATION_STATUS_LABELS,
	NOTIFICATION_TARGET_TYPE_LABELS,
} from "@/types/notification";
import { DeleteNotificationDialog } from "./components/delete-notification-dialog";

export default function Notifications() {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalNotifications, setTotalNotifications] = useState(0);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
	const [isDeletingNotification, setIsDeletingNotification] = useState(false);
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
		[],
	);


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


	// Handle navigate to create page
	const handleCreateNotification = () => {
		push("/notifications/create");
	};


	// Fetch notifications on component mount
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
						<Button onClick={handleCreateNotification}>
							<Icon icon="solar:add-circle-bold" size={18} className="mr-2" />
							<span className="hidden sm:inline">Create Notification</span>
							<span className="sm:hidden">Create</span>
						</Button>
					</div>
				</div>
			</div>


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
							No notifications have been created yet.
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
												<div className="text-sm text-muted-foreground">{formatDate(notification.createdAt)}</div>
											</TableCell>
											<TableCell className="text-right">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleDeleteNotification(notification)}
													title="Delete notification"
													className="text-red-600 hover:text-red-700"
												>
													<Icon icon="solar:trash-bin-trash-bold" size={16} />
												</Button>
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
