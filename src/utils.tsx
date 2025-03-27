import React from "react";
import { Dimensions, PixelRatio, Pressable } from "react-native";
import { BaseToast, ToastConfig } from "react-native-toast-message";

import {
	BottomSheetProps,
	BottomSheetView,
	default as NativeBottomSheet,
} from "@gorhom/bottom-sheet";
import * as Font from "expo-font";
import { useRouter } from "expo-router";

import colors from "../assets/colors";

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

export const onStartup = async () => {
	await Font.loadAsync({
		Bold: require("../assets/fonts/Outfit-Bold.ttf"),
		Light: require("../assets/fonts/Outfit-Light.ttf"),
		Medium: require("../assets/fonts/Outfit-Medium.ttf"),
		Regular: require("../assets/fonts/Outfit-Regular.ttf"),
		Title: require("../assets/fonts/PlayfairDisplay-BlackItalic.ttf"),
		Caption: require("../assets/fonts/IBMPlexMono-Regular.ttf"),
	});
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

export const BottomSheet = (props: BottomSheetProps) => {
	const router = useRouter();
	return (
		<NativeBottomSheet
			{...props}
			onClose={router.back}
			enablePanDownToClose
			backdropComponent={_ => (
				<Pressable
					style={{ flex: 1, backgroundColor: "#00000080" }}
					onPress={router.back}
				/>
			)}
		>
			<BottomSheetView style={{ flex: 1, padding: 8, paddingHorizontal: 16, gap: 12 }}>
				{props.children}
			</BottomSheetView>
		</NativeBottomSheet>
	);
};
