import { http } from "msw";
import { getPaginationParams, paginateArray } from "../utils";
import { getSharedFlyers } from "../shared-data";

// API endpoints for flyers
const FlyerApi = {
	GET_ALL_FLYERS: "/api/flyers",
	GET_FLYER: "/api/flyers/:id",
};

// Get all flyers with pagination
export const getAllFlyers = http.get(FlyerApi.GET_ALL_FLYERS, ({ request }) => {
	const url = new URL(request.url);
	const paginationParams = getPaginationParams(request);
	const activeOnly = url.searchParams.get("activeOnly") === "true";

	let flyers = [...getSharedFlyers()];

	// Filter active flyers if requested
	if (activeOnly) {
		const now = new Date();
		flyers = flyers.filter((flyer) => {
			const startDate = new Date(flyer.startDate);
			const endDate = new Date(flyer.endDate);
			return now >= startDate && now <= endDate;
		});
	}

	// Sort by creation date (newest first)
	const sortedFlyers = flyers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

	const paginatedData = paginateArray(sortedFlyers, paginationParams);

	return Response.json({
		code: 0,
		message: "Success",
		data: paginatedData,
	});
});

// Get single flyer by ID
export const getFlyer = http.get(FlyerApi.GET_FLYER, ({ params }) => {
	const id = params.id as string;
	const flyer = getSharedFlyers().find((f) => f.id === id);

	if (!flyer) {
		return Response.json(
			{
				code: 404,
				message: "Flyer not found",
				data: null,
			},
			{ status: 404 },
		);
	}

	return Response.json({
		code: 0,
		message: "Success",
		data: flyer,
	});
});

// Export all flyer handlers
export const flyerHandlers = [getAllFlyers, getFlyer];
