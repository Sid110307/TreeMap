import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";

import { Stack } from "expo-router";
import { IconoirProvider } from "iconoir-react-native";

import { toastConfig } from "../utils";

export default () => (
	<GestureHandlerRootView>
		<IconoirProvider iconProps={{ width: 24, height: 24 }}>
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name="(tabs)" />
				<Stack.Screen
					name="sheets/details"
					options={{ presentation: "transparentModal" }}
				/>
				<Stack.Screen name="sheets/camera" options={{ presentation: "transparentModal" }} />
			</Stack>
			<Toast config={toastConfig} />
		</IconoirProvider>
	</GestureHandlerRootView>
);
