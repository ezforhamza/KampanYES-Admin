import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { useCategoriesSelect } from "@/hooks/useCategoriesSelect";
import { getImageUrl } from "@/utils/image";

interface CategorySelectProps {
	value?: string;
	onValueChange?: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
	allowClear?: boolean;
}

export function CategorySelect({
	value,
	onValueChange,
	placeholder = "Select category",
	disabled = false,
	className,
	allowClear = false,
}: CategorySelectProps) {
	const { categories, isLoading } = useCategoriesSelect();

	return (
		<Select value={value || ""} onValueChange={onValueChange} disabled={disabled || isLoading}>
			<SelectTrigger className={className}>
				<SelectValue placeholder={isLoading ? "Loading categories..." : placeholder} />
			</SelectTrigger>
			<SelectContent>
				{allowClear && (
					<SelectItem value="">
						<span className="text-muted-foreground">None</span>
					</SelectItem>
				)}
				{categories.map((category) => (
					<SelectItem key={category._id} value={category._id}>
						<div className="flex items-center gap-2">
							{category.image && (
								<img src={getImageUrl(category.image)} alt={category.title} className="w-4 h-4 rounded object-cover" />
							)}
							{category.title}
						</div>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
