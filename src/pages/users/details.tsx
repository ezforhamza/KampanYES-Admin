import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { useRouter } from "@/routes/hooks";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Icon } from "@/components/icon";
import { toast } from "sonner";
import { useTheme } from "@/theme/hooks/use-theme";
import type { User } from "@/types/user";
import { UserStatus, USER_STATUS_LABELS, USER_LANGUAGE_LABELS } from "@/types/user";
import { UserMapDisplay } from "./components/user-map-display";
import { SuspendUserDialog } from "./components/suspend-user-dialog";
import { LikedFlyersModal } from "./components/liked-flyers-modal";
import { LikedStoresModal } from "./components/liked-stores-modal";
import { getStoresByIds, getFlyersByIds } from "@/_mock/user-data";
import type { Store } from "@/types/store";
import type { Flyer } from "@/types/flyer";

/**
 * User Detail Page Component
 * Shows detailed information about a specific user
 */
export default function UserDetails() {
	const { id } = useParams();
	const { push, back } = useRouter();
	const { mode } = useTheme();

	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
	const [likedStores, setLikedStores] = useState<Store[]>([]);
	const [likedFlyers, setLikedFlyers] = useState<Flyer[]>([]);
	const [flyersModalOpen, setFlyersModalOpen] = useState(false);
	const [storesModalOpen, setStoresModalOpen] = useState(false);

	// Fetch user details
	const fetchUser = async () => {
		if (!id) return;

		try {
			setIsLoading(true);
			const response = await fetch(`/api/app-users/${id}`);
			const data = await response.json();

			if (data.status === 0) {
				const userData = data.data;
				setUser(userData);

				// Populate liked stores and flyers data
				const userLikedStores = getStoresByIds(userData.likedStores);
				const userLikedFlyers = getFlyersByIds(userData.likedFlyers);
				setLikedStores(userLikedStores);
				setLikedFlyers(userLikedFlyers);
			} else {
				toast.error("User not found");
				push("/users");
			}
		} catch (error) {
			console.error("Error fetching user:", error);
			toast.error("Failed to load user details");
			push("/users");
		} finally {
			setIsLoading(false);
		}
	};

	// Handle user suspend
	const handleSuspendUser = async (user: User) => {
		try {
			const response = await fetch(`/api/app-users/${user.id}/suspend`, {
				method: "POST",
			});
			const data = await response.json();

			if (data.status === 0) {
				setUser((prev) => (prev ? { ...prev, status: UserStatus.SUSPENDED } : null));
				toast.success(`${user.name} has been suspended`);
			} else {
				toast.error(data.message || "Failed to suspend user");
			}
		} catch (error) {
			console.error("Error suspending user:", error);
			toast.error("Failed to suspend user");
		} finally {
			setSuspendDialogOpen(false);
		}
	};

	// Handle user activate
	const handleActivateUser = async () => {
		if (!user) return;

		try {
			const response = await fetch(`/api/app-users/${user.id}/activate`, {
				method: "POST",
			});
			const data = await response.json();

			if (data.status === 0) {
				setUser((prev) => (prev ? { ...prev, status: UserStatus.ACTIVE } : null));
				toast.success(`${user.name} has been activated`);
			} else {
				toast.error(data.message || "Failed to activate user");
			}
		} catch (error) {
			console.error("Error activating user:", error);
			toast.error("Failed to activate user");
		}
	};

	// Format date helper
	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	// Get status badge variant
	const getStatusBadgeVariant = (status: UserStatus) => {
		switch (status) {
			case UserStatus.ACTIVE:
				return "default";
			case UserStatus.SUSPENDED:
				return "destructive";
			default:
				return "outline";
		}
	};

	// Handle flyer click
	const handleFlyerClick = (flyer: Flyer) => {
		push(`/flyers/${flyer.id}`);
	};

	// Handle store click
	const handleStoreClick = (store: Store) => {
		push(`/stores/${store.id}`);
	};

	useEffect(() => {
		fetchUser();
	}, [id]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="flex flex-col items-center gap-2">
					<Icon icon="solar:refresh-bold" className="h-8 w-8 animate-spin text-primary" />
					<p className="text-text-secondary">Loading user details...</p>
				</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[400px]">
				<Icon icon="solar:users-group-two-rounded-outline" size={64} className="text-gray-400 mb-4" />
				<h3 className="text-lg font-semibold text-gray-900 mb-2">User not found</h3>
				<p className="text-gray-500 text-center mb-4">The user you're looking for doesn't exist or has been removed.</p>
				<Button onClick={() => back()}>
					<Icon icon="solar:arrow-left-outline" size={16} className="mr-2" />
					Go Back
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button variant="outline" onClick={() => back()}>
						<Icon icon="solar:arrow-left-outline" size={16} className="mr-2" />
						Back
					</Button>
					<div className="flex items-center gap-3">
						<img
							src={user.profileImage}
							alt={user.name}
							className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
						/>
						<div>
							<div className="flex items-center gap-2">
								<h1 className="text-2xl font-bold text-text-primary">{user.name}</h1>
								<Badge variant={getStatusBadgeVariant(user.status)}>{USER_STATUS_LABELS[user.status]}</Badge>
							</div>
							<p className="text-text-secondary">{user.email}</p>
						</div>
					</div>
				</div>
				<div className="flex items-center gap-2">
					{user.status === UserStatus.ACTIVE ? (
						<Button
							variant="outline"
							onClick={() => setSuspendDialogOpen(true)}
							className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
						>
							<Icon icon="solar:forbidden-circle-outline" size={16} className="mr-2" />
							Suspend User
						</Button>
					) : user.status === UserStatus.SUSPENDED ? (
						<Button
							variant="outline"
							onClick={handleActivateUser}
							className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
						>
							<Icon icon="solar:check-circle-outline" size={16} className="mr-2" />
							Activate User
						</Button>
					) : null}
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Basic Information */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Icon icon="solar:user-bold" size={20} />
							Basic Information
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="text-sm font-medium text-text-secondary">Email</label>
								<p className="text-text-primary font-medium">{user.email}</p>
							</div>
							<div>
								<label className="text-sm font-medium text-text-secondary">Language</label>
								<p className="text-text-primary font-medium">
									{USER_LANGUAGE_LABELS[user.language]} ({user.language.toUpperCase()})
								</p>
							</div>
						</div>

						<div>
							<label className="text-sm font-medium text-text-secondary">Profile Image</label>
							<div className="mt-2">
								<img
									src={user.profileImage}
									alt={user.name}
									className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="text-sm font-medium text-text-secondary">Account Created</label>
								<p className="text-text-primary">{formatDate(user.createdAt)}</p>
							</div>
							{user.lastLoginAt && (
								<div>
									<label className="text-sm font-medium text-text-secondary">Last Login</label>
									<p className="text-text-primary">{formatDate(user.lastLoginAt)}</p>
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Activity & Engagement */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Icon icon="solar:heart-bold" size={20} />
							Activity & Engagement
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="grid grid-cols-2 gap-4">
							<div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
								<div className="text-2xl font-bold text-text-primary">{user.totalLikedFlyers}</div>
								<div className="text-sm text-text-secondary">Liked Flyers</div>
							</div>
							<div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
								<div className="text-2xl font-bold text-text-primary">{user.totalLikedStores}</div>
								<div className="text-sm text-text-secondary">Liked Stores</div>
							</div>
						</div>

						{(likedFlyers.length > 0 || likedStores.length > 0) && (
							<div className="space-y-4">
								{likedFlyers.length > 0 && (
									<div>
										<div className="flex items-center justify-between mb-2">
											<label className="text-sm font-medium text-text-secondary">Liked Flyers</label>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => setFlyersModalOpen(true)}
												className="text-xs h-auto p-1"
											>
												<Icon icon="solar:eye-outline" size={12} className="mr-1" />
												View All ({likedFlyers.length})
											</Button>
										</div>
										<div className="space-y-2">
											{likedFlyers.slice(0, 4).map((flyer) => (
												<div
													key={flyer.id}
													onClick={() => handleFlyerClick(flyer)}
													className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
												>
													<img src={flyer.image} alt={flyer.name} className="w-10 h-10 rounded object-cover" />
													<div className="flex-1 min-w-0">
														<p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
															{flyer.name}
														</p>
														<p className="text-xs text-gray-500 dark:text-gray-400">
															€{flyer.finalPrice} <span className="line-through text-gray-400">€{flyer.price}</span>
														</p>
													</div>
													<Badge variant="secondary" className="text-xs">
														-{flyer.discountPercentage}%
													</Badge>
												</div>
											))}
											{likedFlyers.length > 4 && (
												<p className="text-xs text-gray-500 dark:text-gray-400 text-center">
													+{likedFlyers.length - 4} more flyers
												</p>
											)}
										</div>
									</div>
								)}

								{likedStores.length > 0 && (
									<div>
										<div className="flex items-center justify-between mb-2">
											<label className="text-sm font-medium text-text-secondary">Liked Stores</label>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => setStoresModalOpen(true)}
												className="text-xs h-auto p-1"
											>
												<Icon icon="solar:eye-outline" size={12} className="mr-1" />
												View All ({likedStores.length})
											</Button>
										</div>
										<div className="space-y-2">
											{likedStores.slice(0, 4).map((store) => (
												<div
													key={store.id}
													onClick={() => handleStoreClick(store)}
													className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
												>
													<div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
														<Icon icon="solar:shop-bold" size={20} className="text-primary" />
													</div>
													<div className="flex-1 min-w-0">
														<p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
															{store.name}
														</p>
														<p className="text-xs text-gray-500 dark:text-gray-400">
															{store.location.city} • {store.category?.replace("_", " ").toLowerCase() || "Unknown category"}
														</p>
													</div>
													<Badge variant="outline" className="text-xs">
														{store.activeFlyersCount} flyers
													</Badge>
												</div>
											))}
											{likedStores.length > 4 && (
												<p className="text-xs text-gray-500 dark:text-gray-400 text-center">
													+{likedStores.length - 4} more stores
												</p>
											)}
										</div>
									</div>
								)}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Location Information */}
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Icon icon="solar:map-point-bold" size={20} />
								Location Information
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-4">
									<div>
										<label className="text-sm font-medium text-text-secondary">Address</label>
										<p className="text-text-primary">{user.location.address}</p>
									</div>
									<div>
										<label className="text-sm font-medium text-text-secondary">City</label>
										<p className="text-text-primary">{user.location.city}</p>
									</div>
									{user.location.coordinates && (
										<div>
											<label className="text-sm font-medium text-text-secondary">Coordinates</label>
											<p className="text-text-primary">
												{user.location.coordinates.lat.toFixed(6)}, {user.location.coordinates.lng.toFixed(6)}
											</p>
											<Button
												variant="outline"
												size="sm"
												className="mt-2"
												onClick={() => {
													const url = `https://www.google.com/maps?q=${user.location.coordinates!.lat},${user.location.coordinates!.lng}`;
													window.open(url, "_blank");
												}}
											>
												<Icon icon="solar:map-point-outline" size={16} className="mr-1" />
												View on Google Maps
											</Button>
										</div>
									)}
								</div>
								{user.location.coordinates && (
									<div>
										<UserMapDisplay
											latitude={user.location.coordinates.lat}
											longitude={user.location.coordinates.lng}
											userName={user.name}
											address={user.location.address}
											height={250}
											showCard={false}
										/>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Suspend User Dialog */}
			{suspendDialogOpen && (
				<SuspendUserDialog
					user={user}
					isOpen={true}
					onConfirm={() => handleSuspendUser(user)}
					onCancel={() => setSuspendDialogOpen(false)}
				/>
			)}

			{/* Liked Flyers Modal */}
			<LikedFlyersModal
				flyers={likedFlyers}
				isOpen={flyersModalOpen}
				onClose={() => setFlyersModalOpen(false)}
				userName={user?.name || "User"}
			/>

			{/* Liked Stores Modal */}
			<LikedStoresModal
				stores={likedStores}
				isOpen={storesModalOpen}
				onClose={() => setStoresModalOpen(false)}
				userName={user?.name || "User"}
			/>
		</div>
	);
}
