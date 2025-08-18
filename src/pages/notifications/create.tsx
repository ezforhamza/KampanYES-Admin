import { useState } from "react";
import { useRouter } from "@/routes/hooks";
import { Button } from "@/ui/button";
import { Icon } from "@/components/icon";
import { toast } from "sonner";
import { NotificationForm } from "./components/notification-form";
import type { CreateNotificationRequest } from "@/types/notification";

export default function CreateNotification() {
	const [isLoading, setIsLoading] = useState(false);
	const { push, back } = useRouter();

	const handleCreateNotification = async (data: CreateNotificationRequest) => {
		setIsLoading(true);

		try {
			const response = await fetch("/api/notifications", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			const result = await response.json();

			if (result.status === 0) {
				toast.success(data.scheduledFor ? "Notification scheduled successfully!" : "Notification sent successfully!");
				push("/notifications");
			} else {
				toast.error(result.message || "Failed to create notification");
			}
		} catch (error) {
			console.error("Error creating notification:", error);
			toast.error("Failed to create notification");
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		back();
	};

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
							<h1 className="text-2xl font-bold text-foreground">Create Notification</h1>
							<p className="text-muted-foreground">Send push notifications to your app users</p>
						</div>
					</div>
				</div>
			</div>

			{/* Notification Form */}
			<div className="flex-1 overflow-y-auto">
				<NotificationForm
					mode="create"
					onSubmit={handleCreateNotification}
					onCancel={handleCancel}
					isLoading={isLoading}
				/>
			</div>
		</div>
	);
}
