import { Badge } from "@/ui/badge";
import { BasicStatus } from "@/types/enum";

interface StatusBadgeProps {
	status: BasicStatus | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
	// Handle both enum (legacy) and string (backend) status values
	const isActive = status === BasicStatus.ENABLE || status === "active" || status === 1;

	return <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Active" : "Inactive"}</Badge>;
}
