import React from "react";
import { Image, View } from "react-native";

import { SplashScreen } from "expo-router";

import { onStartup } from "../core/utils";

SplashScreen.preventAutoHideAsync();

export default () => {
	React.useEffect(() => {
		onStartup()
			.then(() => SplashScreen.hideAsync())
			.catch(console.error);
	}, []);

	return (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
			<Image
				source={require("../../assets/images/icon.png")}
				style={{ width: 200, height: 200 }}
			/>
		</View>
	);
};
