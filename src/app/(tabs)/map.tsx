import React from "react";
import { ActivityIndicator, View } from "react-native";
import { LeafletView, MapShapeType } from "react-native-leaflet-view";
import Toast from "react-native-toast-message";

import { useFocusEffect } from "expo-router";

import colors from "../../core/colors";
import { databaseManager } from "../../core/database";
import { useGeoState, useUserState } from "../../core/state";
import { DataEntry } from "../../core/types";

export default () => {
	const [loading, setLoading] = React.useState(true);
	const [data, setData] = React.useState<DataEntry[]>([]);

	const { user } = useUserState();
	const { latitude, longitude, listNearby } = useGeoState();

	useFocusEffect(
		React.useCallback(() => {
			setLoading(true);
			databaseManager
				.query("SELECT * FROM TreeMap")
				.then(setData)
				.catch(error => {
					console.error(error);
					Toast.show({
						type: "error",
						text1: "Error Fetching Data",
						text2: "An error occurred while fetching your data.",
					});
				})
				.finally(() => setLoading(false));

			listNearby().then(setData).catch(console.error);
		}, []),
	);

	return (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
			<LeafletView
				renderLoading={() =>
					loading ? <ActivityIndicator size="large" color={colors.primary} /> : <></>
				}
				mapMarkers={[
					{
						id: "user",
						position: { lat: latitude, lng: longitude },
						icon: { url: user.photo, width: 64, height: 64 },
					},
					...data.map(entry => ({
						id: entry.id,
						position: { lat: entry.latitude, lng: entry.longitude },
						icon: { url: entry.image, width: 32, height: 32 },
					})),
				]}
				mapCenterPosition={{ lat: latitude, lng: longitude }}
				mapShapes={[
					{
						id: "circle",
						shapeType: MapShapeType.CIRCLE,
						center: { lat: 51.505, lng: -0.09 },
						radius: 500,
						color: colors.secondary,
					},
					{
						id: "polygon",
						shapeType: MapShapeType.POLYGON,
						positions: [
							{ lat: 51.505, lng: -0.09 },
							{ lat: 51.51, lng: -0.1 },
							{ lat: 51.51, lng: -0.08 },
						],
						color: colors.primary,
					},
				]}
				onError={error => {
					console.error(`Map Error: ${error}`);
					Toast.show({
						type: "error",
						text1: "Map Error",
						text2: "An error occurred while loading the map.",
					});
				}}
				onLoadStart={() => setLoading(true)}
				onLoadEnd={() => data && setLoading(false)}
			/>
		</View>
	);
};
