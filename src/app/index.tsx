import React from "react";
import { ActivityIndicator, View } from "react-native";

import { useRouter } from "expo-router";

import colors from "../../assets/colors";

import { useOnStartup } from "../utils/app";

export default function Index() {
	const router = useRouter();
	const { loading, onStartup } = useOnStartup();

	React.useEffect(() => {
		onStartup()
			.then(() => console.log("onStartup done"))
			.catch(console.error);
	}, []);

	if (!loading) router.navigate("/input");
	return (
		<View
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<ActivityIndicator size="large" color={colors.primary} />
		</View>
	);
}
