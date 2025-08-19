import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Button } from "@/ui/button";
import { Icon } from "@/components/icon";
import type { UserFilters } from "@/types/user";
import { UserStatus, USER_STATUS_LABELS } from "@/types/user";

interface UserFiltersProps {
	filters: UserFilters;
	onFiltersChange: (filters: UserFilters) => void;
	onReset: () => void;
}

export function UserFiltersComponent({ filters, onFiltersChange, onReset }: UserFiltersProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">Filter Users</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{/* Search Input */}
					<Input
						placeholder="Search by first name, last name or email..."
						value={filters.search || ""}
						onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
						className="max-w-sm"
					/>

					{/* Status Filter */}
					<Select
						value={filters.status !== undefined ? filters.status.toString() : "all"}
						onValueChange={(value) =>
							onFiltersChange({
								...filters,
								status: value === "all" ? undefined : (parseInt(value) as UserStatus),
							})
						}
					>
						<SelectTrigger>
							<SelectValue placeholder="All statuses" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All statuses</SelectItem>
							{Object.entries(USER_STATUS_LABELS).map(([key, label]) => (
								<SelectItem key={key} value={key}>
									{label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>


					{/* City Filter */}
					{/* <Input
						placeholder="City..."
						value={filters.city || ""}
						onChange={(e) => onFiltersChange({ ...filters, city: e.target.value })}
						className="max-w-sm"
					/> */}

					{/* Reset Button */}
					<Button variant="outline" onClick={onReset}>
						<Icon icon="solar:restart-bold" size={16} className="mr-2" />
						Reset Filters
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
