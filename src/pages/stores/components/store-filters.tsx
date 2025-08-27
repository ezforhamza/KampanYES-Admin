import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Button } from "@/ui/button";
import { Icon } from "@/components/icon";
import type { StoreFilters } from "@/types/store";
import { useCategoriesSelect } from "@/hooks/useCategoriesSelect";

interface StoreFiltersProps {
	filters: StoreFilters;
	onFiltersChange: (filters: StoreFilters) => void;
	onReset: () => void;
}

export function StoreFiltersComponent({ filters, onFiltersChange, onReset }: StoreFiltersProps) {
	const { categories, isLoading: categoriesLoading } = useCategoriesSelect();

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">Filter Stores</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					{/* Search Input */}
					<Input
						placeholder="Search stores..."
						value={filters.search || ""}
						onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
						className="max-w-sm"
					/>

					{/* Category Filter */}
					<Select
						value={filters.category || "all"}
						onValueChange={(value) =>
							onFiltersChange({
								...filters,
								category: value === "all" ? undefined : value,
							})
						}
					>
						<SelectTrigger>
							<SelectValue placeholder="All categories" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All categories</SelectItem>
							{categoriesLoading ? (
								<div className="p-2 text-center text-sm text-gray-500">Loading categories...</div>
							) : (
								categories.map((category) => (
									<SelectItem key={category._id} value={category._id}>
										{category.title}
									</SelectItem>
								))
							)}
						</SelectContent>
					</Select>

					{/* Status Filter */}
					<Select
						value={filters.status || "all"}
						onValueChange={(value) =>
							onFiltersChange({
								...filters,
								status: value === "all" ? undefined : value,
							})
						}
					>
						<SelectTrigger>
							<SelectValue placeholder="All statuses" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All statuses</SelectItem>
							<SelectItem value="active">Active</SelectItem>
							<SelectItem value="inactive">Inactive</SelectItem>
						</SelectContent>
					</Select>

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
