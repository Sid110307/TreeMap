interface DataEntry {
	id: string;
	title: string;
	description: string;
	scientific_name: string;
	latitude: number;
	longitude: number;
	created_at: string;
	updated_at: string;
	metadata: Record<string, string>;
	image: string;
}

interface GeoState {
	latitude: number;
	longitude: number;
	radius: number;
	setLatitude: (latitude: number) => void;
	setLongitude: (longitude: number) => void;
	setRadius: (radius: number) => void;
	listNearby: () => Promise<DataEntry[]>;
	refetchGeoState: (current?: boolean) => Promise<void>;
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

interface MapState {
	latitude: number;
	longitude: number;
	setLatitude: (latitude: number) => void;
	setLongitude: (longitude: number) => void;
}
