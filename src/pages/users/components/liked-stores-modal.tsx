import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { ScrollArea } from "@/ui/scroll-area";
import { Icon } from "@/components/icon";
import { useRouter } from "@/routes/hooks";
import type { Store } from "@/types/store";

interface LikedStoresModalProps {
	stores: Store[];
	isOpen: boolean;
	onClose: () => void;
	userName: string;
}

export function LikedStoresModal({ stores, isOpen, onClose, userName }: LikedStoresModalProps) {
	const { push } = useRouter();

	// const formatStoreCategory = (category: string) => {
	// 	return category
	// 		.replace(/_/g, " ")
	// 		.toLowerCase()
	// 		.replace(/\b\w/g, (l) => l.toUpperCase());
	// };

	const getStatusBadgeVariant = (status: number) => {
		return status === 0 ? "default" : "secondary";
	};

	const getStatusLabel = (status: number) => {
		return status === 0 ? "Active" : "Inactive";
	};

	const handleStoreClick = (store: Store) => {
		// Navigate to the store detail page
		push(`/stores/${store.id}`);
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-2xl max-h-[80vh] p-0">
				<DialogHeader className="p-6 pb-4">
					<div className="flex items-center gap-3">
						<div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
							<Icon icon="solar:shop-bold" className="h-5 w-5 text-primary" />
						</div>
						<div>
							<DialogTitle>Liked Stores</DialogTitle>
							<DialogDescription>
								All stores liked by {userName} ({stores.length} total)
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<ScrollArea className="flex-1 px-6">
					<div className="space-y-4 pb-6">
						{stores.map((store) => (
							<div
								key={store.id}
								onClick={() => handleStoreClick(store)}
								className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
							>
								{/* Store Logo/Icon */}
								<div className="flex-shrink-0">
									<div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700">
										<Icon icon="solar:shop-bold" size={24} className="text-primary" />
									</div>
								</div>

								{/* Store Info */}
								<div className="flex-grow min-w-0">
									<div className="flex items-start justify-between gap-2">
										<div className="flex-1 min-w-0">
											<h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{store.name}</h3>
											<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
												{store.category?.replace("_", " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) || 'Uncategorized'}
											</p>
											<div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-2">
												<span className="flex items-center gap-1">
													<Icon icon="solar:map-point-outline" size={12} />
													{store.location.address}, {store.location.city}
												</span>
												{store.website && (
													<span className="flex items-center gap-1">
														<Icon icon="solar:global-outline" size={12} />
														Website
													</span>
												)}
											</div>
											{store.description && (
												<p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
													{store.description}
												</p>
											)}
										</div>
									</div>
								</div>

								{/* Store Stats & Status */}
								<div className="flex-shrink-0 flex flex-col items-end gap-2">
									<Badge variant={getStatusBadgeVariant(store.status)} className="text-xs">
										{getStatusLabel(store.status)}
									</Badge>
									<div className="text-xs text-gray-500 dark:text-gray-400 text-right">
										<div className="flex items-center gap-1">
											<Icon icon="solar:ticket-outline" size={12} />
											{store.activeFlyersCount} flyers
										</div>
									</div>
								</div>
							</div>
						))}

						{stores.length === 0 && (
							<div className="text-center py-8">
								<Icon icon="solar:shop-outline" size={48} className="text-gray-400 dark:text-gray-600 mx-auto mb-4" />
								<p className="text-gray-500 dark:text-gray-400">No stores liked yet</p>
							</div>
						)}
					</div>
				</ScrollArea>

				<div className="flex items-center justify-end gap-2 p-6 pt-4 border-t border-gray-200 dark:border-gray-700">
					<Button variant="outline" onClick={onClose}>
						Close
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
