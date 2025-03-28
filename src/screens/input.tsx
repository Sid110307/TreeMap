import React from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";

import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useRouter } from "expo-router";

import Card from "../components/card";
import Text, { IncrementText } from "../components/text";

import colors from "../core/colors";
import { databaseManager } from "../core/database";
import { useGeoState } from "../core/state";
import { heightToDp, widthToDp } from "../core/utils";

export const CoordinatesCard = () => {
	const [hasLocation, setHasLocation] = React.useState(false);
	const { latitude, longitude, setLatitude, setLongitude } = useGeoState();

	React.useEffect(() => {
		Location.requestForegroundPermissionsAsync()
			.then(response => {
				if (response.status !== "granted") {
					Toast.show({
						type: "error",
						text1: "Location Permission Denied",
						text2: "We need your permission to access location. Please enable it your device settings.",
					});
					return;
				}

				return Location.getCurrentPositionAsync();
			})
			.then(loc => {
				if (!loc) return;

				setLatitude(loc.coords.latitude);
				setLongitude(loc.coords.longitude);
			})
			.catch(err => {
				console.error(err);
				Toast.show({
					type: "error",
					text1: "Location Error",
					text2: "An error occurred while fetching your location.",
				});
			});

		Location.hasServicesEnabledAsync().then(enabled => setHasLocation(enabled));
	}, []);

	return (
		<Card title="Coordinates">
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
				title="Take a photo of a leaf"
				titleStyle={{ fontFamily: "Bold", color: colors.light[0] }}
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
						zIndex: -1,
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
			</Card>
			<Card
				title="Enter details manually"
				titleStyle={{ fontFamily: "Bold", color: colors.light[0] }}
				style={{ flex: 1 }}
				onPress={() => router.navigate("/sheets/details")}
			>
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
					start={{ x: 1, y: 0 }}
					colors={[colors.tint[500], colors.tint[700], colors.tint[900]]}
				/>
			</Card>
		</View>
	);
};

export const StatsCard = () => {
	const [data, setData] = React.useState<DataEntry[] | null>(null);

	React.useEffect(() => {
		databaseManager
			.getAll()
			.then(setData)
			.catch(err => {
				console.error(err);
				Toast.show({
					type: "error",
					text1: "Error Fetching Data",
					text2: "An error occurred while fetching your data.",
				});
			});
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
						style={{ fontFamily: "Bold", fontSize: 24 }}
						value={data?.length ?? 0}
					/>
					<Text>Identified Trees</Text>
				</Card>
				<Card style={{ alignItems: "center", width: widthToDp("40%"), marginVertical: 0 }}>
					<IncrementText style={{ fontFamily: "Bold", fontSize: 24 }} value={100} />
					<Text>Trees in your region</Text>
				</Card>
				<Card style={{ alignItems: "center", width: widthToDp("40%"), marginVertical: 0 }}>
					<IncrementText style={{ fontFamily: "Bold", fontSize: 24 }} value={0} />
					<Text>Leaves in your region</Text>
				</Card>
			</View>
			<FlashList
				style={{ marginTop: 16 }}
				data={data}
				renderItem={({ item }) => (
					<View
						style={{
							marginVertical: 8,
							padding: 8,
							backgroundColor: colors.light[200],
							gap: 4,
						}}
					>
						<Text key={item.id}>
							{item.title} - {item.scientific_name}
						</Text>
						<Text>{item.description}</Text>
					</View>
				)}
				keyExtractor={item => item.id}
			/>
		</Card>
	);
};
