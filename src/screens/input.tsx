import React from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";

import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useRouter } from "expo-router";

import colors from "../../assets/colors";

import Card from "../components/card";
import Text from "../components/text";

import { useGeoState } from "../state";
import { heightToDp } from "../utils";

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
						{!Location.hasServicesEnabledAsync()
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
				title="Enter details"
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
