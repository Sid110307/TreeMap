import React from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";

import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";

import colors from "../../../../assets/colors";

import Card from "../../../components/card";
import Text from "../../../components/text";

import { heightToDp } from "../../../utils";

export const CoordinatesCard = () => {
	const [hasLocation, setHasLocation] = React.useState(false);
	const [location, setLocation] = React.useState<Location.LocationObject | null>(null);

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
				if (loc) setLocation(loc);
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
							: location?.coords.latitude
								? `${location?.coords.latitude}°${location?.coords.latitude < 0 ? "S" : "N"}`
								: "Loading..."}
					</Text>
				</View>
				<View style={{ flexDirection: "row" }}>
					<Text>Longitude: </Text>
					<Text style={{ fontFamily: "Medium" }}>
						{!hasLocation
							? "Unknown"
							: location?.coords.longitude
								? `${location?.coords.longitude}°${location?.coords.longitude < 0 ? "W" : "E"}`
								: "Loading..."}
					</Text>
				</View>
			</View>
		</Card>
	);
};

const Actions = () => (
	<View style={{ flexDirection: "row", justifyContent: "space-between", gap: 16 }}>
		<Card title="Take a photo" style={{ flex: 1, height: heightToDp("20%") }}>
			<LinearGradient
				style={{ flex: 1, justifyContent: "center", alignItems: "center", borderRadius: 8 }}
				colors={[colors.tint[0], colors.tint[300], colors.tint[600]]}
			/>
		</Card>
		<Card title="Enter details" style={{ flex: 1, height: heightToDp("20%") }}>
			<LinearGradient
				style={{ flex: 1, justifyContent: "center", alignItems: "center", borderRadius: 8 }}
				colors={[colors.tint[500], colors.tint[700], colors.tint[900]]}
			/>
		</Card>
	</View>
);

export default () => (
	<View style={{ padding: 8, paddingHorizontal: 16 }}>
		<CoordinatesCard />
		<Actions />
	</View>
);
