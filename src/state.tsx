import { create } from "zustand";

interface GeoState {
	latitude: number;
	longitude: number;
	setLatitude: (latitude: number) => void;
	setLongitude: (longitude: number) => void;
}

interface EntryState {
	title: string;
	description: string;
	scientificName: string;
	image: string;
	hasImageUrl: boolean;
	metadata: Record<string, string>;

	setTitle: (title: string) => void;
	setDescription: (description: string) => void;
	setScientificName: (scientificName: string) => void;
	setImage: (image: string) => void;
	setHasImageUrl: (hasImageUrl: boolean) => void;
	setMetadata: (metadata: Record<string, string>) => void;
}

export const useGeoState = create<GeoState>(set => ({
	latitude: 0,
	longitude: 0,
	setLatitude: (latitude: number) => set({ latitude }),
	setLongitude: (longitude: number) => set({ longitude }),
}));

export const useEntryState = create<EntryState>(set => ({
	title: "",
	description: "",
	scientificName: "",
	image: "",
	hasImageUrl: false,
	metadata: {},

	setTitle: (title: string) => set({ title }),
	setDescription: (description: string) => set({ description }),
	setScientificName: (scientificName: string) => set({ scientificName }),
	setImage: (image: string) => set({ image }),
	setHasImageUrl: (hasImageUrl: boolean) => set({ hasImageUrl }),
	setMetadata: (metadata: Record<string, string>) => set({ metadata }),
}));
