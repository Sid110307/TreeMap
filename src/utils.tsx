import React from "react";
import { Dimensions, PixelRatio, Pressable } from "react-native";
import { BaseToast, ToastConfig } from "react-native-toast-message";

import {
	BottomSheetProps,
	BottomSheetView,
	default as NativeBottomSheet,
} from "@gorhom/bottom-sheet";
import * as Font from "expo-font";
import { useRouter } from "expo-router";
import * as SQLite from "expo-sqlite";

import colors from "../assets/colors";

const { width, height } = Dimensions.get("window");

export const widthToDp = (num: string) => {
	const parsed = parseFloat(num);
	if (isNaN(parsed)) return 0;

	return PixelRatio.roundToNearestPixel((width * parsed) / 100);
};

export const heightToDp = (num: string) => {
	const parsed = parseFloat(num);
	if (isNaN(parsed)) return 0;

	return PixelRatio.roundToNearestPixel((height * parsed) / 100);
};

export const onStartup = async () => {
	await Font.loadAsync({
		Bold: require("../assets/fonts/Outfit-Bold.ttf"),
		Light: require("../assets/fonts/Outfit-Light.ttf"),
		Medium: require("../assets/fonts/Outfit-Medium.ttf"),
		Regular: require("../assets/fonts/Outfit-Regular.ttf"),
		Title: require("../assets/fonts/PlayfairDisplay-BlackItalic.ttf"),
		Caption: require("../assets/fonts/IBMPlexMono-Regular.ttf"),
	});
};

export const toastConfig: ToastConfig = {
	success: props => (
		<BaseToast
			{...props}
			style={{
				borderRadius: 64,
				backgroundColor: colors.light[200],
				borderWidth: 2,
				borderColor: colors.primary,
			}}
			contentContainerStyle={{ flexDirection: "column", alignItems: "center" }}
			text1Style={{ color: colors.primary }}
		/>
	),
	error: props => (
		<BaseToast
			{...props}
			style={{
				borderRadius: 64,
				backgroundColor: colors.light[200],
				borderWidth: 2,
				borderColor: colors.error,
			}}
			contentContainerStyle={{ flexDirection: "column", alignItems: "center" }}
			text1Style={{ color: colors.error }}
		/>
	),
	info: props => (
		<BaseToast
			{...props}
			style={{
				borderRadius: 64,
				backgroundColor: colors.light[200],
				borderWidth: 2,
				borderColor: colors.secondary,
			}}
			contentContainerStyle={{ flexDirection: "column", alignItems: "center" }}
			text1Style={{ color: colors.secondary }}
		/>
	),
};

export const BottomSheet = (props: BottomSheetProps) => {
	const router = useRouter();
	return (
		<NativeBottomSheet
			{...props}
			onClose={router.back}
			enablePanDownToClose
			backdropComponent={_ => (
				<Pressable
					style={{ flex: 1, backgroundColor: "#00000080" }}
					onPress={router.back}
				/>
			)}
		>
			<BottomSheetView style={{ flex: 1, padding: 8, paddingHorizontal: 16, gap: 12 }}>
				{props.children}
			</BottomSheetView>
		</NativeBottomSheet>
	);
};

export class DatabaseManager {
	private db: SQLite.SQLiteDatabase | null = null;

	constructor() {
		this.init().catch(this.handleError);
	}

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
			[id],
			"first",
		);

	getAll = async () =>
		this.runStatement(`SELECT *
                           FROM TreeMap`);

	upsert = async (data: DataEntry) => {
		if (!this.db) {
			this.handleError("Database not initialized");
			return false;
		}

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
				await statement.executeAsync(values);
			});
			return true;
		} catch (error) {
			this.handleError(error);
			return false;
		} finally {
			await statement.finalizeAsync();
		}
	};

	delete = async (id: string) => {
		if (!this.db) {
			this.handleError("Database not initialized");
			return false;
		}

		const statement = await this.db.prepareAsync(`DELETE
                                                      FROM TreeMap
                                                      WHERE id = ?`);

		try {
			await this.db.withTransactionAsync(async () => {
				await statement.executeAsync([id]);
			});
			return true;
		} catch (error) {
			this.handleError(error);
			return false;
		} finally {
			await statement.finalizeAsync();
		}
	};

	private handleError = (error: any) => {
		console.error(`Database Error: ${error.toString()}`);
	};

	private runStatement = async (
		sql: string,
		params: any[] = [],
		mode: "first" | "all" = "all",
	): Promise<any | null> => {
		if (!this.db) {
			this.handleError("Database not initialized");
			return null;
		}

		const statement = await this.db.prepareAsync(sql);

		try {
			const result = await statement.executeAsync(params);
			return mode === "first" ? await result.getFirstAsync() : await result.getAllAsync();
		} catch (error) {
			this.handleError(error);
			return null;
		} finally {
			await statement.finalizeAsync();
		}
	};
}
