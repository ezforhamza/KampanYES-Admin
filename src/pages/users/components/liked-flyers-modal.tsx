import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { ScrollArea } from "@/ui/scroll-area";
import { Icon } from "@/components/icon";
import { useRouter } from "@/routes/hooks";
import type { Flyer } from "@/types/flyer";

interface LikedFlyersModalProps {
	flyers: Flyer[];
	isOpen: boolean;
	onClose: () => void;
	userName: string;
}

export function LikedFlyersModal({ flyers, isOpen, onClose, userName }: LikedFlyersModalProps) {
	const { push } = useRouter();

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const handleFlyerClick = (flyer: Flyer) => {
		// Navigate to the flyer detail page
		push(`/flyers/${flyer.id}`);
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-2xl max-h-[80vh] p-0">
				<DialogHeader className="p-6 pb-4">
					<div className="flex items-center gap-3">
						<div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
							<Icon icon="solar:heart-bold" className="h-5 w-5 text-primary" />
						</div>
						<div>
							<DialogTitle>Liked Flyers</DialogTitle>
							<DialogDescription>
								All flyers liked by {userName} ({flyers.length} total)
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<ScrollArea className="flex-1 px-6">
					<div className="space-y-4 pb-6">
						{flyers.map((flyer) => (
							<div
								key={flyer.id}
								onClick={() => handleFlyerClick(flyer)}
								className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
							>
								{/* Flyer Image */}
								<div className="flex-shrink-0">
									<img
										src={flyer.image}
										alt={flyer.name}
										className="w-16 h-16 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
									/>
								</div>

								{/* Flyer Info */}
								<div className="flex-grow min-w-0">
									<div className="flex items-start justify-between gap-2">
										<div className="flex-1 min-w-0">
											<h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{flyer.name}</h3>
											<div className="flex items-center gap-2 mt-1">
												<span className="text-lg font-bold text-primary">€{flyer.finalPrice.toFixed(2)}</span>
												<span className="text-sm text-gray-500 dark:text-gray-400 line-through">
													€{flyer.price.toFixed(2)}
												</span>
												<Badge variant="secondary" className="text-xs">
													-{flyer.discountPercentage}%
												</Badge>
											</div>
											<div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-2">
												<span className="flex items-center gap-1">
													<Icon icon="solar:calendar-outline" size={12} />
													{formatDate(flyer.startDate)} - {formatDate(flyer.endDate)}
												</span>
												<span className="flex items-center gap-1">
													<Icon icon="solar:tag-outline" size={12} />
													Collection ID: {flyer.collectionId}
												</span>
											</div>
										</div>
									</div>
								</div>

								{/* Status Badge */}
								<div className="flex-shrink-0">
									<Badge variant={flyer.status === 0 ? "default" : "secondary"} className="text-xs">
										{flyer.status === 0 ? "Active" : "Inactive"}
									</Badge>
								</div>
							</div>
						))}

						{flyers.length === 0 && (
							<div className="text-center py-8">
								<Icon icon="solar:heart-outline" size={48} className="text-gray-400 dark:text-gray-600 mx-auto mb-4" />
								<p className="text-gray-500 dark:text-gray-400">No flyers liked yet</p>
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
