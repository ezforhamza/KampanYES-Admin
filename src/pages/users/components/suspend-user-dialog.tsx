import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Button } from "@/ui/button";
import { Icon } from "@/components/icon";
import type { User } from "@/types/user";

interface SuspendUserDialogProps {
	user: User;
	isOpen: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

export function SuspendUserDialog({ user, isOpen, onConfirm, onCancel }: SuspendUserDialogProps) {
	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
			<DialogContent>
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
							<Icon icon="solar:forbidden-circle-bold" className="h-5 w-5 text-red-600" />
						</div>
						<div>
							<DialogTitle>Suspend User Account</DialogTitle>
							<DialogDescription>This action will suspend the user's account</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="py-4">
					<div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
						<img
							src={user.profileImage}
							alt={user.name}
							className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
						/>
						<div>
							<p className="font-semibold text-gray-900 dark:text-gray-100">{user.name}</p>
							<p className="text-sm text-gray-600 dark:text-gray-300">{user.email}</p>
						</div>
					</div>

					<div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
						<p className="text-sm text-yellow-800 dark:text-yellow-200">
							<strong>Warning:</strong> Suspending this user will:
						</p>
						<ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
							<li>• Prevent them from logging into the app</li>
							<li>• Block access to all app features</li>
							<li>• Keep their data intact for potential reactivation</li>
						</ul>
					</div>
				</div>

				<div className="flex items-center justify-end gap-2">
					<Button variant="outline" onClick={onCancel}>
						Cancel
					</Button>
					<Button variant="destructive" onClick={onConfirm}>
						<Icon icon="solar:forbidden-circle-outline" size={16} className="mr-2" />
						Suspend User
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
