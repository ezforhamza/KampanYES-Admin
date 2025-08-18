import { Badge } from "@/ui/badge";
import { BasicStatus } from "@/types/enum";

interface StatusBadgeProps {
	status: BasicStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
	return (
		<Badge variant={status === BasicStatus.ENABLE ? "default" : "secondary"}>
			{status === BasicStatus.ENABLE ? "Active" : "Inactive"}
		</Badge>
	);
}
