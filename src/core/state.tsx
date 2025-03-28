import { create } from "zustand";

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
	metadata: { "Trunk Diameter (cm)": "", "Height (m)": "", "Age (years)": "" },

	setTitle: (title: string) => set({ title }),
	setDescription: (description: string) => set({ description }),
	setScientificName: (scientificName: string) => set({ scientificName }),
	setImage: (image: string) => set({ image }),
	setHasImageUrl: (hasImageUrl: boolean) => set({ hasImageUrl }),
	setMetadata: (metadata: Record<string, string>) => set({ metadata }),
}));
