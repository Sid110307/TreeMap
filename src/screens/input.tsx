import React from "react";
import { View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";

import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import * as Updates from "expo-updates";
import { NavigatorAlt, Refresh, RefreshDouble } from "iconoir-react-native";

import Card from "../components/card";
import DataEntryItem from "../components/dataEntryItem";
import Text, { HeadText, IncrementText } from "../components/text";

import colors from "../core/colors";
import { databaseManager } from "../core/database";
import { useGeoState } from "../core/state";
import { DataEntry } from "../core/types";
import { heightToDp, widthToDp } from "../core/utils";

export const UpdateButton = () => {
	const [isUpdateAvailable, setIsUpdateAvailable] = React.useState(false);

	React.useEffect(() => {
		try {
			if (!__DEV__)
				Updates.checkForUpdateAsync().then(({ isAvailable }) =>
					setIsUpdateAvailable(isAvailable),
				);
		} catch (e) {
			console.error(`An error occurred while checking for updates: ${e}`);
		}
	}, []);

	if (!isUpdateAvailable) return null;
	return (
		<View
			style={{
				width: "100%",
				backgroundColor: colors.light[200],
				borderWidth: 2,
				borderColor: colors.primary,
				borderRadius: 8,
				alignSelf: "center",
				flexDirection: "row",
				justifyContent: "space-between",
				alignItems: "center",
				paddingVertical: 8,
				paddingHorizontal: 12,
				gap: 8,
			}}
		>
			<Text style={{ fontFamily: "Bold" }}>Update available</Text>
			<Pressable
				style={{
					backgroundColor: colors.primary,
					paddingVertical: 8,
					paddingHorizontal: 16,
					borderRadius: 64,
					gap: 8,
					flexDirection: "row",
					justifyContent: "center",
					alignItems: "center",
				}}
				onPress={() => {
					if (__DEV__) return;
					Updates.fetchUpdateAsync()
						.then(() => {
							try {
								Updates.reloadAsync().catch(e =>
									console.error(
										`An error occurred while reloading the app: ${e}`,
									),
								);
							} catch (e) {
								console.error(`An error occurred while updating the app: ${e}`);
							}
						})
						.catch(e =>
							console.error(`An error occurred while fetching the update: ${e}`),
						);
				}}
			>
				<Refresh width={12} height={12} color={colors.light[200]} />
				<Text style={{ color: colors.light[200], fontSize: 12 }}>Restart</Text>
			</Pressable>
		</View>
	);
};

export const CoordinatesCard = () => {
	const [hasLocation, setHasLocation] = React.useState(false);
	const { latitude, longitude, refetchGeoState } = useGeoState();

	React.useEffect(() => {
		Location.hasServicesEnabledAsync().then(enabled => setHasLocation(enabled));
	}, []);

	return (
		<Card
			title="Coordinates"
			cta={<RefreshDouble color={colors.primary} width={16} height={16} />}
			ctaPress={async () => await refetchGeoState()}
		>
			<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
				<View style={{ flexDirection: "row" }}>
					<Text>Latitude: </Text>
					<Text style={{ fontFamily: "Medium" }}>
						{!hasLocation
							? "Unknown"
							: latitude
								? `${latitude}°${latitude < 0 ? "S" : "N"}`
								: "Loading..."}
					</Text>
				</View>
				<View style={{ flexDirection: "row" }}>
					<Text>Longitude: </Text>
					<Text style={{ fontFamily: "Medium" }}>
						{!hasLocation
							? "Unknown"
							: longitude
								? `${longitude}°${longitude < 0 ? "W" : "E"}`
								: "Loading..."}
					</Text>
				</View>
			</View>
		</Card>
	);
};

export const StatsCard = () => {
	const [identifiedTrees, setIdentifiedTrees] = React.useState<number>(0);
	const [nearbyTrees, setNearbyTrees] = React.useState<number>(0);

	const { listNearby } = useGeoState();

	React.useEffect(() => {
		databaseManager.supabaseDB
			?.from("TreeMap")
			.select("*", { count: "exact" })
			.then(({ count }) => {
				if (count === null) {
					Toast.show({
						type: "error",
						text1: "Error Fetching Data",
						text2: "An error occurred while fetching your data.",
					});
					return;
				}
				setIdentifiedTrees(count);
			});
		listNearby()
			.then(data => setNearbyTrees(data.length))
			.catch(console.error);
	}, []);

	return (
		<Card title="Statistics">
			<View
				style={{
					flexDirection: "row",
					justifyContent: "space-between",
					flexWrap: "wrap",
					gap: 16,
				}}
			>
				<Card style={{ alignItems: "center", width: widthToDp("40%"), marginVertical: 0 }}>
					<IncrementText
						style={{ fontFamily: "Bold", fontSize: 24, color: colors.primary }}
						value={identifiedTrees}
					/>
					<Text>Identified Tree{identifiedTrees === 1 ? "" : "s"}</Text>
				</Card>
				<Card style={{ alignItems: "center", width: widthToDp("40%"), marginVertical: 0 }}>
					<IncrementText
						style={{ fontFamily: "Bold", fontSize: 24, color: colors.primary }}
						value={nearbyTrees}
					/>
					<Text>Tree{nearbyTrees === 1 ? "" : "s"} near you</Text>
				</Card>
			</View>
		</Card>
	);
};

export const Actions = () => {
	const router = useRouter();
	return (
		<View
			style={{
				height: heightToDp("20%"),
				flexDirection: "row",
				justifyContent: "space-between",
				gap: 16,
			}}
		>
			<Card
				style={{ flex: 1 }}
				onPress={() =>
					// TODO: Add camera functionality
					Toast.show({
						type: "info",
						text1: "Coming Soon",
						text2: "This feature is not yet available.",
					})
				}
			>
				<LinearGradient
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						borderRadius: 8,
					}}
					start={{ x: 0, y: 0 }}
					colors={[colors.tint[0], colors.tint[200], colors.tint[400]]}
				/>
				<View style={{ flex: 1, justifyContent: "flex-end" }}>
					<HeadText style={{ fontFamily: "Bold", color: colors.light[0] }}>
						Take a photo of a
					</HeadText>
					<HeadText style={{ fontSize: 20, fontFamily: "Title", color: colors.light[0] }}>
						leaf
					</HeadText>
				</View>
			</Card>
			<Card style={{ flex: 1 }} onPress={() => router.navigate("/sheets/details")}>
				<LinearGradient
					style={{
						zIndex: -1,
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						borderRadius: 8,
					}}
					start={{ x: 0, y: 0 }}
					colors={[colors.tint[900], colors.tint[700], colors.tint[500]]}
				/>
				<View style={{ flex: 1, justifyContent: "flex-end" }}>
					<HeadText style={{ fontFamily: "Bold", color: colors.light[0] }}>
						Enter details
					</HeadText>
					<HeadText style={{ fontSize: 20, fontFamily: "Title", color: colors.light[0] }}>
						manually
					</HeadText>
				</View>
			</Card>
		</View>
	);
};

