import { useState } from "react";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Card, CardContent } from "@/ui/card";
import { Icon } from "@/components/icon";
import type { NotificationFilters } from "@/types/notification";
import {
	NotificationType,
	NotificationStatus,
	NotificationTargetType,
	NOTIFICATION_TYPE_LABELS,
	NOTIFICATION_STATUS_LABELS,
	NOTIFICATION_TARGET_TYPE_LABELS,
} from "@/types/notification";

interface NotificationFiltersComponentProps {
	filters: NotificationFilters;
	onFiltersChange: (filters: NotificationFilters) => void;
	onReset: () => void;
}

export function NotificationFiltersComponent({ filters, onFiltersChange, onReset }: NotificationFiltersComponentProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	const updateFilter = (key: keyof NotificationFilters, value: any) => {
		onFiltersChange({
			...filters,
			[key]: value || undefined,
		});
	};

	const hasActiveFilters = Object.values(filters).some((value) => value !== undefined && value !== "");

	return (
		<Card>
			<CardContent className="p-4">
				<div className="space-y-4">
					{/* Basic Filters - Always Visible */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						{/* Search */}
						<div className="space-y-2">
							<label className="text-sm font-medium">Search</label>
							<div className="relative">
								<Icon
									icon="solar:magnifer-outline"
									className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
								/>
								<Input
									placeholder="Search title or message..."
									value={filters.search || ""}
									onChange={(e) => updateFilter("search", e.target.value)}
									className="pl-9"
								/>
							</div>
						</div>

						{/* Type Filter */}
						<div className="space-y-2">
							<label className="text-sm font-medium">Type</label>
							<Select
								value={filters.type || "all"}
								onValueChange={(value) => updateFilter("type", value === "all" ? undefined : value)}
							>
								<SelectTrigger>
									<SelectValue placeholder="All types" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All types</SelectItem>
									{Object.values(NotificationType).map((type) => (
										<SelectItem key={type} value={type}>
											{NOTIFICATION_TYPE_LABELS[type]}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Status Filter */}
						<div className="space-y-2">
							<label className="text-sm font-medium">Status</label>
							<Select
								value={filters.status || "all"}
								onValueChange={(value) => updateFilter("status", value === "all" ? undefined : value)}
							>
								<SelectTrigger>
									<SelectValue placeholder="All statuses" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All statuses</SelectItem>
									{Object.values(NotificationStatus).map((status) => (
										<SelectItem key={status} value={status}>
											{NOTIFICATION_STATUS_LABELS[status]}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Target Type Filter */}
						<div className="space-y-2">
							<label className="text-sm font-medium">Target Type</label>
							<Select
								value={filters.targetType || "all"}
								onValueChange={(value) => updateFilter("targetType", value === "all" ? undefined : value)}
							>
								<SelectTrigger>
									<SelectValue placeholder="All targets" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All targets</SelectItem>
									{Object.values(NotificationTargetType).map((targetType) => (
										<SelectItem key={targetType} value={targetType}>
											{NOTIFICATION_TARGET_TYPE_LABELS[targetType]}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Advanced Filters - Collapsible */}
					{isExpanded && (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
							{/* Date From */}
							<div className="space-y-2">
								<label className="text-sm font-medium">Date From</label>
								<Input
									type="date"
									value={filters.dateFrom ? filters.dateFrom.toISOString().split("T")[0] : ""}
									onChange={(e) => updateFilter("dateFrom", e.target.value ? new Date(e.target.value) : undefined)}
								/>
							</div>

							{/* Date To */}
							<div className="space-y-2">
								<label className="text-sm font-medium">Date To</label>
								<Input
									type="date"
									value={filters.dateTo ? filters.dateTo.toISOString().split("T")[0] : ""}
									onChange={(e) => updateFilter("dateTo", e.target.value ? new Date(e.target.value) : undefined)}
								/>
							</div>
						</div>
					)}

					{/* Filter Actions */}
					<div className="flex items-center justify-between pt-2 border-t">
						<Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
							<Icon
								icon={isExpanded ? "solar:alt-arrow-up-outline" : "solar:alt-arrow-down-outline"}
								className="mr-2 h-4 w-4"
							/>
							{isExpanded ? "Less Filters" : "More Filters"}
						</Button>

						{hasActiveFilters && (
							<Button variant="outline" size="sm" onClick={onReset}>
								<Icon icon="solar:refresh-outline" className="mr-2 h-4 w-4" />
								Reset Filters
							</Button>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
