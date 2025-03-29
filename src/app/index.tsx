import React from "react";
import { Image, StatusBar, View } from "react-native";

import NetInfo from "@react-native-community/netinfo";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as Font from "expo-font";
import * as Location from "expo-location";
import { SplashScreen, useFocusEffect, useRouter } from "expo-router";

import { databaseManager } from "../core/database";
import { useGeoState } from "../core/state";

SplashScreen.preventAutoHideAsync();

export default () => {
	const router = useRouter();

	const locationSubscription = React.useRef<Location.LocationSubscription | null>(null);
	const { setLatitude, setLongitude, refetchGeoState } = useGeoState();

	React.useEffect(() => {
		Font.loadAsync({
			Bold: require("../../assets/fonts/Outfit-Bold.ttf"),
			Light: require("../../assets/fonts/Outfit-Light.ttf"),
			Medium: require("../../assets/fonts/Outfit-Medium.ttf"),
			Regular: require("../../assets/fonts/Outfit-Regular.ttf"),
			Title: require("../../assets/fonts/PlayfairDisplay-BlackItalic.ttf"),
			Caption: require("../../assets/fonts/IBMPlexMono-Regular.ttf"),
		}).catch(console.error);

		databaseManager.init().catch(console.error);
		GoogleSignin.configure({
			webClientId:
				"1099367355723-i1d94650ru7jp9iqkgi244vt439okrmq.apps.googleusercontent.com",
			iosClientId:
				"1099367355723-vj98fh5unekmrn1s0dm0vhe62nd8na3h.apps.googleusercontent.com",
			offlineAccess: true,
		});

		NetInfo.addEventListener(state => {
			if (state.isConnected) databaseManager.syncDirtyRecords().catch(console.error);
		});

		refetchGeoState()
			.then(() => {
				SplashScreen.hideAsync();
				router.navigate("/input");
			})
			.catch(console.error);
		Location.watchPositionAsync(
			{
				distanceInterval: 10,
				timeInterval: 10000,
				accuracy: Location.Accuracy.Highest,
			},
			location => {
				setLatitude(location.coords.latitude);
				setLongitude(location.coords.longitude);
			},
		)
			.then(subscription => (locationSubscription.current = subscription))
			.catch(console.error);

		return () => {
			if (locationSubscription.current) {
				locationSubscription.current.remove();
				locationSubscription.current = null;
			}
		};
	}, []);

	useFocusEffect(
		React.useCallback(() => {
			refetchGeoState().catch(console.error);
		}, []),
	);

	return (
		<View
			style={{
				flex: 1,
				marginTop: StatusBar.currentHeight,
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<Image
				source={require("../../assets/images/icon.png")}
				style={{ width: 200, height: 200 }}
			/>
		</View>
	);
};
