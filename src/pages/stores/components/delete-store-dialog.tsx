import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Button } from "@/ui/button";
import { Icon } from "@/components/icon";
import type { Store } from "@/types/store";

interface DeleteStoreDialogProps {
	store: Store | null;
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	isLoading?: boolean;
}

export function DeleteStoreDialog({ store, open, onClose, onConfirm, isLoading }: DeleteStoreDialogProps) {
	if (!store) return null;

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-red-600">
						<Icon icon="solar:danger-circle-bold" size={24} />
						Delete Store
					</DialogTitle>
					<DialogDescription className="pt-2">
						Are you sure you want to delete <strong>{store.name}</strong>? This action cannot be undone and will
						permanently remove the store and all associated data.
					</DialogDescription>
				</DialogHeader>

				<div className="py-4">
					<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
						<div className="flex items-start gap-3">
							<Icon icon="solar:info-circle-bold" size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
							<div className="text-sm text-red-800 dark:text-red-200">
								<p className="font-medium mb-1">This will delete:</p>
								<ul className="list-disc list-inside space-y-1 text-xs">
									<li>Store information and settings</li>
									<li>All associated flyers ({store.activeFlyersCount || 0} active)</li>
									<li>Store statistics and analytics</li>
									<li>Customer reviews and ratings</li>
								</ul>
							</div>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={onClose} disabled={isLoading}>
						Cancel
					</Button>
					<Button variant="destructive" onClick={onConfirm} disabled={isLoading} className="min-w-[100px]">
						{isLoading && <Icon icon="solar:refresh-bold" className="mr-2 h-4 w-4 animate-spin" />}
						Delete Store
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
