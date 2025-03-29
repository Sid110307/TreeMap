import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import * as SQLite from "expo-sqlite";

import "react-native-url-polyfill/auto";

import { AppState } from "react-native";

import { DataEntry } from "./types";

class DatabaseManager {
	localDB: SQLite.SQLiteDatabase | null = null;
	supabaseDB: SupabaseClient | null = null;

	init = async () => {
		if (this.localDB) return;

		this.localDB = await SQLite.openDatabaseAsync("TreeMap.db");
		this.supabaseDB = createClient(
			process.env.EXPO_PUBLIC_SUPABASE_URL || "",
			process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
			{ auth: { storage: AsyncStorage } },
		);

		await this.localDB.execAsync(
			`CREATE TABLE IF NOT EXISTS TreeMap
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
                 image           TEXT,
                 is_dirty        INTEGER  DEFAULT 0
             );
            CREATE INDEX IF NOT EXISTS TreeMap_latitude_longitude_index ON TreeMap (latitude, longitude);
            CREATE INDEX IF NOT EXISTS TreeMap_title_index ON TreeMap (title);
            CREATE INDEX IF NOT EXISTS TreeMap_scientific_name_index ON TreeMap (scientific_name);
            CREATE INDEX IF NOT EXISTS TreeMap_created_at_index ON TreeMap (created_at);
			`,
		);
		AppState.addEventListener("change", state => {
			if (!this.supabaseDB) return;

			if (state === "active") this.supabaseDB.auth.startAutoRefresh();
			else this.supabaseDB.auth.stopAutoRefresh();
		});
	};

	query = async <T extends DataEntry[] = any>(query: string, params?: any[]) => {
		let result = await this.runStatement<T>(query, "all", params);

		if (typeof result === "object" && "id" in result) result = this.parseMetadata(result);
		else if (Array.isArray(result) && result.length > 0 && "id" in result[0])
			result.forEach(entry => this.parseMetadata(entry));

		return result;
	};

	upsert = async (
		data: Omit<DataEntry, "created_at" | "updated_at" | "is_dirty">,
		user_id: string,
	) => {
		await this.init();
		if (!this.localDB) throw new Error("Database Error: Database not initialized");

		const statement = await this.localDB.prepareAsync(
			`INSERT INTO TreeMap (id, title, description, scientific_name, latitude, longitude, metadata, image,
                                  is_dirty)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
             ON CONFLICT(id) DO UPDATE SET title           = EXCLUDED.title,
                                           description     = EXCLUDED.description,
                                           scientific_name = EXCLUDED.scientific_name,
                                           latitude        = EXCLUDED.latitude,
                                           longitude       = EXCLUDED.longitude,
                                           updated_at      = CURRENT_TIMESTAMP,
                                           metadata        = EXCLUDED.metadata,
                                           image           = EXCLUDED.image,
                                           is_dirty        = 1
			`,
		);

		try {
			await this.localDB.withTransactionAsync(async () => {
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

			try {
				await this.supabaseDB!.from("TreeMap")
					.upsert({
						id: data.id,
						user_id,
						title: data.title,
						description: data.description,
						scientific_name: data.scientific_name,
						latitude: data.latitude,
						longitude: data.longitude,
						metadata: JSON.stringify(data.metadata ?? null),
						image: data.image ?? null,
					})
					.throwOnError();
				await this.localDB!.runAsync(
					`UPDATE TreeMap
                     SET is_dirty = 0
                     WHERE id = ?`,
					[data.id],
				);
			} catch (error) {
				await this.localDB.runAsync(
					`UPDATE TreeMap
                     SET is_dirty = 1
                     WHERE id = ?`,
					[data.id],
				);
				console.warn(`Error syncing with Supabase: ${error}`);
			}

			return true;
		} catch (error) {
			throw new Error(`Database Error: ${error}`);
		} finally {
			await statement.finalizeAsync();
		}
	};

	delete = async (id: string) => {
		await this.init();
		if (!this.localDB) throw new Error("Database Error: Database not initialized");

		const statement = await this.localDB.prepareAsync(
			`DELETE
             FROM TreeMap
             WHERE id = ?`,
		);

		try {
			await this.localDB.withTransactionAsync(async () => {
				await statement.executeAsync<DataEntry>([id]);
			});

			try {
				await this.supabaseDB!.from("TreeMap").delete().eq("id", id).throwOnError();
			} catch (error) {
				await this.localDB!.runAsync(
					`UPDATE TreeMap
                     SET is_dirty = 1
                     WHERE id = ?`,
					[id],
				);
				console.warn(`Error deleting from Supabase: ${error}`);
			}

			return true;
		} catch (error) {
			throw new Error(`Database Error: ${error}`);
		} finally {
			await statement.finalizeAsync();
		}
	};

	syncDirtyRecords = async (user_id: string) => {
		await this.init();

		if (!this.localDB) throw new Error("Database Error: Database not initialized");
		if (!this.supabaseDB) return;

		const dirtyEntries = await this.query(
			`SELECT *
             FROM TreeMap
             WHERE is_dirty = 1`,
		);
		if (!dirtyEntries || dirtyEntries.length === 0) return;

		for (const entry of dirtyEntries)
			try {
				await this.supabaseDB
					.from("TreeMap")
					.upsert({
						id: entry.id,
						user_id,
						title: entry.title,
						description: entry.description,
						scientific_name: entry.scientific_name,
						latitude: entry.latitude,
						longitude: entry.longitude,
						metadata: JSON.stringify(entry.metadata ?? null),
						image: entry.image ?? null,
					})
					.throwOnError();
				await this.localDB.runAsync(
					`UPDATE TreeMap
                     SET is_dirty = 0
                     WHERE id = ?`,
					[entry.id],
				);
			} catch (error) {
				console.warn(`Retry sync failed for ${entry.id}: ${error}`);
			}
	};

	parseMetadata = (entry: any) => {
		if (entry && entry.metadata)
			try {
				entry.metadata = JSON.parse(entry.metadata as unknown as string);
			} catch {
				entry.metadata = {};
			}
		return entry;
	};

	private async runStatement<T>(sql: string, mode: "first", params?: any[]): Promise<T | null>;
	private async runStatement<T>(sql: string, mode: "all", params?: any[]): Promise<T[]>;
	private async runStatement<T>(
		sql: string,
		mode: "first" | "all",
		params?: any[],
	): Promise<T | T[] | null> {
		await this.init();
		if (!this.localDB) throw new Error("Database Error: Database not initialized");

		return (async () => {
			const statement = await this.localDB!.prepareAsync(sql);

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
}

export const databaseManager = new DatabaseManager();
