import React from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";

import colors from "../../assets/colors";

import { useOnStartup } from "../utils";

export default function Index() {
	const { loading, onStartup } = useOnStartup();

	React.useEffect(() => {
		onStartup().catch(console.error);
	}, []);

	return (
		<GestureHandlerRootView>
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				{loading && <ActivityIndicator size="large" color={colors.primary} />}
			</View>
			<Toast />
		</GestureHandlerRootView>
	);
}
