import type { RouteObject } from "react-router";
import { Navigate } from "react-router";
import { Component } from "./utils";

export const frontendDashboardRoutes: RouteObject[] = [
	{ index: true, element: <Navigate to="overview" replace /> },
	{ path: "overview", element: Component("/pages/dashboard/overview") },
	{
		path: "users",
		children: [
			{ index: true, element: Component("/pages/users") },
			{ path: ":id", element: Component("/pages/users/details") },
		],
	},
	{
		path: "stores",
		children: [
			{ index: true, element: Component("/pages/stores") },
			{ path: "create", element: Component("/pages/stores/create") },
			{ path: ":id", element: Component("/pages/stores/details") },
			{ path: ":id/edit", element: Component("/pages/stores/edit") },
		],
	},
	{
		path: "collections",
		children: [
			{ index: true, element: Component("/pages/collections") },
			{ path: "create", element: Component("/pages/collections/create") },
			{ path: ":id", element: Component("/pages/collections/details") },
			{ path: ":id/edit", element: Component("/pages/collections/edit") },
			{ path: ":id/flyers/create", element: Component("/pages/collections/flyers/create") },
			{ path: ":id/flyers/:flyerId/edit", element: Component("/pages/collections/flyers/edit") },
		],
	},
	{
		path: "flyers",
		children: [{ path: ":id", element: Component("/pages/flyers/details") }],
	},
	{
		path: "categories",
		children: [
			{ index: true, element: Component("/pages/categories") },
			{ path: "create", element: Component("/pages/categories/create") },
			{ path: ":id/edit", element: Component("/pages/categories/edit") },
		],
	},
	{
		path: "notifications",
		children: [
			{ index: true, element: Component("/pages/notifications") },
			{ path: "create", element: Component("/pages/notifications/create") },
			{ path: ":id/edit", element: Component("/pages/notifications/edit") },
		],
	},
	{ path: "terms-and-conditions", element: Component("/pages/terms-and-conditions") },
	{ path: "privacy-policy", element: Component("/pages/privacy-policy") },
	{
		path: "error",
		children: [
			{ index: true, element: <Navigate to="403" replace /> },
			{ path: "403", element: Component("/pages/sys/error/Page403") },
			{ path: "404", element: Component("/pages/sys/error/Page404") },
			{ path: "500", element: Component("/pages/sys/error/Page500") },
		],
	},
];
