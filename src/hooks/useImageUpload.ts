import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import uploadService from "@/api/services/uploadService";

export interface UseImageUploadOptions {
	onSuccess?: (filename: string) => void;
	onError?: (error: Error) => void;
	showToast?: boolean;
}

/**
 * Hook for uploading a single image
 */
export const useImageUpload = (options: UseImageUploadOptions = {}) => {
	const { onSuccess, onError, showToast = true } = options;

	const mutation = useMutation({
		mutationFn: uploadService.uploadImage,
		onSuccess: (response) => {
			if (showToast) {
				toast.success("Image uploaded successfully");
			}
			onSuccess?.(response.image);
		},
		onError: (error: Error) => {
			if (showToast) {
				toast.error(`Upload failed: ${error.message}`);
			}
			onError?.(error);
		},
	});

	const uploadImage = (file: File) => {
		// Validate file type
		if (!file.type.startsWith("image/")) {
			const error = new Error("Please select a valid image file");
			if (showToast) {
				toast.error(error.message);
			}
			onError?.(error);
			return Promise.reject(error);
		}

		// Validate file size (max 5MB)
		const maxSize = 5 * 1024 * 1024; // 5MB
		if (file.size > maxSize) {
			const error = new Error("Image size must be less than 5MB");
			if (showToast) {
				toast.error(error.message);
			}
			onError?.(error);
			return Promise.reject(error);
		}

		return mutation.mutateAsync(file);
	};

	return {
		uploadImage,
		isUploading: mutation.isPending,
		error: mutation.error,
		reset: mutation.reset,
	};
};

/**
 * Hook for uploading multiple images
 */
export const useMultipleImageUpload = (options: UseImageUploadOptions = {}) => {
	const { onSuccess, onError, showToast = true } = options;

	const mutation = useMutation({
		mutationFn: uploadService.uploadImages,
		onSuccess: (filenames) => {
			if (showToast) {
				toast.success(`${filenames.length} images uploaded successfully`);
			}
			// For multiple uploads, we'll pass the array as a joined string
			onSuccess?.(filenames.join(","));
		},
		onError: (error: Error) => {
			if (showToast) {
				toast.error(`Upload failed: ${error.message}`);
			}
			onError?.(error);
		},
	});

	const uploadImages = (files: File[]) => {
		// Validate all files
		for (const file of files) {
			if (!file.type.startsWith("image/")) {
				const error = new Error("All files must be valid images");
				if (showToast) {
					toast.error(error.message);
				}
				onError?.(error);
				return;
			}

			const maxSize = 5 * 1024 * 1024; // 5MB
			if (file.size > maxSize) {
				const error = new Error("All images must be less than 5MB");
				if (showToast) {
					toast.error(error.message);
				}
				onError?.(error);
				return;
			}
		}

		mutation.mutate(files);
	};

	return {
		uploadImages,
		isUploading: mutation.isPending,
		error: mutation.error,
		reset: mutation.reset,
	};
};
