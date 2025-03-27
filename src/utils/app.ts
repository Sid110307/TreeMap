import React from "react";

import * as Font from "expo-font";

export const useOnStartup = () => {
	const [loading, setLoading] = React.useState(true);

	const onStartup = async () => {
		await Font.loadAsync({
			Bold: require("./Outfit-Bold.ttf"),
			Light: require("./Outfit-Light.ttf"),
			Medium: require("./Outfit-Medium.ttf"),
			Regular: require("./Outfit-Regular.ttf"),
			PlayFairBlackItalic: require("./PlayfairDisplay-BlackItalic.ttf"),
			Caption: require("./IBMPlexMono-Regular.ttf"),
		});
		setLoading(false);
	};

	return { loading, onStartup };
};
