import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Icon } from "@/components/icon";
import { Badge } from "@/ui/badge";
import { Skeleton } from "@/ui/skeleton";

interface DashboardStats {
	totalStores: number;
	activeStores: number;
	totalUsers: number;
	activeUsers: number;
	totalCategories: number;
	activeCategories: number;
	totalFlyers: number;
	totalSavings: number;
	avgDiscount: number;
	notificationsSent: number;
	notificationReadRate: number;
	collectionsCount: number;
}

interface StatCardProps {
	title: string;
	value: string | number;
	subtitle?: string;
	icon: string;
	color: string;
	badge?: {
		text: string;
		variant: "default" | "secondary" | "destructive" | "outline";
	};
}

const StatCard = ({ title, value, subtitle, icon, color, badge }: StatCardProps) => (
	<Card>
		<CardContent className="p-6">
			<div className="flex items-center justify-between">
				<div className="flex-1">
					<div className="flex items-center justify-between mb-2">
						<p className="text-sm font-medium text-muted-foreground">{title}</p>
						{badge && (
							<Badge variant={badge.variant} className="text-xs">
								{badge.text}
							</Badge>
						)}
					</div>
					<p className="text-2xl font-bold text-foreground">{value}</p>
					{subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
				</div>
				<div className={`p-3 rounded-lg ${color}`}>
					<Icon icon={icon} size={24} className="text-white" />
				</div>
			</div>
		</CardContent>
	</Card>
);

export default function Overview() {
	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchDashboardStats = async () => {
			try {
				setLoading(true);

				// Fetch all required data
				const [storesRes, usersRes, categoriesRes, collectionsRes, flyersRes, notificationsRes] = await Promise.all([
					fetch("/api/stores?limit=100"),
					fetch("/api/app-users?limit=100"),
					fetch("/api/categories?limit=100"),
					fetch("/api/collections?limit=100"),
					fetch("/api/flyers?limit=100"),
					fetch("/api/notifications?limit=100"),
				]);

				const [storesData, usersData, categoriesData, collectionsData, flyersData, notificationsData] =
					await Promise.all([
						storesRes.json(),
						usersRes.json(),
						categoriesRes.json(),
						collectionsRes.json(),
						flyersRes.json(),
						notificationsRes.json(),
					]);

				// Calculate stats from the data
				const stores = storesData.data?.list || [];
				const users = usersData.data?.list || [];
				const categories = categoriesData.data?.list || [];
				const collections = collectionsData.data?.list || [];
				const flyers = flyersData.data?.list || [];
				const notifications = notificationsData.data?.list || [];

				// Calculate total savings from flyers
				const totalSavings = flyers.reduce((sum: number, flyer: any) => {
					const discount = flyer.price * (flyer.discountPercentage / 100);
					return sum + discount;
				}, 0);

				// Calculate average discount
				const avgDiscount =
					flyers.length > 0
						? flyers.reduce((sum: number, flyer: any) => sum + flyer.discountPercentage, 0) / flyers.length
						: 0;

				// Calculate notification read rate
				const sentNotifications = notifications.filter((n: any) => n.status === "sent");
				const totalRead = sentNotifications.reduce((sum: number, n: any) => sum + (n.readCount || 0), 0);
				const totalDelivered = sentNotifications.reduce((sum: number, n: any) => sum + (n.deliveredCount || 0), 0);
				const readRate = totalDelivered > 0 ? (totalRead / totalDelivered) * 100 : 0;

				setStats({
					totalStores: stores.length,
					activeStores: stores.filter((s: any) => s.status === 1).length,
					totalUsers: users.length,
					activeUsers: users.filter((u: any) => u.status === 0).length, // 0 = active for users
					totalCategories: categories.length,
					activeCategories: categories.filter((c: any) => c.status === 1).length,
					totalFlyers: flyers.length,
					totalSavings: Math.round(totalSavings * 100) / 100,
					avgDiscount: Math.round(avgDiscount * 10) / 10,
					notificationsSent: sentNotifications.length,
					notificationReadRate: Math.round(readRate * 10) / 10,
					collectionsCount: collections.length,
				});
			} catch (error) {
				console.error("Failed to fetch dashboard stats:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchDashboardStats();
	}, []);

	if (loading) {
		return (
			<div className="p-6 space-y-6">
				<div>
					<h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
					<p className="text-muted-foreground mt-1">Overview of your KampanYES platform</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{[...Array(8)].map((_, i) => (
						<Card key={i}>
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div className="flex-1">
										<Skeleton className="h-4 w-24 mb-2" />
										<Skeleton className="h-8 w-16 mb-1" />
										<Skeleton className="h-3 w-20" />
									</div>
									<Skeleton className="h-12 w-12 rounded-lg" />
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	if (!stats) {
		return (
			<div className="p-6">
				<div className="text-center py-12">
					<p className="text-muted-foreground">Failed to load dashboard data</p>
				</div>
			</div>
		);
	}

	const statCards: StatCardProps[] = [
		{
			title: "Total Stores",
			value: stats.totalStores,
			subtitle: `${stats.activeStores} active`,
			icon: "solar:shop-bold",
			color: "bg-blue-500",
			badge:
				stats.activeStores === stats.totalStores
					? { text: "All Active", variant: "default" }
					: { text: `${stats.totalStores - stats.activeStores} Inactive`, variant: "secondary" },
		},
		{
			title: "Total Users",
			value: stats.totalUsers,
			subtitle: `${stats.activeUsers} active (${Math.round((stats.activeUsers / stats.totalUsers) * 100)}%)`,
			icon: "solar:users-group-two-rounded-bold",
			color: "bg-green-500",
		},
		{
			title: "Categories",
			value: stats.totalCategories,
			subtitle: `${stats.activeCategories} active categories`,
			icon: "solar:folder-bold",
			color: "bg-purple-500",
		},
		{
			title: "Active Promotions",
			value: stats.totalFlyers,
			subtitle: `Across ${stats.collectionsCount} collections`,
			icon: "solar:ticket-bold",
			color: "bg-orange-500",
		},
		{
			title: "Total Savings",
			value: `€${stats.totalSavings.toLocaleString()}`,
			subtitle: "Available to users",
			icon: "solar:money-bag-bold",
			color: "bg-emerald-500",
		},
		{
			title: "Average Discount",
			value: `${stats.avgDiscount}%`,
			subtitle: "Across all flyers",
			icon: "solar:percent-bold",
			color: "bg-red-500",
		},
		{
			title: "Notifications",
			value: stats.notificationsSent,
			subtitle: `${stats.notificationReadRate}% read rate`,
			icon: "solar:bell-bold",
			color: "bg-indigo-500",
			badge:
				stats.notificationReadRate >= 70
					? { text: "Good Rate", variant: "default" }
					: { text: "Low Rate", variant: "destructive" },
		},
		{
			title: "Collections",
			value: stats.collectionsCount,
			subtitle: `${(stats.totalFlyers / stats.collectionsCount).toFixed(1)} flyers per collection`,
			icon: "solar:gallery-bold",
			color: "bg-pink-500",
		},
	];

	return (
		<div className="p-6 space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
				<p className="text-muted-foreground mt-1">Overview of your KampanYES platform</p>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{statCards.map((card, index) => (
					<StatCard key={index} {...card} />
				))}
			</div>

			{/* Quick Insights */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg flex items-center gap-2">
						<Icon icon="solar:chart-bold" size={20} />
						Quick Insights
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						<div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
							<Icon icon="solar:target-bold" size={20} className="text-blue-500" />
							<div>
								<p className="text-sm font-medium">Store Utilization</p>
								<p className="text-xs text-muted-foreground">
									{Math.round((stats.activeStores / stats.totalCategories) * 100)}% of categories have stores
								</p>
							</div>
						</div>

						<div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
							<Icon icon="solar:graph-up-bold" size={20} className="text-green-500" />
							<div>
								<p className="text-sm font-medium">User Engagement</p>
								<p className="text-xs text-muted-foreground">
									{Math.round((stats.activeUsers / stats.totalUsers) * 100)}% users are active
								</p>
							</div>
						</div>

						<div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
							<Icon icon="solar:crown-bold" size={20} className="text-orange-500" />
							<div>
								<p className="text-sm font-medium">Content Richness</p>
								<p className="text-xs text-muted-foreground">
									{(stats.totalFlyers / stats.activeStores).toFixed(1)} flyers per active store
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
