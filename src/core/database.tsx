import * as SQLite from "expo-sqlite";

class DatabaseManager {
	private db: SQLite.SQLiteDatabase | null = null;

	init = async () => {
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

	get = async (id: string) =>
		this.runStatement(
			`SELECT *
             FROM TreeMap
             WHERE id = ?`,
			"first",
			[id],
		);

	getAll = async () =>
		this.runStatement(
			`SELECT *
             FROM TreeMap`,
			"all",
		);

	upsert = async (data: Omit<DataEntry, "created_at" | "updated_at">) => {
		if (!this.db) throw new Error(`Database Error: Database not initialized`);

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
		const values = [
			data.id,
			data.title,
			data.description,
			data.scientific_name,
			data.latitude,
			data.longitude,
			JSON.stringify(data.metadata ?? null),
			data.image ?? null,
		];

		try {
			await this.db.withTransactionAsync(async () => {
				await statement.executeAsync<DataEntry>(values);
			});
			return true;
		} catch (error) {
			throw new Error(`Database Error: ${error}`);
		} finally {
			await statement.finalizeAsync();
		}
	};

	delete = async (id: string) => {
		if (!this.db) throw new Error(`Database Error: Database not initialized`);
		const statement = await this.db.prepareAsync(`DELETE
                                                      FROM TreeMap
                                                      WHERE id = ?`);

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

	private runStatement(sql: string, mode: "first", params?: any[]): Promise<DataEntry | null>;
	private runStatement(sql: string, mode: "all", params?: any[]): Promise<DataEntry[]>;
	private runStatement(
		sql: string,
		mode: "first" | "all",
		params?: any[],
	): Promise<DataEntry | DataEntry[] | null> {
		if (!this.db) throw new Error(`Database Error: Database not initialized`);
		return (async () => {
			const statement = await this.db!.prepareAsync(sql);

			try {
				const result = await statement.executeAsync<DataEntry>(params ?? []);
				return mode === "first" ? await result.getFirstAsync() : await result.getAllAsync();
			} catch (error) {
				throw new Error(`Database Error: ${error}`);
			} finally {
				await statement.finalizeAsync();
			}
		})();
	}
}

export const databaseManager = new DatabaseManager();
