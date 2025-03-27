interface DataEntry {
	id: number;
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
