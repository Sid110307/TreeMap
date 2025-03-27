import React from "react";

import { SplashScreen } from "expo-router";

import { onStartup } from "../utils";

SplashScreen.preventAutoHideAsync();

export default () => {
	React.useEffect(() => {
		onStartup()
			.then(() => SplashScreen.hideAsync())
			.catch(console.error);
	}, []);

	return null;
};
