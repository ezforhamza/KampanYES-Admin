import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { useRouter } from "@/routes/hooks";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Icon } from "@/components/icon";
import { toast } from "sonner";
import type { User } from "@/types/user";
import { UserStatus, USER_STATUS_LABELS } from "@/types/user";
import { UserMapDisplay } from "./components/user-map-display";
import { SuspendUserDialog } from "./components/suspend-user-dialog";
// import { LikedFlyersModal } from "./components/liked-flyers-modal";
// import { LikedStoresModal } from "./components/liked-stores-modal";
// import { getStoresByIds, getFlyersByIds } from "@/_mock/user-data";
// import type { Store } from "@/types/store";
// import type { Flyer } from "@/types/flyer";

/**
 * User Detail Page Component
 * Shows detailed information about a specific user
 */
export default function UserDetails() {
	const { id } = useParams();
	const { push, back } = useRouter();

	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
	// const [likedStores, setLikedStores] = useState<Store[]>([]);
	// const [likedFlyers, setLikedFlyers] = useState<Flyer[]>([]);
	// const [flyersModalOpen, setFlyersModalOpen] = useState(false);
	// const [storesModalOpen, setStoresModalOpen] = useState(false);

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
				// const userLikedStores = getStoresByIds(userData.likedStores) as Store[];
				// const userLikedFlyers = getFlyersByIds(userData.likedFlyers) as Flyer[];
				// setLikedStores(userLikedStores);
				// setLikedFlyers(userLikedFlyers);
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
				toast.success(`${user.firstName} ${user.lastName} has been suspended`);
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
				toast.success(`${user.firstName} ${user.lastName} has been activated`);
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
	// const handleFlyerClick = (flyer: Flyer) => {
	// 	push(`/flyers/${flyer.id}`);
	// };

	// Handle store click
	// const handleStoreClick = (store: Store) => {
	// 	push(`/stores/${store.id}`);
	// };

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
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
			<div className="container mx-auto p-6 space-y-8">
				{/* Header with Back Button */}
				<div className="flex items-center gap-4 mb-8">
					<Button variant="outline" onClick={() => back()} className="shadow-sm">
						<Icon icon="solar:arrow-left-outline" size={16} className="mr-2" />
						Back to Users
					</Button>
				</div>

				{/* Hero Section with User Profile */}
				<div className="relative">
					<div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
						{/* Background Pattern */}
						<div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
						
						<div className="relative p-8">
							<div className="flex flex-col md:flex-row items-start md:items-center gap-6">
								{/* Profile Image */}
								<div className="relative">
									<div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-1 shadow-lg">
										<img
											src={user.profileImage}
											alt={`${user.firstName} ${user.lastName}`}
											className="w-full h-full rounded-full object-cover border-4 border-white dark:border-gray-800"
										/>
									</div>
									<div className="absolute -bottom-2 -right-2">
										<Badge 
											variant={getStatusBadgeVariant(user.status)}
											className="px-3 py-1 text-sm font-semibold shadow-lg"
										>
											{USER_STATUS_LABELS[user.status]}
										</Badge>
									</div>
								</div>

								{/* User Info */}
								<div className="flex-1 space-y-4">
									<div>
										<h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
											{user.firstName} {user.lastName}
										</h1>
										<div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
											<Icon icon="solar:letter-outline" size={18} />
											<span className="text-lg">{user.email}</span>
										</div>
									</div>

									{/* Quick Stats */}
									<div className="flex flex-wrap gap-4">
										<div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full">
											<span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
												📍 {user.location.city}
											</span>
										</div>
										<div className="bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full">
											<span className="text-sm text-green-700 dark:text-green-300 font-medium">
												📅 Joined {formatDate(user.createdAt).split(',')[0]}
											</span>
										</div>
									</div>
								</div>

								{/* Action Button */}
								<div className="flex md:flex-col gap-3">
									{user.status === UserStatus.ACTIVE ? (
										<Button
											variant="destructive"
											onClick={() => setSuspendDialogOpen(true)}
											className="shadow-lg hover:shadow-xl transition-all duration-200"
										>
											<Icon icon="solar:forbidden-circle-outline" size={18} className="mr-2" />
											Suspend User
										</Button>
									) : user.status === UserStatus.SUSPENDED ? (
										<Button
											onClick={handleActivateUser}
											className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
										>
											<Icon icon="solar:check-circle-outline" size={18} className="mr-2" />
											Activate User
										</Button>
									) : null}
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Content Grid */}
				<div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
					{/* Account Information */}
					<div className="xl:col-span-1">
						<Card className="h-fit shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
							<CardHeader className="pb-4">
								<CardTitle className="flex items-center gap-3 text-xl">
									<div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
										<Icon icon="solar:user-bold" size={20} className="text-blue-600 dark:text-blue-400" />
									</div>
									Account Details
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="space-y-4">
									<div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
										<label className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
											Account Created
										</label>
										<p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
											{formatDate(user.createdAt)}
										</p>
									</div>
									
									{user.lastLoginAt && (
										<div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
											<label className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
												Last Login
											</label>
											<p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
												{formatDate(user.lastLoginAt)}
											</p>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Location Information */}
					<div className="xl:col-span-2">
						<Card className="h-fit shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
							<CardHeader className="pb-4">
								<CardTitle className="flex items-center gap-3 text-xl">
									<div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
										<Icon icon="solar:map-point-bold" size={20} className="text-green-600 dark:text-green-400" />
									</div>
									Location & Address
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
									{/* Address Details */}
									<div className="space-y-6">
										<div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
											<label className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
												Full Address
											</label>
											<p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
												{user.location.address}
											</p>
										</div>
										
										<div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
											<label className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
												City
											</label>
											<p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
												{user.location.city}
											</p>
										</div>

										{user.location.coordinates && (
											<div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
												<label className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
													Coordinates
												</label>
												<p className="text-sm font-mono text-gray-700 dark:text-gray-300 mt-1">
													{user.location.coordinates.lat.toFixed(6)}, {user.location.coordinates.lng.toFixed(6)}
												</p>
												<Button
													variant="outline"
													size="sm"
													className="mt-3 shadow-sm hover:shadow-md transition-all duration-200"
													onClick={() => {
														const url = `https://www.google.com/maps?q=${user.location.coordinates!.lat},${user.location.coordinates!.lng}`;
														window.open(url, "_blank");
													}}
												>
													<Icon icon="solar:map-point-outline" size={16} className="mr-2" />
													View on Google Maps
												</Button>
											</div>
										)}
									</div>

									{/* Map */}
									{user.location.coordinates && (
										<div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-600">
											<UserMapDisplay
												latitude={user.location.coordinates.lat}
												longitude={user.location.coordinates.lng}
												userName={`${user.firstName} ${user.lastName}`}
												address={user.location.address}
												height={300}
												showCard={false}
											/>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</div>
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
			{/* <LikedFlyersModal
				flyers={likedFlyers}
				isOpen={flyersModalOpen}
				onClose={() => setFlyersModalOpen(false)}
				userName={user ? `${user.firstName} ${user.lastName}` : "User"}
			/> */}

			{/* Liked Stores Modal */}
			{/* <LikedStoresModal
				stores={likedStores}
				isOpen={storesModalOpen}
				onClose={() => setStoresModalOpen(false)}
				userName={user ? `${user.firstName} ${user.lastName}` : "User"}
			/> */}
		</div>
	);
}
