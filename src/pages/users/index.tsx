import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "@/routes/hooks";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Icon } from "@/components/icon";
import { toast } from "sonner";
import { m } from "motion/react";
import { varFade } from "@/components/animate/variants/fade";
import type { User, UserFilters } from "@/types/user";
import { UserStatus, USER_STATUS_LABELS } from "@/types/user";
import { UserFiltersComponent } from "./components/user-filters";
import { SuspendUserDialog } from "./components/suspend-user-dialog";

/**
 * Users Management Page Component
 * Shows all app users with filtering, search, and suspend/activate functionality
 */
export default function Users() {
	const [users, setUsers] = useState<User[]>([]);
	const [filters, setFilters] = useState<UserFilters>({});
	const [isLoading, setIsLoading] = useState(true);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalUsers, setTotalUsers] = useState(0);
	const [suspendDialogUser, setSuspendDialogUser] = useState<User | null>(null);
	const { push } = useRouter();
	const observerRef = useRef<IntersectionObserver | null>(null);
	const loadMoreRef = useRef<HTMLDivElement | null>(null);

	// Fetch users with pagination
	const fetchUsers = useCallback(
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

				if (filters.search) params.set("search", filters.search);
				if (filters.status !== undefined) params.set("status", filters.status.toString());
				if (filters.city) params.set("city", filters.city);

				const response = await fetch(`/api/app-users?${params.toString()}`);
				const data = await response.json();

				if (data.status === 0) {
					const { list, total, totalPages } = data.data;

					if (append) {
						setUsers((prev) => [...prev, ...list]);
					} else {
						setUsers(list);
					}

					setTotalUsers(total);
					setHasMore(page < totalPages);
					setCurrentPage(page);
				}
			} catch (error) {
				console.error("Error fetching users:", error);
				toast.error("Failed to load users");
			} finally {
				setIsLoading(false);
				setIsLoadingMore(false);
			}
		},
		[filters],
	);

	// Handle user suspend
	const handleSuspendUser = async (user: User) => {
		try {
			const response = await fetch(`/api/app-users/${user.id}/suspend`, {
				method: "POST",
			});
			const data = await response.json();

			if (data.status === 0) {
				setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: UserStatus.SUSPENDED } : u)));
				toast.success(`${user.firstName} ${user.lastName} has been suspended`);
			} else {
				toast.error(data.message || "Failed to suspend user");
			}
		} catch (error) {
			console.error("Error suspending user:", error);
			toast.error("Failed to suspend user");
		} finally {
			setSuspendDialogUser(null);
		}
	};

	// Handle user activate
	const handleActivateUser = async (user: User) => {
		try {
			const response = await fetch(`/api/app-users/${user.id}/activate`, {
				method: "POST",
			});
			const data = await response.json();

			if (data.status === 0) {
				setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: UserStatus.ACTIVE } : u)));
				toast.success(`${user.firstName} ${user.lastName} has been activated`);
			} else {
				toast.error(data.message || "Failed to activate user");
			}
		} catch (error) {
			console.error("Error activating user:", error);
			toast.error("Failed to activate user");
		}
	};

	// Get user status badge variant
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

	// Handle navigate to user detail page
	const handleViewUserDetails = (user: User) => {
		push(`/users/${user.id}`);
	};

	// Reset filters
	const handleResetFilters = () => {
		setFilters({});
	};

	// Load more users when intersection observer triggers
	const loadMoreUsers = useCallback(() => {
		if (!isLoadingMore && hasMore) {
			fetchUsers(currentPage + 1, true);
		}
	}, [currentPage, hasMore, isLoadingMore, fetchUsers]);

	// Set up intersection observer for infinite scrolling
	useEffect(() => {
		if (observerRef.current) {
			observerRef.current.disconnect();
		}

		observerRef.current = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
					loadMoreUsers();
				}
			},
			{ threshold: 0.1 },
		);

		if (loadMoreRef.current) {
			observerRef.current.observe(loadMoreRef.current);
		}

		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
			}
		};
	}, [loadMoreUsers, hasMore, isLoadingMore]);

	// Fetch users on mount and filter changes
	useEffect(() => {
		setCurrentPage(1);
		setHasMore(true);
		fetchUsers(1, false);
	}, [fetchUsers]);

	return (
		<div className="h-screen flex flex-col p-6">
			{/* Filters */}
			<div className="flex-shrink-0 mb-4">
				<UserFiltersComponent filters={filters} onFiltersChange={setFilters} onReset={handleResetFilters} />
			</div>

			{/* Users List */}
			<Card className="flex-1 flex flex-col min-h-0">
				<CardHeader className="flex-shrink-0">
					<CardTitle className="text-lg">
						Users
					</CardTitle>
				</CardHeader>
				<CardContent className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<Icon icon="solar:refresh-bold" className="mr-2 h-5 w-5 animate-spin text-primary" />
							<span className="text-text-secondary">Loading users...</span>
						</div>
					) : users.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12">
							<Icon
								icon="solar:users-group-two-rounded-outline"
								size={48}
								className="text-gray-400 dark:text-gray-600 mb-4"
							/>
							<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No users found</h3>
							<p className="text-gray-500 dark:text-gray-400 text-center">
								{Object.keys(filters).length > 0
									? "No users match your current filters."
									: "No users have signed up yet."}
							</p>
						</div>
					) : (
						<div className="space-y-4 relative">
							{users.map((user) => (
								<m.div
									key={user.id}
									initial="initial"
									whileInView="animate"
									viewport={{ once: true, amount: 0.2 }}
									variants={varFade({ distance: 30 }).inUp}
									className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-gray-900 relative gap-4"
								>
									<div className="flex items-center space-x-4 flex-1 min-w-0">
										{/* Profile Image */}
										<div className="flex-shrink-0">
											<img
												src={user.profileImage}
												alt={`${user.firstName} ${user.lastName}`}
												className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
											/>
										</div>

										{/* User Info */}
										<div className="flex-grow min-w-0">
											<div className="flex items-center gap-2 flex-wrap">
												<h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user.firstName} {user.lastName}</h3>
												<Badge variant={getStatusBadgeVariant(user.status)}>{USER_STATUS_LABELS[user.status]}</Badge>
											</div>
											<p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
											<div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
												<span className="whitespace-nowrap">📍 {user.location.city}</span>
												<span className="whitespace-nowrap">❤️ {user.totalLikedFlyers} flyers</span>
												<span className="whitespace-nowrap">🏪 {user.totalLikedStores} stores</span>
											</div>
										</div>
									</div>

									{/* Action Buttons */}
									<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:flex-shrink-0 w-full sm:w-auto">
										<Button variant="outline" size="sm" onClick={() => handleViewUserDetails(user)} className="w-full sm:w-auto">
											<Icon icon="solar:eye-outline" size={16} className="mr-1" />
											<span className="sm:inline">View Details</span>
										</Button>

										{user.status === UserStatus.ACTIVE ? (
											<Button
												variant="outline"
												size="sm"
												onClick={() => setSuspendDialogUser(user)}
												className="w-full sm:w-auto text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border-red-200 hover:border-red-300 dark:border-red-800 dark:hover:border-red-700"
											>
												<Icon icon="solar:forbidden-circle-outline" size={16} className="mr-1" />
												<span className="sm:inline">Suspend</span>
											</Button>
										) : user.status === UserStatus.SUSPENDED ? (
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleActivateUser(user)}
												className="w-full sm:w-auto text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 border-green-200 hover:border-green-300 dark:border-green-800 dark:hover:border-green-700"
											>
												<Icon icon="solar:check-circle-outline" size={16} className="mr-1" />
												<span className="sm:inline">Activate</span>
											</Button>
										) : null}
									</div>
								</m.div>
							))}

							{/* Infinite Scroll Trigger & Loading */}
							{hasMore && (
								<div ref={loadMoreRef} className="flex items-center justify-center py-8">
									{isLoadingMore && (
										<div className="flex items-center gap-2">
											<Icon icon="solar:refresh-bold" className="h-5 w-5 animate-spin text-primary" />
											<span className="text-text-secondary">Loading more users...</span>
										</div>
									)}
								</div>
							)}

							{/* End of List Indicator */}
							{!hasMore && users.length > 0 && (
								<div className="flex items-center justify-center py-8">
									<div className="text-center">
										<Icon
											icon="solar:check-circle-outline"
											className="h-8 w-8 text-gray-400 dark:text-gray-600 mx-auto mb-2"
										/>
										<p className="text-sm text-gray-500 dark:text-gray-400">You've reached the end of the list</p>
										<p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Showing all {totalUsers} users</p>
									</div>
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Suspend User Dialog */}
			{suspendDialogUser && (
				<SuspendUserDialog
					user={suspendDialogUser}
					isOpen={true}
					onConfirm={() => handleSuspendUser(suspendDialogUser)}
					onCancel={() => setSuspendDialogUser(null)}
				/>
			)}
		</div>
	);
}
