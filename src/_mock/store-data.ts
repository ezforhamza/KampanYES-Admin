import { BasicStatus } from "@/types/enum";
import type { Store } from "@/types/store";

/**
 * Mock store data for KampanYES admin panel
 * Following Netherlands/German market structure
 */
export const MOCK_STORES: Store[] = [
	{
		id: "1",
		name: "Albert Heijn",
		categoryId: "cat-1", // Supermarkets
		logo: "",
		location: {
			address: "Damrak 123",
			city: "Amsterdam",
			postcode: "1012 LP",
			country: "Netherlands",
			coordinates: { lat: 52.3676, lng: 4.9041 },
		},
		openingHours: {
			monday: "08:00-22:00",
			tuesday: "08:00-22:00",
			wednesday: "08:00-22:00",
			thursday: "08:00-22:00",
			friday: "08:00-22:00",
			saturday: "08:00-22:00",
			sunday: "12:00-18:00",
		},
		website: "https://www.ah.nl",
		description: "Leading Dutch supermarket chain",
		status: BasicStatus.ENABLE,
		createdAt: new Date("2024-01-15"),
		updatedAt: new Date("2024-08-10"),
		activeFlyersCount: 5,
	},
	{
		id: "2",
		name: "MediaMarkt",
		categoryId: "cat-2", // Electronics
		logo: "",
		location: {
			address: "Kalverstraat 45",
			city: "Amsterdam",
			postcode: "1012 NZ",
			country: "Netherlands",
			coordinates: { lat: 52.3702, lng: 4.8952 },
		},
		openingHours: {
			monday: "10:00-21:00",
			tuesday: "10:00-21:00",
			wednesday: "10:00-21:00",
			thursday: "10:00-21:00",
			friday: "10:00-21:00",
			saturday: "10:00-21:00",
			sunday: "12:00-18:00",
		},
		website: "https://www.mediamarkt.nl",
		description: "Electronics and technology retailer",
		status: BasicStatus.ENABLE,
		createdAt: new Date("2024-02-20"),
		updatedAt: new Date("2024-08-12"),
		activeFlyersCount: 3,
	},
	{
		id: "3",
		name: "H&M",
		categoryId: "cat-3", // Fashion
		logo: "",
		location: {
			address: "Rokin 126",
			city: "Amsterdam",
			postcode: "1012 LA",
			country: "Netherlands",
			coordinates: { lat: 52.3707, lng: 4.8926 },
		},
		openingHours: {
			monday: "10:00-19:00",
			tuesday: "10:00-19:00",
			wednesday: "10:00-19:00",
			thursday: "10:00-21:00",
			friday: "10:00-19:00",
			saturday: "10:00-19:00",
			sunday: "12:00-18:00",
		},
		website: "https://www2.hm.com/nl_nl/index.html",
		description: "Fashion and clothing retailer",
		status: BasicStatus.ENABLE,
		createdAt: new Date("2024-03-10"),
		updatedAt: new Date("2024-08-05"),
		activeFlyersCount: 2,
	},
	{
		id: "4",
		name: "REWE",
		categoryId: "cat-1", // Supermarkets
		logo: "",
		location: {
			address: "Hauptstraße 89",
			city: "Berlin",
			postcode: "10827",
			country: "Germany",
			coordinates: { lat: 52.52, lng: 13.405 },
		},
		openingHours: {
			monday: "07:00-22:00",
			tuesday: "07:00-22:00",
			wednesday: "07:00-22:00",
			thursday: "07:00-22:00",
			friday: "07:00-22:00",
			saturday: "07:00-22:00",
			sunday: "Closed",
		},
		website: "https://www.rewe.de",
		description: "German supermarket chain",
		status: BasicStatus.ENABLE,
		createdAt: new Date("2024-04-01"),
		updatedAt: new Date("2024-08-08"),
		activeFlyersCount: 4,
	},
	{
		id: "5",
		name: "Etos",
		categoryId: "cat-7", // Beauty
		logo: "",
		location: {
			address: "Nieuwedijk 78",
			city: "Amsterdam",
			postcode: "1012 MG",
			country: "Netherlands",
			coordinates: { lat: 52.3758, lng: 4.8935 },
		},
		openingHours: {
			monday: "09:00-18:00",
			tuesday: "09:00-18:00",
			wednesday: "09:00-18:00",
			thursday: "09:00-21:00",
			friday: "09:00-18:00",
			saturday: "09:00-18:00",
			sunday: "13:00-17:00",
		},
		website: "https://www.etos.nl",
		description: "Beauty and personal care products",
		status: BasicStatus.DISABLE,
		createdAt: new Date("2024-05-15"),
		updatedAt: new Date("2024-08-01"),
		activeFlyersCount: 1,
	},
];
