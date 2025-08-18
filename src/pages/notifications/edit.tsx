import { useState, useEffect } from "react";
import { useRouter, useParams } from "@/routes/hooks";
import { Button } from "@/ui/button";
import { Icon } from "@/components/icon";
import { toast } from "sonner";
import { NotificationForm } from "./components/notification-form";
import type { UpdateNotificationRequest, Notification } from "@/types/notification";
import { NotificationStatus } from "@/types/notification";

export default function EditNotification() {
	const [notification, setNotification] = useState<Notification | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isFetching, setIsFetching] = useState(true);
	const { push, back } = useRouter();
	const params = useParams();
	const notificationId = params.id as string;

	// Fetch notification data
	useEffect(() => {
		const fetchNotification = async () => {
			try {
				const response = await fetch(`/api/notifications/${notificationId}`);
				const result = await response.json();

				if (result.status === 0) {
					setNotification(result.data);

					// Check if notification can be edited
					if (result.data.status !== NotificationStatus.DRAFT && result.data.status !== NotificationStatus.SCHEDULED) {
						toast.error("This notification cannot be edited");
						push("/notifications");
						return;
					}
				} else {
					toast.error("Notification not found");
					push("/notifications");
				}
			} catch (error) {
				console.error("Error fetching notification:", error);
				toast.error("Failed to load notification");
				push("/notifications");
			} finally {
				setIsFetching(false);
			}
		};

		if (notificationId) {
			fetchNotification();
		} else {
			push("/notifications");
		}
	}, [notificationId, push]);

	const handleUpdateNotification = async (data: UpdateNotificationRequest) => {
		if (!notification) return;

		setIsLoading(true);

		try {
			const response = await fetch(`/api/notifications/${notification.id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			const result = await response.json();

			if (result.status === 0) {
				toast.success("Notification updated successfully!");
				push("/notifications");
			} else {
				toast.error(result.message || "Failed to update notification");
			}
		} catch (error) {
			console.error("Error updating notification:", error);
			toast.error("Failed to update notification");
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		back();
	};

	if (isFetching) {
		return (
			<div className="h-screen flex items-center justify-center p-6">
				<div className="flex items-center">
					<Icon icon="solar:refresh-bold" className="mr-2 h-5 w-5 animate-spin text-primary" />
					<span className="text-muted-foreground">Loading notification...</span>
				</div>
			</div>
		);
	}

	if (!notification) {
		return (
			<div className="h-screen flex items-center justify-center p-6">
				<div className="text-center">
					<Icon icon="solar:bell-off-outline" size={48} className="text-muted-foreground mx-auto mb-4" />
					<h3 className="text-lg font-semibold text-foreground mb-2">Notification not found</h3>
					<p className="text-muted-foreground mb-4">The notification you're looking for doesn't exist.</p>
					<Button onClick={() => push("/notifications")}>
						<Icon icon="solar:alt-arrow-left-outline" className="mr-2 h-4 w-4" />
						Back to Notifications
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="h-screen flex flex-col p-6">
			{/* Header */}
			<div className="flex-shrink-0 mb-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-4">
						<Button variant="ghost" size="sm" onClick={handleCancel}>
							<Icon icon="solar:alt-arrow-left-outline" className="h-4 w-4 mr-2" />
							Back
						</Button>
						<div>
							<h1 className="text-2xl font-bold text-foreground">Edit Notification</h1>
							<p className="text-muted-foreground">
								Update your {notification.status === NotificationStatus.DRAFT ? "draft" : "scheduled"} notification
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Notification Form */}
			<div className="flex-1 overflow-y-auto">
				<NotificationForm
					mode="edit"
					notification={notification}
					onSubmit={handleUpdateNotification}
					onCancel={handleCancel}
					isLoading={isLoading}
				/>
			</div>
		</div>
	);
}
