/**
 * Default opening hours for new stores
 */
export const DEFAULT_OPENING_HOURS = {
	monday: "09:00-18:00",
	tuesday: "09:00-18:00",
	wednesday: "09:00-18:00",
	thursday: "09:00-18:00",
	friday: "09:00-18:00",
	saturday: "09:00-18:00",
	sunday: "Closed",
};

/**
 * Supported countries for KampanYES
 */
export const SUPPORTED_COUNTRIES = [
	{ value: "Netherlands", label: "Netherlands" },
	{ value: "Germany", label: "Germany" },
];

/**
 * Common Dutch cities
 */
export const DUTCH_CITIES = [
	"Amsterdam",
	"Rotterdam",
	"The Hague",
	"Utrecht",
	"Eindhoven",
	"Tilburg",
	"Groningen",
	"Almere",
	"Breda",
	"Nijmegen",
];

/**
 * Common German cities
 */
export const GERMAN_CITIES = [
	"Berlin",
	"Hamburg",
	"Munich",
	"Cologne",
	"Frankfurt",
	"Stuttgart",
	"Düsseldorf",
	"Dortmund",
	"Essen",
	"Leipzig",
];

/**
 * Get cities by country
 */
export function getCitiesByCountry(country: string): string[] {
	switch (country) {
		case "Netherlands":
			return DUTCH_CITIES;
		case "Germany":
			return GERMAN_CITIES;
		default:
			return [];
	}
}
