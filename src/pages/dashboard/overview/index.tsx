import { useState, useEffect } from "react";
import { Card, CardContent } from "@/ui/card";
import { Icon } from "@/components/icon";
import { Badge } from "@/ui/badge";
import { Skeleton } from "@/ui/skeleton";

interface DashboardStats {
	totalStores: number;
	activeStores: number;
	totalUsers: number;
	totalCategories: number;
	totalFlyers: number;
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
				const [storesRes, usersRes, categoriesRes, collectionsRes, flyersRes] = await Promise.all([
					fetch("/api/stores?limit=100"),
					fetch("/api/app-users?limit=100"),
					fetch("/api/categories?limit=100"),
					fetch("/api/collections?limit=100"),
					fetch("/api/flyers?limit=100"),
				]);

				const [storesData, usersData, categoriesData, collectionsData, flyersData] =
					await Promise.all([
						storesRes.json(),
						usersRes.json(),
						categoriesRes.json(),
						collectionsRes.json(),
						flyersRes.json(),
					]);

				// Calculate stats from the data
				const stores = storesData.data?.list || [];
				const users = usersData.data?.list || [];
				const categories = categoriesData.data?.list || [];
				const collections = collectionsData.data?.list || [];
				const flyers = flyersData.data?.list || [];

				setStats({
					totalStores: stores.length,
					activeStores: stores.filter((s: any) => s.status === 1).length,
					totalUsers: users.length,
					totalCategories: categories.length,
					totalFlyers: flyers.length,
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
					{[...Array(4)].map((_, i) => (
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
			icon: "solar:users-group-two-rounded-bold",
			color: "bg-green-500",
		},
		{
			title: "Categories",
			value: stats.totalCategories,
			subtitle: "All categories are active",
			icon: "solar:folder-bold",
			color: "bg-purple-500",
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

		</div>
	);
}
