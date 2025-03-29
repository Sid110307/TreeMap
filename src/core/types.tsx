export interface DataEntry {
	id: string;
	user_id?: string;
	title: string;
	description: string;
	scientific_name: string;
	latitude: number;
	longitude: number;
	created_at: string;
	updated_at: string;
	metadata: Record<string, string>;
	image: string;
	is_dirty: boolean;
}

export interface GeoState {
	latitude: number;
	longitude: number;
	radius: number;
	setLatitude: (latitude: number) => void;
	setLongitude: (longitude: number) => void;
	setRadius: (radius: number) => void;
	listNearby: () => Promise<DataEntry[]>;
	refetchGeoState: (current?: boolean) => Promise<void>;
}

export interface EntryState {
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

	resetState: () => void;
}

export interface MapState {
	latitude: number;
	longitude: number;
	setLatitude: (latitude: number) => void;
	setLongitude: (longitude: number) => void;
}

export interface User {
	id: string;
	username: string;
	email: string;
	photo: string;
	totalIdentified: number;
	memberSince: string;
}

export interface UserState {
	isLoggedIn: boolean;
	user: User;
	updateUser: (u: Partial<User>) => void;
	updateIsLoggedIn: (isLoggedIn: boolean) => void;
}
