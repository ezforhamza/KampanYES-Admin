import { Card, CardContent } from "@/ui/card";
import { Icon } from "@/components/icon";
import type { Store } from "@/types/store";
import { BasicStatus } from "@/types/enum";

interface StoreStatsProps {
	stores: Store[];
}

interface StatCardProps {
	title: string;
	value: number;
	icon: string;
	iconColor: string;
}

function StatCard({ title, value, icon, iconColor }: StatCardProps) {
	return (
		<Card>
			<CardContent className="p-4">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm text-gray-600">{title}</p>
						<p className="text-2xl font-bold">{value}</p>
					</div>
					<Icon icon={icon} size={24} className={iconColor} />
				</div>
			</CardContent>
		</Card>
	);
}

export function StoreStats({ stores }: StoreStatsProps) {
	const totalStores = stores.length;
	const activeStores = stores.filter((s) => s.status === BasicStatus.ENABLE).length;
	const inactiveStores = stores.filter((s) => s.status === BasicStatus.DISABLE).length;
	const totalFlyers = stores.reduce((acc, store) => acc + (store.activeFlyersCount || 0), 0);

	return (
		<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
			<StatCard title="Total Stores" value={totalStores} icon="solar:shop-bold-duotone" iconColor="text-blue-600" />

			<StatCard title="Active Stores" value={activeStores} icon="solar:check-circle-bold" iconColor="text-green-600" />

			<StatCard
				title="Inactive Stores"
				value={inactiveStores}
				icon="solar:close-circle-bold"
				iconColor="text-red-600"
			/>

			<StatCard title="Total Flyers" value={totalFlyers} icon="solar:document-add-bold" iconColor="text-purple-600" />
		</div>
	);
}
