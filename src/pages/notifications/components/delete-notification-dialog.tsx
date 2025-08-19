import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Icon } from "@/components/icon";
import type { Notification } from "@/types/notification";
import { NOTIFICATION_TYPE_LABELS, NOTIFICATION_STATUS_LABELS } from "@/types/notification";

interface DeleteNotificationDialogProps {
	notification: Notification | null;
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	isLoading?: boolean;
}

export function DeleteNotificationDialog({
	notification,
	isOpen,
	onClose,
	onConfirm,
	isLoading = false,
}: DeleteNotificationDialogProps) {
	if (!notification) return null;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Icon icon="solar:trash-bin-trash-bold" className="h-5 w-5 text-red-500" />
						Delete Notification
					</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete this notification? This action cannot be undone.
					</DialogDescription>
				</DialogHeader>

				{/* Notification Details */}
				<div className="py-4 space-y-3">
					<div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2">
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium text-gray-600 dark:text-gray-400">Type:</span>
							<span className="text-sm">{NOTIFICATION_TYPE_LABELS[notification.type]}</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</span>
							<span className="text-sm">{NOTIFICATION_STATUS_LABELS[notification.status]}</span>
						</div>
					</div>

					<div>
						<h4 className="font-medium text-sm mb-1">Title:</h4>
						<p className="text-sm text-gray-600 dark:text-gray-400">{notification.title}</p>
					</div>

					<div>
						<h4 className="font-medium text-sm mb-1">Message:</h4>
						<p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{notification.message}</p>
					</div>

					{/* {notification.scheduledFor && (
						<div>
							<h4 className="font-medium text-sm mb-1">Scheduled for:</h4>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								{new Date(notification.scheduledFor).toLocaleString()}
							</p>
						</div>
					)} */}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={onClose} disabled={isLoading}>
						Cancel
					</Button>
					<Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
						{isLoading ? (
							<>
								<Icon icon="solar:refresh-bold" className="mr-2 h-4 w-4 animate-spin" />
								Deleting...
							</>
						) : (
							<>
								<Icon icon="solar:trash-bin-trash-bold" className="mr-2 h-4 w-4" />
								Delete Notification
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
