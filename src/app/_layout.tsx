import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";

import { Stack } from "expo-router";
import { IconoirProvider } from "iconoir-react-native";

import { useUserState } from "../core/state";
import { toastConfig } from "../core/utils";

const AppStack = () => (
	<Stack screenOptions={{ headerShown: false }}>
		<Stack.Screen name="(tabs)" />
		<Stack.Screen name="sheets/details" options={{ presentation: "transparentModal" }} />
		<Stack.Screen name="sheets/camera" options={{ presentation: "transparentModal" }} />
	</Stack>
);

const AuthStack = () => (
	<Stack screenOptions={{ headerShown: false }}>
		<Stack.Screen name="auth" />
	</Stack>
);

export default () => {
	const { isLoggedIn } = useUserState();
	return (
		<GestureHandlerRootView>
			<IconoirProvider iconProps={{ width: 24, height: 24 }}>
				{isLoggedIn ? <AppStack /> : <AuthStack />}
				<Toast config={toastConfig} />
			</IconoirProvider>
		</GestureHandlerRootView>
	);
};
