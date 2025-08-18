import React, { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Icon } from "@/components/icon";
import { useTheme } from "@/theme/hooks/use-theme";

declare global {
	interface Window {
		google: typeof google;
	}
}

interface LocationPickerProps {
	onLocationSelect: (location: {
		address: string;
		city: string;
		postcode: string;
		country: string;
		latitude: number;
		longitude: number;
	}) => void;
	initialLocation?: {
		address?: string;
		latitude?: number;
		longitude?: number;
	};
}

interface SearchSuggestion {
	description: string;
	place_id: string;
}

export function LocationPicker({ onLocationSelect, initialLocation }: LocationPickerProps) {
	const mapRef = useRef<HTMLDivElement | null>(null);
	const markerRef = useRef<google.maps.Marker | null>(null);
	const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
	const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);

	const [map, setMap] = useState<google.maps.Map | null>(null);
	const [searchValue, setSearchValue] = useState(initialLocation?.address || "");
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchMessage, setSearchMessage] = useState<string | null>(null);
	const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);

	const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
	const { mode } = useTheme();

	// Helper function to extract location details from Google Places API response
	const extractLocationDetails = (place: google.maps.places.PlaceResult | google.maps.GeocoderResult) => {
		const address = place.formatted_address || "";
		let city = "";
		let postcode = "";
		let country = "";

		// Extract details from address_components
		if (place.address_components) {
			place.address_components.forEach((component) => {
				const types = component.types;

				if (types.includes("locality") || types.includes("administrative_area_level_2")) {
					city = component.long_name;
				} else if (types.includes("postal_code")) {
					postcode = component.long_name;
				} else if (types.includes("country")) {
					country = component.long_name;
				}
			});
		}

		return {
			address,
			city: city || "Unknown",
			postcode: postcode || "Unknown",
			country: country || "Unknown",
		};
	};

	// Improved dark mode styles for Google Maps - lighter and more readable
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
			featureType: "administrative.land_parcel",
			elementType: "labels.text.fill",
			stylers: [
				{
					color: "#bdbdbd",
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
			featureType: "poi.park",
			elementType: "labels.text.fill",
			stylers: [
				{
					color: "#a0a0a0",
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

	// Initialize map only once
	useEffect(() => {
		if (!API_KEY) {
			setError("Google Maps API key not found");
			setIsLoading(false);
			return;
		}

		if (mapRef.current && !map) {
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
						center: { lat: 52.3676, lng: 4.9041 }, // Temporary center
						zoom: 15,
						mapTypeControl: false,
						streetViewControl: false,
						fullscreenControl: false,
						styles: mode === "dark" ? darkMapStyles : undefined,
					});

					setMap(mapInstance);

					// Initialize services
					autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
					placesServiceRef.current = new window.google.maps.places.PlacesService(mapInstance);

					// Try to get user's current location first
					if ("geolocation" in navigator && !initialLocation?.latitude) {
						navigator.geolocation.getCurrentPosition(
							function (position) {
								var latitude = position.coords.latitude;
								var longitude = position.coords.longitude;

								// Center map on user location
								mapInstance.setCenter({ lat: latitude, lng: longitude });
								mapInstance.setZoom(15);

								// Add marker at user location
								const userLocationMarker = new google.maps.Marker({
									position: { lat: latitude, lng: longitude },
									map: mapInstance,
									draggable: true,
								});

								markerRef.current = userLocationMarker;

								// Add drag listener
								userLocationMarker.addListener("dragend", () => {
									const position = userLocationMarker.getPosition();
									if (position) {
										reverseGeocode(position.lat(), position.lng());
									}
								});

								// Get address for user location
								reverseGeocode(latitude, longitude);
							},
							function (error) {
								// If geolocation fails, use initial location or default but keep map functional
								const fallbackCenter =
									initialLocation?.latitude && initialLocation?.longitude
										? { lat: initialLocation.latitude, lng: initialLocation.longitude }
										: { lat: 52.3676, lng: 4.9041 };

								mapInstance.setCenter(fallbackCenter);

								// Add initial marker if we have coordinates
								if (initialLocation?.latitude && initialLocation?.longitude) {
									const initialMarker = new google.maps.Marker({
										position: fallbackCenter,
										map: mapInstance,
										draggable: true,
									});

									markerRef.current = initialMarker;

									initialMarker.addListener("dragend", () => {
										const position = initialMarker.getPosition();
										if (position) {
											reverseGeocode(position.lat(), position.lng());
										}
									});
								}

								// Show helpful message instead of error
								let errorMessage = "Unable to get current location";
								if (error.code === 1) errorMessage = "Location access denied";
								else if (error.code === 2) errorMessage = "Location unavailable";
								else if (error.code === 3) errorMessage = "Location request timed out";
								setSearchMessage(errorMessage + ". Please search for a location or click on the map to place a pin.");
							},
							{
								enableHighAccuracy: true,
								timeout: 10000,
								maximumAge: 300000, // 5 minutes
							},
						);
					} else if (initialLocation?.latitude && initialLocation?.longitude) {
						// Use provided initial location
						const initialCenter = { lat: initialLocation.latitude, lng: initialLocation.longitude };
						mapInstance.setCenter(initialCenter);

						const initialMarker = new google.maps.Marker({
							position: initialCenter,
							map: mapInstance,
							draggable: true,
						});

						markerRef.current = initialMarker;

						initialMarker.addListener("dragend", () => {
							const position = initialMarker.getPosition();
							if (position) {
								reverseGeocode(position.lat(), position.lng());
							}
						});
					}

					// Add click listener
					mapInstance.addListener("click", (e: google.maps.MapMouseEvent) => {
						if (!e.latLng) return;

						// Remove old marker if it exists
						if (markerRef.current) {
							markerRef.current.setMap(null);
						}

						// Add new marker
						const newMarker = new google.maps.Marker({
							position: e.latLng,
							map: mapInstance,
							draggable: true,
						});

						markerRef.current = newMarker;

						// Add drag listener
						newMarker.addListener("dragend", () => {
							const position = newMarker.getPosition();
							if (position) {
								reverseGeocode(position.lat(), position.lng());
							}
						});

						// Get address for clicked location
						reverseGeocode(e.latLng.lat(), e.latLng.lng());
					});

					setIsLoading(false);
				})
				.catch((e) => {
					setError(`Failed to load Google Maps: ${e.message || "Unknown error"}`);
					setIsLoading(false);
				});
		}
	}, []);

	// Update map styles when theme changes
	useEffect(() => {
		if (map) {
			map.setOptions({
				styles: mode === "dark" ? darkMapStyles : undefined,
			});
		}
	}, [map, mode, darkMapStyles]);

	// Get address from coordinates
	const reverseGeocode = (lat: number, lng: number) => {
		const geocoder = new window.google.maps.Geocoder();

		geocoder.geocode({ location: { lat, lng } }, (results, status) => {
			if (status === "OK" && results && results[0]) {
				const locationDetails = extractLocationDetails(results[0]);
				setSearchValue(locationDetails.address);
				setSearchMessage(null);
				onLocationSelect({
					...locationDetails,
					latitude: lat,
					longitude: lng,
				});
			}
		});
	};

	// Get search suggestions
	const getSuggestions = (input: string) => {
		if (!autocompleteServiceRef.current || input.length < 3) {
			setSuggestions([]);
			setShowSuggestions(false);
			return;
		}

		const request = {
			input,
			types: ["establishment", "geocode"],
			componentRestrictions: { country: ["nl", "de"] }, // Netherlands and Germany
		};

		autocompleteServiceRef.current.getPlacePredictions(request, (predictions, status) => {
			if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
				const suggestionData = predictions.slice(0, 5).map((prediction) => ({
					description: prediction.description,
					place_id: prediction.place_id,
				}));
				setSuggestions(suggestionData);
				setShowSuggestions(true);
			} else {
				setSuggestions([]);
				setShowSuggestions(false);
			}
		});
	};

	// Handle search input change
	const handleSearchChange = (value: string) => {
		setSearchValue(value);
		setSearchMessage(null);
		getSuggestions(value);
	};

	// Handle suggestion selection
	const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
		setSearchValue(suggestion.description);
		setShowSuggestions(false);
		setSuggestions([]);

		if (!placesServiceRef.current || !map) return;

		const request = {
			placeId: suggestion.place_id,
			fields: ["geometry", "formatted_address", "address_components"],
		};

		placesServiceRef.current.getDetails(request, (place, status) => {
			if (
				status === window.google.maps.places.PlacesServiceStatus.OK &&
				place &&
				place.geometry &&
				place.geometry.location
			) {
				const lat = place.geometry.location.lat();
				const lng = place.geometry.location.lng();

				map.setCenter({ lat, lng });
				map.setZoom(15);

				// Remove old marker if it exists
				if (markerRef.current) {
					markerRef.current.setMap(null);
				}

				// Add new marker
				const newMarker = new google.maps.Marker({
					position: { lat, lng },
					map: map,
					draggable: true,
				});

				markerRef.current = newMarker;

				// Add drag listener
				newMarker.addListener("dragend", () => {
					const position = newMarker.getPosition();
					if (position) {
						reverseGeocode(position.lat(), position.lng());
					}
				});

				setSearchMessage(null);
				const locationDetails = extractLocationDetails(place);
				onLocationSelect({
					...locationDetails,
					latitude: lat,
					longitude: lng,
				});
			}
		});
	};

	// Handle search button click
	const handleSearchClick = () => {
		if (!map || !searchValue.trim()) return;

		setShowSuggestions(false);
		const geocoder = new window.google.maps.Geocoder();

		geocoder.geocode({ address: searchValue }, (results, status) => {
			if (status === "OK" && results && results[0]) {
				const location = results[0].geometry.location;
				const lat = location.lat();
				const lng = location.lng();

				map.setCenter({ lat, lng });
				map.setZoom(15);

				// Remove old marker if it exists
				if (markerRef.current) {
					markerRef.current.setMap(null);
				}

				// Add new marker
				const newMarker = new google.maps.Marker({
					position: { lat, lng },
					map: map,
					draggable: true,
				});

				markerRef.current = newMarker;

				// Add drag listener
				newMarker.addListener("dragend", () => {
					const position = newMarker.getPosition();
					if (position) {
						reverseGeocode(position.lat(), position.lng());
					}
				});

				setSearchMessage(null);
				const locationDetails = extractLocationDetails(results[0]);
				onLocationSelect({
					...locationDetails,
					latitude: lat,
					longitude: lng,
				});
			} else {
				setSearchMessage("No results found for this location. Please try a different search term.");
			}
		});
	};

	// Handle current location
	const handleCurrentLocation = () => {
		if (!("geolocation" in navigator)) {
			setSearchMessage("Geolocation is not supported by this browser");
			return;
		}

		navigator.geolocation.getCurrentPosition(
			function (position) {
				var latitude = position.coords.latitude;
				var longitude = position.coords.longitude;

				if (map) {
					map.setCenter({ lat: latitude, lng: longitude });
					map.setZoom(15);

					// Remove old marker if it exists
					if (markerRef.current) {
						markerRef.current.setMap(null);
					}

					// Add new marker
					const newMarker = new google.maps.Marker({
						position: { lat: latitude, lng: longitude },
						map: map,
						draggable: true,
					});

					markerRef.current = newMarker;

					// Add drag listener
					newMarker.addListener("dragend", () => {
						const position = newMarker.getPosition();
						if (position) {
							reverseGeocode(position.lat(), position.lng());
						}
					});

					reverseGeocode(latitude, longitude);
					setSearchMessage(null);
				}
			},
			function (error) {
				let errorMessage = "Failed to get current location";
				if (error.code === 1) errorMessage = "Location access denied by user";
				else if (error.code === 2) errorMessage = "Location unavailable";
				else if (error.code === 3) errorMessage = "Location request timed out";
				setSearchMessage(errorMessage + ". Please search for a location or click on the map.");
			},
		);
	};

	// Handle Enter key in search input
	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleSearchClick();
		} else if (e.key === "Escape") {
			setShowSuggestions(false);
		}
	};

	// Hide suggestions when clicking outside
	const handleInputBlur = () => {
		// Delay to allow suggestion clicks to register
		setTimeout(() => setShowSuggestions(false), 150);
	};

	if (error) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="text-lg flex items-center gap-2">
						<Icon icon="solar:map-point-bold" size={20} />
						Location Selection
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center py-8">
						<Icon icon="solar:danger-bold" size={48} className="text-red-500 mx-auto mb-4" />
						<p className="text-red-600 mb-2">Error loading map</p>
						<p className="text-text-secondary text-sm mb-4">{error}</p>

						{/* Fallback Address Input */}
						<div className="max-w-md mx-auto">
							<div className="text-left mb-2">
								<label className="text-sm font-medium text-text-primary">Enter Address Manually</label>
							</div>
							<div className="flex gap-2">
								<Input
									placeholder="Enter store address..."
									value={searchValue}
									onChange={(e) => setSearchValue(e.target.value)}
									className="flex-1"
								/>
								<Button
									onClick={() => {
										if (searchValue.trim()) {
											onLocationSelect({
												address: searchValue,
												city: "Unknown",
												postcode: "Unknown",
												country: "Unknown",
												latitude: 52.3676, // Default Amsterdam coordinates
												longitude: 4.9041,
											});
										}
									}}
									variant="outline"
								>
									Save
								</Button>
							</div>
							<p className="text-xs text-text-secondary mt-2">
								Map functionality unavailable. Please enter address manually.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg flex items-center gap-2">
					<Icon icon="solar:map-point-bold" size={20} />
					Location Selection
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Search Bar with Suggestions */}
				<div className="relative">
					<div className="flex gap-2">
						<div className="relative flex-1">
							<Input
								placeholder="Search for address..."
								value={searchValue}
								onChange={(e) => handleSearchChange(e.target.value)}
								onKeyPress={handleKeyPress}
								onFocus={() => {
									if (suggestions.length > 0) setShowSuggestions(true);
								}}
								onBlur={handleInputBlur}
								className="w-full"
							/>

							{/* Search Suggestions Dropdown */}
							{showSuggestions && suggestions.length > 0 && (
								<div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-800 border rounded-lg shadow-lg max-h-48 overflow-y-auto">
									          {suggestions.map((suggestion) => (
										<div
											key={suggestion.place_id}
											className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm border-b border-gray-100 dark:border-gray-700 last:border-0"
											onClick={() => handleSuggestionSelect(suggestion)}
										>
											<div className="flex items-center gap-2">
												<Icon icon="solar:map-point-line-duotone" size={16} className="text-gray-400 flex-shrink-0" />
												<span className="truncate">{suggestion.description}</span>
											</div>
										</div>
									))}
								</div>
							)}
						</div>

						<Button type="button" onClick={handleSearchClick} variant="outline">
							<Icon icon="solar:magnifer-bold" size={16} />
						</Button>
						<Button type="button" onClick={handleCurrentLocation} variant="outline">
							<Icon icon="solar:gps-bold" size={16} />
						</Button>
					</div>

					{/* Search Message */}
					{searchMessage && (
						<div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
							<div className="flex items-center gap-2">
								<Icon icon="solar:info-circle-bold" size={16} className="text-yellow-600 flex-shrink-0" />
								<p className="text-sm text-yellow-800 dark:text-yellow-200">{searchMessage}</p>
							</div>
						</div>
					)}
				</div>

				{/* Map Container */}
				<div className="relative">
					{isLoading && (
						<div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10">
							<div className="flex flex-col items-center gap-2">
								<Icon icon="svg-spinners:6-dots-scale-middle" size={32} className="text-primary" />
								<p className="text-text-secondary text-sm">Loading map...</p>
							</div>
						</div>
					)}
					<div ref={mapRef} className="w-full h-96 rounded-lg border" style={{ width: "100%", height: "400px" }} />
				</div>

				<div className="text-xs text-text-secondary">
					<p>💡 Click on the map to place a marker, or drag the marker to adjust the location.</p>
				</div>
			</CardContent>
		</Card>
	);
}
