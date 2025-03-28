import React from "react";
import { Image, View } from "react-native";

import * as Location from "expo-location";
import { Redirect, SplashScreen, useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { useGeoState, useUserState } from "../core/state";
import { onStartup } from "../core/utils";

SplashScreen.preventAutoHideAsync();

export default () => {
	const router = useRouter();

	const locationSubscription = React.useRef<Location.LocationSubscription | null>(null);
	const { isLoggedIn } = useUserState();
	const { setLatitude, setLongitude, refetchGeoState } = useGeoState();

	React.useEffect(() => {
		onStartup()
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

	return !isLoggedIn ? (
		<Redirect href="/auth/login" />
	) : (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
			<StatusBar style="light" translucent />
			<Image
				source={require("../../assets/images/icon.png")}
				style={{ width: 200, height: 200 }}
			/>
		</View>
	);
};
