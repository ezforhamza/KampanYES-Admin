import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Icon } from "@/components/icon";
import { useTheme } from "@/theme/hooks/use-theme";

declare global {
	interface Window {
		google: typeof google;
	}
}

interface StoreMapDisplayProps {
	/**
	 * Store location coordinates
	 */
	latitude: number;
	longitude: number;
	/**
	 * Store name for the marker
	 */
	storeName: string;
	/**
	 * Store address for display
	 */
	address: string;
	/**
	 * Optional map height (default: 300px)
	 */
	height?: number;
	/**
	 * Whether to show the card wrapper (default: true)
	 */
	showCard?: boolean;
}

export function StoreMapDisplay({
	latitude,
	longitude,
	storeName,
	address,
	height = 300,
	showCard = true,
}: StoreMapDisplayProps) {
	const mapRef = useRef<HTMLDivElement | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
	const { mode } = useTheme();

	// Dark mode styles for Google Maps
	const darkMapStyles = [
		{
			elementType: "geometry",
			stylers: [
				{
					color: "#1a1a1a",
				},
			],
		},
		{
			elementType: "labels.text.fill",
			stylers: [
				{
					color: "#d0d0d0",
				},
			],
		},
		{
			elementType: "labels.text.stroke",
			stylers: [
				{
					color: "#1a1a1a",
				},
			],
		},
		{
			featureType: "administrative",
			elementType: "geometry.stroke",
			stylers: [
				{
					color: "#4a4a4a",
				},
			],
		},
		{
			featureType: "administrative.country",
			elementType: "labels.text.fill",
			stylers: [
				{
					color: "#e0e0e0",
				},
			],
		},
		{
			featureType: "administrative.locality",
			elementType: "labels.text.fill",
			stylers: [
				{
					color: "#e0e0e0",
				},
			],
		},
		{
			featureType: "poi",
			elementType: "geometry",
			stylers: [
				{
					color: "#2a2a2a",
				},
			],
		},
		{
			featureType: "poi",
			elementType: "labels.text.fill",
			stylers: [
				{
					color: "#b0b0b0",
				},
			],
		},
		{
			featureType: "poi.park",
			elementType: "geometry",
			stylers: [
				{
					color: "#263c3f",
				},
			],
		},
		{
			featureType: "road",
			elementType: "geometry",
			stylers: [
				{
					color: "#4a4a4a",
				},
			],
		},
		{
			featureType: "road",
			elementType: "labels.text.fill",
			stylers: [
				{
					color: "#d0d0d0",
				},
			],
		},
		{
			featureType: "road.arterial",
			elementType: "geometry",
			stylers: [
				{
					color: "#555555",
				},
			],
		},
		{
			featureType: "road.highway",
			elementType: "geometry",
			stylers: [
				{
					color: "#666666",
				},
			],
		},
		{
			featureType: "road.highway",
			elementType: "labels.text.fill",
			stylers: [
				{
					color: "#f0f0f0",
				},
			],
		},
		{
			featureType: "road.local",
			elementType: "labels.text.fill",
			stylers: [
				{
					color: "#c0c0c0",
				},
			],
		},
		{
			featureType: "transit",
			elementType: "geometry",
			stylers: [
				{
					color: "#2f3948",
				},
			],
		},
		{
			featureType: "transit.station",
			elementType: "labels.text.fill",
			stylers: [
				{
					color: "#d0d0d0",
				},
			],
		},
		{
			featureType: "water",
			elementType: "geometry",
			stylers: [
				{
					color: "#17263c",
				},
			],
		},
		{
			featureType: "water",
			elementType: "labels.text.fill",
			stylers: [
				{
					color: "#9ca5b3",
				},
			],
		},
	];

	useEffect(() => {
		if (!API_KEY) {
			setError("Google Maps API key not found");
			setIsLoading(false);
			return;
		}

		if (mapRef.current) {
			const loader = new Loader({
				apiKey: API_KEY,
				version: "weekly",
				libraries: ["places", "geocoding"],
				region: "NL",
				language: "en",
			});

			loader
				.load()
				.then(() => {
					const mapInstance = new window.google.maps.Map(mapRef.current!, {
						center: { lat: latitude, lng: longitude },
						zoom: 15,
						mapTypeControl: false,
						streetViewControl: false,
						fullscreenControl: false,
						styles: mode === "dark" ? darkMapStyles : undefined,
					});

					// Add marker for the store
					const marker = new google.maps.Marker({
						position: { lat: latitude, lng: longitude },
						map: mapInstance,
						title: storeName,
					});

					// Add info window
					const infoWindow = new google.maps.InfoWindow({
						content: `
            <div style="max-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-weight: 600; color: #1f2937;">${storeName}</h3>
              <p style="margin: 0; font-size: 14px; color: #6b7280;">${address}</p>
            </div>
          `,
					});

					marker.addListener("click", () => {
						infoWindow.open(mapInstance, marker);
					});

					setIsLoading(false);
				})
				.catch((e) => {
					setError(`Failed to load Google Maps: ${e.message || "Unknown error"}`);
					setIsLoading(false);
				});
		}
	}, [latitude, longitude, storeName, address, API_KEY, mode, darkMapStyles]);

	const mapContent = (
		<div className="relative">
			{isLoading && (
				<div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10">
					<div className="flex flex-col items-center gap-2">
						<Icon icon="svg-spinners:6-dots-scale-middle" size={32} className="text-primary" />
						<p className="text-text-secondary text-sm">Loading map...</p>
					</div>
				</div>
			)}

			{error ? (
				<div className="bg-gray-100 rounded-lg p-6 text-center">
					<Icon icon="solar:danger-bold" size={48} className="text-red-500 mx-auto mb-4" />
					<p className="text-red-600 mb-2">Error loading map</p>
					<p className="text-text-secondary text-sm">{error}</p>
				</div>
			) : (
				<div ref={mapRef} className="w-full rounded-lg border" style={{ height: `${height}px` }} />
			)}
		</div>
	);

	if (!showCard) {
		return mapContent;
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg flex items-center gap-2">
					<Icon icon="solar:map-point-bold" size={20} />
					Store Location
				</CardTitle>
			</CardHeader>
			<CardContent>
				{mapContent}
				<div className="mt-3 text-sm text-text-secondary">
					<div className="flex items-start gap-2">
						<Icon icon="solar:map-point-line-duotone" size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
						<span>{address}</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