export const RecentEntries = () => {
	const router = useRouter();
	const [data, setData] = React.useState<DataEntry[]>([]);

	React.useEffect(() => {
		databaseManager.supabaseDB
			?.from("TreeMap")
			.select("*")
			.order("updated_at", { ascending: false })
			.limit(5)
			.then(({ data, error }) => {
				if (error) {
					console.error(error);
					Toast.show({
						type: "error",
						text1: "Error Fetching Data",
						text2: "An error occurred while fetching your data.",
					});
					return;
				}
				if (data) setData(data);
			});
	}, []);

	return data?.length === 0 ? null : (
		<Card
			title="Recently Added"
			cta={
				<View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
					<NavigatorAlt width={16} height={16} color={colors.primary} />
					<Text
						style={{
							fontFamily: "Bold",
							letterSpacing: 0.5,
							fontSize: 12,
							color: colors.primary,
						}}
					>
						Nearby Trees
					</Text>
				</View>
			}
			ctaPress={() => router.navigate("/nearby")}
		>
			<FlashList
				data={data}
				estimatedItemSize={120}
				ListEmptyComponent={() => (
					<Text style={{ textAlign: "center", marginVertical: 8 }}>
						No entries found.
					</Text>
				)}
				renderItem={({ item }: { item: DataEntry }) => (
					<DataEntryItem item={item} hasMore={data!.length > 1} />
				)}
				keyExtractor={item => item.id}
			/>
		</Card>
	);
};
