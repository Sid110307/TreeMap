import * as SQLite from "expo-sqlite";

class DatabaseManager {
	private db: SQLite.SQLiteDatabase | null = null;

	init = async () => {
		if (this.db) return;

		this.db = await SQLite.openDatabaseAsync("TreeMap.db");
		await this.db.execAsync(`
            CREATE TABLE IF NOT EXISTS TreeMap
            (
                id              TEXT NOT NULL PRIMARY KEY,
                title           TEXT NOT NULL,
                description     TEXT NOT NULL,
                scientific_name TEXT NOT NULL,
                latitude        REAL NOT NULL,
                longitude       REAL NOT NULL,
                created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
                metadata        TEXT,
                image           TEXT
            );
		`);
	};

	query = async <T extends DataEntry[] = any>(query: string, params?: any[]) => {
		let result = await this.runStatement<T>(query, "all", params);

		if (typeof result === "object" && "id" in result) result = this.parseMetadata(result);
		else if (Array.isArray(result) && result.length > 0 && "id" in result[0])
			result.forEach(entry => this.parseMetadata(entry));

		return result;
	};

	upsert = async (data: Omit<DataEntry, "created_at" | "updated_at">) => {
		await this.init();
		if (!this.db) throw new Error("Database Error: Database not initialized");

		const statement = await this.db.prepareAsync(`
            INSERT INTO TreeMap (id, title, description, scientific_name, latitude, longitude, metadata, image)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET title           = EXCLUDED.title,
                                          description     = EXCLUDED.description,
                                          scientific_name = EXCLUDED.scientific_name,
                                          latitude        = EXCLUDED.latitude,
                                          longitude       = EXCLUDED.longitude,
                                          updated_at      = CURRENT_TIMESTAMP,
                                          metadata        = EXCLUDED.metadata,
                                          image           = EXCLUDED.image;
		`);

		try {
			await this.db.withTransactionAsync(async () => {
				await statement.executeAsync<DataEntry>([
					data.id,
					data.title,
					data.description,
					data.scientific_name,
					data.latitude,
					data.longitude,
					JSON.stringify(data.metadata ?? null),
					data.image ?? null,
				]);
			});
			return true;
		} catch (error) {
			throw new Error(`Database Error: ${error}`);
		} finally {
			await statement.finalizeAsync();
		}
	};

	delete = async (id: string) => {
		await this.init();
		if (!this.db) throw new Error("Database Error: Database not initialized");

		const statement = await this.db.prepareAsync(
			`DELETE
             FROM TreeMap
             WHERE id = ?`,
		);

		try {
			await this.db.withTransactionAsync(async () => {
				await statement.executeAsync<DataEntry>([id]);
			});
			return true;
		} catch (error) {
			throw new Error(`Database Error: ${error}`);
		} finally {
			await statement.finalizeAsync();
		}
	};

	private async runStatement<T>(sql: string, mode: "first", params?: any[]): Promise<T | null>;
	private async runStatement<T>(sql: string, mode: "all", params?: any[]): Promise<T[]>;
	private async runStatement<T>(
		sql: string,
		mode: "first" | "all",
		params?: any[],
	): Promise<T | T[] | null> {
		await this.init();
		if (!this.db) throw new Error("Database Error: Database not initialized");

		return (async () => {
			const statement = await this.db!.prepareAsync(sql);

			try {
				const query = await statement.executeAsync<T>(params ?? []);
				return mode === "first" ? await query.getFirstAsync() : await query.getAllAsync();
			} catch (error) {
				throw new Error(`Database Error: ${error}`);
			} finally {
				await statement.finalizeAsync();
			}
		})();
	}

	private parseMetadata(entry: any) {
		if (entry && entry.metadata)
			try {
				entry.metadata = JSON.parse(entry.metadata as unknown as string);
			} catch {
				entry.metadata = {};
			}
		return entry;
	}
}

export const databaseManager = new DatabaseManager();
