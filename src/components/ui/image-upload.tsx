import { useRef } from "react";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { cn } from "@/utils";
import { Upload, X, Loader2 } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { getImageWithFallback } from "@/utils/image";

export interface ImageUploadProps {
	value?: string;
	onChange: (filename: string) => void;
	onRemove?: () => void;
	className?: string;
	placeholder?: string;
	accept?: string;
	disabled?: boolean;
	showPreview?: boolean;
}

export function ImageUpload({
	value,
	onChange,
	onRemove,
	className,
	placeholder = "Upload an image",
	accept = "image/*",
	disabled = false,
	showPreview = true,
}: ImageUploadProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const { uploadImage, isUploading } = useImageUpload({
		onSuccess: (filename) => {
			onChange(filename);
		},
	});

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			uploadImage(file);
		}
	};

	const handleUploadClick = () => {
		fileInputRef.current?.click();
	};

	const handleRemove = () => {
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
		onRemove?.();
	};

	return (
		<div className={cn("space-y-4", className)}>
			<div className="flex items-center gap-4">
				<Button
					type="button"
					variant="outline"
					onClick={handleUploadClick}
					disabled={disabled || isUploading}
					className="flex items-center gap-2"
				>
					{isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
					{isUploading ? "Uploading..." : placeholder}
				</Button>

				{value && onRemove && (
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={handleRemove}
						disabled={disabled || isUploading}
						className="text-red-600 hover:text-red-700"
					>
						<X className="h-4 w-4" />
					</Button>
				)}
			</div>

			{/* Preview */}
			{showPreview && value && (
				<div className="relative inline-block">
					<img
						src={getImageWithFallback(value, "store").src}
						alt="Uploaded image"
						className="h-32 w-32 rounded-lg border object-cover"
						onError={(e) => {
							e.currentTarget.src = getImageWithFallback(value, "store").fallback;
						}}
					/>
					{onRemove && (
						<Button
							type="button"
							variant="destructive"
							size="sm"
							onClick={handleRemove}
							disabled={disabled || isUploading}
							className="absolute -right-2 -top-2 h-6 w-6 rounded-full p-0"
						>
							<X className="h-3 w-3" />
						</Button>
					)}
				</div>
			)}

			{/* Hidden file input */}
			<Input
				ref={fileInputRef}
				type="file"
				accept={accept}
				onChange={handleFileChange}
				className="hidden"
				disabled={disabled || isUploading}
			/>

			{/* Show filename if no preview */}
			{!showPreview && value && <p className="text-sm text-muted-foreground">Uploaded: {value}</p>}
		</div>
	);
}
