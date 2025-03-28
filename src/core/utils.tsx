import React from "react";
import { Dimensions, PixelRatio } from "react-native";
import { BaseToast, ToastConfig } from "react-native-toast-message";

import * as Font from "expo-font";

import colors from "./colors";
import { databaseManager } from "./database";

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

export const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
	const toRad = (deg: number) => (deg * Math.PI) / 180;
	const a =
		Math.sin(toRad(lat2 - lat1) / 2) ** 2 +
		Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(toRad(lng2 - lng1) / 2) ** 2;

	return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const onStartup = async () => {
	await Font.loadAsync({
		Bold: require("../../assets/fonts/Outfit-Bold.ttf"),
		Light: require("../../assets/fonts/Outfit-Light.ttf"),
		Medium: require("../../assets/fonts/Outfit-Medium.ttf"),
		Regular: require("../../assets/fonts/Outfit-Regular.ttf"),
		Title: require("../../assets/fonts/PlayfairDisplay-BlackItalic.ttf"),
		Caption: require("../../assets/fonts/IBMPlexMono-Regular.ttf"),
	});
	await databaseManager.init();
};

export const toastConfig: ToastConfig = {
	success: props => (
		<BaseToast
			{...props}
			style={{
				borderRadius: 64,
				backgroundColor: colors.light[200],
				borderWidth: 2,
				borderColor: colors.primary,
			}}
			contentContainerStyle={{ flexDirection: "column", alignItems: "center" }}
			text1Style={{ color: colors.primary }}
		/>
	),
	error: props => (
		<BaseToast
			{...props}
			style={{
				borderRadius: 64,
				backgroundColor: colors.light[200],
				borderWidth: 2,
				borderColor: colors.error,
			}}
			contentContainerStyle={{ flexDirection: "column", alignItems: "center" }}
			text1Style={{ color: colors.error }}
		/>
	),
	info: props => (
		<BaseToast
			{...props}
			style={{
				borderRadius: 64,
				backgroundColor: colors.light[200],
				borderWidth: 2,
				borderColor: colors.secondary,
			}}
			contentContainerStyle={{ flexDirection: "column", alignItems: "center" }}
			text1Style={{ color: colors.secondary }}
		/>
	),
};
