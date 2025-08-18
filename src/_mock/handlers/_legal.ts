import { http, HttpResponse } from "msw";
import { getLegalPageById, getLegalPageByType, updateLegalPage, MOCK_LEGAL_PAGES, type LegalPage } from "../legal-data";

// GET /api/legal/:type - Get legal page by type (terms or privacy)
const getLegalPageByTypeHandler = http.get("/api/legal/:type", ({ params }) => {
	const type = params.type as string;
	
	if (type !== 'terms' && type !== 'privacy') {
		return HttpResponse.json(
			{
				status: 1,
				message: "Invalid legal page type",
				data: null
			},
			{ status: 400 }
		);
	}
	
	const legalPage = getLegalPageByType(type as 'terms' | 'privacy');
	
	if (!legalPage) {
		return HttpResponse.json(
			{
				status: 1,
				message: "Legal page not found",
				data: null
			},
			{ status: 404 }
		);
	}
	
	return HttpResponse.json({
		status: 0,
		message: "Success",
		data: legalPage,
		success: true
	});
});

// GET /api/legal/page/:id - Get legal page by ID
const getLegalPageByIdHandler = http.get("/api/legal/page/:id", ({ params }) => {
	const id = params.id as string;
	const legalPage = getLegalPageById(id);
	
	if (!legalPage) {
		return HttpResponse.json(
			{
				status: 1,
				message: "Legal page not found",
				data: null
			},
			{ status: 404 }
		);
	}
	
	return HttpResponse.json({
		status: 0,
		message: "Success",
		data: legalPage,
		success: true
	});
});

// PUT /api/legal/:type - Update legal page content
const updateLegalPageHandler = http.put("/api/legal/:type", async ({ params, request }) => {
	const type = params.type as string;
	
	if (type !== 'terms' && type !== 'privacy') {
		return HttpResponse.json(
			{
				status: 1,
				message: "Invalid legal page type",
				data: null
			},
			{ status: 400 }
		);
	}
	
	const requestBody = await request.json() as { content: string };
	
	if (!requestBody.content || typeof requestBody.content !== 'string') {
		return HttpResponse.json(
			{
				status: 1,
				message: "Content is required",
				data: null
			},
			{ status: 400 }
		);
	}
	
	// Find the page by type and get its ID
	const existingPage = getLegalPageByType(type as 'terms' | 'privacy');
	if (!existingPage) {
		return HttpResponse.json(
			{
				status: 1,
				message: "Legal page not found",
				data: null
			},
			{ status: 404 }
		);
	}
	
	const updatedPage = updateLegalPage(existingPage.id, requestBody.content);
	
	if (!updatedPage) {
		return HttpResponse.json(
			{
				status: 1,
				message: "Failed to update legal page",
				data: null
			},
			{ status: 500 }
		);
	}
	
	return HttpResponse.json({
		status: 0,
		message: "Legal page updated successfully",
		data: updatedPage,
		success: true
	});
});

// GET /api/legal - Get all legal pages
const getAllLegalPagesHandler = http.get("/api/legal", () => {
	return HttpResponse.json({
		status: 0,
		message: "Success",
		data: MOCK_LEGAL_PAGES,
		success: true
	});
});

export const legalHandlers = [
	getLegalPageByTypeHandler,
	getLegalPageByIdHandler,
	updateLegalPageHandler,
	getAllLegalPagesHandler,
];