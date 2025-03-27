import React from "react";
import { Dimensions, PixelRatio } from "react-native";

import * as Font from "expo-font";

const { width, height } = Dimensions.get("window");

export const widthToDp = (num: string) => {
	const parsed = parseFloat(num);
	if (isNaN(parsed)) return 0;

	return PixelRatio.roundToNearestPixel((width * parsed) / 100);
};

export const heightToDp = (num: string) => {
	const parsed = parseFloat(num);
	if (isNaN(parsed)) return 0;

	return PixelRatio.roundToNearestPixel((height * parsed) / 100);
};

export const useOnStartup = () => {
	const [loading, setLoading] = React.useState(true);

	const onStartup = async () => {
		await Font.loadAsync({
			Bold: require("../assets/fonts/Outfit-Bold.ttf"),
			Light: require("../assets/fonts/Outfit-Light.ttf"),
			Medium: require("../assets/fonts/Outfit-Medium.ttf"),
			Regular: require("../assets/fonts/Outfit-Regular.ttf"),
			Title: require("../assets/fonts/PlayfairDisplay-BlackItalic.ttf"),
			Caption: require("../assets/fonts/IBMPlexMono-Regular.ttf"),
		});
		setLoading(false);
	};

	return { loading, onStartup };
};
