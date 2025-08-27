import apiClient from "../apiClient";

export interface ImageUploadResponse {
	image: string;
}

export enum UploadApi {
	IMAGE = "/uploads/image",
}

/**
 * Upload an image file to the server
 * @param file - The image file to upload
 * @returns Promise with the uploaded image filename
 */
const uploadImage = (file: File): Promise<ImageUploadResponse> => {
	const formData = new FormData();
	formData.append("image", file);

	return apiClient.post<ImageUploadResponse>({
		url: UploadApi.IMAGE,
		data: formData,
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});
};

/**
 * Upload multiple image files to the server
 * @param files - Array of image files to upload
 * @returns Promise with array of uploaded image filenames
 */
const uploadImages = async (files: File[]): Promise<string[]> => {
	const uploadPromises = files.map((file) => uploadImage(file));
	const responses = await Promise.all(uploadPromises);
	return responses.map((response) => response.image);
};

export default {
	uploadImage,
	uploadImages,
};
