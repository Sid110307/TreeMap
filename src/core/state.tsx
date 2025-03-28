import Toast from "react-native-toast-message";

import * as Location from "expo-location";
import { create } from "zustand";

import { databaseManager } from "./database";
import { EntryState, GeoState, MapState, UserState } from "./types";
import { haversineDistance } from "./utils";

export const useGeoState = create<GeoState>((set, get) => ({
	latitude: 0,
	longitude: 0,
	radius: 10,
	setLatitude: latitude => set({ latitude }),
	setLongitude: longitude => set({ longitude }),
	setRadius: radius => set({ radius }),
	listNearby: async () => {
		const lat = get().latitude;
		const lng = get().longitude;

		const latRange = get().radius / 111320;
		const lngRange = get().radius / (111320 * Math.cos(lat * (Math.PI / 180)));

		try {
			const rows = await databaseManager.query(
				`SELECT *
                 FROM TreeMap
                 WHERE latitude BETWEEN ? AND ?
                   AND longitude BETWEEN ? AND ?`,
				[lat - latRange, lat + latRange, lng - lngRange, lng + lngRange],
			);

			return rows
				.map(row => ({
					...row,
					distance: haversineDistance(lat, lng, row.latitude, row.longitude),
				}))
				.filter(row => row.distance <= get().radius)
				.sort((a, b) => a.distance - b.distance);
		} catch (err) {
			console.error(err);
			Toast.show({
				type: "error",
				text1: "Error Fetching Data",
				text2: "An error occurred while fetching your data.",
			});

			return [];
		}
	},
	refetchGeoState: async current => {
		try {
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") {
				Toast.show({
					type: "error",
					text1: "Location Permission Denied",
					text2: "We need your permission to access location. Please enable it in your device settings.",
				});
				return;
			}

			const loc = current
				? await Location.getCurrentPositionAsync()
				: await Location.getLastKnownPositionAsync();
			if (!loc) return;

			set({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
		} catch (err) {
			console.error(err);
			Toast.show({
				type: "error",
				text1: "Location Error",
				text2: "An error occurred while fetching your location.",
			});
		}
	},
}));

const initialState = {
	title: "",
	description: "",
	scientificName: "",
	image: "",
	hasImageUrl: false,
	metadata: { "Trunk Diameter (cm)": "", "Height (m)": "", "Age (years)": "" },
};

export const useEntryState = create<EntryState>(set => ({
	...initialState,
	setTitle: title => set({ title }),
	setDescription: description => set({ description }),
	setScientificName: scientificName => set({ scientificName }),
	setImage: image => set({ image }),
	setHasImageUrl: hasImageUrl => set({ hasImageUrl }),
	setMetadata: metadata => set({ metadata }),
	resetState: () => set(initialState),
}));

export const useMapState = create<MapState>((set, get) => ({
	latitude: 0,
	longitude: 0,
	setLatitude: latitude => set({ latitude }),
	setLongitude: longitude => set({ longitude }),
}));

export const useUserState = create<UserState>(set => ({
	isLoggedIn: false,
	user: {
		id: "",
		username: "",
		email: "",
		photo: "",
		totalIdentified: 0,
	},
	updateUser: user => set(state => ({ user: { ...state.user, ...user } })),
	updateIsLoggedIn: isLoggedIn => set({ isLoggedIn }),
}));
